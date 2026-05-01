import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout, Card, PrimaryButton, SecondaryButton, SearchInput, StatusBadge } from "./AdminLayout";
import { toast } from "sonner";
import { X, Send, Inbox } from "lucide-react";

const STATUSES = ["Nouvelle", "À qualifier", "Contacté", "Envoyé au réseau", "Clôturé"] as const;
type Status = typeof STATUSES[number];

type Request = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  service_type: string;
  location: string | null;
  budget: string | null;
  surface: string | null;
  property_type: string | null;
  intended_use: string | null;
  timeline: string | null;
  works_level: string | null;
  current_condition: string | null;
  renovation_objective: string | null;
  address: string | null;
  support_level: string | null;
  message: string | null;
  source: string;
  status: Status;
  internal_note: string | null;
};

type Contact = {
  id: string;
  name: string;
  company: string | null;
  role: string;
  email: string;
  sector: string | null;
};

const FILTERS: { label: string; value: "" | Status }[] = [
  { label: "Toutes", value: "" },
  { label: "Nouvelles", value: "Nouvelle" },
  { label: "À qualifier", value: "À qualifier" },
  { label: "Contactées", value: "Contacté" },
  { label: "Envoyées au réseau", value: "Envoyé au réseau" },
  { label: "Clôturées", value: "Clôturé" },
];

