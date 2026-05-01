import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { useI18n } from "@/i18n/I18nProvider";
import before1 from "@/assets/before-1.jpg";
import after1 from "@/assets/after-1.jpg";
import before2 from "@/assets/before-2.jpg";
import after2 from "@/assets/after-2.jpg";
import beforeReal from "@/assets/before-real.jpg";
import afterReal from "@/assets/after-real.jpg";
import beforeReal2 from "@/assets/before-real-2.jpg";
import afterReal2 from "@/assets/after-real-2.jpg";

const BeforeAfter = () => {
  const { t } = useI18n();

  const projects = [
    { before: beforeReal, after: afterReal, label: t.beforeAfter.captions[0] ?? "Salon haussmannien · Paris VIIIᵉ" },
    { before: beforeReal2, after: afterReal2, label: t.beforeAfter.captions[1] ?? "Séjour & cuisine · Paris XVIᵉ" },
    { before: before1, after: after1, label: t.beforeAfter.captions[0] ?? "Rénovation parisienne" },
    { before: before2, after: after2, label: t.beforeAfter.captions[1] ?? "Transformation intérieure" },
  ];

  return (
    <SiteShell>
      <PageHero
        eyebrow={t.common.eyebrow.beforeAfter}
        index="VI"
        title={<>{t.beforeAfter.title.l1}<br/><em className="display-italic">{t.beforeAfter.title.l2}</em></>}
      />
      <Section>
        <div className="max-w-4xl mx-auto space-y-16 md:space-y-24">
          {projects.map((p, i) => (
            <figure key={i} className="reveal-image">
              <BeforeAfterSlider
                before={p.before}
                after={p.after}
                beforeLabel={t.common.labels.before}
                afterLabel={t.common.labels.after}
                className="aspect-[4/3] md:aspect-[16/10]"
              />
              <figcaption className="mt-6 flex items-center justify-between">
                <span className="numeral text-[10.5px] tracking-[0.32em] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")} / 04
                </span>
                <span className="text-[10.5px] uppercase tracking-[0.28em] text-muted-foreground">
                  {p.label}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
    </SiteShell>
  );
};

export default BeforeAfter;
