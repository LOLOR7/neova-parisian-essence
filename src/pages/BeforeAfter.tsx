import { useState, useRef, MouseEvent, TouchEvent } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import before1 from "@/assets/before-1.jpg";
import after1 from "@/assets/after-1.jpg";
import before2 from "@/assets/before-2.jpg";
import after2 from "@/assets/after-2.jpg";

const Compare = ({ before, after, label }: { before: string; after: string; label: string }) => {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const set = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <figure className="reveal">
      <div
        ref={ref}
        className="relative aspect-[4/3] overflow-hidden bg-muted select-none cursor-ew-resize"
        onMouseMove={(e: MouseEvent) => e.buttons === 1 && set(e.clientX)}
        onMouseDown={(e: MouseEvent) => set(e.clientX)}
        onTouchMove={(e: TouchEvent) => set(e.touches[0].clientX)}
      >
        <img src={after} alt={`${label} après`} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
          <img src={before} alt={`${label} avant`} loading="lazy" className="absolute inset-0 w-full h-full object-cover" style={{ width: `${100 / (pos / 100)}%`, maxWidth: "none" }} />
        </div>
        <span className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.3em] bg-background/90 px-3 py-1.5">Avant</span>
        <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.3em] bg-foreground text-background px-3 py-1.5">Après</span>
        <div className="absolute top-0 bottom-0 w-px bg-background pointer-events-none" style={{ left: `${pos}%` }}>
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-background border border-hairline flex items-center justify-center text-foreground text-xs">↔</div>
        </div>
      </div>
      <figcaption className="mt-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</figcaption>
    </figure>
  );
};

const BeforeAfter = () => (
  <SiteShell>
    <PageHero eyebrow="Avant / Après" title="La transformation, révélée avec précision." />
    <Section>
      <div className="space-y-24">
        <Compare before={before1} after={after1} label="Paris VII — Salon" />
        <Compare before={before2} after={after2} label="Paris VIII — Cuisine" />
      </div>
    </Section>
  </SiteShell>
);

export default BeforeAfter;
