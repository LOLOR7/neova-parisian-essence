import { useEffect, useState } from "react";
import { AdminLayout, Card, PrimaryButton, SecondaryButton } from "./AdminLayout";
import { TEMPLATE_LABEL } from "@/lib/docusign";
import {
  CheckCircle2,
  AlertTriangle,
  Copy,
  KeyRound,
  FileSignature,
  ShieldCheck,
  Beaker,
  ExternalLink,
  Users,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ENV_VARS = [
  { name: "DOCUSIGN_INTEGRATION_KEY", desc: "Integration Key (Client ID) de votre application DocuSign" },
  { name: "DOCUSIGN_USER_ID", desc: "GUID de l'utilisateur signataire (impersonation)" },
  { name: "DOCUSIGN_ACCOUNT_ID", desc: "API Account ID (Settings → Apps and Keys)" },
  { name: "DOCUSIGN_BASE_URL", desc: "ex : https://demo.docusign.net (sandbox) ou https://www.docusign.net (prod)" },
  { name: "DOCUSIGN_PRIVATE_KEY", desc: "Clé privée RSA (JWT). Coller le PEM complet — uniquement côté serveur." },
  { name: "DOCUSIGN_TEMPLATE_CLIENT_REPRESENTATION", desc: "Template ID — Client Representation Agreement" },
  { name: "DOCUSIGN_TEMPLATE_AGENT_REFERRAL", desc: "Template ID — Agent Referral Agreement" },
  { name: "DOCUSIGN_TEMPLATE_VIEWING_CONFIRMATION", desc: "Template ID — Viewing Introduction Confirmation" },
  { name: "DOCUSIGN_WEBHOOK_SECRET", desc: "Secret HMAC pour vérifier DocuSign Connect" },
  { name: "DOCUSIGN_ADMIN_EMAIL", desc: "Email Neova ajouté en signataire interne (rôle « Neova »)" },
  { name: "DOCUSIGN_ADMIN_NAME", desc: "Nom affiché du signataire interne" },
];

const INTEGRATION_KEY = "f2e4714f-7cff-4d6c-aea4-d70c537a283c";
const CONSENT_URL =
  `https://account-d.docusign.com/oauth/auth?response_type=code` +
  `&scope=signature%20impersonation` +
  `&client_id=${INTEGRATION_KEY}` +
  `&redirect_uri=https://www.docusign.com`;

const WEBHOOK_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.functions.supabase.co/docusign-webhook`;

const AdminDocuSign = () => {
  const [pingResult, setPingResult] = useState<any>(null);
  const [pingLoading, setPingLoading] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [webhookResult, setWebhookResult] = useState<any>(null);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [tplIds, setTplIds] = useState({
    CLIENT_REPRESENTATION: "",
    AGENT_REFERRAL: "",
    VIEWING_CONFIRMATION: "",
  });

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success("Copié");
  };

  // Ping JWT auth on load to know configured state
  useEffect(() => {
    runPing(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runPing = async (silent = false) => {
    setPingLoading(true);
    const { data, error } = await supabase.functions.invoke("docusign-send-envelope", {
      body: { action: "ping" },
    });
    setPingLoading(false);
    if (error) {
      setPingResult({ ok: false, error: error.message });
      if (!silent) toast.error(error.message);
      return;
    }
    setPingResult(data);
    if (!silent) {
      if (data?.ok) toast.success("JWT OK");
      else toast.error(data?.message || data?.error || "Échec JWT");
    }
  };

  const runTestSend = async () => {
    setSendLoading(true);
    const { data: latest } = await supabase
      .from("property_requests")
      .select("id, name, demand_reference")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!latest) {
      setSendLoading(false);
      toast.error("Aucune demande à tester. Soumettez d'abord le formulaire.");
      return;
    }
    const { data, error } = await supabase.functions.invoke("docusign-send-envelope", {
      body: {
        action: "send",
        template_type: "CLIENT_REPRESENTATION",
        related_entity_type: "demand",
        related_entity_id: latest.id,
      },
    });
    setSendLoading(false);
    if (error) return setSendResult({ ok: false, error: error.message });
    setSendResult({ demand: latest.demand_reference, ...data });
  };

  const runWebhookTest = async () => {
    setWebhookLoading(true);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          envelopeId: "test-envelope-id-not-real",
          status: "test",
          test: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      setWebhookResult({ status: res.status, data });
    } catch (e: any) {
      setWebhookResult({ ok: false, error: e?.message });
    }
    setWebhookLoading(false);
  };

  const runPreview = async () => {
    setPreviewLoading(true);
    const { data, error } = await supabase.functions.invoke("docusign-send-envelope", {
      body: { action: "preview", template_type: "CLIENT_REPRESENTATION" },
    });
    setPreviewLoading(false);
    if (error) {
      setPreviewResult({ ok: false, error: error.message });
      toast.error(error.message);
      return;
    }
    setPreviewResult(data);
    if (!data?.ok) toast.error(data?.message || "Échec preview");
  };

  const runSync = async () => {
    setSyncLoading(true);
    const { data, error } = await supabase.functions.invoke("docusign-send-envelope", {
      body: { action: "sync" },
    });
    setSyncLoading(false);
    if (error) {
      setSyncResult({ ok: false, error: error.message });
      toast.error(error.message);
      return;
    }
    setSyncResult(data);
    if (data?.ok) {
      toast.success(
        data.updated
          ? `Statut synchronisé : ${data.updated}`
          : `Statut DocuSign : ${data.status}`
      );
    } else {
      toast.error(data?.message || data?.error || "Échec de la synchronisation");
    }
  };

  const ready = pingResult?.ok === true;
  const consentRequired = pingResult?.code === "consent_required";

  return (
    <AdminLayout
      title="Paramètres DocuSign"
      subtitle="Intégration sandbox — JWT Grant"
    >
      {/* Status */}
      <Card className="p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {ready ? (
              <CheckCircle2 size={22} className="text-emerald-600 mt-0.5" />
            ) : (
              <AlertTriangle size={22} className="text-amber-600 mt-0.5" />
            )}
            <div>
              <p className="font-display text-lg text-slate-900">
                Statut : {pingLoading ? "Vérification…" : ready ? "Configuré" : "Non configuré"}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                Mode <span className="font-medium">Sandbox</span> ·
                Base URL <code className="font-mono text-[12px]">https://demo.docusign.net</code>
              </p>
              {!ready && pingResult && (
                <p className="text-xs text-amber-700 mt-2 max-w-xl">
                  {pingResult.message || pingResult.error || "Impossible d'obtenir un token DocuSign."}
                </p>
              )}
              {Array.isArray(pingResult?.missing) && pingResult.missing.length > 0 && (
                <p className="text-xs text-amber-700 mt-1">
                  Variables manquantes : {pingResult.missing.join(", ")}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <SecondaryButton onClick={() => runPing()}>
              <ShieldCheck size={15} /> Tester l'authentification JWT
            </SecondaryButton>
            <a href={CONSENT_URL} target="_blank" rel="noreferrer">
              <PrimaryButton>
                <ExternalLink size={15} /> Autoriser l'intégration DocuSign
              </PrimaryButton>
            </a>
          </div>
        </div>
        {consentRequired && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 ring-1 ring-amber-200 text-sm text-amber-900">
            DocuSign demande votre consentement pour cette intégration.
            Cliquez sur <span className="font-medium">« Autoriser l'intégration DocuSign »</span> ci-dessus, connectez-vous avec
            le compte sandbox, puis revenez ici et cliquez sur <span className="font-medium">« Tester l'authentification JWT »</span>.
          </div>
        )}
      </Card>

      {/* Test panel */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Beaker size={18} className="text-slate-700" />
          <h2 className="font-display text-xl text-slate-900">Panneau de test</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Vérifications rapides pour valider l'intégration sandbox.
        </p>
        <div className="grid md:grid-cols-3 gap-3">
          <TestCard
            title="JWT auth"
            desc="Génère un token DocuSign via JWT grant."
            loading={pingLoading}
            result={pingResult}
            onRun={() => runPing()}
          />
          <TestCard
            title="Envoi accord client"
            desc="Envoie un Client Representation à la dernière demande reçue."
            loading={sendLoading}
            result={sendResult}
            onRun={runTestSend}
          />
          <TestCard
            title="Webhook DocuSign"
            desc="Ping de l'endpoint webhook (payload de test)."
            loading={webhookLoading}
            result={webhookResult}
            onRun={runWebhookTest}
          />
        </div>
      </Card>

      {/* Template & role specification */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Users size={18} className="text-slate-700" />
          <h2 className="font-display text-xl text-slate-900">
            Templates & rôles à créer dans DocuSign
          </h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Lors de la création des templates dans DocuSign, utilisez{" "}
          <span className="font-medium">exactement</span> les noms de templates et les{" "}
          <span className="font-medium">role names</span> ci-dessous. L'edge function envoie les
          enveloppes en se basant sur ces noms — toute différence (espace, majuscule, accent)
          empêchera DocuSign d'associer les signataires.
        </p>

        <div className="space-y-4">
          {[
            {
              name: "Neova - Client Representation Agreement",
              env: "DOCUSIGN_TEMPLATE_CLIENT_REPRESENTATION",
              roles: ["Client", "Neova Admin"],
            },
            {
              name: "Neova - Agent Referral Agreement",
              env: "DOCUSIGN_TEMPLATE_AGENT_REFERRAL",
              roles: ["Agent", "Neova Admin"],
            },
            {
              name: "Neova - Viewing Introduction Confirmation",
              env: "DOCUSIGN_TEMPLATE_VIEWING_CONFIRMATION",
              roles: ["Client", "Agent", "Neova Admin"],
            },
          ].map((tpl) => (
            <div
              key={tpl.name}
              className="p-4 rounded-xl bg-slate-50 ring-1 ring-slate-100"
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Template name (à recopier tel quel)
                  </p>
                  <code className="text-sm font-mono text-slate-900 break-all">
                    {tpl.name}
                  </code>
                </div>
                <button
                  onClick={() => copy(tpl.name)}
                  className="text-slate-400 hover:text-slate-700"
                  title="Copier le nom"
                >
                  <Copy size={14} />
                </button>
              </div>
              <div className="mt-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1.5">
                  Role names (ordre exact)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {tpl.roles.map((r, i) => (
                    <span
                      key={r}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white ring-1 ring-slate-200 text-xs"
                    >
                      <span className="text-slate-400 font-mono">{i + 1}.</span>
                      <code className="font-mono text-slate-900">{r}</code>
                      <button
                        onClick={() => copy(r)}
                        className="text-slate-300 hover:text-slate-700"
                        title="Copier le rôle"
                      >
                        <Copy size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-3">
                Template ID à coller dans le secret :{" "}
                <code className="font-mono">{tpl.env}</code>
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-amber-50 ring-1 ring-amber-200 text-xs text-amber-900">
          ⚠️ Le rôle interne Neova s'appelle{" "}
          <code className="font-mono">Neova Admin</code> (et non{" "}
          <code className="font-mono">Neova</code>). Vérifiez l'orthographe exacte dans
          DocuSign.
        </div>
      </Card>

      {/* Debug preview — Client Representation */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-slate-700" />
            <h2 className="font-display text-xl text-slate-900">
              Aperçu enveloppe — Client Representation
            </h2>
          </div>
          <SecondaryButton onClick={runPreview} className="!py-2 !px-3 text-xs">
            {previewLoading ? "En cours…" : "Générer l'aperçu (dernière demande)"}
          </SecondaryButton>
        </div>
        <p className="text-sm text-slate-500 mb-3">
          Affiche le payload qui serait envoyé à DocuSign pour la dernière demande reçue.
          Aucun secret, token ou clé privée n'est exposé — uniquement les rôles et les valeurs
          des champs publics du formulaire.
        </p>
        {previewResult?.ok && previewResult.preview ? (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100 text-xs">
              <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Template ID</p>
              <code className="font-mono text-slate-900 break-all">
                {previewResult.preview.templateId || "—"}
              </code>
              <p className="text-[11px] uppercase tracking-wide text-slate-500 mt-3 mb-1">
                Email subject
              </p>
              <code className="font-mono text-slate-900 break-all">
                {previewResult.preview.emailSubject}
              </code>
            </div>
            {previewResult.preview.templateRoles?.map((tr: any) => (
              <div key={tr.roleName} className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[11px] font-mono">
                    {tr.roleName}
                  </span>
                  <span className="text-sm text-slate-900">{tr.name || "—"}</span>
                  <span className="text-xs text-slate-500">&lt;{tr.email || "—"}&gt;</span>
                </div>
                {tr.textTabs?.length > 0 && (
                  <table className="mt-2 w-full text-[12px]">
                    <tbody>
                      {tr.textTabs.map((t: any) => (
                        <tr key={t.tabLabel} className="border-t border-slate-200">
                          <td className="py-1 pr-3 font-mono text-slate-600 align-top whitespace-nowrap">
                            {t.tabLabel}
                          </td>
                          <td className="py-1 text-slate-900 break-all">
                            {t.value || <span className="text-slate-400">∅</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        ) : previewResult ? (
          <pre className="p-2.5 rounded-lg text-[11px] font-mono whitespace-pre-wrap break-all bg-rose-50 text-rose-900 ring-1 ring-rose-100">
            {JSON.stringify(previewResult, null, 2)}
          </pre>
        ) : (
          <p className="text-xs text-slate-500">
            Cliquez sur « Générer l'aperçu » pour visualiser les rôles et tabs envoyés.
          </p>
        )}
      </Card>

      {/* Manual sync */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-slate-700" />
            <h2 className="font-display text-xl text-slate-900">
              Synchronisation manuelle DocuSign
            </h2>
          </div>
          <SecondaryButton onClick={runSync} className="!py-2 !px-3 text-xs">
            {syncLoading ? "Synchronisation…" : "Sync latest DocuSign envelope status"}
          </SecondaryButton>
        </div>
        <p className="text-sm text-slate-500 mb-3">
          Récupère le statut réel de la dernière enveloppe envoyée depuis DocuSign et applique
          la même logique que le webhook (mise à jour de la demande / option / visite liée).
          Utile si le webhook DocuSign Connect n'a pas été reçu.
        </p>
        {syncResult && (
          <pre
            className={`p-2.5 rounded-lg text-[11px] font-mono whitespace-pre-wrap break-all max-h-60 overflow-auto ${
              syncResult?.ok
                ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100"
                : "bg-rose-50 text-rose-900 ring-1 ring-rose-100"
            }`}
          >
            {JSON.stringify(syncResult, null, 2)}
          </pre>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Env vars */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound size={18} className="text-slate-700" />
            <h2 className="font-display text-xl text-slate-900">Variables d'environnement</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Stockées côté serveur uniquement (Lovable Cloud → Secrets). Aucun secret n'apparaît
            jamais dans le frontend.
          </p>
          <ul className="space-y-2.5">
            {ENV_VARS.map((e) => (
              <li key={e.name} className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-[12px] font-mono text-slate-800 break-all">{e.name}</code>
                  <button
                    onClick={() => copy(e.name)}
                    className="text-slate-400 hover:text-slate-700"
                    title="Copier"
                  >
                    <Copy size={13} />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{e.desc}</p>
              </li>
            ))}
          </ul>
        </Card>

        {/* Templates */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <FileSignature size={18} className="text-slate-700" />
            <h2 className="font-display text-xl text-slate-900">Templates DocuSign</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Créez ces 3 templates dans DocuSign puis collez leurs Template IDs dans les secrets
            correspondants.
          </p>
          <div className="space-y-4">
            {(Object.keys(TEMPLATE_LABEL) as Array<keyof typeof TEMPLATE_LABEL>).map((k) => (
              <div key={k}>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  {TEMPLATE_LABEL[k]}
                </label>
                <input
                  value={(tplIds as any)[k]}
                  onChange={(e) => setTplIds({ ...tplIds, [k]: e.target.value })}
                  placeholder="ex : 12345678-aaaa-bbbb-cccc-1234567890ab"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-slate-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Secret correspondant :{" "}
                  <code className="font-mono">DOCUSIGN_TEMPLATE_{k}</code>
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Webhook */}
      <Card className="p-6 mt-6">
        <h2 className="font-display text-xl text-slate-900 mb-1">Webhook DocuSign Connect</h2>
        <p className="text-sm text-slate-500 mb-3">
          Configurez DocuSign Connect (Settings → Connect) pour pointer vers cette URL.
        </p>
        <div className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100 flex items-center justify-between gap-3">
          <code className="text-[12px] font-mono text-slate-800 break-all">{WEBHOOK_URL}</code>
          <button
            onClick={() => copy(WEBHOOK_URL)}
            className="text-slate-400 hover:text-slate-700"
          >
            <Copy size={14} />
          </button>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          Activez la signature HMAC et utilisez le secret stocké dans{" "}
          <code className="font-mono">DOCUSIGN_WEBHOOK_SECRET</code>.
        </p>
      </Card>
    </AdminLayout>
  );
};

const TestCard = ({
  title,
  desc,
  loading,
  result,
  onRun,
}: {
  title: string;
  desc: string;
  loading: boolean;
  result: any;
  onRun: () => void;
}) => {
  const ok = result?.ok === true || (result?.status && result.status < 400);
  return (
    <div className="p-4 rounded-xl bg-slate-50 ring-1 ring-slate-100 flex flex-col">
      <p className="font-medium text-slate-900 text-sm">{title}</p>
      <p className="text-xs text-slate-500 mt-1 mb-3">{desc}</p>
      <SecondaryButton onClick={onRun} className="!py-2 !px-3 text-xs self-start">
        {loading ? "En cours…" : "Lancer"}
      </SecondaryButton>
      {result && (
        <pre
          className={`mt-3 p-2.5 rounded-lg text-[11px] font-mono whitespace-pre-wrap break-all max-h-40 overflow-auto ${
            ok
              ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100"
              : "bg-rose-50 text-rose-900 ring-1 ring-rose-100"
          }`}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default AdminDocuSign;