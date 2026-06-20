// Static registry of agreement templates available to admins.
// Originals are the official DOCX files, stored privately in the `agreements`
// Storage bucket under `templates/<slug>.docx`. The admin UI generates a
// short-lived signed URL on demand for download.

export type AgreementCategory =
  | "Accord client"
  | "Accord professionnel"
  | "Mandat / Mission"
  | "Renovation"
  | "Property finder"
  | "Management";

export type AgreementSection =
  | "parties"
  | "objet"
  | "mission"
  | "honoraires"
  | "conditions"
  | "signatures";

export const SECTION_LABELS: Record<AgreementSection, string> = {
  parties: "Parties",
  objet: "Objet de l'accord",
  mission: "Périmètre & mission",
  honoraires: "Honoraires & conditions financières",
  conditions: "Conditions particulières",
  signatures: "Signatures",
};

export type PrefillSource =
  | "name"
  | "email"
  | "phone"
  | "location"
  | "requestType"
  | "requestRef"
  | "budget"
  | "surface"
  | "today";

export type AgreementFieldType = "text" | "textarea" | "date" | "email" | "tel";

export type AgreementField = {
  key: string;
  label: string;
  type: AgreementFieldType;
  section: AgreementSection;
  prefillFrom?: PrefillSource;
  placeholder?: string;
  /** Layout hint for the form grid. Default "half". */
  span?: "half" | "full";
  /** Default value if no prefill is available. */
  defaultValue?: string;
};

export type AgreementTemplate = {
  id: string;
  name: string;
  description: string;
  category: AgreementCategory;
  /** Format of the original source template. */
  originalFormat: "docx";
  /** Path inside the private `agreements` Storage bucket. */
  originalDocxPath: string | null;
  /** Suggested filename when the admin downloads the original. */
  originalFilename: string;
  /** Last update label for the card (string is fine — no version DB yet). */
  updatedAt: string;
  /** Editable schema rendered by the preparation page and the PDF generator. */
  fields: AgreementField[];
  /** Boilerplate legal clauses appended after "Conditions particulières". */
  clauses: string[];
};

// Common fields reused across templates.
const dateField: AgreementField = {
  key: "date",
  label: "Date de l'accord",
  type: "date",
  section: "objet",
  prefillFrom: "today",
};

const neovaSignature: AgreementField = {
  key: "sig_neova",
  label: "Pour Neova Space",
  type: "text",
  section: "signatures",
  defaultValue: "Neova Space — Direction",
};

