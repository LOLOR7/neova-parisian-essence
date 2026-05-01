/**
 * DocuSign service — PLACEHOLDER
 * =====================================================================
 * This module centralises all DocuSign workflow logic for Neova.
 *
 * Real DocuSign sending is NOT yet wired. To activate:
 *   1. Create the 3 templates in your DocuSign account:
 *        - "Neova - Client Representation Agreement"
 *        - "Neova - Agent Referral Agreement"
 *        - "Neova - Viewing Introduction Confirmation"
 *   2. Add the following secrets in Lovable Cloud:
 *        DOCUSIGN_INTEGRATION_KEY
 *        DOCUSIGN_USER_ID
 *        DOCUSIGN_ACCOUNT_ID
 *        DOCUSIGN_BASE_URL              (e.g. https://demo.docusign.net/restapi)
 *        DOCUSIGN_PRIVATE_KEY           (RSA private key for JWT grant)
 *        DOCUSIGN_TEMPLATE_CLIENT_REPRESENTATION
 *        DOCUSIGN_TEMPLATE_AGENT_REFERRAL
 *        DOCUSIGN_TEMPLATE_VIEWING_CONFIRMATION
 *        DOCUSIGN_WEBHOOK_SECRET        (HMAC secret for DocuSign Connect)
 *   3. The edge function `docusign-send-envelope` will then create
 *      envelopes from templates and `docusign-webhook` will receive
 *      Connect events to update statuses automatically.
 * =====================================================================
 */

export type DemandStatus =
  | "DEMAND_SUBMITTED"
  | "CLIENT_AGREEMENT_SENT"
  | "CLIENT_SIGNED_PENDING_NEOVA"
  | "CLIENT_AGREEMENT_SIGNED"
  | "SHARED_WITH_AGENTS"
  | "CLOSED";

export type OptionStatus =
  | "AGENT_OPTION_SUBMITTED"
  | "AGENT_AGREEMENT_SENT"
  | "AGENT_SIGNED_PENDING_NEOVA"
  | "AGENT_AGREEMENT_SIGNED"
  | "SENT_TO_CLIENT"
  | "REJECTED";

export type ViewingStatus =
  | "VIEWING_REQUESTED"
  | "VIEWING_CONFIRMATION_SENT"
  | "VIEWING_CLIENT_SIGNED"
  | "VIEWING_AGENT_SIGNED"
  | "VIEWING_CONFIRMATION_SIGNED"
  | "VIEWING_SCHEDULED";

export const DEMAND_STATUS_LABEL: Record<DemandStatus, string> = {
  DEMAND_SUBMITTED: "Demande reçue",
  CLIENT_AGREEMENT_SENT: "Accord client envoyé",
  CLIENT_SIGNED_PENDING_NEOVA: "Signé client — en attente Neova",
  CLIENT_AGREEMENT_SIGNED: "Accord client signé",
  SHARED_WITH_AGENTS: "Partagée avec le réseau",
  CLOSED: "Clôturée",
};

export const OPTION_STATUS_LABEL: Record<OptionStatus, string> = {
  AGENT_OPTION_SUBMITTED: "Option soumise",
  AGENT_AGREEMENT_SENT: "Accord agent envoyé",
  AGENT_SIGNED_PENDING_NEOVA: "Signé agent — en attente Neova",
  AGENT_AGREEMENT_SIGNED: "Accord agent signé",
  SENT_TO_CLIENT: "Envoyée au client",
  REJECTED: "Refusée",
};

export const VIEWING_STATUS_LABEL: Record<ViewingStatus, string> = {
  VIEWING_REQUESTED: "Visite demandée",
  VIEWING_CONFIRMATION_SENT: "Confirmation envoyée",
  VIEWING_CLIENT_SIGNED: "Signée par le client",
  VIEWING_AGENT_SIGNED: "Signée par l'agent",
  VIEWING_CONFIRMATION_SIGNED: "Confirmation signée",
  VIEWING_SCHEDULED: "Visite planifiée",
};

export const STATUS_TONE: Record<string, string> = {
  // demand
  DEMAND_SUBMITTED: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  CLIENT_AGREEMENT_SENT: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  CLIENT_SIGNED_PENDING_NEOVA: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  CLIENT_AGREEMENT_SIGNED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  SHARED_WITH_AGENTS: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  // option
  AGENT_OPTION_SUBMITTED: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  AGENT_AGREEMENT_SENT: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  AGENT_SIGNED_PENDING_NEOVA: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  AGENT_AGREEMENT_SIGNED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  SENT_TO_CLIENT: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  // viewing
  VIEWING_REQUESTED: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  VIEWING_CONFIRMATION_SENT: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  VIEWING_CLIENT_SIGNED: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  VIEWING_AGENT_SIGNED: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  VIEWING_CONFIRMATION_SIGNED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  VIEWING_SCHEDULED: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  CLOSED: "bg-slate-50 text-slate-500 ring-1 ring-slate-200",
};

