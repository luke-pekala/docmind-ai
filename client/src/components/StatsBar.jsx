export default function StatsBar({ apiConnected, fileCount, chunkCount, messageCount }) {
  const stats = [
    { label: 'Claude API',  value: apiConnected ? 'Connected' : 'No Key', color: apiConnected ? 'var(--green)' : 'var(--amber)' },
    { label: 'Docs',        value: `${fileCount} files`,    color: fileCount  > 0 ? 'var(--accent-bright)' : 'var(--text-subtle)' },
    { label: 'Chunks',      value: `${chunkCount} indexed`, color: chunkCount > 0 ? 'var(--accent-bright)' : 'var(--text-subtle)' },
    { label: 'Messages',    value: `${messageCount}`,       color: messageCount > 0 ? 'var(--green)' : 'var(--text-subtle)' },
    { label: 'Model',       value: 'claude-sonnet-4',       color: 'var(--text)',  mono: true },
    { label: 'Strategy',    value: 'TF-IDF',                color: 'var(--amber)', mono: true },
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', height: 38,
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-secondary)', flexShrink: 0, overflowX: 'auto',
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: i === 0 ? '0 16px 0 18px' : '0 16px',
          borderRight: '1px solid var(--border-subtle)',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            {s.label}
          </span>
          <span style={{
            fontSize: s.mono ? 10.5 : 11,
            fontFamily: s.mono ? 'var(--mono)' : 'var(--font)',
            fontWeight: 500, color: s.color,
          }}>
            {s.value}
          </span>
        </div>
      ))}
    </div>
  );
}
