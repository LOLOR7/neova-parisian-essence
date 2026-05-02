import { CSSProperties } from "react";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Custom architectural SVG visuals for each service.
 * Pure SVG + CSS keyframes (stroke-dasharray draw-in).
 * Re-mounted on activeKey change so animations replay.
 */

const stroke = "hsl(var(--foreground) / 0.75)";
const strokeFaint = "hsl(var(--foreground) / 0.32)";
const brass = "hsl(var(--brass))";
const fillSoft = "hsl(var(--foreground) / 0.05)";

type V = { className?: string };

/* ============================================================
   Shared inline keyframes — injected once.
   ============================================================ */
const StyleTag = () => (
  <style>{`
    @keyframes nv-draw { to { stroke-dashoffset: 0; } }
    @keyframes nv-fade { to { opacity: 1; } }
    @keyframes nv-pulse { 0%,100% { opacity: 0.35; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.15); } }
    @keyframes nv-sweep { 0% { transform: translateX(-110%); } 100% { transform: translateX(110%); } }
    @keyframes nv-tick { 0% { transform: scaleX(0); } 100% { transform: scaleX(1); } }
    @keyframes nv-glow { 0%,100% { opacity: 0.25; } 50% { opacity: 0.65; } }
    .nv-draw { stroke-dasharray: var(--len, 600); stroke-dashoffset: var(--len, 600); animation: nv-draw 1.6s var(--ease-slow, cubic-bezier(.16,1,.3,1)) forwards; }
    .nv-fade { opacity: 0; animation: nv-fade 1s ease-out forwards; }
    .nv-pulse { transform-origin: center; transform-box: fill-box; animation: nv-pulse 2.4s ease-in-out infinite; }
    .nv-glow  { animation: nv-glow 3.2s ease-in-out infinite; }
    .nv-sweep { animation: nv-sweep 2.6s var(--ease-slow, cubic-bezier(.16,1,.3,1)) forwards; }
    .nv-tick  { transform-origin: left center; animation: nv-tick 0.9s var(--ease-slow, cubic-bezier(.16,1,.3,1)) forwards; }
  `}</style>
);

const Frame = ({ children, label }: { children: React.ReactNode; label?: string }) => (
  <div className="relative w-full h-full">
    <StyleTag />
    {/* graph paper */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.18]" aria-hidden>
      <defs>
        <pattern id="nv-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke={strokeFaint} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#nv-grid)" />
    </svg>
    {/* corner ticks */}
    <svg className="absolute inset-0 w-full h-full" aria-hidden>
      {[
        "M0 14 L0 0 L14 0",
        "M100% 14 m-14 0 L100% 0 m0 0 L100% 0 L100% 0",
      ].map(() => null)}
      <g stroke={stroke} strokeWidth="1" fill="none">
        <path d="M16 4 L4 4 L4 16" />
        <path d="M-16 4 L-4 4 L-4 16" transform="translate(100% 0) scale(-1 1)" />
        <path d="M16 -4 L4 -4 L4 -16" transform="translate(0 100%) scale(1 -1)" />
        <path d="M-16 -4 L-4 -4 L-4 -16" transform="translate(100% 100%) scale(-1 -1)" />
      </g>
    </svg>
    <div className="absolute inset-0">{children}</div>
    {label && (
      <span className="absolute bottom-4 right-5 text-[10px] uppercase tracking-[0.32em] text-foreground/55 numeral">
        {label}
      </span>
    )}
  </div>
);

const dash = (len: number, delay = 0): CSSProperties => ({
  ["--len" as any]: len,
  animationDelay: `${delay}ms`,
});

/* ============================================================
   01 — Rénovation complète (floor plan transform)
   ============================================================ */
