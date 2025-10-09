# SmartDocQ - AI Document Q&A Platform

## Overview

SmartDocQ is a modern web application that provides AI-powered document question and answering capabilities. The platform features two main functionalities: Smart Documentation for intelligent document analysis and Interview Copilot for resume-based interview preparation. Built with a full-stack TypeScript architecture, the application uses React for the frontend and Express.js for the backend, with a focus on providing an intuitive, dark-themed user interface optimized for document interaction workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with a custom dark theme featuring primary blues (#4F9FFF) and accent blues (#00D4FF)
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Design System**: Consistent component library with variants for buttons, cards, inputs, and modals

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design with `/api` prefix routing
- **Development Setup**: Hot reloading with Vite in development mode
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Request Logging**: Built-in request/response logging for API endpoints

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database serverless PostgreSQL
- **Schema Management**: Drizzle migrations with generated SQL schema files
- **Development Storage**: In-memory storage implementation for development/testing
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple

### Authentication and Authorization
- **User Model**: Simple username/password authentication system
- **Schema**: User table with unique usernames and hashed passwords
- **Storage Interface**: Abstracted storage layer supporting both in-memory and database implementations
- **Session Handling**: Prepared for session-based authentication

### Component Architecture
- **UI Components**: Modular component system with consistent theming
- **File Upload**: Drag-and-drop file upload component with validation
- **Modal System**: Reusable authentication modals with form validation
- **Navigation**: Fixed navigation header with authentication state management
- **Responsive Design**: Mobile-first responsive design using Tailwind breakpoints

## External Dependencies

### UI and Component Libraries
- **@radix-ui/react-***: Comprehensive suite of accessible UI primitives for dialogs, dropdowns, forms, and navigation
- **@tanstack/react-query**: Server state management and caching
- **class-variance-authority**: Type-safe component variants
- **cmdk**: Command menu component for search interfaces
- **embla-carousel-react**: Touch-friendly carousel component

### Database and ORM
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **drizzle-zod**: Zod schema integration for runtime validation
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon Database
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Development and Build Tools
- **vite**: Fast build tool and development server
- **@vitejs/plugin-react**: React support for Vite
- **typescript**: Static type checking
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-***: Replit-specific development plugins for enhanced debugging

### Form and Validation
- **react-hook-form**: Performant form library with minimal re-renders
- **@hookform/resolvers**: Resolver library for various validation schemas
- **zod**: TypeScript-first schema validation

### Utility Libraries
- **date-fns**: Modern date utility library
- **lucide-react**: Feather-inspired icon library
- **nanoid**: Secure URL-friendly unique ID generator
- **clsx**: Utility for constructing className strings conditionally