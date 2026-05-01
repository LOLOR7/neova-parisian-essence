import { useEffect, useRef, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { useI18n } from "@/i18n/I18nProvider";
import moulding from "@/assets/detail-moulding.jpg";
import after1 from "@/assets/after-real.jpg";
import after2 from "@/assets/after-2.jpg";
import kleber from "@/assets/project-kleber.jpg";
import georgeV from "@/assets/project-george-v.jpg";
import victorHugo from "@/assets/project-victor-hugo.jpg";

const Method = () => {
  const { t } = useI18n();
  const stepImages = [moulding, after1, kleber, after2, georgeV, victorHugo];

  const stepsRef = useRef<HTMLOListElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const els = stepsRef.current?.querySelectorAll<HTMLElement>("[data-step]");
    if (!els || !els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.step);
            if (!Number.isNaN(idx)) setActiveStep(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [t.home.richSteps.length]);

  return (
    <SiteShell>
      <PageHero eyebrow={t.common.eyebrow.method} index="IV" title={t.method.title} />

      <section className="py-20 md:py-28 bg-background">
        <div className="container-editorial">
          <div className="max-w-2xl mb-20 reveal">
            <p className="eyebrow mb-5">{t.common.eyebrow.method}</p>
            <h2 className="display-lg text-balance">{t.home.methodTitle}</h2>
            <p className="mt-8 body-lg max-w-xl">{t.home.methodSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-12 gap-10 lg:gap-16">
            <aside className="hidden md:block md:col-span-5">
              <div className="sticky top-28">
                <div className="relative aspect-[3/4] overflow-hidden border border-hairline bg-background">
                  {stepImages.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms]"
                      style={{ opacity: activeStep === i ? 1 : 0, transform: activeStep === i ? "scale(1.02)" : "scale(1.06)" }}
                    />
                  ))}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.32em] bg-background/90 text-foreground px-3 py-2">
                      Étape {String(activeStep + 1).padStart(2, "0")}
                    </span>
                    <span className="numeral text-[10px] uppercase tracking-[0.28em] bg-background/90 text-foreground px-3 py-2">
                      {String(activeStep + 1).padStart(2, "0")} / {String(t.home.richSteps.length).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-background/90 px-4 py-3">
                    <p className="font-display text-lg leading-tight">{t.home.richSteps[activeStep].t}</p>
                  </div>
                </div>
                <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                  Atelier · Détail · Paris
                </p>
              </div>
            </aside>

            <ol ref={stepsRef} className="md:col-span-7 relative">
              <span className="absolute left-[14px] top-2 bottom-2 w-px bg-hairline" aria-hidden />
              <span
                className="absolute left-[14px] top-2 w-px bg-foreground transition-[height] duration-1000"
                style={{ height: `${((activeStep + 1) / t.home.richSteps.length) * 100}%` }}
                aria-hidden
              />
              {t.home.richSteps.map((s, i) => {
                const isActive = i <= activeStep;
                const isCurrent = i === activeStep;
                return (
                  <li
                    key={s.t}
                    data-step={i}
                    className="reveal relative pl-12 md:pl-16 pb-14 md:pb-24 last:pb-0 group"
                    style={{ transitionDelay: `${i * 90}ms` }}
                  >
                    <span
                      className={`absolute left-0 top-1.5 w-7 h-7 rounded-full border flex items-center justify-center text-[10px] tracking-[0.18em] numeral transition-all duration-700 ${
                        isCurrent
                          ? "bg-foreground text-background border-foreground scale-110"
                          : isActive
                            ? "bg-foreground/85 text-background border-foreground"
                            : "bg-background text-foreground/60 border-hairline"
                      }`}
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex items-baseline gap-4">
                      <p className={`eyebrow transition-colors duration-700 ${isCurrent ? "text-foreground" : ""}`}>
                        Étape {String(i + 1).padStart(2, "0")}
                      </p>
                      <span className="h-px flex-1 bg-hairline" />
                    </div>
                    <h3
                      className={`font-display text-[26px] md:text-[32px] leading-tight mt-4 transition-all duration-700 ${
                        isCurrent ? "text-foreground translate-x-1" : "text-foreground/55"
                      }`}
                    >
                      {s.t}
                    </h3>
                    <p
                      className={`mt-4 max-w-md text-[15px] leading-[1.75] transition-colors duration-700 ${
                        isCurrent ? "text-slate-soft" : "text-slate-soft/60"
                      }`}
                    >
                      {s.d}
                    </p>

                    <div className="md:hidden mt-6 image-frame aspect-[16/10]">
                      <img src={stepImages[i]} alt="" loading="lazy" className="w-full h-full object-cover" />
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>
    </SiteShell>
  );
};

export default Method;
