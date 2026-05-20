import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteShell } from "@/components/layout/SiteShell";
import { Seo } from "@/components/site/Seo";
import { parisProjects } from "@/data/parisProjects";
import heroImage from "@/assets/project-victor-hugo.jpg";
import { sendAdminNotification } from "@/lib/notifications";

const DARK = "#111009";
const PARCHMENT = "#F4F1EC";
const BRONZE = "#9C865A";
const TEXT = "#1C1914";
const MUTED = "#6B6459";

const SectionRule = ({ light = false }: { light?: boolean }) => (
  <span
    className="block mx-auto"
    style={{
      width: 60,
      height: 1,
      background: light ? "rgba(244,241,236,0.4)" : BRONZE,
    }}
  />
);

// ────────────────────────────────────────────────────────────────────────────
// HERO
// ────────────────────────────────────────────────────────────────────────────
const Hero = () => (
  <section
    className="relative min-h-screen flex items-center overflow-hidden"
    style={{ backgroundColor: DARK }}
  >
    <img
      src={heroImage}
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
      style={{ opacity: 0.6 }}
    />
    <div
      className="absolute inset-0"
      style={{ backgroundColor: "rgba(17,16,9,0.55)" }}
    />
    <div className="container-editorial relative w-full text-center py-32">
      <p
        className="mb-8"
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: BRONZE,
        }}
      >
        Paris · Private Real Estate Operator
      </p>
      <h1
        className="mx-auto max-w-5xl"
        style={{
          fontFamily: "Cormorant Garamond, serif",
          fontWeight: 300,
          fontSize: "clamp(48px, 7.5vw, 88px)",
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          color: PARCHMENT,
        }}
      >
        The Asset. The Strategy. The Outcome.
      </h1>
      <p
        className="mx-auto mt-10"
        style={{
          maxWidth: 580,
          fontSize: 18,
          fontWeight: 300,
          lineHeight: 1.7,
          color: "rgba(244,241,236,0.75)",
        }}
      >
        NEOVA structures, transforms, and stewards high-value Parisian
        properties — for owners and investors who require full control over
        the asset lifecycle.
      </p>
      <p
        className="mx-auto mt-6"
        style={{
          maxWidth: 520,
          fontSize: 15,
          fontWeight: 300,
          lineHeight: 1.7,
          color: "rgba(244,241,236,0.55)",
        }}
      >
        We do not manage renovation projects. We manage asset trajectories.
        From the first acquisition analysis to the long-term stewardship of a
        completed property — NEOVA operates as the single point of
        intelligence, execution, and accountability.
      </p>
      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <Link to="/method" className="btn-accent">Explore the Approach</Link>
        <Link to="/projects" className="btn-ghost-light">Selected Projects</Link>
      </div>
      <div className="mt-20 flex flex-col items-center gap-4">
        <SectionRule light />
        <ChevronDown size={16} strokeWidth={1} className="breathe" color={PARCHMENT} />
      </div>
    </div>
  </section>
);

