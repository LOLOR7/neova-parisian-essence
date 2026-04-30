import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import detail from "@/assets/detail-moulding.jpg";

const schema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(100),
  email: z.string().trim().email("Email invalide").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message trop court").max(2000),
});

const Field = ({ label, ...p }: any) => (
  <label className="block">
    <span className="eyebrow">{label}</span>
    <input {...p} className="mt-3 w-full bg-transparent border-b border-hairline focus:border-foreground py-3 text-base focus:outline-none transition-colors" />
  </label>
);

const Contact = () => {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = schema.safeParse(data);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Message envoyé. Nous vous répondons sous 48h.");
    }, 600);
  };

  return (
    <SiteShell>
      <PageHero eyebrow="Contact" title="Échangeons sur votre projet." image={detail} />
      <Section>
        <div className="grid md:grid-cols-12 gap-16">
          <aside className="md:col-span-4 space-y-10 reveal">
            <div>
              <p className="eyebrow mb-3">Adresse</p>
              <p className="text-base leading-relaxed">78 Av. des Champs-Élysées<br/>75008 Paris, France</p>
            </div>
            <div>
              <p className="eyebrow mb-3">Email</p>
              <a className="link-underline" href="mailto:christian@neovaspace.com">christian@neovaspace.com</a>
            </div>
            <div>
              <p className="eyebrow mb-3">Téléphone</p>
              <a className="link-underline" href="tel:+33744990607">+33 7 44 99 06 07</a>
            </div>
            <div>
              <p className="eyebrow mb-3">Instagram</p>
              <a className="link-underline" href="https://instagram.com/neovaspace" target="_blank" rel="noreferrer">@neovaspace</a>
            </div>
          </aside>

          <form onSubmit={onSubmit} className="md:col-span-8 space-y-10 reveal">
            <div className="grid md:grid-cols-2 gap-10">
              <Field label="Nom" name="name" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Téléphone" name="phone" type="tel" />
            </div>
            <label className="block">
              <span className="eyebrow">Message</span>
              <textarea name="message" rows={6} required className="mt-3 w-full bg-transparent border-b border-hairline focus:border-foreground py-3 text-base focus:outline-none transition-colors resize-none" />
            </label>
            <button type="submit" disabled={submitting} className="text-[11px] uppercase tracking-[0.22em] bg-foreground text-background px-9 py-4 hover:opacity-90 transition-opacity disabled:opacity-40">
              {submitting ? "Envoi…" : "Envoyer le message"}
            </button>
          </form>
        </div>
      </Section>
    </SiteShell>
  );
};

export default Contact;
