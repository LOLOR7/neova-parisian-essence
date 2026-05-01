import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "./AdminLayout";
import { toast } from "sonner";
import { X, Send, Search } from "lucide-react";

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
  active: boolean;
};

const StatusBadge = ({ s }: { s: Status }) => {
  const map: Record<Status, string> = {
    "Nouvelle": "bg-blue-100 text-blue-800",
    "À qualifier": "bg-amber-100 text-amber-800",
    "Contacté": "bg-purple-100 text-purple-800",
    "Envoyé au réseau": "bg-emerald-100 text-emerald-800",
    "Clôturé": "bg-slate-200 text-slate-700",
  };
  return <span className={`inline-block px-2.5 py-1 text-xs rounded-full ${map[s]}`}>{s}</span>;
};

const AdminDemandes = () => {
  const [items, setItems] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
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
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl">Demandes reçues</h1>
          <p className="text-sm text-slate-soft mt-1">{items.length} demande{items.length > 1 ? "s" : ""} au total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher…"
              className="pl-9 pr-3 py-2 text-sm border border-hairline bg-background rounded-sm w-56 focus:outline-none focus:border-foreground"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 text-sm border border-hairline bg-background rounded-sm focus:outline-none focus:border-foreground"
          >
            <option value="">Tous les statuts</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-background border border-hairline rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bone border-b border-hairline">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Secteur</th>
              <th className="px-4 py-3">Budget</th>
              <th className="px-4 py-3">Surface</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">Chargement…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">Aucune demande.</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className="border-b border-hairline last:border-0 hover:bg-bone/50">
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.phone || "—"}</td>
                <td className="px-4 py-3">{r.service_type}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.location || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.budget || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.surface || "—"}</td>
                <td className="px-4 py-3"><StatusBadge s={r.status} /></td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setOpenId(r.id)}
                    className="text-xs uppercase tracking-[0.15em] underline underline-offset-4 hover:text-brass"
                  >
                    Voir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

/* ---------- Detail side panel ---------- */
const RequestDetail = ({ request, onClose, onUpdated }: { request: Request; onClose: () => void; onUpdated: () => void }) => {
  const [status, setStatus] = useState<Status>(request.status);
  const [note, setNote] = useState(request.internal_note || "");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [includeClient, setIncludeClient] = useState(false);
  const [sending, setSending] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    supabase.from("network_contacts").select("id, name, company, role, email, sector, active")
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

  const Row = ({ label, value }: { label: string; value: any }) => (
    <div className="grid grid-cols-3 gap-4 py-2 border-b border-hairline/60">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="col-span-2 text-sm">{value || "—"}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-background h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-background border-b border-hairline px-8 py-5 flex items-center justify-between z-10">
          <div>
            <p className="eyebrow">Demande</p>
            <h2 className="font-display text-2xl mt-1">{request.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bone rounded-sm"><X size={18} /></button>
        </div>

        <div className="p-8 space-y-8">
          <section>
            <p className="eyebrow mb-3">Informations</p>
            <Row label="Date" value={new Date(request.created_at).toLocaleString("fr-FR")} />
            <Row label="Source" value={request.source} />
            <Row label="Nom" value={request.name} />
            <Row label="Email" value={request.email} />
            <Row label="Téléphone" value={request.phone} />
            <Row label="Type de demande" value={request.service_type} />
            <Row label="Secteur recherché" value={request.location} />
            <Row label="Budget" value={request.budget} />
            <Row label="Surface" value={request.surface} />
            <Row label="Calendrier" value={request.timeline} />
            <Row label="Type de projet" value={request.property_type} />
            <Row label="Usage prévu" value={request.intended_use} />
            <Row label="Niveau de travaux" value={request.works_level} />
            <Row label="État actuel" value={request.current_condition} />
            <Row label="Objectif rénovation" value={request.renovation_objective} />
            <Row label="Adresse" value={request.address} />
            <Row label="Niveau d'accompagnement" value={request.support_level} />
            <Row label="Message" value={request.message} />
          </section>

          <section>
            <p className="eyebrow mb-3">Statut</p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    status === s
                      ? "bg-foreground text-background border-foreground"
                      : "border-hairline hover:border-foreground"
                  }`}
                >{s}</button>
              ))}
            </div>
          </section>

          <section>
            <p className="eyebrow mb-3">Note interne</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full bg-bone border border-hairline rounded-sm p-3 text-sm focus:outline-none focus:border-foreground"
              placeholder="Notes privées sur cette demande…"
            />
            <button
              onClick={saveNote}
              disabled={savingNote}
              className="mt-3 text-xs uppercase tracking-[0.15em] underline underline-offset-4 disabled:opacity-50"
            >{savingNote ? "Enregistrement…" : "Enregistrer la note"}</button>
          </section>

          <section>
            <p className="eyebrow mb-3">Envoyer au réseau</p>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun contact actif. Ajoutez-en dans l'onglet Réseau.</p>
            ) : (
              <>
                <div className="border border-hairline rounded-sm divide-y divide-hairline max-h-64 overflow-y-auto">
                  {contacts.map((c) => (
                    <label key={c.id} className="flex items-center gap-3 p-3 hover:bg-bone cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggle(c.id)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{c.name} {c.company && <span className="text-muted-foreground">— {c.company}</span>}</p>
                        <p className="text-xs text-muted-foreground">{c.role} · {c.email} {c.sector && `· ${c.sector}`}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <label className="mt-4 flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeClient}
                    onChange={(e) => setIncludeClient(e.target.checked)}
                    className="w-4 h-4 mt-0.5"
                  />
                  <span className="text-sm">
                    <span className="font-medium">Inclure les coordonnées du client</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      Par défaut, nom, email et téléphone du client ne sont pas partagés.
                    </span>
                  </span>
                </label>
                <button
                  onClick={send}
                  disabled={sending || selected.size === 0}
                  className="mt-5 inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-sm uppercase tracking-[0.15em] disabled:opacity-50"
                >
                  <Send size={14} />
                  {sending ? "Envoi…" : `Envoyer au réseau (${selected.size})`}
                </button>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDemandes;