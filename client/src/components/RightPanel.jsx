const CHANGELOG = [
  { tag: 'feature', ver: 'v1.3.0', text: 'Streaming responses via Server-Sent Events' },
  { tag: 'rag',     ver: 'v1.2.0', text: 'TF-IDF retrieval with overlapping chunks' },
  { tag: 'feature', ver: 'v1.1.0', text: 'Multi-file upload with chunk tracking' },
  { tag: 'fix',     ver: 'v1.0.1', text: 'Citation display and deduplication' },
  { tag: 'feature', ver: 'v1.0.0', text: 'Initial DocMind AI release' },
];

const TAG_STYLES = {
  feature: { bg: 'var(--accent-dim)',  color: 'var(--accent-bright)', border: 'rgba(99,102,241,0.2)' },
  rag:     { bg: 'var(--amber-dim)',   color: 'var(--amber)',         border: 'rgba(245,158,11,0.2)' },
  fix:     { bg: 'var(--green-dim)',   color: 'var(--green)',         border: 'rgba(34,197,94,0.2)' },
};

const RAG_STEPS = [
  ['01', 'Ingest',    'Split docs into 500-word chunks with 50-word overlap'],
  ['02', 'Retrieve',  'TF-IDF keyword scoring — return top-5 chunks'],
  ['03', 'Augment',   'Inject retrieved chunks into the Claude prompt'],
  ['04', 'Generate',  'Claude answers with source citations'],
];

export default function RightPanel() {
  return (
    <aside style={{
      width: 252, flexShrink: 0,
      borderLeft: '1px solid var(--border-subtle)',
      background: 'var(--bg-secondary)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Changelog */}
      <div style={secStyle}>Changelog</div>
      <div style={{ overflowY: 'auto', maxHeight: 230 }}>
        {CHANGELOG.map((item, i) => {
          const t = TAG_STYLES[item.tag];
          return (
            <div key={i} style={{
              padding: '9px 14px', borderBottom: '1px solid var(--border-subtle)',
              transition: 'background 0.15s', cursor: 'default',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{
                  fontSize: 9, fontFamily: 'var(--mono)', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.4px',
                  padding: '2px 6px', borderRadius: 4,
                  background: t.bg, color: t.color, border: `1px solid ${t.border}`,
                }}>{item.tag}</span>
                <span style={{ fontSize: 10, color: 'var(--text-subtle)', fontFamily: 'var(--mono)' }}>{item.ver}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.text}</div>
            </div>
          );
        })}
      </div>

      {/* RAG Pipeline */}
      <div style={{ ...secStyle, borderTop: '1px solid var(--border-subtle)' }}>RAG Pipeline</div>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
        {RAG_STEPS.map(([num, label, desc]) => (
          <div key={num} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 10 }}>
            <div style={{
              width: 19, height: 19, borderRadius: '50%', flexShrink: 0,
              background: 'var(--accent-dim)', border: '1px solid rgba(99,102,241,0.22)',
              fontSize: 9, fontFamily: 'var(--mono)', fontWeight: 700,
              color: 'var(--accent-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: 1,
            }}>{num}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{label} — </span>
              {desc}
            </div>
          </div>
        ))}
      </div>

      {/* Model card */}
      <div style={{ margin: '10px 12px', padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 9 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600 }}>claude-sonnet-4</span>
          <span style={{
            fontSize: 9, fontFamily: 'var(--mono)', fontWeight: 600,
            background: 'var(--green-dim)', color: 'var(--green)',
            border: '1px solid rgba(34,197,94,0.2)', padding: '1px 6px', borderRadius: 10,
          }}>● Live</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-subtle)', lineHeight: 1.6 }}>
          Max tokens: 1,024 · Top-K: 5 chunks<br />
          Retrieval: TF-IDF keyword scoring
        </div>
      </div>

      {/* Phase tag */}
      <div style={{ margin: '0 12px 12px', padding: '8px 12px', background: 'var(--accent-dim)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 8 }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--accent-bright)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>
          Phase 3 · App 1 of 5
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Weeks 32–35 · RAG + Claude API + Streaming
        </div>
      </div>
    </aside>
  );
}

const secStyle = {
  padding: '12px 15px 10px',
  fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '1px', color: 'var(--text-subtle)',
  borderBottom: '1px solid var(--border-subtle)', flexShrink: 0,
};
