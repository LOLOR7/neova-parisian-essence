import { CSSProperties } from "react";

/**
 * Three editorial SVG visuals for the lifecycle section
 * (Before · During · After). Same visual grammar as ServiceVisuals:
 * graph paper, corner ticks, draw-in strokes, brass accents.
 */

const stroke = "hsl(var(--foreground) / 0.78)";
const strokeFaint = "hsl(var(--foreground) / 0.32)";
const brass = "hsl(var(--brass))";

const StyleTag = () => (
  <style>{`
    @keyframes lc-draw { to { stroke-dashoffset: 0; } }
    @keyframes lc-fade { to { opacity: 1; } }
    @keyframes lc-pulse { 0%,100% { opacity: 0.35; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.2); } }
    @keyframes lc-sweep { 0% { transform: translateY(110%); } 100% { transform: translateY(-10%); } }
    @keyframes lc-rise { 0% { transform: scaleY(0); } 100% { transform: scaleY(1); } }
    @keyframes lc-glow { 0%,100% { opacity: 0.25; } 50% { opacity: 0.7; } }
    .lc-draw { stroke-dasharray: var(--len, 600); stroke-dashoffset: var(--len, 600); animation: lc-draw 1.8s cubic-bezier(.16,1,.3,1) forwards; }
    .lc-fade { opacity: 0; animation: lc-fade 1.2s ease-out forwards; }
    .lc-pulse { transform-origin: center; transform-box: fill-box; animation: lc-pulse 2.6s ease-in-out infinite; }
    .lc-rise  { transform-origin: bottom center; transform-box: fill-box; animation: lc-rise 1.4s cubic-bezier(.16,1,.3,1) forwards; }
    .lc-sweep { animation: lc-sweep 3.2s cubic-bezier(.16,1,.3,1) infinite; }
    .lc-glow  { animation: lc-glow 3s ease-in-out infinite; }
  `}</style>
);

const dash = (len: number, delay = 0): CSSProperties => ({
  ["--len" as any]: len,
  animationDelay: `${delay}ms`,
});

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-full h-full">
    <StyleTag />
    {/* graph paper */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.18]" aria-hidden>
      <defs>
        <pattern id="lc-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke={strokeFaint} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#lc-grid)" />
    </svg>
    {/* corner ticks */}
    <svg className="absolute inset-0 w-full h-full" aria-hidden>
      <g stroke={stroke} strokeWidth="1" fill="none">
        <path d="M16 4 L4 4 L4 16" />
        <path d="M-16 4 L-4 4 L-4 16" transform="translate(100% 0) scale(-1 1)" />
        <path d="M16 -4 L4 -4 L4 -16" transform="translate(0 100%) scale(1 -1)" />
        <path d="M-16 -4 L-4 -4 L-4 -16" transform="translate(100% 100%) scale(-1 -1)" />
      </g>
    </svg>
    <div className="absolute inset-0">{children}</div>
  </div>
);

/* 01 — BEFORE: blueprint floor plan being measured */
const BeforeVisual = () => (
  <Frame>
    <svg viewBox="0 0 400 320" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Outer apartment walls */}
      <path d="M60 60 L340 60 L340 260 L60 260 Z" fill="none" stroke={stroke} strokeWidth="1.4" className="lc-draw" style={dash(960, 0)} />
      {/* Inner partitions */}
      <path d="M200 60 L200 170 L340 170" fill="none" stroke={stroke} strokeWidth="1" className="lc-draw" style={dash(360, 600)} />
      <path d="M60 200 L160 200 L160 260" fill="none" stroke={stroke} strokeWidth="1" className="lc-draw" style={dash(220, 900)} />
      {/* Door arcs */}
      <path d="M200 130 A20 20 0 0 1 220 150" fill="none" stroke={strokeFaint} strokeWidth="0.8" className="lc-draw" style={dash(60, 1200)} />
      <path d="M120 200 A20 20 0 0 0 140 220" fill="none" stroke={strokeFaint} strokeWidth="0.8" className="lc-draw" style={dash(60, 1300)} />
      {/* Measurement line */}
      <g className="lc-fade" style={{ animationDelay: "1400ms" }}>
        <path d="M60 40 L340 40" stroke={brass} strokeWidth="0.8" />
        <path d="M60 34 L60 46 M340 34 L340 46" stroke={brass} strokeWidth="0.8" />
        <text x="200" y="32" textAnchor="middle" fontSize="9" fill={brass} fontFamily="ui-monospace, monospace" letterSpacing="2">142 M²</text>
      </g>
      {/* Survey reticle */}
      <g transform="translate(270 215)" className="lc-pulse">
        <circle r="14" fill="none" stroke={brass} strokeWidth="1" />
        <circle r="2" fill={brass} />
        <path d="M-22 0 L-16 0 M16 0 L22 0 M0 -22 L0 -16 M0 16 L0 22" stroke={brass} strokeWidth="1" />
      </g>
    </svg>
    <span className="absolute bottom-4 right-5 text-[10px] uppercase tracking-[0.32em] text-foreground/55 font-mono">DIAGNOSTIC · 01</span>
  </Frame>
);

