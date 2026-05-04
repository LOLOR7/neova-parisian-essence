import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout, Card, PrimaryButton, SecondaryButton } from "./AdminLayout";
import { toast } from "sonner";
import {
  FileSignature,
  Send,
  CheckCircle2,
  Lock,
  Plus,
  AlertTriangle,
  Eye,
  ChevronRight,
  Settings,
  RefreshCw,
  Clock,
  Building2,
  Hammer,
  HardHat,
  Briefcase,
  Banknote,
  UserCheck,
} from "lucide-react";
import {
  DEMAND_STATUS_LABEL,
  OPTION_STATUS_LABEL,
  VIEWING_STATUS_LABEL,
  STATUS_TONE,
  REQUEST_TYPE_LABEL,
  PHASE_STATUS_LABEL,
  PHASE_TONE,
  PROFESSIONAL_TYPE_LABEL,
  PROFESSIONAL_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYMENT_TONE,
  DOCUSIGN_MODE,
  isManualDocuSign,
  MANUAL_MODE_BANNER,
  buildClientAgreementCopyText,
  buildProfessionalAgreementCopyText,
  phasePatchForSignedClientAgreement,
  type DemandStatus,
  type OptionStatus,
  type ViewingStatus,
  type RequestType,
  type PhaseStatus,
  type ProfessionalType,
  type ProfessionalStatus,
  type PaymentStatus,
} from "@/lib/docusign";
import { sendAdminNotification } from "@/lib/notifications";

/* ---------- Types ---------- */
type Demand = {
  id: string;
  demand_reference: string | null;
  name: string;
  email: string;
  location: string | null;
  budget: string | null;
  status: string;
  request_type: RequestType | null;
  client_agreement_status: string | null;
  phase_1_status: PhaseStatus | null;
  phase_2_status: PhaseStatus | null;
  property_deal_status: string | null;
  selected_professional_types: string | null;
  docusign_envelope_id: string | null;
  created_at: string;
  price_per_sqm?: string | null;
  message?: string | null;
};
type AgentOption = {
  id: string;
  option_reference: string | null;
  demand_id: string;
  agent_name: string;
  agency_name: string | null;
  agent_email: string;
  property_address: string | null;
  property_reference: string | null;
  asking_price: string | null;
  status: string;
  docusign_envelope_id: string | null;
  created_at: string;
};
type Professional = {
  id: string;
  professional_reference: string | null;
  demand_id: string;
  professional_type: ProfessionalType;
  professional_name: string;
  company_name: string | null;
  professional_email: string;
  professional_phone: string | null;
  commitment_fee: string | null;
  success_fee: string | null;
  status: ProfessionalStatus;
  payment_status: PaymentStatus;
  docusign_envelope_id: string | null;
  created_at: string;
};
type Viewing = {
  id: string;
  demand_id: string;
  option_id: string;
  client_name: string | null;
  agent_name: string | null;
  property_address: string | null;
  viewing_date: string | null;
  status: string;
  docusign_envelope_id: string | null;
  created_at: string;
};
type EnvelopeRow = {
  id: string;
  envelope_id: string | null;
  template_type: string;
  related_entity_type: string;
  related_entity_id: string;
  status: string;
  signers: Array<{
    roleName?: string | null;
    name?: string | null;
    email?: string | null;
    status?: string | null;
    signedDateTime?: string | null;
  }> | null;
  sent_at: string | null;
  completed_at: string | null;
  created_at: string;
};

/* ---------- DocuSign status line ---------- */
const DocuSignStatusLine = ({
  envelope,
  onSync,
}: {
  envelope: EnvelopeRow | null;
  onSync?: () => void;
}) => {
  if (!envelope) return null;
  const status = (envelope.status || "").toLowerCase();
  const completed = status === "completed";
  let label = "Enveloppe envoyée";
  let tone = "bg-slate-100 text-slate-700 ring-slate-200";
  if (completed) {
    label = "Signature complète";
    tone = "bg-emerald-50 text-emerald-700 ring-emerald-200";
  } else if (envelope.signers && envelope.signers.length > 0) {
    const waiting = envelope.signers.find(
      (s) => (s.status || "").toLowerCase() !== "completed" && (s.status || "").toLowerCase() !== "signed"
    );
    if (waiting) {
      const role = (waiting.roleName || "").toLowerCase();
      if (role.includes("admin") || role.includes("neova")) label = "En attente de Neova Admin";
      else if (role.includes("client")) label = "En attente du client";
      else if (role.includes("professional")) label = "En attente du professionnel";
      else if (role.includes("agent")) label = "En attente de l'agent";
      else if (waiting.roleName) label = `En attente de ${waiting.roleName}`;
      else label = "En attente de signature";
      tone = "bg-amber-50 text-amber-800 ring-amber-200";
    } else {
      label = "Signature complète";
      tone = "bg-emerald-50 text-emerald-700 ring-emerald-200";
    }
  } else {
    label = "Enveloppe envoyée — en attente de signature";
    tone = "bg-amber-50 text-amber-800 ring-amber-200";
  }
  return (
    <div className="mt-3 flex items-center gap-2 flex-wrap">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full ring-1 ${tone}`}>
        {completed ? <CheckCircle2 size={12} /> : <Clock size={12} />}
        DocuSign : {label}
      </span>
      {onSync && !completed && (
        <button
          onClick={onSync}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Rafraîchir le statut DocuSign"
        >
          <RefreshCw size={11} /> Rafraîchir
        </button>
      )}
    </div>
  );
};

/* ---------- Helpers ---------- */
const Pill = ({ s }: { s: string }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium rounded-full ${
      STATUS_TONE[s] || "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
    }`}
  >
    {DEMAND_STATUS_LABEL[s as DemandStatus] ||
      OPTION_STATUS_LABEL[s as OptionStatus] ||
      VIEWING_STATUS_LABEL[s as ViewingStatus] ||
      PROFESSIONAL_STATUS_LABEL[s as ProfessionalStatus] ||
      s}
  </span>
);

