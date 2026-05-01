import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { useI18n } from "@/i18n/I18nProvider";
import rooftops from "@/assets/paris-rooftops.jpg";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  budget: z.string().trim().max(80).optional().or(z.literal("")),
  surface: z.string().trim().max(40).optional().or(z.literal("")),
  timeline: z.string().trim().max(80).optional().or(z.literal("")),
  type: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

const Field = ({ label, ...p }: any) => (
  <label className="block">
    <span className="eyebrow">{label}</span>
    <input {...p} className="mt-3 w-full bg-transparent border-b border-hairline focus:border-foreground py-3 text-base focus:outline-none transition-colors duration-500" />
  </label>
);

const FindProperty = () => {
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const { hash } = useLocation();
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hash === "#form" && formRef.current) {
      // Wait for layout/images to settle before scrolling
      const t = setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 250);
      return () => clearTimeout(t);
    }
  }, [hash]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = schema.safeParse(data);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
      toast.success(t.findProperty.success);
    }, 600);
  };

  return (
    <SiteShell>
      <PageHero
        eyebrow={t.common.eyebrow.findProperty}
        index="VII"
        title={<>{t.findProperty.title.l1}<br/><em className="display-italic">{t.findProperty.title.l2}</em></>}
        intro={<>{t.findProperty.intro.l1}<br/>{t.findProperty.intro.l2}</>}
        image={rooftops}
      />

      <Section>
        <div className="grid md:grid-cols-12 gap-x-12 gap-y-16 items-start">
          <div className="md:col-span-7 reveal">
            <p className="eyebrow mb-5">{t.common.eyebrow.concept}</p>
            <h2 className="display-lg">{t.findProperty.conceptTitle}</h2>
            <p className="mt-10 body-lg max-w-xl">{t.findProperty.conceptText}</p>
          </div>
          <ol className="md:col-span-4 md:col-start-9 space-y-10 reveal">
            {t.findProperty.howSteps.map((s, i) => (
              <li key={s} className="border-t border-hairline pt-5">
                <p className="numeral text-3xl text-muted-foreground/60">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-3 text-[15px]">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section className="bg-bone">
        <div className="max-w-2xl mb-16 reveal">
          <p className="eyebrow mb-5">{t.common.eyebrow.network}</p>
          <h2 className="display-lg">{t.findProperty.networkTitle}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-hairline">
          {t.findProperty.networkPillars.map((p, i) => (
            <div key={p} className="bg-bone p-12 reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <p className="numeral text-xs text-muted-foreground mb-6">{String(i + 1).padStart(2, "0")}</p>
              <p className="font-display text-2xl">{p}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5 reveal">
            <p className="eyebrow mb-5">{t.common.eyebrow.value}</p>
            <h2 className="display-lg">{t.findProperty.valueTitle}</h2>
          </div>
          <ul className="md:col-span-6 md:col-start-7 space-y-5 reveal">
            {t.findProperty.valueBullets.map((b) => (
              <li key={b} className="border-t border-hairline pt-5 text-[17px]">{b}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section className="bg-bone">
        <p className="text-center max-w-2xl mx-auto body-lg reveal">
          {t.findProperty.reassure.l1}<br />
          {t.findProperty.reassure.l2}<br />
          {t.findProperty.reassure.l3}
        </p>
      </Section>

      <Section>
        <div ref={formRef} id="form" className="max-w-3xl mx-auto scroll-mt-28">
          <div className="text-center mb-16 reveal">
            <p className="eyebrow mb-5">{t.common.eyebrow.form}</p>
            <h2 className="display-lg">{t.findProperty.formTitle}</h2>
          </div>
          <form onSubmit={onSubmit} className="space-y-10 reveal">
            <div className="grid md:grid-cols-2 gap-10">
              <Field label={t.findProperty.fields.name} name="name" required />
              <Field label={t.findProperty.fields.email} name="email" type="email" required />
              <Field label={t.findProperty.fields.phone} name="phone" type="tel" />
              <Field label={t.findProperty.fields.location} name="location" placeholder={t.findProperty.placeholders.location} />
              <Field label={t.findProperty.fields.budget} name="budget" placeholder={t.findProperty.placeholders.budget} />
              <Field label={t.findProperty.fields.surface} name="surface" placeholder={t.findProperty.placeholders.surface} />
              <Field label={t.findProperty.fields.timeline} name="timeline" placeholder={t.findProperty.placeholders.timeline} />
              <Field label={t.findProperty.fields.type} name="type" placeholder={t.findProperty.placeholders.type} />
            </div>
            <label className="block">
              <span className="eyebrow">{t.findProperty.fields.message}</span>
              <textarea name="message" rows={4} className="mt-3 w-full bg-transparent border-b border-hairline focus:border-foreground py-3 text-base focus:outline-none transition-colors duration-500 resize-none" />
            </label>
            <div className="text-center">
              <button type="submit" disabled={submitting} className="btn-solid disabled:opacity-40">{submitting ? t.common.cta.sending : t.common.cta.submit}</button>
            </div>
          </form>
        </div>
      </Section>
    </SiteShell>
  );
};

export default FindProperty;
