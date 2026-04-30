import { useState, useRef, MouseEvent, TouchEvent } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { useI18n } from "@/i18n/I18nProvider";
import before1 from "@/assets/before-1.jpg";
import after1 from "@/assets/after-1.jpg";
import before2 from "@/assets/before-2.jpg";
import after2 from "@/assets/after-2.jpg";

const Compare = ({ before, after, label, beforeLabel, afterLabel }: { before: string; after: string; label: string; beforeLabel: string; afterLabel: string }) => {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const set = (x: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)));
  };
  return (
    <figure className="reveal">
      <div
        ref={ref}
        className="relative aspect-[4/3] overflow-hidden bg-bone select-none cursor-ew-resize"
        onMouseMove={(e: MouseEvent) => e.buttons === 1 && set(e.clientX)}
        onMouseDown={(e: MouseEvent) => set(e.clientX)}
        onTouchMove={(e: TouchEvent) => set(e.touches[0].clientX)}
      >
        <img src={after} alt={`${label} after`} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
          <img src={before} alt={`${label} before`} loading="lazy" className="absolute inset-0 h-full object-cover" style={{ width: `${(100 / pos) * 100}%`, maxWidth: "none" }} />
        </div>
        <span className="absolute top-5 left-5 text-[10px] uppercase tracking-[0.3em] bg-background/90 px-3 py-2">{beforeLabel}</span>
        <span className="absolute top-5 right-5 text-[10px] uppercase tracking-[0.3em] bg-foreground text-background px-3 py-2">{afterLabel}</span>
        <div className="absolute top-0 bottom-0 w-px bg-background pointer-events-none" style={{ left: `${pos}%` }}>
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 bg-background border border-hairline flex items-center justify-center text-foreground text-xs">↔</div>
        </div>
      </div>
      <figcaption className="mt-5 text-[10.5px] uppercase tracking-[0.28em] text-muted-foreground">{label}</figcaption>
    </figure>
  );
};

const BeforeAfter = () => {
  const { t } = useI18n();
  return (
    <SiteShell>
      <PageHero
        eyebrow={t.common.eyebrow.beforeAfter}
        index="VI"
        title={<>{t.beforeAfter.title.l1}<br/><em className="display-italic">{t.beforeAfter.title.l2}</em></>}
      />
      <Section>
        <div className="space-y-28">
          <Compare before={before1} after={after1} label={t.beforeAfter.captions[0]} beforeLabel={t.common.labels.before} afterLabel={t.common.labels.after} />
          <Compare before={before2} after={after2} label={t.beforeAfter.captions[1]} beforeLabel={t.common.labels.before} afterLabel={t.common.labels.after} />
        </div>
      </Section>
    </SiteShell>
  );
};

export default BeforeAfter;
