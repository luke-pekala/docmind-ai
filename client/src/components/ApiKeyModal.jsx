import { useState } from 'react';

export default function ApiKeyModal({ onSave, onClose }) {
  const [value, setValue] = useState('');

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, backdropFilter: 'blur(4px)',
        animation: 'fadeUp 0.2s ease',
      }}
    >
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 28, width: 420, maxWidth: '90vw',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>🔑 Anthropic API Key</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.65 }}>
          Enter your API key from <strong>console.anthropic.com</strong>. It's stored in memory only — never persisted or sent anywhere except directly to Anthropic.
        </p>

        <div style={{
          background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 8, padding: '9px 12px',
          fontSize: 11, color: 'var(--amber)', lineHeight: 1.5, marginBottom: 14,
        }}>
          ⚠️ For demo/development only. In production, store your key on the backend server where it cannot be exposed.
        </div>

        <input
          type="password"
          placeholder="sk-ant-api03-..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && value.startsWith('sk-') && onSave(value)}
          autoFocus
          style={{
            width: '100%', background: 'var(--bg)',
            border: '1px solid var(--border)', borderRadius: 8,
            padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: 13,
            color: 'var(--text)', outline: 'none', marginBottom: 12,
          }}
        />

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-muted)',
            }}
          >Cancel</button>
          <button
            onClick={() => onSave(value)}
            disabled={!value.startsWith('sk-')}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', border: 'none',
              background: value.startsWith('sk-') ? 'var(--accent)' : 'var(--border)',
              color: value.startsWith('sk-') ? '#fff' : 'var(--text-subtle)',
              transition: 'all 0.2s',
            }}
          >Save Key</button>
        </div>
      </div>
    </div>
  );
}
