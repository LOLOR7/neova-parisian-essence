import victorHugo from "@/assets/project-victor-hugo.jpg";
import kleber from "@/assets/project-kleber.jpg";
import georgeV from "@/assets/project-george-v.jpg";
import marceau from "@/assets/project-marceau.jpg";
import grandPalais from "@/assets/project-grand-palais.jpg";

export type Project = {
  slug: string;
  name: string;
  location: string;
  surface: string;
  type: string;
  description: string;
  image: string;
  before?: string;
  after?: string;
};

import before1 from "@/assets/before-1.jpg";
import after1 from "@/assets/after-1.jpg";
import before2 from "@/assets/before-2.jpg";
import after2 from "@/assets/after-2.jpg";

export const projects: Project[] = [
  {
    slug: "victor-hugo",
    name: "Victor Hugo",
    location: "Paris XVI",
    surface: "295 m²",
    type: "Rénovation complète",
    description:
      "Restructuration intégrale d'un appartement haussmannien : restauration des moulures, parquet point de Hongrie, redistribution des volumes et intégration technique discrète.",
    image: victorHugo,
    before: before1,
    after: after1,
  },
  {
    slug: "kleber",
    name: "Avenue Kléber",
    location: "Paris XVI",
    surface: "180 m²",
    type: "Rénovation et menuiserie sur mesure",
    description:
      "Cuisine sur mesure, marbre et laiton brossé, éclairage intégré. Une cohérence matérielle au service du quotidien.",
    image: kleber,
    before: before2,
    after: after2,
  },
  {
    slug: "george-v",
    name: "Avenue George V",
    location: "Paris VIII",
    surface: "180 m²",
    type: "Rénovation et architecture intérieure",
    description:
      "Volumes apaisés, palette de pierre et lin, conservation des éléments d'origine. Un appartement habité, sans surenchère.",
    image: georgeV,
  },
  {
    slug: "marceau",
    name: "Avenue Marceau",
    location: "Paris VIII",
    surface: "160 m²",
    type: "Rénovation des pièces d'eau",
    description:
      "Salles de bains en marbre, robinetterie laiton, douches à l'italienne. Précision technique et matières nobles.",
    image: marceau,
  },
  {
    slug: "grand-palais",
    name: "Face au Grand Palais",
    location: "Paris VIII",
    surface: "180 m²",
    type: "Rénovation complète",
    description:
      "Rénovation d'un appartement avec vue exceptionnelle. Travail sur la lumière, le cadrage des ouvertures et la continuité matérielle.",
    image: grandPalais,
  },
];