const PhaseBadge = ({ s, label }: { s: PhaseStatus; label: string }) => (
  <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium rounded-full ${PHASE_TONE[s]}`}>
    {label} : {PHASE_STATUS_LABEL[s]}
  </span>
);

const ProTypeIcon = ({ t }: { t: ProfessionalType }) => {
  const I = t === "ARCHITECT" ? Hammer : t === "CONTRACTOR" ? HardHat : t === "DEVELOPER" ? Building2 : Briefcase;
  return <I size={14} className="text-slate-500" />;
};

/* ---------- Page ---------- */
const AdminWorkflow = () => {
  const [tab, setTab] = useState<"demandes" | "phase1" | "phase2" | "visites">("demandes");
  const [demands, setDemands] = useState<Demand[]>([]);
  const [options, setOptions] = useState<AgentOption[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [envelopes, setEnvelopes] = useState<EnvelopeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [configCheck, setConfigCheck] = useState<{ ok: boolean; message?: string } | null>(null);
  const [profTemplateMissing, setProfTemplateMissing] = useState(false);

  useEffect(() => {
    (async () => {
      if (isManualDocuSign()) {
        // Manual mode: do not call the API validator. Treat as "ok"
        // so the existing API-error banner stays hidden.
        setConfigCheck({ ok: true });
        return;
      }
      const { data } = await supabase.functions.invoke("docusign-send-envelope", {
        body: { action: "ping" },
      });
      setConfigCheck({ ok: data?.ok === true, message: data?.message || data?.error });
    })();
  }, []);
  const configured = configCheck?.ok === true;
  const configKnown = configCheck !== null;

  const refresh = async () => {
    const [d, o, p, v, e] = await Promise.all([
      supabase
        .from("property_requests")
        .select(
          "id, demand_reference, name, email, location, budget, status, request_type, client_agreement_status, phase_1_status, phase_2_status, property_deal_status, selected_professional_types, docusign_envelope_id, created_at, price_per_sqm, message"
        )
        .order("created_at", { ascending: false }),
      supabase.from("agent_options").select("*").order("created_at", { ascending: false }),
      supabase.from("professional_referrals").select("*").order("created_at", { ascending: false }),
      supabase.from("viewing_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("docusign_envelopes").select("*").order("created_at", { ascending: false }),
    ]);
    setDemands((d.data as any) || []);
    setOptions((o.data as any) || []);
    setProfessionals((p.data as any) || []);
    setViewings((v.data as any) || []);
    setEnvelopes((e.data as any) || []);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  /* ---------- Actions ---------- */
  const sendEnvelope = async (
    template_type: "CLIENT_REPRESENTATION" | "AGENT_REFERRAL" | "PROFESSIONAL_REFERRAL" | "VIEWING_CONFIRMATION",
    related_entity_type: "demand" | "option" | "professional" | "viewing",
    related_entity_id: string,
    successLabel: string
  ) => {
    const t = toast.loading("Envoi DocuSign en cours…");
    const { data, error } = await supabase.functions.invoke("docusign-send-envelope", {
      body: { action: "send", template_type, related_entity_type, related_entity_id },
    });
    toast.dismiss(t);
    if (error) return toast.error(error.message || "Erreur d'envoi");
    if (!data?.ok) {
      if (data?.code === "consent_required") toast.error("Consentement DocuSign requis.");
      else if (data?.missing?.includes("DOCUSIGN_TEMPLATE_PROFESSIONAL_REFERRAL")) {
        setProfTemplateMissing(true);
        toast.error("Template Professional Referral non configuré.");
      } else toast.error(data?.message || "Échec de l'envoi DocuSign");
      return;
    }
    toast.success(successLabel);
    refresh();
  };

  const updateDemand = async (id: string, patch: Record<string, any>) => {
    const { error } = await (supabase.from("property_requests") as any).update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Demande mise à jour");
    refresh();
  };
  const updateOptionStatus = async (id: string, status: OptionStatus) => {
    const { error } = await supabase.from("agent_options").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };
  const updateViewingStatus = async (id: string, status: ViewingStatus) => {
    const { error } = await supabase.from("viewing_requests").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };
  const updateProfessional = async (id: string, patch: Record<string, any>) => {
    const { error } = await (supabase.from("professional_referrals") as any).update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const markPropertyDealSecured = async (demand: Demand) => {
    const phase_2_status =
      demand.request_type === "REAL_ESTATE_AND_PROJECT" ? "ACTIVE" : "NOT_APPLICABLE";
    await updateDemand(demand.id, {
      property_deal_status: "SECURED",
      phase_1_status: "COMPLETED",
      phase_2_status,
    });
    if (demand.request_type === "REAL_ESTATE_AND_PROJECT") {
      await supabase.from("admin_notifications").insert({
        message: `Affaire immobilière sécurisée pour ${demand.demand_reference}. Phase 2 débloquée.`,
        category: "workflow",
        related_entity_type: "demand",
        related_entity_id: demand.id,
      });
    }
  };

  /* ---------- Manual DocuSign actions ---------- */
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copié dans le presse-papier`);
    } catch {
      toast.error("Impossible d'accéder au presse-papier");
    }
  };

  const markClientAgreementSentManual = async (demand: Demand) => {
    await updateDemand(demand.id, {
      status: "CLIENT_AGREEMENT_SENT",
      client_agreement_status: "CLIENT_AGREEMENT_SENT",
    });
    await supabase.from("admin_notifications").insert({
      message: `Accord client marqué envoyé manuellement pour ${demand.demand_reference || demand.id}.`,
      category: "workflow",
      related_entity_type: "demand",
      related_entity_id: demand.id,
    });
    sendAdminNotification({
      idempotencyKey: `manual-client-sent-${demand.id}-${Date.now()}`,
      eventTitle: "Client agreement marked as sent manually",
      summary: `Admin marked the Client Representation Agreement as sent manually for ${demand.demand_reference || demand.id}.`,
      details: [
        { label: "Demand", value: demand.demand_reference || demand.id },
        { label: "Client", value: demand.name },
        { label: "Email", value: demand.email },
      ],
    }).catch(() => {});
  };

  const markClientAgreementSignedManual = async (demand: Demand) => {
    const patch = phasePatchForSignedClientAgreement(demand.request_type);
    if (!patch) {
      toast.error("Type de demande à vérifier avant de débloquer le workflow.");
      await supabase.from("admin_notifications").insert({
        message: `Accord signé manuellement mais request_type manquant pour ${demand.demand_reference || demand.id}. Phases verrouillées.`,
        category: "workflow",
        related_entity_type: "demand",
        related_entity_id: demand.id,
      });
      return;
    }
    await updateDemand(demand.id, patch);
    await supabase.from("admin_notifications").insert({
      message: `Accord client marqué signé manuellement pour ${demand.demand_reference || demand.id}.`,
      category: "workflow",
      related_entity_type: "demand",
      related_entity_id: demand.id,
    });
    sendAdminNotification({
      idempotencyKey: `manual-client-signed-${demand.id}-${Date.now()}`,
      eventTitle: "Client agreement marked as signed manually",
      summary: `Admin marked the Client Representation Agreement as signed manually for ${demand.demand_reference || demand.id}.`,
      details: [
        { label: "Demand", value: demand.demand_reference || demand.id },
        { label: "Request type", value: demand.request_type || "" },
        { label: "Phase 1", value: patch.phase_1_status },
        { label: "Phase 2", value: patch.phase_2_status },
      ],
    }).catch(() => {});
  };

  const markProAgreementSentManual = async (pro: Professional) => {
    await updateProfessional(pro.id, {
      status: "PROFESSIONAL_AGREEMENT_SENT",
      payment_status: "PENDING",
    });
    await supabase.from("admin_notifications").insert({
      message: `Accord professionnel marqué envoyé manuellement pour ${pro.professional_name}.`,
      category: "workflow",
      related_entity_type: "professional",
      related_entity_id: pro.id,
    });
  };

  const markProAgreementSignedManual = async (pro: Professional) => {
    await updateProfessional(pro.id, {
      status: "PROFESSIONAL_AGREEMENT_SIGNED",
      payment_status: pro.payment_status === "PAID" ? "PAID" : "PENDING",
    });
    await supabase.from("admin_notifications").insert({
      message: `Accord professionnel marqué signé manuellement pour ${pro.professional_name}.`,
      category: "workflow",
      related_entity_type: "professional",
      related_entity_id: pro.id,
    });
  };

  const manualActions = isManualDocuSign()
    ? {
        copyClient: (d: Demand) =>
          copyToClipboard(buildClientAgreementCopyText(d), "Accord client"),
        markClientSent: markClientAgreementSentManual,
        markClientSigned: markClientAgreementSignedManual,
        copyPro: (p: Professional, demand: Demand | undefined) =>
          copyToClipboard(
            buildProfessionalAgreementCopyText({
              professional_name: p.professional_name,
              company_name: p.company_name,
              professional_email: p.professional_email,
              professional_type: p.professional_type,
              demand_reference: demand?.demand_reference || null,
              commitment_fee: p.commitment_fee,
              success_fee: p.success_fee,
              client_profile: demand ? `${demand.name} · ${demand.email}` : null,
              project_summary: demand?.message || demand?.location || null,
            }),
            "Accord professionnel"
          ),
        markProSent: markProAgreementSentManual,
        markProSigned: markProAgreementSignedManual,
      }
    : null;

  const markPaymentPaid = async (pro: Professional) => {
    await updateProfessional(pro.id, { payment_status: "PAID", paid_at: new Date().toISOString() });
    await supabase.from("admin_notifications").insert({
      message: `Paiement confirmé pour ${pro.professional_name}. Introduction au client débloquée.`,
      category: "workflow",
      related_entity_type: "professional",
      related_entity_id: pro.id,
    });
    sendAdminNotification({
      idempotencyKey: `professional-paid-${pro.id}`,
      eventTitle: "Professional payment marked as paid",
      summary: `Payment confirmed for ${pro.professional_name}. Introduction to client is now unlocked.`,
      details: [
        { label: "Professional", value: pro.professional_name },
        { label: "Reference", value: pro.professional_reference || "" },
        { label: "Email", value: pro.professional_email || "" },
        { label: "Type", value: pro.professional_type || "" },
      ],
      ctaNote: "Open the admin workflow to introduce the professional to the client.",
    });
  };

  const introduceProfessional = async (pro: Professional) => {
    await updateProfessional(pro.id, { status: "INTRODUCED_TO_CLIENT" });
    await supabase.from("admin_notifications").insert({
      message: `${pro.professional_name} a été introduit(e) au client.`,
      category: "workflow",
      related_entity_type: "professional",
      related_entity_id: pro.id,
    });
  };

  /* Latest envelope per (entity_type, entity_id) */
  const latestEnvelope = useMemo(() => {
    const map = new Map<string, EnvelopeRow>();
    for (const env of envelopes) {
      if (!env.envelope_id) continue;
      const key = `${env.related_entity_type}:${env.related_entity_id}`;
      if (!map.has(key)) map.set(key, env);
    }
    return map;
  }, [envelopes]);
  const envelopeFor = (type: string, id: string) =>
    latestEnvelope.get(`${type}:${id}`) || null;

  const syncEnvelope = async (envelopeId: string) => {
    const t = toast.loading("Synchronisation DocuSign…");
    const { data, error } = await supabase.functions.invoke("docusign-send-envelope", {
      body: { action: "sync", envelope_id: envelopeId },
    });
    toast.dismiss(t);
    if (error || !data?.ok) return toast.error(data?.message || error?.message || "Échec sync");
    toast.success("Statut DocuSign mis à jour");
    refresh();
  };

  const phase1Demands = useMemo(
    () => demands.filter((d) => d.request_type === "REAL_ESTATE_ONLY" || d.request_type === "REAL_ESTATE_AND_PROJECT"),
    [demands]
  );
  const phase2Demands = useMemo(
    () => demands.filter((d) => d.request_type === "PROJECT_ONLY" || d.request_type === "REAL_ESTATE_AND_PROJECT"),
    [demands]
  );

  return (
    <AdminLayout
      title="Workflow Neova"
      subtitle="Demandes clients, accords, professionnels et visites"
      actions={
        <Link to="/admin/settings/docusign">
          <SecondaryButton>
            <Settings size={15} /> Paramètres DocuSign
          </SecondaryButton>
        </Link>
      }
    >
      {isManualDocuSign() && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-amber-50 ring-1 ring-amber-200">
          <AlertTriangle size={18} className="text-amber-700 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-900">DocuSign — mode manuel</p>
            <p className="text-amber-800 mt-0.5">{MANUAL_MODE_BANNER}</p>
          </div>
        </div>
      )}

      {configKnown && !configured && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-amber-50 ring-1 ring-amber-200">
          <AlertTriangle size={18} className="text-amber-700 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-900">DocuSign : authentification JWT échouée</p>
            <p className="text-amber-800 mt-0.5">
              {configCheck?.message || "Vérifiez les secrets et le consentement."}{" "}
              <Link to="/admin/settings/docusign" className="underline underline-offset-2 hover:text-amber-900">
                Ouvrir les paramètres
              </Link>
            </p>
          </div>
        </div>
      )}

      {profTemplateMissing && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-amber-50 ring-1 ring-amber-200">
          <AlertTriangle size={18} className="text-amber-700 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-900">Template Professional Referral non configuré</p>
            <p className="text-amber-800 mt-0.5">
              Créez le template "Neova - Professional Referral Agreement" dans DocuSign et ajoutez le secret{" "}
              <code className="font-mono">DOCUSIGN_TEMPLATE_PROFESSIONAL_REFERRAL</code>.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(
          [
            { k: "demandes", label: "Demandes clients", count: demands.length },
            { k: "phase1", label: "Phase 1 — Agents", count: options.length },
            { k: "phase2", label: "Phase 2 — Professionnels", count: professionals.length },
            { k: "visites", label: "Visites", count: viewings.length },
          ] as const
        ).map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.k ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-slate-900"
            }`}
          >
            {t.label} <span className={`ml-1 text-xs ${tab === t.k ? "text-slate-300" : "text-slate-400"}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 py-10 text-center">Chargement…</p>
      ) : tab === "demandes" ? (
        <DemandsList
          demands={demands}
          envelopeFor={(id) => envelopeFor("demand", id)}
          onSync={syncEnvelope}
          onSend={(id) => sendEnvelope("CLIENT_REPRESENTATION", "demand", id, "Accord client envoyé via DocuSign.")}
          onUpdateRequestType={(id, rt) => updateDemand(id, { request_type: rt })}
          manualActions={manualActions}
        />
      ) : tab === "phase1" ? (
        <Phase1Section
          demands={phase1Demands}
          options={options}
          envelopeFor={envelopeFor}
          onSync={syncEnvelope}
          onCreated={refresh}
          onSendAgent={(id) => sendEnvelope("AGENT_REFERRAL", "option", id, "Accord agent envoyé via DocuSign.")}
          onMarkOptionSigned={(id) => updateOptionStatus(id, "AGENT_AGREEMENT_SIGNED")}
          onSendOptionToClient={(id) => updateOptionStatus(id, "SENT_TO_CLIENT")}
          onMarkDealSecured={markPropertyDealSecured}
        />
      ) : tab === "phase2" ? (
        <Phase2Section
          demands={phase2Demands}
          professionals={professionals}
          envelopeFor={envelopeFor}
          onSync={syncEnvelope}
          onCreated={refresh}
          onSendPro={(id) =>
            sendEnvelope("PROFESSIONAL_REFERRAL", "professional", id, "Accord professionnel envoyé via DocuSign.")
          }
          onMarkPaid={markPaymentPaid}
          onIntroduce={introduceProfessional}
          manualActions={manualActions}
          allDemands={demands}
        />
      ) : (
        <ViewingsList
          viewings={viewings}
          options={options}
          demands={demands}
          envelopeFor={(id) => envelopeFor("viewing", id)}
          onSync={syncEnvelope}
          onCreated={refresh}
          onSend={(id) => sendEnvelope("VIEWING_CONFIRMATION", "viewing", id, "Confirmation de visite envoyée via DocuSign.")}
          onMarkSigned={(id) => updateViewingStatus(id, "VIEWING_CONFIRMATION_SIGNED")}
          onSchedule={(id) => updateViewingStatus(id, "VIEWING_SCHEDULED")}
        />
      )}

      <p className="mt-8 text-[11px] text-slate-400 italic">
        Note interne admin : ces modèles d'accord doivent être validés par un conseil juridique avant utilisation en production.
      </p>
    </AdminLayout>
  );
};

