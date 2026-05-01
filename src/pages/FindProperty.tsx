import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Search, Hammer, Layers, Lightbulb } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";
import rooftops from "@/assets/paris-rooftops.jpg";

/* ---------- Animated network background ---------- */
const NetworkBackdrop = ({ dense = false }: { dense?: boolean }) => {
  const nodes = useMemo(() => {
    const seed = dense ? 22 : 14;
    const rand = (i: number, s: number) => {
      const x = Math.sin(i * 9301 + s * 49297) * 233280;
      return x - Math.floor(x);
    };
    return Array.from({ length: seed }, (_, i) => ({
      x: rand(i, 1) * 100,
      y: rand(i, 2) * 100,
      d: 4 + rand(i, 3) * 6,
    }));
  }, [dense]);

  const edges: [number, number][] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      if (Math.hypot(dx, dy) < 28) edges.push([i, j]);
    }
  }

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <defs>
        <radialGradient id="nodeFade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--brass))" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(var(--brass))" stopOpacity="0" />
        </radialGradient>
      </defs>
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x} y1={nodes[a].y}
          x2={nodes[b].x} y2={nodes[b].y}
          stroke="hsl(var(--slate-soft))"
          strokeWidth="0.08"
          opacity="0.35"
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="2.2" fill="url(#nodeFade)">
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur={`${4 + (i % 5)}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={n.x} cy={n.y} r="0.5" fill="hsl(var(--foreground))" opacity="0.6" />
        </g>
      ))}
    </svg>
  );
};

/* ---------- Network diagram (network section) ---------- */
const NetworkDiagram = ({ pillarLabels, centerLabel }: { pillarLabels: string[]; centerLabel: string }) => {
  const positions = [
    { x: 18, y: 28 },
    { x: 82, y: 22 },
    { x: 70, y: 82 },
  ];
  const pillars = positions.map((p, i) => ({ ...p, label: pillarLabels[i] ?? "" }));
  return (
    <div className="relative aspect-[4/3] w-full">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {pillars.map((p, i) => (
          <line key={i} x1="50" y1="50" x2={p.x} y2={p.y}
            stroke="hsl(var(--brass))" strokeWidth="0.18" opacity="0.55"
            strokeDasharray="0.6 0.6">
            <animate attributeName="stroke-dashoffset" from="0" to="12" dur="14s" repeatCount="indefinite" />
          </line>
        ))}
        {pillars.map((p, i) => (
          <g key={`n-${i}`}>
            <circle cx={p.x} cy={p.y} r="3" fill="hsl(var(--bone))" stroke="hsl(var(--foreground))" strokeWidth="0.2" />
            <circle cx={p.x} cy={p.y} r="0.8" fill="hsl(var(--brass))">
              <animate attributeName="r" values="0.6;1.4;0.6" dur={`${3 + i}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
        <circle cx="50" cy="50" r="5.5" fill="hsl(var(--foreground))" />
        <circle cx="50" cy="50" r="7.5" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.15" opacity="0.4">
          <animate attributeName="r" values="6;10;6" dur="5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="5s" repeatCount="indefinite" />
        </circle>
      </svg>
      {pillars.map((p, i) => (
        <div key={`l-${i}`} className="absolute -translate-x-1/2"
          style={{ left: `${p.x}%`, top: `calc(${p.y}% + 26px)` }}>
          <p className="eyebrow whitespace-nowrap">{p.label}</p>
        </div>
      ))}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-12 text-center">
        <p className="eyebrow text-foreground">{centerLabel}</p>
      </div>
    </div>
  );
};

/* ---------- Reusable form primitives ---------- */
const Field = ({ label, name, type = "text", required = false, placeholder = "" }: any) => (
  <label className="block">
    <span className="eyebrow">{label}{required && <span className="text-brass"> *</span>}</span>
    <input
      name={name} type={type} required={required} placeholder={placeholder}
      className="mt-3 w-full bg-transparent border-b border-hairline focus:border-foreground py-3 text-base focus:outline-none transition-colors duration-500"
    />
  </label>
);

