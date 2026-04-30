import { Link } from "react-router-dom";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { projects } from "@/data/projects";
import { ArrowUpRight } from "lucide-react";

const Projects = () => (
  <SiteShell>
    <PageHero eyebrow="Projets" title="Sélection de rénovations parisiennes" />
    <Section>
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-20">
        {projects.map((p, i) => (
          <Link key={p.slug} to={`/projets/${p.slug}`} className="group reveal" style={{ transitionDelay: `${i * 70}ms` }}>
            <div className="image-hover aspect-[4/5] bg-muted">
              <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div className="mt-5 flex justify-between items-start">
              <div>
                <p className="font-display text-2xl">{p.name}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-2">{p.location} · {p.surface}</p>
              </div>
              <ArrowUpRight size={18} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </Section>
  </SiteShell>
);

export default Projects;
