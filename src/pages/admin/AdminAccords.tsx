import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { FileText, Download, ArrowRight, Loader2 } from "lucide-react";
import { AdminLayout, Card, PrimaryButton, SecondaryButton } from "./AdminLayout";
import { AGREEMENT_TEMPLATES } from "@/lib/agreement-templates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminAccords = () => {
  const [params] = useSearchParams();
  const requestId = params.get("requestId");
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadOriginal = async (
    templateId: string,
    path: string,
    filename: string,
  ) => {
    setDownloading(templateId);
    try {
      const { data, error } = await supabase.storage
        .from("agreements")
        .createSignedUrl(path, 60, { download: filename });
      if (error || !data?.signedUrl) throw error ?? new Error("Lien indisponible");
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      toast.error("Téléchargement impossible", { description: e?.message });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <AdminLayout
      title="Templates accords"
      subtitle={
        requestId
          ? "Sélectionnez un template à préparer pour cette demande."
          : "Bibliothèque de modèles d'accords prêts à personnaliser."
      }
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {AGREEMENT_TEMPLATES.map((t) => (
          <Card key={t.id} className="p-6 flex flex-col">
            <div className="flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                style={{ background: "hsl(213 28% 22%)" }}
              >
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-amber-700/80">
                  {t.category}
                </p>
                <h3 className="font-display text-lg mt-1 leading-snug text-slate-900">
                  {t.name}
                </h3>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-4 flex-1">{t.description}</p>
            <p className="text-[11px] text-slate-400 mt-3">
              Mis à jour le {t.updatedAt}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to={`/admin/accords/preparer?templateId=${t.id}${requestId ? `&requestId=${requestId}` : ""}`}
              >
                <PrimaryButton>
                  {requestId ? "Préparer pour ce client" : "Préparer"}
                  <ArrowRight size={14} />
                </PrimaryButton>
              </Link>
              {t.originalDocxPath ? (
                <SecondaryButton
                  onClick={() =>
                    handleDownloadOriginal(t.id, t.originalDocxPath!, t.originalFilename)
                  }
                  disabled={downloading === t.id}
                >
                  {downloading === t.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  DOCX original
                </SecondaryButton>
              ) : (
                <SecondaryButton disabled title="Le DOCX original n'est pas encore importé.">
                  <Download size={14} /> DOCX original
                </SecondaryButton>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              {t.originalDocxPath
                ? "DOCX original disponible · PDF généré à la préparation."
                : "DOCX original à importer — la préparation reste disponible."}
            </p>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminAccords;