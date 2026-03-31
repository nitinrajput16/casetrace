# CaseTrace — Civic-tech FIR tracker

This repository contains a prototype for CaseTrace: a web app to track police complaints/FIRs, view timelines, chat with an AI assistant, and generate escalation alerts.

Quick links
- Frontend: [frontend](frontend)
- Backend: [backend](backend)
- Prisma schema: [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
- Seed script: [backend/prisma/seed.js](backend/prisma/seed.js)

Prerequisites
- Node.js 18+ and npm
- Git
- A Postgres database (Supabase is recommended for a free developer DB)
- Firebase project (for OTP) — optional during local dev

Clone
```bash
git clone https://github.com/nitinrajput16/casetrace.git
cd casetrace
```

Backend — local setup
1. Copy the example env and edit secrets (do NOT commit `.env`):

```powershell
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL, GEMINI_API_KEY, FIREBASE_SERVICE_ACCOUNT_JSON (or leave empty for local dev)
```

2. Install dependencies, generate Prisma client, push/migrate schema, and seed:

```powershell
npm install
npx prisma generate
# either push (no migrations) or run migrate for dev
npx prisma db push
node prisma/seed.js
```

3. Start the server (dev):

```powershell
npm run dev
# or: node index.js
```

Backend env vars (key ones)
- `DATABASE_URL` — Postgres connection string
- `GEMINI_API_KEY` — server-side Gemini key (stay secret)
- `GEMINI_ENDPOINT` — optional custom endpoint
- `FIREBASE_SERVICE_ACCOUNT_JSON` — paste JSON string for firebase-admin (or leave blank for local mock)
- `FRONTEND_URL` — frontend origin (e.g., http://localhost:5173)
- `JWT_SECRET` — a strong secret for issued JWTs
- `DISABLE_PDF` — set to `true` to avoid running Puppeteer locally

Frontend — local setup
1. Create a Vite env if needed or rely on runtime proxy. By default the app uses a runtime helper to call `/api`.

```powershell
cd ../frontend
npm install
# Run dev server (Vite proxies /api to backend via vite.config.js during dev)
npm run dev
```

Frontend env vars
- `VITE_API_URL` — optional. If set, frontend will call this base (must include protocol). If empty, it will use relative `/api` so it works with the Vite proxy or with a same-origin backend.

Test locally
- Open: http://localhost:5173
- API example:
```powershell
curl.exe -i http://localhost:4000/api/complaints/FIR-2026-DEL-001
```
- Sample FIRs seeded by default:
  - `FIR-2026-DEL-001` (Active)
  - `FIR-2026-MUM-002` (Neglected)
  - `FIR-2026-BLR-003` (Resolved)

Deploy (recommended: Vercel frontend + Render or Supabase + Render backend)
1. Push the repository to GitHub.
2. Frontend (Vercel):
	- In Vercel, create a new project, point to the `frontend` folder.
	- Add environment variable `VITE_API_URL` → `https://<your-backend-host>` (include protocol). Redeploy.
3. Backend (Render / Render Postgres / Supabase):
	- Create a Web Service from the `backend` folder.
	- Set environment variables (DATABASE_URL, GEMINI_API_KEY, FIREBASE_SERVICE_ACCOUNT_JSON, FRONTEND_URL, JWT_SECRET).
	- Build command: `npm install && npx prisma generate`
	- Start command: `node index.js`

Alternatively use Supabase for Postgres and Render for the API; add scheduled jobs (Render cron) for the escalation scanner.

Share with a friend
- Share the live frontend URL (Vercel) once deployed.
- Or push to GitHub and invite collaborator:
```bash
git remote add origin https://github.com/<YOUR_USERNAME>/casetrace.git
git push -u origin main
# On GitHub: Settings → Manage access → Invite collaborator
```

Security notes
- Never commit `.env` or `FIREBASE_SERVICE_ACCOUNT_JSON` to the repo.
- Keep `GEMINI_API_KEY` server-side only. Frontend must call `/api/chat` which proxies to Gemini.
- Restrict CORS to your frontend domain in `backend/index.js` using `FRONTEND_URL`.

Troubleshooting
- If frontend fetch returns HTML (index.html) instead of JSON, the frontend is calling the wrong origin. Ensure Vite dev proxy is enabled (see `frontend/vite.config.js`) or set `VITE_API_URL` to your backend.
- If Prisma generate fails on Windows with file-lock errors, kill other `node` processes and re-run `npx prisma generate`.

More
- Full build plan and design notes: `/memories/session/building.md`

If you want, I can:
- Push the repo to your GitHub (you'll need to provide the GitHub repo URL or give me permission to create it),
- Deploy backend to Render and set `VITE_API_URL` on Vercel and redeploy the frontend.

