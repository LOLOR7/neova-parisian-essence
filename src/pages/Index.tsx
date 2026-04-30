import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { useI18n } from "@/i18n/I18nProvider";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { ServicesShowcase } from "@/components/site/ServicesShowcase";
import { SlicedReveal } from "@/components/site/SlicedReveal";
import moulding from "@/assets/detail-moulding.jpg";
import rooftops from "@/assets/paris-rooftops.jpg";
import before1 from "@/assets/before-real.jpg";
import after1 from "@/assets/after-real.jpg";
import after2 from "@/assets/after-2.jpg";
import before2 from "@/assets/before-real-2.jpg";
import after2Real from "@/assets/after-real-2.jpg";
import victorHugo from "@/assets/project-victor-hugo.jpg";
import kleber from "@/assets/project-kleber.jpg";
import georgeV from "@/assets/project-george-v.jpg";
import marceau from "@/assets/project-marceau.jpg";
import grandPalais from "@/assets/project-grand-palais.jpg";
import { projects } from "@/data/projects";

const Index = () => {
  const { t, lang } = useI18n();

  const stepImages = [moulding, after1, kleber, after2, georgeV, victorHugo];

  // Scroll-driven Method timeline
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
      {/* HERO */}
      <section className="relative h-[calc(100svh-72px)] md:h-[calc(100svh-84px)] min-h-[560px] flex items-end overflow-hidden bg-foreground">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center top", transform: "scale(1.08)", transformOrigin: "center top" }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster=""
        >
          <source src="/hero-renovation.mp4" type="video/mp4" />
        </video>
        {/* Subtle readability overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-foreground/15 to-foreground/10" />
        <div className="container-editorial relative pb-16 md:pb-24 text-background">
          <p className="eyebrow !text-background/85 mb-6 md:mb-8 animate-fade-in">
            {t.common.eyebrow.studio}
          </p>
          <h1 className="display-xl max-w-5xl text-background animate-fade-up text-balance">
            {t.home.heroTitle.l1}<br/><em className="display-italic">{t.home.heroTitle.l2}</em>
          </h1>
          <p className="mt-8 md:mt-10 max-w-xl text-background/90 text-[15px] md:text-[17px] leading-[1.75] animate-fade-up" style={{ animationDelay: "0.2s" }}>
            {t.home.heroIntro}
          </p>
          <div className="mt-10 md:mt-12 flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <Link to="/contact" className="btn-line-light">Démarrer un projet</Link>
            <Link to="/projects" className="btn-line-light">Découvrir nos réalisations</Link>
          </div>
        </div>
      </section>

      {/* BRAND STATEMENT — sliced editorial reveal */}
      <SlicedReveal
        image={moulding}
        alt="Détail de moulure haussmannienne, appartement parisien"
        eyebrow={t.home.brandEyebrow}
        title={t.home.brandTitle}
        body={t.home.brandText}
        closing={t.home.brandSecondary}
        sideLabel="PARIS · NEOVA · RÉNOVATION"
        pageNumber="01 / 08"
      />

      {/* SERVICES — signature interactive showcase */}
      <ServicesShowcase
        eyebrow={t.common.eyebrow.services}
        title={t.home.servicesTitle}
        subtitle={t.home.servicesSubtitle}
        items={t.home.richServices}
      />

      {/* METHOD — scroll-driven cinematic timeline */}
      <section className="py-28 md:py-40 bg-background border-t border-hairline">
        <div className="container-editorial">
          <div className="max-w-2xl mb-20 reveal">
            <p className="eyebrow mb-5">{t.common.eyebrow.method}</p>
            <h2 className="display-lg text-balance">{t.home.methodTitle}</h2>
            <p className="mt-8 body-lg max-w-xl">{t.home.methodSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-12 gap-10 lg:gap-16">
            {/* Sticky cinematic frame — image swaps with active step */}
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

            {/* Timeline with progressive line */}
            <ol ref={stepsRef} className="md:col-span-7 relative">
              <span className="absolute left-[14px] top-2 bottom-2 w-px bg-hairline" aria-hidden />
              <span
                className="absolute left-[14px] top-2 w-px bg-foreground transition-[height] duration-1000"
                style={{
                  height: `${((activeStep + 1) / t.home.richSteps.length) * 100}%`,
                }}
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

                    {/* Mobile image */}
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

      {/* LIFECYCLE — Avant / Pendant / Après */}
      <section className="py-28 md:py-40 panel-stone border-t border-hairline">
        <div className="container-editorial">
          <div className="max-w-2xl mb-20 reveal">
            <p className="eyebrow mb-5">Cycle du projet</p>
            <h2 className="display-lg text-balance">{t.home.lifecycleTitle}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {t.home.lifecycle.map((p, i) => {
              const imgs = [rooftops, before1, after1];
              return (
                <article
                  key={p.label}
                  className="reveal group relative overflow-hidden bg-background border border-hairline"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="image-frame aspect-[4/5]">
                    <img src={imgs[i]} alt="" loading="lazy" className="img-parallax w-full h-full object-cover" />
                  </div>
                  <div className="p-7 md:p-9">
                    <p className="eyebrow-brass mb-4">{p.label}</p>
                    <h3 className="font-display text-[24px] leading-tight">{p.title}</h3>
                    <p className="mt-4 text-[14.5px] leading-[1.7] text-slate-soft">{p.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="py-28 md:py-40 bg-background border-t border-hairline">
        <div className="container-editorial">
          <div className="grid md:grid-cols-12 gap-x-12 gap-y-10 mb-20 items-end">
            <div className="md:col-span-8 reveal">
              <p className="eyebrow mb-5">{t.common.eyebrow.projects}</p>
              <h2 className="display-lg text-balance">{t.home.projectsTitle}</h2>
              <p className="mt-8 body-lg max-w-xl">{t.home.projectsSubtitle}</p>
            </div>
            <div className="md:col-span-4 md:text-right reveal">
              <Link to="/projects" className="text-[10.5px] uppercase tracking-[0.28em] link-underline">{t.common.cta.all} →</Link>
            </div>
          </div>
          <div className="grid md:grid-cols-12 gap-x-8 gap-y-24">
            {projects.slice(0, 4).map((p, i) => (
              <Link
                key={p.slug}
                to={`/projects/${p.slug}`}
                className={`group reveal ${
                  i === 0 ? "md:col-span-7" :
                  i === 1 ? "md:col-span-5 md:mt-32" :
                  i === 2 ? "md:col-span-5" :
                  "md:col-span-7 md:mt-16"
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="image-frame aspect-[4/5] relative">
                  <img src={p.image} alt={p.name} loading="lazy" className="img-parallax w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 flex items-end justify-between text-background opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                       style={{ background: "linear-gradient(180deg, hsl(213 28% 14% / 0) 0%, hsl(213 28% 14% / 0.55) 100%)" }}>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-background/80">{p.location[lang]}</p>
                      <p className="font-display text-2xl mt-1">{p.surface}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-between items-start">
                  <div>
                    <p className="numeral text-xs text-muted-foreground">{p.index}</p>
                    <p className="font-display text-2xl mt-1">{p.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground mt-3">{p.location[lang]} · {p.surface}</p>
                  </div>
                  <ArrowUpRight size={18} strokeWidth={1.2} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-700" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER — comparison slider */}
      <section className="py-28 md:py-40 panel-stone border-t border-hairline">
        <div className="container-editorial">
          <div className="grid md:grid-cols-12 gap-x-12 gap-y-10 mb-16 items-end">
            <div className="md:col-span-8 reveal">
              <p className="eyebrow mb-5">{t.common.eyebrow.beforeAfter}</p>
              <h2 className="display-lg text-balance">
                {t.home.baTitle.l1}<br/><em className="display-italic">{t.home.baTitle.l2}</em>
              </h2>
              <p className="mt-8 max-w-xl body-lg">{t.home.baSubtitle}</p>
            </div>
            <div className="md:col-span-4 md:text-right reveal">
              <p className="text-[10.5px] uppercase tracking-[0.28em] text-muted-foreground">
                {t.home.baProjectLabel}
              </p>
            </div>
          </div>
          <div className="reveal-image">
            <BeforeAfterSlider
              before={before1}
              after={after1}
              beforeLabel={t.common.labels.before}
              afterLabel={t.common.labels.after}
              className="aspect-[4/3] md:aspect-[3/2]"
            />
          </div>
          <div className="reveal-image mt-6 md:mt-10">
            <BeforeAfterSlider
              before={before2}
              after={after2Real}
              beforeLabel={t.common.labels.before}
              afterLabel={t.common.labels.after}
              className="aspect-[4/3] md:aspect-[3/2]"
            />
          </div>
          <div className="mt-10 reveal">
            <Link to="/before-after" className="text-[10.5px] uppercase tracking-[0.28em] link-underline">{t.common.cta.viewGallery} →</Link>
          </div>
        </div>
      </section>

      {/* FIND PROPERTY */}
      <section className="relative py-28 md:py-40 overflow-hidden border-t border-hairline">
        <img src={rooftops} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-background/75" />
        <div className="container-editorial relative grid md:grid-cols-12 gap-10">
          <div className="md:col-span-8 reveal">
            <p className="eyebrow mb-5">{t.common.eyebrow.findProperty}</p>
            <h2 className="display-lg text-balance">
              {t.home.findTitle.l1}<br/><em className="display-italic">{t.home.findTitle.l2}</em>
            </h2>
            <p className="mt-10 max-w-xl body-lg">{t.home.findText}</p>
            <div className="mt-12">
              <Link to="/find-your-property" className="btn-solid">{t.common.cta.findProperty}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-36 md:py-52 bg-foreground text-background">
        <div className="container-editorial text-center reveal">
          <p className="eyebrow !text-background/60 mb-8">{t.common.eyebrow.begin}</p>
          <h2 className="display-xl text-background max-w-3xl mx-auto text-balance">{t.home.finalTitle}</h2>
          <p className="mt-10 max-w-xl mx-auto text-background/75 leading-[1.75]">{t.home.finalText}</p>
          <div className="mt-14 flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn-line-light">{t.common.cta.start}</Link>
            <Link to="/contact" className="btn-line-light">{t.common.cta.contact}</Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
};

export default Index;