// ────────────────────────────────────────────────────────────────────────────
// POSITIONING / ECOSYSTEM
// ────────────────────────────────────────────────────────────────────────────
const Positioning = () => (
  <section className="py-32 md:py-44" style={{ backgroundColor: PARCHMENT }}>
    <div className="container-editorial">
      <div className="grid md:grid-cols-12 gap-x-16 gap-y-14">
        <div className="md:col-span-5 reveal">
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: BRONZE,
            }}
          >
            The NEOVA Approach
          </p>
          <h2
            className="mt-6"
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontWeight: 300,
              fontSize: "clamp(30px, 3.4vw, 42px)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: TEXT,
              maxWidth: 380,
            }}
          >
            We do not execute briefs. We structure asset strategies.
          </h2>
          <span
            className="block mt-10"
            style={{ width: 48, height: 1, background: BRONZE }}
          />
        </div>
        <div className="md:col-span-6 md:col-start-7 reveal" style={{ paddingTop: 12 }}>
          <div
            style={{
              fontSize: 17,
              lineHeight: 1.8,
              color: TEXT,
              maxWidth: 560,
            }}
          >
            <p>
              NEOVA was built around a simple but rare conviction: that the
              full potential of a property is rarely found at acquisition,
              rarely realized during renovation, and rarely protected after
              completion.
            </p>
            <p className="mt-6">
              We operate across the entire asset lifecycle — identifying
              opportunity, designing transformation, controlling execution,
              and remaining present long after the final key is turned. This
              is not a service. It is a methodology. And it is not available
              to every project.
            </p>
          </div>
          <div
            className="mt-14 grid grid-cols-3"
            style={{ borderTop: "1px solid rgba(28,25,20,0.12)" }}
          >
            {[
              { n: "14", l: "Projects\nCompleted" },
              { n: "9", l: "Nationalities\nServed" },
              { n: "€40M+", l: "Assets\nAdvised" },
            ].map((s, i) => (
              <div
                key={i}
                className="pt-6 pr-4"
                style={{
                  borderLeft: i > 0 ? "1px solid rgba(28,25,20,0.12)" : undefined,
                  paddingLeft: i > 0 ? 24 : 0,
                }}
              >
                <p
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: 38,
                    fontWeight: 300,
                    color: TEXT,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.n}
                </p>
                <p
                  className="mt-2 whitespace-pre-line"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: MUTED,
                    lineHeight: 1.6,
                  }}
                >
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ────────────────────────────────────────────────────────────────────────────
// ASSET LIFECYCLE
// ────────────────────────────────────────────────────────────────────────────
const STAGES = [
  {
    roman: "I",
    title: "Acquisition",
    body: "We identify assets before they reach the market, assess their structural and architectural potential, and advise on acquisition with the transformation outcome already mapped. The purchase is never isolated from the strategy.",
  },
  {
    roman: "II",
    title: "Transformation",
    body: "Every project begins with a design strategy — not a décor brief. We determine how the asset should evolve: its volume, its flow, its long-term utility. Architecture and renovation are instruments of value creation, not aesthetics alone.",
  },
  {
    roman: "III",
    title: "Execution",
    body: "NEOVA Co coordinates all technical trades, artisans, and specialists under one accountable structure. There are no gaps between what was designed and what is delivered. Clients receive progress intelligence — not updates. Control, not reports.",
  },
  {
    roman: "IV",
    title: "Stewardship",
    body: "Completion is not the end of our involvement. We support long-term asset positioning — whether the objective is occupancy, rental yield, resale value, or repositioning. The asset continues to work. So do we.",
  },
];

const Lifecycle = () => (
  <section
    className="py-32 md:py-44"
    style={{ backgroundColor: DARK, color: PARCHMENT }}
  >
    <div className="container-editorial">
      <div className="text-center reveal mb-20 md:mb-28">
        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: BRONZE,
          }}
        >
          The Lifecycle
        </p>
        <h2
          className="mt-6 mx-auto"
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontWeight: 300,
            fontSize: "clamp(34px, 4.2vw, 52px)",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            maxWidth: 820,
          }}
        >
          Four disciplines. One integrated approach.
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-x-16 gap-y-20 max-w-5xl mx-auto">
        {STAGES.map((s, i) => (
          <article
            key={s.title}
            className="reveal"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <p
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: 13,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: BRONZE,
              }}
            >
              Stage {s.roman}
            </p>
            <h3
              className="mt-5"
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontWeight: 300,
                fontSize: 28,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: PARCHMENT,
              }}
            >
              {s.title}
            </h3>
            <p
              className="mt-6"
              style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: "rgba(244,241,236,0.65)",
                maxWidth: 460,
              }}
            >
              {s.body}
            </p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

// ────────────────────────────────────────────────────────────────────────────
// SELECTED PROJECTS
// ────────────────────────────────────────────────────────────────────────────
const PROJECT_DESCRIPTORS: Record<string, { ref: string; title: string; desc: string }> = {
  "paris-7eme-ze": {
    ref: "Paris · VIIᵉ · 2024",
    title: "Haussmann Residence — Complete Transformation",
    desc: "Acquisition advisory · Architectural renovation · 210 m²",
  },
  "paris-8eme-st": {
    ref: "Paris · VIIIᵉ · 2024",
    title: "Champs-Élysées Apartment — Curated Restoration",
    desc: "Architectural renovation · Crafted detailing · 165 m²",
  },
  "paris-15eme-pb": {
    ref: "Paris · XVᵉ · 2023",
    title: "Pasteur Residence — Full Repositioning",
    desc: "Acquisition · Architectural redesign · 140 m²",
  },
  "paris-16eme-lj": {
    ref: "Paris · XVIᵉ · 2024",
    title: "Trocadéro Apartment — Volume & Light",
    desc: "Architectural transformation · Stewardship · 240 m²",
  },
};

