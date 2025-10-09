// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";
// import { MessageSquare, User, Bot, Send, Upload, FileText, Settings } from "lucide-react";
// import FileUpload from "@/components/file-upload";
// import Navigation from "@/components/navigation";

// interface Message {
//   id: string;
//   type: "user" | "bot";
//   content: string;
//   timestamp: Date;
// }

// export default function InterviewCopilot() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputValue, setInputValue] = useState("");
//   const [showUpload, setShowUpload] = useState(false);
//   const [uploadedDoc, setUploadedDoc] = useState<File | null>(null);
//   const [numQuestions, setNumQuestions] = useState<number>(5);
//   const [questionType, setQuestionType] = useState<string>("technical");
//   const [questions, setQuestions] = useState<string[]>([]);
//   const [responses, setResponses] = useState<string[]>([]);
//   const [sessionId, setSessionId] = useState<string | null>(null);
//   const [feedback, setFeedback] = useState<string | null>(null);
//   const [avgScore, setAvgScore] = useState<number | null>(null);
//   const [userEmail, setUserEmail] = useState<string>("User");

//   // Map frontend question types to backend levels
//   const typeToLevelMap: Record<string, string> = {
//     technical: "medium",
//     mcq: "easy",
//     hr: "easy",
//     theory: "hard",
//   };

//   // ✅ Load user info and JWT token from localStorage
//   const token = localStorage.getItem("token");
//   useEffect(() => {
//     const email = localStorage.getItem("userEmail");
//     if (email) setUserEmail(email);
//   }, []);

//   const handleFileUpload = (file: File) => {
//     setUploadedDoc(file);
//     setShowUpload(false);
//   };

//   // Start interview
//   const startInterview = async () => {
//     if (!uploadedDoc) {
//       alert("Please upload a document.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", uploadedDoc);
//     formData.append("num_questions", numQuestions.toString());
//     formData.append("level", typeToLevelMap[questionType] || "medium");

//     try {
//       const response = await fetch("http://127.0.0.1:8000/api/interview/start", {
//         method: "POST",
//         body: formData,
//         headers: {
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Error ${response.status}: ${errorText}`);
//       }

//       const data = await response.json();

//       if (!data.questions || data.questions.length === 0) {
//         throw new Error("No questions generated");
//       }

//       setQuestions(data.questions);
//       setResponses(new Array(data.questions.length).fill(""));
//       setSessionId(data.session_id);

//       // Display questions as bot messages
//       const botMessage: Message = {
//         id: Date.now().toString(),
//         type: "bot",
//         content: data.questions.map((q: string, idx: number) => `${idx + 1}. ${q}`).join("\n\n"),
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, botMessage]);
//     } catch (error: any) {
//       console.error("Error starting interview:", error);
//       alert(error?.message || "Failed to start interview");
//     }
//   };

//   // Update answer for a question
//   const updateAnswer = (index: number, value: string) => {
//     const updated = [...responses];
//     updated[index] = value;
//     setResponses(updated);
//   };

//   // Submit all answers
//   const submitAnswers = async () => {
//     if (!sessionId) return;

//     try {
//       const response = await fetch(`http://127.0.0.1:8000/api/interview/${sessionId}/submit`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         body: JSON.stringify({ responses }),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Error ${response.status}: ${errorText}`);
//       }

//       const data = await response.json();
//       setFeedback(data.feedback);
//       setAvgScore(data.avg_score);

//       const botMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         type: "bot",
//         content: `✅ Interview Completed!\nAverage Score: ${data.avg_score}\n\nFeedback:\n${data.feedback}`,
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, botMessage]);
//     } catch (error: any) {
//       console.error("Error submitting answers:", error);
//       alert(error?.message || "Failed to submit answers");
//     }
//   };

//   return (
//     <>
//       <Navigation onAuthModal={() => {}} isAuthenticated={true} userEmail={userEmail} />
//       <div className="flex h-screen bg-primary-bg pt-16">
//         {/* Sidebar */}
//         <div className="w-80 bg-card-bg border-r border-border-color flex flex-col">
//           <div className="p-4 border-b border-border-color">
//             <Button
//               onClick={() => setShowUpload(!showUpload)}
//               className="w-full bg-primary-blue hover:bg-blue-600 mb-3"
//             >
//               <Upload className="h-4 w-4 mr-2" />
//               Upload Document
//             </Button>
//           </div>

