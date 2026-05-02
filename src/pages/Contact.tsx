import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { useI18n } from "@/i18n/I18nProvider";
import detail from "@/assets/detail-moulding.jpg";
import { sendAdminNotification } from "@/lib/notifications";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(2000),
});

const Field = ({ label, ...p }: any) => (
  <label className="block">
    <span className="eyebrow">{label}</span>
    <input {...p} className="mt-3 w-full bg-transparent border-b border-hairline focus:border-foreground py-3 text-base focus:outline-none transition-colors duration-500" />
  </label>
);

const Contact = () => {
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = schema.safeParse(data);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSubmitting(true);
    const submissionId = crypto.randomUUID();
    sendAdminNotification({
      idempotencyKey: `contact-${submissionId}`,
      eventTitle: "New contact form message",
      summary: `${data.name} sent a message via the contact form.`,
      details: [
        { label: "Name", value: data.name },
        { label: "Email", value: data.email },
        { label: "Phone", value: data.phone || "" },
        { label: "Message", value: data.message },
      ],
      ctaNote: `Reply directly to ${data.email}.`,
    });
    setTimeout(() => {
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
      toast.success(t.contact.success);
    }, 600);
  };

  return (
    <SiteShell>
      <PageHero eyebrow={t.common.eyebrow.contact} index="VIII" title={t.contact.title} image={detail} />
      <Section>
        <div className="grid md:grid-cols-12 gap-16">
          <aside className="md:col-span-4 space-y-10 reveal">
            <div>
              <p className="eyebrow mb-3">{t.contact.info.addressLabel}</p>
              <p className="text-[15px] leading-[1.7] whitespace-pre-line">{t.contact.info.address}</p>
            </div>
            <div>
              <p className="eyebrow mb-3">{t.contact.info.emailLabel}</p>
              <a className="link-underline text-[15px]" href="mailto:info@neovaspace.com">info@neovaspace.com</a>
            </div>
            <div>
              <p className="eyebrow mb-3">{t.contact.info.instaLabel}</p>
              <a className="link-underline text-[15px]" href="https://instagram.com/neovaspace" target="_blank" rel="noreferrer">@neovaspace</a>
            </div>
          </aside>

          <form onSubmit={onSubmit} className="md:col-span-7 md:col-start-6 space-y-10 reveal">
            <div className="grid md:grid-cols-2 gap-10">
              <Field label={t.findProperty.fields.name} name="name" required />
              <Field label={t.findProperty.fields.email} name="email" type="email" required />
              <Field label={t.findProperty.fields.phone} name="phone" type="tel" />
            </div>
            <label className="block">
              <span className="eyebrow">{t.findProperty.fields.message}</span>
              <textarea name="message" rows={6} required className="mt-3 w-full bg-transparent border-b border-hairline focus:border-foreground py-3 text-base focus:outline-none transition-colors duration-500 resize-none" />
            </label>
            <button type="submit" disabled={submitting} className="btn-solid disabled:opacity-40">{submitting ? t.common.cta.sending : t.common.cta.send}</button>
          </form>
        </div>
      </Section>
    </SiteShell>
  );
};

export default Contact;
