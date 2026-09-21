# AISCU local RAG backend

This service runs on this Windows computer and keeps the Gemini key, application data, and (by default) ChromaDB local. It also serves the built frontend from `../dist`, so the complete local site is available at `http://127.0.0.1:3001`.

## One-time setup

1. Start Docker Desktop, then start local ChromaDB from the repository root:

   ```powershell
   docker compose -f docker-compose.local.yml up -d
   ```

2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY`.

3. Generate an encryption key and put it in `APPLICATION_ENCRYPTION_KEY`:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

4. Install dependencies and start the server:

   ```powershell
   npm install
   npm start
   ```

5. Check `http://127.0.0.1:3001/api/health`, then open `http://127.0.0.1:3001`.

## Vector store modes

- `VECTOR_STORE=local` (default): connects to the local Docker ChromaDB at `CHROMA_URL`.
- `VECTOR_STORE=cloud`: requires `CHROMA_API_KEY`, `CHROMA_TENANT`, and `CHROMA_DATABASE`.

The API key is intentionally named `GEMINI_API_KEY`, not `VITE_*`; Vite only exposes variables prefixed with `VITE_` to the browser.

## Public site behavior

`public/runtime-config.js` points the deployed static site at `http://127.0.0.1:3001`. That only works in a browser running on this computer. Do not expose this service to the internet until it sits behind HTTPS, authentication, rate limiting, and a managed tunnel or reverse proxy.

For the planned full-cloud architecture and cutover sequence, see [`docs/cloud-migration-plan.md`](../docs/cloud-migration-plan.md).