const PlanRenovation = ({ className = "" }: V) => {
  const { lang } = useI18n();
  const before = lang === "fr" ? "AVANT" : "BEFORE";
  const after = lang === "fr" ? "APRÈS" : "AFTER";
  return (
  <Frame label="Plan · 01">
    <svg viewBox="0 0 800 520" className={`w-full h-full ${className}`} fill="none">
      {/* outer walls */}
      <g stroke={stroke} strokeWidth="2">
        <path className="nv-draw" style={dash(2200, 0)} d="M80 80 H720 V440 H80 Z" />
      </g>
      {/* inner walls */}
      <g stroke={stroke} strokeWidth="1.4">
        <path className="nv-draw" style={dash(640, 400)} d="M320 80 V260 H80" />
        <path className="nv-draw" style={dash(520, 600)} d="M480 260 H720" />
        <path className="nv-draw" style={dash(360, 800)} d="M480 260 V440" />
        <path className="nv-draw" style={dash(360, 1000)} d="M80 320 H320" />
      </g>
      {/* doors (arcs) */}
      <g stroke={stroke} strokeWidth="1" opacity="0.7">
        <path className="nv-draw" style={dash(80, 1200)} d="M260 80 A40 40 0 0 1 300 120" />
        <path className="nv-draw" style={dash(80, 1300)} d="M440 260 A40 40 0 0 1 480 300" />
        <path className="nv-draw" style={dash(80, 1400)} d="M80 280 A40 40 0 0 1 120 320" />
      </g>
      {/* furniture hints */}
      <g stroke={strokeFaint} strokeWidth="1" className="nv-fade" style={{ animationDelay: "1500ms" }}>
        <rect x="120" y="120" width="120" height="60" />
        <rect x="520" y="120" width="160" height="100" />
        <circle cx="600" cy="360" r="36" />
        <rect x="140" y="360" width="120" height="50" />
      </g>
      {/* axes */}
      <g stroke={brass} strokeWidth="1">
        <line className="nv-draw" style={dash(640, 200)} x1="80" y1="50" x2="720" y2="50" />
        <line className="nv-draw" style={dash(360, 350)} x1="50" y1="80" x2="50" y2="440" />
      </g>
      {/* sweep reveal line */}
      <line x1="400" y1="80" x2="400" y2="440" stroke={brass} strokeWidth="1.2" className="nv-fade" style={{ animationDelay: "1700ms" }} />
      {/* labels */}
      <g fill="hsl(var(--foreground) / 0.5)" fontFamily="Inter, sans-serif" fontSize="10" letterSpacing="2">
        <text x="80" y="40" className="nv-fade" style={{ animationDelay: "1900ms" }}>{before}</text>
        <text x="420" y="40" className="nv-fade" style={{ animationDelay: "2100ms" }}>{after}</text>
      </g>
    </svg>
  </Frame>
);
};

/* ============================================================
   02 — Direction & gestion de chantier (planning timeline)
   ============================================================ */
const PlanSchedule = ({ className = "" }: V) => (
  <Frame label="Planning · 02">
    <svg viewBox="0 0 800 520" className={`w-full h-full ${className}`} fill="none">
      {/* row guides */}
      {[120, 180, 240, 300, 360, 420].map((y, i) => (
        <line key={y} x1="80" y1={y} x2="720" y2={y} stroke={strokeFaint} strokeWidth="0.5" className="nv-fade" style={{ animationDelay: `${i * 80}ms` }} />
      ))}
      {/* week markers */}
      <g stroke={stroke} strokeWidth="0.8">
        {[80, 200, 320, 440, 560, 680].map((x, i) => (
          <g key={x}>
            <line className="nv-draw" style={dash(360, 200 + i * 60)} x1={x} y1="90" x2={x} y2="450" />
            <text x={x} y="80" fill="hsl(var(--foreground) / 0.55)" fontSize="9" letterSpacing="2" fontFamily="Inter, sans-serif">
              S{String(i + 1).padStart(2, "0")}
            </text>
          </g>
        ))}
      </g>
      {/* gantt bars */}
      <g>
        {[
          { x: 80,  w: 200, y: 110, d: 600 },
          { x: 200, w: 260, y: 170, d: 800 },
          { x: 320, w: 220, y: 230, d: 1000 },
          { x: 380, w: 300, y: 290, d: 1200 },
          { x: 500, w: 180, y: 350, d: 1400 },
          { x: 580, w: 140, y: 410, d: 1600 },
        ].map((b) => (
          <g key={b.y}>
            <line x1={b.x} y1={b.y + 12} x2={b.x + b.w} y2={b.y + 12}
              stroke={stroke} strokeWidth="6" strokeLinecap="round"
              className="nv-draw" style={dash(b.w, b.d)} />
            <circle cx={b.x} cy={b.y + 12} r="4" fill={brass} className="nv-fade" style={{ animationDelay: `${b.d + 200}ms` }} />
            <circle cx={b.x + b.w} cy={b.y + 12} r="4" fill={brass} className="nv-fade" style={{ animationDelay: `${b.d + 400}ms` }} />
          </g>
        ))}
      </g>
      {/* milestone markers */}
      <g>
        {[260, 460, 640].map((x, i) => (
          <g key={x} className="nv-fade" style={{ animationDelay: `${1800 + i * 200}ms` }}>
            <line x1={x} y1="90" x2={x} y2="450" stroke={brass} strokeWidth="0.8" strokeDasharray="2 4" />
            <circle cx={x} cy="90" r="4" fill={brass} />
          </g>
        ))}
      </g>
    </svg>
  </Frame>
);

