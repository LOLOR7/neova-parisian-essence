import { Link } from "react-router-dom";
import { SiteShell } from "@/components/layout/SiteShell";
import { Section } from "@/components/site/Section";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { useI18n } from "@/i18n/I18nProvider";
import { Seo } from "@/components/site/Seo";
import { parisProjects } from "@/data/parisProjects";

const before1 = "/before-after/before-1.jpg";
const after1 = "/before-after/after-1.jpg";
const before2 = "/before-after/before-2.jpg";
const after2Real = "/before-after/after-2.jpg";

const BeforeAfter = () => {
  const { t, lang } = useI18n();

  const projects = Array.from({ length: 5 }, (_, i) => ({
    before: `/before-after/before-${i + 1}.jpg`,
    after: `/before-after/after-${i + 1}.jpg`,
    label: t.beforeAfter.captions[i] ?? `Projet ${i + 1}`,
  }));

  const visibleProjects = parisProjects.filter((p) => p.slug !== "paris-15eme-pb");
  const totalCount = visibleProjects.length;
  const countLabel = `${String(totalCount).padStart(2, "0")} ${lang === "fr" ? "réalisations" : "projects"}`;

  const moodProjects = visibleProjects.map((p) => {
    const origIdx = parisProjects.findIndex((x) => x.slug === p.slug);
    return {
      num: p.num,
      roman: p.roman,
      img: p.hero,
      alt: t.home.selection.items[origIdx].alt ?? `Neova renovation project in Paris ${p.num}th arrondissement`,
    };
  });

  const arrondissements = visibleProjects.map((p) => {
    const origIdx = parisProjects.findIndex((x) => x.slug === p.slug);
    return {
      slug: p.slug,
      img: p.hero,
      num: p.num,
      roman: p.roman,
      lines: t.home.selection.items[origIdx].lines,
      alt: t.home.selection.items[origIdx].alt ?? `Neova renovation project in Paris ${p.num}th arrondissement`,
    };
  });

  return (
    <SiteShell>
      <Seo
        title="Before / After — Paris Renovations | Neova"
        description="Before and after of Paris renovations led by Neova — discreet, refined transformations of Haussmannian and contemporary apartments."
        path="/before-after"
      />
      {/* Renovation hero — reuses the existing before/after MP4 animation */}
      <section className="relative min-h-[80svh] flex items-end overflow-hidden bg-foreground">
        <video
          src="/hero-renovation.mp4"
          autoPlay
          muted
          loop
          playsInline
          poster="/before-after/after-1.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 via-foreground/30 to-foreground/85" />
        <div className="container-editorial relative text-background pb-16 md:pb-24 pt-32">
          <p className="eyebrow !text-[hsl(var(--brass))] mb-6 tracking-[0.42em]">
            {t.common.eyebrow.beforeAfter}
          </p>
          <h1 className="display-xl text-background text-balance leading-[1.02] max-w-4xl">
            {t.beforeAfter.title.l1}<br/>
            <em className="display-italic">{t.beforeAfter.title.l2}</em>
          </h1>
          <p className="mt-6 max-w-xl text-background/85 text-[15px] md:text-[17px] leading-[1.75]">
            {lang === "fr"
              ? "De la faisabilité à la livraison, des rénovations parisiennes menées avec clarté, maîtrise et artisans de confiance."
              : "From feasibility to delivery, Paris renovations led with clarity, control and trusted craftsmen."}
          </p>
        </div>
      </section>

      {/* Renovation mood selection — 3 large non-clickable images */}
      <section className="py-28 md:py-40 bg-background border-t border-hairline overflow-hidden">
        <div className="container-editorial">
          <div className="grid md:grid-cols-12 gap-x-12 gap-y-10 mb-20 md:mb-28 items-end">
            <div className="md:col-span-7 reveal">
              <p className="eyebrow mb-5">{t.home.selection.eyebrow}</p>
              <h2 className="display-lg text-balance">
                {lang === "fr" ? "Rénovations livrées" : "Renovations delivered"}
                <br/>
                <em className="display-italic">
                  {lang === "fr" ? "par Neova à Paris." : "by Neova in Paris."}
                </em>
              </h2>
            </div>
            <div className="md:col-span-4 md:col-start-9 reveal">
              <p className="body-lg text-foreground/80">{t.home.selection.intro}</p>
              <div className="mt-6 flex items-center gap-4">
                <span className="h-px w-10 bg-[hsl(var(--brass))]" />
                <span className="text-[10.5px] uppercase tracking-[0.32em] text-muted-foreground">
                  {String(moodProjects.length).padStart(2, "0")} {lang === "fr" ? "projets" : "projects"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 md:gap-x-10 md:gap-y-20">
            {moodProjects.map((a, i) => (
              <div
                key={a.num}
                className={`reveal flex flex-col ${i % 2 === 1 ? "lg:mt-16" : ""}`}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="numeral text-[10.5px] tracking-[0.32em] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")} / {String(moodProjects.length).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    Paris · {a.roman}
                  </span>
                </div>
                <figure className="relative image-frame aspect-[3/4] overflow-hidden bg-muted/30">
                  <img
                    src={a.img}
                    alt={a.alt}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </figure>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selection · Paris — editorial renovation grid */}
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
              <p className="body-lg text-foreground/80">{t.home.selection.intro}</p>
              <div className="mt-6 flex items-center gap-4">
                <span className="h-px w-10 bg-[hsl(var(--brass))]" />
                <span className="text-[10.5px] uppercase tracking-[0.32em] text-muted-foreground">
                  {countLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 md:gap-x-10 md:gap-y-20">
            {arrondissements.map((a, i) => (
              <Link
                to={`/projects/${a.slug}`}
                key={a.num}
                className={`reveal group flex flex-col cursor-pointer ${i % 2 === 1 ? "lg:mt-16" : ""}`}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="numeral text-[10.5px] tracking-[0.32em] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")} / {String(totalCount).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    Paris · {a.roman}
                  </span>
                </div>
                <figure className="relative image-frame aspect-[3/4] overflow-hidden bg-muted/30">
                  <img
                    src={a.img}
                    alt={a.alt}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
                  />
                  <span className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-500 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 text-[10.5px] uppercase tracking-[0.32em] bg-background text-foreground px-5 py-3">
                      {lang === "fr" ? "Voir le projet →" : "View project →"}
                    </span>
                  </span>
                </figure>
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

          {/* Before / After — featured comparisons */}
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

      {/* Before / after comparison gallery */}
      <Section>
        <div className="max-w-4xl mx-auto mb-14 md:mb-20">
          <p className="eyebrow mb-5">{t.common.eyebrow.beforeAfter}</p>
          <p className="body-lg text-foreground/80 max-w-2xl leading-[1.85]">
            {lang === "fr"
              ? "Découvrez une sélection de rénovations parisiennes à travers des moments avant/après, révélant la précision, la continuité et le soin apportés à chaque transformation."
              : "Explore a selection of Parisian renovations through before-and-after moments, revealing the precision, continuity and care behind each transformation."}
          </p>
        </div>
        <div className="max-w-4xl mx-auto space-y-16 md:space-y-24">
          {projects.map((p, i) => (
            <figure key={i} className="reveal-image">
              <BeforeAfterSlider
                before={p.before}
                after={p.after}
                beforeLabel={t.common.labels.before}
                afterLabel={t.common.labels.after}
                beforeAlt="Before renovation project — Neova Space"
                afterAlt="After renovation project — Neova Space"
                className="aspect-[4/3] md:aspect-[16/10]"
              />
              <figcaption className="mt-6 flex items-center justify-between">
                <span className="numeral text-[10.5px] tracking-[0.32em] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")} / 05
                </span>
                <span className="text-[10.5px] uppercase tracking-[0.28em] text-muted-foreground">
                  {p.label}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
    </SiteShell>
  );
};

export default BeforeAfter;