/* ============================================================ */
/*  A. DEMANDS                                                  */
/* ============================================================ */
const DemandsList = ({
  demands,
  envelopeFor,
  onSync,
  onSend,
  onUpdateRequestType,
  manualActions,
}: {
  demands: Demand[];
  envelopeFor: (id: string) => EnvelopeRow | null;
  onSync: (envelopeId: string) => void;
  onSend: (id: string) => void;
  onUpdateRequestType: (id: string, rt: RequestType) => void;
  manualActions: {
    copyClient: (d: Demand) => void;
    markClientSent: (d: Demand) => void;
    markClientSigned: (d: Demand) => void;
  } | null;
}) => {
  if (demands.length === 0)
    return (
      <Card className="p-12 text-center">
        <p className="text-slate-700 font-medium">Aucune demande pour l'instant</p>
        <p className="text-sm text-slate-500 mt-1">
          Les nouvelles demandes du formulaire « Find Your Property » apparaîtront ici.
        </p>
      </Card>
    );

  return (
    <div className="space-y-3">
      {demands.map((d) => {
        const status = (d.status as DemandStatus) || "DEMAND_SUBMITTED";
        const env = envelopeFor(d.id);
        const rt = (d.request_type || "REAL_ESTATE_AND_PROJECT") as RequestType;
        const p1 = (d.phase_1_status || "LOCKED") as PhaseStatus;
        const p2 = (d.phase_2_status || "LOCKED") as PhaseStatus;
        return (
          <Card key={d.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-slate-500">{d.demand_reference || "—"}</span>
                  <Pill s={status} />
                </div>
                <p className="font-medium text-slate-900 mt-1.5">{d.name}</p>
                <p className="text-sm text-slate-500">
                  {d.email}
                  {d.location && ` · ${d.location}`}
                  {d.budget && ` · ${d.budget}`}
                </p>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <select
                    value={rt}
                    onChange={(e) => onUpdateRequestType(d.id, e.target.value as RequestType)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-50 ring-1 ring-slate-200 focus:outline-none focus:ring-slate-400"
                    title="Type de demande (modifiable par l'admin)"
                  >
                    {(Object.keys(REQUEST_TYPE_LABEL) as RequestType[]).map((k) => (
                      <option key={k} value={k}>{REQUEST_TYPE_LABEL[k]}</option>
                    ))}
                  </select>
                  <PhaseBadge s={p1} label="Phase 1" />
                  <PhaseBadge s={p2} label="Phase 2" />
                </div>
                <DocuSignStatusLine envelope={env} onSync={env?.envelope_id ? () => onSync(env.envelope_id!) : undefined} />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <SecondaryButton onClick={() => onSend(d.id)} className="!py-2 !px-3 text-xs">
                  <Send size={13} /> {d.client_agreement_status === "CLIENT_AGREEMENT_SIGNED" ? "Renvoyer" : "Envoyer"} accord client
                </SecondaryButton>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

/* ============================================================ */
/*  B. PHASE 1 — AGENTS                                         */
/* ============================================================ */
const Phase1Section = ({
  demands,
  options,
  envelopeFor,
  onSync,
  onCreated,
  onSendAgent,
  onMarkOptionSigned,
  onSendOptionToClient,
  onMarkDealSecured,
}: {
  demands: Demand[];
  options: AgentOption[];
  envelopeFor: (type: string, id: string) => EnvelopeRow | null;
  onSync: (envelopeId: string) => void;
  onCreated: () => void;
  onSendAgent: (id: string) => void;
  onMarkOptionSigned: (id: string) => void;
  onSendOptionToClient: (id: string) => void;
  onMarkDealSecured: (d: Demand) => void;
}) => {
  const [adding, setAdding] = useState(false);
  const sharedDemands = useMemo(
    () => demands.filter((d) => d.phase_1_status === "ACTIVE" || d.phase_1_status === "COMPLETED"),
    [demands]
  );

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">
          Phase 1 — recherche immobilière. Chaque demande débloque la phase une fois l'accord client signé.
        </p>
        <PrimaryButton onClick={() => setAdding(true)} className="!py-2 !px-3 text-xs">
          <Plus size={13} /> Ajouter une option agent
        </PrimaryButton>
      </div>

      {demands.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-700 font-medium">Aucune demande concernée par la Phase 1</p>
          <p className="text-sm text-slate-500 mt-1">
            Seules les demandes "Recherche immobilière" et "Recherche + projet" passent par cette phase.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {demands.map((d) => {
            const p1 = (d.phase_1_status || "LOCKED") as PhaseStatus;
            const dealSecured = d.property_deal_status === "SECURED";
            const linkedOptions = options.filter((o) => o.demand_id === d.id);
            return (
              <Card key={d.id} className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-500">{d.demand_reference}</span>
                      <PhaseBadge s={p1} label="Phase 1" />
                      <span className="text-[11px] text-slate-500">{REQUEST_TYPE_LABEL[(d.request_type || "REAL_ESTATE_AND_PROJECT") as RequestType]}</span>
                    </div>
                    <p className="font-medium text-slate-900 mt-1.5">
                      {d.name} <span className="text-slate-400 font-normal text-sm">· {d.location || "—"} · {d.budget || "—"}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {linkedOptions.length} option(s) agent · Affaire :{" "}
                      <span className={dealSecured ? "text-emerald-700 font-medium" : "text-slate-600"}>
                        {dealSecured ? "Sécurisée" : d.property_deal_status === "IN_PROGRESS" ? "En cours" : "Non démarrée"}
                      </span>
                    </p>
                  </div>
                  <button
                    disabled={p1 !== "ACTIVE" || dealSecured}
                    onClick={() => onMarkDealSecured(d)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {p1 !== "ACTIVE" ? <Lock size={12} /> : <CheckCircle2 size={12} />}
                    Marquer l'affaire sécurisée
                  </button>
                </div>

                {linkedOptions.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                    {linkedOptions.map((o) => {
                      const status = (o.status as OptionStatus) || "AGENT_OPTION_SUBMITTED";
                      const isSigned = status === "AGENT_AGREEMENT_SIGNED" || status === "SENT_TO_CLIENT";
                      const env = envelopeFor("option", o.id);
                      return (
                        <div key={o.id} className="rounded-xl bg-slate-50/50 p-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono text-slate-500">{o.option_reference}</span>
                                <Pill s={status} />
                              </div>
                              <p className="text-sm text-slate-900 mt-1">
                                {o.agent_name}
                                {o.agency_name && <span className="text-slate-500"> · {o.agency_name}</span>}
                              </p>
                              <p className="text-xs text-slate-500">
                                {o.property_address || "Adresse non précisée"}
                                {o.asking_price && ` · ${o.asking_price}`}
                              </p>
                              <DocuSignStatusLine envelope={env} onSync={env?.envelope_id ? () => onSync(env.envelope_id!) : undefined} />
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <SecondaryButton onClick={() => onSendAgent(o.id)} className="!py-1.5 !px-2.5 text-xs">
                                <Send size={12} /> Envoyer accord agent
                              </SecondaryButton>
                              <button
                                disabled={!isSigned || status === "SENT_TO_CLIENT"}
                                onClick={() => onSendOptionToClient(o.id)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                              >
                                {!isSigned ? <Lock size={11} /> : <CheckCircle2 size={11} />}
                                Envoyer au client
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {adding && (
        <NewOptionDialog
          demands={sharedDemands}
          onClose={() => setAdding(false)}
          onCreated={() => { setAdding(false); onCreated(); }}
        />
      )}
    </>
  );
};

/* ============================================================ */
/*  C. PHASE 2 — PROFESSIONALS                                  */
/* ============================================================ */
const Phase2Section = ({
  demands,
  professionals,
  envelopeFor,
  onSync,
  onCreated,
  onSendPro,
  onMarkPaid,
  onIntroduce,
}: {
  demands: Demand[];
  professionals: Professional[];
  envelopeFor: (type: string, id: string) => EnvelopeRow | null;
  onSync: (envelopeId: string) => void;
  onCreated: () => void;
  onSendPro: (id: string) => void;
  onMarkPaid: (p: Professional) => void;
  onIntroduce: (p: Professional) => void;
}) => {
  const [addingFor, setAddingFor] = useState<string | null>(null);

  if (demands.length === 0)
    return (
      <Card className="p-12 text-center">
        <p className="text-slate-700 font-medium">Aucune demande concernée par la Phase 2</p>
        <p className="text-sm text-slate-500 mt-1">
          Seules les demandes "Projet sur bien existant" et "Recherche + projet" passent par cette phase.
        </p>
      </Card>
    );

  return (
    <>
      <p className="text-sm text-slate-500 mb-4">
        Phase 2 — sélection des architectes, entrepreneurs et autres professionnels. L'accord et le paiement sont requis avant introduction au client.
      </p>
      <div className="space-y-4">
        {demands.map((d) => {
          const p2 = (d.phase_2_status || "LOCKED") as PhaseStatus;
          const linkedPros = professionals.filter((p) => p.demand_id === d.id);
          const locked = p2 === "LOCKED" || p2 === "NOT_APPLICABLE";
          return (
            <Card key={d.id} className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-slate-500">{d.demand_reference}</span>
                    <PhaseBadge s={p2} label="Phase 2" />
                    <span className="text-[11px] text-slate-500">{REQUEST_TYPE_LABEL[(d.request_type || "REAL_ESTATE_AND_PROJECT") as RequestType]}</span>
                  </div>
                  <p className="font-medium text-slate-900 mt-1.5">
                    {d.name} <span className="text-slate-400 font-normal text-sm">· {d.location || "—"} · {d.budget || "—"}</span>
                  </p>
                </div>
                <PrimaryButton
                  onClick={() => setAddingFor(d.id)}
                  disabled={locked}
                  className="!py-2 !px-3 text-xs"
                >
                  <Plus size={13} /> Ajouter un professionnel
                </PrimaryButton>
              </div>

              {locked && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100 text-xs text-slate-600 flex items-center gap-2">
                  <Lock size={12} />
                  {p2 === "NOT_APPLICABLE"
                    ? "Phase 2 non applicable pour cette demande."
                    : d.request_type === "REAL_ESTATE_AND_PROJECT"
                      ? "Verrouillée jusqu'à ce que l'affaire immobilière (Phase 1) soit sécurisée."
                      : "Verrouillée — accord client requis."}
                </div>
              )}

              {linkedPros.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                  {linkedPros.map((p) => (
                    <ProfessionalCard
                      key={p.id}
                      pro={p}
                      envelope={envelopeFor("professional", p.id)}
                      onSync={onSync}
                      onSend={() => onSendPro(p.id)}
                      onMarkPaid={() => onMarkPaid(p)}
                      onIntroduce={() => onIntroduce(p)}
                      phaseLocked={locked}
                    />
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {addingFor && (
        <NewProfessionalDialog
          demandId={addingFor}
          onClose={() => setAddingFor(null)}
          onCreated={() => { setAddingFor(null); onCreated(); }}
        />
      )}
    </>
  );
};

const ProfessionalCard = ({
  pro,
  envelope,
  onSync,
  onSend,
  onMarkPaid,
  onIntroduce,
  phaseLocked,
}: {
  pro: Professional;
  envelope: EnvelopeRow | null;
  onSync: (envelopeId: string) => void;
  onSend: () => void;
  onMarkPaid: () => void;
  onIntroduce: () => void;
  phaseLocked: boolean;
}) => {
  const signed = pro.status === "PROFESSIONAL_AGREEMENT_SIGNED" || pro.status === "INTRODUCTION_UNLOCKED" || pro.status === "INTRODUCED_TO_CLIENT";
  const paid = pro.payment_status === "PAID";
  const introduced = pro.status === "INTRODUCED_TO_CLIENT";
  const canIntroduce = signed && paid && !introduced;

  return (
    <div className="rounded-xl bg-slate-50/50 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-500">{pro.professional_reference}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-white ring-1 ring-slate-200 text-slate-700">
              <ProTypeIcon t={pro.professional_type} /> {PROFESSIONAL_TYPE_LABEL[pro.professional_type]}
            </span>
            <Pill s={pro.status} />
            <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium rounded-full ${PAYMENT_TONE[pro.payment_status]}`}>
              <Banknote size={11} className="mr-1" /> {PAYMENT_STATUS_LABEL[pro.payment_status]}
            </span>
          </div>
          <p className="text-sm text-slate-900 mt-1">
            {pro.professional_name}
            {pro.company_name && <span className="text-slate-500"> · {pro.company_name}</span>}
          </p>
          <p className="text-xs text-slate-500">
            {pro.professional_email}
            {pro.commitment_fee && ` · Engagement : ${pro.commitment_fee}`}
            {pro.success_fee && ` · Succès : ${pro.success_fee}`}
          </p>
          <DocuSignStatusLine envelope={envelope} onSync={envelope?.envelope_id ? () => onSync(envelope.envelope_id!) : undefined} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SecondaryButton onClick={onSend} disabled={phaseLocked} className="!py-1.5 !px-2.5 text-xs">
            <Send size={12} /> {pro.status === "PROFESSIONAL_SELECTED" ? "Envoyer accord" : "Renvoyer accord"}
          </SecondaryButton>
          <button
            disabled={!signed || paid}
            onClick={onMarkPaid}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            title={!signed ? "Accord à signer" : paid ? "Déjà payé" : "Marquer comme payé"}
          >
            <Banknote size={12} /> Marquer paiement reçu
          </button>
          <button
            disabled={!canIntroduce}
            onClick={onIntroduce}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            title={
              introduced
                ? "Déjà introduit"
                : !signed
                  ? "Accord à signer"
                  : !paid
                    ? "Paiement requis avant introduction"
                    : "Introduire au client"
            }
          >
            {!canIntroduce ? <Lock size={11} /> : <UserCheck size={11} />}
            {introduced ? "Introduit" : "Introduire au client"}
          </button>
        </div>
      </div>
      {signed && !paid && (
        <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 ring-1 ring-amber-100 rounded-lg px-2 py-1">
          Paiement requis avant l'introduction au client.
        </div>
      )}
    </div>
  );
};

const NewProfessionalDialog = ({
  demandId,
  onClose,
  onCreated,
}: {
  demandId: string;
  onClose: () => void;
  onCreated: () => void;
}) => {
  const [form, setForm] = useState({
    professional_type: "ARCHITECT" as ProfessionalType,
    professional_name: "",
    company_name: "",
    professional_email: "",
    professional_phone: "",
    commitment_fee: "",
    success_fee: "",
    commitment_fee_amount: "",
    currency: "EUR",
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.professional_name || !form.professional_email)
      return toast.error("Nom et email du professionnel requis");
    setSaving(true);
    const { error } = await supabase.from("professional_referrals").insert({
      demand_id: demandId,
      professional_type: form.professional_type,
      professional_name: form.professional_name,
      company_name: form.company_name || null,
      professional_email: form.professional_email,
      professional_phone: form.professional_phone || null,
      commitment_fee: form.commitment_fee || null,
      success_fee: form.success_fee || null,
      commitment_fee_amount: form.commitment_fee_amount ? parseFloat(form.commitment_fee_amount) : null,
      currency: form.currency || "EUR",
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Professionnel ajouté");
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-xl text-slate-900 mb-1">Nouveau professionnel</h3>
        <p className="text-sm text-slate-500 mb-4">
          Architecte, entrepreneur, promoteur ou autre prestataire.
        </p>
        <div className="space-y-3">
          <Field label="Type de professionnel">
            <select
              value={form.professional_type}
              onChange={(e) => setForm({ ...form, professional_type: e.target.value as ProfessionalType })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-slate-500"
            >
              {(Object.keys(PROFESSIONAL_TYPE_LABEL) as ProfessionalType[]).map((k) => (
                <option key={k} value={k}>{PROFESSIONAL_TYPE_LABEL[k]}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nom"><Input value={form.professional_name} onChange={(v) => setForm({ ...form, professional_name: v })} /></Field>
            <Field label="Société"><Input value={form.company_name} onChange={(v) => setForm({ ...form, company_name: v })} /></Field>
            <Field label="Email"><Input value={form.professional_email} onChange={(v) => setForm({ ...form, professional_email: v })} /></Field>
            <Field label="Téléphone"><Input value={form.professional_phone} onChange={(v) => setForm({ ...form, professional_phone: v })} /></Field>
            <Field label="Frais d'engagement (texte)"><Input value={form.commitment_fee} onChange={(v) => setForm({ ...form, commitment_fee: v })} /></Field>
            <Field label="Frais succès (texte)"><Input value={form.success_fee} onChange={(v) => setForm({ ...form, success_fee: v })} /></Field>
            <Field label="Montant engagement (€)"><Input value={form.commitment_fee_amount} onChange={(v) => setForm({ ...form, commitment_fee_amount: v })} /></Field>
            <Field label="Devise"><Input value={form.currency} onChange={(v) => setForm({ ...form, currency: v })} /></Field>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <SecondaryButton onClick={onClose}>Annuler</SecondaryButton>
          <PrimaryButton onClick={submit} disabled={saving}>
            {saving ? "Enregistrement…" : "Ajouter"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

/* ============================================================ */
/*  Existing dialogs (Option + Viewing) preserved                */
/* ============================================================ */
const NewOptionDialog = ({
  demands,
  onClose,
  onCreated,
}: {
  demands: Demand[];
  onClose: () => void;
  onCreated: () => void;
}) => {
  const [form, setForm] = useState({
    demand_id: demands[0]?.id || "",
    agent_name: "",
    agency_name: "",
    agent_email: "",
    agent_phone: "",
    property_address: "",
    property_reference: "",
    asking_price: "",
    property_details: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.demand_id) return toast.error("Sélectionnez une demande");
    if (!form.agent_name || !form.agent_email) return toast.error("Nom et email de l'agent requis");
    setSaving(true);
    const { error } = await supabase.from("agent_options").insert(form);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Option ajoutée");
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-xl text-slate-900 mb-1">Nouvelle option agent</h3>
        <p className="text-sm text-slate-500 mb-4">Liez l'option à une demande dont l'accord client est signé.</p>
        {demands.length === 0 ? (
          <div className="p-4 rounded-xl bg-amber-50 ring-1 ring-amber-200 text-sm text-amber-800">
            Aucune demande éligible. L'accord client doit d'abord être signé.
          </div>
        ) : (
          <div className="space-y-3">
            <Field label="Demande liée">
              <select
                value={form.demand_id}
                onChange={(e) => setForm({ ...form, demand_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-500 bg-white"
              >
                {demands.map((d) => (
                  <option key={d.id} value={d.id}>{d.demand_reference} · {d.location || "—"} · {d.budget || "—"}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nom de l'agent"><Input value={form.agent_name} onChange={(v) => setForm({ ...form, agent_name: v })} /></Field>
              <Field label="Agence"><Input value={form.agency_name} onChange={(v) => setForm({ ...form, agency_name: v })} /></Field>
              <Field label="Email agent"><Input value={form.agent_email} onChange={(v) => setForm({ ...form, agent_email: v })} /></Field>
              <Field label="Téléphone"><Input value={form.agent_phone} onChange={(v) => setForm({ ...form, agent_phone: v })} /></Field>
              <Field label="Adresse du bien"><Input value={form.property_address} onChange={(v) => setForm({ ...form, property_address: v })} /></Field>
              <Field label="Référence"><Input value={form.property_reference} onChange={(v) => setForm({ ...form, property_reference: v })} /></Field>
              <Field label="Prix demandé"><Input value={form.asking_price} onChange={(v) => setForm({ ...form, asking_price: v })} /></Field>
            </div>
            <Field label="Notes">
              <textarea
                value={form.property_details}
                onChange={(e) => setForm({ ...form, property_details: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-500"
              />
            </Field>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-5">
          <SecondaryButton onClick={onClose}>Annuler</SecondaryButton>
          <PrimaryButton onClick={submit} disabled={saving || demands.length === 0}>
            {saving ? "Enregistrement…" : "Ajouter l'option"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

/* ============================================================ */
/*  D. VIEWINGS                                                 */
/* ============================================================ */
const ViewingsList = ({
  viewings,
  options,
  demands,
  envelopeFor,
  onSync,
  onCreated,
  onSend,
  onMarkSigned,
  onSchedule,
}: {
  viewings: Viewing[];
  options: AgentOption[];
  demands: Demand[];
  envelopeFor: (id: string) => EnvelopeRow | null;
  onSync: (envelopeId: string) => void;
  onCreated: () => void;
  onSend: (id: string) => void;
  onMarkSigned: (id: string) => void;
  onSchedule: (id: string) => void;
}) => {
  const [adding, setAdding] = useState(false);
  const eligibleOptions = useMemo(
    () => options.filter((o) => o.status === "AGENT_AGREEMENT_SIGNED" || o.status === "SENT_TO_CLIENT"),
    [options]
  );

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">Visites demandées par les clients après envoi d'une option.</p>
        <PrimaryButton onClick={() => setAdding(true)} className="!py-2 !px-3 text-xs">
          <Plus size={13} /> Nouvelle demande de visite
        </PrimaryButton>
      </div>

      {viewings.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-700 font-medium">Aucune visite demandée</p>
          <p className="text-sm text-slate-500 mt-1">Les demandes de visite apparaissent ici après accord agent.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {viewings.map((v) => {
            const status = (v.status as ViewingStatus) || "VIEWING_REQUESTED";
            const isSigned = status === "VIEWING_CONFIRMATION_SIGNED" || status === "VIEWING_SCHEDULED";
            const env = envelopeFor(v.id);
            return (
              <Card key={v.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap"><Pill s={status} /></div>
                    <p className="font-medium text-slate-900 mt-1.5 inline-flex items-center gap-2">
                      <Eye size={14} className="text-slate-400" /> {v.property_address || "—"}
                    </p>
                    <p className="text-sm text-slate-500">
                      Client : {v.client_name || "—"} · Agent : {v.agent_name || "—"}
                      {v.viewing_date && ` · ${new Date(v.viewing_date).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}`}
                    </p>
                    <DocuSignStatusLine envelope={env} onSync={env?.envelope_id ? () => onSync(env.envelope_id!) : undefined} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <SecondaryButton onClick={() => onSend(v.id)} className="!py-2 !px-3 text-xs">
                      <Send size={13} /> Envoyer DocuSign
                    </SecondaryButton>
                    <button
                      disabled={!isSigned || status === "VIEWING_SCHEDULED"}
                      onClick={() => onSchedule(v.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {!isSigned ? <Lock size={12} /> : <CheckCircle2 size={12} />}
                      Planifier la visite
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {adding && (
        <NewViewingDialog
          options={eligibleOptions}
          demands={demands}
          onClose={() => setAdding(false)}
          onCreated={() => { setAdding(false); onCreated(); }}
        />
      )}
    </>
  );
};

const NewViewingDialog = ({
  options,
  demands,
  onClose,
  onCreated,
}: {
  options: AgentOption[];
  demands: Demand[];
  onClose: () => void;
  onCreated: () => void;
}) => {
  const [optionId, setOptionId] = useState(options[0]?.id || "");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const opt = options.find((o) => o.id === optionId);
    if (!opt) return toast.error("Sélectionnez une option éligible");
    const dem = demands.find((d) => d.id === opt.demand_id);
    setSaving(true);
    const { error } = await supabase.from("viewing_requests").insert({
      option_id: opt.id,
      demand_id: opt.demand_id,
      client_name: dem?.name || null,
      client_email: dem?.email || null,
      agent_name: opt.agent_name,
      agent_email: opt.agent_email,
      property_address: opt.property_address,
      viewing_date: date ? new Date(date).toISOString() : null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Visite enregistrée");
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-xl text-slate-900 mb-1">Nouvelle demande de visite</h3>
        <p className="text-sm text-slate-500 mb-4">Choisissez une option dont l'accord agent est signé.</p>
        {options.length === 0 ? (
          <div className="p-4 rounded-xl bg-amber-50 ring-1 ring-amber-200 text-sm text-amber-800">
            Aucune option éligible. L'accord agent doit être signé au préalable.
          </div>
        ) : (
          <div className="space-y-3">
            <Field label="Option">
              <select
                value={optionId}
                onChange={(e) => setOptionId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-slate-500"
              >
                {options.map((o) => (
                  <option key={o.id} value={o.id}>{o.option_reference} · {o.property_address || "—"} · {o.agent_name}</option>
                ))}
              </select>
            </Field>
            <Field label="Date de visite (optionnel)">
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-500"
              />
            </Field>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-5">
          <SecondaryButton onClick={onClose}>Annuler</SecondaryButton>
          <PrimaryButton onClick={submit} disabled={saving || options.length === 0}>
            {saving ? "Enregistrement…" : "Créer la visite"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

/* ---------- Tiny inputs ---------- */
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-xs font-medium text-slate-600 mb-1 block">{label}</span>
    {children}
  </label>
);
const Input = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-500"
  />
);

export default AdminWorkflow;
