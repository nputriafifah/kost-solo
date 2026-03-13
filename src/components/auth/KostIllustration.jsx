export default function KostIllustration() {
  return (
    <svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[220px]">
      <ellipse cx="160" cy="220" rx="120" ry="18" fill="rgba(255,255,255,0.12)" />
      <rect x="20" y="100" width="55" height="125" rx="6" fill="rgba(255,255,255,0.15)" />
      <rect x="245" y="115" width="55" height="110" rx="6" fill="rgba(255,255,255,0.15)" />

      {[30, 50].map((x) =>
        [115, 145, 175].map((y) => (
          <rect key={`${x}${y}`} x={x} y={y} width="14" height="14" rx="3" fill="rgba(255,255,255,0.25)" />
        ))
      )}

      <rect x="75" y="80" width="170" height="145" rx="8" fill="rgba(255,255,255,0.22)" />
      <polygon points="65,80 160,30 255,80" fill="rgba(255,255,255,0.3)" />
      <rect x="139" y="175" width="42" height="50" rx="5" fill="rgba(255,255,255,0.35)" />
      <circle cx="174" cy="200" r="3" fill="rgba(255,255,255,0.8)" />

      {[90, 130, 175, 215].map((x, i) =>
        [98, 140].map((y, j) => (
          <rect
            key={`m${i}${j}`}
            x={x}
            y={y}
            width="22"
            height="22"
            rx="4"
            fill={j === 0 ? "rgba(255,230,100,0.5)" : "rgba(255,255,255,0.25)"}
          />
        ))
      )}

      <rect x="149" y="225" width="22" height="30" rx="4" fill="rgba(255,255,255,0.2)" />
      <rect x="120" y="248" width="80" height="8" rx="4" fill="rgba(255,255,255,0.15)" />
    </svg>
  );
}