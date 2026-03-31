# Building Guide — CaseTrace (Full step-by-step)

TL;DR
- Goal: Build a Vite + React frontend and Node + Express backend with Prisma + PostgreSQL, Gemini AI proxy, Firebase OTP, click-to-chat WhatsApp, and bilingual support (Hindi/English).
- Outcome: Local dev instructions, Prisma schema + seed, backend route blueprints, frontend skeleton, and deployment steps for Render (backend) + Vercel (frontend).

Contents
1. Prerequisites & accounts
2. Repo layout
3. Local setup (scaffold + commands)
4. Backend details (Express, Prisma, routes)
5. Prisma schema + seed script
6. Frontend details (Vite, Tailwind, i18n, components)
7. AI chat proxy (Gemini)
8. OTP auth (Firebase)
9. Escalation flow & PDF generation
10. WhatsApp integration (click-to-chat)
11. Deployment (Render + Vercel + Supabase)
12. Security & production checklist
13. Verification checklist
14. Estimated timeline & next steps

---

## 1) Prerequisites & accounts
- Local: Node.js 18+ (LTS recommended), npm (or pnpm/yarn), Git.
- Accounts & services required:
  - Firebase project (enable Phone Auth). Save service account JSON for backend verification.
  - Google Cloud project with Generative AI API enabled (Gemini access). Keep the API key / service account ready.
  - Supabase (recommended free Postgres) or managed Postgres (Render DB).
  - Vercel account (frontend hosting) and Render account (backend hosting). Both connected to your GitHub.
- Optional tools: Docker (for local Postgres), Postman, ngrok (for local webhook testing).

## 2) Repo layout
Root: `casetrace/`
- `frontend/` — Vite + React + Tailwind
  - `src/pages/` (Home, Dashboard, Escalation, Rights)
  - `src/components/` (ChatWidget, Timeline, OfficerCard, SearchBar)
  - `src/i18n/` (en.json, hi.json)
- `backend/` — Node + Express
  - `routes/` (complaints.js, auth.js, chat.js, escalate.js)
  - `controllers/` (complaintsController.js, authController.js...)
  - `prisma/` (`schema.prisma`, `seed.js`)
  - `.env` (local; never commit)
- `README.md`

## 3) Local setup — scaffold and run (commands)
Run in a terminal (PowerShell or bash). Replace paths where needed.

Scaffold repo and folders:
```bash
# from your workspace root
cd "C:\Users\singh\OneDrive\Desktop\byai"
mkdir casetrace && cd casetrace
git init
mkdir frontend backend
```

Frontend (Vite + React + Tailwind):
```bash
# scaffold Vite React
npm create vite@latest frontend -- --template react
cd frontend
npm install
# tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
# other deps
npm install react-router-dom axios react-i18next i18next
```
Update `tailwind.config.js` content to include `./index.html` and `./src/**/*.{js,jsx}`.

Backend (Express + Prisma):
```bash
cd ../backend
npm init -y
npm install express cors dotenv @prisma/client axios firebase-admin helmet express-rate-limit puppeteer
npm install -D prisma nodemon
npx prisma init
```
- Set `DATABASE_URL` in `backend/.env` (local). For development you can use a local Postgres connection or a Supabase connection string.

Helpful NPM scripts (add to `backend/package.json`):
```json
"scripts":{
  "dev":"nodemon index.js",
  "start":"node index.js",
  "prisma:migrate":"npx prisma migrate dev --name init",
  "prisma:seed":"node prisma/seed.js"
}
```

Run both services in separate terminals:
```bash
# terminal 1
cd casetrace/backend && npm run dev
# terminal 2
cd casetrace/frontend && npm run dev
```

## 4) Backend blueprint (high level)
Files to create:
- `backend/index.js` — express bootstrap + middleware
- `backend/routes/*.js` — API routes
- `backend/controllers/*.js` — controller functions
- `backend/prisma/schema.prisma` — data model
- `backend/prisma/seed.js` — seed script
- `backend/.env` — store secrets: `DATABASE_URL`, `GEMINI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT` (base64 or JSON path), `FRONTEND_URL`, `JWT_SECRET`

Key middleware and patterns:
- `cors` configured to `origin: process.env.FRONTEND_URL` and allow credentials if needed.
- `helmet` for basic security headers.
- `express-rate-limit` on `POST /api/chat` and auth endpoints.
- Use `firebase-admin` to verify Firebase ID tokens for phone auth flow.
- Use `@prisma/client` as DB access layer.

