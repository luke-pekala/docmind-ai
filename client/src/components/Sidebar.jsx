import { useRef, useState } from 'react';
import { formatSize, getFileType, ACCEPTED_EXTENSIONS } from '../lib/rag.js';

export default function Sidebar({ open, files, onIngest, onRemove, totalChunks }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    onIngest(e.dataTransfer.files);
  };

  const capacity = Math.min(100, Math.round((totalChunks / 500) * 100));

  return (
    <aside style={{
      width: open ? 272 : 0, flexShrink: 0,
      borderRight: '1px solid var(--border-subtle)',
      background: 'var(--bg-secondary)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {/* Section header */}
      <div style={secHeadStyle}>
        <span>Documentation Files</span>
        {files.length > 0 && (
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600,
            background: 'var(--accent-dim)', color: 'var(--accent-bright)',
            border: '1px solid rgba(99,102,241,0.2)', padding: '1px 6px', borderRadius: 10,
          }}>{files.length} active</span>
        )}
      </div>

      {/* Upload zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        style={{
          margin: 12, border: `1.5px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 10, padding: '14px 12px', textAlign: 'center', cursor: 'pointer',
          background: dragOver ? 'var(--accent-dim)' : 'transparent',
          transition: 'all 0.2s',
        }}
      >
        <div style={{ fontSize: 22, marginBottom: 5 }}>📄</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
          Drop files or click to upload
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 2, fontFamily: 'var(--mono)' }}>
          .txt .md .js .ts .py .json .html…
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS}
        style={{ display: 'none' }}
        onChange={(e) => onIngest(e.target.files)}
      />

      {/* File list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {files.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-subtle)', fontSize: 12 }}>
            No documents yet.<br />Upload files to start.
          </div>
        ) : (
          files.map((file) => {
            const { icon } = getFileType(file.name);
            return (
              <div key={file.id} style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)',
                cursor: 'default', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: 'var(--accent-dim)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0,
                }}>{icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-subtle)', fontFamily: 'var(--mono)' }}>
                    {file.chunks} chunks · {formatSize(file.size)}
                  </div>
                </div>
                <button
                  onClick={() => onRemove(file.name)}
                  style={{
                    width: 20, height: 20, borderRadius: 5, border: 'none',
                    background: 'transparent', color: 'var(--text-subtle)',
                    cursor: 'pointer', fontSize: 11, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-dim)'; e.currentTarget.style.color = 'var(--red)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-subtle)'; }}
                >✕</button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {files.length > 0 && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-subtle)', marginBottom: 5 }}>
            <span>Index capacity</span>
            <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>{totalChunks} / 500</span>
          </div>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2, width: `${capacity}%`,
              background: 'linear-gradient(90deg, var(--accent), var(--accent-bright))',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 7, lineHeight: 1.5 }}>
            TF-IDF · 500-word chunks · 50-word overlap
          </div>
        </div>
      )}
    </aside>
  );
}

const secHeadStyle = {
  padding: '13px 16px 10px',
  fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '1px', color: 'var(--text-subtle)',
  borderBottom: '1px solid var(--border-subtle)',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  flexShrink: 0, whiteSpace: 'nowrap',
};