//           {showUpload && (
//             <div className="p-4 border-b border-border-color">
//               <FileUpload
//                 onFileSelect={handleFileUpload}
//                 acceptedTypes=".pdf,.docx,.txt"
//                 maxSize={10}
//                 className="min-h-[100px]"
//               />
//             </div>
//           )}

//           <div className="p-4 border-b border-border-color">
//             <h3 className="text-sm font-medium mb-3 flex items-center">
//               <Settings className="h-4 w-4 mr-2" /> Question Settings
//             </h3>
//             <div className="space-y-3">
//               <div>
//                 <label className="text-xs text-text-secondary">Number of Questions</label>
//                 <Input
//                   type="number"
//                   min={1}
//                   max={50}
//                   value={numQuestions}
//                   onChange={(e) => setNumQuestions(Number(e.target.value))}
//                 />
//               </div>
//               <div>
//                 <label className="text-xs text-text-secondary">Question Type</label>
//                 <Select onValueChange={setQuestionType} value={questionType}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="technical">Technical</SelectItem>
//                     <SelectItem value="mcq">MCQ</SelectItem>
//                     <SelectItem value="hr">HR</SelectItem>
//                     <SelectItem value="theory">Theory</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </div>

//           <div className="p-4">
//             {!sessionId ? (
//               <Button onClick={startInterview} className="w-full bg-primary-blue hover:bg-blue-600">
//                 Start Interview
//               </Button>
//             ) : (
//               <Button onClick={submitAnswers} className="w-full bg-green-600 hover:bg-green-700">
//                 Submit Answers
//               </Button>
//             )}
//           </div>
//         </div>

//         {/* Chat Section */}
//         <div className="flex-1 flex flex-col">
//           <div className="border-b border-border-color p-4 flex items-center justify-between">
//             <MessageSquare className="text-primary-blue h-6 w-6 mr-3" />
//             <h2 className="font-semibold">Interview Copilot</h2>
//             <span className="text-sm text-text-secondary">Logged in as {userEmail}</span>
//           </div>

//           <div className="flex-1 p-6 overflow-y-auto">
//             {messages.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary">
//                 <FileText className="h-12 w-12 mb-3 text-primary-blue" />
//                 <p>Upload a document and I’ll generate interview questions for you.</p>
//               </div>
//             ) : (
//               <div className="max-w-3xl mx-auto space-y-6">
//                 {messages.map((message) => (
//                   <div key={message.id} className="flex items-start space-x-4">
//                     <div
//                       className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                         message.type === "user" ? "bg-primary-blue" : "bg-card-bg border border-border-color"
//                       }`}
//                     >
//                       {message.type === "user" ? (
//                         <User className="text-white h-4 w-4" />
//                       ) : (
//                         <Bot className="text-primary-blue h-4 w-4" />
//                       )}
//                     </div>
//                     <div
//                       className={`flex-1 ${
//                         message.type === "user" ? "bg-primary-blue/10 p-4 rounded-lg" : "bg-transparent"
//                       }`}
//                     >
//                       <p className="whitespace-pre-wrap">{message.content}</p>
//                       <div className="text-xs text-text-secondary mt-2">
//                         {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {feedback && (
//             <div className="p-4 border-t border-border-color bg-green-50">
//               <h3 className="font-medium mb-2">Interview Feedback</h3>
//               <p><strong>Score:</strong> {avgScore}</p>
//               <p>{feedback}</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, User, Bot, Send, Upload, FileText, Settings } from "lucide-react";
import FileUpload from "@/components/file-upload";
import Navigation from "@/components/navigation";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

