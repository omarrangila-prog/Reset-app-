# Deploying RESET

The app now uses **SQLite on a persistent disk**. That means it must run on a
platform with a real filesystem/volume — **Railway, Render, or Fly.io** — **not
Vercel** (Vercel serverless has no persistent disk, so SQLite data would vanish).

The app root is the `frontend/` folder.

---

## Option A — Railway (easiest, has volumes)

1. Push your code to GitHub (see bottom).
2. Go to **railway.app** → **New Project** → **Deploy from GitHub repo** → pick your repo.
3. In the service **Settings**:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
4. Add a **Volume** (Settings → Volumes): mount path `/data`.
5. Add **Variables** (Settings → Variables):
   ```
   SESSION_SECRET      = <run: openssl rand -base64 48>
   APP_ENCRYPTION_KEY  = <run: openssl rand -base64 32>
   SQLITE_PATH         = /data/reset.db
   GROQ_API_KEY        = <optional, from console.groq.com>
   NODE_ENV            = production
   ```
6. Deploy. Railway gives you a public URL.

> ⚠️ Back up `SESSION_SECRET` and `APP_ENCRYPTION_KEY`. If `APP_ENCRYPTION_KEY`
> ever changes, existing encrypted journal/notes become unreadable.

---

## Option B — Render

1. **render.com** → **New → Web Service** → connect your GitHub repo.
2. **Root Directory:** `frontend` · **Build:** `npm install && npm run build` · **Start:** `npm run start`
3. **Add a Disk** (mount path `/data`, size 1 GB+).
4. Add the same environment variables as above (with `SQLITE_PATH=/data/reset.db`).
5. Create Web Service.

---

## Generate your secrets

```bash
openssl rand -base64 48   # SESSION_SECRET
openssl rand -base64 32   # APP_ENCRYPTION_KEY
```

## Push to GitHub first

```bash
cd "<repo root>"
git add -A
git commit -m "SQLite persistence + deploy config"
git push -u origin main   # username + Personal Access Token
```

## Verify after deploy

- Visit the URL → complete onboarding → check in → **restart the service** →
  reopen: your streak and journal should still be there.
- Health check: `https://<your-app>/api/health`

---

## Why not Vercel?
Vercel functions are stateless with an ephemeral filesystem — a SQLite file
written during one request is gone on the next. To use Vercel you'd switch the
store to a hosted DB (Postgres/Turso/LibSQL). The Prisma+Postgres version exists
in git history if you later want that path.
