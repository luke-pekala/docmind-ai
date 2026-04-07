import { useRef, useEffect, useState } from 'react';

export default function ChatArea({ messages, isStreaming, totalChunks, fileCount, onSend }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = '22px';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {messages.length === 0 ? (
          <Welcome />
        ) : (
          messages.map((msg, i) => (
            <Message key={msg.id} msg={msg} isLast={i === messages.length - 1} isStreaming={isStreaming} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '14px 22px 18px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg)', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 8,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '10px 12px', transition: 'all 0.2s',
        }}
          onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-dim)'}
          onBlur={e => e.currentTarget.style.boxShadow = 'none'}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = '22px';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder={totalChunks === 0 ? 'Upload documentation files first…' : 'Ask a question about your documentation…'}
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              resize: 'none', fontFamily: 'var(--font)', fontSize: 14,
              color: 'var(--text)', lineHeight: 1.6, minHeight: 22, maxHeight: 120,
            }}
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none',
              background: 'var(--accent)', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, flexShrink: 0, transition: 'all 0.2s',
              opacity: (isStreaming || !input.trim()) ? 0.4 : 1,
            }}
          >↑</button>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 8, padding: '0 2px',
        }}>
          <span style={{ fontSize: 10.5, color: 'var(--text-subtle)' }}>
            {totalChunks > 0
              ? `${totalChunks} chunks · ${fileCount} file${fileCount !== 1 ? 's' : ''} · Enter to send · Shift+Enter for newline`
              : 'Upload files in the sidebar to enable Q&A'}
          </span>
          {totalChunks > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text-subtle)', fontFamily: 'var(--mono)' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s infinite' }} />
              RAG active
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Welcome() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: 40,
      animation: 'fadeUp 0.4s ease',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: 'linear-gradient(135deg, #6366f1, #818cf8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, marginBottom: 20,
        boxShadow: '0 8px 32px var(--accent-glow)',
      }}>🧠</div>
      <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px', marginBottom: 8 }}>DocMind AI</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 380, lineHeight: 1.7 }}>
        Upload your documentation files, then ask questions in natural language. Get cited answers powered by RAG + Claude.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 28, maxWidth: 480 }}>
        {[
          ['01', 'Set API Key', 'Click the status button in the header to configure'],
          ['02', 'Upload Docs', 'Drop .txt, .md, .js, .py files into the sidebar'],
          ['03', 'Ask Anything', 'Type a question and get precise, cited answers'],
        ].map(([num, title, desc]) => (
          <div key={num} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '14px 12px', textAlign: 'left',
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>{num}</div>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 3 }}>{title}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Message({ msg, isLast, isStreaming }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex', gap: 11, flexDirection: isUser ? 'row-reverse' : 'row',
      animation: 'fadeUp 0.25s ease',
    }}>
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, marginTop: 2,
        background: isUser ? 'var(--bg-card)' : 'linear-gradient(135deg, #6366f1, #818cf8)',
        border: isUser ? '1px solid var(--border)' : 'none',
        boxShadow: isUser ? 'none' : '0 2px 10px var(--accent-glow)',
      }}>
        {isUser ? '👤' : '🧠'}
      </div>

      {/* Content */}
      <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 6, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        {msg.thinking ? (
          <div style={{
            padding: '10px 14px', borderRadius: 10,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 0.18, 0.36].map((delay, i) => (
                <span key={i} style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: 'var(--text-subtle)', display: 'inline-block',
                  animation: `bounce 1.1s ${delay}s infinite`,
                }} />
              ))}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-subtle)', fontStyle: 'italic' }}>
              Searching chunks…
            </span>
          </div>
        ) : (
          <div style={{
            padding: '10px 14px', borderRadius: 10,
            background: isUser ? 'var(--accent)' : 'var(--bg-card)',
            border: isUser ? 'none' : '1px solid var(--border)',
            color: isUser ? '#fff' : 'var(--text)',
            fontSize: 13.5, lineHeight: 1.7,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {msg.content}
            {!isUser && isLast && isStreaming && (
              <span style={{ color: 'var(--accent-bright)', animation: 'blink 0.7s infinite', marginLeft: 2 }}>▋</span>
            )}
          </div>
        )}

        {/* Citations */}
        {!isUser && !msg.thinking && msg.citations?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {msg.citations.map((src) => (
              <span key={src} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '3px 9px', borderRadius: 20,
                background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.18)',
                fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--green)', fontWeight: 500,
              }}>
                📄 {src}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
