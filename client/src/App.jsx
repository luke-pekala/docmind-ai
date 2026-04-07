import { useState, useCallback, useEffect } from 'react';
import { chunkDocument } from './lib/rag.js';
import Header from './components/Header.jsx';
import StatsBar from './components/StatsBar.jsx';
import Sidebar from './components/Sidebar.jsx';
import ChatArea from './components/ChatArea.jsx';
import RightPanel from './components/RightPanel.jsx';
import ApiKeyModal from './components/ApiKeyModal.jsx';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState('');           // only used if backend not available
  const [useBackend, setUseBackend] = useState(true); // prefer server-side key

  const [files, setFiles]       = useState([]);  // { id, name, size, chunks }
  const [allChunks, setAllChunks] = useState([]); // all indexed chunks

  const [messages, setMessages]     = useState([]); // chat history
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check if server is reachable on mount
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(() => setUseBackend(true))
      .catch(() => setUseBackend(false));
  }, []);

  // ── File ingestion ──────────────────────────────────────────────
  const ingestFiles = useCallback((fileList) => {
    Array.from(fileList).forEach((file) => {
      if (files.find((f) => f.name === file.name)) return; // skip dupe
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const chunks = chunkDocument(text, file.name);
        setFiles((prev) => [
          ...prev,
          { id: `${file.name}-${Date.now()}`, name: file.name, size: file.size, chunks: chunks.length },
        ]);
        setAllChunks((prev) => {
          const without = prev.filter((c) => c.filename !== file.name);
          return [...without, ...chunks];
        });
      };
      reader.readAsText(file);
    });
  }, [files]);

  const removeFile = useCallback((filename) => {
    setFiles((prev) => prev.filter((f) => f.name !== filename));
    setAllChunks((prev) => prev.filter((c) => c.filename !== filename));
  }, []);

  // ── Ask ─────────────────────────────────────────────────────────
  const sendQuestion = useCallback(async (question) => {
    if (!question.trim() || isStreaming) return;

    const needsKey = !useBackend;
    if (needsKey && !apiKey) {
      setShowApiModal(true);
      return;
    }
    if (allChunks.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: 'assistant',
          content: '⚠️ Please upload documentation files first — I need docs to search through!',
          citations: [],
        },
      ]);
      return;
    }

    const userMsg = { id: Date.now(), role: 'user', content: question };
    const thinkId = Date.now() + 1;
    const thinkMsg = { id: thinkId, role: 'assistant', content: '', thinking: true, citations: [] };

    setMessages((prev) => [...prev, userMsg, thinkMsg]);
    setIsStreaming(true);

    try {
      if (useBackend) {
        // ── Backend SSE streaming ──
        const res = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            chunks: allChunks,
            conversationHistory: messages.slice(-6),
          }),
        });

        if (!res.ok) throw new Error(`Server error ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop(); // keep incomplete line

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'sources') {
                setMessages((prev) =>
                  prev.map((m) => (m.id === thinkId ? { ...m, citations: data.sources } : m))
                );
              } else if (data.type === 'text') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === thinkId
                      ? { ...m, content: m.content + data.text, thinking: false }
                      : m
                  )
                );
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch {}
          }
        }
      } else {
        // ── Direct browser API call (demo/fallback) ──
        const { retrieveRelevantChunks } = await import('./lib/rag.js');
        const relevant = retrieveRelevantChunks(question, allChunks, 5);
        const sources = [...new Set(relevant.map((c) => c.filename))];

        setMessages((prev) =>
          prev.map((m) => (m.id === thinkId ? { ...m, citations: sources } : m))
        );

        const contextBlocks = relevant
          .map((c, i) => `[Source ${i + 1}: ${c.filename}]\n${c.content}`)
          .join('\n\n---\n\n');

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            stream: true,
            system: 'You are DocMind AI. Answer only from the provided documentation context. Cite source files.',
            messages: [
              {
                role: 'user',
                content: `Context:\n\n${contextBlocks}\n\n---\n\nQuestion: ${question}`,
              },
            ],
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error?.message || 'API error');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === thinkId
                      ? { ...m, content: m.content + parsed.delta.text, thinking: false }
                      : m
                  )
                );
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkId
            ? { ...m, content: `❌ ${err.message}`, thinking: false }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, useBackend, apiKey, allChunks, messages]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        onOpenApiModal={() => setShowApiModal(true)}
        apiConnected={useBackend || !!apiKey}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(s => !s)}
      />
      <StatsBar
        apiConnected={useBackend || !!apiKey}
        fileCount={files.length}
        chunkCount={allChunks.length}
        messageCount={messages.length}
      />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          open={sidebarOpen}
          files={files}
          onIngest={ingestFiles}
          onRemove={removeFile}
          totalChunks={allChunks.length}
        />
        <ChatArea
          messages={messages}
          isStreaming={isStreaming}
          totalChunks={allChunks.length}
          fileCount={files.length}
          onSend={sendQuestion}
        />
        <RightPanel />
      </div>
      {showApiModal && (
        <ApiKeyModal
          onSave={(key) => { setApiKey(key); setUseBackend(false); setShowApiModal(false); }}
          onClose={() => setShowApiModal(false)}
        />
      )}
    </div>
  );
}
