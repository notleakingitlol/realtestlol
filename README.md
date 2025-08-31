# VulnScanner - JavaScript Vulnerability Scanner

A web application that scans websites and JavaScript files for security vulnerabilities including SQL injection, JavaScript injection, and HTTP security issues.

## Features

- **Website Scanning**: Analyze any website for security vulnerabilities
- **File Upload**: Upload JavaScript/TypeScript files directly for analysis
- **Real-time Progress**: Watch scans progress in real-time
- **Detailed Reports**: Get comprehensive vulnerability reports with severity levels
- **Auto-download**: Automatically download scan results when complete
- **Pagination**: View results in manageable pages to prevent browser crashes

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Download and extract the project files
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to: `http://localhost:5000`

### Production Build

To build for production:

```bash
npm run build
npm start
```

The application will be available at `http://localhost:5000`

## Usage

### Scanning Websites
1. Click on the "Scan Website" tab
2. Enter a website URL (e.g., `https://example.com`)
3. Click "Start Website Scan"
4. Watch the progress and results will auto-download when complete

### Analyzing Files
1. Click on the "Upload File" tab
2. Select a JavaScript or TypeScript file (.js, .jsx, .ts, .tsx)
3. Click "Analyze File"
4. View the vulnerability report

## Vulnerability Types Detected

- **SQL Injection**: Direct string concatenation in queries, template literals with user input
- **JavaScript Injection**: innerHTML usage, eval() calls, Function constructor abuse
- **HTTP Security**: CORS misconfigurations, insecure credential handling
- **Information Disclosure**: Console logging of sensitive data, hardcoded API keys

## Technical Details

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Build Tool**: Vite
- **Styling**: shadcn/ui components
- **Storage**: In-memory (for development)

## File Structure

```
├── client/          # Frontend React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   └── lib/         # Utilities
├── server/          # Backend Express application
│   ├── services/    # Business logic
│   └── routes.ts    # API endpoints
├── shared/          # Shared types and schemas
└── package.json     # Dependencies and scripts
```

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run check` - Type check TypeScript files