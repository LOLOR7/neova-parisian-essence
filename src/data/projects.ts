import victorHugo from "@/assets/project-victor-hugo.jpg";
import kleber from "@/assets/project-kleber.jpg";
import georgeV from "@/assets/project-george-v.jpg";
import marceau from "@/assets/project-marceau.jpg";
import grandPalais from "@/assets/project-grand-palais.jpg";
import before1 from "@/assets/before-1.jpg";
import after1 from "@/assets/after-1.jpg";
import before2 from "@/assets/before-2.jpg";
import after2 from "@/assets/after-2.jpg";

export type Project = {
  slug: string;
  name: string;
  index: string;
  location: { en: string; fr: string };
  surface: string;
  type: { en: string; fr: string };
  description: { en: string; fr: string };
  image: string;
  before?: string;
  after?: string;
};

export const projects: Project[] = [
  {
    slug: "victor-hugo", index: "I",
    name: "Victor Hugo",
    location: { en: "Paris XVI", fr: "Paris XVI" },
    surface: "295 m²",
    type: { en: "Full renovation", fr: "Rénovation complète" },
    description: {
      en: "Integral restructuring of a Haussmannian apartment: restoration of mouldings, point-de-Hongrie parquet, redistribution of volumes, and discreet technical integration.",
      fr: "Restructuration intégrale d'un appartement haussmannien : restauration des moulures, parquet point de Hongrie, redistribution des volumes et intégration technique discrète.",
    },
    image: victorHugo, before: before1, after: after1,
  },
  {
    slug: "kleber", index: "II",
    name: "Avenue Kléber",
    location: { en: "Paris XVI", fr: "Paris XVI" },
    surface: "180 m²",
    type: { en: "Renovation & custom joinery", fr: "Rénovation et menuiserie sur mesure" },
    description: {
      en: "Bespoke kitchen, marble and brushed brass, integrated lighting. Material coherence in service of daily life.",
      fr: "Cuisine sur mesure, marbre et laiton brossé, éclairage intégré. Une cohérence matérielle au service du quotidien.",
    },
    image: kleber, before: before2, after: after2,
  },
  {
    slug: "george-v", index: "III",
    name: "Avenue George V",
    location: { en: "Paris VIII", fr: "Paris VIII" },
    surface: "180 m²",
    type: { en: "Renovation & interior architecture", fr: "Rénovation et architecture intérieure" },
    description: {
      en: "Calmed volumes, palette of stone and linen, conservation of original elements. An apartment inhabited, without excess.",
      fr: "Volumes apaisés, palette de pierre et lin, conservation des éléments d'origine. Un appartement habité, sans surenchère.",
    },
    image: georgeV,
  },
  {
    slug: "marceau", index: "IV",
    name: "Avenue Marceau",
    location: { en: "Paris VIII", fr: "Paris VIII" },
    surface: "160 m²",
    type: { en: "Bathrooms renovation", fr: "Rénovation des pièces d'eau" },
    description: {
      en: "Marble bathrooms, brass fittings, walk-in showers. Technical precision and noble materials.",
      fr: "Salles de bains en marbre, robinetterie laiton, douches à l'italienne. Précision technique et matières nobles.",
    },
    image: marceau,
  },
  {
    slug: "grand-palais", index: "V",
    name: "Face au Grand Palais",
    location: { en: "Paris VIII", fr: "Paris VIII" },
    surface: "180 m²",
    type: { en: "Full renovation", fr: "Rénovation complète" },
    description: {
      en: "Renovation of an apartment with an exceptional view. Work on light, framing of openings, and material continuity.",
      fr: "Rénovation d'un appartement avec vue exceptionnelle. Travail sur la lumière, le cadrage des ouvertures et la continuité matérielle.",
    },
    image: grandPalais,
  },
];
