export default function Header({ theme, onToggleTheme, onOpenApiModal, apiConnected, sidebarOpen, onToggleSidebar }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 18px', height: '50px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg)', flexShrink: 0, zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={onToggleSidebar} style={btnStyle}>☰</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, boxShadow: '0 0 16px var(--accent-glow)',
          }}>🧠</div>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.4px' }}>
            Doc<span style={{ color: 'var(--accent-bright)' }}>Mind</span> AI
          </span>
        </div>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600,
          color: 'var(--accent-bright)', background: 'var(--accent-dim)',
          border: '1px solid rgba(99,102,241,0.22)',
          padding: '2px 8px', borderRadius: 20,
        }}>v1.3.0</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={onOpenApiModal}
          style={{
            ...btnStyle,
            color: apiConnected ? 'var(--green)' : 'var(--amber)',
            borderColor: apiConnected ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)',
            background: apiConnected ? 'var(--green-dim)' : 'var(--amber-dim)',
            padding: '0 10px', gap: 5, fontSize: 12,
            display: 'flex', alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 8 }}>●</span>
          {apiConnected ? 'Connected' : 'Set API Key'}
        </button>
        <button onClick={onToggleTheme} style={btnStyle} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}

const btnStyle = {
  height: 30, padding: '0 8px', borderRadius: 7,
  border: '1px solid var(--border)', background: 'transparent',
  color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13,
  fontFamily: 'var(--font)', display: 'flex', alignItems: 'center',
  justifyContent: 'center', transition: 'all 0.2s',
};
