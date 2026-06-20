import { Link, useSearchParams } from "react-router-dom";
import { FileText, Download, ArrowRight } from "lucide-react";
import { AdminLayout, Card, PrimaryButton, SecondaryButton } from "./AdminLayout";
import { AGREEMENT_TEMPLATES } from "@/lib/agreement-templates";

const AdminAccords = () => {
  const [params] = useSearchParams();
  const requestId = params.get("requestId");

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
              {t.originalPdfUrl ? (
                <a href={t.originalPdfUrl} target="_blank" rel="noreferrer">
                  <SecondaryButton>
                    <Download size={14} /> Original
                  </SecondaryButton>
                </a>
              ) : (
                <SecondaryButton disabled title="Le PDF original n'est pas encore importé.">
                  <Download size={14} /> Original
                </SecondaryButton>
              )}
            </div>
            {!t.originalPdfUrl && (
              <p className="text-[11px] text-slate-400 mt-3">
                PDF original à importer — la préparation reste disponible.
              </p>
            )}
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminAccords;