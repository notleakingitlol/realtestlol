# Deployment Guide

## GitHub Setup

1. Create a new repository on GitHub
2. Initialize git in your project:
```bash
git init
git add .
git commit -m "Initial VulnScanner commit"
git branch -M main
git remote add origin https://github.com/yourusername/vulnscanner.git
git push -u origin main
```

## Netlify Deployment

### Option 1: Automatic GitHub Integration
1. Go to [Netlify](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your GitHub account and select your repository
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist/public`
5. Click "Deploy site"

### Option 2: Manual Deploy
1. Run `npm run build` locally
2. Drag and drop the `dist/public` folder to Netlify
3. Your site is live!

## Environment Variables

The app works with in-memory storage by default. For production with persistent data:

1. In Netlify dashboard → Site Settings → Environment Variables
2. Add: `DATABASE_URL=your_postgresql_connection_string`

## Features Available After Deployment

- ✅ Website vulnerability scanning
- ✅ JavaScript file upload and analysis  
- ✅ Auto-download of scan results
- ✅ Paginated results (10 per page)
- ✅ Real-time scan progress
- ✅ Responsive design

## Notes

- The scanner works entirely client-side for file uploads
- Website scanning uses serverless functions
- No database setup required (uses in-memory storage)
- Supports files up to 10MB