import { useEffect, useRef, useState } from "react";
import { ServiceVisuals } from "./ServiceVisuals";
import { useI18n } from "@/i18n/I18nProvider";

type Item = { t: string; d: string };

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: readonly Item[];
  visualIndices?: readonly number[];
};

export const ServicesShowcase = ({ eyebrow, title, subtitle, items, visualIndices }: Props) => {
  const resolveVisual = (index: number) =>
    ServiceVisuals[visualIndices?.[index] ?? index] ?? ServiceVisuals[0];
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const [openMobile, setOpenMobile] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Subtle 3D tilt on mouse move (desktop)
  const onMove = (e: React.MouseEvent) => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 3, y: px * 3 });
  };
  const onLeave = () => setTilt({ x: 0, y: 0 });

  // Replay animation when active changes by remounting the visual via key.
  const ActiveVisual = resolveVisual(active);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!stageRef.current) return;
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      const inside = (document.activeElement as HTMLElement | null)?.closest("[data-services-showcase]");
      if (!inside) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(items.length - 1, i + 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length]);

  return (
    <section
      data-services-showcase
      className="relative py-28 md:py-40 panel-stone border-t border-hairline overflow-hidden"
    >
      <div className="container-editorial">
        {/* Header */}
        <div className="grid md:grid-cols-12 gap-x-12 gap-y-10 mb-16 md:mb-24 items-end">
          <div className="md:col-span-8 reveal">
            <p className="eyebrow mb-5">{eyebrow}</p>
            <h2 className="display-lg text-balance">{title}</h2>
            <p className="mt-8 max-w-xl body-lg">{subtitle}</p>
          </div>
          <div className="md:col-span-4 md:text-right reveal">
            <p className="numeral text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              {String(active + 1).padStart(2, "0")} <span className="text-foreground/30 mx-1">/</span> {String(items.length).padStart(2, "0")}
            </p>
          </div>
        </div>

        {/* Desktop: split selector + visual stage */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-12 reveal">
          {/* LEFT — vertical service selector */}
          <ul className="lg:col-span-5 relative">
            <span className="absolute left-0 top-0 bottom-0 w-px bg-hairline" aria-hidden />
            {items.map((s, i) => {
              const isActive = i === active;
              return (
                <li key={s.t} className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    aria-pressed={isActive}
                    className="w-full text-left py-6 pl-8 pr-4 group relative transition-colors duration-700"
                  >
                    {/* Active indicator bar */}
                    <span
                      className="absolute left-0 top-0 bottom-0 w-px bg-foreground origin-top transition-transform duration-700"
                      style={{ transform: isActive ? "scaleY(1)" : "scaleY(0)" }}
                      aria-hidden
                    />
                    <div className="flex items-baseline gap-6">
                      <span
                        className={`numeral text-xs tracking-[0.2em] transition-colors duration-700 ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3
                        className={`font-display text-[24px] xl:text-[28px] leading-tight transition-all duration-700 ${
                          isActive ? "text-foreground translate-x-1" : "text-foreground/55 group-hover:text-foreground/85"
                        }`}
                      >
                        {s.t}
                      </h3>
                    </div>
                    {/* Description reveals only when active */}
                    <div
                      className="grid transition-[grid-template-rows,opacity] duration-700"
                      style={{
                        gridTemplateRows: isActive ? "1fr" : "0fr",
                        opacity: isActive ? 1 : 0,
                      }}
                    >
                      <div className="overflow-hidden">
                        <p className="pt-4 pl-12 max-w-md text-[14.5px] leading-[1.7] text-slate-soft">{s.d}</p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* RIGHT — interactive visual stage */}
          <div
            className="lg:col-span-7"
            style={{ perspective: "1400px" }}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
          >
            <div
              ref={stageRef}
              className="relative aspect-[5/4] xl:aspect-[4/3] bg-background border border-hairline transition-transform duration-500 ease-out"
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transformStyle: "preserve-3d",
                boxShadow: "var(--shadow-image)",
              }}
            >
              {/* Top bar — drawing sheet caption */}
              <div className="absolute top-0 inset-x-0 flex items-center justify-between px-6 py-4 border-b border-hairline">
                <div className="flex items-center gap-3">
                  <span className="block w-1.5 h-1.5 rounded-full bg-brass" />
                  <span className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Neova · Atelier</span>
                </div>
                <span className="numeral text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Pl. {String(active + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Visual area */}
              <div className="absolute inset-0 pt-12">
                <div key={active} className="w-full h-full px-6 pb-12">
                  <ActiveVisual />
                </div>
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-0 inset-x-0 px-6 py-4 border-t border-hairline flex items-end justify-between gap-4 bg-background/90 backdrop-blur-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">{t.common.labels.service}</p>
                  <p className="font-display text-[20px] leading-tight mt-1">{items[active].t}</p>
                </div>
                <div className="hidden xl:flex items-center gap-2">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      aria-label={`Service ${i + 1}`}
                      className={`h-px transition-all duration-700 ${i === active ? "w-8 bg-foreground" : "w-4 bg-foreground/25 hover:bg-foreground/50"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile / tablet: accordion */}
        <div className="lg:hidden space-y-3">
          {items.map((s, i) => {
            const isOpen = openMobile === i;
            const Visual = resolveVisual(i);
            return (
              <div key={s.t} className="border border-hairline bg-background">
                <button
                  type="button"
                  onClick={() => setOpenMobile(isOpen ? -1 : i)}
                  className="w-full flex items-baseline justify-between gap-6 px-5 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-baseline gap-5">
                    <span className="numeral text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-[20px] leading-tight">{s.t}</span>
                  </div>
                  <span
                    className="block w-3 h-px bg-foreground transition-transform duration-500"
                    style={{ transform: isOpen ? "rotate(0deg)" : "rotate(90deg)" }}
                    aria-hidden
                  />
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-700"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-6">
                      <p className="text-[14.5px] leading-[1.7] text-slate-soft">{s.d}</p>
                      <div className="mt-5 aspect-[5/4] border border-hairline bg-background">
                        {isOpen && <div key={`m-${i}`} className="w-full h-full p-3"><Visual /></div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};