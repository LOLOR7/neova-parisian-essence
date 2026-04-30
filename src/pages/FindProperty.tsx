import { useState } from "react";
import { z } from "zod";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import rooftops from "@/assets/paris-rooftops.jpg";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(100),
  email: z.string().trim().email("Email invalide").max(255),
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
    <input {...p} className="mt-3 w-full bg-transparent border-b border-hairline focus:border-foreground py-3 text-base focus:outline-none transition-colors" />
  </label>
);

const FindProperty = () => {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd) as Record<string, string>;
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Demande envoyée. Nous vous recontactons sous 48h.");
    }, 600);
  };

  return (
    <SiteShell>
      <PageHero
        eyebrow="Recherche de bien"
        title="Trouvez le bon bien. Pas seulement ce qui est disponible."
        intro={
          <>
            Le marché montre ce qui existe.<br />Nous partons de ce que vous voulez réellement.
          </>
        }
        image={rooftops}
      />

      <Section>
        <div className="grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-7 reveal">
            <p className="eyebrow mb-4">Concept</p>
            <h2 className="font-display text-3xl md:text-5xl leading-tight">Une recherche construite autour de votre projet</h2>
            <p className="mt-8 text-muted-foreground leading-relaxed max-w-xl">
              Plutôt que d'adapter votre ambition aux annonces disponibles, Neova part de votre demande, de votre mode de vie, de votre budget et du potentiel de rénovation. Nous activons ensuite notre réseau pour identifier les opportunités pertinentes.
            </p>
          </div>
          <ol className="md:col-span-5 space-y-8 md:pl-12 reveal">
            {["Définir votre projet", "Activation de notre réseau", "Réception de propositions pertinentes"].map((s, i) => (
              <li key={s} className="border-t border-hairline pt-4">
                <p className="font-display text-3xl text-muted-foreground/60">0{i + 1}</p>
                <p className="mt-2 text-base">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section className="bg-secondary/40 border-y border-hairline">
        <div className="max-w-2xl mb-12 reveal">
          <p className="eyebrow mb-4">Réseau</p>
          <h2 className="font-display text-3xl md:text-5xl">Un réseau parisien connecté</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {["Agents immobiliers", "Architectes", "Entreprises"].map((t, i) => (
            <div key={t} className="bg-background border border-hairline p-10 reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <p className="font-display text-2xl">{t}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="reveal">
            <p className="eyebrow mb-4">Pourquoi cette approche</p>
            <h2 className="font-display text-3xl md:text-5xl leading-tight">Un fonctionnement qui fait la différence</h2>
          </div>
          <ul className="space-y-5 reveal">
            {[
              "Accès à des opportunités off-market",
              "Vision projet claire dès le premier jour",
              "Meilleure coordination entre les parties",
              "Temps gagné, moins de visites inutiles",
              "Processus structuré et maîtrisé",
            ].map((b) => (
              <li key={b} className="border-t border-hairline pt-5 text-lg">{b}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section className="bg-secondary/40 border-y border-hairline">
        <p className="text-center max-w-2xl mx-auto text-muted-foreground leading-relaxed reveal">
          Chaque demande est étudiée avant d'être partagée.<br />
          Vous n'êtes mis en relation qu'avec des professionnels pertinents.<br />
          Aucune sollicitation inutile.
        </p>
      </Section>

      <Section>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="eyebrow mb-4">Formulaire</p>
            <h2 className="font-display text-3xl md:text-5xl">Soumettre votre projet</h2>
          </div>
          <form onSubmit={onSubmit} className="space-y-10 reveal">
            <div className="grid md:grid-cols-2 gap-10">
              <Field label="Nom" name="name" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Téléphone" name="phone" type="tel" />
              <Field label="Localisation souhaitée" name="location" placeholder="Paris VIII, Trocadéro…" />
              <Field label="Budget" name="budget" placeholder="2 — 4 M€" />
              <Field label="Surface" name="surface" placeholder="120 — 200 m²" />
              <Field label="Délai" name="timeline" placeholder="3 — 6 mois" />
              <Field label="Type de projet" name="type" placeholder="Résidence principale, investissement…" />
            </div>
            <label className="block">
              <span className="eyebrow">Message</span>
              <textarea name="message" rows={4} className="mt-3 w-full bg-transparent border-b border-hairline focus:border-foreground py-3 text-base focus:outline-none transition-colors resize-none" />
            </label>
            <div className="text-center">
              <button type="submit" disabled={submitting} className="text-[11px] uppercase tracking-[0.22em] bg-foreground text-background px-9 py-4 hover:opacity-90 transition-opacity disabled:opacity-40">
                {submitting ? "Envoi…" : "Soumettre votre projet"}
              </button>
            </div>
          </form>
        </div>
      </Section>
    </SiteShell>
  );
};

export default FindProperty;