/* 02 — DURING: scaffolding & rising progress */
const DuringVisual = () => (
  <Frame>
    <svg viewBox="0 0 400 320" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Building elevation */}
      <path d="M80 260 L80 80 L320 80 L320 260" fill="none" stroke={stroke} strokeWidth="1.2" className="lc-draw" style={dash(660, 0)} />
      {/* Floor lines */}
      {[140, 200].map((y, i) => (
        <path key={y} d={`M80 ${y} L320 ${y}`} stroke={strokeFaint} strokeWidth="0.8" className="lc-draw" style={dash(240, 400 + i * 200)} />
      ))}
      {/* Window grid */}
      <g className="lc-fade" style={{ animationDelay: "900ms" }}>
        {[100, 160, 220].map((y) =>
          [110, 170, 230, 290].map((x) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="22" height="28" fill="none" stroke={strokeFaint} strokeWidth="0.6" />
          )),
        )}
      </g>
      {/* Scaffolding poles */}
      <g stroke={brass} strokeWidth="1" fill="none">
        <path d="M70 260 L70 90" className="lc-draw" style={dash(180, 1100)} />
        <path d="M330 260 L330 90" className="lc-draw" style={dash(180, 1200)} />
        {/* horizontal bars */}
        {[120, 170, 220].map((y, i) => (
          <path key={y} d={`M70 ${y} L330 ${y}`} className="lc-draw" style={dash(260, 1300 + i * 150)} />
        ))}
      </g>
      {/* Progress hoist (rising) */}
      <g className="lc-sweep">
        <rect x="180" y="240" width="40" height="16" fill={brass} opacity="0.85" />
        <path d="M200 240 L200 80" stroke={brass} strokeWidth="0.6" strokeDasharray="2 3" />
      </g>
      {/* Ground line */}
      <path d="M40 260 L360 260" stroke={stroke} strokeWidth="1" />
    </svg>
    <span className="absolute bottom-4 right-5 text-[10px] uppercase tracking-[0.32em] text-foreground/55 font-mono">CHANTIER · 02</span>
  </Frame>
);

/* 03 — AFTER: refined room with light and key */
const AfterVisual = () => (
  <Frame>
    <svg viewBox="0 0 400 320" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Room interior — single point perspective */}
      <path d="M60 70 L340 70 L340 260 L60 260 Z" fill="none" stroke={stroke} strokeWidth="1.2" className="lc-draw" style={dash(960, 0)} />
      <path d="M60 70 L160 130 L160 220 L60 260" fill="none" stroke={strokeFaint} strokeWidth="0.8" className="lc-draw" style={dash(360, 700)} />
      <path d="M340 70 L240 130 L240 220 L340 260" fill="none" stroke={strokeFaint} strokeWidth="0.8" className="lc-draw" style={dash(360, 850)} />
      <path d="M160 130 L240 130 M160 220 L240 220" fill="none" stroke={strokeFaint} strokeWidth="0.8" className="lc-draw" style={dash(160, 1000)} />
      {/* Window with light */}
      <g className="lc-fade" style={{ animationDelay: "1100ms" }}>
        <rect x="180" y="150" width="40" height="50" fill="none" stroke={stroke} strokeWidth="0.8" />
        <path d="M200 150 L200 200 M180 175 L220 175" stroke={strokeFaint} strokeWidth="0.6" />
      </g>
      {/* Light cone */}
      <g className="lc-glow">
        <path d="M180 200 L120 260 L260 260 L220 200 Z" fill={brass} opacity="0.18" />
      </g>
      {/* Floor parquet hint */}
      <g stroke={strokeFaint} strokeWidth="0.5" className="lc-fade" style={{ animationDelay: "1300ms" }}>
        <path d="M60 230 L340 230" />
        <path d="M60 245 L340 245" />
      </g>
      {/* Key + completion mark */}
      <g transform="translate(290 100)" className="lc-fade" style={{ animationDelay: "1500ms" }}>
        <circle r="8" fill="none" stroke={brass} strokeWidth="1.2" />
        <path d="M8 0 L26 0 M20 0 L20 6 M26 0 L26 7" stroke={brass} strokeWidth="1.2" fill="none" />
      </g>
      {/* Hand-over signature line */}
      <g className="lc-fade" style={{ animationDelay: "1700ms" }}>
        <path d="M70 285 L130 285" stroke={brass} strokeWidth="1" />
        <text x="70" y="300" fontSize="8" fill={stroke} fontFamily="ui-monospace, monospace" letterSpacing="2">LIVRAISON</text>
      </g>
    </svg>
    <span className="absolute bottom-4 right-5 text-[10px] uppercase tracking-[0.32em] text-foreground/55 font-mono">LIVRAISON · 03</span>
  </Frame>
);

export const LifecycleVisuals = [BeforeVisual, DuringVisual, AfterVisual];
