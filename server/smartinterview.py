# smartinterview.py
import os
import re
import json
import fitz
import docx
import numpy as np
import faiss
from typing import List, Optional, Tuple
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
from dotenv import load_dotenv

# -----------------------------
# Environment Setup
# -----------------------------
load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise ValueError("GOOGLE_API_KEY not set in environment")

genai.configure(api_key=API_KEY)
EMBED_MODEL_NAME = "all-MiniLM-L6-v2"
_embed_model = SentenceTransformer(EMBED_MODEL_NAME)


# -----------------------------
# Document Utilities
# -----------------------------
def read_pdf(path: str) -> str:
    """Reads a PDF file and returns its text."""
    doc = fitz.open(path)
    return "\n".join([p.get_text() for p in doc])

def read_docx(path: str) -> str:
    """Reads a DOCX file and returns its text."""
    d = docx.Document(path)
    return "\n".join([p.text for p in d.paragraphs])

def read_txt(path: str) -> str:
    """Reads a plain text file and returns its content."""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def read_document_file(path: str) -> str:
    """Reads any supported document type and returns text."""
    ext = os.path.splitext(path)[1].lower()
    if ext == ".pdf": return read_pdf(path)
    if ext == ".docx": return read_docx(path)
    if ext == ".txt": return read_txt(path)
    raise ValueError(f"Unsupported file type: {ext}")


# -----------------------------
# Text Chunking and Embeddings
# -----------------------------
def chunk_text(text: str, chunk_size: int = 300, overlap: int = 50) -> List[str]:
    """Splits text into overlapping chunks for semantic embedding."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        j = min(i + chunk_size, len(words))
        chunk = " ".join(words[i:j]).strip()
        if chunk:
            chunks.append(chunk)
        i += chunk_size - overlap
    return chunks

def get_embeddings(texts: List[str]) -> np.ndarray:
    """Generates embeddings for a list of texts."""
    arr = _embed_model.encode(texts, show_progress_bar=False)
    if isinstance(arr, list):
        arr = np.array(arr)
    return np.asarray(arr).astype("float32")

def build_faiss_index(chunks: List[str]) -> Tuple[faiss.IndexFlatL2, List[str]]:
    """Builds a FAISS index from a list of text chunks."""
    embeddings = get_embeddings(chunks)
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)
    return index, chunks


# -----------------------------
# Gemini Helper
# -----------------------------
def gemini_generate(prompt: str) -> str:
    """Uses Google Gemini to generate a text response."""
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        res = model.generate_content(prompt)
        if hasattr(res, "text") and res.text:
            return res.text.strip()
        elif hasattr(res, "candidates") and res.candidates:
            return res.candidates[0].content.strip()
        else:
            return str(res)
    except Exception as e:
        return f"Gemini error: {repr(e)}"


# -----------------------------
# Interview Copilot
# -----------------------------
class InterviewCopilot:
    """
    AI Interview assistant that:
    1. Loads a document and creates embeddings
    2. Generates interview questions from context
    3. Evaluates user answers and gives feedback
    """

    def _init_(self):
        self.index: Optional[faiss.IndexFlatL2] = None
        self.chunks: Optional[List[str]] = None
        self.questions: List[str] = []
        self.feedback: List[dict] = []

    # -------------------------
    # Load Document
    # -------------------------
    def load_document(self, file_path: str) -> str:
        """Loads and indexes the given document."""
        text = read_document_file(file_path)
        chunks = chunk_text(text, chunk_size=300, overlap=50)
        self.index, self.chunks = build_faiss_index(chunks)
        return f"✅ Document loaded successfully. {len(self.chunks)} chunks indexed."

    # -------------------------
    # Question Generation
    # -------------------------
    def generate_questions(self, num_questions: int = 5, level: str = "medium") -> List[str]:
        """Generates interview questions from document content."""
        if not self.chunks:
            raise ValueError("Please load a document first.")

        context = "\n\n".join(self.chunks[:5])
        prompt = f"""
You are an interview question generator.
Generate exactly {num_questions} {level}-level interview questions based ONLY on the following document context.

Rules:
- No intro text.
- Each line = one valid question ending with a question mark (?).

Document Context:
{context}

Return only the list of questions, one per line.
"""
        result = gemini_generate(prompt)

        # Clean up questions
        raw_lines = [line.strip(" -0123456789.)") for line in result.split("\n") if line.strip()]
        question_keywords = ("what", "why", "how", "when", "where", "name", "explain", "describe", "list", "define", "which", "who")
        clean_qs = [line for line in raw_lines if line.endswith("?") or line.lower().startswith(question_keywords)]

        self.questions = clean_qs[:num_questions]
        return self.questions

    # -------------------------
    # Answer Evaluation
    # -------------------------
    def evaluate_answers(self, user_answers: List[str]) -> Tuple[float, List[dict]]:
        """Evaluates answers using Gemini and returns average score + detailed feedback."""
        if not self.questions:
            raise ValueError("No questions have been generated.")
        if len(user_answers) != len(self.questions):
            raise ValueError("Number of answers must match number of questions.")

        total_score = 0
        feedback_list = []

        for q, a in zip(self.questions, user_answers):
            context = "\n\n".join(self.chunks[:5])
            prompt = f"""
You are an interviewer evaluating a candidate's response.

Question: {q}
Candidate Answer: {a}

Using the context below:
{context}

Evaluate the answer and give:
- Score out of 10
- Short feedback (2-3 sentences)
Return JSON:
{{"score": <score>, "feedback": "<feedback>"}}
"""
            eval_text = gemini_generate(prompt)

            try:
                data = json.loads(re.search(r'\{.*\}', eval_text, re.S).group())
            except Exception:
                data = {"score": 0, "feedback": "⚠ Could not parse Gemini response."}

            feedback_list.append({
                "question": q,
                "user_answer": a,
                "score": data.get("score", 0),
                "feedback": data.get("feedback", "")
            })
            total_score += data.get("score", 0)

        avg_score = round(total_score / len(self.questions), 2)
        self.feedback = feedback_list
        return avg_score, feedback_list

    # -------------------------
    # Cache Management
    # -------------------------
    def clear_cache(self):
        """Resets loaded data."""
        self.index = None
        self.chunks = None
        self.questions = []
        self.feedback = []
        return "🧹 Interview session cleared."


# -----------------------------
# ✅ Example usage (for backend)
# -----------------------------
# from smartinterview import InterviewCopilot
# bot = InterviewCopilot()
# bot.load_document("resume.pdf")
# qs = bot.generate_questions(num_questions=5, level="easy")
# avg, feedback = bot.evaluate_answers(["answer1", "answer2", ...])