Minimal `index.js` sketch:
```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/escalate', require('./routes/escalate'));
app.use('/api/auth', require('./routes/auth'));

app.get('/ping', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Server listening on', port));
```

## 5) Prisma schema (complete)
Place in `backend/prisma/schema.prisma` (Postgres datasource via `DATABASE_URL`).
```prisma
generator client { provider = "prisma-client-js" }

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ComplaintStatus {
  OPEN
  ACTIVE
  NEGLECTED
  RESOLVED
  CLOSED
}

model User {
  id        String    @id @default(uuid())
  phone     String    @unique
  name      String?
  createdAt DateTime  @default(now())
  complaints Complaint[]
}

model Complaint {
  id              String          @id @default(uuid())
  complaintId     String          @unique
  user            User?           @relation(fields: [userId], references: [id])
  userId          String?
  title           String
  description     String?
  status          ComplaintStatus @default(OPEN)
  assignedOfficer String?
  officerPhone    String?
  policeStation   String?
  district        String?
  filedAt         DateTime
  lastUpdateAt    DateTime
  updates         CaseUpdate[]
  escalations     EscalationAlert[]
}

model CaseUpdate {
  id          String   @id @default(uuid())
  complaint   Complaint @relation(fields: [complaintId], references: [id])
  complaintId String
  updateText  String
  updatedBy   String?
  createdAt   DateTime @default(now())
}

model EscalationAlert {
  id          String   @id @default(uuid())
  complaint   Complaint @relation(fields: [complaintId], references: [id])
  complaintId String
  reason      String
  isResolved  Boolean  @default(false)
  createdAt   DateTime @default(now())
  notifiedTo  String?
}
```

After creating the schema run (in `backend`):
```bash
npx prisma generate
npx prisma migrate dev --name init
```

## 6) Seed script (create 3 sample complaints)
Create `backend/prisma/seed.js`:
```js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { phone: '+911234567890' },
    update: {},
    create: { phone: '+911234567890', name: 'Test User' }
  });

  const now = new Date();

  // DEL - Active (last update 5 days ago)
  await prisma.complaint.create({
    data: {
      complaintId: 'FIR-2026-DEL-001',
      userId: user.id,
      title: 'Unauthorized construction noise',
      description: 'Loud construction late night',
      status: 'ACTIVE',
      assignedOfficer: 'Inspector Raj',
      officerPhone: '+911112223334',
      policeStation: 'Delhi Central',
      district: 'Delhi',
      filedAt: new Date(now.getTime() - 15*24*60*60*1000),
      lastUpdateAt: new Date(now.getTime() - 5*24*60*60*1000),
      updates: {
        create: [
          { updateText: 'FIR registered', updatedBy: 'Citizen', createdAt: new Date(now.getTime() - 15*24*60*60*1000) },
          { updateText: 'IO assigned', updatedBy: 'Police', createdAt: new Date(now.getTime() - 5*24*60*60*1000) }
        ]
      }
    }
  });

  // MUM - Neglected (last update 45 days ago)
  await prisma.complaint.create({
    data: {
      complaintId: 'FIR-2026-MUM-002',
      userId: user.id,
      title: 'Vehicle theft',
      description: 'Stolen two-wheeler',
      status: 'NEGLECTED',
      assignedOfficer: 'Inspector Mehta',
      officerPhone: '+919998887776',
      policeStation: 'Mumbai West',
      district: 'Mumbai',
      filedAt: new Date(now.getTime() - 80*24*60*60*1000),
      lastUpdateAt: new Date(now.getTime() - 45*24*60*60*1000),
      updates: { create: [{ updateText: 'FIR registered', updatedBy: 'Citizen', createdAt: new Date(now.getTime() - 80*24*60*60*1000) }] }
    }
  });

  // BLR - Resolved/Closed
  await prisma.complaint.create({
    data: {
      complaintId: 'FIR-2026-BLR-003',
      userId: user.id,
      title: 'Domestic dispute - resolved',
      description: 'Family dispute resolved',
      status: 'RESOLVED',
      assignedOfficer: 'Inspector Kumar',
      officerPhone: '+919977665544',
      policeStation: 'Bengaluru Central',
      district: 'Bengaluru',
      filedAt: new Date(now.getTime() - 120*24*60*60*1000),
      lastUpdateAt: new Date(now.getTime() - 2*24*60*60*1000),
      updates: { create: [{ updateText: 'Case closed', updatedBy: 'Police', createdAt: new Date(now.getTime() - 2*24*60*60*1000) }] }
    }
  });
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
```

Run the seed:
```bash
node prisma/seed.js
```

