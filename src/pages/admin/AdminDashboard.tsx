import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout, Card, PrimaryButton, SecondaryButton, StatusBadge } from "./AdminLayout";
import { Inbox, ClipboardCheck, Send, CheckCircle2, ArrowRight, Upload, UserPlus } from "lucide-react";

type Req = {
  id: string;
  created_at: string;
  name: string;
  service_type: string;
  location: string | null;
  status: string;
};

const Metric = ({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: any;
  tone: string;
}) => (
  <Card className="p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
        <p className="font-display text-4xl mt-3 text-slate-900">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone}`}>
        <Icon size={18} strokeWidth={1.8} />
      </div>
    </div>
  </Card>
);

const AdminDashboard = () => {
  const [counts, setCounts] = useState({ nouvelle: 0, qualifier: 0, envoye: 0, cloture: 0 });
  const [recent, setRecent] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("property_requests")
        .select("id, created_at, name, service_type, location, status")
        .order("created_at", { ascending: false });
      const rows = (data as any) ?? [];
      setRecent(rows.slice(0, 6));
      setCounts({
        nouvelle: rows.filter((r: Req) => r.status === "Nouvelle").length,
        qualifier: rows.filter((r: Req) => r.status === "À qualifier").length,
        envoye: rows.filter((r: Req) => r.status === "Envoyé au réseau").length,
        cloture: rows.filter((r: Req) => r.status === "Clôturé").length,
      });
      setLoading(false);
    })();
  }, []);

  return (
    <AdminLayout title="Tableau de bord" subtitle="Vue d'ensemble de l'activité Neova">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Metric label="Nouvelles demandes" value={counts.nouvelle} icon={Inbox} tone="bg-blue-50 text-blue-600" />
        <Metric label="À qualifier" value={counts.qualifier} icon={ClipboardCheck} tone="bg-amber-50 text-amber-600" />
        <Metric label="Envoyées au réseau" value={counts.envoye} icon={Send} tone="bg-slate-100 text-slate-700" />
        <Metric label="Clôturées" value={counts.cloture} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-xl text-slate-900">Demandes récentes</h2>
              <p className="text-sm text-slate-500">Les 6 dernières demandes reçues</p>
            </div>
            <Link to="/admin/demandes" className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">
              Tout voir <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500 py-10 text-center">Chargement…</p>
          ) : recent.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-700 font-medium">Aucune demande pour le moment.</p>
              <p className="text-sm text-slate-500 mt-1">Les nouvelles demandes apparaîtront ici automatiquement.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((r) => (
                <Link
                  key={r.id}
                  to={`/admin/demandes?open=${r.id}`}
                  className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{r.name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {r.service_type} {r.location && `· ${r.location}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge s={r.status} />
                    <span className="text-xs text-slate-400">
                      {new Date(r.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-xl text-slate-900 mb-1">Actions rapides</h2>
          <p className="text-sm text-slate-500 mb-5">Accès direct aux tâches courantes</p>
          <div className="space-y-2">
            <Link to="/admin/demandes" className="block">
              <PrimaryButton className="w-full justify-center">
                <Inbox size={15} /> Voir les demandes
              </PrimaryButton>
            </Link>
            <Link to="/admin/reseau?import=1" className="block">
              <SecondaryButton className="w-full justify-center">
                <Upload size={15} /> Importer des contacts
              </SecondaryButton>
            </Link>
            <Link to="/admin/reseau?add=1" className="block">
              <SecondaryButton className="w-full justify-center">
                <UserPlus size={15} /> Ajouter un contact
              </SecondaryButton>
            </Link>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
