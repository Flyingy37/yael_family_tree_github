# Amirnet Practice App for Mika

This is a personalized learning application to help Mika practice for the Amirnet English test. It includes various practice types, a personal word bank, and an AI-powered learning assistant named "Flow".

## Secure Gemini Proxy & Local Dev

This app proxies Google Generative AI requests via a tiny Node server to avoid exposing secrets in the client.

- **Set your environment:** In your terminal, run `export GEMINI_API_KEY="<your_key>"`
- **Run the proxy:** `npm run server` (defaults to http://localhost:8787)
- The development server will automatically proxy requests from `/v1/*` to this server.

### Scripts
- `npm run dev` – Starts the Vite development server for the frontend application.
- `npm run server` – Starts the Gemini proxy server (requires the GEMINI_API_KEY environment variable to be set).
- `npm run typecheck` – Runs the TypeScript compiler to check for type errors without generating JavaScript files.
- `npm run build` – Creates a production-ready build of the application.

### Production Note
Do not embed API keys in the client. Always use server-side calls or a secure token exchange mechanism. The included proxy is a minimal example; for a real production environment, you should harden CORS policies and add authentication.
