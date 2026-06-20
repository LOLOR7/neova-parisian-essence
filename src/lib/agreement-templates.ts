// Static registry of agreement templates available to admins.
// Drop the original PDF here later (uploaded as a Lovable asset) and set
// `originalPdfUrl` to its CDN url — no other code change needed.

export type AgreementCategory =
  | "Accord client"
  | "Accord professionnel"
  | "Mandat / Mission"
  | "Renovation"
  | "Property finder"
  | "Management";

export type AgreementTemplate = {
  id: string;
  name: string;
  description: string;
  category: AgreementCategory;
  /** Public/asset URL to the *original* signed PDF, shown via "Télécharger original". */
  originalPdfUrl: string | null;
  /** Last update label for the card (string is fine — no version DB yet). */
  updatedAt: string;
  /** Free-form clauses rendered into the generated agreement summary. */
  clauses: string[];
};

export const AGREEMENT_TEMPLATES: AgreementTemplate[] = [
  {
    id: "client-professional-contract",
    name: "Accord Client / Professionnel — Architecte & Contractants",
    description:
      "Cadre contractuel entre le client, Neova et le professionnel sélectionné pour un projet de rénovation ou d'aménagement.",
    category: "Accord professionnel",
    originalPdfUrl: null,
    updatedAt: "2026-06-20",
    clauses: [
      "Le présent accord encadre la mise en relation et la mission confiée par le Client au Professionnel, sous la supervision de Neova.",
      "Le Professionnel s'engage à respecter le périmètre du projet, le budget validé et le calendrier convenu.",
      "Toute modification du périmètre fait l'objet d'un avenant écrit, signé par les trois parties.",
      "Les honoraires de Neova restent dus en cas de réalisation directe entre le Client et le Professionnel pendant une période de 24 mois.",
    ],
  },
  {
    id: "property-management-agreement",
    name: "Mandat de Gestion — Property Management",
    description:
      "Mandat confié à Neova pour la gestion locative et opérationnelle d'un bien situé à Paris.",
    category: "Management",
    originalPdfUrl: null,
    updatedAt: "2026-06-20",
    clauses: [
      "Le Mandant confie à Neova la gestion du bien désigné ci-dessous pour une durée initiale de 12 mois, renouvelable par tacite reconduction.",
      "Neova assure la recherche de locataires, la rédaction des baux, l'encaissement des loyers, le suivi technique et la coordination des prestataires.",
      "Les honoraires de gestion sont fixés en pourcentage des loyers encaissés, conformément aux conditions financières indiquées.",
      "Le Mandant peut résilier le mandat moyennant un préavis de 3 mois, par lettre recommandée.",
    ],
  },
  {
    id: "agent-referral-fee-protection",
    name: "Agent Referral & Fee Protection Agreement",
    description:
      "Accord de protection de commission entre Neova et un partenaire (agent, apporteur d'affaires) sur une opération identifiée.",
    category: "Accord professionnel",
    originalPdfUrl: null,
    updatedAt: "2026-06-20",
    clauses: [
      "Le Partenaire reconnaît avoir présenté l'opération à Neova et accepte que toute transaction conclue avec le Client identifié ouvre droit à la commission convenue.",
      "La commission est due dès la signature de l'acte authentique ou du contrat principal entre le Client et Neova (ou toute société affiliée).",
      "Le présent accord est valable 24 mois à compter de sa signature.",
      "Tout litige relatif à l'interprétation ou à l'exécution du présent accord relève des tribunaux compétents de Paris.",
    ],
  },
];

export const getTemplate = (id: string) =>
  AGREEMENT_TEMPLATES.find((t) => t.id === id) ?? null;
