import { useParams, Link, Navigate } from "react-router-dom";
import { SiteShell } from "@/components/layout/SiteShell";
import { Section } from "@/components/site/Section";
import { projects } from "@/data/projects";
import { useI18n } from "@/i18n/I18nProvider";

const ProjectDetail = () => {
  const { slug } = useParams();
  const { t, lang } = useI18n();
  const p = projects.find((x) => x.slug === slug);
  if (!p) return <Navigate to="/projects" replace />;

  return (
    <SiteShell>
      <section className="container-editorial pt-32 md:pt-40 pb-12">
        <Link to="/projects" className="text-[10.5px] uppercase tracking-[0.28em] text-muted-foreground link-underline">{t.common.cta.backToProjects}</Link>
        <div className="mt-12 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-8">
            <p className="eyebrow mb-5">{t.common.eyebrow.projects} · {p.index}</p>
            <h1 className="display-xl">{p.name}</h1>
          </div>
          <dl className="md:col-span-4 grid grid-cols-2 gap-y-6 self-end text-sm">
            <dt className="eyebrow">{t.common.labels.location}</dt><dd>{p.location[lang]}</dd>
            <dt className="eyebrow">{t.common.labels.surface}</dt><dd>{p.surface}</dd>
            <dt className="eyebrow col-span-2">{t.common.labels.type}</dt><dd className="col-span-2">{p.type[lang]}</dd>
          </dl>
        </div>
      </section>

      <section className="container-editorial mt-12">
        <div className="aspect-[16/10] image-frame reveal-image">
          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
        </div>
      </section>

      <Section>
        <div className="max-w-2xl reveal">
          <p className="eyebrow mb-5">{t.common.labels.description}</p>
          <p className="display-md">{p.description[lang]}</p>
        </div>
      </Section>

      {(p.before && p.after) && (
        <Section className="bg-bone">
          <p className="eyebrow mb-12">{t.common.labels.before} · {t.common.labels.after}</p>
          <div className="grid md:grid-cols-12 gap-4 md:gap-6">
            <figure className="relative md:col-span-6 reveal-image">
              <img src={p.before} alt={`${p.name} before`} loading="lazy" className="w-full aspect-[4/3] object-cover" />
              <figcaption className="absolute top-5 left-5 text-[10px] uppercase tracking-[0.3em] bg-background/90 px-3 py-2">{t.common.labels.before}</figcaption>
            </figure>
            <figure className="relative md:col-span-6 md:mt-16 reveal-image">
              <img src={p.after} alt={`${p.name} after`} loading="lazy" className="w-full aspect-[4/3] object-cover" />
              <figcaption className="absolute top-5 left-5 text-[10px] uppercase tracking-[0.3em] bg-foreground text-background px-3 py-2">{t.common.labels.after}</figcaption>
            </figure>
          </div>
        </Section>
      )}

      <Section>
        <div className="text-center reveal">
          <Link to="/contact" className="btn-solid">{t.common.cta.startSimilar}</Link>
        </div>
      </Section>
    </SiteShell>
  );
};

export default ProjectDetail;
