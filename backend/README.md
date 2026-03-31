# CaseTrace — Backend

Run locally:

1. Install dependencies

```bash
cd backend
npm install
```

2. Create `.env` from `.env.example` and set `DATABASE_URL`.

3. Generate Prisma client and run migrations / seed:

```bash
npx prisma generate
npm run prisma:migrate
npm run prisma:seed
```

4. Start dev server:

```bash
npm run dev
```
