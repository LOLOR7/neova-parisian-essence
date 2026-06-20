import { SiteShell } from "@/components/layout/SiteShell";
import { Section } from "@/components/site/Section";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { useI18n } from "@/i18n/I18nProvider";
import { Seo } from "@/components/site/Seo";

const BeforeAfter = () => {
  const { t, lang } = useI18n();

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
      {/* Renovation hero — reuses the existing before/after MP4 animation */}
      <section className="relative min-h-[80svh] flex items-end overflow-hidden bg-foreground">
        <video
          src="/hero-renovation.mp4"
          autoPlay
          muted
          loop
          playsInline
          poster="/before-after/after-1.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 via-foreground/30 to-foreground/85" />
        <div className="container-editorial relative text-background pb-16 md:pb-24 pt-32">
          <p className="eyebrow !text-[hsl(var(--brass))] mb-6 tracking-[0.42em]">
            {t.common.eyebrow.beforeAfter}
          </p>
          <h1 className="display-xl text-background text-balance leading-[1.02] max-w-4xl">
            {t.beforeAfter.title.l1}<br/>
            <em className="display-italic">{t.beforeAfter.title.l2}</em>
          </h1>
          <p className="mt-6 max-w-xl text-background/85 text-[15px] md:text-[17px] leading-[1.75]">
            {lang === "fr"
              ? "De la faisabilité à la livraison, des rénovations parisiennes menées avec clarté, maîtrise et artisans de confiance."
              : "From feasibility to delivery, Paris renovations led with clarity, control and trusted craftsmen."}
          </p>
        </div>
      </section>
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