## 7) Backend routes & payload contracts
- `GET /api/complaints/:id`
  - Response: complaint object with `updates` sorted by `createdAt`.
- `GET /api/complaints/:id/updates`
  - Response: array of `CaseUpdate` objects.
- `POST /api/chat` — body: `{ message: string, complaintId?: string, lang?: 'en'|'hi' }`
  - Server: optionally fetch complaint context, call Gemini API, return AI reply(s).
- `POST /api/escalate` — body: `{ complaintId: string, reason?: string }`
  - Server: create `EscalationAlert`, generate PDF letter, return `{ ok:true, pdfUrl }` or PDF bytes.
- `POST /api/auth/verify` — body: `{ idToken: string }` (Firebase ID token). Server verifies and returns local JWT for app session.

## 8) AI chat proxy — implementation notes
- Always call Gemini from server-side, keep `GEMINI_API_KEY` or service account secret on server only.
- For small scale, simple HTTP POST with Bearer key is fine. For production, prefer Google Cloud client libs and service account IAM.
- Example sketch (pseudo):
```js
// controllers/chatController.js
const axios = require('axios');
async function chat(req, res) {
  const { message, complaintId } = req.body;
  const complaint = complaintId ? await prisma.complaint.findUnique({ where: { complaintId }, include: { updates: true }}) : null;
  const system = complaint ? `Context: ${complaint.title} ${complaint.description}` : '';
  const prompt = `${system}\nUser: ${message}`;

  // NOTE: verify exact Gemini request format from Google docs; this is a placeholder
  const response = await axios.post(process.env.GEMINI_ENDPOINT || 'https://generative.googleapis.com/v1beta2/models/gemini-2.0-flash:generate', {
    prompt: prompt,
    maxOutputTokens: 512
  }, { headers: { Authorization: `Bearer ${process.env.GEMINI_API_KEY}` } });

  res.json(response.data);
}
```
- If Gemini offers streaming, consider using SSE or WebSockets for UX improvements.

## 9) OTP auth (Firebase) — flow
1. Frontend uses Firebase Web SDK to send OTP to phone and verify via reCAPTCHA. On success the client receives an `idToken`.
2. Frontend sends `idToken` to backend `POST /api/auth/verify`.
3. Backend uses `firebase-admin` to `verifyIdToken(idToken)`. If valid, find-or-create `User` in DB and return a short-lived JWT for app APIs.

Backend example (verify route):
```js
// routes/auth.js
const admin = require('firebase-admin');
const express = require('express');
const router = express.Router();

// initialize firebase-admin with service account JSON loaded from env
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

router.post('/verify', async (req, res) => {
  const { idToken } = req.body;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    // decoded contains phone_number, uid, etc.
    // upsert user in DB and issue JWT
    // ...
    res.json({ ok: true, token: 'LOCAL_JWT_HERE' });
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
```

## 10) Escalation flow & PDF generation
- Create `POST /api/escalate` to record `EscalationAlert` and optionally generate a formal letter PDF addressed to the SP/DCP.
- Implementation choices:
  - Generate HTML template and use `puppeteer` to convert to A4 PDF.
  - Or use `pdfkit` to build PDF programmatically.
- Example using `puppeteer`:
```js
const puppeteer = require('puppeteer');
async function generatePdf(html) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();
  return pdf;
}
```
- The endpoint can return the PDF as `application/pdf` so frontend triggers download, or upload to storage and return a link.

## 11) WhatsApp (MVP) — click-to-chat
- For MVP use `https://wa.me/<PHONE_WITH_COUNTRY>` links:
```js
const phone = officerPhone.replace(/\D/g, ''); // remove + or spaces
const message = encodeURIComponent('Dear Sir/Madam, regarding FIR-2026-DEL-001...');
const url = `https://wa.me/${phone}?text=${message}`;
```
- Use these links on `OfficerCard` buttons; they open the user's WhatsApp client.
- Later: integrate WhatsApp Cloud API or Twilio if server-side messaging required.

## 12) Frontend details
- `frontend/.env` (Vite requires `VITE_` prefix):
```
VITE_API_URL=http://localhost:4000/api
```
- Tailwind: add `src/index.css` with `@tailwind` rules and import in `main.jsx`.
- i18n: use `react-i18next`. Create `src/i18n/en.json` and `src/i18n/hi.json` with translations.

Example search call (Dashboard / Home):
```js
async function fetchComplaint(fir) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/complaints/${fir}`);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}
```

