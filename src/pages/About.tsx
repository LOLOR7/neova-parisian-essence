import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { useI18n } from "@/i18n/I18nProvider";
import { AboutVisual } from "@/components/site/AboutVisual";

const About = () => {
  const { t } = useI18n();
  return (
    <SiteShell>
      <PageHero
        eyebrow={t.common.eyebrow.about}
        index="II"
        title={<>{t.about.title.l1}<br/><em className="display-italic">{t.about.title.l2}</em><br/>{t.about.title.l3}</>}
        intro={t.about.intro}
      />

      <Section>
        <div className="grid md:grid-cols-12 gap-x-12 gap-y-16 items-start">
          <div className="md:col-span-5 reveal panel-stone relative overflow-hidden aspect-[4/5]">
            <AboutVisual />
          </div>
          <div className="md:col-span-6 md:col-start-7 reveal">
            <p className="eyebrow mb-5">{t.common.eyebrow.vision}</p>
            <h2 className="display-lg mb-14">{t.about.visionTitle}</h2>
            <div className="space-y-12">
              {t.about.pillars.map((p, i) => (
                <div key={p.t} className="border-t border-hairline pt-7 reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                  <p className="font-display text-2xl">{p.t}</p>
                  <p className="mt-4 body-lg max-w-md">{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="bg-bone">
        <div className="max-w-2xl mb-20 reveal">
          <p className="eyebrow mb-5">{t.common.eyebrow.network}</p>
          <h2 className="display-lg">{t.about.networkTitle}</h2>
          <p className="mt-8 body-lg">{t.about.networkText}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-hairline">
          {t.about.network.map((n, i) => (
            <div key={n.t} className="bg-bone p-12 reveal" style={{ transitionDelay: `${i * 100}ms` }}>
              <p className="numeral text-xs text-muted-foreground mb-6">{String(i + 1).padStart(2, "0")}</p>
              <p className="font-display text-2xl">{n.t}</p>
              <p className="mt-5 text-[14px] leading-[1.7] text-slate-soft">{n.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid md:grid-cols-12 gap-12 reveal">
          <div className="md:col-span-5">
            <p className="eyebrow mb-5">{t.common.eyebrow.positioning}</p>
            <h2 className="display-lg">{t.about.positioningTitle}</h2>
          </div>
          <ul className="md:col-span-6 md:col-start-7 space-y-7">
            {t.about.positioningBullets.map((b) => (
              <li key={b} className="border-t border-hairline pt-5 text-lg">{b}</li>
            ))}
          </ul>
        </div>
      </Section>
    </SiteShell>
  );
};

export default About;
