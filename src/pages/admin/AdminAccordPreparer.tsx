import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, Paperclip, Copy, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout, Card, PrimaryButton, SecondaryButton } from "./AdminLayout";
import { getTemplate } from "@/lib/agreement-templates";
import {
  EMPTY_FIELDS,
  generateAgreementPdf,
  downloadBytes,
  type AgreementFieldValues,
} from "@/lib/agreement-pdf";

const Field = ({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) => (
  <label className="block">
    <span className="text-[11px] uppercase tracking-wider text-slate-500">{label}</span>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-500"
      />
    ) : (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-500"
      />
    )}
  </label>
);

const AdminAccordPreparer = () => {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const templateId = params.get("templateId") || "";
  const requestId = params.get("requestId");
  const template = getTemplate(templateId);

  const [values, setValues] = useState<AgreementFieldValues>(EMPTY_FIELDS);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const set = (k: keyof AgreementFieldValues) => (v: string) =>
    setValues((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (!requestId) return;
    (async () => {
      const { data } = await supabase
        .from("property_requests")
        .select("name, email, phone, location, budget, surface, request_type, service_type, demand_reference, message")
        .eq("id", requestId)
        .maybeSingle();
      if (data) {
        setValues((s) => ({
          ...s,
          clientName: data.name || "",
          clientEmail: data.email || "",
          phone: data.phone || "",
          requestReference: data.demand_reference || "",
          projectType: data.request_type || data.service_type || "",
          location: data.location || "",
          budget: data.budget || "",
          surface: data.surface || "",
          notes: data.message || "",
        }));
      }
    })();
  }, [requestId]);

  useEffect(() => {
    if (!template) return;
    let cancelled = false;
    const handle = setTimeout(async () => {
      const bytes = await generateAgreementPdf(template, values);
      if (cancelled) return;
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.id, JSON.stringify(values)]);

  const filename = useMemo(() => {
    const slug = (values.clientName || "client").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `${template?.id || "accord"}-${slug || "client"}.pdf`;
  }, [template, values.clientName]);

  const handleDownload = async () => {
    if (!template) return;
    const bytes = await generateAgreementPdf(template, values);
    downloadBytes(bytes, filename);
  };

  const handleSummaryCopy = () => {
    if (!template) return;
    const summary = [
      `Accord : ${template.name}`,
      `Référence : ${values.requestReference || "—"}`,
      `Client : ${values.clientName} <${values.clientEmail}>`,
      `Projet : ${values.projectType} — ${values.location}`,
      `Budget : ${values.budget} • Surface : ${values.surface}`,
      values.notes ? `Notes : ${values.notes}` : null,
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(summary);
    toast.success("Résumé copié");
  };

  const saveAndUpload = async (): Promise<string | null> => {
    if (!template) return null;
    setSaving(true);
    try {
      const bytes = await generateAgreementPdf(template, values);
      const path = `${requestId || "standalone"}/${Date.now()}-${filename}`;
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
          client_name: values.clientName,
          client_email: values.clientEmail,
          phone: values.phone,
          project_type: values.projectType,
          location: values.location,
          budget: values.budget,
          surface: values.surface,
          notes: values.notes,
          field_values: values as any,
          generated_pdf_path: path,
          status: "ready",
        })
        .select("id")
        .maybeSingle();
      if (insErr) throw insErr;
      setSavedId(inserted?.id ?? null);
      toast.success("Accord enregistré");
      return inserted?.id ?? null;
    } catch (e: any) {
      toast.error(e.message || "Erreur d'enregistrement");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleAttachToEmail = async () => {
    const id = savedId || (await saveAndUpload());
    if (!id) return;
    if (requestId) nav(`/admin/demandes/${requestId}?attachAgreement=${id}`);
    else toast.success("Accord prêt. Ouvrez une demande pour le joindre.");
  };

  if (!template) {
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

  return (
    <AdminLayout
      title={template.name}
      subtitle="Personnalisez puis générez le PDF, attachez-le à votre email ou téléchargez-le."
      actions={
        <Link to={requestId ? `/admin/demandes/${requestId}` : "/admin/accords"}>
          <SecondaryButton><ArrowLeft size={14} /> Retour</SecondaryButton>
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nom client" value={values.clientName} onChange={set("clientName")} />
            <Field label="Email client" value={values.clientEmail} onChange={set("clientEmail")} />
            <Field label="Téléphone" value={values.phone} onChange={set("phone")} />
            <Field label="Référence (NEO-…)" value={values.requestReference} onChange={set("requestReference")} />
            <Field label="Type de projet" value={values.projectType} onChange={set("projectType")} />
            <Field label="Localisation" value={values.location} onChange={set("location")} />
            <Field label="Budget" value={values.budget} onChange={set("budget")} />
            <Field label="Surface" value={values.surface} onChange={set("surface")} />
            <Field label="Date" value={values.date} onChange={set("date")} />
            <Field label="Signataire Neova" value={values.signatory} onChange={set("signatory")} />
          </div>
          <Field label="Notes / conditions particulières" value={values.notes} onChange={set("notes")} textarea />

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <PrimaryButton onClick={handleDownload}>
              <Download size={14} /> Télécharger le PDF
            </PrimaryButton>
            <SecondaryButton onClick={handleAttachToEmail} disabled={saving}>
              <Paperclip size={14} /> {saving ? "Enregistrement…" : "Joindre au mail"}
            </SecondaryButton>
            <SecondaryButton onClick={handleSummaryCopy}>
              <Copy size={14} /> Copier le résumé
            </SecondaryButton>
            <SecondaryButton onClick={saveAndUpload} disabled={saving}>
              <Save size={14} /> Enregistrer
            </SecondaryButton>
          </div>
          {savedId && (
            <p className="text-xs text-emerald-700">Accord enregistré (id : {savedId.slice(0, 8)}…).</p>
          )}
        </Card>

        <Card className="p-3 overflow-hidden min-h-[700px]">
          {previewUrl ? (
            <iframe src={previewUrl} className="w-full h-[78vh] rounded-lg border border-slate-200" title="Aperçu PDF" />
          ) : (
            <div className="h-[78vh] flex items-center justify-center text-slate-400 text-sm">
              Génération de l'aperçu…
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAccordPreparer;