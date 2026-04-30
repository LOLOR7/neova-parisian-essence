import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { useI18n } from "@/i18n/I18nProvider";
import detail from "@/assets/detail-moulding.jpg";
import after1 from "@/assets/after-1.jpg";
import kleber from "@/assets/project-kleber.jpg";

const imgs: Array<string | undefined> = [detail, after1, undefined, kleber, undefined, undefined];

const Method = () => {
  const { t } = useI18n();
  return (
    <SiteShell>
      <PageHero eyebrow={t.common.eyebrow.method} index="IV" title={t.method.title} />
      <Section>
        <div className="space-y-32 md:space-y-44">
          {t.method.steps.map((s, i) => (
            <article key={s.t} className={`grid md:grid-cols-12 gap-10 items-center reveal ${i % 2 ? "md:[&>div:first-child]:order-2" : ""}`}>
              <div className={`md:col-span-6 ${i % 2 ? "md:col-start-7" : ""}`}>
                {imgs[i] ? (
                  <div className="image-frame aspect-[4/3]">
                    <img src={imgs[i]} alt={s.t} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-bone border border-hairline flex items-center justify-center">
                    <span className="numeral text-7xl text-muted-foreground/40">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                )}
              </div>
              <div className={`md:col-span-5 ${i % 2 ? "md:col-start-1 md:row-start-1" : "md:col-start-8"}`}>
                <p className="numeral text-5xl text-muted-foreground/50">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="display-md mt-5">{s.t}</h2>
                <p className="mt-5 body-lg max-w-md">{s.d}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </SiteShell>
  );
};

export default Method;
