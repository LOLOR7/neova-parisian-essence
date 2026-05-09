import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useLocation, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Search, Hammer, Layers, Lightbulb, Tag, Building2 } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import rooftops from "@/assets/paris-rooftops.jpg";
import { sendAdminNotification } from "@/lib/notifications";

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
    { x: 18, y: 22, labelAbove: true, align: "left" as const },
    { x: 82, y: 22, labelAbove: true, align: "right" as const },
    { x: 70, y: 86, labelAbove: false, align: "center" as const },
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
      {pillars.map((p, i) => {
        const top = p.labelAbove ? `calc(${p.y}% - 32px)` : `calc(${p.y}% + 18px)`;
        const style: React.CSSProperties =
          p.align === "left"
            ? { left: 0, top, maxWidth: "45%" }
            : p.align === "right"
              ? { right: 0, top, maxWidth: "45%", textAlign: "right" }
              : { left: `${p.x}%`, top, transform: "translateX(-50%)", maxWidth: "60%" };
        return (
          <div key={`l-${i}`} className="absolute" style={style}>
            <p className="eyebrow text-[9px] sm:text-[10px] md:text-xs leading-tight">{p.label}</p>
          </div>
        );
      })}
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
type ServiceId = "find" | "renovate" | "both" | "consultancy" | "sell" | "property_management";
const SERVICE_ICONS: Record<ServiceId, typeof Search> = {
  find: Search,
  renovate: Hammer,
  both: Layers,
  consultancy: Lightbulb,
  sell: Tag,
  property_management: Building2,
};
const SERVICE_IDS: ServiceId[] = ["find", "sell", "renovate", "both", "property_management", "consultancy"];

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
  const isMobile = useIsMobile();
  const [submitting, setSubmitting] = useState(false);
  const [service, setService] = useState<ServiceId | null>(null);
  const { hash } = useLocation();
  const [searchParams] = useSearchParams();
  const formRef = useRef<HTMLDivElement>(null);
  const formAnchorRef = useRef<HTMLDivElement>(null);

  // Preselect service card from ?service=... query param (used by chat widget)
  useEffect(() => {
    const s = searchParams.get("service");
    if (s && (SERVICE_IDS as string[]).includes(s)) {
      setService(s as ServiceId);
      const t = setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  useEffect(() => {
    if (hash === "#form" && formRef.current) {
      const t = setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
      return () => clearTimeout(t);
    }
  }, [hash]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePickService = (id: ServiceId) => {
    setService(id);
    if (isMobile) {
      // On mobile, scroll directly to the dynamic form below the cards
      setTimeout(() => formAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    }
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
      // Map public form choices to the official workflow buckets.
      // consultancy is treated as a project-side demand (no real estate search).
      // sell uses its own SELL_PROPERTY type — the existing DocuSign / outreach
      // flow still works because admin can pick contacts manually.
      // TODO: a dedicated SELL_PROPERTY workflow could be added in /admin/workflow later.
      const requestType =
        service === "find"
          ? "REAL_ESTATE_ONLY"
          : service === "sell"
            ? "SELL_PROPERTY"
            : service === "property_management"
              ? "PROPERTY_MANAGEMENT"
              : service === "renovate" || service === "consultancy"
                ? "PROJECT_ONLY"
                : "REAL_ESTATE_AND_PROJECT";

      // Compose a structured message for sell requests, packing seller-specific
      // fields that don't have dedicated DB columns into the message body.
      let composedMessage: string | null = fd.message || null;
      if (service === "sell") {
        const sellExtras: string[] = [];
        const push = (label: string, val?: string) => { if (val) sellExtras.push(`${label}: ${val}`); };
        push("Estimated property value", fd.budget);
        push("Bedrooms", fd.bedrooms);
        push("Floor", fd.floor);
        push("Elevator", fd.elevator);
        const outdoor = ["Balcony", "Terrace", "Garden", "Rooftop"]
          .filter((o) => (fd as any)[`outdoor_${o.toLowerCase()}`])
          .join(", ");
        push("Outdoor spaces", outdoor || (fd.outdoor_none ? "None" : ""));
        push("Parking", fd.parking);
        push("Selling objective", fd.renovation_objective);
        push("Occupancy", fd.occupancy);
        push("Property highlights", fd.highlights);
        push("Renovation interest", fd.renovation_interest);
        push("Preferred contact method", fd.contact_method);
        push("Best time to contact", fd.contact_time);
        const prefix = "[Sell your property]";
        const userMsg = fd.message ? `\n\nMessage:\n${fd.message}` : "";
        composedMessage = `${prefix}\n${sellExtras.join("\n")}${userMsg}`;
      } else if (service === "property_management") {
        const pmExtras: string[] = [];
        const push = (label: string, val?: string) => { if (val) pmExtras.push(`${label}: ${val}`); };
        push("Bedrooms", fd.bedrooms);
        push("Floor", fd.floor);
        push("Elevator", fd.elevator);
        push("Parking", fd.parking);
        const outdoor = ["Balcony", "Terrace", "Garden", "Rooftop"]
          .filter((o) => (fd as any)[`outdoor_${o.toLowerCase()}`])
          .join(", ");
        push("Outdoor spaces", outdoor || (fd.outdoor_none ? "None" : ""));
        push("Current status", fd.current_condition);
        push("Intended use", fd.intended_use);
        push("Management package", fd.support_level);
        push("Furnished", fd.furnished);
        push("Rental positioning", fd.rental_positioning);
        push("Estimated monthly rent", fd.estimated_rent);
        push("Maintenance authorization limit", fd.maintenance_limit);
        push("Emergency contact preference", fd.emergency_contact);
        push("Inspection frequency", fd.inspection_frequency);
        push("Preferred language", fd.preferred_language);
        push("Preferred contact method", fd.contact_method);
        push("Best time to contact", fd.contact_time);
        const prefix = "[Property management]";
        const userMsg = fd.message ? `\n\nMessage:\n${fd.message}` : "";
        composedMessage = `${prefix}\n${pmExtras.join("\n")}${userMsg}`;
      } else {
        composedMessage =
          [fd.message, fd.acquisition_per_sqm ? "[Option] Acquisition per m² requested" : ""]
            .filter(Boolean)
            .join("\n\n") || null;
      }

      const requestId = crypto.randomUUID();
      const { error } = await supabase.from("property_requests").insert({
        id: requestId,
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
        message: composedMessage,
        price_per_sqm: fd.price_per_sqm || null,
        source: "Find Your Property form",
        user_agent: navigator.userAgent,
        works_budget: fd.works_budget || null,
      } as any);
      if (error) throw error;
      // Fire-and-forget admin notification (non-blocking).
      sendAdminNotification({
        idempotencyKey: `property-request-${requestId}`,
        eventTitle: "New property demand received",
        summary: `${fd.name} just submitted a "${service}" demand on neovaspace.com.`,
        details: [
          { label: "Name", value: fd.name },
          { label: "Email", value: fd.email },
          { label: "Phone", value: fd.phone || "" },
          { label: "Service", value: service || "" },
          { label: "Request type", value: requestType },
          { label: "Location", value: fd.location || "" },
          { label: "Budget", value: fd.budget || "" },
          { label: "Works budget", value: fd.works_budget || "" },
          { label: "Surface", value: fd.surface || "" },
          { label: "Price / m²", value: fd.price_per_sqm || "" },
          { label: "Acquisition per m² requested", value: fd.acquisition_per_sqm ? "Yes" : "" },
          { label: "Timeline", value: fd.timeline || "" },
          { label: "Message", value: fd.message || "" },
        ],
        ctaNote: "Open the admin Demandes view to qualify this lead.",
      });
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
            <p className="eyebrow">{fp.heroEyebrow}</p>
            <p className="numeral text-xs tracking-[0.2em] text-muted-foreground">VII</p>
          </div>
          <h1 className="display-xl max-w-5xl text-balance reveal pr-16 md:pr-0">
            {fp.title.l1}<br />
            <em className="display-italic">{fp.title.l2}</em>
          </h1>
          <p className="mt-10 max-w-2xl body-lg reveal">
            {fp.heroIntro1}
          </p>
          <p className="mt-6 max-w-2xl text-[15px] reveal" style={{ color: "hsl(var(--slate-soft))" }}>
            {fp.heroIntro2}
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-6 reveal">
            <button onClick={scrollToForm} className="btn-solid">{fp.ctaSubmit}</button>
            <a href="#methode" className="btn-line">{fp.ctaMethod}</a>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="methode" className="py-24 md:py-36 bg-bone">
        <div className="container-editorial">
          <div className="max-w-2xl mb-16 reveal">
            <p className="eyebrow mb-5">{fp.methodEyebrow}</p>
            <h2 className="display-lg">{fp.methodTitle}</h2>
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
            <p className="eyebrow mb-5">{fp.networkEyebrow}</p>
            <h2 className="display-lg">{fp.networkTitle}</h2>
            <p className="mt-8 body-lg">
              {fp.networkBody}
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
              <NetworkDiagram pillarLabels={pillars.map((p) => p.t)} centerLabel={fp.title.l1.replace(/\.$/, "")} />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- VALUE / ACCORDION ---------- */}
      <section className="py-24 md:py-36 bg-bone">
        <div className="container-editorial">
          <div className="max-w-2xl mb-16 reveal pr-16 md:pr-0">
            <p className="eyebrow mb-5">{fp.valueEyebrow}</p>
            <h2 className="display-lg">{fp.valueTitle}</h2>
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
          <p className="eyebrow mb-5">{fp.reassureEyebrow}</p>
          <h2 className="display-lg">{fp.reassureTitle}</h2>
          <p className="mt-8 body-lg">
            {fp.reassureBody}
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
            <p className="eyebrow mb-5">{fp.formEyebrow}</p>
            <h2 className="display-lg">{fp.formTitle}</h2>
            <p className="mt-6 body-lg">
              {fp.formIntro}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-6 md:gap-10 mb-14 reveal flex-wrap">
            {[
              { n: 1, l: fp.progress.step1, active: true },
              { n: 2, l: fp.progress.step2, active: !!service },
              { n: 3, l: fp.progress.step3, active: !!service },
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 max-w-7xl mx-auto mb-16">
            {SERVICE_IDS.map((id) => {
              const active = service === id;
              const Icon = SERVICE_ICONS[id];
              const meta = fp.services[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handlePickService(id)}
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
                  <h3 className="font-display text-2xl">{meta.label}</h3>
                  <p className="mt-3 text-[14px]" style={{ color: "hsl(var(--slate-soft))" }}>{meta.text}</p>
                </button>
              );
            })}
          </div>

          {/* Dynamic form */}
          <div ref={formAnchorRef} className="scroll-mt-24" />
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
                <p className="eyebrow mb-8">{fp.labels.step2}</p>
                <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
                  {service === "find" && (
                    <>
                      <Field label={fp.labels.sector} name="location" placeholder="Paris VIII, Trocadéro…" />
                      <Field label={fp.labels.budgetAcq} name="budget" placeholder="2 — 4 M€" />
                      <Field label={fp.labels.surfaceWanted} name="surface" placeholder="120 — 200 m²" />
                      <Field label={fp.labels.pricePerSqm} name="price_per_sqm" placeholder={fp.labels.pricePerSqmHint} />
                      <SelectField label={fp.labels.propertyType} name="property_type" options={fp.options.propertyType} />
                      <SelectField label={fp.labels.intendedUse} name="intended_use" options={fp.options.intendedUse} />
                      <SelectField label={fp.labels.worksLevel} name="works_level" options={fp.options.worksLevel} />
                      <SelectField label={fp.labels.timeline} name="timeline" options={fp.options.timeline} />
                    </>
                  )}
                  {service === "renovate" && (
                    <>
                      <Field label={fp.labels.address} name="address" placeholder="Paris XVI" />
                      <Field label={fp.labels.surface} name="surface" placeholder="120 m²" />
                      <SelectField label={fp.labels.propertyType} name="property_type" options={fp.options.renovatePropertyType} />
                      <SelectField label={fp.labels.currentCondition} name="current_condition" options={fp.options.currentCondition} />
                      <SelectField label={fp.labels.renovationObjective} name="renovation_objective" options={fp.options.renovationObjective} />
                      <Field label={fp.labels.budgetWorks} name="budget" placeholder="300 — 600 K€" />
                      <SelectField label={fp.labels.timeline} name="timeline" options={fp.options.renovateTimeline} />
                    </>
                  )}
                  {service === "both" && (
                    <>
                      <Field label={fp.labels.sectors} name="location" placeholder="Paris VII, VIII, XVI…" />
                      <Field label={fp.labels.budgetAcq} name="budget" placeholder="2 — 4 M€" />
                      <Field label={fp.labels.budgetWorks} name="works_budget" placeholder="300 — 600 K€" />
                      <Field label={fp.labels.surfaceWanted} name="surface" placeholder="150 — 250 m²" />
                      <Field label={fp.labels.pricePerSqm} name="price_per_sqm" placeholder={fp.labels.pricePerSqmHint} />
                      <SelectField label={fp.labels.projectType} name="property_type" options={fp.options.bothProjectType} />
                      <SelectField label={fp.labels.supportLevel} name="support_level" options={fp.options.supportLevel} />
                      <SelectField label={fp.labels.timeline} name="timeline" options={fp.options.timeline} />
                    </>
                  )}
                  {service === "consultancy" && (
                    <>
                      <SelectField
                        label={fp.labels.consultancyType}
                        name="support_level"
                        options={[
                          fp.consultancyTypes.property_finder,
                          fp.consultancyTypes.renovation,
                          fp.consultancyTypes.finder_renovation,
                          fp.consultancyTypes.market,
                        ]}
                        required
                      />
                      <Field label={fp.labels.sector} name="location" placeholder="Paris VIII, Trocadéro…" />
                      <Field label={fp.labels.budgetAcq} name="budget" placeholder="" />
                      <Field label={fp.labels.pricePerSqm} name="price_per_sqm" placeholder={fp.labels.pricePerSqmHint} />
                      <SelectField label={fp.labels.timeline} name="timeline" options={fp.options.consultancyTimeline} />
                      <label className="flex items-start gap-3 md:col-span-2 cursor-pointer select-none pt-2">
                        <input
                          type="checkbox"
                          name="acquisition_per_sqm"
                          value="yes"
                          className="mt-1 h-4 w-4 accent-foreground"
                        />
                        <span className="text-sm leading-snug text-foreground/80">
                          {fp.labels.acquisitionPerSqm}
                        </span>
                      </label>
                    </>
                  )}
                  {service === "sell" && (
                    <>
                      <Field label={fp.labels.propertyLocation} name="location" required placeholder="Paris VIII, Trocadéro, Neuilly-sur-Seine…" />
                      <SelectField label={fp.labels.propertyType} name="property_type" options={fp.options.sellPropertyType} required />
                      <SelectField label={fp.labels.estimatedValue} name="budget" options={fp.options.sellEstimatedValue} required />
                      <Field label={fp.labels.surface + " (m²)"} name="surface" type="number" required placeholder="120" />
                      <SelectField label={fp.labels.bedrooms} name="bedrooms" options={fp.options.sellBedrooms} />
                      <Field label={fp.labels.floor} name="floor" placeholder="5th floor, ground floor, duplex…" />
                      <SelectField label={fp.labels.elevator} name="elevator" options={fp.options.yesNoOptional} required />
                      <SelectField label={fp.labels.parking} name="parking" options={fp.options.yesNoOptional} />
                      <SelectField label={fp.labels.currentCondition} name="current_condition" options={fp.options.sellCurrentCondition} required />
                      <SelectField label={fp.labels.sellingObjective} name="renovation_objective" options={fp.options.sellObjective} required />
                      <SelectField label={fp.labels.occupancy} name="occupancy" options={fp.options.sellOccupancy} />
                      <SelectField label={fp.labels.sellingTimeline} name="timeline" options={fp.options.sellTimeline} required />
                      <div className="md:col-span-2">
                        <span className="eyebrow">{fp.labels.outdoorSpaces}</span>
                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                          {["Balcony", "Terrace", "Garden", "Rooftop", "None"].map((o) => (
                            <label key={o} className="inline-flex items-center gap-2 text-sm cursor-pointer">
                              <input type="checkbox" name={`outdoor_${o.toLowerCase()}`} value="yes" className="h-4 w-4 accent-foreground" />
                              <span>{o}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <TextareaField label={fp.labels.highlights} name="highlights" />
                      <SelectField label={fp.labels.renovationInterest} name="renovation_interest" options={fp.options.sellRenovationInterest} />
                      <p className="md:col-span-2 text-xs text-muted-foreground -mt-2">
                        {fp.labels.uploadNote}
                      </p>
                    </>
                  )}
                  {service === "property_management" && (
                    <>
                      <Field label={fp.labels.address} name="location" required placeholder="Paris VIII, Avenue Foch…" />
                      <SelectField label={fp.labels.propertyType} name="property_type" options={fp.options.pmPropertyType} required />
                      <Field label={fp.labels.surface + " (m²)"} name="surface" type="number" required placeholder="120" />
                      <SelectField label={fp.labels.bedrooms} name="bedrooms" options={fp.options.sellBedrooms} />
                      <Field label={fp.labels.floor} name="floor" placeholder="5th floor, ground floor, duplex…" />
                      <SelectField label={fp.labels.elevator} name="elevator" options={fp.options.yesNoOptional} required />
                      <SelectField label={fp.labels.parking} name="parking" options={fp.options.yesNoOptional} />
                      <SelectField label={fp.labels.currentStatus} name="current_condition" options={fp.options.pmCurrentStatus} required />
                      <div className="md:col-span-2">
                        <span className="eyebrow">{fp.labels.outdoorSpaces}</span>
                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                          {["Balcony", "Terrace", "Garden", "Rooftop", "None"].map((o) => (
                            <label key={o} className="inline-flex items-center gap-2 text-sm cursor-pointer">
                              <input type="checkbox" name={`outdoor_${o.toLowerCase()}`} value="yes" className="h-4 w-4 accent-foreground" />
                              <span>{o}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <SelectField label={fp.labels.managementPackage} name="support_level" options={fp.options.pmManagementPackage} required />
                      <SelectField label={fp.labels.intendedUseRental} name="intended_use" options={fp.options.pmIntendedUse} required />
                      <SelectField label={fp.labels.furnished} name="furnished" options={fp.options.pmFurnished} />
                      <SelectField label={fp.labels.rentalPositioning} name="rental_positioning" options={fp.options.pmRentalPositioning} />
                      <Field label={fp.labels.estimatedRent} name="estimated_rent" placeholder="3 500 € / month" />
                      <SelectField label={fp.labels.timeline} name="timeline" options={fp.options.pmStartTimeline} />
                      <SelectField label={fp.labels.maintenanceLimit} name="maintenance_limit" options={fp.options.pmMaintenanceLimit} />
                      <SelectField label={fp.labels.emergencyContact} name="emergency_contact" options={fp.options.pmEmergencyContact} />
                      <SelectField label={fp.labels.inspectionFrequency} name="inspection_frequency" options={fp.options.pmInspectionFrequency} />
                      <SelectField label={fp.labels.preferredLanguage} name="preferred_language" options={fp.options.pmPreferredLanguage} />
                      <p className="md:col-span-2 text-xs text-muted-foreground -mt-2">
                        {fp.labels.uploadNote}
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-12 pt-10 border-t border-hairline">
                  <p className="eyebrow mb-8">{fp.labels.step3}</p>
                  <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
                    <Field label={fp.labels.name} name="name" required />
                    <Field label={fp.labels.email} name="email" type="email" required />
                    <Field label={fp.labels.phone} name="phone" type="tel" />
                    {(service === "sell" || service === "property_management") ? (
                      <>
                        <SelectField label={fp.labels.contactMethod} name="contact_method" options={fp.options.contactMethod} />
                        <SelectField label={fp.labels.contactTime} name="contact_time" options={fp.options.contactTime} />
                      </>
                    ) : (
                      <span />
                    )}
                    <TextareaField label={fp.labels.message} name="message" />
                  </div>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <p className="text-xs text-muted-foreground max-w-xs">
                    {service === "sell" || service === "property_management" ? fp.labels.privacySell : fp.labels.privacy}
                  </p>
                  <button type="submit" disabled={submitting} className="btn-solid disabled:opacity-40">
                    {submitting
                      ? fp.labels.sending
                      : service === "sell"
                        ? fp.labels.sendSell
                        : service === "property_management"
                          ? fp.labels.sendPm
                          : fp.labels.send}
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
            {fp.finalReassure.l1}<br />
            {fp.finalReassure.l2}
          </p>
        </div>
      </section>
    </SiteShell>
  );
};

export default FindProperty;