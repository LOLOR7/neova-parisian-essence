import { CSSProperties } from "react";

const stroke = "hsl(var(--foreground) / 0.78)";
const strokeFaint = "hsl(var(--foreground) / 0.32)";
const brass = "hsl(var(--brass))";

const dash = (len: number, delay = 0): CSSProperties => ({
  ["--len" as any]: len,
  animationDelay: `${delay}ms`,
});

/**
 * Editorial animated visual for the About page —
 * a Haussmannian facade: cornice, mouldings, balconies, light sweep.
 * Same visual grammar as ServiceVisuals / LifecycleVisuals.
 */
export const AboutVisual = () => (
  <div className="relative w-full h-full">
    <style>{`
      @keyframes av-draw { to { stroke-dashoffset: 0; } }
      @keyframes av-fade { to { opacity: 1; } }
      @keyframes av-pulse { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }
      @keyframes av-sweep { 0% { transform: translateY(-12%); } 100% { transform: translateY(108%); } }
      @keyframes av-glow { 0%,100% { opacity: 0.18; } 50% { opacity: 0.55; } }
      .av-draw { stroke-dasharray: var(--len, 600); stroke-dashoffset: var(--len, 600); animation: av-draw 2s cubic-bezier(.16,1,.3,1) forwards; }
      .av-fade { opacity: 0; animation: av-fade 1.4s ease-out forwards; }
      .av-pulse { animation: av-pulse 2.6s ease-in-out infinite; }
      .av-sweep { animation: av-sweep 5s cubic-bezier(.16,1,.3,1) infinite; }
      .av-glow  { animation: av-glow 3.4s ease-in-out infinite; }
    `}</style>

    {/* graph paper */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.18]" aria-hidden>
      <defs>
        <pattern id="av-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke={strokeFaint} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#av-grid)" />
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

    <svg viewBox="0 0 400 520" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Light sweep */}
      <g className="av-sweep" opacity="0.5">
        <rect x="40" y="0" width="320" height="40" fill={brass} opacity="0.12" />
      </g>

      {/* Facade outline */}
      <path d="M70 470 L70 70 L330 70 L330 470" fill="none" stroke={stroke} strokeWidth="1.4" className="av-draw" style={dash(900, 0)} />
      {/* Cornice */}
      <path d="M58 70 L342 70" stroke={stroke} strokeWidth="2" className="av-draw" style={dash(290, 200)} />
      <path d="M64 78 L336 78" stroke={strokeFaint} strokeWidth="0.8" className="av-draw" style={dash(280, 350)} />

      {/* Floor lines */}
      {[170, 270, 370].map((y, i) => (
        <path key={y} d={`M70 ${y} L330 ${y}`} stroke={strokeFaint} strokeWidth="0.8" className="av-draw" style={dash(260, 500 + i * 180)} />
      ))}

      {/* Windows — 3 floors x 3 columns */}
      <g className="av-fade" style={{ animationDelay: "1100ms" }}>
        {[100, 200, 300].map((y) =>
          [105, 185, 265].map((x) => (
            <g key={`${x}-${y}`}>
              <rect x={x} y={y} width="40" height="56" fill="none" stroke={stroke} strokeWidth="0.8" />
              <path d={`M${x + 20} ${y} L${x + 20} ${y + 56} M${x} ${y + 28} L${x + 40} ${y + 28}`} stroke={strokeFaint} strokeWidth="0.5" />
              {/* Inner light */}
              <rect x={x + 2} y={y + 2} width="36" height="52" fill={brass} className="av-glow" />
            </g>
          )),
        )}
      </g>

      {/* Balcony railings — middle floor */}
      <g className="av-draw" style={dash(260, 1300)}>
        <path d="M70 268 L330 268" stroke={brass} strokeWidth="1" />
      </g>
      <g className="av-fade" style={{ animationDelay: "1500ms" }} stroke={brass} strokeWidth="0.6" fill="none">
        {Array.from({ length: 26 }).map((_, k) => (
          <path key={k} d={`M${78 + k * 10} 258 L${78 + k * 10} 268`} />
        ))}
      </g>

      {/* Ground floor — entrance door */}
      <g className="av-fade" style={{ animationDelay: "1700ms" }}>
        <path d="M180 470 L180 400 Q200 380 220 400 L220 470" fill="none" stroke={stroke} strokeWidth="1" />
        <circle cx="212" cy="436" r="1.5" fill={brass} className="av-pulse" />
      </g>

      {/* Survey reticle */}
      <g transform="translate(330 100)" className="av-pulse">
        <circle r="10" fill="none" stroke={brass} strokeWidth="1" />
        <path d="M-16 0 L-12 0 M12 0 L16 0 M0 -16 L0 -12 M0 12 L0 16" stroke={brass} strokeWidth="1" />
      </g>

      {/* Measurement */}
      <g className="av-fade" style={{ animationDelay: "1900ms" }}>
        <path d="M50 70 L50 470" stroke={brass} strokeWidth="0.8" />
        <path d="M44 70 L56 70 M44 470 L56 470" stroke={brass} strokeWidth="0.8" />
        <text x="42" y="275" textAnchor="middle" fontSize="9" fill={brass} fontFamily="ui-monospace, monospace" letterSpacing="2" transform="rotate(-90 42 275)">HAUSSMANN · 1865</text>
      </g>
    </svg>

    <span className="absolute bottom-4 right-5 text-[10px] uppercase tracking-[0.32em] text-foreground/55 font-mono">
      ARCHITECTURE · ÉTUDE
    </span>
  </div>
);
