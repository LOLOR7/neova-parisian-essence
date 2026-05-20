import { Link } from "react-router-dom";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { Seo } from "@/components/site/Seo";

const AppartementHaussmannien = () => {
  return (
    <SiteShell>
      <Seo
        title="Appartement haussmannien à Paris — Recherche & acquisition discrète | Neova"
        description="Neova accompagne acquéreurs exigeants dans la recherche d'appartements haussmanniens à Paris : 8e, 16e, 17e, 7e. Approche confidentielle, off-market et conseil."
        path="/expertise/appartement-haussmannien-paris"
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Appartement haussmannien à Paris — recherche et acquisition discrète",
            description:
              "Guide Neova sur l'acquisition d'appartements haussmanniens à Paris : caractéristiques, arrondissements, prix et accompagnement sur-mesure.",
            author: { "@type": "Organization", name: "Neova" },
            publisher: { "@type": "Organization", name: "Neova", url: "https://www.neovaspace.com" },
            mainEntityOfPage: "https://www.neovaspace.com/expertise/appartement-haussmannien-paris",
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://www.neovaspace.com/" },
              { "@type": "ListItem", position: 2, name: "Expertise", item: "https://www.neovaspace.com/services" },
              {
                "@type": "ListItem",
                position: 3,
                name: "Appartement haussmannien à Paris",
                item: "https://www.neovaspace.com/expertise/appartement-haussmannien-paris",
              },
            ],
          },
        ]}
      />

      <PageHero
        eyebrow="Neova — Expertise"
        index="VIII"
        title={
          <>
            Appartement haussmannien<br />
            <em className="display-italic">à Paris.</em>
          </>
        }
        intro="Recherche, sélection et acquisition discrète d'appartements haussmanniens dans les arrondissements emblématiques de la capitale."
      />

      <Section>
        <div className="max-w-2xl mx-auto">
          <p className="eyebrow mb-6">L'héritage haussmannien</p>
          <p className="body-lg mb-7 reveal">
            Né de la transformation de Paris orchestrée par le baron Haussmann entre 1853 et 1870, l'appartement haussmannien
            incarne une certaine idée de l'élégance parisienne : pierre de taille, balcons filants au deuxième et au cinquième étage,
            hauteurs sous plafond généreuses, parquet en point de Hongrie, moulures, cheminées en marbre et doubles portes.
          </p>
          <p className="body-lg mb-7 reveal">
            Plus qu'un style architectural, c'est un art de vivre — une enfilade de pièces de réception baignées de lumière,
            une vue dégagée sur un boulevard ou une cour pavée, et la promesse d'un patrimoine qui traverse les générations.
          </p>
        </div>
      </Section>

      <Section className="bg-bone">
        <p className="eyebrow mb-10">Caractéristiques recherchées</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 max-w-4xl">
          {[
            ["Hauteur sous plafond", "Entre 3,00 m et 3,80 m, indissociable de la majesté des pièces de réception."],
            ["Parquet & moulures", "Point de Hongrie, rosaces, corniches et cheminées d'origine — éléments à préserver."],
            ["Doubles expositions", "Traversant ou bi-orienté, garantissant lumière et qualité de vie."],
            ["Étages nobles", "Le 2e et le 5e (étages à balcon) restent les plus prisés du marché secondaire."],
            ["Vue & calme", "Sur boulevard arboré, square ou cour intérieure — un critère décisif à la revente."],
            ["Services", "Ascenseur, gardien, cave et, lorsque c'est possible, une place de parking."],
          ].map(([h, p]) => (
            <div key={h} className="reveal">
              <h3 className="font-display text-xl mb-3">{h}</h3>
              <p className="text-slate-soft leading-relaxed">{p}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="max-w-3xl">
          <p className="eyebrow mb-6">Arrondissements de prédilection</p>
          <p className="body-lg mb-10 reveal">
            Le tissu haussmannien irrigue une grande partie de Paris, mais quelques arrondissements concentrent les biens
            les plus aboutis.
          </p>
          <div className="space-y-8">
            {[
              ["Paris 8e", "Triangle d'Or, Monceau, Champs-Élysées — adresses d'apparat, immeubles de grand standing."],
              ["Paris 16e", "Passy, Trocadéro, Auteuil, Victor Hugo — familles et patrimoine, vues sur Seine et Tour Eiffel."],
              ["Paris 17e", "Plaine Monceau, Courcelles, Pereire — élégance résidentielle et calme préservé."],
              ["Paris 7e", "Invalides, Gros-Caillou, Champ-de-Mars — l'art de vivre de la Rive Gauche."],
              ["Paris 6e & 9e", "Saint-Germain et Trinité — biens haussmanniens plus rares, très recherchés."],
            ].map(([h, p]) => (
              <div key={h} className="grid grid-cols-[120px_1fr] gap-6 reveal pb-6 border-b border-hairline">
                <p className="numeral text-sm tracking-[0.2em] text-foreground">{h}</p>
                <p className="text-slate-soft leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="bg-bone">
        <div className="max-w-2xl">
          <p className="eyebrow mb-6">Repères de marché</p>
          <p className="body-lg mb-7 reveal">
            Les prix d'un appartement haussmannien dit "de famille" évoluent généralement entre 12 000 € et 25 000 € le mètre carré,
            selon l'arrondissement, l'étage, l'état et la qualité des éléments d'origine. Les biens d'exception — vue dégagée,
            triple exposition, hauteur sous plafond supérieure à 3,50 m — dépassent régulièrement ces fourchettes.
          </p>
          <p className="body-lg mb-7 reveal">
            Une part significative de ces biens ne sont jamais diffusés publiquement et se traitent en off-market, par
            l'intermédiaire de réseaux confidentiels.
          </p>
          <Link to="/blog/off-market-properties-paris-buyers-guide" className="link-underline text-sm">
            Lire notre guide off-market →
          </Link>
        </div>
      </Section>

      <Section>
        <div className="max-w-3xl">
          <p className="eyebrow mb-6">L'accompagnement Neova</p>
          <p className="body-lg mb-10 reveal">
            Nous intervenons en chasseur d'appartement exclusif côté acquéreur : définition fine du cahier des charges,
            accès aux biens off-market, sélection rigoureuse, négociation, expertise technique et coordination des travaux
            si rénovation. Une seule équipe, du premier rendez-vous à la remise des clés.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/find-your-property" className="btn-line !py-3 !px-5">Démarrer une recherche</Link>
            <Link to="/projects" className="btn-line !py-3 !px-5">Voir nos réalisations</Link>
          </div>
        </div>
      </Section>
    </SiteShell>
  );
};

export default AppartementHaussmannien;