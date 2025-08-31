# VulnScanner - Web Application Vulnerability Scanner

## Overview

VulnScanner is a web-based vulnerability scanning application that analyzes websites for common security vulnerabilities including SQL injection, JavaScript injection, and HTTP security issues. The application features a React frontend with a modern dark theme UI and an Express.js backend that performs real-time vulnerability scanning. It provides detailed vulnerability reports with severity classifications, attack vectors, and remediation recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Data Storage**: In-memory storage with plans for PostgreSQL integration via Drizzle ORM
- **API Design**: RESTful endpoints for scan management and vulnerability retrieval
- **Vulnerability Engine**: Custom pattern-matching scanner that analyzes JavaScript code for security issues

### Database Schema
The application uses Drizzle ORM with PostgreSQL schema definitions:
- **Users**: Authentication and user management
- **Scans**: Scan requests with metadata, progress tracking, and configurable scan types
- **Vulnerabilities**: Detailed vulnerability records with severity classification, file locations, and remediation guidance

### Scanning Engine
- **Pattern Recognition**: Regular expression-based vulnerability detection
- **Scan Types**: SQL injection, JavaScript injection, and HTTP security analysis
- **Real-time Processing**: Background scanning with progress updates
- **Vulnerability Classification**: Critical, high, medium, and low severity levels with detailed descriptions

### Authentication System
- Session-based authentication with PostgreSQL session storage
- User registration and login functionality
- Protected API endpoints

## External Dependencies

### Core Libraries
- **Database**: Neon Database (PostgreSQL) with Drizzle ORM for data persistence
- **UI Components**: Radix UI primitives with shadcn/ui styling system
- **Form Validation**: Zod schema validation library
- **Date Handling**: date-fns for date manipulation and formatting

### Development Tools
- **Type Safety**: TypeScript for static type checking
- **Code Quality**: ESBuild for production bundling
- **CSS Processing**: PostCSS with Tailwind CSS and Autoprefixer

### Scanning Dependencies
- **DOM Parsing**: JSDOM for HTML analysis and JavaScript extraction
- **HTTP Requests**: Native fetch API for website content retrieval
- **Pattern Matching**: Custom vulnerability detection patterns

### Deployment Infrastructure
- **Development**: Replit-specific tooling and error handling
- **Production**: Node.js runtime with static file serving
- **Environment**: Environment variable configuration for database connections