export type TemplateType =
  | "CLIENT_REPRESENTATION"
  | "AGENT_REFERRAL"
  | "PROFESSIONAL_REFERRAL"
  | "VIEWING_CONFIRMATION";

export const TEMPLATE_LABEL: Record<TemplateType, string> = {
  CLIENT_REPRESENTATION: "Neova - Client Representation Agreement",
  AGENT_REFERRAL: "Neova - Agent Referral Agreement",
  PROFESSIONAL_REFERRAL: "Neova - Professional Referral Agreement",
  VIEWING_CONFIRMATION: "Neova - Viewing Introduction Confirmation",
};

/* ---------- Workflow phase + professional types ---------- */

export type RequestType =
  | "REAL_ESTATE_ONLY"
  | "REAL_ESTATE_AND_PROJECT"
  | "PROJECT_ONLY";

export const REQUEST_TYPE_LABEL: Record<RequestType, string> = {
  REAL_ESTATE_ONLY: "Recherche immobilière uniquement",
  REAL_ESTATE_AND_PROJECT: "Recherche + projet de rénovation",
  PROJECT_ONLY: "Projet sur bien existant",
};

export type PhaseStatus = "NOT_APPLICABLE" | "LOCKED" | "ACTIVE" | "COMPLETED";

export const PHASE_STATUS_LABEL: Record<PhaseStatus, string> = {
  NOT_APPLICABLE: "Non applicable",
  LOCKED: "Verrouillée",
  ACTIVE: "Active",
  COMPLETED: "Terminée",
};

export const PHASE_TONE: Record<PhaseStatus, string> = {
  NOT_APPLICABLE: "bg-slate-50 text-slate-400 ring-1 ring-slate-200",
  LOCKED: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  COMPLETED: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
};

export type ProfessionalType = "ARCHITECT" | "CONTRACTOR" | "DEVELOPER" | "OTHER";

export const PROFESSIONAL_TYPE_LABEL: Record<ProfessionalType, string> = {
  ARCHITECT: "Architecte",
  CONTRACTOR: "Entrepreneur",
  DEVELOPER: "Promoteur",
  OTHER: "Autre",
};

export type ProfessionalStatus =
  | "PROFESSIONAL_SELECTED"
  | "PROFESSIONAL_AGREEMENT_SENT"
  | "PROFESSIONAL_SIGNED_PENDING_NEOVA"
  | "PROFESSIONAL_AGREEMENT_SIGNED"
  | "INTRODUCTION_UNLOCKED"
  | "INTRODUCED_TO_CLIENT";

export const PROFESSIONAL_STATUS_LABEL: Record<ProfessionalStatus, string> = {
  PROFESSIONAL_SELECTED: "Sélectionné",
  PROFESSIONAL_AGREEMENT_SENT: "Accord envoyé",
  PROFESSIONAL_SIGNED_PENDING_NEOVA: "Signé pro — en attente Neova",
  PROFESSIONAL_AGREEMENT_SIGNED: "Accord signé",
  INTRODUCTION_UNLOCKED: "Introduction débloquée",
  INTRODUCED_TO_CLIENT: "Introduit au client",
};

export type PaymentStatus = "NOT_REQUIRED" | "PENDING" | "PAID" | "FAILED";

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  NOT_REQUIRED: "Non requis",
  PENDING: "En attente",
  PAID: "Payé",
  FAILED: "Échec",
};

export const PAYMENT_TONE: Record<PaymentStatus, string> = {
  NOT_REQUIRED: "bg-slate-50 text-slate-500 ring-1 ring-slate-200",
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  PAID: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  FAILED: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
};

/**
 * Returns true if DocuSign is fully configured.
 * For now we cannot read backend env vars from the client, so we keep
 * a single client-side flag stored in localStorage that the admin
 * settings page flips after entering the template IDs. The real check
 * happens server-side inside the edge function.
 */
export const isDocuSignConfigured = (): boolean => {
  try {
    return localStorage.getItem("neova_docusign_ready") === "1";
  } catch {
    return false;
  }
};

export const setDocuSignConfigured = (v: boolean) => {
  try {
    if (v) localStorage.setItem("neova_docusign_ready", "1");
    else localStorage.removeItem("neova_docusign_ready");
  } catch {}
};

export const NOT_CONFIGURED_MESSAGE =
  "DocuSign n'est pas encore configuré. Ajoutez les identifiants et Template IDs pour activer l'envoi.";