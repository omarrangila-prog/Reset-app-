# RESET Deployment Guide

## Quick Start Deployment to Render & Vercel

### Step 1: Deploy Backend to Render

1. **Create a Render Account** (if you don't have one):
   - Go to https://render.com
   - Sign up with GitHub account

2. **Create a New Web Service**:
   - Click "New +" → "Web Service"
   - Select your GitHub repository: `RESET-PORN-ADDICTION-HELPER`
   - Click "Connect"

3. **Configure the Service**:
   - **Name**: `reset-backend`
   - **Environment**: `Node`
   - **Region**: Choose the closest region
   - **Branch**: `main`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: `Starter` or `Free`

4. **Add Environment Variables**:
   - Add these values:
     ```
     DATABASE_URL=postgresql://...       # Render database URL
     ANTHROPIC_API_KEY=sk-ant-...        # Your Anthropic API key
     NODE_ENV=production
     FRONTEND_URL=https://reset-frontend.vercel.app
     PORT=10000
     ```

5. **Create a Database**:
   - In Render dashboard, click "New +" → "PostgreSQL"
   - Name it `reset-db`
   - Copy the generated `DATABASE_URL` into the backend service

6. **Deploy**:
   - Render will build and deploy the backend
   - The backend will be available at `https://reset-backend.onrender.com`

---

### Step 2: Deploy Frontend to Vercel

1. **Create a Vercel Account** (if you don't have one):
   - Go to https://vercel.com
   - Sign up with GitHub account

2. **Import Project**:
   - Click "Add New" → "Project"
   - Select `RESET-PORN-ADDICTION-HELPER`
   - Set the Root Directory to `frontend`

3. **Set Environment Variables**:
   - Add this variable:
     ```
     NEXT_PUBLIC_API_URL=https://reset-backend.onrender.com
     ```

4. **Deploy**:
   - Vercel will build and deploy the frontend
   - Your frontend will use the Render backend URL automatically

---

### Connect Frontend + Backend

- The frontend reads `NEXT_PUBLIC_API_URL` and sends requests to the Render API.
- The backend uses `FRONTEND_URL` for CORS and accepts requests from the configured frontend origin.

If the actual frontend domain differs from `https://reset-frontend.vercel.app`, update `FRONTEND_URL` in Render.
If the backend URL differs from `https://reset-backend.onrender.com`, update `NEXT_PUBLIC_API_URL` in Vercel.

---

### Verify Deployment

1. **Backend health**:
   ```bash
   curl https://reset-backend.onrender.com/api/health
   ```

2. **Frontend**:
   - Visit your Vercel deployment URL
   - Check the browser console for API errors

3. **Logs**:
   - Render: backend logs
   - Vercel: deployment logs

---

### Notes

- If Render assigns a different backend URL, update `NEXT_PUBLIC_API_URL` in Vercel.
- If your frontend domain differs from `https://reset-frontend.vercel.app`, update `FRONTEND_URL` in Render.
- Keep `render.yaml` in the repo so Render can auto-configure deployment.

---

### Environment Variables Reference

**Backend (Render secrets)**:
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://user:password@host:5432/reset_db
ANTHROPIC_API_KEY=sk-ant-xxxxx
FRONTEND_URL=https://reset-frontend.vercel.app
```

**Frontend (Vercel environment)**:
```
NEXT_PUBLIC_API_URL=https://reset-backend.onrender.com
```

---

## All Done! 🚀

Your full-stack app is now set up for Render backend + Vercel frontend.
