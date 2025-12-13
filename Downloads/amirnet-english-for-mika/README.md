<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Amirnet English Practice for Mika

An interactive English learning application built with React, TypeScript, and Vite, powered by Google's Gemini AI.

View your app in AI Studio: https://ai.studio/apps/drive/1ZN56QGY4UFnsAUft8HKS3KO4UVlrkgm5

## Features

- **Free Chat**: Practice casual English conversation with AI tutor Amirnet
- **Roleplay Scenarios**: Immerse yourself in real-world situations (café ordering, job interviews, doctor appointments)
- **Quick Quizzes**: Test your knowledge on specific topics with instant feedback
- **Daily Word**: Learn a new English word every day

## Run Locally

**Prerequisites:** Node.js


1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```
3. Run the app:
   ```bash
   npm run dev
   ```

## Deploy to Netlify

### Option 1: Deploy via Netlify UI

1. Push your code to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Choose GitHub and select your repository
5. Build settings will be auto-detected from `netlify.toml`
6. Add environment variable:
   - Key: `GEMINI_API_KEY`
   - Value: Your Google Gemini API key
7. Click "Deploy site"

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init

# For subsequent deployments
netlify deploy --prod
```

## Environment Variables

You need to set up your Gemini API key:

### For Local Development:
1. Copy `.env.example` to `.env.local`
2. Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

### For Netlify:
Add the environment variable in Netlify dashboard:
- Site settings → Build & deploy → Environment → Environment variables
- Key: `GEMINI_API_KEY`
- Value: Your Google Gemini API key

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Google Generative AI (Gemini)
- Lucide React (icons)

## License

MIT
