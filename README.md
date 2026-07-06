# Amharic AI Assistant

A web-based AI assistant for Amharic speakers. Ask questions in Amharic and receive responses in Ethiopic script (ፊደል).

## Some Images :-

<img width="1366" height="683" alt="Screenshot 2026-07-06 201823" src="https://github.com/user-attachments/assets/c9d89304-e988-4601-9025-f3e40ac90dc8" />


## Stack

- **Frontend:** Next.js, TypeScript, TailwindCSS, Zustand, Better Auth client
- **Backend:** NestJS, Prisma, PostgreSQL, Better Auth, Google Gemini AI
- **Deployment:** Vercel (frontend), Railway (backend + database)

## Project structure

```
Amharic-AI/
├── frontend/   # Next.js app (port 3000)
├── backend/    # NestJS API (port 4000)
└── .env.example
```

## Prerequisites

- Node.js 20+
- PostgreSQL (local install)
- Google Gemini API key (free from [Google AI Studio](https://aistudio.google.com/apikey))

## Setup

### 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE amharic_ai;
```

### 2. Backend

```bash
cd backend
cp ../.env.example .env
# Edit .env with your DATABASE_URL, BETTER_AUTH_SECRET, OPENAI_API_KEY

npm install
npx prisma migrate dev --name init
npm run start:dev
```

Backend runs at `http://localhost:4000`.

**Postman testing:** See [backend/docs/POSTMAN.md](backend/docs/POSTMAN.md) for all endpoints, bodies, and expected responses.

### 3. Frontend

```bash
cd frontend
cp ../.env.example .env.local
# Uses NEXT_PUBLIC_API_URL=http://localhost:4000 by default

npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Environment variables

See [.env.example](.env.example) for all required variables.

| Variable | Where | Description |
|----------|-------|-------------|
| `DATABASE_URL` | backend | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | backend | Random 32+ character secret |
| `BETTER_AUTH_URL` | backend | Backend URL in dev (`http://localhost:4000`) |
| `GEMINI_API_KEY` | backend | Free key from Google AI Studio |
| `AI_PROVIDER` | backend | `gemini` (default) or `openai` |
| `OPENAI_API_KEY` | backend | Only if `AI_PROVIDER=openai` |
| `FRONTEND_URL` | backend | Frontend origin for CORS |
| `NEXT_PUBLIC_API_URL` | frontend | Backend API URL |

## Features

- Register / login / logout (Better Auth)
- Multiple chat conversations with rename and delete
- Amharic AI responses via Google Gemini (free tier)
- Free tier: 20 messages/day
- Premium tier: unlimited (infrastructure ready, payment later)

## Deployment

### Backend (Railway)

1. Create a Railway project with PostgreSQL
2. Deploy the `backend/` directory
3. Set environment variables from `.env.example`
4. Run `npx prisma migrate deploy` on deploy
5. Set start command: `npm run start:prod`

### Frontend (Vercel)

1. Import the `frontend/` directory
2. Set `NEXT_PUBLIC_API_URL` to your Railway backend URL
3. Set `NEXT_PUBLIC_APP_URL` to your Vercel domain
4. Production auth uses a Vercel rewrite proxy (`/api/auth/*` → backend)

### Production auth cookies

For reliable session cookies in production:

- Use custom domains (e.g. `yourdomain.com` + `api.yourdomain.com`)
- Set `BETTER_AUTH_URL` to your **frontend** URL when using the Vercel auth proxy
- Update `trustedOrigins` and `FRONTEND_URL` in backend config

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/users/me` | Current user profile |
| GET | `/api/chats` | List chats |
| POST | `/api/chats` | Create chat |
| PATCH | `/api/chats/:id` | Rename chat |
| DELETE | `/api/chats/:id` | Delete chat |
| GET | `/api/chats/:id/messages` | Chat messages |
| POST | `/api/ai/chat` | Send message, get AI response |

Auth routes are at `/api/auth/*` (Better Auth).
