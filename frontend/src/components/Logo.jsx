export function TrackFlowMark({ size = 28, style = {} }) {
  return (
    <svg
      width={size}
      height={size * 0.78}
      viewBox="0 0 64 50"
      style={style}
      aria-label="TrackFlow"
    >
      <path
        d="M6 14 C 18 4, 42 4, 56 12 L 52 18 C 40 11, 22 11, 12 18 Z"
        fill="#1e6fd9"
      />
      <path
        d="M10 22 C 22 14, 44 14, 58 22 L 56 28 C 44 22, 24 22, 14 28 Z"
        fill="#2ec8ff"
      />
      <rect x="28" y="20" width="8" height="26" rx="1.5" fill="#1e6fd9" />
      <rect x="22" y="18" width="20" height="5" rx="1" fill="#2ec8ff" />
    </svg>
  );
}

export function TrackFlowWordmark({ size = 20, color = '#e6edf7' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <TrackFlowMark size={size * 1.4} />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          fontFamily: '"Rubik", "Helvetica Neue", sans-serif',
          fontWeight: 700,
          fontSize: size,
          letterSpacing: '0.04em',
          color,
        }}>TRACK</span>
        <span style={{
          fontFamily: '"Rubik", "Helvetica Neue", sans-serif',
          fontWeight: 400,
          fontSize: size,
          letterSpacing: '0.04em',
          color: '#2ec8ff',
        }}>FLOW</span>
      </div>
    </div>
  );
}
