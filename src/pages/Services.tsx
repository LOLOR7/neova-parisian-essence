import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";

const services = [
  { t: "Rénovation complète", d: "Transformation intégrale, de la dépose à la livraison." },
  { t: "Conduite de chantier", d: "Planification claire, coordination et exécution maîtrisée." },
  { t: "Coordination architecture intérieure", d: "Plans, matières, et collaboration avec des architectes sélectionnés." },
  { t: "Lots techniques", d: "Électricité, plomberie, CVC, et intégrations structurelles." },
  { t: "Menuiserie sur mesure", d: "Cuisines, rangements, bibliothèques, éléments faits main." },
  { t: "Éclairage & systèmes intelligents", d: "Solutions intégrées, installées avec précision et discrétion." },
  { t: "Finitions & matériaux", d: "Sélection cohérente pour un résultat raffiné et durable." },
  { t: "Gestion de patrimoine", d: "Suivi long terme, maintenance, préservation de la qualité dans le temps." },
];

const Services = () => (
  <SiteShell>
    <PageHero
      eyebrow="Services"
      title="Des services pensés pour la clarté, la maîtrise et la valeur durable."
    />
    <Section>
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-0">
        {services.map((s, i) => (
          <div key={s.t} className="border-t border-hairline py-10 reveal" style={{ transitionDelay: `${i * 50}ms` }}>
            <div className="flex items-start gap-6">
              <span className="font-display text-muted-foreground text-sm w-8">0{i + 1}</span>
              <div>
                <p className="font-display text-2xl md:text-3xl">{s.t}</p>
                <p className="mt-3 text-muted-foreground leading-relaxed max-w-md">{s.d}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  </SiteShell>
);

export default Services;