const SelectedProjects = () => (
  <section className="py-32 md:py-44" style={{ backgroundColor: PARCHMENT }}>
    <div className="container-editorial">
      <div className="max-w-3xl reveal mb-20 md:mb-24">
        <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: BRONZE }}>
          Selected Work
        </p>
        <h2
          className="mt-6"
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontWeight: 300,
            fontSize: "clamp(36px, 4.6vw, 56px)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: TEXT,
          }}
        >
          Every project is a choice.
        </h2>
        <p className="mt-8" style={{ fontSize: 17, lineHeight: 1.75, color: MUTED, maxWidth: 540 }}>
          NEOVA does not accept all mandates. We work where we can control
          the outcome — where the asset, the brief, and the timeline allow
          us to apply the full methodology without compromise. The result is
          a body of work we are able to stand behind entirely.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-x-10 gap-y-20">
        {parisProjects.map((p) => {
          const d = PROJECT_DESCRIPTORS[p.slug] ?? {
            ref: `Paris · ${p.roman}`,
            title: p.title,
            desc: p.captions.join(" · "),
          };
          return (
            <Link
              key={p.slug}
              to={`/projects/${p.slug}`}
              className="group reveal block"
            >
              <div className="overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
                <img
                  src={p.hero}
                  alt={d.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700"
                  style={{ transitionTimingFunction: "ease" }}
                />
              </div>
              <div className="mt-7">
                <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED }}>
                  {d.ref}
                </p>
                <h3
                  className="mt-3"
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontWeight: 400,
                    fontSize: 22,
                    lineHeight: 1.25,
                    letterSpacing: "-0.01em",
                    color: TEXT,
                  }}
                >
                  {d.title}
                </h3>
                <p className="mt-3" style={{ fontSize: 14, color: MUTED }}>
                  {d.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <style>{`.group:hover img { transform: scale(1.02); }`}</style>

      <div className="mt-20 reveal">
        <Link
          to="/projects"
          className="link-underline"
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: BRONZE,
          }}
        >
          View all projects →
        </Link>
      </div>
    </div>
  </section>
);

// ────────────────────────────────────────────────────────────────────────────
// DISTINCTION
// ────────────────────────────────────────────────────────────────────────────
const DISTINCTIONS = [
  {
    label: "Not a Contractor",
    body: "A contractor executes what they are given. NEOVA determines what should be done — and then controls its execution. The brief is never the starting point. The outcome is.",
  },
  {
    label: "Not an Agency",
    body: "An agency represents property. NEOVA represents the asset strategy behind it. We are engaged by owners and investors to protect long-term value — not to facilitate a transaction.",
  },
  {
    label: "Not a Project Manager",
    body: "Project management is a coordination function. NEOVA is an intelligence function. We do not manage timelines. We manage outcomes — with full accountability for what the asset becomes.",
  },
];

