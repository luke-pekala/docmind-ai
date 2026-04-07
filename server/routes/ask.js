import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

export const askRouter = Router();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── TF-IDF Retrieval ────────────────────────────────────────────────
function retrieveRelevantChunks(query, chunks, topK = 5) {
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const scored = chunks.map((chunk) => {
    const chunkWords = chunk.content.toLowerCase().split(/\s+/);
    const total = chunkWords.length || 1;
    let score = 0;
    for (const qw of queryWords) {
      const count = chunkWords.filter((w) => w.includes(qw)).length;
      score += count / total;
    }
    return { ...chunk, score };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}

// ── POST /api/ask ───────────────────────────────────────────────────
// Body: { question: string, chunks: Chunk[], conversationHistory: Message[] }
// Streams back SSE: data: { type, text?, sources?, error? }
askRouter.post('/ask', async (req, res) => {
  const { question, chunks = [], conversationHistory = [] } = req.body;

  if (!question?.trim()) {
    return res.status(400).json({ error: 'question is required' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on server' });
  }

  // ── SSE headers ──
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    // ── Retrieve relevant chunks ──
    const relevant = retrieveRelevantChunks(question, chunks, 5);
    const sources = [...new Set(relevant.map((c) => c.filename))];

    send({ type: 'sources', sources });

    // ── Build context ──
    const contextBlocks = relevant
      .map((c, i) => `[Source ${i + 1}: ${c.filename}]\n${c.content}`)
      .join('\n\n---\n\n');

    const systemPrompt = `You are DocMind AI, a precise documentation assistant. Your job is to answer questions using ONLY the documentation context provided.

Rules:
- Answer only from the provided context. If the answer isn't there, say "I couldn't find that in the provided documentation."
- Always mention which source file(s) contain the relevant information.
- Be concise and accurate. Use code examples from the docs when helpful.
- Do not invent information not present in the context.`;

    // ── Build messages with history ──
    const contextMessage = {
      role: 'user',
      content: `Documentation context:\n\n${contextBlocks}\n\n---\n\nQuestion: ${question}`,
    };

    // Include conversation history (without context), then add context to current question
    const messages = [
      ...conversationHistory.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      contextMessage,
    ];

    // ── Stream from Claude ──
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        send({ type: 'text', text: event.delta.text });
      }
    }

    send({ type: 'done' });
  } catch (err) {
    console.error('[/api/ask]', err.message);
    send({ type: 'error', error: err.message });
  } finally {
    res.end();
  }
});
