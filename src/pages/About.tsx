import { Link } from "react-router-dom";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { useI18n } from "@/i18n/I18nProvider";
import { AboutVisual } from "@/components/site/AboutVisual";
import { Seo } from "@/components/site/Seo";

const About = () => {
  const { t } = useI18n();
  return (
    <SiteShell>
      <Seo
        title="About Neova — Parisian property atelier"
        description="A Paris-based atelier guiding international buyers and owners through property search, renovation and long-term care."
        path="/about"
      />
      <PageHero
        eyebrow={t.common.eyebrow.about}
        index="II"
        title={<>{t.about.title.l1}<br/><em className="display-italic">{t.about.title.l2}</em><br/>{t.about.title.l3}</>}
        intro={t.about.intro}
      />

      <Section className="bg-foreground text-background border-t border-background/10">
        <div className="grid md:grid-cols-12 gap-x-12 gap-y-12 items-start">
          <div className="md:col-span-5 reveal">
            <p className="eyebrow !text-[hsl(var(--brass))] mb-5">{t.about.propertyFinder.eyebrow}</p>
            <h2 className="display-lg text-background text-balance">
              {t.about.propertyFinder.title.l1}<br/>
              <em className="display-italic">{t.about.propertyFinder.title.l2}</em>
            </h2>
            <p className="mt-8 text-[15px] md:text-[16px] leading-[1.8] text-background/75 max-w-md">
              {t.about.propertyFinder.text}
            </p>
            <div className="mt-10">
              <Link to="/find-your-property" className="btn-line-light">
                {t.about.propertyFinder.cta}
              </Link>
            </div>
          </div>
          <div className="md:col-span-6 md:col-start-7 space-y-8 reveal">
            {t.about.propertyFinder.points.map((p, i) => (
              <div
                key={p.t}
                className="border-t border-background/15 pt-7"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="numeral text-[10px] tracking-[0.28em] text-[hsl(var(--brass))]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-[22px] leading-[1.25] text-background">{p.t}</h3>
                </div>
                <p className="text-[14px] leading-[1.75] text-background/68 max-w-md">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

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
