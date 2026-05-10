export type ParisProject = {
  slug: string;
  num: number;
  roman: string;
  index: string; // "01 / 04"
  locationLabel: string;
  title: string;
  captions: string[];
  hero: string; // public path
  images: string[]; // public paths
};

const buildImages = (prefix: string, count: number): string[] =>
  Array.from({ length: count }, (_, i) => `/projects/paris-${prefix}/${prefix.replace(/-.*/, "")}-${String(i + 1).padStart(2, "0")}.jpg`);

const imgs7 = buildImages("7eme-ze", 5);
const imgs8 = buildImages("8eme-st", 4);
const imgs15 = buildImages("15eme-pb", 24);
const imgs16 = buildImages("16eme-lj", 18);

export const parisProjects: ParisProject[] = [
  {
    slug: "paris-7eme-ze",
    num: 7, roman: "VIIᵉ", index: "01 / 04",
    locationLabel: "Paris · VIIᵉ",
    title: "7e Arrondissement",
    captions: ["Pure lines.", "Noble materials.", "Silent elegance."],
    hero: imgs7[1], // IMG_5894
    images: imgs7,
  },
  {
    slug: "paris-8eme-st",
    num: 8, roman: "VIIIᵉ", index: "02 / 04",
    locationLabel: "Paris · VIIIᵉ",
    title: "8e Arrondissement",
    captions: ["Haussmannian volumes.", "Crafted detail.", "Warm restraint."],
    hero: imgs8[3], // L1080358
    images: imgs8,
  },
  {
    slug: "paris-15eme-pb",
    num: 15, roman: "XVᵉ", index: "03 / 04",
    locationLabel: "Paris · XVᵉ",
    title: "15e Arrondissement",
    captions: ["Quiet light.", "Restored mouldings.", "Daily refinement."],
    hero: imgs15[4], // IMG_4897
    images: imgs15,
  },
  {
    slug: "paris-16eme-lj",
    num: 16, roman: "XVIᵉ", index: "04 / 04",
    locationLabel: "Paris · XVIᵉ",
    title: "16e Arrondissement",
    captions: ["Generous spaces.", "Curated palette.", "Parisian horizon."],
    hero: imgs16[7], // IMG_6428
    images: imgs16,
  },
];
