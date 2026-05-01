import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout, Card, PrimaryButton, SecondaryButton, SearchInput } from "./AdminLayout";
import { toast } from "sonner";
import { Plus, Upload, X, Pencil, Mail, Phone, Building2, Users } from "lucide-react";

const ROLES = ["Agent immobilier", "Architecte", "Entreprise", "Artisan", "Autre"];

const ROLE_FILTERS: { label: string; value: string }[] = [
  { label: "Tous", value: "" },
  { label: "Agents immobiliers", value: "Agent immobilier" },
  { label: "Architectes", value: "Architecte" },
  { label: "Entreprises", value: "Entreprise" },
  { label: "Artisans", value: "Artisan" },
  { label: "Autres", value: "Autre" },
];

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

const ROLE_TONE: Record<string, string> = {
  "Agent immobilier": "bg-blue-50 text-blue-700",
  "Architecte": "bg-violet-50 text-violet-700",
  "Entreprise": "bg-amber-50 text-amber-700",
  "Artisan": "bg-emerald-50 text-emerald-700",
  "Autre": "bg-slate-100 text-slate-600",
};

const AdminReseau = () => {
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editing, setEditing] = useState<Contact | null>(null);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState<{ rows: any[]; duplicates: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [params, setParams] = useSearchParams();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("network_contacts").select("*").order("created_at", { ascending: false });
    setItems((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // Honor ?add=1 / ?import=1 from dashboard quick actions
  useEffect(() => {
    if (params.get("add") === "1") {
      setAdding(true);
      const p = new URLSearchParams(params); p.delete("add"); setParams(p, { replace: true });
    }
    if (params.get("import") === "1") {
      fileRef.current?.click();
      const p = new URLSearchParams(params); p.delete("import"); setParams(p, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => items.filter(c => {
    if (roleFilter && c.role !== roleFilter) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return [c.name, c.company, c.email, c.specialties, c.sector].filter(Boolean).join(" ").toLowerCase().includes(s);
  }), [items, q, roleFilter]);

  const toggleActive = async (c: Contact) => {
    await supabase.from("network_contacts").update({ active: !c.active }).eq("id", c.id);
    load();
  };

  /* ---- CSV parsing ---- */
  const parseCSV = (text: string): any[] => {
    const lines = text.replace(/\r/g, "").split("\n").filter(l => l.trim());
    if (lines.length < 2) return [];
    const splitLine = (l: string) => {
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
    <AdminLayout
      title="Réseau"
      subtitle="Agents, architectes, entreprises et partenaires de confiance."
      actions={
        <>
          <input ref={fileRef} type="file" accept=".csv" hidden
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <SecondaryButton onClick={() => fileRef.current?.click()}>
            <Upload size={15} /> Importer CSV
          </SecondaryButton>
          <PrimaryButton onClick={() => setAdding(true)}>
            <Plus size={15} /> Ajouter un contact
          </PrimaryButton>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {ROLE_FILTERS.map((f) => {
          const active = roleFilter === f.value;
          const count = f.value === "" ? items.length : items.filter((i) => i.role === f.value).length;
          return (
            <button
              key={f.label}
              onClick={() => setRoleFilter(f.value)}
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
        <div className="ml-auto"><SearchInput value={q} onChange={setQ} /></div>
      </div>

      {loading ? (
        <Card className="p-12 text-center text-slate-500">Chargement…</Card>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
            <Users size={22} />
          </div>
          <h3 className="font-display text-2xl mt-5 text-slate-900">Aucun contact dans le réseau.</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Ajoutez vos premiers partenaires manuellement ou importez un fichier CSV.
          </p>
          <div className="flex justify-center gap-2 mt-5">
            <SecondaryButton onClick={() => fileRef.current?.click()}><Upload size={14} /> Importer CSV</SecondaryButton>
            <PrimaryButton onClick={() => setAdding(true)}><Plus size={14} /> Ajouter un contact</PrimaryButton>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Card key={c.id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-medium shrink-0">
                    {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{c.name}</p>
                    {c.company && (
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <Building2 size={11} /> {c.company}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(c)}
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${c.active ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-slate-100 text-slate-500"}`}
                >
                  {c.active ? "Actif" : "Inactif"}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${ROLE_TONE[c.role] || "bg-slate-100 text-slate-600"}`}>{c.role}</span>
                {c.sector && <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-600">{c.sector}</span>}
              </div>

              <div className="mt-4 space-y-1.5 text-sm">
                <p className="flex items-center gap-2 text-slate-600 truncate"><Mail size={13} className="shrink-0" /> <span className="truncate">{c.email}</span></p>
                {c.phone && <p className="flex items-center gap-2 text-slate-600"><Phone size={13} /> {c.phone}</p>}
              </div>

              {c.specialties && (
                <p className="mt-3 text-xs text-slate-500 line-clamp-2">{c.specialties}</p>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setEditing(c)}
                  className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
                >
                  <Pencil size={13} /> Modifier
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(adding || editing) && (
        <ContactForm
          initial={editing || (empty as any)}
          onClose={() => { setAdding(false); setEditing(null); }}
          onSaved={() => { setAdding(false); setEditing(null); load(); }}
        />
      )}

      {importing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
          <div className="bg-white max-w-2xl w-full rounded-2xl border border-slate-200 p-8 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-slate-900">Aperçu de l'import</h2>
              <button onClick={() => setImporting(null)} className="p-2 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              {importing.rows.length} contact(s) à importer · {importing.duplicates} doublon(s) ignoré(s)
            </p>
            {importing.rows.length > 0 && (
              <div className="border border-slate-200 rounded-xl max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr><th className="px-3 py-2 text-left">Nom</th><th className="px-3 py-2 text-left">Email</th><th className="px-3 py-2 text-left">Rôle</th></tr>
                  </thead>
                  <tbody>
                    {importing.rows.map((r, i) => (
                      <tr key={i} className="border-t border-slate-100"><td className="px-3 py-2">{r.name}</td><td className="px-3 py-2 text-slate-500">{r.email}</td><td className="px-3 py-2">{r.role}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex gap-3 mt-6 justify-end">
              <SecondaryButton onClick={() => setImporting(null)}>Annuler</SecondaryButton>
              <PrimaryButton onClick={confirmImport} disabled={importing.rows.length === 0}>Confirmer l'import</PrimaryButton>
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

  const inpCls = "mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-slate-500";
  const lblCls = "text-xs uppercase tracking-wider text-slate-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
      <form onSubmit={save} className="bg-white max-w-2xl w-full rounded-2xl border border-slate-200 p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-slate-900">{isEdit ? "Modifier le contact" : "Nouveau contact"}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block"><span className={lblCls}>Nom *</span>
            <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inpCls} /></label>
          <label className="block"><span className={lblCls}>Société</span>
            <input value={f.company || ""} onChange={(e) => setF({ ...f, company: e.target.value })} className={inpCls} /></label>
          <label className="block">
            <span className={lblCls}>Rôle</span>
            <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}
              className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className="block"><span className={lblCls}>Email *</span>
            <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={inpCls} /></label>
          <label className="block"><span className={lblCls}>Téléphone</span>
            <input value={f.phone || ""} onChange={(e) => setF({ ...f, phone: e.target.value })} className={inpCls} /></label>
          <label className="block"><span className={lblCls}>Secteur</span>
            <input value={f.sector || ""} onChange={(e) => setF({ ...f, sector: e.target.value })} className={inpCls} /></label>
          <label className="block md:col-span-2"><span className={lblCls}>Spécialités</span>
            <input value={f.specialties || ""} onChange={(e) => setF({ ...f, specialties: e.target.value })} className={inpCls} /></label>
          <label className="block md:col-span-2">
            <span className={lblCls}>Notes</span>
            <textarea value={f.notes || ""} onChange={(e) => setF({ ...f, notes: e.target.value })} rows={3}
              className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-slate-500" />
          </label>
          <label className="flex items-center gap-2 md:col-span-2">
            <input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} className="rounded" />
            <span className="text-sm text-slate-700">Contact actif</span>
          </label>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <SecondaryButton type="button" onClick={onClose}>Annuler</SecondaryButton>
          <PrimaryButton type="submit" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</PrimaryButton>
        </div>
      </form>
    </div>
  );
};

export default AdminReseau;
