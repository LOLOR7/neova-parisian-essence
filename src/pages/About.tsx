import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import moulding from "@/assets/detail-moulding.jpg";

const pillars = [
  { t: "Respect de l'architecture", d: "Comprendre l'existant avant d'intervenir. Préserver ce qui doit l'être." },
  { t: "Design intemporel", d: "Choix matériels cohérents, palettes apaisées, gestes durables." },
  { t: "Exécution durable", d: "Précision technique, suivi rigoureux, qualité d'exécution constante." },
];

const network = [
  { t: "Artisans", d: "Sélectionnés pour leur précision et la qualité de leur main." },
  { t: "Spécialistes", d: "Lots techniques maîtrisés : électricité, plomberie, CVC, structure." },
  { t: "Architectes", d: "Coordination étroite, vision partagée, exigences alignées." },
];

const About = () => (
  <SiteShell>
    <PageHero
      eyebrow="À propos"
      title="Discipline, élégance et maîtrise technique pour la rénovation parisienne."
      intro="Neova a été créée pour apporter discipline, élégance et maîtrise technique à la rénovation parisienne."
    />

    <Section>
      <div className="grid md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-5 reveal">
          <img src={moulding} alt="Détail haussmannien" className="w-full" loading="lazy" />
        </div>
        <div className="md:col-span-7 md:pl-8 reveal">
          <p className="eyebrow mb-4">Vision</p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight mb-12">Une vision précise de la rénovation</h2>
          <div className="grid sm:grid-cols-1 gap-10">
            {pillars.map((p, i) => (
              <div key={p.t} className="border-t border-hairline pt-6 reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <p className="font-display text-2xl">{p.t}</p>
                <p className="mt-3 text-muted-foreground leading-relaxed max-w-md">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>

    <Section className="bg-secondary/40 border-y border-hairline">
      <div className="max-w-2xl mb-16 reveal">
        <p className="eyebrow mb-4">Réseau</p>
        <h2 className="font-display text-3xl md:text-5xl">Un réseau parisien de confiance</h2>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          Au fil des projets, Neova a constitué un réseau d'artisans, de spécialistes et d'architectes qui partagent les mêmes exigences de qualité, de discrétion et de précision.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {network.map((n, i) => (
          <div key={n.t} className="bg-background border border-hairline p-10 reveal" style={{ transitionDelay: `${i * 100}ms` }}>
            <p className="font-display text-2xl">{n.t}</p>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{n.d}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section>
      <div className="grid md:grid-cols-2 gap-12 reveal">
        <div>
          <p className="eyebrow mb-4">Positionnement</p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight">Sélectif par nature</h2>
        </div>
        <ul className="space-y-6">
          {["Projets haut de gamme à Paris", "Approche sélective", "Exécution maîtrisée"].map((b) => (
            <li key={b} className="border-t border-hairline pt-5 text-lg">{b}</li>
          ))}
        </ul>
      </div>
    </Section>
  </SiteShell>
);

export default About;