/* ============================================================
   03 — Architecture intérieure (composition + axes)
   ============================================================ */
const PlanInterior = ({ className = "" }: V) => (
  <Frame label="Composition · 03">
    <svg viewBox="0 0 800 520" className={`w-full h-full ${className}`} fill="none">
      <g stroke={stroke} strokeWidth="1.4">
        <path className="nv-draw" style={dash(1800, 0)} d="M100 100 H700 V420 H100 Z" />
      </g>
      {/* arches */}
      <g stroke={stroke} strokeWidth="1.2">
        <path className="nv-draw" style={dash(260, 400)} d="M250 420 V300 A60 60 0 0 1 370 300 V420" />
        <path className="nv-draw" style={dash(260, 600)} d="M430 420 V300 A60 60 0 0 1 550 300 V420" />
      </g>
      {/* furniture blocks */}
      <g stroke={strokeFaint} strokeWidth="1" fill={fillSoft}>
        <rect className="nv-fade" style={{ animationDelay: "900ms" }} x="130" y="140" width="160" height="60" />
        <rect className="nv-fade" style={{ animationDelay: "1050ms" }} x="510" y="140" width="160" height="60" />
        <rect className="nv-fade" style={{ animationDelay: "1200ms" }} x="320" y="160" width="160" height="40" />
        <circle className="nv-fade" style={{ animationDelay: "1400ms" }} cx="400" cy="370" r="24" />
      </g>
      {/* circulation axes */}
      <g stroke={brass} strokeWidth="1" strokeDasharray="3 5">
        <line className="nv-draw" style={dash(420, 1500)} x1="400" y1="100" x2="400" y2="420" />
        <line className="nv-draw" style={dash(600, 1700)} x1="100" y1="260" x2="700" y2="260" />
      </g>
      {/* dimension ticks */}
      <g stroke={stroke} strokeWidth="0.8" fill="hsl(var(--foreground) / 0.55)" fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="2">
        <line className="nv-draw" style={dash(600, 1900)} x1="100" y1="80" x2="700" y2="80" />
        <text x="380" y="72" className="nv-fade" style={{ animationDelay: "2200ms" }}>6.40 m</text>
      </g>
    </svg>
  </Frame>
);

/* ============================================================
   04 — Travaux techniques (network: élec / plomb / HVAC)
   ============================================================ */