const SelectField = ({ label, name, options, required = false }: { label: string; name: string; options: string[]; required?: boolean }) => (
  <label className="block relative">
    <span className="eyebrow">{label}{required && <span className="text-brass"> *</span>}</span>
    <select
      name={name} required={required} defaultValue=""
      className="mt-3 w-full bg-transparent border-b border-hairline focus:border-foreground py-3 text-base focus:outline-none transition-colors duration-500 appearance-none pr-8 cursor-pointer"
    >
      <option value="" disabled>—</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
    <ChevronDown size={14} className="absolute right-1 bottom-4 pointer-events-none opacity-50" />
  </label>
);

const TextareaField = ({ label, name }: { label: string; name: string }) => (
  <label className="block md:col-span-2">
    <span className="eyebrow">{label}</span>
    <textarea
      name={name} rows={4}
      className="mt-3 w-full bg-transparent border-b border-hairline focus:border-foreground py-3 text-base focus:outline-none transition-colors duration-500 resize-none"
    />
  </label>
);

/* ---------- Service options ---------- */
type ServiceId = "find" | "renovate" | "both" | "consultancy";
const SERVICE_ICONS: Record<ServiceId, typeof Search> = {
  find: Search,
  renovate: Hammer,
  both: Layers,
  consultancy: Lightbulb,
};
const SERVICE_IDS: ServiceId[] = ["find", "renovate", "both", "consultancy"];

/* ---------- Validation ---------- */
const buildSchema = (msgName: string, msgEmail: string) =>
  z.object({
    name: z.string().trim().min(2, msgName).max(100),
    email: z.string().trim().email(msgEmail).max(255),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    message: z.string().trim().max(2000).optional().or(z.literal("")),
  });

