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
} from "lucide-react";
import {
  DEMAND_STATUS_LABEL,
  OPTION_STATUS_LABEL,
  VIEWING_STATUS_LABEL,
  STATUS_TONE,
  isDocuSignConfigured,
  NOT_CONFIGURED_MESSAGE,
  type DemandStatus,
  type OptionStatus,
  type ViewingStatus,
} from "@/lib/docusign";

/* ---------- Types ---------- */
type Demand = {
  id: string;
  demand_reference: string | null;
  name: string;
  email: string;
  location: string | null;
  budget: string | null;
  status: string;
  docusign_envelope_id: string | null;
  created_at: string;
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

/* ---------- Small UI helpers ---------- */
const Pill = ({ s }: { s: string }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium rounded-full ${
      STATUS_TONE[s] || "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
    }`}
  >
    {DEMAND_STATUS_LABEL[s as DemandStatus] ||
      OPTION_STATUS_LABEL[s as OptionStatus] ||
      VIEWING_STATUS_LABEL[s as ViewingStatus] ||
      s}
  </span>
);

const TestModeBtn = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-amber-50 text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100 transition-colors"
    title="Mode test — marquer comme signé"
  >
    <FileSignature size={12} /> {children}
  </button>
);

/* ---------- Page ---------- */
const AdminWorkflow = () => {
  const [tab, setTab] = useState<"demandes" | "options" | "visites">("demandes");
  const [demands, setDemands] = useState<Demand[]>([]);
  const [options, setOptions] = useState<AgentOption[]>([]);
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [loading, setLoading] = useState(true);
  const configured = isDocuSignConfigured();

  const refresh = async () => {
    const [d, o, v] = await Promise.all([
      supabase
        .from("property_requests")
        .select("id, demand_reference, name, email, location, budget, status, docusign_envelope_id, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("agent_options")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("viewing_requests")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);
    setDemands((d.data as any) || []);
    setOptions((o.data as any) || []);
    setViewings((v.data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  /* ---------- Actions ---------- */
  const sendEnvelope = async (
    template_type: "CLIENT_REPRESENTATION" | "AGENT_REFERRAL" | "VIEWING_CONFIRMATION",
    related_entity_type: "demand" | "option" | "viewing",
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
      if (data?.code === "consent_required" && data?.consentUrl) {
        toast.error("Consentement DocuSign requis. Ouvrez les paramètres pour autoriser.");
      } else {
        toast.error(data?.message || "Échec de l'envoi DocuSign");
      }
      return;
    }
    toast.success(successLabel);
    refresh();
  };

  const updateDemandStatus = async (id: string, status: DemandStatus) => {
    const { error } = await supabase.from("property_requests").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Statut mis à jour");
    refresh();
  };
  const updateOptionStatus = async (id: string, status: OptionStatus) => {
    const { error } = await supabase.from("agent_options").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Statut mis à jour");
    refresh();
  };
  const updateViewingStatus = async (id: string, status: ViewingStatus) => {
    const { error } = await supabase.from("viewing_requests").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Statut mis à jour");
    refresh();
  };

  const findDemand = (id: string) => demands.find((d) => d.id === id);

  /* ---------- Render ---------- */
  return (
    <AdminLayout
      title="Workflow DocuSign"
      subtitle="Suivi des accords clients, agents et confirmations de visite"
      actions={
        <Link to="/admin/settings/docusign">
          <SecondaryButton>
            <Settings size={15} /> Paramètres DocuSign
          </SecondaryButton>
        </Link>
      }
    >
      {!configured && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-amber-50 ring-1 ring-amber-200">
          <AlertTriangle size={18} className="text-amber-700 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-900">DocuSign n'est pas encore configuré</p>
            <p className="text-amber-800 mt-0.5">
              Vous pouvez tester tout le parcours grâce aux boutons{" "}
              <span className="font-medium">« Mode test — marquer comme signé »</span>. Aucun envoi
              réel n'aura lieu tant que les identifiants DocuSign ne sont pas ajoutés.{" "}
              <Link
                to="/admin/settings/docusign"
                className="underline underline-offset-2 hover:text-amber-900"
              >
                Ouvrir les paramètres
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(
          [
            { k: "demandes", label: "A. Demandes clients", count: demands.length },
            { k: "options", label: "B. Options agents", count: options.length },
            { k: "visites", label: "C. Visites", count: viewings.length },
          ] as const
        ).map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.k
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-slate-900"
            }`}
          >
            {t.label}{" "}
            <span className={`ml-1 text-xs ${tab === t.k ? "text-slate-300" : "text-slate-400"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 py-10 text-center">Chargement…</p>
      ) : tab === "demandes" ? (
        <DemandsList
          demands={demands}
          onSend={(id) =>
            sendEnvelope("CLIENT_REPRESENTATION", "demand", id, "Accord client envoyé via DocuSign.")
          }
          onMarkSigned={(id) => updateDemandStatus(id, "CLIENT_AGREEMENT_SIGNED")}
          onShare={(id) => updateDemandStatus(id, "SHARED_WITH_AGENTS")}
        />
      ) : tab === "options" ? (
        <OptionsList
          options={options}
          demands={demands}
          onCreated={refresh}
          onSend={(id) =>
            sendEnvelope("AGENT_REFERRAL", "option", id, "Accord agent envoyé via DocuSign.")
          }
          onMarkSigned={(id) => updateOptionStatus(id, "AGENT_AGREEMENT_SIGNED")}
          onSendToClient={(id) => updateOptionStatus(id, "SENT_TO_CLIENT")}
        />
      ) : (
        <ViewingsList
          viewings={viewings}
          options={options}
          demands={demands}
          onCreated={refresh}
          onSend={(id) =>
            sendEnvelope(
              "VIEWING_CONFIRMATION",
              "viewing",
              id,
              "Confirmation de visite envoyée via DocuSign."
            )
          }
          onMarkSigned={(id) => updateViewingStatus(id, "VIEWING_CONFIRMATION_SIGNED")}
          onSchedule={(id) => updateViewingStatus(id, "VIEWING_SCHEDULED")}
        />
      )}
    </AdminLayout>
  );
};

/* ============================================================ */
/*  A. DEMANDS                                                  */
/* ============================================================ */
const DemandsList = ({
  demands,
  onSend,
  onMarkSigned,
  onShare,
}: {
  demands: Demand[];
  onSend: (id: string) => void;
  onMarkSigned: (id: string) => void;
  onShare: (id: string) => void;
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
        const isSigned =
          status === "CLIENT_AGREEMENT_SIGNED" || status === "SHARED_WITH_AGENTS";
        return (
          <Card key={d.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-slate-500">
                    {d.demand_reference || "—"}
                  </span>
                  <Pill s={status} />
                </div>
                <p className="font-medium text-slate-900 mt-1.5">{d.name}</p>
                <p className="text-sm text-slate-500">
                  {d.email}
                  {d.location && ` · ${d.location}`}
                  {d.budget && ` · ${d.budget}`}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <SecondaryButton onClick={() => onSend(d.id)} className="!py-2 !px-3 text-xs">
                  <Send size={13} /> Envoyer DocuSign
                </SecondaryButton>
                {!isSigned && (
                  <TestModeBtn onClick={() => onMarkSigned(d.id)}>
                    Mode test — marquer comme signé
                  </TestModeBtn>
                )}
                <button
                  disabled={!isSigned || status === "SHARED_WITH_AGENTS"}
                  onClick={() => onShare(d.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                  title={
                    !isSigned
                      ? "Verrouillé : l'accord client doit être signé"
                      : "Partager anonymement avec les agents"
                  }
                >
                  {!isSigned ? <Lock size={12} /> : <CheckCircle2 size={12} />}
                  Partager avec les agents
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

/* ============================================================ */
/*  B. AGENT OPTIONS                                            */
/* ============================================================ */
const OptionsList = ({
  options,
  demands,
  onCreated,
  onSend,
  onMarkSigned,
  onSendToClient,
}: {
  options: AgentOption[];
  demands: Demand[];
  onCreated: () => void;
  onSend: (id: string) => void;
  onMarkSigned: (id: string) => void;
  onSendToClient: (id: string) => void;
}) => {
  const [adding, setAdding] = useState(false);

  const sharedDemands = useMemo(
    () =>
      demands.filter(
        (d) => d.status === "CLIENT_AGREEMENT_SIGNED" || d.status === "SHARED_WITH_AGENTS"
      ),
    [demands]
  );

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">
          Options de bien soumises par les agents pour des demandes anonymisées.
        </p>
        <PrimaryButton onClick={() => setAdding(true)} className="!py-2 !px-3 text-xs">
          <Plus size={13} /> Ajouter une option (admin)
        </PrimaryButton>
      </div>

      {options.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-700 font-medium">Aucune option pour l'instant</p>
          <p className="text-sm text-slate-500 mt-1">
            Saisissez manuellement une option transmise par un agent partenaire.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {options.map((o) => {
            const status = (o.status as OptionStatus) || "AGENT_OPTION_SUBMITTED";
            const isSigned =
              status === "AGENT_AGREEMENT_SIGNED" || status === "SENT_TO_CLIENT";
            const linkedDemand = demands.find((d) => d.id === o.demand_id);
            return (
              <Card key={o.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-500">
                        {o.option_reference || "—"}
                      </span>
                      <Pill s={status} />
                      {linkedDemand && (
                        <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                          <ChevronRight size={11} /> {linkedDemand.demand_reference}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-slate-900 mt-1.5">
                      {o.agent_name}
                      {o.agency_name && (
                        <span className="text-slate-500 font-normal"> · {o.agency_name}</span>
                      )}
                    </p>
                    <p className="text-sm text-slate-500">
                      {o.property_address || "Adresse non précisée"}
                      {o.asking_price && ` · ${o.asking_price}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <SecondaryButton onClick={() => onSend(o.id)} className="!py-2 !px-3 text-xs">
                      <Send size={13} /> Envoyer DocuSign
                    </SecondaryButton>
                    {!isSigned && (
                      <TestModeBtn onClick={() => onMarkSigned(o.id)}>
                        Mode test — marquer comme signé
                      </TestModeBtn>
                    )}
                    <button
                      disabled={!isSigned || status === "SENT_TO_CLIENT"}
                      onClick={() => onSendToClient(o.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {!isSigned ? <Lock size={12} /> : <CheckCircle2 size={12} />}
                      Envoyer au client
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {adding && (
        <NewOptionDialog
          demands={sharedDemands}
          onClose={() => setAdding(false)}
          onCreated={() => {
            setAdding(false);
            onCreated();
          }}
        />
      )}
    </>
  );
};

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
    if (!form.demand_id) return toast.error("Sélectionnez une demande partagée");
    if (!form.agent_name || !form.agent_email)
      return toast.error("Nom et email de l'agent requis");
    setSaving(true);
    const { error } = await supabase.from("agent_options").insert(form);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Option ajoutée");
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-xl text-slate-900 mb-1">Nouvelle option agent</h3>
        <p className="text-sm text-slate-500 mb-4">
          Saisie manuelle par l'admin. Liez l'option à une demande déjà partagée avec le réseau.
        </p>

        {demands.length === 0 ? (
          <div className="p-4 rounded-xl bg-amber-50 ring-1 ring-amber-200 text-sm text-amber-800">
            Aucune demande n'est encore prête à être partagée. Marquez d'abord une demande
            comme « Accord client signé ».
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
                  <option key={d.id} value={d.id}>
                    {d.demand_reference} · {d.location || "—"} · {d.budget || "—"}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nom de l'agent">
                <Input value={form.agent_name} onChange={(v) => setForm({ ...form, agent_name: v })} />
              </Field>
              <Field label="Agence">
                <Input
                  value={form.agency_name}
                  onChange={(v) => setForm({ ...form, agency_name: v })}
                />
              </Field>
              <Field label="Email agent">
                <Input
                  value={form.agent_email}
                  onChange={(v) => setForm({ ...form, agent_email: v })}
                />
              </Field>
              <Field label="Téléphone">
                <Input
                  value={form.agent_phone}
                  onChange={(v) => setForm({ ...form, agent_phone: v })}
                />
              </Field>
              <Field label="Adresse du bien">
                <Input
                  value={form.property_address}
                  onChange={(v) => setForm({ ...form, property_address: v })}
                />
              </Field>
              <Field label="Référence">
                <Input
                  value={form.property_reference}
                  onChange={(v) => setForm({ ...form, property_reference: v })}
                />
              </Field>
              <Field label="Prix demandé">
                <Input
                  value={form.asking_price}
                  onChange={(v) => setForm({ ...form, asking_price: v })}
                />
              </Field>
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
/*  C. VIEWINGS                                                 */
/* ============================================================ */
const ViewingsList = ({
  viewings,
  options,
  demands,
  onCreated,
  onSend,
  onMarkSigned,
  onSchedule,
}: {
  viewings: Viewing[];
  options: AgentOption[];
  demands: Demand[];
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
        <p className="text-sm text-slate-500">
          Visites demandées par les clients après envoi d'une option.
        </p>
        <PrimaryButton onClick={() => setAdding(true)} className="!py-2 !px-3 text-xs">
          <Plus size={13} /> Nouvelle demande de visite
        </PrimaryButton>
      </div>

      {viewings.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-700 font-medium">Aucune visite demandée</p>
          <p className="text-sm text-slate-500 mt-1">
            Les demandes de visite apparaissent ici après accord agent.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {viewings.map((v) => {
            const status = (v.status as ViewingStatus) || "VIEWING_REQUESTED";
            const isSigned =
              status === "VIEWING_CONFIRMATION_SIGNED" || status === "VIEWING_SCHEDULED";
            return (
              <Card key={v.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Pill s={status} />
                    </div>
                    <p className="font-medium text-slate-900 mt-1.5 inline-flex items-center gap-2">
                      <Eye size={14} className="text-slate-400" /> {v.property_address || "—"}
                    </p>
                    <p className="text-sm text-slate-500">
                      Client : {v.client_name || "—"} · Agent : {v.agent_name || "—"}
                      {v.viewing_date &&
                        ` · ${new Date(v.viewing_date).toLocaleString("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <SecondaryButton onClick={() => onSend(v.id)} className="!py-2 !px-3 text-xs">
                      <Send size={13} /> Envoyer DocuSign
                    </SecondaryButton>
                    {!isSigned && (
                      <TestModeBtn onClick={() => onMarkSigned(v.id)}>
                        Mode test — marquer comme signé
                      </TestModeBtn>
                    )}
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
          onCreated={() => {
            setAdding(false);
            onCreated();
          }}
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
      <div
        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-xl text-slate-900 mb-1">Nouvelle demande de visite</h3>
        <p className="text-sm text-slate-500 mb-4">
          Choisissez une option dont l'accord agent est signé.
        </p>

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
                  <option key={o.id} value={o.id}>
                    {o.option_reference} · {o.property_address || "—"} · {o.agent_name}
                  </option>
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