const Distinction = () => (
  <section
    className="py-32 md:py-44"
    style={{ backgroundColor: "#EAE6DE" }}
  >
    <div className="container-editorial">
      <div className="text-center reveal mb-20 md:mb-24">
        <h2
          className="mx-auto"
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontWeight: 300,
            fontSize: "clamp(32px, 4vw, 48px)",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: TEXT,
            maxWidth: 760,
          }}
        >
          A different category entirely.
        </h2>
        <p
          className="mx-auto mt-8"
          style={{ fontSize: 16, lineHeight: 1.75, color: MUTED, maxWidth: 580 }}
        >
          NEOVA is not positioned against contractors, agents, or project
          managers. It operates in a space none of them occupy.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-x-14 gap-y-14 max-w-5xl mx-auto">
        {DISTINCTIONS.map((d, i) => (
          <div key={d.label} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
            <p
              style={{
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: MUTED,
              }}
            >
              {d.label}
            </p>
            <span className="block mt-5" style={{ width: 32, height: 1, background: BRONZE }} />
            <p
              className="mt-6"
              style={{ fontSize: 15, lineHeight: 1.8, color: TEXT }}
            >
              {d.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ────────────────────────────────────────────────────────────────────────────
// CONTACT
// ────────────────────────────────────────────────────────────────────────────
const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  organisation: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.string().trim().email().max(255),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  nature: z.string().trim().min(10).max(3000),
  timeline: z.string().trim().min(1),
});

const FieldUnderline = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => {
  const { label, ...rest } = props;
  return (
    <label className="block">
      <span
        style={{
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(244,241,236,0.45)",
        }}
      >
        {label}
      </span>
      <input
        {...rest}
        className="mt-3 w-full bg-transparent py-3 text-base focus:outline-none transition-colors duration-300"
        style={{
          color: PARCHMENT,
          borderBottom: "1px solid rgba(244,241,236,0.2)",
        }}
        onFocus={(e) => (e.currentTarget.style.borderBottomColor = BRONZE)}
        onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(244,241,236,0.2)")}
      />
    </label>
  );
};

const ContactSection = () => {
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const id = crypto.randomUUID();
    sendAdminNotification({
      idempotencyKey: `home-enquiry-${id}`,
      eventTitle: "New enquiry — NEOVA homepage",
      summary: `${data.name} submitted an enquiry from the homepage.`,
      details: [
        { label: "Name", value: data.name },
        { label: "Organisation", value: data.organisation || "" },
        { label: "Email", value: data.email },
        { label: "Location", value: data.location || "" },
        { label: "Timeline", value: data.timeline },
        { label: "Nature of project", value: data.nature },
      ],
      ctaNote: `Reply directly to ${data.email}.`,
    });
    setTimeout(() => {
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Your enquiry has been received. We will respond within 24 hours.");
    }, 600);
  };

  return (
    <section
      id="contact"
      className="py-32 md:py-44"
      style={{ backgroundColor: DARK, color: PARCHMENT }}
    >
      <div className="container-editorial grid md:grid-cols-12 gap-x-16 gap-y-16">
        <div className="md:col-span-5 reveal">
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: BRONZE,
            }}
          >
            Begin a Conversation
          </p>
          <h2
            className="mt-6"
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontWeight: 300,
              fontSize: "clamp(36px, 4.4vw, 52px)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: PARCHMENT,
            }}
          >
            Every mandate begins with a single conversation.
          </h2>
          <p
            className="mt-8"
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: "rgba(244,241,236,0.6)",
              maxWidth: 460,
            }}
          >
            We respond to every inquiry within 24 hours. We do not respond to
            every inquiry with a proposal — we respond with a conversation.
            If the project and the timing are right, we will tell you. If
            they are not, we will tell you that too.
          </p>
          <div
            className="mt-12 space-y-3"
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(244,241,236,0.45)",
              lineHeight: 2,
            }}
          >
            <p>78 Av. des Champs-Élysées<br />75008 Paris</p>
            <p>Email · info@neovaspace.com</p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="md:col-span-6 md:col-start-7 reveal space-y-10"
        >
          <div className="grid sm:grid-cols-2 gap-10">
            <FieldUnderline label="Your name" name="name" required />
            <FieldUnderline label="Your organisation (optional)" name="organisation" />
            <FieldUnderline label="Your email" name="email" type="email" required />
            <FieldUnderline label="Your location" name="location" />
          </div>
          <label className="block">
            <span
              style={{
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(244,241,236,0.45)",
              }}
            >
              Nature of your project
            </span>
            <textarea
              name="nature"
              rows={4}
              required
              placeholder="Acquisition, renovation, advisory, or stewardship — describe your situation and what you are seeking to achieve."
              className="mt-3 w-full bg-transparent py-3 text-base focus:outline-none resize-none transition-colors duration-300"
              style={{
                color: PARCHMENT,
                borderBottom: "1px solid rgba(244,241,236,0.2)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = BRONZE)}
              onBlur={(e) =>
                (e.currentTarget.style.borderBottomColor = "rgba(244,241,236,0.2)")
              }
            />
          </label>
          <label className="block">
            <span
              style={{
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(244,241,236,0.45)",
              }}
            >
              Your timeline
            </span>
            <select
              name="timeline"
              required
              defaultValue=""
              className="mt-3 w-full bg-transparent py-3 text-base focus:outline-none transition-colors duration-300 appearance-none"
              style={{
                color: PARCHMENT,
                borderBottom: "1px solid rgba(244,241,236,0.2)",
              }}
            >
              <option value="" disabled style={{ color: "#111" }}>
                Select —
              </option>
              {["Immediate", "Within 6 months", "Within 12 months", "Exploring"].map((o) => (
                <option key={o} value={o} style={{ color: "#111" }}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 transition-colors duration-300 disabled:opacity-40"
            style={{
              border: "1px solid rgba(244,241,236,0.3)",
              color: "rgba(244,241,236,0.85)",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = BRONZE;
              e.currentTarget.style.color = DARK;
              e.currentTarget.style.borderColor = BRONZE;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(244,241,236,0.85)";
              e.currentTarget.style.borderColor = "rgba(244,241,236,0.3)";
            }}
          >
            {submitting ? "Sending…" : "Submit Your Enquiry"}
          </button>
          <p
            className="italic"
            style={{ fontSize: 13, color: "rgba(244,241,236,0.35)" }}
          >
            All enquiries are treated with complete discretion.
          </p>
        </form>
      </div>
    </section>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// PAGE
// ────────────────────────────────────────────────────────────────────────────
const Index = () => (
  <SiteShell>
    <Seo
      title="NEOVA — Private Real Estate Operator · Paris"
      description="NEOVA controls the full lifecycle of high-value Parisian properties. Acquisition intelligence, architectural transformation, controlled execution, and long-term stewardship — one operator, one standard."
      path="/"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "NEOVA",
        url: "https://neovaspace.com/",
        address: {
          "@type": "PostalAddress",
          streetAddress: "78 Av. des Champs-Élysées",
          postalCode: "75008",
          addressLocality: "Paris",
          addressCountry: "FR",
        },
      }}
    />
    <Hero />
    <Positioning />
    <Lifecycle />
    <SelectedProjects />
    <Distinction />
    <ContactSection />
  </SiteShell>
);

export default Index;