/* ---------- Page ---------- */
const FindProperty = () => {
  const { t } = useI18n();
  const fp = t.findProperty as any;
  const [submitting, setSubmitting] = useState(false);
  const [service, setService] = useState<ServiceId | null>(null);
  const { hash } = useLocation();
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hash === "#form" && formRef.current) {
      const t = setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
      return () => clearTimeout(t);
    }
  }, [hash]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!service) {
      toast.error(fp.labels.selectFirst);
      return;
    }
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = buildSchema(fp.labels.invalidName, fp.labels.invalidEmail).safeParse(fd);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }

    setSubmitting(true);
    try {
      // Auto-derive workflow request_type from the public form choice.
      // Admin can override later from /admin/workflow.
      const requestType =
        service === "find"
          ? "REAL_ESTATE_ONLY"
          : service === "renovate"
            ? "PROJECT_ONLY"
            : service === "consultancy"
              ? "CONSULTANCY"
              : "REAL_ESTATE_AND_PROJECT";

      const { error } = await supabase.from("property_requests").insert({
        service_type: service,
        request_type: requestType,
        name: fd.name,
        email: fd.email,
        phone: fd.phone || null,
        location: fd.location || null,
        budget: fd.budget || null,
        surface: fd.surface || null,
        property_type: fd.property_type || null,
        intended_use: fd.intended_use || null,
        timeline: fd.timeline || null,
        works_level: fd.works_level || null,
        current_condition: fd.current_condition || null,
        renovation_objective: fd.renovation_objective || null,
        address: fd.address || null,
        support_level: fd.support_level || null,
        message: fd.message || null,
        price_per_sqm: fd.price_per_sqm || null,
        source: "Find Your Property form",
        user_agent: navigator.userAgent,
      } as any);
      if (error) throw error;
      (e.target as HTMLFormElement).reset();
      setService(null);
      toast.success(fp.labels.success);
    } catch (err) {
      console.error(err);
      toast.error(fp.labels.error);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---- Steps section ---- */
  const steps = (fp.steps as { t: string; d: string }[]).map((s, i) => ({ n: String(i + 1).padStart(2, "0"), ...s }));

  /* ---- Value bullets ---- */
  const benefits = fp.benefits as { t: string; d: string }[];
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  /* ---- Pillars ---- */
  const pillars = fp.pillars as { t: string; d: string }[];

  /* ---- Reassurance ---- */
  const reassure = fp.reassureCards as string[];

  return (
    <SiteShell>
      {/* ---------- HERO ---------- */}
      <section className="relative pt-32 md:pt-40 pb-24 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={rooftops} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(var(--background) / 0.55) 0%, hsl(var(--background) / 0.92) 70%, hsl(var(--background)) 100%)" }} />
          <div className="absolute inset-0 opacity-50">
            <NetworkBackdrop dense />
          </div>
        </div>
        <div className="container-editorial">
          <div className="flex items-baseline justify-between mb-10 reveal">
            <p className="eyebrow">Demande qualifiée</p>
            <p className="numeral text-xs tracking-[0.2em] text-muted-foreground">VII</p>
          </div>
          <h1 className="display-xl max-w-5xl text-balance reveal">
            Trouver le bon bien.<br />
            <em className="display-italic">Pas seulement ce qui est disponible.</em>
          </h1>
          <p className="mt-10 max-w-2xl body-lg reveal">
            Le marché montre ce qui existe. Nous partons de ce que vous recherchez vraiment.
          </p>
          <p className="mt-6 max-w-2xl text-[15px] reveal" style={{ color: "hsl(var(--slate-soft))" }}>
            Neova analyse votre projet, active son réseau et vous met en relation avec les opportunités
            réellement pertinentes — avant même qu'elles ne soient visibles partout.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-6 reveal">
            <button onClick={scrollToForm} className="btn-solid">Soumettre votre projet</button>
            <a href="#methode" className="btn-line">Comprendre la méthode</a>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="methode" className="py-24 md:py-36 bg-bone">
        <div className="container-editorial">
          <div className="max-w-2xl mb-16 reveal">
            <p className="eyebrow mb-5">Méthode</p>
            <h2 className="display-lg">Une recherche construite autour de votre projet</h2>
          </div>
          <div className="relative grid md:grid-cols-3 gap-px bg-hairline">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="group relative bg-bone p-12 hover:bg-background transition-colors duration-700"
              >
                <p className="numeral text-5xl text-muted-foreground/40">{s.n}</p>
                <span className="block mt-6 h-px bg-foreground/20 w-12 group-hover:w-24 transition-all duration-700" />
                <h3 className="font-display text-2xl mt-6">{s.t}</h3>
                <p className="mt-5 text-[15px]" style={{ color: "hsl(var(--slate-soft))" }}>{s.d}</p>
                <div className="absolute right-8 top-8 w-2 h-2 rounded-full bg-brass/0 group-hover:bg-brass transition-all duration-700" style={{ background: "hsl(var(--brass) / 0)" }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- NETWORK ---------- */}
      <section className="py-24 md:py-36">
        <div className="container-editorial grid md:grid-cols-12 gap-x-12 gap-y-16 items-center">
          <div className="md:col-span-5 reveal">
            <p className="eyebrow mb-5">Réseau</p>
            <h2 className="display-lg">Un réseau parisien connecté</h2>
            <p className="mt-8 body-lg">
              Chaque demande est étudiée avant d'être partagée. Vous êtes uniquement mis en relation
              avec les professionnels réellement pertinents.
            </p>
            <ul className="mt-12 space-y-6">
              {pillars.map((p) => (
                <li key={p.t} className="border-t border-hairline pt-5">
                  <p className="font-display text-xl">{p.t}</p>
                  <p className="mt-2 text-[14px]" style={{ color: "hsl(var(--slate-soft))" }}>{p.d}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-6 md:col-start-7 reveal relative">
            <div className="relative bg-bone p-10 rounded-sm" style={{ boxShadow: "var(--shadow-soft)" }}>
              <NetworkDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- VALUE / ACCORDION ---------- */}
      <section className="py-24 md:py-36 bg-bone">
        <div className="container-editorial">
          <div className="max-w-2xl mb-16 reveal">
            <p className="eyebrow mb-5">Valeur</p>
            <h2 className="display-lg">Pourquoi cette approche change tout</h2>
          </div>
          <div className="max-w-4xl divide-y divide-hairline border-t border-b border-hairline">
            {benefits.map((b, i) => {
              const open = openIdx === i;
              return (
                <button
                  key={b.t}
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="w-full text-left py-7 group flex items-start gap-8"
                >
                  <span className="numeral text-sm text-muted-foreground/70 mt-2 w-8">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1">
                    <span className="font-display text-2xl block group-hover:text-foreground transition-colors">{b.t}</span>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.span
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
                          className="block overflow-hidden"
                        >
                          <span className="block pt-4 max-w-2xl text-[15px]" style={{ color: "hsl(var(--slate-soft))" }}>{b.d}</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                  <span className={`mt-2 text-2xl font-thin transition-transform duration-500 ${open ? "rotate-45" : ""}`}>+</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- REASSURANCE ---------- */}
      <section className="py-24 md:py-32">
        <div className="container-editorial max-w-3xl text-center reveal">
          <p className="eyebrow mb-5">Discrétion</p>
          <h2 className="display-lg">Une demande étudiée avec discrétion</h2>
          <p className="mt-8 body-lg">
            Chaque demande est revue avant d'être transmise. Aucune sollicitation inutile. Vos informations
            ne sont partagées qu'avec des professionnels pertinents, dans le cadre de votre projet.
          </p>
          <div className="mt-14 grid sm:grid-cols-3 gap-px bg-hairline">
            {reassure.map((r, i) => (
              <div key={r} className="bg-background p-8">
                <p className="numeral text-xs text-muted-foreground mb-4">{String(i + 1).padStart(2, "0")}</p>
                <p className="font-display text-lg">{r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- SMART FORM ---------- */}
      <section className="py-24 md:py-36 bg-bone relative overflow-hidden">
        <div ref={formRef} id="form" className="container-editorial scroll-mt-28 relative">
          <div className="text-center max-w-2xl mx-auto mb-16 reveal">
            <p className="eyebrow mb-5">Formulaire</p>
            <h2 className="display-lg">Soumettre votre projet</h2>
            <p className="mt-6 body-lg">
              Choisissez d'abord le type d'accompagnement souhaité. Le formulaire s'adapte ensuite à votre demande.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-6 md:gap-10 mb-14 reveal flex-wrap">
            {[
              { n: 1, l: "Type d'accompagnement", active: true },
              { n: 2, l: "Informations projet", active: !!service },
              { n: 3, l: "Coordonnées", active: !!service },
            ].map((s, i, arr) => (
              <div key={s.n} className="flex items-center gap-3">
                <span className={`w-7 h-7 inline-flex items-center justify-center border text-xs transition-colors duration-500 ${s.active ? "border-foreground bg-foreground text-background" : "border-hairline text-muted-foreground"}`}>
                  {s.n}
                </span>
                <span className={`eyebrow ${s.active ? "text-foreground" : ""}`}>{s.l}</span>
                {i < arr.length - 1 && <span className="hidden md:inline-block w-12 h-px bg-hairline" />}
              </div>
            ))}
          </div>

          {/* Service selector */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            {SERVICES.map((s) => {
              const active = service === s.id;
              const Icon = s.Icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setService(s.id)}
                  className={`relative text-left p-8 border bg-background transition-all duration-500 group ${
                    active ? "border-foreground shadow-soft" : "border-hairline hover:border-foreground/40"
                  }`}
                  style={{ boxShadow: active ? "var(--shadow-soft)" : undefined }}
                >
                  <span className={`absolute top-0 left-0 h-px transition-all duration-700 ${active ? "w-full bg-brass" : "w-8 bg-foreground/30"}`} style={{ background: active ? "hsl(var(--brass))" : undefined }} />
                  <div className="flex items-start justify-between mb-6">
                    <Icon size={22} strokeWidth={1.2} className="opacity-70" />
                    <span className={`w-5 h-5 border inline-flex items-center justify-center transition-all duration-500 ${active ? "bg-foreground border-foreground" : "border-hairline"}`}>
                      {active && <Check size={12} className="text-background" strokeWidth={2} />}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl">{s.label}</h3>
                  <p className="mt-3 text-[14px]" style={{ color: "hsl(var(--slate-soft))" }}>{s.text}</p>
                </button>
              );
            })}
          </div>

          {/* Dynamic form */}
          <AnimatePresence mode="wait">
            {service && (
              <motion.form
                key={service}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
                onSubmit={onSubmit}
                className="max-w-3xl mx-auto bg-background border border-hairline p-8 md:p-12"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <p className="eyebrow mb-8">Étape 2 — Informations projet</p>
                <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
                  {service === "find" && (
                    <>
                      <Field label="Secteur recherché" name="location" placeholder="Paris VIII, Trocadéro…" />
                      <Field label="Budget d'acquisition" name="budget" placeholder="2 — 4 M€" />
                      <Field label="Surface souhaitée" name="surface" placeholder="120 — 200 m²" />
                      <SelectField label="Type de bien" name="property_type" options={["Appartement familial", "Pied-à-terre", "Investissement", "Bien à restructurer", "Autre"]} />
                      <SelectField label="Usage prévu" name="intended_use" options={["Résidence principale", "Résidence secondaire", "Investissement locatif", "Revente après rénovation"]} />
                      <SelectField label="Niveau de travaux accepté" name="works_level" options={["Aucun / prêt à vivre", "Rafraîchissement léger", "Rénovation complète possible", "À définir avec Neova"]} />
                      <SelectField label="Calendrier" name="timeline" options={["Immédiat", "1–3 mois", "3–6 mois", "6–12 mois", "Exploratoire"]} />
                    </>
                  )}
                  {service === "renovate" && (
                    <>
                      <Field label="Adresse ou arrondissement du bien" name="address" placeholder="Paris XVI" />
                      <Field label="Surface" name="surface" placeholder="120 m²" />
                      <SelectField label="Type de bien" name="property_type" options={["Appartement familial", "Pied-à-terre", "Investissement", "Plateau / loft", "Autre"]} />
                      <SelectField label="État actuel" name="current_condition" options={["À rafraîchir", "À rénover partiellement", "À rénover entièrement", "Plateau / curage complet", "Je ne sais pas encore"]} />
                      <SelectField label="Objectif de rénovation" name="renovation_objective" options={["Résidence principale", "Pied-à-terre", "Location haut de gamme", "Valorisation patrimoniale", "Revente"]} />
                      <Field label="Budget travaux estimé" name="budget" placeholder="300 — 600 K€" />
                      <SelectField label="Délai souhaité" name="timeline" options={["Dès que possible", "Dans 3 mois", "Dans 6 mois", "Pas encore défini"]} />
                    </>
                  )}
                  {service === "both" && (
                    <>
                      <Field label="Secteurs recherchés" name="location" placeholder="Paris VII, VIII, XVI…" />
                      <Field label="Budget global (acquisition + travaux)" name="budget" placeholder="3 — 6 M€" />
                      <Field label="Surface souhaitée" name="surface" placeholder="150 — 250 m²" />
                      <SelectField label="Type de projet" name="property_type" options={["Résidence principale", "Pied-à-terre", "Investissement", "Projet familial", "Projet patrimonial"]} />
                      <SelectField label="Niveau d'accompagnement" name="support_level" options={["Recherche du bien uniquement", "Recherche + estimation travaux", "Recherche + rénovation complète", "Accompagnement complet avant / pendant / après"]} />
                      <SelectField label="Calendrier" name="timeline" options={["Immédiat", "1–3 mois", "3–6 mois", "6–12 mois", "Exploratoire"]} />
                    </>
                  )}
                </div>

                <div className="mt-12 pt-10 border-t border-hairline">
                  <p className="eyebrow mb-8">Étape 3 — Coordonnées</p>
                  <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
                    <Field label="Nom" name="name" required />
                    <Field label="Email" name="email" type="email" required />
                    <Field label="Téléphone" name="phone" type="tel" />
                    <span />
                    <TextareaField label="Message" name="message" />
                  </div>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Vos informations restent confidentielles et ne sont partagées qu'avec des professionnels pertinents.
                  </p>
                  <button type="submit" disabled={submitting} className="btn-solid disabled:opacity-40">
                    {submitting ? "Envoi…" : "Envoyer ma demande"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ---------- FINAL REASSURANCE ---------- */}
      <section className="py-20 border-t border-hairline">
        <div className="container-editorial text-center max-w-2xl mx-auto reveal">
          <p className="body-lg">
            Votre demande est étudiée avant toute mise en relation.<br />
            Aucune diffusion automatique. Aucune sollicitation inutile.
          </p>
        </div>
      </section>
    </SiteShell>
  );
};

export default FindProperty;