export default function InterviewCopilot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [questionType, setQuestionType] = useState<string>("technical");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [avgScore, setAvgScore] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string>("User");

  // Map frontend question types to backend levels
  const typeToLevelMap: Record<string, string> = {
    technical: "medium",
    mcq: "easy",
    hr: "easy",
    theory: "hard",
  };

  // ✅ Load user info and JWT token from localStorage
  const token = localStorage.getItem("token");
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) setUserEmail(email);
  }, []);

  const handleFileUpload = (file: File) => {
    setUploadedDoc(file);
    setShowUpload(false);
  };

  // Start interview
  const startInterview = async () => {
    if (!uploadedDoc) {
      alert("Please upload a document.");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadedDoc);
    formData.append("num_questions", numQuestions.toString());
    formData.append("level", typeToLevelMap[questionType] || "medium");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/interview/start", {
        method: "POST",
        body: formData,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions generated");
      }

      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(""));
      setSessionId(data.session_id);

      // Display questions as bot messages
      const botMessage: Message = {
        id: Date.now().toString(),
        type: "bot",
        content: data.questions.map((q: string, idx: number) => `${idx + 1}. ${q}`).join("\n\n"),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Error starting interview:", error);
      alert(error?.message || "Failed to start interview");
    }
  };

  // Update answer for a question
  const updateAnswer = (index: number, value: string) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  // Submit all answers
  const submitAnswers = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/interview/${sessionId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ answers }), // ✅ backend expects 'answers'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setFeedback(data.feedback);
      setAvgScore(data.avg_score);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: `✅ Interview Completed!\nAverage Score: ${data.avg_score}\n\nFeedback:\n${data.feedback}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Error submitting answers:", error);
      alert(error?.message || "Failed to submit answers");
    }
  };

  return (
    <>
      <Navigation onAuthModal={() => {}} isAuthenticated={true} userEmail={userEmail} />
      <div className="flex h-screen bg-primary-bg pt-16">
        {/* Sidebar */}
        <div className="w-80 bg-card-bg border-r border-border-color flex flex-col">
          <div className="p-4 border-b border-border-color">
            <Button
              onClick={() => setShowUpload(!showUpload)}
              className="w-full bg-primary-blue hover:bg-blue-600 mb-3"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>

          {showUpload && (
            <div className="p-4 border-b border-border-color">
              <FileUpload
                onFileSelect={handleFileUpload}
                acceptedTypes=".pdf,.docx,.txt"
                maxSize={10}
                className="min-h-[100px]"
              />
            </div>
          )}

          <div className="p-4 border-b border-border-color">
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Settings className="h-4 w-4 mr-2" /> Question Settings
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-text-secondary">Number of Questions</label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary">Question Type</label>
                <Select onValueChange={setQuestionType} value={questionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="mcq">MCQ</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="theory">Theory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="p-4">
            {!sessionId ? (
              <Button onClick={startInterview} className="w-full bg-primary-blue hover:bg-blue-600">
                Start Interview
              </Button>
            ) : (
              <Button onClick={submitAnswers} className="w-full bg-green-600 hover:bg-green-700">
                Submit Answers
              </Button>
            )}
          </div>
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          <div className="border-b border-border-color p-4 flex items-center justify-between">
            <MessageSquare className="text-primary-blue h-6 w-6 mr-3" />
            <h2 className="font-semibold">Interview Copilot</h2>
            <span className="text-sm text-text-secondary">Logged in as {userEmail}</span>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary">
                <FileText className="h-12 w-12 mb-3 text-primary-blue" />
                <p>Upload a document and I’ll generate interview questions for you.</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message, i) => (
                  <div key={message.id} className="flex items-start space-x-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === "user" ? "bg-primary-blue" : "bg-card-bg border border-border-color"
                      }`}
                    >
                      {message.type === "user" ? (
                        <User className="text-white h-4 w-4" />
                      ) : (
                        <Bot className="text-primary-blue h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`flex-1 ${
                        message.type === "user" ? "bg-primary-blue/10 p-4 rounded-lg" : "bg-transparent"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div className="text-xs text-text-secondary mt-2">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Inline answer inputs */}
                {questions.map((q, idx) => (
                  <div key={idx} className="mt-4">
                    <p className="font-medium">{idx + 1}. {q}</p>
                    <Input
                      value={answers[idx] || ""}
                      onChange={(e) => updateAnswer(idx, e.target.value)}
                      placeholder="Type your answer here..."
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {feedback && (
            <div className="p-4 border-t border-border-color bg-green-50">
              <h3 className="font-medium mb-2">Interview Feedback</h3>
              <p><strong>Score:</strong> {avgScore}</p>
              <p>{feedback}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