const AdminDemandes = () => {
  const [items, setItems] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const openId = params.get("open");
  const setOpenId = (id: string | null) => {
    const p = new URLSearchParams(params);
    if (id) p.set("open", id);
    else p.delete("open");
    setParams(p, { replace: true });
  };
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"" | Status>("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("property_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Erreur de chargement");
    setItems((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (filter && r.status !== filter) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return [r.name, r.email, r.phone, r.location, r.service_type]
        .filter(Boolean).join(" ").toLowerCase().includes(s);
    });
  }, [items, q, filter]);

  const open = items.find((i) => i.id === openId) || null;

  return (
    <AdminLayout
      title="Demandes reçues"
      subtitle="Retrouvez ici les demandes envoyées depuis le formulaire « Trouver votre bien »."
      actions={<SearchInput value={q} onChange={setQ} />}
    >
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          const count = f.value === "" ? items.length : items.filter((i) => i.status === f.value).length;
          return (
            <button
              key={f.label}
              onClick={() => setFilter(f.value)}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-colors ${
                active
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
              }`}
            >
              <span>{f.label}</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${active ? "bg-white/15" : "bg-slate-100"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <Card className="p-12 text-center text-slate-500">Chargement…</Card>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
            <Inbox size={22} />
          </div>
          <h3 className="font-display text-2xl mt-5 text-slate-900">Aucune demande pour le moment.</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Les nouvelles demandes issues du formulaire apparaîtront ici automatiquement.
          </p>
          <Link to="/find-your-property" className="inline-block mt-5">
            <SecondaryButton>Voir le formulaire</SecondaryButton>
          </Link>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* header row */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50/60 border-b" style={{ borderColor: "hsl(30 12% 92%)" }}>
            <div className="col-span-3">Client</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Secteur</div>
            <div className="col-span-1">Budget</div>
            <div className="col-span-1">Surface</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-2 text-right">Statut</div>
          </div>

          <div className="divide-y" style={{ borderColor: "hsl(30 12% 92%)" }}>
            {filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => setOpenId(r.id)}
                className="w-full text-left grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-slate-50/70 transition-colors items-center"
              >
                <div className="md:col-span-3 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{r.name}</p>
                  <p className="text-xs text-slate-500 truncate">{r.email}</p>
                </div>
                <div className="md:col-span-2 text-sm text-slate-700 truncate">{r.service_type}</div>
                <div className="md:col-span-2 text-sm text-slate-600 truncate">{r.location || "—"}</div>
                <div className="md:col-span-1 text-sm text-slate-600 truncate">{r.budget || "—"}</div>
                <div className="md:col-span-1 text-sm text-slate-600 truncate">{r.surface || "—"}</div>
                <div className="md:col-span-1 text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString("fr-FR")}</div>
                <div className="md:col-span-2 flex md:justify-end items-center gap-3">
                  <StatusBadge s={r.status} />
                  <span className="text-xs text-slate-500 underline-offset-2 hover:underline">Voir</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {open && (
        <RequestDetail
          request={open}
          onClose={() => setOpenId(null)}
          onUpdated={load}
        />
      )}
    </AdminLayout>
  );
};

/* ---------- Detail drawer ---------- */
const RequestDetail = ({ request, onClose, onUpdated }: { request: Request; onClose: () => void; onUpdated: () => void }) => {
  const [status, setStatus] = useState<Status>(request.status);
  const [note, setNote] = useState(request.internal_note || "");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [includeClient, setIncludeClient] = useState(false);
  const [sending, setSending] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    supabase.from("network_contacts").select("id, name, company, role, email, sector")
      .eq("active", true).order("name").then(({ data }) => setContacts((data as any) ?? []));
  }, []);

  const updateStatus = async (s: Status) => {
    setStatus(s);
    const { error } = await supabase.from("property_requests").update({ status: s }).eq("id", request.id);
    if (error) toast.error("Erreur de mise à jour"); else { toast.success("Statut mis à jour"); onUpdated(); }
  };

  const saveNote = async () => {
    setSavingNote(true);
    const { error } = await supabase.from("property_requests").update({ internal_note: note }).eq("id", request.id);
    setSavingNote(false);
    if (error) toast.error("Erreur"); else { toast.success("Note enregistrée"); onUpdated(); }
  };

  const toggle = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  const send = async () => {
    if (selected.size === 0) { toast.error("Sélectionnez au moins un contact"); return; }
    setSending(true);
    try {
      const subject = "Nouvelle recherche qualifiée — Neova";
      const clientLine = includeClient
        ? `\n\nCoordonnées du client :\n${request.name}\n${request.email}\n${request.phone || ""}\n`
        : "";
      const body = `Bonjour,

Nous avons une nouvelle recherche qualifiée susceptible de vous intéresser.

Type de demande : ${request.service_type}
Secteur recherché : ${request.location || "—"}
Budget : ${request.budget || "—"}
Surface : ${request.surface || "—"}
Calendrier : ${request.timeline || "—"}
Type de projet : ${request.property_type || "—"}
Message synthétique : ${request.message || "—"}${clientLine}

Si vous avez une opportunité pertinente, vous pouvez répondre directement à cet email.

Bien cordialement,
Neova`;
      const { error } = await supabase.functions.invoke("send-network-email", {
        body: {
          property_request_id: request.id,
          contact_ids: Array.from(selected),
          subject,
          body,
          include_client_details: includeClient,
        },
      });
      if (error) throw error;
      toast.success("La demande a bien été envoyée aux contacts sélectionnés.");
      setSelected(new Set());
      onUpdated();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="grid grid-cols-3 gap-3 py-2.5">
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className="col-span-2 text-sm text-slate-800">{value || <span className="text-slate-400">—</span>}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-[hsl(34_22%_96%)] h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white/90 backdrop-blur border-b px-8 py-5 flex items-center justify-between z-10" style={{ borderColor: "hsl(30 12% 90%)" }}>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Demande</p>
            <h2 className="font-display text-2xl mt-0.5 text-slate-900">{request.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600"><X size={18} /></button>
        </div>

        <div className="p-6 md:p-8 grid lg:grid-cols-3 gap-5">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-5">
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
              <InfoRow label="Secteur" value={request.location} />
              <InfoRow label="Adresse" value={request.address} />
              <InfoRow label="Budget" value={request.budget} />
              <InfoRow label="Surface" value={request.surface} />
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
          </div>

          {/* Side column */}
          <div className="space-y-5">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Statut</h3>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      status === s
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
                    }`}
                  >{s}</button>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Notes internes</h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-500"
                placeholder="Notes privées sur cette demande…"
              />
              <SecondaryButton onClick={saveNote} disabled={savingNote} className="mt-3 w-full justify-center">
                {savingNote ? "Enregistrement…" : "Enregistrer la note"}
              </SecondaryButton>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Contacts à solliciter</h3>
              <p className="text-xs text-slate-500 mb-3">Sélectionnez les membres du réseau à contacter.</p>
              {contacts.length === 0 ? (
                <p className="text-sm text-slate-500">Aucun contact actif. Ajoutez-en dans l'onglet Réseau.</p>
              ) : (
                <>
                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-60 overflow-y-auto bg-white">
                    {contacts.map((c) => (
                      <label key={c.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selected.has(c.id)}
                          onChange={() => toggle(c.id)}
                          className="w-4 h-4 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{c.name} {c.company && <span className="text-slate-500 font-normal">— {c.company}</span>}</p>
                          <p className="text-xs text-slate-500 truncate">{c.role} · {c.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <label className="mt-4 flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeClient}
                      onChange={(e) => setIncludeClient(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded"
                    />
                    <span className="text-sm text-slate-700">
                      Inclure les coordonnées du client
                      <span className="block text-xs text-slate-500 mt-0.5">
                        Par défaut, nom, email et téléphone du client ne sont pas partagés.
                      </span>
                    </span>
                  </label>
                  <PrimaryButton onClick={send} disabled={sending || selected.size === 0} className="mt-4 w-full justify-center">
                    <Send size={14} />
                    {sending ? "Envoi…" : `Envoyer au réseau (${selected.size})`}
                  </PrimaryButton>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDemandes;
