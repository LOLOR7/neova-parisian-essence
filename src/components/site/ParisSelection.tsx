import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nProvider";
import { parisProjects } from "@/data/parisProjects";

export const ParisSelection = ({ titleOverride }: { titleOverride?: { l1: string; l2: string } }) => {
  const { t } = useI18n();
  const visibleProjects = parisProjects.filter((p) => p.slug !== "paris-15eme-pb");
  const totalCount = visibleProjects.length;
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

  const title = titleOverride ?? t.home.selection.title;

  return (
    <section className="py-28 md:py-40 bg-background border-t border-hairline overflow-hidden">
      <div className="container-editorial">
        <div className="grid md:grid-cols-12 gap-x-12 gap-y-10 mb-20 md:mb-28 items-end">
          <div className="md:col-span-7 reveal">
            <p className="eyebrow mb-5">{t.home.selection.eyebrow}</p>
            <h2 className="display-lg text-balance">
              {title.l1}<br/>
              <em className="display-italic">{title.l2}</em>
            </h2>
          </div>
          <div className="md:col-span-4 md:col-start-9 reveal">
            <p className="body-lg text-foreground/80">{t.home.selection.intro}</p>
            <div className="mt-6 flex items-center gap-4">
              <span className="h-px w-10 bg-[hsl(var(--brass))]" />
              <span className="text-[10.5px] uppercase tracking-[0.32em] text-muted-foreground">
                {String(totalCount).padStart(2, "0")} projects
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
                    View project →
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
      </div>
    </section>
  );
};
