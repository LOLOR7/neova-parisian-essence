import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "./AdminLayout";
import { toast } from "sonner";
import { Plus, Upload, Search, X, Pencil } from "lucide-react";

const ROLES = ["Agent immobilier", "Architecte", "Entreprise", "Artisan", "Autre"];

type Contact = {
  id: string;
  created_at: string;
  name: string;
  company: string | null;
  role: string;
  email: string;
  phone: string | null;
  sector: string | null;
  specialties: string | null;
  notes: string | null;
  active: boolean;
};

const empty = { name: "", company: "", role: "Agent immobilier", email: "", phone: "", sector: "", specialties: "", notes: "", active: true };

const AdminReseau = () => {
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [editing, setEditing] = useState<Contact | null>(null);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState<{ rows: any[]; duplicates: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("network_contacts").select("*").order("created_at", { ascending: false });
    setItems((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const sectors = useMemo(() => Array.from(new Set(items.map(i => i.sector).filter(Boolean))) as string[], [items]);

  const filtered = useMemo(() => items.filter(c => {
    if (roleFilter && c.role !== roleFilter) return false;
    if (sectorFilter && c.sector !== sectorFilter) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return [c.name, c.company, c.email, c.specialties].filter(Boolean).join(" ").toLowerCase().includes(s);
  }), [items, q, roleFilter, sectorFilter]);

  const toggleActive = async (c: Contact) => {
    await supabase.from("network_contacts").update({ active: !c.active }).eq("id", c.id);
    load();
  };

  /* ---- CSV parsing ---- */
  const parseCSV = (text: string): any[] => {
    const lines = text.replace(/\r/g, "").split("\n").filter(l => l.trim());
    if (lines.length < 2) return [];
    const splitLine = (l: string) => {
      // simple csv (no quoted commas) — sufficient for typical contact data
      const out: string[] = []; let cur = ""; let inQ = false;
      for (let i = 0; i < l.length; i++) {
        const ch = l[i];
        if (ch === '"') { inQ = !inQ; continue; }
        if (ch === "," && !inQ) { out.push(cur.trim()); cur = ""; }
        else cur += ch;
      }
      out.push(cur.trim()); return out;
    };
    const headers = splitLine(lines[0]).map(h => h.toLowerCase());
    return lines.slice(1).map(l => {
      const cells = splitLine(l);
      const o: any = {};
      headers.forEach((h, i) => { o[h] = cells[i] || ""; });
      return o;
    });
  };

  const handleFile = async (f: File) => {
    const text = await f.text();
    const rows = parseCSV(text);
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const existingEmails = new Set(items.map(i => i.email.toLowerCase()));
    const valid: any[] = []; let duplicates = 0;
    const seen = new Set<string>();
    for (const r of rows) {
      const email = (r.email || "").toLowerCase().trim();
      if (!r.name || !emailRe.test(email)) continue;
      if (existingEmails.has(email) || seen.has(email)) { duplicates++; continue; }
      seen.add(email);
      valid.push({
        name: r.name, company: r.company || null,
        role: ROLES.includes(r.role) ? r.role : "Autre",
        email, phone: r.phone || null, sector: r.sector || null,
        specialties: r.specialties || null, notes: r.notes || null, active: true,
      });
    }
    setImporting({ rows: valid, duplicates });
  };

  const confirmImport = async () => {
    if (!importing) return;
    if (importing.rows.length === 0) { setImporting(null); return; }
    const { error } = await supabase.from("network_contacts").insert(importing.rows);
    if (error) toast.error("Erreur d'import");
    else toast.success(`${importing.rows.length} contact(s) importé(s) — ${importing.duplicates} doublon(s) ignoré(s)`);
    setImporting(null); load();
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl">Réseau</h1>
          <p className="text-sm text-slate-soft mt-1">{items.length} contact{items.length > 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept=".csv" hidden
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <button onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 border border-hairline px-4 py-2 text-sm rounded-sm hover:border-foreground">
            <Upload size={14} /> Importer CSV
          </button>
          <button onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 text-sm rounded-sm">
            <Plus size={14} /> Ajouter un contact
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…"
            className="pl-9 pr-3 py-2 text-sm border border-hairline bg-background rounded-sm w-56" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-hairline bg-background rounded-sm">
          <option value="">Tous les rôles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-hairline bg-background rounded-sm">
          <option value="">Tous les secteurs</option>
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-background border border-hairline rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bone border-b border-hairline">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Société</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Secteur</th>
              <th className="px-4 py-3">Spécialités</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Chargement…</td></tr>
            : filtered.length === 0 ? <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">Aucun contact.</td></tr>
            : filtered.map(c => (
              <tr key={c.id} className="border-b border-hairline last:border-0 hover:bg-bone/50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.company || "—"}</td>
                <td className="px-4 py-3">{c.role}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.sector || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">{c.specialties || "—"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(c)} className={`text-xs px-2 py-1 rounded-full ${c.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                    {c.active ? "Actif" : "Inactif"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(c)} className="text-xs uppercase tracking-[0.15em] underline underline-offset-4">
                    <Pencil size={12} className="inline mr-1" />Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(adding || editing) && (
        <ContactForm
          initial={editing || (empty as any)}
          onClose={() => { setAdding(false); setEditing(null); }}
          onSaved={() => { setAdding(false); setEditing(null); load(); }}
        />
      )}

      {importing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="bg-background max-w-2xl w-full rounded-sm border border-hairline p-8 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl">Aperçu de l'import</h2>
              <button onClick={() => setImporting(null)}><X size={18} /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {importing.rows.length} contact(s) à importer · {importing.duplicates} doublon(s) ignoré(s)
            </p>
            {importing.rows.length > 0 && (
              <div className="border border-hairline rounded-sm max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-bone text-xs uppercase">
                    <tr><th className="px-3 py-2 text-left">Nom</th><th className="px-3 py-2 text-left">Email</th><th className="px-3 py-2 text-left">Rôle</th></tr>
                  </thead>
                  <tbody>
                    {importing.rows.map((r, i) => (
                      <tr key={i} className="border-t border-hairline"><td className="px-3 py-2">{r.name}</td><td className="px-3 py-2 text-muted-foreground">{r.email}</td><td className="px-3 py-2">{r.role}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setImporting(null)} className="px-4 py-2 text-sm border border-hairline">Annuler</button>
              <button onClick={confirmImport} disabled={importing.rows.length === 0} className="px-4 py-2 text-sm bg-foreground text-background disabled:opacity-50">
                Confirmer l'import
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

const ContactForm = ({ initial, onClose, onSaved }: { initial: any; onClose: () => void; onSaved: () => void }) => {
  const [f, setF] = useState({ ...empty, ...initial });
  const [busy, setBusy] = useState(false);
  const isEdit = !!initial.id;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name || !f.email) { toast.error("Nom et email requis"); return; }
    setBusy(true);
    const payload = {
      name: f.name, company: f.company || null, role: f.role,
      email: f.email.toLowerCase(), phone: f.phone || null, sector: f.sector || null,
      specialties: f.specialties || null, notes: f.notes || null, active: f.active,
    };
    const { error } = isEdit
      ? await supabase.from("network_contacts").update(payload).eq("id", initial.id)
      : await supabase.from("network_contacts").insert(payload);
    setBusy(false);
    if (error) {
      if (error.message.includes("duplicate")) toast.error("Un contact avec cet email existe déjà.");
      else toast.error("Erreur");
    }
    else { toast.success(isEdit ? "Contact mis à jour" : "Contact ajouté"); onSaved(); }
  };

  const Inp = ({ k, label, type = "text" }: any) => (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type={type} value={(f as any)[k] || ""} onChange={(e) => setF({ ...f, [k]: e.target.value })}
        className="mt-1 w-full bg-bone border border-hairline rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-foreground" />
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <form onSubmit={save} className="bg-background max-w-2xl w-full rounded-sm border border-hairline p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">{isEdit ? "Modifier le contact" : "Nouveau contact"}</h2>
          <button type="button" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Inp k="name" label="Nom *" />
          <Inp k="company" label="Société" />
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Rôle</span>
            <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}
              className="mt-1 w-full bg-bone border border-hairline rounded-sm px-3 py-2 text-sm">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <Inp k="email" label="Email *" type="email" />
          <Inp k="phone" label="Téléphone" />
          <Inp k="sector" label="Secteur" />
          <div className="md:col-span-2"><Inp k="specialties" label="Spécialités" /></div>
          <label className="block md:col-span-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Notes</span>
            <textarea value={f.notes || ""} onChange={(e) => setF({ ...f, notes: e.target.value })} rows={3}
              className="mt-1 w-full bg-bone border border-hairline rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-foreground" />
          </label>
          <label className="flex items-center gap-2 md:col-span-2">
            <input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />
            <span className="text-sm">Contact actif</span>
          </label>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-hairline">Annuler</button>
          <button type="submit" disabled={busy} className="px-4 py-2 text-sm bg-foreground text-background disabled:opacity-50">
            {busy ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminReseau;