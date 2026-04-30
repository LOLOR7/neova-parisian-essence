import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { useI18n } from "@/i18n/I18nProvider";

const Services = () => {
  const { t } = useI18n();
  return (
    <SiteShell>
      <PageHero eyebrow={t.common.eyebrow.services} index="III" title={t.services.title} />
      <Section>
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-0">
          {t.services.items.map((s, i) => (
            <div key={s.t} className="border-t border-hairline py-10 reveal" style={{ transitionDelay: `${i * 50}ms` }}>
              <div className="flex items-start gap-8">
                <span className="numeral text-sm text-muted-foreground w-8 pt-2">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-display text-2xl md:text-3xl">{s.t}</p>
                  <p className="mt-4 body-lg max-w-md">{s.d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </SiteShell>
  );
};

export default Services;
