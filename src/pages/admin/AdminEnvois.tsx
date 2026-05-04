import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout, Card, SecondaryButton } from "./AdminLayout";
import { Send, Mail, X } from "lucide-react";

type AuditItem = {
  id: string;
  created_at: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string | null;
  status: string;
  email_type: string;
  is_test: boolean;
  demand_id: string | null;
  error_message: string | null;
  property_requests?: { name: string; service_type: string; location: string | null; demand_reference: string | null } | null;
};

type Tab = "all" | "tests" | "network" | "failed";

const AdminEnvois = () => {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("email_audit_log")
        .select("*, property_requests:demand_id(name, service_type, location, demand_reference)")
        .order("created_at", { ascending: false });
      setItems((data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (tab === "tests") return items.filter(i => i.is_test);
    if (tab === "network") return items.filter(i => i.email_type === "network_outreach");
    if (tab === "failed") return items.filter(i => i.status === "failed");
    return items;
  }, [items, tab]);

  const open = items.find(i => i.id === openId);

  const counts = useMemo(() => ({
    all: items.length,
    tests: items.filter(i => i.is_test).length,
    network: items.filter(i => i.email_type === "network_outreach").length,
    failed: items.filter(i => i.status === "failed").length,
  }), [items]);

  const TABS: { key: Tab; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "tests", label: "Tests" },
    { key: "network", label: "Réseau" },
    { key: "failed", label: "Échecs" },
  ];

  return (
    <AdminLayout title="Envois" subtitle="Historique des emails envoyés à votre réseau.">
      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ring-1 ${
              tab === t.key
                ? "bg-slate-900 text-white ring-slate-900"
                : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {t.label} <span className="opacity-60 ml-1">{counts[t.key]}</span>
          </button>
        ))}
      </div>
      {loading ? (
        <Card className="p-12 text-center text-slate-500">Chargement…</Card>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
            <Send size={22} />
          </div>
          <h3 className="font-display text-2xl mt-5 text-slate-900">Aucun envoi pour le moment.</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Les envois aux contacts du réseau apparaîtront ici dès la première campagne.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => setOpenId(s.id)}
                className="w-full text-left grid grid-cols-1 md:grid-cols-12 gap-3 px-5 py-4 hover:bg-slate-50/70 transition-colors items-center"
              >
                <div className="md:col-span-3 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <Mail size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {s.property_requests?.name || s.recipient_name || "—"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {s.property_requests?.demand_reference || s.email_type}
                    </p>
                  </div>
                </div>
                <div className="md:col-span-3 text-sm text-slate-700 truncate flex items-center gap-2">
                  {s.is_test && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 ring-1 ring-amber-200 shrink-0">TEST</span>
                  )}
                  {s.email_type === "network_outreach" && !s.is_test && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 shrink-0">Réseau</span>
                  )}
                  <span className="truncate">{s.recipient_email}</span>
                </div>
                <div className="md:col-span-3 text-sm text-slate-600 truncate">{s.subject || "—"}</div>
                <div className="md:col-span-2 text-xs text-slate-500">
                  {new Date(s.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                </div>
                <div className="md:col-span-1 flex md:justify-end">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ring-1 ${
                    s.status === "failed"
                      ? "bg-rose-50 text-rose-700 ring-rose-100"
                      : s.status === "skipped"
                      ? "bg-slate-100 text-slate-600 ring-slate-200"
                      : "bg-emerald-50 text-emerald-700 ring-emerald-100"
                  }`}>{s.status}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => setOpenId(null)}>
          <div className="bg-white max-w-2xl w-full p-8 rounded-2xl border border-slate-200 max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Email envoyé</p>
                <h2 className="font-display text-xl mt-1 text-slate-900">{open.subject || "—"}</h2>
                <p className="text-sm text-slate-500 mt-1">À : {open.recipient_email}</p>
                {open.error_message && (
                  <p className="text-sm text-rose-600 mt-2">Erreur : {open.error_message}</p>
                )}
              </div>
              <button onClick={() => setOpenId(null)} className="p-2 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="text-sm bg-slate-50 p-5 rounded-xl border border-slate-100 leading-relaxed text-slate-700 space-y-1">
              <div><span className="text-slate-500">Type :</span> {open.email_type}</div>
              <div><span className="text-slate-500">Statut :</span> {open.status}</div>
              <div><span className="text-slate-500">Date :</span> {new Date(open.created_at).toLocaleString("fr-FR")}</div>
              {open.recipient_name && <div><span className="text-slate-500">Destinataire :</span> {open.recipient_name}</div>}
              {open.is_test && <div className="text-amber-700">Email de test (n'a pas modifié le statut de la demande).</div>}
            </div>
            <div className="flex justify-end mt-6">
              <SecondaryButton onClick={() => setOpenId(null)}>Fermer</SecondaryButton>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminEnvois;
