import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout, Card, SecondaryButton } from "./AdminLayout";
import {
  FileSignature,
  FileText,
  Search,
  Settings,
  Inbox,
  Send,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

type Request = {
  id: string;
  demand_reference: string | null;
  name: string;
  email: string;
  location: string | null;
  budget: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
};

type Agreement = {
  id: string;
  request_id: string;
  status: string | null;
  generated_pdf_path: string | null;
  created_at: string;
};

type EmailLog = {
  demand_id: string | null;
  status: string | null;
  created_at: string;
};

type ActivityRow = {
  request_id: string;
  created_at: string;
};

type FilterKey = "all" | "to_prepare" | "ready" | "to_send" | "sent" | "closed";

const FILTER_LABEL: Record<FilterKey, string> = {
  all: "Toutes",
  to_prepare: "À préparer",
  ready: "Accord prêt",
  to_send: "À envoyer",
  sent: "Envoyé",
  closed: "Signé / clôturé",
};

const CLOSED_STATUSES = new Set([
  "COMPLETED",
  "CANCELLED",
  "ARCHIVED",
  "SIGNED",
  "Clôturée",
  "Clôturé",
  "Terminée",
]);

const relTime = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const m = Math.round(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.round(h / 24);
  if (j < 30) return `il y a ${j} j`;
  return new Date(iso).toLocaleDateString("fr-FR");
};

const AdminWorkflow = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    const [rq, ag, el, ac] = await Promise.all([
      supabase
        .from("property_requests")
        .select("id, demand_reference, name, email, location, budget, status, created_at, updated_at")
        .order("created_at", { ascending: false }),
      supabase.from("prepared_agreements").select("id, request_id, status, generated_pdf_path, created_at"),
      supabase.from("email_audit_log").select("demand_id, status, created_at"),
      supabase.from("request_activity_log" as any).select("request_id, created_at"),
    ]);
    setRequests((rq.data as Request[]) ?? []);
    setAgreements((ag.data as Agreement[]) ?? []);
    setEmails((el.data as EmailLog[]) ?? []);
    setActivity((ac.data as ActivityRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  /* Index by request */
  const agByReq = useMemo(() => {
    const m = new Map<string, Agreement[]>();
    for (const a of agreements) {
      if (!a.request_id) continue;
      const arr = m.get(a.request_id) ?? [];
      arr.push(a);
      m.set(a.request_id, arr);
    }
    return m;
  }, [agreements]);

  const emailByReq = useMemo(() => {
    const m = new Map<string, EmailLog[]>();
    for (const e of emails) {
      if (!e.demand_id) continue;
      const arr = m.get(e.demand_id) ?? [];
      arr.push(e);
      m.set(e.demand_id, arr);
    }
    return m;
  }, [emails]);

  const lastActivityByReq = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of activity) {
      if (!a.request_id) continue;
      const cur = m.get(a.request_id);
      if (!cur || cur < a.created_at) m.set(a.request_id, a.created_at);
    }
    return m;
  }, [activity]);

  const computeStage = (r: Request): FilterKey => {
    if (r.status && CLOSED_STATUSES.has(r.status)) return "closed";
    const ags = agByReq.get(r.id) ?? [];
    const sent = (emailByReq.get(r.id) ?? []).length > 0;
    if (sent) return "sent";
    if (ags.length === 0) return "to_prepare";
    if (ags.some((a) => a.generated_pdf_path)) return "to_send";
    return "ready";
  };

  const enriched = useMemo(
    () =>
      requests.map((r) => {
        const ags = agByReq.get(r.id) ?? [];
        const last =
          lastActivityByReq.get(r.id) ??
          r.updated_at ??
          r.created_at;
        return {
          r,
          stage: computeStage(r),
          agreementCount: ags.length,
          lastActivity: last,
        };
      }),
    [requests, agByReq, emailByReq, lastActivityByReq]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched
      .filter((e) => (filter === "all" ? true : e.stage === filter))
      .filter((e) => {
        if (!q) return true;
        return (
          e.r.name?.toLowerCase().includes(q) ||
          e.r.email?.toLowerCase().includes(q) ||
          (e.r.demand_reference ?? "").toLowerCase().includes(q) ||
          (e.r.location ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.lastActivity < b.lastActivity ? 1 : -1));
  }, [enriched, filter, query]);

  /* KPIs */
  const kpis = useMemo(() => {
    const activeRequests = requests.filter((r) => !(r.status && CLOSED_STATUSES.has(r.status))).length;
    const prepared = agreements.length;
    const toSend = enriched.filter((e) => e.stage === "to_send" || e.stage === "ready").length;
    const sent = emails.length;
    return { activeRequests, prepared, toSend, sent };
  }, [requests, agreements, emails, enriched]);

  const stageCounts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: enriched.length,
      to_prepare: 0,
      ready: 0,
      to_send: 0,
      sent: 0,
      closed: 0,
    };
    for (const e of enriched) c[e.stage]++;
    return c;
  }, [enriched]);

  return (
    <AdminLayout
      title="Workflow accords"
      subtitle="Préparez, envoyez et suivez les accords liés aux demandes clients."
      actions={
        <div className="flex items-center gap-2">
          <Link to="/admin/accords">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors">
              <FileSignature size={15} /> Préparer un accord
            </button>
          </Link>
          <Link to="/admin/accords">
            <SecondaryButton>
              <FileText size={15} /> Voir les templates
            </SecondaryButton>
          </Link>
          <Link
            to="/admin/settings/docusign"
            className="text-xs text-slate-400 hover:text-slate-700 inline-flex items-center gap-1 px-2 py-1"
            title="Paramètres DocuSign"
          >
            <Settings size={12} /> DocuSign
          </Link>
        </div>
      }
    >
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Kpi icon={<Inbox size={16} />} label="Demandes actives" value={kpis.activeRequests} />
        <Kpi icon={<FileSignature size={16} />} label="Accords préparés" value={kpis.prepared} />
        <Kpi icon={<Clock size={16} />} label="Accords à envoyer" value={kpis.toSend} />
        <Kpi icon={<Send size={16} />} label="Emails envoyés" value={kpis.sent} />
      </div>

      {/* Filters + search */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        <div className="flex gap-2 overflow-x-auto">
          {(Object.keys(FILTER_LABEL) as FilterKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === k
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-slate-900"
              }`}
            >
              {FILTER_LABEL[k]}{" "}
              <span className={`ml-1 ${filter === k ? "text-slate-300" : "text-slate-400"}`}>
                {stageCounts[k]}
              </span>
            </button>
          ))}
        </div>
        <div className="md:ml-auto relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher (nom, email, référence…)"
            className="pl-9 pr-3 py-2 text-sm rounded-xl ring-1 ring-slate-200 bg-white w-full md:w-80 focus:outline-none focus:ring-slate-400"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-sm text-slate-500 py-10 text-center">Chargement…</p>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-slate-700 font-medium">Aucune demande dans cette catégorie</p>
          <p className="text-sm text-slate-500 mt-1">
            Ajustez le filtre ou préparez un nouvel accord pour démarrer.
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((e) => (
            <RequestRow
              key={e.r.id}
              r={e.r}
              stage={e.stage}
              agreementCount={e.agreementCount}
              lastActivity={e.lastActivity}
            />
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

const Kpi = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) => (
  <Card className="p-4">
    <div className="flex items-center gap-2 text-slate-500 text-xs">
      {icon}
      <span>{label}</span>
    </div>
    <p className="mt-1.5 text-2xl font-semibold text-slate-900 tracking-tight">{value}</p>
  </Card>
);

const STAGE_BADGE: Record<FilterKey, { label: string; cls: string }> = {
  all: { label: "—", cls: "" },
  to_prepare: { label: "À préparer", cls: "bg-slate-100 text-slate-700" },
  ready: { label: "Accord prêt", cls: "bg-amber-50 text-amber-800 ring-1 ring-amber-200" },
  to_send: { label: "À envoyer", cls: "bg-blue-50 text-blue-800 ring-1 ring-blue-200" },
  sent: { label: "Envoyé", cls: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200" },
  closed: { label: "Clôturée", cls: "bg-slate-200 text-slate-700" },
};

const RequestRow = ({
  r,
  stage,
  agreementCount,
  lastActivity,
}: {
  r: Request;
  stage: FilterKey;
  agreementCount: number;
  lastActivity: string;
}) => {
  const badge = STAGE_BADGE[stage];
  return (
    <Card className="p-4 hover:ring-slate-300 transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-mono">{r.demand_reference ?? "—"}</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${badge.cls}`}>
              {badge.label}
            </span>
            {r.status && stage !== "closed" && (
              <span className="text-slate-400">· {r.status}</span>
            )}
          </div>
          <p className="mt-1 font-semibold text-slate-900 truncate">{r.name}</p>
          <p className="text-sm text-slate-500 truncate">
            {r.email}
            {r.location ? <span className="text-slate-400"> · {r.location}</span> : null}
            {r.budget ? <span className="text-slate-400"> · {r.budget}</span> : null}
          </p>
        </div>

        <div className="hidden md:block text-right text-xs text-slate-500 min-w-[160px]">
          <p>
            {agreementCount} accord{agreementCount > 1 ? "s" : ""} préparé
            {agreementCount > 1 ? "s" : ""}
          </p>
          <p className="mt-0.5 text-slate-400">Dernière activité {relTime(lastActivity)}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to={`/admin/accords?requestId=${r.id}`}>
            <SecondaryButton className="!py-2 !px-3 text-xs">
              <FileSignature size={13} /> Préparer un accord
            </SecondaryButton>
          </Link>
          <Link to={`/admin/demandes/${r.id}`}>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 text-white hover:bg-slate-800">
              Ouvrir la demande <ArrowRight size={13} />
            </button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default AdminWorkflow;