Chat widget (simple POST):
```js
async function sendMessage(message, complaintId) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
    method:'POST', headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ message, complaintId })
  });
  return res.json();
}
```

Timeline component: map `complaint.updates` into a vertical stepper using Tailwind classes. Show status badge (color-coded): `ACTIVE`=blue, `NEGLECTED`=orange/red, `RESOLVED`=green.

Escalation page: show escalation ladder:
IO → SHO → DSP → SP → IGP → DGP
Provide buttons to auto-draft letters for each level and a WhatsApp quick-contact link for the officer or SP.

## 13) Deployment (Render backend + Vercel frontend + Supabase DB)
Recommended: use Supabase for the Postgres DB (free tier) then deploy backend on Render and frontend on Vercel.

Supabase:
- Create a project, copy the `DATABASE_URL` (connection string) to Render and local `.env`.
- In Supabase UI, enable DB and check connection limits.

Render (backend):
1. Push repo to GitHub with `backend/` and `frontend/` folders.
2. Create a new Web Service, connect to the repo and set the root directory to `backend`.
3. Build command: `npm install && npx prisma generate` (or use Docker). Start command: `node index.js`.
4. Add environment variables on Render: `DATABASE_URL`, `GEMINI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_JSON`(base64), `FRONTEND_URL` (Vercel URL), `JWT_SECRET`.
5. (Optional) Add a Cron job on Render to run a daily script that checks for neglected cases and creates `EscalationAlert` records.

Vercel (frontend):
1. Create new project and point it to the `frontend` folder.
2. Build command: `npm run build`. Output directory: `dist`.
3. Set env var `VITE_API_URL` to your Render backend URL plus `/api`.
4. Deploy.

DNS & SSL: Automatically managed by Vercel and Render.

## 14) Post-deployment verification
- Load frontend URL; ensure the FIR search works and displays seeded FIRs.
- Use browser network panel to confirm `/api/chat` calls go to your backend and backend replies via Gemini.
- Test OTP login via Firebase on both dev and production (ensure Firebase domains added in console).
- Test escalate flow: call `POST /api/escalate` for `FIR-2026-MUM-002` and download the PDF.
- Test WhatsApp button opens to correct officer number.

## 15) Security & production checklist
- Never commit `.env` or `FIREBASE_SERVICE_ACCOUNT` to Git.
- Restrict CORS to your frontend domain only.
- Rate-limit `POST /api/chat` and `POST /api/auth/*`.
- Use TLS/HTTPS only in production.
- Store service account JSON in Render/Vercel secret storage as encoded string; decode on startup.
- Rotate LLM keys periodically and monitor usage.
- Add logging (structured) and error monitoring (Sentry/Logdrain).

## 16) Monitoring & maintenance
- Monitor LLM billing and set monthly alerts.
- Monitor DB connections and scale Supabase/Render DB as needed.
- Add background worker (e.g., BullMQ + Redis) later for PDF generation and bulk jobs.

## 17) Verification checklist (quick)
- [ ] `backend` runs locally (`npm run dev`) without error
- [ ] `prisma migrate dev` ran and database seeded
- [ ] `GET /api/complaints/FIR-2026-DEL-001` returns the seeded record
- [ ] Frontend fetches complaint and displays timeline
- [ ] `POST /api/chat` returns an AI reply (or mocked response)
- [ ] `POST /api/escalate` creates an escalation and provides a PDF
- [ ] WhatsApp click-to-chat link opens correctly
- [ ] Firebase phone auth works end-to-end

## 18) Estimated timeline (MVP)
- Backend & Prisma models + seed: 6–10 hours
- Basic Express routes + Gemini proxy: 4–6 hours
- Frontend scaffold + Tailwind + search UI: 6–10 hours
- Chat UI + integration w/ backend: 4–6 hours
- Escalation PDF generator + WhatsApp links: 4–6 hours
- Auth (Firebase) + JWT session handling: 3–5 hours
- Deployment & env configuration: 2–4 hours
- Testing & polish: 3–6 hours
Total (MVP): 32–53 hours (approx)

## 19) Next steps & handoff
- If you want I can now:
  - (A) Scaffold the `frontend/` and `backend/` folders and create starter files (no secret values included), or
  - (B) Produce the exact file contents for `backend/prisma/schema.prisma`, `backend/prisma/seed.js`, `backend/index.js`, and frontend `src/i18n` + `src/pages/Home.jsx` so you can copy them in one go.

---

If you'd like, I will now save this as `/memories/session/building.md` (done) and can either generate the starter files next or break tasks into a committed TODO list with Git commits. Which next action do you want?