import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, Paperclip, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout, Card, PrimaryButton, SecondaryButton } from "./AdminLayout";
import {
  type AgreementField,
  type AgreementSection,
  SECTION_LABELS,
  applyPrefill,
  fieldsBySection,
  getTemplate,
  initialValuesFor,
} from "@/lib/agreement-templates";
import { downloadBytes, generateAgreementPdf, type AgreementValues } from "@/lib/agreement-pdf";

const SECTION_ORDER: AgreementSection[] = ["parties", "objet", "mission", "honoraires", "conditions", "signatures"];

const fmtDate = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
};

const FieldInput = ({
  field,
  value,
  onChange,
}: {
  field: AgreementField;
  value: string;
  onChange: (v: string) => void;
}) => {
  const common =
    "mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-500";
  const label = (
    <span className="text-[11px] uppercase tracking-wider text-slate-500">{field.label}</span>
  );
  if (field.type === "textarea") {
    return (
      <label className="block col-span-2">
        {label}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder={field.placeholder}
          className={common}
        />
      </label>
    );
  }
  return (
    <label className={`block ${field.span === "full" ? "col-span-2" : ""}`}>
      {label}
      <input
        type={field.type === "tel" ? "tel" : field.type === "email" ? "email" : field.type === "date" ? "date" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={common}
      />
    </label>
  );
};

const PreviewField = ({ label, value, isDate }: { label: string; value: string; isDate?: boolean }) => (
  <div className="grid grid-cols-[140px_1fr] gap-3 py-1.5 border-b border-slate-100 last:border-0">
    <div className="text-[10px] uppercase tracking-wider text-slate-500 pt-0.5">{label}</div>
    <div className="text-sm text-slate-800 whitespace-pre-wrap">{isDate ? fmtDate(value) : (value || "—")}</div>
  </div>
);

const AdminAccordPreparer = () => {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const templateId = params.get("templateId") || "";
  const requestId = params.get("requestId");
  const template = getTemplate(templateId);

  const [values, setValues] = useState<AgreementValues>(() => (template ? initialValuesFor(template) : {}));
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [generated, setGenerated] = useState<{ id: string; path: string } | null>(null);

  const groups = useMemo(() => (template ? fieldsBySection(template) : null), [template]);

  const setVal = (k: string) => (v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    setGenerated(null); // invalidate stored PDF when content changes
  };

  // Prefill from request
  useEffect(() => {
    if (!requestId || !template) return;
    (async () => {
      const { data } = await supabase
        .from("property_requests")
        .select("name, email, phone, location, budget, surface, request_type, service_type, demand_reference")
        .eq("id", requestId)
        .maybeSingle();
      if (!data) return;
      setValues((s) =>
        applyPrefill(template, s, {
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
          budget: data.budget || "",
          surface: data.surface || "",
          requestType: data.request_type || data.service_type || "",
          requestRef: data.demand_reference || "",
          today: new Date().toISOString().slice(0, 10),
        }),
      );
    })();
  }, [requestId, template]);

  const filename = useMemo(() => {
    const primaryName =
      values.clientName || values.ownerName || values.referredClientName || values.agentName || "client";
    const slug = primaryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `${template?.id || "accord"}-${slug || "client"}.pdf`;
  }, [template, values]);

  if (!template || !groups) {
    return (
      <AdminLayout title="Template introuvable">
        <Card className="p-8">
          <p className="text-slate-600">Aucun template ne correspond à cet identifiant.</p>
          <Link to="/admin/accords">
            <SecondaryButton className="mt-4"><ArrowLeft size={14} /> Retour</SecondaryButton>
          </Link>
        </Card>
      </AdminLayout>
    );
  }

  const generateAndUpload = async (): Promise<{ id: string; path: string } | null> => {
    setGenerating(true);
    try {
      const bytes = await generateAgreementPdf(template, values);
      const path = `generated/${requestId || "standalone"}/${Date.now()}-${filename}`;
      const { error: upErr } = await supabase.storage
        .from("agreements")
        .upload(path, new Blob([bytes as BlobPart], { type: "application/pdf" }), {
          upsert: false,
          contentType: "application/pdf",
        });
      if (upErr) throw upErr;
      const { data: inserted, error: insErr } = await supabase
        .from("prepared_agreements")
        .insert({
          request_id: requestId,
          template_id: template.id,
          template_name: template.name,
          client_name: values.clientName || values.ownerName || values.referredClientName || "",
          client_email: values.clientEmail || values.ownerEmail || values.agentEmail || "",
          phone: values.clientPhone || values.ownerPhone || values.agentPhone || "",
          project_type: values.projectType || "",
          location: values.projectAddress || values.propertyAddress || values.opportunityReference || "",
          budget: "",
          surface: "",
          notes: values.specialConditions || "",
          field_values: values as any,
          generated_pdf_path: path,
          status: "ready",
        })
        .select("id")
        .maybeSingle();
      if (insErr) throw insErr;
      const result = { id: inserted!.id as string, path };
      setGenerated(result);
      toast.success("PDF généré et stocké");
      return result;
    } catch (e: any) {
      toast.error(e.message || "Erreur de génération");
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const bytes = await generateAgreementPdf(template, values);
      downloadBytes(bytes, filename);
    } finally {
      setDownloading(false);
    }
  };

  const handleAttach = async () => {
    setAttaching(true);
    const target = generated || (await generateAndUpload());
    setAttaching(false);
    if (!target) return;
    if (requestId) nav(`/admin/demandes/${requestId}?attachAgreement=${target.id}`);
    else toast.success("Accord prêt. Ouvrez une demande pour le joindre.");
  };

  return (
    <AdminLayout
      title="Préparer un accord"
      subtitle={template.name}
      actions={
        <Link to={requestId ? `/admin/demandes/${requestId}` : "/admin/accords"}>
          <SecondaryButton>
            <ArrowLeft size={14} /> {requestId ? "Retour à la demande" : "Retour aux templates"}
          </SecondaryButton>
        </Link>
      }
    >
      {/* Action bar */}
      <Card className="p-4 mb-5 flex flex-wrap items-center gap-2">
        <PrimaryButton onClick={generateAndUpload} disabled={generating}>
          {generating ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
          Générer le PDF
        </PrimaryButton>
        <SecondaryButton onClick={handleDownload} disabled={downloading}>
          {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Télécharger le PDF
        </SecondaryButton>
        <SecondaryButton onClick={handleAttach} disabled={attaching || generating}>
          {attaching ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} />}
          Joindre au mail
        </SecondaryButton>
        {generated && (
          <span className="text-xs text-emerald-700 ml-auto">
            PDF enregistré · id {generated.id.slice(0, 8)}…
          </span>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Editor */}
        <div className="space-y-5">
          {SECTION_ORDER.map((sec) => {
            const fields = groups[sec];
            if (!fields.length) return null;
            return (
              <Card key={sec} className="p-5">
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="font-display text-base text-slate-900">{SECTION_LABELS[sec]}</h3>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-amber-700/80">
                    {fields.length} champ{fields.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {fields.map((f) => (
                    <FieldInput
                      key={f.key}
                      field={f}
                      value={values[f.key] ?? ""}
                      onChange={setVal(f.key)}
                    />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Live HTML preview */}
        <Card className="p-0 overflow-hidden sticky top-4 self-start">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">Aperçu en direct</p>
            <p className="text-[11px] text-slate-400">Le PDF généré reprend cette structure.</p>
          </div>
          <div className="p-8 bg-white max-h-[78vh] overflow-y-auto">
            <div className="flex items-baseline justify-between mb-1">
              <div>
                <span className="font-display text-lg tracking-tight text-slate-900">NEOVA</span>
                <span className="ml-2 text-[10px] tracking-[0.3em] text-slate-500 align-top">S P A C E</span>
              </div>
              <span className="text-xs text-slate-500">{fmtDate(values.date || "")}</span>
            </div>
            <div className="border-t border-slate-200 my-3" />
            <p className="text-[10px] uppercase tracking-[0.18em] text-amber-700/80">{template.category}</p>
            <h1 className="font-display text-2xl leading-tight text-slate-900 mt-1">{template.name}</h1>
            <p className="text-sm text-slate-600 italic mt-2">{template.description}</p>

            {SECTION_ORDER.filter((s) => s !== "signatures" && groups[s].length).map((sec) => (
              <section key={sec} className="mt-6">
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700/80 border-b border-slate-200 pb-1.5">
                  {sec === "parties" ? `Entre les soussignés — ${SECTION_LABELS.parties}` : SECTION_LABELS[sec]}
                </h2>
                <div className="mt-2">
                  {groups[sec].map((f) => (
                    <PreviewField
                      key={f.key}
                      label={f.label}
                      value={values[f.key] ?? ""}
                      isDate={f.type === "date"}
                    />
                  ))}
                </div>
              </section>
            ))}

            <section className="mt-6">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700/80 border-b border-slate-200 pb-1.5">
                Clauses générales
              </h2>
              <ol className="mt-2 space-y-2 text-sm text-slate-800 list-decimal pl-5">
                {template.clauses.map((c, i) => <li key={i}>{c}</li>)}
              </ol>
            </section>

            {groups.signatures.length > 0 && (
              <section className="mt-6">
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700/80 border-b border-slate-200 pb-1.5">
                  {SECTION_LABELS.signatures}
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-5">
                  {groups.signatures.map((f) => (
                    <div key={f.key}>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{f.label}</p>
                      <div className="border-b border-slate-300 h-10 mt-1" />
                      <p className="text-sm text-slate-800 mt-1">{values[f.key] || "—"}</p>
                      <p className="text-[10px] text-slate-400 italic">Fait le {fmtDate(values.date || "")}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <p className="text-[10px] text-slate-400 italic mt-6 pt-3 border-t border-slate-100">
              Document généré par Neova Space — L'original signé fait foi.
              {values.requestReference ? `  ·  Réf. ${values.requestReference}` : ""}
            </p>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAccordPreparer;