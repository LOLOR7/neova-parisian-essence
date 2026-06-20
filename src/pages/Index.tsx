import { Link } from "react-router-dom";
import { SiteShell } from "@/components/layout/SiteShell";
import { useI18n } from "@/i18n/I18nProvider";
import { Seo } from "@/components/site/Seo";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { ServicesShowcase } from "@/components/site/ServicesShowcase";
import { SlicedReveal } from "@/components/site/SlicedReveal";
import { MethodStrip } from "@/components/site/MethodStrip";
import { LifecycleVisuals } from "@/components/site/LifecycleVisuals";
import moulding from "@/assets/detail-moulding.jpg";
import rooftops from "@/assets/paris-rooftops.jpg";
import before1Asset from "@/assets/before-real.jpg";
import after1Asset from "@/assets/after-real.jpg";
import heroParis from "@/assets/hero-paris-landmark.jpg";
import { parisProjects } from "@/data/parisProjects";

// Real before/after photos shipped via /public — same source as the standalone
// Before/After page so both surfaces stay in sync.
const before1 = "/before-after/before-1.jpg";
const after1 = "/before-after/after-1.jpg";
const before2 = "/before-after/before-2.jpg";
const after2Real = "/before-after/after-2.jpg";

const Index = () => {
  const { t, lang } = useI18n();
  const visibleProjects = parisProjects.filter((p) => p.slug !== "paris-15eme-pb");
  const totalCount = visibleProjects.length;
  const countLabel = `${String(totalCount).padStart(2, "0")} ${lang === "fr" ? "réalisations" : "projects"}`;

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
          style={{ transform: "scale(1.04)" }}
        />
        {/* Cinematic deep-green / black overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(160_30%_8%/0.55)_0%,_hsl(0_0%_4%/0.85)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 via-foreground/30 to-foreground/85" />

        <div className="container-editorial relative text-background pt-28 md:pt-36 pb-12 md:pb-16">
          {/* Headline block — centered editorial */}
          <div className="max-w-4xl mx-auto text-center">
            <p className="eyebrow !text-[hsl(var(--brass))] mb-6 md:mb-8 animate-fade-in tracking-[0.42em]">
              {lang === "fr" ? "NEOVA — PARIS" : "NEOVA — PARIS"}
            </p>
            <h1 className="display-xl text-background animate-fade-up text-balance leading-[1.02]">
              {lang === "fr" ? (
                <>Conseil immobilier privé <em className="display-italic">à Paris</em></>
              ) : (
                <>Private Property Advisory <em className="display-italic">in Paris</em></>
              )}
            </h1>
            <p
              className="mt-7 md:mt-9 max-w-2xl mx-auto text-background/85 text-[15px] md:text-[17px] leading-[1.75] animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              {lang === "fr"
                ? "De l'acquisition discrète à la rénovation et à la gestion long terme, Neova accompagne une clientèle internationale à chaque étape de son parcours immobilier parisien."
                : "From discreet acquisition to renovation and long-term management, Neova supports international clients at every stage of their Paris property journey."}
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

          {/* Three pillar cards — glassmorphic, premium */}
          <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto">
            {[
              {
                num: "01",
                title: lang === "fr" ? "Property Finder" : "Property Finder",
                text:
                  lang === "fr"
                    ? "Recherche discrète, accès off-market et conseil côté acquéreur pour l'immobilier parisien."
                    : "Discreet search, off-market access and buyer-side advisory for Paris real estate.",
                href: "/find-your-property",
              },
              {
                num: "02",
                title: lang === "fr" ? "Property Management" : "Property Management",
                text:
                  lang === "fr"
                    ? "Coordination continue, entretien et supervision locale de confiance pour votre bien parisien."
                    : "Ongoing coordination, maintenance and trusted local oversight for your Paris property.",
                href: "/services",
              },
              {
                num: "03",
                title: lang === "fr" ? "Renovation" : "Renovation",
                text:
                  lang === "fr"
                    ? "De la faisabilité à la livraison, des projets de rénovation menés avec clarté, maîtrise et artisans de confiance."
                    : "From feasibility to delivery, renovation projects managed with clarity, control and trusted craftsmen.",
                href: "/before-after",
              },
            ].map((c, i) => (
              <Link
                key={c.num}
                to={c.href}
                className="group relative block p-7 md:p-8 border border-background/15 bg-background/[0.04] backdrop-blur-md hover:bg-background/[0.08] hover:border-[hsl(var(--brass)/0.55)] transition-all duration-500 animate-fade-up"
                style={{ animationDelay: `${0.55 + i * 0.12}s` }}
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="numeral text-[10.5px] tracking-[0.32em] text-[hsl(var(--brass))]">
                    {c.num}
                  </span>
                  <span
                    aria-hidden
                    className="h-px w-8 bg-background/40 transition-all duration-500 group-hover:w-14 group-hover:bg-[hsl(var(--brass))]"
                  />
                </div>
                <h3 className="font-display text-[22px] md:text-[24px] leading-[1.2] text-background mb-3">
                  {c.title}
                </h3>
                <p className="text-[13.5px] leading-[1.75] text-background/75">
                  {c.text}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.32em] text-background/70 group-hover:text-[hsl(var(--brass))] transition-colors duration-500">
                  {lang === "fr" ? "En savoir plus" : "Learn more"}
                  <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
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

      {/* SERVICES — signature interactive showcase */}
      <ServicesShowcase
        eyebrow={t.common.eyebrow.services}
        title={t.home.servicesTitle}
        subtitle={t.home.servicesSubtitle}
        items={t.home.richServices}
      />

      {/* METHOD STRIP — discreet process band */}
      <MethodStrip />

      {/* LIFECYCLE — Compact editorial process band */}
      <section className="py-20 md:py-28 panel-stone border-t border-hairline">
        <div className="container-editorial">
          {/* Split header: title left, intro right */}
          <div className="grid md:grid-cols-12 gap-x-12 gap-y-6 mb-14 md:mb-20 items-end">
            <div className="md:col-span-7 reveal">
              <p className="eyebrow mb-4">{t.home.lifecycleEyebrow}</p>
              <h2 className="display-md md:display-lg text-balance">
                {t.home.lifecycleTitle}
              </h2>
            </div>
            <div className="md:col-span-4 md:col-start-9 reveal">
              <p className="text-[14px] leading-[1.75] text-slate-soft max-w-sm">
                {lang === "fr"
                  ? "De la recherche à l'exécution et au suivi long terme, Neova coordonne chaque phase avec discrétion et précision."
                  : "From search to execution and long-term care, Neova coordinates each phase with discretion and precision."}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <span className="h-px w-8 bg-[hsl(var(--brass))]" />
                <span className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
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
              className="hidden md:block absolute left-[8%] right-[8%] top-[110px] h-px bg-[hsl(var(--brass)/0.35)]"
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
                    <figure className="relative image-frame aspect-[4/3] overflow-hidden bg-background">
                      <div className="absolute inset-0 panel-stone" />
                      <div className="absolute inset-0">
                        <Visual />
                      </div>
                      {/* index dot on connector line */}
                      <span
                        aria-hidden
                        className="hidden md:block absolute -top-[6px] left-1/2 -translate-x-1/2 w-[11px] h-[11px] rounded-full bg-background border border-[hsl(var(--brass))]"
                      />
                    </figure>

                    {/* Caption block */}
                    <div className="mt-6">
                      <div className="flex items-baseline gap-3 mb-3">
                        <span className="numeral text-[10.5px] tracking-[0.32em] text-[hsl(var(--brass))]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[10.5px] uppercase tracking-[0.32em] text-foreground">
                          {p.label}
                        </span>
                      </div>
                      <h3 className="font-display text-[20px] md:text-[22px] leading-[1.25] text-balance">
                        {p.title}
                      </h3>
                      <span className="block h-px w-8 bg-[hsl(var(--brass))] mt-4 mb-4 transition-all duration-700 group-hover:w-12" />
                      <p className="text-[13.5px] leading-[1.75] text-slate-soft">
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

      {/* SELECTION — Paris arrondissements */}
      <section className="py-28 md:py-40 bg-background border-t border-hairline overflow-hidden">
        <div className="container-editorial">
          <div className="grid md:grid-cols-12 gap-x-12 gap-y-10 mb-20 md:mb-28 items-end">
            <div className="md:col-span-7 reveal">
              <p className="eyebrow mb-5">{t.home.selection.eyebrow}</p>
              <h2 className="display-lg text-balance">
                {t.home.selection.title.l1}<br/>
                <em className="display-italic">{t.home.selection.title.l2}</em>
              </h2>
            </div>
            <div className="md:col-span-4 md:col-start-9 reveal">
              <p className="body-lg text-foreground/80">
                {t.home.selection.intro}
              </p>
              <div className="mt-6 flex items-center gap-4">
                <span className="h-px w-10 bg-[hsl(var(--brass))]" />
                <span className="text-[10.5px] uppercase tracking-[0.32em] text-muted-foreground">
                  {countLabel}
                </span>
              </div>
            </div>
          </div>

          {(() => {
            const arrondissements = visibleProjects.map((p) => {
              const origIdx = parisProjects.findIndex((x) => x.slug === p.slug);
              return {
                slug: p.slug,
                img: p.hero,
                num: p.num,
                roman: p.roman,
                photoCount: p.images.length,
                lines: t.home.selection.items[origIdx].lines,
                alt: t.home.selection.items[origIdx].alt ?? `Neova renovation project in Paris ${p.num}th arrondissement`,
              };
            });
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 md:gap-x-10 md:gap-y-20">
                {arrondissements.map((a, i) => (
                  <Link
                    to={`/projects/${a.slug}`}
                    key={a.num}
                    className={`reveal group flex flex-col cursor-pointer ${
                      // Subtle vertical offset on alternating cards (desktop only) — editorial rhythm
                      i % 2 === 1 ? "lg:mt-16" : ""
                    }`}
                    style={{ transitionDelay: `${i * 90}ms` }}
                  >
                    {/* Top meta line */}
                    <div className="flex items-center justify-between mb-5">
                      <span className="numeral text-[10.5px] tracking-[0.32em] text-muted-foreground">
                        {String(i + 1).padStart(2, "0")} / {String(totalCount).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                        Paris · {a.roman}
                      </span>
                    </div>

                    {/* Portrait image — refined, smaller */}
                    <figure className="relative image-frame aspect-[3/4] overflow-hidden bg-muted/30">
                      <img
                        src={a.img}
                        alt={a.alt}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
                      />
                      {/* Hover overlay CTA */}
                      <span className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-500 flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 text-[10.5px] uppercase tracking-[0.32em] bg-background text-foreground px-5 py-3">
                          View project →
                        </span>
                      </span>
                    </figure>

                    {/* Caption block */}
                    <div className="mt-6">
                      <h3 className="font-display text-[22px] md:text-[24px] leading-[1.2]">
                        {a.num}
                        <sup className="text-[0.55em] align-super -ml-px">ᵉ</sup> {t.home.selection.arrondissementSuffix}
                      </h3>
                      <span className="block h-px w-10 bg-[hsl(var(--brass))] mt-4 mb-5 transition-all duration-700 group-hover:w-16" />
                      <p className="text-[14px] leading-[1.85] text-slate-soft">
                        {a.lines.map((l, k) => (
                          <span key={k}>
                            {l}
                            {k < a.lines.length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            );
          })()}

          {/* MERGED — Before / After subsection */}
          <div className="mt-28 md:mt-36 pt-16 md:pt-20 border-t border-hairline">
            <div className="grid md:grid-cols-12 gap-x-12 gap-y-6 mb-12 md:mb-16 items-end">
              <div className="md:col-span-8 reveal">
                <p className="eyebrow mb-5">{t.common.eyebrow.beforeAfter}</p>
                <h3 className="display-md md:display-lg text-balance">
                  {t.home.baTitle.l1} <em className="display-italic">{t.home.baTitle.l2}</em>
                </h3>
                <p className="mt-6 max-w-xl body-lg">{t.home.baSubtitle}</p>
              </div>
            </div>
            <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
              <div className="reveal-image">
                <BeforeAfterSlider
                  before={before1}
                  after={after1}
                  beforeLabel={t.common.labels.before}
                  afterLabel={t.common.labels.after}
                  beforeAlt="Before renovation project — Neova Space"
                  afterAlt="After renovation project — Neova Space"
                  className="aspect-[4/3] md:aspect-[16/10]"
                />
              </div>
              <div className="reveal-image">
                <BeforeAfterSlider
                  before={before2}
                  after={after2Real}
                  beforeLabel={t.common.labels.before}
                  afterLabel={t.common.labels.after}
                  beforeAlt="Before renovation project — Neova Space"
                  afterAlt="After renovation project — Neova Space"
                  className="aspect-[4/3] md:aspect-[16/10]"
                />
              </div>
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
