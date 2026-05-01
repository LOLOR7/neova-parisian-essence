import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "./AdminLayout";

type Send = {
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
  const [items, setItems] = useState<Send[]>([]);
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
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl">Envois</h1>
        <p className="text-sm text-slate-soft mt-1">Historique des emails envoyés au réseau</p>
      </div>

      <div className="bg-background border border-hairline rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bone border-b border-hairline">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Demande</th>
              <th className="px-4 py-3">Destinataire</th>
              <th className="px-4 py-3">Sujet</th>
              <th className="px-4 py-3">Coordonnées</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Chargement…</td></tr>
            : items.length === 0 ? <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Aucun envoi pour le moment.</td></tr>
            : items.map(s => (
              <tr key={s.id} className="border-b border-hairline last:border-0 hover:bg-bone/50">
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{new Date(s.created_at).toLocaleString("fr-FR")}</td>
                <td className="px-4 py-3">{s.property_requests?.name || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.recipient_email}</td>
                <td className="px-4 py-3">{s.email_subject}</td>
                <td className="px-4 py-3 text-xs">{s.include_client_details ? "Incluses" : "Masquées"}</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">{s.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setOpenId(s.id)} className="text-xs uppercase tracking-[0.15em] underline underline-offset-4">Voir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" onClick={() => setOpenId(null)}>
          <div className="bg-background max-w-2xl w-full p-8 rounded-sm border border-hairline max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <p className="eyebrow mb-2">Email envoyé</p>
            <h2 className="font-display text-xl mb-1">{open.email_subject}</h2>
            <p className="text-sm text-muted-foreground mb-6">À : {open.recipient_email}</p>
            <pre className="whitespace-pre-wrap text-sm bg-bone p-5 rounded-sm border border-hairline font-sans leading-relaxed">{open.email_body}</pre>
            <button onClick={() => setOpenId(null)} className="mt-6 px-4 py-2 text-sm border border-hairline">Fermer</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminEnvois;