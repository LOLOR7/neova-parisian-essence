import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import detail from "@/assets/detail-moulding.jpg";
import after1 from "@/assets/after-1.jpg";
import kleber from "@/assets/project-kleber.jpg";

const steps = [
  { n: "01", t: "Visite initiale", d: "Comprendre l'espace.", img: detail },
  { n: "02", t: "Plans & devis détaillé", d: "Structurés et transparents.", img: after1 },
  { n: "03", t: "Planification", d: "Calendrier précis." },
  { n: "04", t: "Phase travaux", d: "Exécution maîtrisée.", img: kleber },
  { n: "05", t: "Intégration technique", d: "Systèmes optimisés." },
  { n: "06", t: "Finitions & livraison", d: "Net, calme, complet." },
];

const Method = () => (
  <SiteShell>
    <PageHero eyebrow="Méthode" title="Un processus clair et maîtrisé" />
    <Section>
      <div className="space-y-24 md:space-y-32">
        {steps.map((s, i) => (
          <article key={s.n} className={`grid md:grid-cols-12 gap-10 items-center reveal ${i % 2 ? "md:[&>div:first-child]:order-2" : ""}`}>
            <div className="md:col-span-6">
              {s.img ? (
                <div className="image-hover aspect-[4/3] bg-muted">
                  <img src={s.img} alt={s.t} loading="lazy" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-[4/3] bg-secondary border border-hairline flex items-center justify-center">
                  <span className="font-display text-7xl text-muted-foreground/40">{s.n}</span>
                </div>
              )}
            </div>
            <div className="md:col-span-6 md:px-8">
              <p className="font-display text-5xl text-muted-foreground/60">{s.n}</p>
              <h2 className="font-display text-3xl md:text-4xl mt-4">{s.t}</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed max-w-md">{s.d}</p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  </SiteShell>
);

export default Method;
