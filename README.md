# RESET — Behavioral Intervention System

> Real-time AI coaching to break compulsive habits through psychological interruption, streak reinforcement, and identity building.

---

## Architecture

```
reset/
├── frontend/          # Next.js 15 App Router
│   ├── app/
│   │   ├── page.tsx          # Home — urge trigger button
│   │   ├── coach/page.tsx    # AI intervention (3 modes)
│   │   └── dashboard/page.tsx # Analytics & streak
│   ├── components/           # Reusable UI system
│   ├── lib/                  # API client + store
│   └── styles/               # Design system tokens
│
├── backend/           # Node.js + Express API
│   └── src/
│       ├── routes/
│       │   ├── coach.ts      # POST /api/coach/intervene
│       │   ├── streak.ts     # POST /api/streak/update
│       │   ├── log.ts        # POST /api/log
│       │   └── user.ts       # GET /api/user/:id
│       └── index.ts
│
├── prisma/
│   └── schema.prisma         # Full DB schema
│
└── ai/
    └── systemPrompt.ts       # RESET Coach AI engine
```

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL database
- Anthropic API key

### 2. Environment Setup

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your DATABASE_URL and ANTHROPIC_API_KEY

# Frontend
cp frontend/.env.local.example frontend/.env.local
# Edit if your backend runs on a different port
```

### 3. Install Dependencies

```bash
npm run install:all
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or use migrations (production)
npm run db:migrate
```

### 5. Start Development

```bash
# Run both frontend and backend simultaneously
npm run dev

# Or separately:
npm run dev:backend   # http://localhost:4000
npm run dev:frontend  # http://localhost:3000
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — single urge trigger button |
| `/coach?mode=URGE&urgency=8` | Crisis intervention mode |
| `/coach?mode=VULNERABILITY&urgency=4` | Emotional redirect mode |
| `/coach?mode=RECOVERY&urgency=2` | Streak reinforcement mode |
| `/dashboard` | Analytics, streak, trigger patterns |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/coach/intervene` | AI intervention with mode detection |
| POST | `/api/streak/update` | Increment or reset streak |
| POST | `/api/log` | Log urge/relapse/success |
| POST | `/api/log/trigger` | Log behavioral trigger pattern |
| GET | `/api/log/:userId` | Get user logs |
| POST | `/api/user` | Create user |
| GET | `/api/user/:id` | Get user profile + analytics |
| GET | `/api/user/:id/analytics` | Get detailed analytics |

---

## Behavioral Modes

| Mode | Trigger | Response Style |
|------|---------|----------------|
| 🔴 URGE | High urgency keywords or score ≥7 | Short, commanding, action-first |
| 🟡 VULNERABILITY | Emotional keywords or score 4-6 | Warm, reframing, redirect actions |
| 🟢 RECOVERY | Stable baseline | Identity reinforcement, calm |

---

## Design System

- **Fonts**: Bebas Neue (headings) + DM Sans (body) + JetBrains Mono (data)
- **Colors**: 5 max — `#0A0A0B` bg, `#F2F2F0` text, `#FF3333` urge, `#F5A623` vulnerability, `#1DB954` recovery
- **Spacing**: 8pt grid exclusively
- **Animation**: Framer Motion, subtle and purposeful

---

## Demo Mode

The app works without a backend — all pages have demo fallbacks with realistic data. API calls gracefully degrade to local state.

---

## Production Notes

- Rate limiting: 100 req/15min general, 10 req/min for coach
- All inputs validated with Zod
- Helmet.js security headers
- CORS configured for frontend URL

---

## Deployment

### Deploy the Backend on Render

1. **Create a Render Account**
   - Go to https://render.com and sign in with GitHub

2. **Add the Backend Service**
   - New → Web Service
   - Connect to the GitHub repo: `RESET-PORN-ADDICTION-HELPER`
   - Set the branch to `main`
   - Build command: `cd backend && npm install && npm run build`
   - Start command: `cd backend && npm start`
   - Set environment to `Node`

3. **Set Backend Environment Variables**
   - `DATABASE_URL` → your database connection string
   - `ANTHROPIC_API_KEY` → your Anthropic API key
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://reset-frontend.vercel.app`
   - `PORT=10000`

4. **Create the Render Database**
   - New → PostgreSQL
   - Name it `reset-db`
   - Copy the generated `DATABASE_URL` into the backend service

5. **Deploy**
   - Render can use `render.yaml` to configure both services
   - Backend will be available at `https://reset-backend.onrender.com`

### Deploy the Frontend on Vercel

1. **Create a Vercel Account**
   - Go to https://vercel.com and sign in with GitHub

2. **Import the Repository**
   - Add new project from GitHub
   - Choose the same repo: `RESET-PORN-ADDICTION-HELPER`
   - Set the Root Directory to `frontend`

3. **Set Frontend Environment Variables**
   - `NEXT_PUBLIC_API_URL=https://reset-backend.onrender.com`

4. **Deploy**
   - Vercel detects Next.js and builds automatically
   - The frontend will use the Render backend URL

### How the Apps Connect

- The frontend reads `NEXT_PUBLIC_API_URL` and sends API requests to the Render backend.
- The backend uses `FRONTEND_URL` for CORS and only accepts requests from the configured frontend origin.

### Quick Verification

- Backend health: `https://reset-backend.onrender.com/api/health`
- Frontend app: visit your Vercel deployment URL

### Notes

- If Render assigns a different backend URL, update `NEXT_PUBLIC_API_URL` in Vercel.
- If your frontend domain differs from `https://reset-frontend.vercel.app`, update `FRONTEND_URL` in Render.
