import { Link } from "react-router-dom";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { useI18n } from "@/i18n/I18nProvider";
import { parisProjects } from "@/data/parisProjects";

const before1 = "/before-after/before-1.jpg";
const after1 = "/before-after/after-1.jpg";
const before2 = "/before-after/before-2.jpg";
const after2 = "/before-after/after-2.jpg";

const Projects = () => {
  const { t, lang } = useI18n();
  const visibleProjects = parisProjects.filter((p) => p.slug !== "paris-15eme-pb");
  const totalCount = visibleProjects.length;
  const countLabel = `${String(totalCount).padStart(2, "0")} ${lang === "fr" ? "réalisations" : "projects"}`;

  return (
    <SiteShell>
      <PageHero
        eyebrow={t.home.selection.eyebrow}
        index="V"
        title={
          <>
            {t.home.selection.title.l1}
            <br />
            <em className="display-italic">{t.home.selection.title.l2}</em>
          </>
        }
      />
      <Section>
        <div className="grid md:grid-cols-12 gap-x-12 gap-y-10 mb-16 md:mb-24 items-end">
          <div className="md:col-span-7" />
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
          {visibleProjects.map((p, i) => {
            const origIdx = parisProjects.findIndex((x) => x.slug === p.slug);
            const item = t.home.selection.items[origIdx];
            return (
              <Link
                to={`/projects/${p.slug}`}
                key={p.slug}
                className={`reveal group flex flex-col cursor-pointer ${
                  i % 2 === 1 ? "lg:mt-16" : ""
                }`}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="numeral text-[10.5px] tracking-[0.32em] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")} / {String(totalCount).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    Paris · {p.roman}
                  </span>
                </div>

                <figure className="relative image-frame aspect-[3/4] overflow-hidden bg-muted/30">
                  <img
                    src={p.hero}
                    alt={item.alt ?? `Neova renovation project in Paris ${p.num}th arrondissement`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
                  />
                  <span className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-500 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 text-[10.5px] uppercase tracking-[0.32em] bg-background text-foreground px-5 py-3">
                      View project →
                    </span>
                  </span>
                </figure>

                <div className="mt-6">
                  <h3 className="font-display text-[22px] md:text-[24px] leading-[1.2]">
                    {p.num}
                    <sup className="text-[0.55em] align-super -ml-px">ᵉ</sup>{" "}
                    {t.home.selection.arrondissementSuffix}
                  </h3>
                  <span className="block h-px w-10 bg-[hsl(var(--brass))] mt-4 mb-5 transition-all duration-700 group-hover:w-16" />
                  <p className="text-[14px] leading-[1.85] text-slate-soft">
                    {item.lines.map((l, k) => (
                      <span key={k}>
                        {l}
                        {k < item.lines.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Merged Before / After subsection */}
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
                after={after2}
                beforeLabel={t.common.labels.before}
                afterLabel={t.common.labels.after}
                beforeAlt="Before renovation project — Neova Space"
                afterAlt="After renovation project — Neova Space"
                className="aspect-[4/3] md:aspect-[16/10]"
              />
            </div>
          </div>
        </div>
      </Section>
    </SiteShell>
  );
};

export default Projects;
