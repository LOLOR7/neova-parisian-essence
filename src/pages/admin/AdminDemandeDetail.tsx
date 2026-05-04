import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout, Card, PrimaryButton, SecondaryButton, StatusBadge } from "./AdminLayout";
import { toast } from "sonner";
import { ArrowLeft, Send, AlertTriangle, Search, Mail, Phone, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUSES = ["Nouvelle", "À qualifier", "Contacté", "Envoyé au réseau", "Clôturé"] as const;
type Status = typeof STATUSES[number];

type Request = any;
type Contact = {
  id: string;
  name: string;
  company: string | null;
  role: string;
  email: string | null;
  phone: string | null;
  sector: string | null;
};

const ROLES = ["Agent", "Architect", "Contractor", "Professional", "Autre"] as const;

function buildDefaultBody(r: Request, contactName: string, includeClient: boolean) {
  const lines = [
    `Hello ${contactName || "there"},`,
    "",
    "We have a new client request that may match your profile.",
    "",
    "Project summary:",
    `- Type: ${r.request_type || r.service_type || "—"}`,
    `- Location: ${r.location || "—"}`,
    `- Budget: ${r.budget || "—"}`,
    `- Surface: ${r.surface || "—"}`,
  ];
  if (r.price_per_sqm) lines.push(`- Price / sqm: ${r.price_per_sqm}`);
  if (r.timeline) lines.push(`- Timeline: ${r.timeline}`);
  if (r.message) lines.push(`- Project details: ${r.message}`);
  lines.push("");
  if (includeClient) {
    lines.push("Client contact:");
    lines.push(`- Name: ${r.name}`);
    lines.push(`- Email: ${r.email}`);
    if (r.phone) lines.push(`- Phone: ${r.phone}`);
  } else {
    lines.push("At this stage, client personal contact details are not shared.");
  }
  lines.push("");
  lines.push("If you are interested and available, please reply to info@neovaspace.com and we will coordinate the next step.");
  lines.push("");
  lines.push("Best,");
  lines.push("Neova Space");
  return lines.join("\n");
}

function buildDefaultSubject(r: Request) {
  const loc = r.location || "—";
  const bud = r.budget || "—";
  return `New Neova opportunity — ${loc} — ${bud}`;
}

const InfoRow = ({ label, value }: { label: string; value: any }) => (
  <div className="grid grid-cols-3 gap-3 py-2.5">
    <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
    <div className="col-span-2 text-sm text-slate-800 break-words">{value || <span className="text-slate-400">—</span>}</div>
  </div>
);

const AdminDemandeDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [includeClient, setIncludeClient] = useState(false);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [testEmail, setTestEmail] = useState("info@neovaspace.com");
  const [sendingTest, setSendingTest] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: r }, { data: cs }] = await Promise.all([
      supabase.from("property_requests").select("*").eq("id", id!).maybeSingle(),
      supabase.from("network_contacts").select("id, name, company, role, email, phone, sector").eq("active", true).order("name"),
    ]);
    if (!r) { toast.error("Demande introuvable"); nav("/admin/demandes"); return; }
    setRequest(r);
    setNote(r.internal_note || "");
    setContacts((cs as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      if (roleFilter && c.role !== roleFilter) return false;
      if (!search) return true;
      const s = search.toLowerCase();
      return [c.name, c.company, c.email, c.sector, c.role].filter(Boolean).join(" ").toLowerCase().includes(s);
    });
  }, [contacts, search, roleFilter]);

  const toggle = (cid: string) => {
    const n = new Set(selected);
    n.has(cid) ? n.delete(cid) : n.add(cid);
    setSelected(n);
  };

  const updateStatus = async (s: Status) => {
    const { error } = await supabase.from("property_requests").update({ status: s }).eq("id", request.id);
    if (error) toast.error("Erreur"); else { toast.success("Statut mis à jour"); setRequest({ ...request, status: s }); }
  };

  const saveNote = async () => {
    setSavingNote(true);
    const { error } = await supabase.from("property_requests").update({ internal_note: note }).eq("id", request.id);
    setSavingNote(false);
    if (error) toast.error("Erreur"); else toast.success("Note enregistrée");
  };

  const openComposer = () => {
    if (selected.size === 0) { toast.error("Sélectionnez au moins un contact"); return; }
    setSubject(buildDefaultSubject(request));
    setBody(buildDefaultBody(request, "[Contact Name]", includeClient));
    setComposerOpen(true);
  };

  const send = async () => {
    setSending(true);
    return doSend(false);
  };

  const sendTest = async () => {
    if (!testEmail || !/.+@.+\..+/.test(testEmail)) {
      toast.error("Email de test invalide");
      return;
    }
    setSendingTest(true);
    await doSend(true);
  };

  const doSend = async (testMode: boolean) => {
    if (testMode) {
      // Single test email — does not touch demand status or outreach log.
      const details = [
        { label: "Type", value: request.request_type || request.service_type || "" },
        { label: "Location", value: request.location || "" },
        { label: "Budget", value: request.budget || "" },
        { label: "Surface", value: request.surface || "" },
      ];
      if (request.price_per_sqm) details.push({ label: "Price / sqm", value: request.price_per_sqm });
      if (request.timeline) details.push({ label: "Timeline", value: request.timeline });
      const clientBlock = includeClient ? [
        { label: "Name", value: request.name },
        { label: "Email", value: request.email },
        ...(request.phone ? [{ label: "Phone", value: request.phone }] : []),
      ] : undefined;
      try {
        const { error } = await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "network-outreach",
            recipientEmail: testEmail,
            idempotencyKey: `outreach-test-${request.id}-${Date.now()}`,
            templateData: {
              subject: `[TEST] ${subject}`,
              contactName: "Test Recipient",
              details,
              message: request.message || "",
              clientBlock,
            },
          },
        });
        if (error) throw error;
        await supabase.from("admin_notifications").insert({
          category: "outreach",
          message: `Test outreach email sent to ${testEmail} for demand ${request.demand_reference || request.id}.`,
          related_entity_id: request.id,
          related_entity_type: "property_request",
        });
        toast.success(`Email de test envoyé à ${testEmail}`);
      } catch (e: any) {
        toast.error(`Échec envoi test : ${e?.message || e}`);
      }
      setSendingTest(false);
      return;
    }

    const selectedContacts = contacts.filter((c) => selected.has(c.id));
    let sent = 0, skipped = 0, failed = 0;
    const skippedNames: string[] = [];
    const failedNames: string[] = [];

    for (const c of selectedContacts) {
      if (!c.email) {
        skipped++;
        skippedNames.push(c.name);
        await supabase.from("demand_contact_outreach").insert({
          demand_id: request.id, contact_id: c.id, contact_name: c.name,
          contact_email: null, email_subject: subject, status: "skipped",
          error_message: "no email", included_client_contact: includeClient,
        });
        continue;
      }
      const personalBody = body
        .replace(/\[Contact Name\]/g, c.name);
      const details = [
        { label: "Type", value: request.request_type || request.service_type || "" },
        { label: "Location", value: request.location || "" },
        { label: "Budget", value: request.budget || "" },
        { label: "Surface", value: request.surface || "" },
      ];
      if (request.price_per_sqm) details.push({ label: "Price / sqm", value: request.price_per_sqm });
      if (request.timeline) details.push({ label: "Timeline", value: request.timeline });

      const clientBlock = includeClient ? [
        { label: "Name", value: request.name },
        { label: "Email", value: request.email },
        ...(request.phone ? [{ label: "Phone", value: request.phone }] : []),
      ] : undefined;

      try {
        const { error } = await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "network-outreach",
            recipientEmail: c.email,
            idempotencyKey: `outreach-${request.id}-${c.id}-${Date.now()}`,
            templateData: {
              subject,
              contactName: c.name,
              intro: personalBody.split("\n").slice(2, 3).join(" ") || undefined,
              details,
              message: request.message || "",
              clientBlock,
            },
          },
        });
        if (error) throw error;
        sent++;
        await supabase.from("demand_contact_outreach").insert({
          demand_id: request.id, contact_id: c.id, contact_name: c.name,
          contact_email: c.email, email_subject: subject, status: "sent",
          included_client_contact: includeClient,
        });
      } catch (e: any) {
        failed++;
        failedNames.push(c.name);
        await supabase.from("demand_contact_outreach").insert({
          demand_id: request.id, contact_id: c.id, contact_name: c.name,
          contact_email: c.email, email_subject: subject, status: "failed",
          error_message: String(e?.message || e), included_client_contact: includeClient,
        });
      }
    }

    if (sent > 0) {
      await supabase.from("property_requests").update({ status: "Envoyé au réseau" }).eq("id", request.id);
      await supabase.from("admin_notifications").insert({
        category: "outreach",
        message: `Demand ${request.demand_reference || request.id} sent to ${sent} network contact${sent > 1 ? "s" : ""}.`,
        related_entity_id: request.id,
        related_entity_type: "property_request",
      });
      setRequest({ ...request, status: "Envoyé au réseau" });
    }

    setSending(false);
    setConfirmOpen(false);
    setComposerOpen(false);
    setSelected(new Set());

    const parts: string[] = [];
    if (sent) parts.push(`${sent} envoyé(s)`);
    if (skipped) parts.push(`${skipped} ignoré(s)`);
    if (failed) parts.push(`${failed} échec(s)`);
    toast.success(parts.join(" · ") || "Aucun envoi");
    if (skippedNames.length) toast.warning(`Sans email : ${skippedNames.join(", ")}`);
    if (failedNames.length) toast.error(`Échec : ${failedNames.join(", ")}`);
  };

  if (loading || !request) {
    return <AdminLayout title="Demande"><Card className="p-12 text-center text-slate-500">Chargement…</Card></AdminLayout>;
  }

  return (
    <AdminLayout
      title={request.name}
      subtitle={`${request.demand_reference || ""} · ${request.service_type}`}
      actions={
        <Link to="/admin/demandes">
          <SecondaryButton><ArrowLeft size={14} />Retour</SecondaryButton>
        </Link>
      }
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: demand recap */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Statut</h3>
              <StatusBadge s={request.status} />
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button key={s} onClick={() => updateStatus(s)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                    request.status === s ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
                  }`}>{s}</button>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Informations client</h3>
            <InfoRow label="Nom" value={request.name} />
            <InfoRow label="Email" value={request.email} />
            <InfoRow label="Téléphone" value={request.phone} />
            <InfoRow label="Date" value={new Date(request.created_at).toLocaleString("fr-FR")} />
            <InfoRow label="Source" value={request.source} />
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Projet recherché</h3>
            <InfoRow label="Type de demande" value={request.service_type} />
            <InfoRow label="Request type" value={request.request_type} />
            <InfoRow label="Secteur" value={request.location} />
            <InfoRow label="Adresse" value={request.address} />
            <InfoRow label="Budget" value={request.budget} />
            <InfoRow label="Surface" value={request.surface} />
            <InfoRow label="Prix / m²" value={request.price_per_sqm} />
            <InfoRow label="Type de projet" value={request.property_type} />
            <InfoRow label="Usage prévu" value={request.intended_use} />
            <InfoRow label="Calendrier" value={request.timeline} />
            <InfoRow label="Niveau de travaux" value={request.works_level} />
            <InfoRow label="État actuel" value={request.current_condition} />
            <InfoRow label="Objectif rénovation" value={request.renovation_objective} />
            <InfoRow label="Accompagnement" value={request.support_level} />
          </Card>

          {request.message && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Message</h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{request.message}</p>
            </Card>
          )}

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Notes internes</h3>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={5}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-500"
              placeholder="Notes privées sur cette demande…" />
            <SecondaryButton onClick={saveNote} disabled={savingNote} className="mt-3">
              {savingNote ? "Enregistrement…" : "Enregistrer la note"}
            </SecondaryButton>
          </Card>
        </div>

        {/* Right: contact selection */}
        <div className="space-y-5">
          <Card className="p-5 sticky top-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Contacts à solliciter</h3>
            <p className="text-xs text-slate-500 mb-3">{selected.size} contact{selected.size > 1 ? "s" : ""} sélectionné{selected.size > 1 ? "s" : ""}</p>

            {/* search + filter */}
            <div className="space-y-2 mb-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher nom, société, secteur…"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-500" />
              </div>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-500">
                <option value="">Tous les types</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {filteredContacts.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">Aucun contact.</p>
            ) : (
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-[420px] overflow-y-auto bg-white">
                {filteredContacts.map((c) => (
                  <label key={c.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)}
                      className="w-4 h-4 mt-1 rounded shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-slate-800">{c.name}</p>
                        <span className="text-[10px] uppercase tracking-wide bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{c.role}</span>
                      </div>
                      {c.company && <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1"><Building2 size={11} />{c.company}</p>}
                      {c.email ? (
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><Mail size={11} />{c.email}</p>
                      ) : (
                        <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1"><AlertTriangle size={11} />pas d'email</p>
                      )}
                      {c.phone && <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><Phone size={11} />{c.phone}</p>}
                      {c.sector && <p className="text-xs text-slate-500 mt-0.5">{c.sector}</p>}
                    </div>
                  </label>
                ))}
              </div>
            )}

            <label className="mt-4 flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={includeClient} onChange={(e) => setIncludeClient(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded" />
              <span className="text-sm text-slate-700">
                Inclure les coordonnées du client
                <span className="block text-xs text-amber-700 mt-0.5">
                  Par défaut, l'email et le téléphone du client ne sont pas partagés. N'activez ceci que si vous êtes prêt à introduire le client directement.
                </span>
              </span>
            </label>

            <PrimaryButton onClick={openComposer} disabled={selected.size === 0} className="mt-4 w-full justify-center">
              <Send size={14} />Préparer l'email aux contacts sélectionnés
            </PrimaryButton>
          </Card>
        </div>
      </div>

      {/* Composer */}
      <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Composer l'email</DialogTitle>
            <DialogDescription>Un email sera envoyé individuellement à chaque contact (pas en CC).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-1.5">Destinataires ({selected.size})</p>
              <div className="flex flex-wrap gap-1.5">
                {contacts.filter(c => selected.has(c.id)).map(c => (
                  <span key={c.id} className={`text-xs px-2 py-1 rounded ${c.email ? "bg-slate-100 text-slate-700" : "bg-amber-100 text-amber-700"}`}>
                    {c.name}{!c.email && " (sans email)"}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-500 mb-1.5 block">Sujet</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-500" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-500 mb-1.5 block">Corps</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={14}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-500 font-mono" />
              <p className="text-[11px] text-slate-500 mt-1">Astuce : <code>[Contact Name]</code> sera remplacé par le nom de chaque contact.</p>
            </div>
            <div className={`p-3 rounded-lg border text-xs ${includeClient ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
              {includeClient
                ? "⚠ Coordonnées client INCLUSES — vous êtes sur le point de partager les infos personnelles du client."
                : "Coordonnées client NON INCLUSES."}
            </div>
          </div>
          <DialogFooter>
            <SecondaryButton onClick={() => setComposerOpen(false)}>Annuler</SecondaryButton>
            <PrimaryButton onClick={() => setConfirmOpen(true)}>Continuer</PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer cette demande à {selected.size} contact{selected.size > 1 ? "s" : ""} ?</DialogTitle>
            <DialogDescription>
              Coordonnées client : <strong>{includeClient ? "INCLUSES" : "NON INCLUSES"}</strong>
              {includeClient && (
                <span className="block mt-2 text-amber-700">
                  Vous êtes sur le point de partager les coordonnées personnelles du client avec des contacts externes.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton onClick={() => setConfirmOpen(false)} disabled={sending}>Annuler</SecondaryButton>
            <PrimaryButton onClick={send} disabled={sending}>
              {sending ? "Envoi…" : "Confirmer l'envoi"}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminDemandeDetail;