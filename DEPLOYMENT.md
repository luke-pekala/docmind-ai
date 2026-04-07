# 🚀 DocMind AI — Complete Deployment Guide

From zero to live on the web. Follow these steps exactly.

---

## Prerequisites

Before you start, make sure you have:

- [ ] **Node.js 18+** — download from [nodejs.org](https://nodejs.org)
- [ ] **Git** — download from [git-scm.com](https://git-scm.com)
- [ ] **Anthropic API key** — from [console.anthropic.com](https://console.anthropic.com)
- [ ] **GitHub account** — [github.com](https://github.com)
- [ ] **Railway account** (backend) — [railway.app](https://railway.app) — free tier available
- [ ] **Vercel account** (frontend) — [vercel.com](https://vercel.com) — free tier available

---

## PART 1 — Run Locally (Test First)

### Step 1 — Install dependencies

Open your terminal and run:

```bash
# From the root docmind-ai/ folder
npm run install:all
```

This installs packages for the root, client, and server in one command.

### Step 2 — Add your API key

```bash
# Copy the example env file
cp server/.env.example server/.env
```

Now open `server/.env` in any text editor and replace the placeholder:

```
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-REAL-KEY-HERE
PORT=3001
CLIENT_URL=http://localhost:5173
```

**⚠️ Never commit this file to GitHub. It's already in .gitignore.**

### Step 3 — Start the dev server

```bash
npm run dev
```

This starts both the React frontend (port 5173) and Node backend (port 3001) at the same time.

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Step 4 — Test it works

1. Upload a `.txt` or `.md` file using the sidebar
2. Type a question about its contents
3. You should see a streaming response with a source citation

If it works locally, you're ready to deploy. ✅

---

## PART 2 — Push to GitHub

### Step 5 — Create a new GitHub repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `docmind-ai`
3. Set it to **Public** (required for free Vercel/Railway)
4. **Do NOT** tick "Add README" — you already have one
5. Click **Create repository**

### Step 6 — Push your code

Back in your terminal, from the `docmind-ai/` folder:

```bash
git init
git add .
git commit -m "feat: initial DocMind AI — RAG chatbot with Claude"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/docmind-ai.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

Refresh your GitHub repo page — all your files should be there.

---

## PART 3 — Deploy the Backend (Railway)

The backend holds your secret API key, so it must be deployed separately from the frontend.

### Step 7 — Create a Railway project

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project**
3. Choose **Deploy from GitHub repo**
4. Select your `docmind-ai` repository
5. When asked which folder, select **`server`** (or set the root directory to `/server`)

### Step 8 — Set environment variables on Railway

In your Railway project dashboard:

1. Click on your service → **Variables** tab
2. Add these variables one by one:

| Variable | Value |
|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-your-real-key` |
| `PORT` | `3001` |
| `CLIENT_URL` | `https://your-app.vercel.app` *(add this after Step 12)* |

3. Click **Deploy** — Railway will build and start your server

### Step 9 — Get your backend URL

After deploy succeeds, click **Settings** → **Networking** → **Generate Domain**.

You'll get a URL like: `https://docmind-ai-production.up.railway.app`

**Copy this URL — you'll need it in the next step.**

---

## PART 4 — Deploy the Frontend (Vercel)

### Step 10 — Update the Vercel config with your backend URL

Open `client/vercel.json` and replace the placeholder:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://YOUR-REAL-RAILWAY-URL.railway.app/api/$1" }
  ]
}
```

Commit and push this change:

```bash
git add client/vercel.json
git commit -m "config: add production backend URL"
git push
```

### Step 11 — Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub
2. Click **Import** next to your `docmind-ai` repository
3. In **Configure Project**:
   - Set **Root Directory** to `client`
   - **Framework Preset** should auto-detect as Vite
   - Leave everything else as default
4. Click **Deploy**

Vercel will build your React app and give you a live URL.

### Step 12 — Update the Railway CORS setting

Now that you have your Vercel URL (e.g. `https://docmind-ai.vercel.app`):

1. Go back to Railway → your service → **Variables**
2. Update `CLIENT_URL` to your real Vercel URL
3. Railway will automatically redeploy

---

## PART 5 — Verify Everything Works

### Step 13 — End-to-end test

1. Open your Vercel URL in the browser
2. The status button should show **Connected** (green) — this means the backend is reachable
3. Upload a document file
4. Ask a question
5. You should get a streaming response with citations ✅

### Step 14 — Test the backend health endpoint directly

```
https://your-backend.railway.app/api/health
```

You should see:
```json
{ "status": "ok", "model": "claude-sonnet-4-20250514", "timestamp": "..." }
```

---

## Troubleshooting

### "No API Key" status on the frontend
→ The frontend can't reach the backend. Check that `client/vercel.json` has the correct Railway URL and redeploy Vercel.

### Railway deploy fails
→ Check the build logs in Railway dashboard. Most common cause: missing `ANTHROPIC_API_KEY` environment variable.

### CORS errors in browser console
→ Make sure `CLIENT_URL` in Railway variables exactly matches your Vercel URL (no trailing slash).

### Streaming doesn't work
→ Some proxy services buffer SSE. Railway and Vercel both support SSE natively — if using a different host, check their SSE/streaming support.

---

## Re-deploying After Changes

Every time you push to `main` on GitHub:
- **Vercel** automatically rebuilds the frontend
- **Railway** automatically rebuilds the backend

```bash
# Make a change, then:
git add .
git commit -m "feat: your change description"
git push
```

Both services redeploy within ~2 minutes.

---

## Project URLs (fill these in)

| Service | URL |
|---|---|
| GitHub repo | `https://github.com/YOUR_USERNAME/docmind-ai` |
| Live frontend | `https://docmind-ai.vercel.app` |
| Backend API | `https://docmind-ai-production.railway.app` |
| Health check | `https://docmind-ai-production.railway.app/api/health` |

---

## Portfolio Demo Script

For your portfolio demo recording:

1. Open the live Vercel URL
2. Upload `react-docs.md` (or any large .md file)
3. Ask: *"How do I use useEffect?"*
4. Show the streaming response + citation chip
5. Ask a follow-up: *"What about cleanup functions?"*
6. Show the RAG pipeline panel on the right

**Suggested README badge line:**
```
DocMind AI | React · Node.js · Claude API · RAG
"RAG chatbot for documentation Q&A. TF-IDF chunk retrieval, context injection, SSE streaming. Answers questions about uploaded docs with source citations."
```
