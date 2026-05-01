import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout, Card, SecondaryButton } from "./AdminLayout";
import { Send, Mail, X } from "lucide-react";

type SendItem = {
  id: string;
  created_at: string;
  recipient_email: string;
  email_subject: string;
  email_body: string;
  status: string;
  include_client_details: boolean;
  property_request_id: string;
  property_requests?: { name: string; service_type: string; location: string | null } | null;
};

const AdminEnvois = () => {
  const [items, setItems] = useState<SendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("request_sends")
        .select("*, property_requests(name, service_type, location)")
        .order("created_at", { ascending: false });
      setItems((data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  const open = items.find(i => i.id === openId);

  return (
    <AdminLayout title="Envois" subtitle="Historique des emails envoyés à votre réseau.">
      {loading ? (
        <Card className="p-12 text-center text-slate-500">Chargement…</Card>
      ) : items.length === 0 ? (
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
            {items.map((s) => (
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
                    <p className="font-medium text-slate-900 truncate">{s.property_requests?.name || "—"}</p>
                    <p className="text-xs text-slate-500 truncate">{s.property_requests?.service_type}</p>
                  </div>
                </div>
                <div className="md:col-span-3 text-sm text-slate-700 truncate">{s.recipient_email}</div>
                <div className="md:col-span-3 text-sm text-slate-600 truncate">{s.email_subject}</div>
                <div className="md:col-span-2 text-xs text-slate-500">
                  {new Date(s.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                </div>
                <div className="md:col-span-1 flex md:justify-end">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">{s.status}</span>
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
                <h2 className="font-display text-xl mt-1 text-slate-900">{open.email_subject}</h2>
                <p className="text-sm text-slate-500 mt-1">À : {open.recipient_email}</p>
              </div>
              <button onClick={() => setOpenId(null)} className="p-2 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <pre className="whitespace-pre-wrap text-sm bg-slate-50 p-5 rounded-xl border border-slate-100 font-sans leading-relaxed text-slate-800">{open.email_body}</pre>
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