export const AGREEMENT_TEMPLATES: AgreementTemplate[] = [
  {
    id: "client-professional-contract",
    name: "Accord Client / Professionnel — Architecte & Contractants",
    description:
      "Cadre contractuel entre le client, Neova et le professionnel sélectionné pour un projet de rénovation ou d'aménagement.",
    category: "Accord professionnel",
    originalFormat: "docx",
    originalDocxPath: "templates/client-professional-contract.docx",
    originalFilename: "Archi-Contractors-Client-Professional-Contracts.docx",
    updatedAt: "2026-06-20",
    fields: [
      // Parties
      { key: "clientName", label: "Nom du client", type: "text", section: "parties", prefillFrom: "name" },
      { key: "clientEmail", label: "Email client", type: "email", section: "parties", prefillFrom: "email" },
      { key: "clientPhone", label: "Téléphone client", type: "tel", section: "parties", prefillFrom: "phone" },
      { key: "professionalName", label: "Nom du professionnel", type: "text", section: "parties" },
      { key: "professionalRole", label: "Rôle / spécialité", type: "text", section: "parties", placeholder: "Architecte, contractant général…" },
      // Objet
      { key: "requestReference", label: "Référence demande", type: "text", section: "objet", prefillFrom: "requestRef" },
      { key: "projectType", label: "Type de projet", type: "text", section: "objet", prefillFrom: "requestType" },
      { key: "projectAddress", label: "Adresse du projet", type: "text", section: "objet", prefillFrom: "location", span: "full" },
      dateField,
      // Mission
      { key: "missionScope", label: "Périmètre de la mission", type: "textarea", section: "mission", span: "full", placeholder: "Décrire les prestations confiées au professionnel." },
      { key: "startDate", label: "Date de démarrage", type: "date", section: "mission" },
      // Honoraires
      { key: "feeTerms", label: "Honoraires & commission", type: "textarea", section: "honoraires", span: "full", placeholder: "Montant, échéances, commission Neova…" },
      // Conditions
      { key: "specialConditions", label: "Conditions particulières", type: "textarea", section: "conditions", span: "full" },
      // Signatures
      neovaSignature,
      { key: "sig_client", label: "Le Client", type: "text", section: "signatures", prefillFrom: "name" },
      { key: "sig_professional", label: "Le Professionnel", type: "text", section: "signatures" },
    ],
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
    originalFormat: "docx",
    originalDocxPath: "templates/property-management-agreement.docx",
    originalFilename: "Property-Management-Agreement.docx",
    updatedAt: "2026-06-20",
    fields: [
      // Parties
      { key: "ownerName", label: "Nom du mandant / propriétaire", type: "text", section: "parties", prefillFrom: "name" },
      { key: "ownerEmail", label: "Email mandant", type: "email", section: "parties", prefillFrom: "email" },
      { key: "ownerPhone", label: "Téléphone mandant", type: "tel", section: "parties", prefillFrom: "phone" },
      { key: "emergencyContact", label: "Contact d'urgence", type: "text", section: "parties", placeholder: "Nom + téléphone" },
      // Objet
      { key: "propertyAddress", label: "Adresse du bien", type: "text", section: "objet", prefillFrom: "location", span: "full" },
      { key: "requestReference", label: "Référence demande", type: "text", section: "objet", prefillFrom: "requestRef" },
      dateField,
      // Mission
      { key: "managementScope", label: "Périmètre de gestion", type: "textarea", section: "mission", span: "full", placeholder: "Recherche locataires, baux, encaissement, suivi technique…" },
      { key: "maintenanceConditions", label: "Conditions de maintenance", type: "textarea", section: "mission", span: "full" },
      { key: "reportingFrequency", label: "Fréquence de reporting", type: "text", section: "mission", placeholder: "Mensuel, trimestriel…" },
      { key: "startDate", label: "Date de prise d'effet", type: "date", section: "mission" },
      // Honoraires
      { key: "feeAmount", label: "Honoraires (mensuel / annuel)", type: "text", section: "honoraires", span: "full", placeholder: "Ex : 8% des loyers encaissés HT" },
      // Conditions
      { key: "specialConditions", label: "Conditions particulières", type: "textarea", section: "conditions", span: "full" },
      // Signatures
      neovaSignature,
      { key: "sig_owner", label: "Le Mandant", type: "text", section: "signatures", prefillFrom: "name" },
    ],
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
    originalFormat: "docx",
    originalDocxPath: "templates/agent-referral-fee-protection.docx",
    originalFilename: "Agent-Referral-Fee-Protection-Agreement.docx",
    updatedAt: "2026-06-20",
    fields: [
      // Parties
      { key: "agentName", label: "Agent référent", type: "text", section: "parties" },
      { key: "agentEmail", label: "Email agent", type: "email", section: "parties" },
      { key: "agentPhone", label: "Téléphone agent", type: "tel", section: "parties" },
      { key: "referredClientName", label: "Client référé", type: "text", section: "parties", prefillFrom: "name" },
      // Objet
      { key: "opportunityReference", label: "Référence opération / bien", type: "text", section: "objet", prefillFrom: "location", span: "full" },
      { key: "requestReference", label: "Référence demande Neova", type: "text", section: "objet", prefillFrom: "requestRef" },
      dateField,
      // Mission
      { key: "feeTrigger", label: "Fait générateur de la commission", type: "textarea", section: "mission", span: "full", placeholder: "Signature acte authentique, mandat signé…" },
      { key: "exclusivityDuration", label: "Durée d'exclusivité / protection", type: "text", section: "mission", placeholder: "Ex : 24 mois" },
      // Honoraires
      { key: "commissionFee", label: "Commission / honoraires de référencement", type: "text", section: "honoraires", span: "full" },
      { key: "paymentTiming", label: "Modalités de paiement", type: "textarea", section: "honoraires", span: "full" },
      // Conditions
      { key: "specialConditions", label: "Conditions particulières", type: "textarea", section: "conditions", span: "full" },
      // Signatures
      neovaSignature,
      { key: "sig_agent", label: "L'Agent référent", type: "text", section: "signatures" },
    ],
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

/** Returns a per-template empty values map with defaults applied. */
export const initialValuesFor = (t: AgreementTemplate): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const f of t.fields) {
    if (f.defaultValue) out[f.key] = f.defaultValue;
    else if (f.prefillFrom === "today") out[f.key] = new Date().toISOString().slice(0, 10);
    else out[f.key] = "";
  }
  return out;
};

/** Apply a request payload to a values map using each field's prefillFrom. */
export const applyPrefill = (
  t: AgreementTemplate,
  values: Record<string, string>,
  src: Partial<Record<PrefillSource, string>>,
): Record<string, string> => {
  const out = { ...values };
  for (const f of t.fields) {
    if (!f.prefillFrom) continue;
    const v = src[f.prefillFrom];
    if (v && !out[f.key]) out[f.key] = v;
  }
  return out;
};

export const fieldsBySection = (t: AgreementTemplate): Record<AgreementSection, AgreementField[]> => {
  const groups: Record<AgreementSection, AgreementField[]> = {
    parties: [], objet: [], mission: [], honoraires: [], conditions: [], signatures: [],
  };
  for (const f of t.fields) groups[f.section].push(f);
  return groups;
};