const PlanTechnical = ({ className = "" }: V) => {
  const { lang } = useI18n();
  const elec = lang === "fr" ? "ÉLECTRICITÉ" : "ELECTRICAL";
  const plumb = lang === "fr" ? "PLOMBERIE" : "PLUMBING";
  const hvac = lang === "fr" ? "CVC" : "HVAC";
  return (
  <Frame label={lang === "fr" ? "Réseaux · 04" : "Networks · 04"}>
    <svg viewBox="0 0 800 520" className={`w-full h-full ${className}`} fill="none">
      <g stroke={strokeFaint} strokeWidth="1">
        <path d="M80 80 H720 V440 H80 Z" />
      </g>
      {/* electrical (slate, sharp turns) */}
      <g stroke={stroke} strokeWidth="1.2">
        <path className="nv-draw" style={dash(1200, 100)} d="M80 130 H260 V200 H440 V140 H720" />
        <path className="nv-draw" style={dash(900, 300)} d="M180 440 V340 H360 V260" />
      </g>
      {/* plumbing (brass, curved) */}
      <g stroke={brass} strokeWidth="1.4">
        <path className="nv-draw" style={dash(1100, 500)} d="M720 380 H560 Q500 380 500 320 V220 Q500 180 540 180 H700" />
        <path className="nv-draw" style={dash(700, 800)} d="M80 380 H220 Q260 380 260 340 V260" />
      </g>
      {/* HVAC (dashed) */}
      <g stroke={stroke} strokeWidth="1" strokeDasharray="6 6" opacity="0.7">
        <path className="nv-draw" style={dash(1200, 1000)} d="M120 80 V210 H600 V100" />
      </g>
      {/* nodes */}
      <g>
        {[
          [260, 200], [440, 140], [360, 260], [500, 220], [540, 180], [220, 340], [600, 100],
        ].map(([cx, cy], i) => (
          <g key={`${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r="6" fill="hsl(var(--background))" stroke={stroke} strokeWidth="1" />
            <circle cx={cx} cy={cy} r="3" fill={brass} className="nv-pulse" style={{ animationDelay: `${i * 200}ms` }} />
          </g>
        ))}
      </g>
      {/* legend */}
      <g fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="2.5" fill="hsl(var(--foreground) / 0.6)">
        <g className="nv-fade" style={{ animationDelay: "1400ms" }}>
          <line x1="80" y1="470" x2="110" y2="470" stroke={stroke} strokeWidth="1.2" />
          <text x="118" y="473">{elec}</text>
        </g>
        <g className="nv-fade" style={{ animationDelay: "1600ms" }}>
          <line x1="240" y1="470" x2="270" y2="470" stroke={brass} strokeWidth="1.4" />
          <text x="278" y="473">{plumb}</text>
        </g>
        <g className="nv-fade" style={{ animationDelay: "1800ms" }}>
          <line x1="390" y1="470" x2="420" y2="470" stroke={stroke} strokeWidth="1" strokeDasharray="4 4" />
          <text x="428" y="473">{hvac}</text>
        </g>
      </g>
    </svg>
  </Frame>
);
};

/* ============================================================
   05 — Menuiseries & sur-mesure (cabinet elevation)
   ============================================================ */
const PlanJoinery = ({ className = "" }: V) => (
  <Frame label="Élévation · 05">
    <svg viewBox="0 0 800 520" className={`w-full h-full ${className}`} fill="none">
      {/* outer cabinet */}
      <g stroke={stroke} strokeWidth="1.6">
        <path className="nv-draw" style={dash(1900, 0)} d="M120 100 H680 V440 H120 Z" />
      </g>
      {/* shelves */}
      <g stroke={stroke} strokeWidth="1">
        {[170, 230, 290, 350].map((y, i) => (
          <line key={y} className="nv-draw" style={dash(560, 300 + i * 150)} x1="120" y1={y} x2="680" y2={y} />
        ))}
      </g>
      {/* doors */}
      <g stroke={stroke} strokeWidth="1.2">
        <line className="nv-draw" style={dash(90, 900)} x1="280" y1="350" x2="280" y2="440" />
        <line className="nv-draw" style={dash(90, 1000)} x1="400" y1="350" x2="400" y2="440" />
        <line className="nv-draw" style={dash(90, 1100)} x1="520" y1="350" x2="520" y2="440" />
      </g>
      {/* handles */}
      <g fill={brass}>
        {[220, 340, 460, 580].map((x, i) => (
          <circle key={x} cx={x} cy="395" r="3" className="nv-fade" style={{ animationDelay: `${1300 + i * 120}ms` }} />
        ))}
      </g>
      {/* dimension line + ticks */}
      <g stroke={stroke} strokeWidth="0.8" fill="hsl(var(--foreground) / 0.55)" fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="2">
        <line className="nv-draw" style={dash(560, 1500)} x1="120" y1="470" x2="680" y2="470" />
        <line className="nv-tick" style={{ animationDelay: "1700ms" }} x1="120" y1="464" x2="120" y2="476" />
        <line className="nv-tick" style={{ animationDelay: "1800ms" }} x1="400" y1="464" x2="400" y2="476" />
        <line className="nv-tick" style={{ animationDelay: "1900ms" }} x1="680" y1="464" x2="680" y2="476" />
        <text x="380" y="490" className="nv-fade" style={{ animationDelay: "2000ms" }}>3.20 m</text>
      </g>
    </svg>
  </Frame>
);

/* ============================================================
   06 — Éclairage & solutions connectées (lighting plan)
   ============================================================ */
const PlanLighting = ({ className = "" }: V) => (
  <Frame label="Éclairage · 06">
    <svg viewBox="0 0 800 520" className={`w-full h-full ${className}`} fill="none">
      <g stroke={stroke} strokeWidth="1.4">
        <path className="nv-draw" style={dash(1800, 0)} d="M100 100 H700 V420 H100 Z" />
      </g>
      {/* circuit lines */}
      <g stroke={brass} strokeWidth="0.8" strokeDasharray="3 5">
        <path className="nv-draw" style={dash(900, 400)} d="M100 220 H260 V160 H540 V260 H700" />
        <path className="nv-draw" style={dash(700, 700)} d="M100 360 H320 V300 H560 V340 H700" />
      </g>
      {/* spots with halos */}
      {[
        [200, 220], [400, 160], [540, 260], [260, 360], [440, 300], [600, 340],
      ].map(([cx, cy], i) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="22" fill={brass} opacity="0.06" className="nv-glow" style={{ animationDelay: `${i * 250}ms` }} />
          <circle cx={cx} cy={cy} r="14" fill={brass} opacity="0.10" className="nv-glow" style={{ animationDelay: `${i * 250 + 120}ms` }} />
          <circle cx={cx} cy={cy} r="4" fill="hsl(var(--background))" stroke={stroke} strokeWidth="1" />
          <circle cx={cx} cy={cy} r="1.5" fill={brass} />
        </g>
      ))}
    </svg>
  </Frame>
);

/* ============================================================
   07 — Finitions & matériaux (palette swatches)
   ============================================================ */
const PlanMaterials = ({ className = "" }: V) => {
  const swatches = [
    { x: 80,  fill: "hsl(36 22% 86%)", label: "PIERRE" },
    { x: 220, fill: "hsl(28 22% 60%)", label: "BOIS" },
    { x: 360, fill: "hsl(34 14% 78%)", label: "PLÂTRE" },
    { x: 500, fill: "hsl(36 38% 56%)", label: "LAITON" },
    { x: 640, fill: "hsl(213 14% 26%)", label: "ARDOISE" },
  ];
  return (
    <Frame label="Palette · 07">
      <svg viewBox="0 0 800 520" className={`w-full h-full ${className}`} fill="none">
        {swatches.map((s, i) => (
          <g key={s.x}>
            <rect
              x={s.x} y={140} width={120} height={200}
              fill={s.fill}
              stroke={stroke} strokeWidth="0.8"
              className="nv-fade"
              style={{ animationDelay: `${i * 180}ms`, transformOrigin: `${s.x + 60}px 240px` }}
            />
            <line className="nv-draw" style={dash(120, i * 180 + 400)} x1={s.x} y1={350} x2={s.x + 120} y2={350} stroke={stroke} strokeWidth="0.8" />
            <text
              x={s.x + 60} y={372}
              textAnchor="middle"
              fill="hsl(var(--foreground) / 0.65)"
              fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="2.5"
              className="nv-fade"
              style={{ animationDelay: `${i * 180 + 600}ms` }}
            >
              {s.label}
            </text>
            <text
              x={s.x} y={130}
              fill="hsl(var(--foreground) / 0.5)"
              fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="2"
              className="nv-fade"
              style={{ animationDelay: `${i * 180 + 700}ms` }}
            >
              {String(i + 1).padStart(2, "0")}
            </text>
          </g>
        ))}
      </svg>
    </Frame>
  );
};

/* ============================================================
   08 — Gestion de propriété (long-term care)
   ============================================================ */
const PlanStewardship = ({ className = "" }: V) => (
  <Frame label="Suivi · 08">
    <svg viewBox="0 0 800 520" className={`w-full h-full ${className}`} fill="none">
      {/* central property */}
      <g stroke={stroke} strokeWidth="1.4">
        <path className="nv-draw" style={dash(1100, 0)} d="M320 200 H480 V340 H320 Z" />
        <path className="nv-draw" style={dash(180, 600)} d="M320 200 L400 140 L480 200" />
      </g>
      {/* satellite nodes */}
      {[
        { cx: 140, cy: 160, label: "ARTISANS" },
        { cx: 660, cy: 160, label: "PROPRIÉTAIRE" },
        { cx: 140, cy: 400, label: "MAINTENANCE" },
        { cx: 660, cy: 400, label: "TECHNIQUE" },
      ].map((n, i) => (
        <g key={n.label}>
          <line
            className="nv-draw"
            style={dash(360, 800 + i * 200)}
            x1={n.cx} y1={n.cy}
            x2={n.cx < 400 ? 320 : 480}
            y2={n.cy < 270 ? 200 : 340}
            stroke={brass} strokeWidth="0.8" strokeDasharray="3 5"
          />
          <circle cx={n.cx} cy={n.cy} r="22" fill="hsl(var(--background))" stroke={stroke} strokeWidth="1" />
          <circle cx={n.cx} cy={n.cy} r="4" fill={brass} className="nv-pulse" style={{ animationDelay: `${i * 300}ms` }} />
          <text
            x={n.cx} y={n.cy + (n.cy < 270 ? -34 : 44)}
            textAnchor="middle"
            fill="hsl(var(--foreground) / 0.6)"
            fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="2.5"
            className="nv-fade" style={{ animationDelay: `${1200 + i * 200}ms` }}
          >
            {n.label}
          </text>
        </g>
      ))}
      {/* checks */}
      <g stroke={brass} strokeWidth="1.2" fill="none" strokeLinecap="round">
        {[0, 1, 2, 3].map((i) => (
          <path key={i}
            className="nv-draw" style={dash(20, 1800 + i * 200)}
            d={`M ${340 + i * 30} 280 l 5 6 l 10 -12`} />
        ))}
      </g>
    </svg>
  </Frame>
);

/* ============================================================
   09 — Consultancy (advisory hub: 3 strategic paths)
   ============================================================ */
const PlanConsultancy = ({ className = "" }: V) => {
  // Central advisor hub on the left, three radiating advisory paths.
  const cx = 200;
  const cy = 260;
  const paths = [
    { x: 660, y: 130, label: "PROPERTY FINDER", ref: "I" },
    { x: 700, y: 260, label: "RENOVATION",      ref: "II" },
    { x: 660, y: 390, label: "MARKET KNOWLEDGE", ref: "III" },
  ];
  return (
    <Frame label="Conseil · 09">
      <svg viewBox="0 0 800 520" className={`w-full h-full ${className}`} fill="none">
        {/* horizon guides */}
        <g stroke={strokeFaint} strokeWidth="0.5">
          <line className="nv-draw" style={dash(640, 0)}   x1="80"  y1="90"  x2="720" y2="90" />
          <line className="nv-draw" style={dash(640, 200)} x1="80"  y1="430" x2="720" y2="430" />
        </g>

        {/* concentric advisor halo */}
        <g stroke={stroke} strokeWidth="1">
          <circle className="nv-draw" style={dash(440, 100)} cx={cx} cy={cy} r="70" />
        </g>
        <g stroke={strokeFaint} strokeWidth="0.6">
          <circle className="nv-draw" style={dash(640, 250)} cx={cx} cy={cy} r="100" />
          <circle className="nv-draw" style={dash(880, 400)} cx={cx} cy={cy} r="138" />
        </g>

        {/* advisor compass cross */}
        <g stroke={stroke} strokeWidth="1">
          <line className="nv-draw" style={dash(80, 600)} x1={cx - 40} y1={cy} x2={cx + 40} y2={cy} />
          <line className="nv-draw" style={dash(80, 700)} x1={cx} y1={cy - 40} x2={cx} y2={cy + 40} />
        </g>
        <circle cx={cx} cy={cy} r="5" fill={brass} className="nv-pulse" />

        {/* advisor label */}
        <g fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="2.5"
           fill="hsl(var(--foreground) / 0.6)">
          <text x={cx} y={cy - 88} textAnchor="middle"
                className="nv-fade" style={{ animationDelay: "900ms" }}>
            ADVISOR
          </text>
          <text x={cx} y={cy + 100} textAnchor="middle" letterSpacing="3"
                fill="hsl(var(--foreground) / 0.45)" fontSize="8"
                className="nv-fade" style={{ animationDelay: "1100ms" }}>
            NEOVA · CONSEIL
          </text>
        </g>

        {/* three advisory paths */}
        {paths.map((p, i) => {
          const delay = 800 + i * 220;
          // start on the rim of the inner halo, in the direction of the target
          const dx = p.x - cx;
          const dy = p.y - cy;
          const len = Math.hypot(dx, dy);
          const sx = cx + (dx / len) * 70;
          const sy = cy + (dy / len) * 70;
          // gentle curve via a control point pulled toward horizontal
          const mx = (sx + p.x) / 2;
          const my = (sy + p.y) / 2 + (i === 1 ? 0 : (i === 0 ? -22 : 22));
          const d = `M ${sx} ${sy} Q ${mx} ${my} ${p.x - 26} ${p.y}`;
          return (
            <g key={p.label}>
              {/* dashed advisory line */}
              <path
                className="nv-draw"
                style={dash(560, delay)}
                d={d}
                stroke={brass} strokeWidth="0.9" strokeDasharray="3 5"
              />
              {/* terminal node */}
              <circle cx={p.x} cy={p.y} r="22" fill="hsl(var(--background))" stroke={stroke} strokeWidth="1" />
              <circle cx={p.x} cy={p.y} r="11" fill="none" stroke={strokeFaint} strokeWidth="0.6" />
              <circle cx={p.x} cy={p.y} r="4"  fill={brass}
                      className="nv-pulse" style={{ animationDelay: `${delay + 400}ms` }} />
              {/* roman numeral inside the node halo */}
              <text x={p.x} y={p.y - 32} textAnchor="middle"
                    fontFamily="Inter, sans-serif" fontSize="8" letterSpacing="2"
                    fill="hsl(var(--foreground) / 0.45)"
                    className="nv-fade" style={{ animationDelay: `${delay + 600}ms` }}>
                {p.ref}
              </text>
              {/* underline + label */}
              <line
                className="nv-tick"
                style={{ animationDelay: `${delay + 700}ms` }}
                x1={p.x - 56} y1={p.y + 40}
                x2={p.x + 56} y2={p.y + 40}
                stroke={stroke} strokeWidth="0.8"
              />
              <text x={p.x} y={p.y + 54} textAnchor="middle"
                    fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="2.5"
                    fill="hsl(var(--foreground) / 0.65)"
                    className="nv-fade" style={{ animationDelay: `${delay + 800}ms` }}>
                {p.label}
              </text>
            </g>
          );
        })}

        {/* corner reference glyph */}
        <g fontFamily="Inter, sans-serif" fontSize="8" letterSpacing="3"
           fill="hsl(var(--foreground) / 0.4)">
          <text x="80" y="78" className="nv-fade" style={{ animationDelay: "1500ms" }}>
            STRATÉGIE
          </text>
          <text x="720" y="78" textAnchor="end"
                className="nv-fade" style={{ animationDelay: "1700ms" }}>
            DÉCISION
          </text>
        </g>
      </svg>
    </Frame>
  );
};

/* ============================================================
   Registry
   ============================================================ */
export const ServiceVisuals = [
  PlanRenovation,
  PlanSchedule,
  PlanInterior,
  PlanTechnical,
  PlanJoinery,
  PlanLighting,
  PlanMaterials,
  PlanStewardship,
  PlanConsultancy,
];