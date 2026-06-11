import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { useI18n } from "@/i18n/I18nProvider";
import { Seo } from "@/components/site/Seo";

const BeforeAfter = () => {
  const { t } = useI18n();

  const projects = Array.from({ length: 5 }, (_, i) => ({
    before: `/before-after/before-${i + 1}.jpg`,
    after: `/before-after/after-${i + 1}.jpg`,
    label: t.beforeAfter.captions[i] ?? `Projet ${i + 1}`,
  }));

  return (
    <SiteShell>
      <Seo
        title="Before / After — Paris Renovations | Neova"
        description="Before and after of Paris renovations led by Neova — discreet, refined transformations of Haussmannian and contemporary apartments."
        path="/projects"
      />
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
                beforeAlt="Before renovation project — Neova Space"
                afterAlt="After renovation project — Neova Space"
                className="aspect-[4/3] md:aspect-[16/10]"
              />
              <figcaption className="mt-6 flex items-center justify-between">
                <span className="numeral text-[10.5px] tracking-[0.32em] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")} / 05
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
