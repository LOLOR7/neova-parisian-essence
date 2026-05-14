import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Section } from "@/components/site/Section";
import { parisProjects } from "@/data/parisProjects";
import { useI18n } from "@/i18n/I18nProvider";
import { X } from "lucide-react";

const ParisProjectDetail = () => {
  const { slug } = useParams();
  const { t } = useI18n();
  const p = parisProjects.find((x) => x.slug === slug);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const close = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, close]);

  if (!p) return <Navigate to="/" replace />;

  return (
    <SiteShell>
      <section className="container-editorial pt-32 md:pt-40 pb-12">
        <Link to="/#selection" className="text-[10.5px] uppercase tracking-[0.28em] text-muted-foreground link-underline">
          {t.common.cta?.backToProjects ?? "← Back to projects"}
        </Link>
        <div className="mt-12 grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <p className="eyebrow mb-5">{t.common.eyebrow.projects} · {p.index}</p>
            <h1 className="display-xl">{p.title}</h1>
            <p className="mt-5 text-[10.5px] uppercase tracking-[0.32em] text-muted-foreground">
              {p.locationLabel}
            </p>
          </div>
          <div className="md:col-span-4 md:text-right">
            <p className="font-display italic text-[20px] leading-[1.5] text-foreground/80">
              {p.captions.join(" ")}
            </p>
            <span className="block h-px w-10 bg-[hsl(var(--brass))] mt-4 md:ml-auto" />
          </div>
        </div>
      </section>

      <section className="container-editorial mt-8">
        <button
          onClick={() => setLightbox(p.images.indexOf(p.hero))}
          className="block w-full aspect-[16/10] image-frame overflow-hidden bg-muted/30 group"
        >
          <img
            src={p.hero}
            alt={`Neova renovation project in Paris ${p.num}th arrondissement`}
            className="w-full h-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.03]"
          />
        </button>
      </section>

      <Section>
        <div className="text-center reveal">
          <Link to="/contact" className="btn-solid">{t.common.cta?.startSimilar ?? "Start a similar project"}</Link>
        </div>
      </Section>

      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={close}
        >
          <button
            onClick={(e) => { e.stopPropagation(); close(); }}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2"
            aria-label="Close"
          >
            <X size={28} />
          </button>
          <img
            src={p.images[lightbox]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-[92vw] object-contain"
          />
        </div>
      )}
    </SiteShell>
  );
};

export default ParisProjectDetail;
