import { useEffect, useRef, useState } from "react";

interface SlicedRevealProps {
  image: string;
  alt?: string;
  eyebrow: string;
  title: { l1: string; l2: string };
  body: string;
  closing: string;
  sideLabel?: string;
  pageNumber?: string;
}

/**
 * Editorial sliced-image brand statement.
 * Three vertical panels show aligned crops of the same image,
 * staggered vertically, with subtle mouse-driven parallax and
 * scroll-triggered clip-path reveal.
 */
export const SlicedReveal = ({
  image,
  alt = "",
  eyebrow,
  title,
  body,
  closing,
  sideLabel = "PARIS · NEOVA · RÉNOVATION",
  pageNumber = "01 / 08",
}: SlicedRevealProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setParallax({ x: px * 8, y: py * 8 });
  };
  const onLeave = () => setParallax({ x: 0, y: 0 });

  // Each panel uses a different horizontal slice of the same image
  // by shifting object-position; vertical stagger via translateY.
  const panels = [
    { pos: "0% center", offsetY: "-32px", delay: 0, parX: 0.6, parY: 0.8 },
    { pos: "50% center", offsetY: "0px", delay: 180, parX: -0.4, parY: 0.5 },
    { pos: "100% center", offsetY: "32px", delay: 360, parX: 0.5, parY: -0.6 },
  ];

  return (
    <section className="relative py-28 md:py-44 bg-background overflow-hidden">
      {/* faint architectural grid */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
        }}
      />

      <div className="container-editorial relative grid md:grid-cols-12 gap-x-10 lg:gap-x-16 gap-y-20 items-center">
        {/* IMAGE COMPOSITION */}
        <div
          ref={wrapRef}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className="md:col-span-7 relative"
        >
          {/* vertical side label */}
          <div className="hidden md:flex absolute -left-2 top-0 bottom-0 items-center pointer-events-none z-10">
            <span
              className="text-[10px] tracking-[0.42em] text-muted-foreground whitespace-nowrap"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {sideLabel}
            </span>
          </div>

          {/* page number */}
          <div className="absolute -top-8 right-0 flex items-center gap-3 z-10">
            <span
              className="h-px bg-foreground/40 transition-[width] duration-[1400ms] ease-out"
              style={{ width: visible ? "56px" : "0px" }}
            />
            <span className="numeral text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              {pageNumber}
            </span>
          </div>

          {/* panels grid */}
          <div className="relative grid grid-cols-3 gap-2 md:gap-3 md:pl-10">
            {panels.map((p, i) => (
              <div
                key={i}
                className="relative aspect-[2/5] overflow-hidden bg-muted"
                style={{
                  transform: visible
                    ? `translate3d(${parallax.x * p.parX}px, calc(${p.offsetY} + ${parallax.y * p.parY}px), 0)`
                    : `translate3d(0, calc(${p.offsetY} + 24px), 0)`,
                  opacity: visible ? 1 : 0,
                  clipPath: visible
                    ? "inset(0% 0% 0% 0%)"
                    : "inset(100% 0% 0% 0%)",
                  transition: `transform 1500ms cubic-bezier(.22,.61,.36,1) ${p.delay}ms, opacity 1200ms ease ${p.delay}ms, clip-path 1600ms cubic-bezier(.22,.61,.36,1) ${p.delay}ms`,
                }}
              >
                <img
                  src={image}
                  alt={i === 1 ? alt : ""}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out hover:scale-[1.04]"
                  style={{ objectPosition: p.pos, transform: "scale(1.02)" }}
                />
                {/* hairline border */}
                <span className="absolute inset-0 border border-foreground/10 pointer-events-none" />
              </div>
            ))}

            {/* drawn architectural lines */}
            <span
              aria-hidden
              className="absolute -top-4 left-0 h-px bg-foreground/30 transition-[width] duration-[1600ms] ease-out"
              style={{ width: visible ? "calc(100% - 0px)" : "0%", transitionDelay: "200ms" }}
            />
            <span
              aria-hidden
              className="absolute -bottom-4 left-0 h-px bg-foreground/30 transition-[width] duration-[1600ms] ease-out"
              style={{ width: visible ? "100%" : "0%", transitionDelay: "500ms" }}
            />
            <span
              aria-hidden
              className="absolute -top-4 -bottom-4 left-1/3 w-px bg-foreground/15 transition-transform duration-[1600ms] ease-out origin-top"
              style={{ transform: visible ? "scaleY(1)" : "scaleY(0)", transitionDelay: "700ms" }}
            />
            <span
              aria-hidden
              className="absolute -top-4 -bottom-4 left-2/3 w-px bg-foreground/15 transition-transform duration-[1600ms] ease-out origin-bottom"
              style={{ transform: visible ? "scaleY(1)" : "scaleY(0)", transitionDelay: "900ms" }}
            />
          </div>

          {/* caption under panels */}
          <div className="mt-10 md:pl-10 flex items-center gap-4">
            <span
              className="h-px bg-[hsl(var(--brass))] transition-[width] duration-[1400ms] ease-out"
              style={{ width: visible ? "48px" : "0", transitionDelay: "800ms" }}
            />
            <p className="text-[10.5px] uppercase tracking-[0.32em] text-muted-foreground">
              Détail · Atelier · Paris VIIIᵉ
            </p>
          </div>
        </div>

        {/* TEXT BLOCK */}
        <div
          className="md:col-span-5 md:pl-4 lg:pl-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 1200ms ease 250ms, transform 1200ms cubic-bezier(.22,.61,.36,1) 250ms",
          }}
        >
          <div className="flex items-center gap-4 mb-7">
            <span
              className="h-px bg-[hsl(var(--brass))] transition-[width] duration-[1400ms] ease-out"
              style={{ width: visible ? "56px" : "0", transitionDelay: "350ms" }}
            />
            <p className="eyebrow !mb-0">{eyebrow}</p>
          </div>

          <h2 className="display-lg text-balance">
            {title.l1}
            <br />
            <em className="display-italic">{title.l2}</em>
          </h2>

          <div className="mt-10 space-y-6 max-w-md">
            {body.split(/\n+/).map((para, i) => (
              <p
                key={i}
                className="body-lg"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(12px)",
                  transition: `opacity 900ms ease ${500 + i * 140}ms, transform 900ms ease ${500 + i * 140}ms`,
                }}
              >
                {para}
              </p>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-hairline max-w-md">
            <p className="text-[12px] uppercase tracking-[0.28em] text-foreground/70 leading-[1.9]">
              {closing}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SlicedReveal;