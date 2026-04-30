import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { projects } from "@/data/projects";
import { useI18n } from "@/i18n/I18nProvider";

const Projects = () => {
  const { t, lang } = useI18n();
  return (
    <SiteShell>
      <PageHero eyebrow={t.common.eyebrow.projects} index="V" title={t.projects.title} />
      <Section>
        <div className="grid md:grid-cols-12 gap-x-8 gap-y-24">
          {projects.map((p, i) => (
            <Link
              key={p.slug}
              to={`/projects/${p.slug}`}
              className={`group reveal ${
                i % 4 === 0 ? "md:col-span-7" :
                i % 4 === 1 ? "md:col-span-5 md:mt-24" :
                i % 4 === 2 ? "md:col-span-5" :
                "md:col-span-7 md:mt-16"
              }`}
              style={{ transitionDelay: `${(i % 4) * 80}ms` }}
            >
              <div className="image-frame aspect-[4/5]">
                <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
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
      </Section>
    </SiteShell>
  );
};

export default Projects;
