import { useEffect, useState } from "react";
import { AdminLayout, Card, PrimaryButton, SecondaryButton } from "./AdminLayout";
import { TEMPLATE_LABEL, isManualDocuSign, MANUAL_MODE_BANNER } from "@/lib/docusign";
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
  XCircle,
  ServerCog,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ENV_VARS = [
  { name: "DOCUSIGN_INTEGRATION_KEY", desc: "Integration Key (Client ID) — créée UNE SEULE FOIS dans le compte développeur DocuSign. Ne jamais recréer en production." },
  { name: "DOCUSIGN_PRIVATE_KEY", desc: "Clé privée RSA (JWT) attachée à l'Integration Key développeur. Coller le PEM complet — côté serveur uniquement." },
  { name: "DOCUSIGN_USER_ID", desc: "GUID de l'utilisateur à impersonner. En prod = User ID du compte client production." },
  { name: "DOCUSIGN_ACCOUNT_ID", desc: "API Account ID du compte cible. En prod = API Account ID du compte client production." },
  { name: "DOCUSIGN_BASE_URL", desc: "Account Base URI du compte cible. Sandbox : https://demo.docusign.net — Production EU : https://eu.docusign.net (ou base URI fournie par DocuSign pour le compte client)." },
  { name: "DOCUSIGN_TEMPLATE_CLIENT_REPRESENTATION", desc: "Template ID — Client Representation Agreement (créé dans le compte client en prod)" },
  { name: "DOCUSIGN_TEMPLATE_AGENT_REFERRAL", desc: "Template ID — Agent Referral Agreement (créé dans le compte client en prod)" },
  { name: "DOCUSIGN_TEMPLATE_PROFESSIONAL_REFERRAL", desc: "Template ID — Professional Referral Agreement (créé dans le compte client en prod)" },
  { name: "DOCUSIGN_TEMPLATE_VIEWING_CONFIRMATION", desc: "Template ID — Viewing Introduction Confirmation (créé dans le compte client en prod)" },
  { name: "DOCUSIGN_WEBHOOK_SECRET", desc: "Secret HMAC pour vérifier DocuSign Connect" },
  { name: "DOCUSIGN_ADMIN_EMAIL", desc: "Email Neova ajouté en signataire interne (rôle « Neova Admin »)" },
  { name: "DOCUSIGN_ADMIN_NAME", desc: "Nom affiché du signataire interne (doit être « Neova Admin »)" },
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
  const [validateResult, setValidateResult] = useState<any>(null);
  const [validateLoading, setValidateLoading] = useState(false);
  const [envInfo, setEnvInfo] = useState<any>(null);
  const [tplIds, setTplIds] = useState({
    CLIENT_REPRESENTATION: "",
    AGENT_REFERRAL: "",
    PROFESSIONAL_REFERRAL: "",
    VIEWING_CONFIRMATION: "",
  });

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success("Copié");
  };

  // Ping JWT auth on load to know configured state
  useEffect(() => {
    runPing(true);
    loadEnvInfo();
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

  const loadEnvInfo = async () => {
    const { data } = await supabase.functions.invoke("docusign-send-envelope", {
      body: { action: "env_info" },
    });
    if (data?.ok) setEnvInfo(data);
  };

  const runValidateTemplates = async () => {
    setValidateLoading(true);
    const { data, error } = await supabase.functions.invoke("docusign-send-envelope", {
      body: { action: "validate_templates" },
    });
    setValidateLoading(false);
    if (error) {
      setValidateResult({ ok: false, error: error.message });
      toast.error(error.message);
      return;
    }
    setValidateResult(data);
    if (data?.ok) toast.success("Tous les templates sont valides ✓");
    else toast.error("Un ou plusieurs templates ont des problèmes");
  };

  const ready = pingResult?.ok === true;
  const consentRequired = pingResult?.code === "consent_required";
  const isSandbox = envInfo?.environment === "SANDBOX";
  const isProduction = envInfo?.environment === "PRODUCTION";
  const adminNameOk = (envInfo?.admin_name || "").trim() === "Neova Admin";

  return (
    <AdminLayout
      title="Paramètres DocuSign"
      subtitle="Intégration sandbox — JWT Grant"
    >
      {isManualDocuSign() && (
        <div className="mb-6 p-4 rounded-2xl ring-1 bg-amber-50 ring-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-700 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-900">DocuSign — mode manuel actif</p>
              <p className="text-amber-800 mt-0.5">{MANUAL_MODE_BANNER}</p>
              <p className="text-amber-800 mt-1">
                Manual workflow ready · API automation not active yet. Le validateur API ci-dessous
                peut afficher des erreurs (ex. <code className="font-mono">issuer_not_found</code>) tant que
                l'abonnement DocuSign / Go-Live n'est pas finalisé — ces erreurs sont attendues en mode manuel.
              </p>
              <p className="text-amber-900 mt-2 font-medium">
                API automation is paused. Use DocuSign manually until API Go-Live is activated.
              </p>
              <a
                href="https://www.docusign.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-900 text-white text-xs font-medium hover:bg-amber-950"
              >
                <ExternalLink size={13} /> Ouvrir DocuSign
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Environment indicator */}
      {envInfo && (
        <div
          className={`mb-6 p-4 rounded-2xl ring-1 flex items-center justify-between gap-4 flex-wrap ${
            isProduction
              ? "bg-rose-50 ring-rose-200"
              : "bg-amber-50 ring-amber-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <ServerCog
              size={22}
              className={isProduction ? "text-rose-700" : "text-amber-700"}
            />
            <div>
              <p
                className={`font-display text-base ${
                  isProduction ? "text-rose-900" : "text-amber-900"
                }`}
              >
                Environnement DocuSign :{" "}
                <span className="font-semibold uppercase tracking-wide">
                  {envInfo.environment}
                </span>
              </p>
              <p className="text-xs mt-0.5 text-slate-700">
                Base URL{" "}
                <code className="font-mono text-[12px]">{envInfo.base_url || "—"}</code>
              </p>
              <p className="text-xs mt-1 text-slate-700">
                Admin signataire interne :{" "}
                <code className="font-mono">{envInfo.admin_name || "—"}</code>{" "}
                {adminNameOk ? (
                  <span className="ml-1 text-emerald-700">✓</span>
                ) : (
                  <span className="ml-1 text-rose-700">
                    ⚠ doit être « Neova Admin »
                  </span>
                )}
              </p>
            </div>
          </div>
          {isProduction && (
            <span className="px-3 py-1.5 rounded-full bg-rose-600 text-white text-xs font-semibold tracking-wide">
              ⚠ PRODUCTION — vraies signatures
            </span>
          )}
          {isSandbox && (
            <span className="px-3 py-1.5 rounded-full bg-amber-600 text-white text-xs font-semibold tracking-wide">
              SANDBOX — environnement de test
            </span>
          )}
        </div>
      )}

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
                Mode{" "}
                <span className="font-medium">
                  {envInfo?.environment === "PRODUCTION" ? "Production" : "Sandbox"}
                </span>{" "}
                · Base URL{" "}
                <code className="font-mono text-[12px]">
                  {envInfo?.base_url || "—"}
                </code>
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
            DocuSign demande le consentement JWT pour cette Integration Key.
            Cliquez sur <span className="font-medium">« Autoriser l'intégration DocuSign »</span> ci-dessus, puis connectez-vous avec
            l'utilisateur ciblé par <code className="font-mono">DOCUSIGN_USER_ID</code>{" "}
            <span className="font-medium">
              (en sandbox : utilisateur du compte développeur ; en production : utilisateur du compte client production)
            </span>
            . Revenez ensuite ici et cliquez sur <span className="font-medium">« Tester l'authentification JWT »</span>.
          </div>
        )}
      </Card>

      {/* Production setup checklist */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ServerCog size={18} className="text-slate-700" />
          <h2 className="font-display text-xl text-slate-900">
            Passage en production — checklist
          </h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          DocuSign <span className="font-medium">n'autorise pas</span> la création
          d'une Integration Key directement dans un compte production. L'Integration
          Key et la clé privée RSA restent celles du <span className="font-medium">compte développeur</span>.
          Pour passer en production, on remplace uniquement les valeurs qui pointent
          vers le <span className="font-medium">compte client production</span>.
        </p>

        <ol className="space-y-3 text-sm text-slate-700">
          <li className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
            <p className="font-medium text-slate-900">
              1. Application développeur (inchangée)
            </p>
            <p className="text-xs text-slate-600 mt-1">
              On garde l'Integration Key et la clé privée RSA créées dans le compte
              développeur DocuSign. Aucune nouvelle Integration Key n'est créée dans
              le compte production.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <code className="text-[11px] px-2 py-0.5 rounded bg-white ring-1 ring-slate-200 font-mono">
                DOCUSIGN_INTEGRATION_KEY
              </code>
              <code className="text-[11px] px-2 py-0.5 rounded bg-white ring-1 ring-slate-200 font-mono">
                DOCUSIGN_PRIVATE_KEY
              </code>
            </div>
          </li>

          <li className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
            <p className="font-medium text-slate-900">
              2. Promouvoir l'application en production (Go Live)
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Dans le compte développeur, lancer le processus{" "}
              <span className="font-medium">« Go Live »</span> sur l'application pour
              que cette Integration Key soit acceptée par les comptes production
              DocuSign.
            </p>
          </li>

          <li className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
            <p className="font-medium text-slate-900">
              3. Cibler le compte client production
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Remplacer uniquement les valeurs qui désignent le compte cible :
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
              <li>
                <code className="font-mono">DOCUSIGN_ACCOUNT_ID</code> — API Account ID
                du compte client production
              </li>
              <li>
                <code className="font-mono">DOCUSIGN_USER_ID</code> — User ID (GUID)
                de l'utilisateur du compte client à impersonner
              </li>
              <li>
                <code className="font-mono">DOCUSIGN_BASE_URL</code> — Account Base URI
                du compte client production (ex. <code className="font-mono">https://eu.docusign.net</code>)
              </li>
            </ul>
          </li>

          <li className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
            <p className="font-medium text-slate-900">
              4. Consentement JWT côté client production
            </p>
            <p className="text-xs text-slate-600 mt-1">
              L'utilisateur production ciblé par{" "}
              <code className="font-mono">DOCUSIGN_USER_ID</code> doit accorder
              explicitement le consentement JWT à l'Integration Key développeur,
              en se connectant via l'URL de consentement <span className="font-medium">production</span>{" "}
              (<code className="font-mono">account.docusign.com</code>) avec les scopes{" "}
              <code className="font-mono">signature impersonation</code>.
              Sans ce consentement, le grant JWT échouera avec{" "}
              <code className="font-mono">consent_required</code>.
            </p>
          </li>

          <li className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
            <p className="font-medium text-slate-900">
              5. Recréer les templates dans le compte client production
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Les Template IDs sandbox <span className="font-medium">ne fonctionnent pas</span> en
              production. Recréer les 4 templates dans le compte client production
              (mêmes noms, mêmes rôles, mêmes <code className="font-mono">tabLabels</code>),
              puis remplacer les secrets :
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                "DOCUSIGN_TEMPLATE_CLIENT_REPRESENTATION",
                "DOCUSIGN_TEMPLATE_AGENT_REFERRAL",
                "DOCUSIGN_TEMPLATE_PROFESSIONAL_REFERRAL",
                "DOCUSIGN_TEMPLATE_VIEWING_CONFIRMATION",
              ].map((s) => (
                <code
                  key={s}
                  className="text-[11px] px-2 py-0.5 rounded bg-white ring-1 ring-slate-200 font-mono"
                >
                  {s}
                </code>
              ))}
            </div>
          </li>

          <li className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
            <p className="font-medium text-slate-900">
              6. Reconfigurer DocuSign Connect côté production
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Dans le compte client production, créer une configuration Connect
              pointant vers l'URL webhook ci-dessous, et coller le secret HMAC dans{" "}
              <code className="font-mono">DOCUSIGN_WEBHOOK_SECRET</code>.
            </p>
          </li>

          <li className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
            <p className="font-medium text-slate-900">
              7. Vérification finale
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Lancer <span className="font-medium">« Tester l'authentification JWT »</span> puis{" "}
              <span className="font-medium">« Valider tous les templates »</span>. La
              bannière en haut doit indiquer{" "}
              <span className="font-medium">PRODUCTION</span>.
            </p>
          </li>
        </ol>

        <div className="mt-4 p-3 rounded-xl bg-rose-50 ring-1 ring-rose-200 text-xs text-rose-900">
          ❌ À ne pas faire : créer une nouvelle Integration Key dans le compte
          DocuSign production. DocuSign ne le permet pas — la même Integration Key
          développeur (promue Go Live) est utilisée pour tous les comptes production
          qui accordent le consentement JWT.
        </div>
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
              name: "Neova - Professional Referral Agreement",
              env: "DOCUSIGN_TEMPLATE_PROFESSIONAL_REFERRAL",
              roles: ["Professional", "Neova Admin"],
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
        <div className="mt-2 p-3 rounded-xl bg-slate-50 ring-1 ring-slate-200 text-[11px] text-slate-600">
          🔒 Note interne : ces modèles d'accord doivent être revus par un
          conseiller juridique avant utilisation en production.
        </div>
      </Card>

      {/* Template validator */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-slate-700" />
            <h2 className="font-display text-xl text-slate-900">
              Validation des templates DocuSign
            </h2>
          </div>
          <SecondaryButton
            onClick={runValidateTemplates}
            className="!py-2 !px-3 text-xs"
          >
            {validateLoading ? "Vérification…" : "Valider tous les templates"}
          </SecondaryButton>
        </div>
        <p className="text-sm text-slate-500 mb-3">
          Vérifie pour chaque template : (1) qu'il existe dans DocuSign,
          (2) que les rôles attendus sont présents (role-only, sans email/nom
          codé en dur), et (3) que tous les <code className="font-mono">tabLabel</code>{" "}
          requis sont définis.
        </p>
        {validateResult?.results ? (
          <div className="space-y-3">
            {Object.entries(validateResult.results).map(([key, r]: [string, any]) => (
              <div
                key={key}
                className={`p-4 rounded-xl ring-1 ${
                  r.ok
                    ? "bg-emerald-50 ring-emerald-200"
                    : "bg-rose-50 ring-rose-200"
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {r.ok ? (
                    <CheckCircle2 size={16} className="text-emerald-700" />
                  ) : (
                    <XCircle size={16} className="text-rose-700" />
                  )}
                  <span className="font-semibold text-sm text-slate-900">
                    {key}
                  </span>
                  {r.templateId && (
                    <code className="text-[11px] font-mono text-slate-500 break-all">
                      {r.templateId}
                    </code>
                  )}
                </div>
                {r.configured === false && (
                  <p className="text-xs text-rose-800 mt-2">{r.message}</p>
                )}
                {r.configured && (
                  <div className="mt-2 space-y-1.5 text-xs">
                    <p className="text-slate-700">
                      Rôles attendus :{" "}
                      <code className="font-mono">
                        {r.expectedRoles.join(", ")}
                      </code>
                    </p>
                    <p className="text-slate-700">
                      Rôles trouvés :{" "}
                      <code className="font-mono">
                        {(r.roles || []).join(", ") || "—"}
                      </code>
                    </p>
                    {r.missingRoles?.length > 0 && (
                      <p className="text-rose-800">
                        ❌ Rôles manquants :{" "}
                        <code className="font-mono">
                          {r.missingRoles.join(", ")}
                        </code>
                      </p>
                    )}
                    {r.extraRoles?.length > 0 && (
                      <p className="text-rose-800">
                        ❌ Rôles inattendus :{" "}
                        <code className="font-mono">
                          {r.extraRoles.join(", ")}
                        </code>
                      </p>
                    )}
                    {r.hardcodedRecipients?.length > 0 && (
                      <p className="text-rose-800">
                        ❌ Destinataires codés en dur (le template doit être
                        role-only, sans email/nom) :{" "}
                        <code className="font-mono">
                          {r.hardcodedRecipients
                            .map(
                              (h: any) =>
                                `${h.roleName}=${h.name || ""}<${h.email || ""}>`
                            )
                            .join("; ")}
                        </code>
                      </p>
                    )}
                    {r.missingTabs?.length > 0 ? (
                      <p className="text-rose-800">
                        ❌ Tabs manquants :{" "}
                        <code className="font-mono">
                          {r.missingTabs.join(", ")}
                        </code>
                      </p>
                    ) : (
                      <p className="text-emerald-800">
                        ✓ Tous les tabs requis sont présents (
                        {r.requiredTabs.length})
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : validateResult ? (
          <pre className="p-2.5 rounded-lg text-[11px] font-mono whitespace-pre-wrap break-all bg-rose-50 text-rose-900 ring-1 ring-rose-100">
            {JSON.stringify(validateResult, null, 2)}
          </pre>
        ) : (
          <p className="text-xs text-slate-500">
            Cliquez sur « Valider tous les templates » pour lancer la
            vérification.
          </p>
        )}
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
            Créez ces 4 templates dans le compte DocuSign cible (sandbox pour les tests,
            puis <span className="font-medium">compte client production</span> pour la mise en
            production), puis collez leurs Template IDs dans les secrets correspondants.
            Les IDs sandbox et production sont différents.
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