import { useState } from "react";
import { AdminLayout, Card, PrimaryButton, SecondaryButton } from "./AdminLayout";
import {
  isDocuSignConfigured,
  setDocuSignConfigured,
  TEMPLATE_LABEL,
} from "@/lib/docusign";
import { CheckCircle2, AlertTriangle, Copy, KeyRound, FileSignature } from "lucide-react";
import { toast } from "sonner";

const ENV_VARS = [
  { name: "DOCUSIGN_INTEGRATION_KEY", desc: "Integration key (Client ID) de votre application DocuSign" },
  { name: "DOCUSIGN_USER_ID", desc: "GUID de l'utilisateur signataire côté Neova" },
  { name: "DOCUSIGN_ACCOUNT_ID", desc: "API Account ID (visible dans Settings → Apps and Keys)" },
  { name: "DOCUSIGN_BASE_URL", desc: "ex: https://demo.docusign.net/restapi (sandbox) ou https://www.docusign.net/restapi (prod)" },
  { name: "DOCUSIGN_PRIVATE_KEY", desc: "Clé privée RSA (JWT Grant). Coller le contenu PEM complet." },
  { name: "DOCUSIGN_TEMPLATE_CLIENT_REPRESENTATION", desc: "Template ID — Neova - Client Representation Agreement" },
  { name: "DOCUSIGN_TEMPLATE_AGENT_REFERRAL", desc: "Template ID — Neova - Agent Referral Agreement" },
  { name: "DOCUSIGN_TEMPLATE_VIEWING_CONFIRMATION", desc: "Template ID — Neova - Viewing Introduction Confirmation" },
  { name: "DOCUSIGN_WEBHOOK_SECRET", desc: "Secret HMAC pour vérifier les notifications DocuSign Connect" },
];

const AdminDocuSign = () => {
  const [ready, setReady] = useState(isDocuSignConfigured());
  const [tplIds, setTplIds] = useState({
    CLIENT_REPRESENTATION: "",
    AGENT_REFERRAL: "",
    VIEWING_CONFIRMATION: "",
  });

  const toggle = () => {
    const v = !ready;
    setDocuSignConfigured(v);
    setReady(v);
    toast.success(v ? "DocuSign marqué comme configuré" : "DocuSign désactivé");
  };

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success("Copié");
  };

  return (
    <AdminLayout
      title="Paramètres DocuSign"
      subtitle="Connectez votre compte DocuSign pour activer l'envoi automatique des accords"
    >
      {/* Status */}
      <Card className="p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            {ready ? (
              <CheckCircle2 size={22} className="text-emerald-600 mt-0.5" />
            ) : (
              <AlertTriangle size={22} className="text-amber-600 mt-0.5" />
            )}
            <div>
              <p className="font-display text-lg text-slate-900">
                Statut : {ready ? "Configuré" : "Non configuré"}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                {ready
                  ? "Les actions « Envoyer DocuSign » sont actives."
                  : "Les actions « Envoyer DocuSign » sont désactivées tant que la configuration n'est pas complète."}
              </p>
            </div>
          </div>
          <SecondaryButton onClick={toggle}>
            {ready ? "Marquer comme non configuré" : "Marquer comme configuré (test)"}
          </SecondaryButton>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Env vars */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound size={18} className="text-slate-700" />
            <h2 className="font-display text-xl text-slate-900">Variables d'environnement</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            À ajouter côté serveur (Lovable Cloud → Secrets). Aucune clé ne doit être collée
            dans le code.
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
            Créez ces 3 templates dans DocuSign puis collez leurs Template IDs ci-dessous (ils seront
            stockés dans les secrets correspondants).
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
                  placeholder="ex: 12345678-aaaa-bbbb-cccc-1234567890ab"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-slate-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  À renseigner aussi dans le secret{" "}
                  <code className="font-mono">DOCUSIGN_TEMPLATE_{k}</code>
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Webhook info */}
      <Card className="p-6 mt-6">
        <h2 className="font-display text-xl text-slate-900 mb-1">Webhook DocuSign Connect</h2>
        <p className="text-sm text-slate-500 mb-3">
          Configurez DocuSign Connect pour pointer vers cette URL afin de recevoir les mises à
          jour de statut d'enveloppe en temps réel.
        </p>
        <div className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100 flex items-center justify-between gap-3">
          <code className="text-[12px] font-mono text-slate-800 break-all">
            {`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.functions.supabase.co/docusign-webhook`}
          </code>
          <button
            onClick={() =>
              copy(
                `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.functions.supabase.co/docusign-webhook`
              )
            }
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

export default AdminDocuSign;