import { useEffect, useRef, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { useI18n } from "@/i18n/I18nProvider";
import step1 from "@/assets/method/step-1.jpg";
import step2 from "@/assets/method/step-2.jpg";
import step3 from "@/assets/method/step-3.jpg";
import step4 from "@/assets/method/step-4.jpg";
import step5 from "@/assets/method/step-5.jpg";
import step6 from "@/assets/method/step-6.jpg";

const Method = () => {
  const { t } = useI18n();
  const stepImages = [step1, step2, step3, step4, step5, step6];

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

          <div>
            <ol ref={stepsRef} className="relative">
              {t.home.richSteps.map((s, i) => {
                const isActive = i <= activeStep;
                const isCurrent = i === activeStep;
                return (
                  <li
                    key={s.t}
                    data-step={i}
                    className="reveal grid md:grid-cols-12 gap-8 lg:gap-16 pb-14 md:pb-24 last:pb-0 group"
                    style={{ transitionDelay: `${i * 90}ms` }}
                  >
                    <div className="hidden md:block md:col-span-5">
                      <div className="relative aspect-[16/10] overflow-hidden border border-hairline bg-background">
                        <img src={stepImages[i]} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]" />
                        <div className="absolute bottom-4 left-4 right-4 bg-background/90 px-4 py-3">
                          <p className="font-display text-lg leading-tight">{s.t}</p>
                        </div>
                      </div>
                      <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                        {t.common.labels.atelierTag}
                      </p>
                    </div>

                    <div className="relative md:col-span-7 pl-12 md:pl-16">
                      <span
                        className={`absolute left-[14px] top-2 bottom-[-3.5rem] md:bottom-[-6rem] w-px transition-colors duration-700 ${
                          i < activeStep ? "bg-foreground" : "bg-hairline"
                        } ${i === t.home.richSteps.length - 1 ? "hidden" : ""}`}
                        aria-hidden
                      />
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
                          {t.common.labels.step} {String(i + 1).padStart(2, "0")}
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
