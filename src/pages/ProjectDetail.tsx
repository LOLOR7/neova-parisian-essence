import { useParams, Link, Navigate } from "react-router-dom";
import { SiteShell } from "@/components/layout/SiteShell";
import { Section } from "@/components/site/Section";
import { projects } from "@/data/projects";

const ProjectDetail = () => {
  const { slug } = useParams();
  const p = projects.find((x) => x.slug === slug);
  if (!p) return <Navigate to="/projets" replace />;

  return (
    <SiteShell>
      <section className="container-narrow pt-12 md:pt-20 pb-12">
        <Link to="/projets" className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground link-underline">← Tous les projets</Link>
        <div className="mt-10 grid md:grid-cols-12 gap-8">
          <div className="md:col-span-8">
            <p className="eyebrow mb-4">Projet</p>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.05]">{p.name}</h1>
          </div>
          <dl className="md:col-span-4 grid grid-cols-2 gap-y-6 self-end text-sm">
            <dt className="eyebrow">Lieu</dt><dd>{p.location}</dd>
            <dt className="eyebrow">Surface</dt><dd>{p.surface}</dd>
            <dt className="eyebrow col-span-2">Type</dt><dd className="col-span-2">{p.type}</dd>
          </dl>
        </div>
      </section>

      <section className="container-narrow">
        <div className="aspect-[16/10] bg-muted overflow-hidden">
          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
        </div>
      </section>

      <Section>
        <div className="max-w-2xl reveal">
          <p className="eyebrow mb-4">Description</p>
          <p className="font-display text-2xl md:text-3xl leading-snug">{p.description}</p>
        </div>
      </Section>

      {(p.before && p.after) && (
        <Section className="bg-secondary/40 border-y border-hairline">
          <p className="eyebrow mb-10">Avant · Pendant · Après</p>
          <div className="grid md:grid-cols-2 gap-3 md:gap-6">
            <figure className="relative reveal">
              <img src={p.before} alt={`${p.name} avant`} loading="lazy" className="w-full aspect-[4/3] object-cover" />
              <figcaption className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.3em] bg-background/90 px-3 py-1.5">Avant</figcaption>
            </figure>
            <figure className="relative reveal">
              <img src={p.after} alt={`${p.name} après`} loading="lazy" className="w-full aspect-[4/3] object-cover" />
              <figcaption className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.3em] bg-foreground text-background px-3 py-1.5">Après</figcaption>
            </figure>
          </div>
        </Section>
      )}

      <Section>
        <div className="text-center reveal">
          <Link to="/contact" className="text-[11px] uppercase tracking-[0.22em] bg-foreground text-background px-7 py-4 hover:opacity-90 transition-opacity">
            Démarrer un projet similaire
          </Link>
        </div>
      </Section>
    </SiteShell>
  );
};

export default ProjectDetail;
