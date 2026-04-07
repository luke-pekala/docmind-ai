import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { askRouter } from './routes/ask.js';

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ── Middleware ──────────────────────────────────────────────────────
// Allow the configured client URL plus any Vercel preview deployment
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, same-origin SSE)
    if (!origin) return callback(null, true);
    // Allow localhost dev
    if (origin.includes('localhost')) return callback(null, true);
    // Allow any Vercel deployment (preview + production)
    if (origin.includes('.vercel.app')) return callback(null, true);
    // Allow the explicitly configured client URL
    if (origin === CLIENT_URL) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ── Routes ──────────────────────────────────────────────────────────
app.use('/api', askRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    model: 'claude-sonnet-4-20250514',
    timestamp: new Date().toISOString(),
  });
});

// ── Start ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🧠 DocMind AI server running on http://localhost:${PORT}`);
  console.log(`   API key: ${process.env.ANTHROPIC_API_KEY ? '✓ set' : '✗ MISSING — add to server/.env'}`);
  console.log(`   Client:  ${CLIENT_URL}\n`);
});
