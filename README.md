# 🧠 DocMind AI

> RAG-powered documentation chatbot — upload your docs, ask anything, get cited answers via Claude.

![DocMind AI](https://img.shields.io/badge/Claude-claude--sonnet--4-6366f1?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square)
![Node](https://img.shields.io/badge/Node.js-20+-22c55e?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-white?style=flat-square)

## What is DocMind AI?

DocMind AI lets you upload documentation files and ask natural language questions about them. It uses **Retrieval-Augmented Generation (RAG)** — the most important pattern in applied AI — to find relevant sections in your docs and pass them to Claude for precise, cited answers.

### The RAG Pipeline
```
INGEST → RETRIEVE → AUGMENT → GENERATE
  ↓          ↓          ↓          ↓
Split     TF-IDF     Inject     Claude
chunks    search     context    answers
```

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Geist fonts |
| Backend | Node.js, Express |
| AI | Claude claude-sonnet-4 (Anthropic) |
| Retrieval | TF-IDF keyword scoring |
| Streaming | Server-Sent Events (SSE) |

## Quick Start

### Prerequisites
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/docmind-ai.git
cd docmind-ai

# 2. Install all dependencies
npm run install:all

# 3. Add your API key
cp server/.env.example server/.env
# Edit server/.env and add your ANTHROPIC_API_KEY

# 4. Run dev server (starts both frontend + backend)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Project Structure

```
docmind-ai/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx          # Root component
│   │   ├── main.jsx         # Entry point
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ChatArea.jsx
│   │   │   ├── RightPanel.jsx
│   │   │   └── ApiKeyModal.jsx
│   │   ├── lib/
│   │   │   └── rag.js       # Chunking + TF-IDF retrieval
│   │   └── styles/
│   │       └── globals.css  # DOCSTRUCT design tokens
│   └── package.json
├── server/              # Express backend
│   ├── index.js             # Server entry
│   ├── routes/
│   │   └── ask.js           # POST /api/ask with SSE streaming
│   ├── .env.example
│   └── package.json
└── package.json         # Root scripts
```

## Deployment

### Frontend → Vercel
```bash
cd client && npm run build
# Deploy dist/ to Vercel
```

### Backend → Railway / Render
Set environment variable `ANTHROPIC_API_KEY` in your hosting dashboard.

## Portfolio Notes

This project demonstrates:
- **RAG pattern** — chunking, retrieval, context injection
- **Streaming AI responses** — SSE for real-time token delivery
- **Full-stack architecture** — React + Node.js + external API
- **Production UI** — DOCSTRUCT design system, dark/light themes

---

Built as part of a full-stack AI development curriculum. Phase 3, App 1 of 5.
