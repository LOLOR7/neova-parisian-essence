import { Link } from "react-router-dom";
import { SiteShell } from "@/components/layout/SiteShell";
import { useI18n } from "@/i18n/I18nProvider";
import { Seo } from "@/components/site/Seo";
import { SlicedReveal } from "@/components/site/SlicedReveal";
import { MethodStrip } from "@/components/site/MethodStrip";
import { LifecycleVisuals } from "@/components/site/LifecycleVisuals";
import moulding from "@/assets/detail-moulding.jpg";
import rooftops from "@/assets/paris-rooftops.jpg";
import heroParis from "@/assets/hero-paris-landmark.jpg";

const Index = () => {
  const { t, lang } = useI18n();

  return (
    <SiteShell>
      <Seo
        title="Neova — Paris Property Finder, Management & Renovation"
        description="Private property advisory in Paris: discreet acquisition, long-term management and renovation for international clients."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Neova Space",
          url: "https://neovaspace.com/",
        }}
      />
      {/* HERO */}
      <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden bg-foreground">
        <img
          src={heroParis}
          alt="Pont Alexandre III at dusk with the Invalides dome — Paris"
          width={1920}
          height={1080}
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scale(1.04)", filter: "brightness(1.14) saturate(1.06)" }}
        />
        {/* Lighter dusk overlay — photo reads brighter */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(215_55%_22%/0.14)_0%,_hsl(220_45%_8%/0.42)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(210_70%_45%/0.10)] via-[hsl(215_50%_15%/0.18)] to-foreground/52" />

        <div className="container-editorial relative text-background pt-24 md:pt-28 pb-12 md:pb-16">
          {/* Headline block — centered editorial */}
          <div className="max-w-4xl mx-auto text-center">
            <p className="eyebrow !text-[hsl(var(--brass))] mb-5 md:mb-6 animate-fade-in tracking-[0.42em]">
              {lang === "fr" ? "NEOVA — PARIS" : "NEOVA — PARIS"}
            </p>
            <h1 className="text-background animate-fade-up text-balance font-serif italic font-light whitespace-nowrap text-[clamp(1.5rem,4.2vw,2.85rem)] tracking-[0.04em] leading-[1.15]">
              Acquisition <span className="not-italic text-[hsl(var(--brass))] mx-2 md:mx-3">·</span> Transformation <span className="not-italic text-[hsl(var(--brass))] mx-2 md:mx-3">·</span> Ownership
            </h1>
            <p
              className="mt-6 md:mt-8 max-w-2xl mx-auto text-background/85 text-[15px] md:text-[17px] leading-[1.75] animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              {lang === "fr"
                ? "De l'acquisition discrète à la rénovation et à la gestion long terme, Neova accompagne une clientèle internationale à chaque étape de son parcours immobilier parisien."
                : "From discreet acquisition to renovation and long-term management, Neova supports local and international clients at every stage of their Paris property journey."}
            </p>
            <div
              className="mt-9 md:mt-11 flex flex-wrap justify-center gap-4 animate-fade-up"
              style={{ animationDelay: "0.4s" }}
            >
              <Link to="/find-your-property#form" className="btn-line-light">
                {lang === "fr" ? "Démarrer votre projet" : "Start your project"}
              </Link>
              <Link to="/services" className="btn-line-light">
                {lang === "fr" ? "Découvrir notre expertise" : "Explore our expertise"}
              </Link>
            </div>
          </div>

          {/* Three pillar cards — luxury navigation tiles */}
          <div className="mt-14 md:mt-20 flex flex-col md:flex-row md:justify-center gap-5 md:gap-8 lg:gap-10 mx-auto">
            {[
              {
                num: "01",
                title: lang === "fr" ? "Property Finder" : "Property Finder",
                href: "/find-your-property",
              },
              {
                num: "02",
                title: lang === "fr" ? "Renovation" : "Renovation",
                href: "/before-after",
              },
              {
                num: "03",
                title: lang === "fr" ? "Property Management" : "Property Management",
                href: "/services",
              },
            ].map((c, i) => (
              <Link
                key={c.num}
                to={c.href}
                className="group relative block w-full max-w-[280px] mx-auto md:w-[200px] lg:w-[220px] md:flex-shrink-0 px-5 py-3.5 md:px-5 md:py-3 border border-background/[0.08] bg-background/[0.02] backdrop-blur-[4px] hover:bg-background/[0.035] hover:border-[hsl(var(--brass)/0.30)] transition-all duration-500 animate-fade-up"
                style={{ animationDelay: `${0.55 + i * 0.12}s` }}
              >
                <span className="numeral block text-[9px] tracking-[0.24em] text-[hsl(var(--brass)/0.75)] mb-2">
                  {c.num}
                </span>
                <h3 className="font-display text-[16px] md:text-[17px] leading-[1.2] text-background mb-3">
                  {c.title}
                </h3>
                <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.24em] text-background/42 group-hover:text-[hsl(var(--brass)/0.8)] transition-colors duration-500">
                  {lang === "fr" ? "En savoir plus" : "Learn more"}
                  <span className="transition-transform duration-500 group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND STATEMENT — sliced editorial reveal */}
      <SlicedReveal
        image={moulding}
        alt={t.home.mouldingAlt}
        eyebrow={t.home.brandEyebrow}
        title={t.home.brandTitle}
        body={t.home.brandText}
        closing={t.home.brandSecondary}
        sideLabel={t.home.brandSideLabel}
        pageNumber="01 / 08"
      />

      {/* METHOD STRIP — discreet process band */}
      <MethodStrip />

      {/* LIFECYCLE — dark editorial band */}
      <section
        className="py-20 md:py-28 bg-foreground text-background border-t border-background/10"
        style={
          {
            "--foreground": "36 28% 96.5%",
            "--slate-soft": "36 18% 78%",
            "--muted-foreground": "36 14% 68%",
          } as React.CSSProperties
        }
      >
        <div className="container-editorial">
          {/* Split header: title left, intro right */}
          <div className="grid md:grid-cols-12 gap-x-12 gap-y-6 mb-14 md:mb-20 items-end">
            <div className="md:col-span-7 reveal">
              <p className="eyebrow !text-[hsl(var(--brass))] mb-4">{t.home.lifecycleEyebrow}</p>
              <h2 className="display-md md:display-lg text-balance text-background">
                {t.home.lifecycleTitle}
              </h2>
            </div>
            <div className="md:col-span-4 md:col-start-9 reveal">
              <p className="text-[14px] leading-[1.75] text-background/72 max-w-sm">
                {lang === "fr"
                  ? "De la recherche à l'exécution et au suivi long terme, Neova coordonne chaque phase avec discrétion et précision."
                  : "From search to execution and long-term care, Neova coordinates each phase with discretion and precision."}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <span className="h-px w-8 bg-[hsl(var(--brass))]" />
                <span className="text-[10px] uppercase tracking-[0.32em] text-background/55">
                  03 · {lang === "fr" ? "étapes" : "movements"}
                </span>
              </div>
            </div>
          </div>

          {/* Compact 3-step row with thin connector */}
          <div className="relative">
            {/* Thin brass connector line — desktop only, sits behind cards */}
            <span
              aria-hidden
              className="hidden md:block absolute left-[8%] right-[8%] top-[110px] h-px bg-[hsl(var(--brass)/0.45)]"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 relative">
              {t.home.lifecycle.map((p, i) => {
                const Visual = LifecycleVisuals[i];
                return (
                  <article
                    key={p.label}
                    className="reveal group flex flex-col"
                    style={{ transitionDelay: `${i * 90}ms` }}
                  >
                    {/* Animated SVG visual — replays via key on each step */}
                    <figure className="relative image-frame aspect-[4/3] overflow-hidden bg-[hsl(213_22%_16%)] border border-background/10">
                      <div className="absolute inset-0 bg-[hsl(213_22%_18%/0.55)]" />
                      <div className="absolute inset-0">
                        <Visual />
                      </div>
                      {/* index dot on connector line */}
                      <span
                        aria-hidden
                        className="hidden md:block absolute -top-[6px] left-1/2 -translate-x-1/2 w-[11px] h-[11px] rounded-full bg-foreground border border-[hsl(var(--brass))]"
                      />
                    </figure>

                    {/* Caption block */}
                    <div className="mt-6">
                      <div className="flex items-baseline gap-3 mb-3">
                        <span className="numeral text-[10.5px] tracking-[0.32em] text-[hsl(var(--brass))]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[10.5px] uppercase tracking-[0.32em] text-background/80">
                          {p.label}
                        </span>
                      </div>
                      <h3 className="font-display text-[20px] md:text-[22px] leading-[1.25] text-balance text-background">
                        {p.title}
                      </h3>
                      <span className="block h-px w-8 bg-[hsl(var(--brass))] mt-4 mb-4 transition-all duration-700 group-hover:w-12" />
                      <p className="text-[13.5px] leading-[1.75] text-background/68">
                        {p.text}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
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
            <Link to="/find-your-property" className="btn-line-light">{t.common.cta.start}</Link>
            <Link to="/contact" className="btn-line-light">{t.common.cta.contact}</Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
};

export default Index;
