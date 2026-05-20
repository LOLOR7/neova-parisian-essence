import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { SiteShell } from "@/components/layout/SiteShell";
import { Seo } from "@/components/site/Seo";
import { sendAdminNotification } from "@/lib/notifications";
import heroImage from "@/assets/project-victor-hugo.jpg";
import { parisProjects } from "@/data/parisProjects";

/* ---------- shared section header ---------- */
const SectionEyebrow = ({ children, onDark = false }: { children: React.ReactNode; onDark?: boolean }) => (
  <p
    className="text-[11px] uppercase font-normal"
    style={{ letterSpacing: "0.18em", color: "hsl(var(--accent))" }}
  >
    {children}
  </p>
);

const sectionPad = "py-[90px] md:py-[160px]";

/* ---------- HERO ---------- */
const Hero = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    <img
      src={heroImage}
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
      loading="eager"
    />
    <div
      className="absolute inset-0"
      style={{ backgroundColor: "rgba(28, 43, 58, 0.52)" }}
    />
    <div className="relative z-10 container-editorial text-center">
      <p
        className="text-[11px] uppercase mb-10 animate-fade-in"
        style={{ letterSpacing: "0.25em", color: "hsl(var(--accent))" }}
      >
        Paris
      </p>
      <h1
        className="font-display font-light text-stone mx-auto"
        style={{
          fontSize: "clamp(2.6rem, 8vw, 6rem)",
          lineHeight: 1.0,
          letterSpacing: "-0.03em",
        }}
      >
        The property.<br />
        The potential.<br />
        The outcome.
      </h1>
      <p
        className="mx-auto mt-12 animate-fade-in"
        style={{
          maxWidth: "500px",
          fontSize: "17px",
          fontWeight: 300,
          lineHeight: 1.75,
          color: "hsl(var(--stone) / 0.72)",
          animationDelay: "0.4s",
          animationFillMode: "both",
        }}
      >
        A private practice for the full lifecycle of exceptional Parisian properties.
      </p>
      <div
        className="mt-14 flex flex-wrap items-center justify-center gap-4 animate-fade-in"
        style={{ animationDelay: "0.6s", animationFillMode: "both" }}
      >
        <Link to="/method" className="btn-solid">Explore our Approach</Link>
        <Link to="/projects" className="btn-line-light">View Selected Projects</Link>
      </div>
    </div>

    {/* bottom rule + breathing chevron */}
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
      <span className="block w-12 h-px" style={{ backgroundColor: "hsl(var(--accent))" }} />
      <svg
        width="14"
        height="8"
        viewBox="0 0 14 8"
        fill="none"
        style={{
          color: "hsl(var(--stone))",
          animation: "neovaChevronBreathe 1.2s ease-in-out infinite",
        }}
      >
        <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="1" />
      </svg>
      <style>{`
        @keyframes neovaChevronBreathe {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  </section>
);

/* ---------- THE PRACTICE ---------- */
const ThePractice = () => (
  <section className={sectionPad} style={{ backgroundColor: "hsl(var(--stone))" }}>
    <div className="container-editorial">
      <div className="grid md:grid-cols-12 gap-12 md:gap-16">
        <div className="md:col-span-5 reveal">
          <SectionEyebrow>The Practice</SectionEyebrow>
          <h2
            className="font-display font-light mt-8 text-ink"
            style={{
              fontSize: "clamp(2.2rem, 4vw, 2.875rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              maxWidth: "360px",
            }}
          >
            A property holds more than it shows.
          </h2>
          <span
            className="block mt-8 h-px"
            style={{ width: "48px", backgroundColor: "hsl(var(--accent))" }}
          />
        </div>

        <div className="md:col-span-7 md:pt-5 reveal">
          <div
            className="space-y-6 text-ink"
            style={{ fontSize: "17px", lineHeight: 1.85, fontWeight: 300 }}
          >
            <p>
              NEOVA was founded on a single observation: that the gap between
              what a property is and what it can become is rarely bridged —
              because the people who find properties and the people who
              transform them are almost never the same.
            </p>
            <p>
              We closed that gap. Our practice moves with the asset — from the
              earliest acquisition analysis through architectural transformation
              and into long-term stewardship. The same intelligence that
              identifies a property informs every decision made about it
              afterwards.
            </p>
            <p>This continuity is what we offer. It is not common.</p>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap items-end gap-x-10 gap-y-8">
            {[
              { n: "14", l: "Projects Completed" },
              { n: "9", l: "Nationalities Served" },
              { n: "€40M+", l: "In Assets Advised" },
            ].map((s, i, arr) => (
              <div key={s.l} className="flex items-end gap-x-10">
                <div>
                  <p className="font-display font-light text-ink" style={{ fontSize: "40px", lineHeight: 1, letterSpacing: "-0.02em" }}>
                    {s.n}
                  </p>
                  <p
                    className="mt-3 text-[10px] uppercase"
                    style={{ letterSpacing: "0.15em", color: "hsl(var(--terre))" }}
                  >
                    {s.l}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <span style={{ color: "hsl(var(--accent))", fontSize: "20px", lineHeight: "40px" }}>·</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ---------- THE LIFECYCLE ---------- */
const stages = [
  {
    n: "I",
    title: "Acquisition",
    body: "We read a property before we recommend it. Every acquisition we advise on is evaluated for what the asset can become — not only what it currently is. The purchase and the transformation strategy are considered as one.",
  },
  {
    n: "II",
    title: "Transformation",
    body: "Architecture in service of value. We design the evolution of each space — its structure, its volume, its light — with both immediate quality and long-term positioning in mind. Nothing is purely aesthetic.",
  },
  {
    n: "III",
    title: "Execution",
    body: "NEOVA Co coordinates the full technical realisation. Artisans, specialists, and suppliers are selected for precision and held to a single standard. Clients receive regular, clear progress intelligence throughout.",
  },
  {
    n: "IV",
    title: "Stewardship",
    body: "Our relationship with an asset does not end at handover. We remain available for long-term advisory — whether the objective is occupancy, rental, repositioning, or eventual sale. The asset continues to work. So do we.",
  },
];

const Lifecycle = () => (
  <section className={sectionPad} style={{ backgroundColor: "hsl(var(--navy))" }}>
    <div className="container-editorial">
      <div className="text-center max-w-2xl mx-auto reveal">
        <SectionEyebrow>How we work</SectionEyebrow>
        <h2
          className="font-display font-light mt-8 text-stone"
          style={{
            fontSize: "clamp(2.2rem, 4.5vw, 3.625rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
          }}
        >
          Four moments. One unbroken line.
        </h2>
        <p
          className="mt-8 mx-auto"
          style={{
            fontSize: "16px",
            lineHeight: 1.75,
            maxWidth: "520px",
            color: "hsl(var(--stone) / 0.55)",
            fontWeight: 300,
          }}
        >
          Every mandate begins at acquisition and continues long after the renovation is complete.
        </p>
      </div>

      <div className="mt-20 md:mt-28 grid md:grid-cols-2 gap-x-16 gap-y-16 md:gap-y-24">
        {stages.map((s, i) => (
          <article
            key={s.n}
            className="reveal"
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            <p
              className="text-[11px] uppercase"
              style={{ letterSpacing: "0.2em", color: "hsl(var(--accent))" }}
            >
              {s.n}
            </p>
            <h3
              className="font-display font-light text-stone mt-6"
              style={{ fontSize: "30px", lineHeight: 1.15, letterSpacing: "-0.02em" }}
            >
              {s.title}
            </h3>
            <p
              className="mt-6"
              style={{
                fontSize: "15px",
                lineHeight: 1.85,
                color: "hsl(var(--stone) / 0.62)",
                fontWeight: 300,
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

/* ---------- SELECTED PROJECTS ---------- */
const SelectedProjects = () => (
  <section className={sectionPad} style={{ backgroundColor: "hsl(var(--stone))" }}>
    <div className="container-editorial">
      <div className="max-w-2xl reveal">
        <SectionEyebrow>Selected Work</SectionEyebrow>
        <h2
          className="font-display font-light mt-8 text-ink"
          style={{
            fontSize: "clamp(2.2rem, 4.5vw, 3.625rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
          }}
        >
          Every project is a choice.
        </h2>
        <p
          className="mt-8"
          style={{
            fontSize: "17px",
            lineHeight: 1.8,
            color: "hsl(var(--terre))",
            fontWeight: 300,
            maxWidth: "520px",
          }}
        >
          We work with a limited number of mandates at any time. Not as a
          restriction — as a commitment. Each project receives the full
          attention of the practice, from the first site visit to the moment we
          hand back the keys.
        </p>
      </div>

      <div className="mt-20 md:mt-28 grid md:grid-cols-2 gap-x-10 gap-y-20">
        {parisProjects.map((p) => (
          <Link
            to={`/projects/${p.slug}`}
            key={p.slug}
            className="group reveal block"
          >
            <div className="image-frame" style={{ aspectRatio: "4 / 3" }}>
              <img
                src={p.hero}
                alt={p.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="mt-6">
              <p
                className="text-[10px] uppercase"
                style={{ letterSpacing: "0.15em", color: "hsl(var(--terre))" }}
              >
                PARIS · {p.num}TH ARRONDISSEMENT · 2024
              </p>
              <h3
                className="font-display font-light text-ink mt-3"
                style={{ fontSize: "22px", lineHeight: 1.25, letterSpacing: "-0.015em" }}
              >
                {p.title} — Complete Transformation
              </h3>
              <p
                className="mt-2"
                style={{ fontSize: "14px", color: "hsl(var(--terre))", fontWeight: 300 }}
              >
                Acquisition advisory · Architectural renovation
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-20 text-center">
        <Link
          to="/projects"
          className="text-[11px] uppercase border-b pb-1 transition-colors duration-300"
          style={{
            letterSpacing: "0.15em",
            color: "hsl(var(--accent))",
            borderColor: "hsl(var(--accent))",
          }}
        >
          View all projects →
        </Link>
      </div>
    </div>
  </section>
);

/* ---------- EDITORIAL QUOTE ---------- */
const EditorialQuote = () => (
  <section className={sectionPad} style={{ backgroundColor: "hsl(var(--stone-alt))" }}>
    <div className="container-editorial text-center reveal">
      <blockquote
        className="font-display italic font-light mx-auto text-ink"
        style={{
          fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
          lineHeight: 1.45,
          letterSpacing: "-0.015em",
          maxWidth: "760px",
        }}
      >
        “The most important decisions about a property are not made during the
        renovation. They are made before the first visit — and they continue to
        be made long after the last coat of paint.”
      </blockquote>
      <p
        className="mt-12 text-[10px] uppercase"
        style={{
          letterSpacing: "0.15em",
          color: "hsl(var(--terre))",
          textAlign: "right",
          maxWidth: "760px",
          margin: "48px auto 0",
        }}
      >
        NEOVA · PARIS
      </p>
    </div>
  </section>
);

/* ---------- ABOUT ---------- */
const About = () => (
  <section className={sectionPad} style={{ backgroundColor: "hsl(var(--stone))" }}>
    <div className="container-editorial">
      <div className="grid md:grid-cols-12 gap-12 md:gap-20 items-start">
        <div className="md:col-span-5 reveal">
          <div
            className="w-full"
            style={{
              aspectRatio: "4 / 5",
              backgroundColor: "hsl(var(--stone-alt))",
            }}
          />
        </div>

        <div className="md:col-span-7 reveal">
          <SectionEyebrow>About the Practice</SectionEyebrow>
          <h2
            className="font-display font-light mt-8 text-ink"
            style={{
              fontSize: "clamp(2rem, 3.6vw, 2.5rem)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            Built in Paris. Built for the long term.
          </h2>
          <div
            className="mt-10 space-y-6 text-ink"
            style={{ fontSize: "17px", lineHeight: 1.85, fontWeight: 300 }}
          >
            <p>
              NEOVA began with a clear question: what would a property practice
              look like if it were built entirely around the owner&apos;s
              interest — not the transaction, not the contract, not the
              individual project?
            </p>
            <p>
              The answer is a practice that moves with the asset rather than
              within it. One that understands acquisition through the lens of
              transformation. One that does not consider a project complete when
              the works are finished.
            </p>
            <p>
              We are a small team with deep roots in Paris — in its
              architecture, its property market, its artisans, and its
              particular sense of what quality means. We are selective about the
              work we take on because we are accountable for the outcome of
              every mandate we accept.
            </p>
          </div>

          <div
            className="mt-12 text-[11px] uppercase space-y-2"
            style={{ letterSpacing: "0.12em", color: "hsl(var(--terre))", lineHeight: 2.4 }}
          >
            <p>Established · Paris</p>
            <p>Languages · French · English</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ---------- CONTACT ---------- */
const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  organisation: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.string().trim().email().max(255),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  project: z.string().trim().min(10).max(2000),
  timeline: z.string().trim().max(60),
});

const Field = ({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const floating = focused || value.length > 0;
  return (
    <label className="block relative pt-6">
      <span
        className="absolute left-0 text-[10px] uppercase transition-all duration-300 pointer-events-none"
        style={{
          letterSpacing: "0.15em",
          color: focused ? "hsl(var(--accent))" : "hsl(var(--stone) / 0.45)",
          transform: floating ? "translateY(0)" : "translateY(28px)",
          opacity: floating ? 1 : 0,
        }}
      >
        {label}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={focused ? placeholder : floating ? "" : label}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full bg-transparent py-3 text-[16px] outline-none transition-all duration-300"
        style={{
          color: "hsl(var(--stone))",
          borderBottom: focused
            ? "1px solid hsl(var(--accent))"
            : "1px solid hsl(var(--stone) / 0.18)",
          fontWeight: 300,
        }}
      />
    </label>
  );
};

const Contact = () => {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      toast.error("Please complete the required fields.");
      return;
    }
    setSubmitting(true);
    const id = crypto.randomUUID();
    sendAdminNotification({
      idempotencyKey: `home-contact-${id}`,
      eventTitle: "New enquiry from the website",
      summary: `${data.name} sent an enquiry via the homepage.`,
      details: [
        { label: "Name", value: data.name },
        { label: "Organisation", value: data.organisation || "" },
        { label: "Email", value: data.email },
        { label: "Location", value: data.location || "" },
        { label: "Project", value: data.project },
        { label: "Timeline", value: data.timeline },
      ],
      ctaNote: `Reply directly to ${data.email}.`,
    });
    setTimeout(() => {
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Thank you. We will be in touch within 24 hours.");
    }, 600);
  };

  return (
    <section className={sectionPad} style={{ backgroundColor: "hsl(var(--navy))" }}>
      <div className="container-editorial">
        <div className="grid md:grid-cols-12 gap-12 md:gap-20">
          <div className="md:col-span-5 reveal">
            <SectionEyebrow>Get in Touch</SectionEyebrow>
            <h2
              className="font-display font-light text-stone mt-8"
              style={{
                fontSize: "clamp(2.2rem, 4.5vw, 3.125rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.025em",
              }}
            >
              Every conversation begins here.
            </h2>
            <p
              className="mt-8"
              style={{
                fontSize: "16px",
                lineHeight: 1.8,
                color: "hsl(var(--stone) / 0.62)",
                fontWeight: 300,
              }}
            >
              We respond to every enquiry personally, and within 24 hours. We
              will never send you a proposal before we understand what you are
              trying to achieve.
            </p>

            <div
              className="mt-12 text-[11px] uppercase"
              style={{
                letterSpacing: "0.12em",
                color: "hsl(var(--stone) / 0.38)",
                lineHeight: 2.2,
              }}
            >
              <p>78 Av. des Champs-Élysées</p>
              <p>75008 Paris · France</p>
              <p className="mt-3">
                <a href="mailto:info@neovaspace.com" className="hover:text-accent transition-colors">
                  info@neovaspace.com
                </a>
              </p>
            </div>

            <p
              className="mt-10 italic"
              style={{
                fontSize: "13px",
                color: "hsl(var(--stone) / 0.28)",
                fontWeight: 300,
              }}
            >
              All correspondence is treated with complete discretion.
            </p>
          </div>

          <form onSubmit={onSubmit} className="md:col-span-7 reveal space-y-2">
            <Field label="Your name" name="name" required />
            <Field label="Your organisation" name="organisation" placeholder="Optional" />
            <Field label="Your email" name="email" type="email" required />
            <Field label="Your location" name="location" />

            <label className="block relative pt-6">
              <span
                className="block text-[10px] uppercase mb-3"
                style={{ letterSpacing: "0.15em", color: "hsl(var(--stone) / 0.45)" }}
              >
                Your project
              </span>
              <textarea
                name="project"
                rows={4}
                required
                placeholder="Tell us about the property or situation you are working with. There is no wrong place to start."
                className="w-full bg-transparent py-3 text-[16px] outline-none resize-none transition-all duration-300"
                style={{
                  color: "hsl(var(--stone))",
                  borderBottom: "1px solid hsl(var(--stone) / 0.18)",
                  fontWeight: 300,
                }}
                onFocus={(e) => (e.currentTarget.style.borderBottom = "1px solid hsl(var(--accent))")}
                onBlur={(e) => (e.currentTarget.style.borderBottom = "1px solid hsl(var(--stone) / 0.18)")}
              />
            </label>

            <label className="block relative pt-6">
              <span
                className="block text-[10px] uppercase mb-3"
                style={{ letterSpacing: "0.15em", color: "hsl(var(--stone) / 0.45)" }}
              >
                Your timeline
              </span>
              <select
                name="timeline"
                defaultValue="Exploring"
                className="w-full bg-transparent py-3 text-[16px] outline-none transition-all duration-300 appearance-none"
                style={{
                  color: "hsl(var(--stone))",
                  borderBottom: "1px solid hsl(var(--stone) / 0.18)",
                  fontWeight: 300,
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23C4A882' stroke-width='1'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 4px center",
                }}
              >
                {["Now", "Within 6 months", "Within a year", "Exploring"].map((o) => (
                  <option key={o} value={o} style={{ backgroundColor: "hsl(var(--navy))" }}>
                    {o}
                  </option>
                ))}
              </select>
            </label>

            <div className="pt-10 flex md:justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto inline-flex items-center justify-center px-10 py-[14px] text-[11px] uppercase transition-all duration-300 disabled:opacity-50"
                style={{
                  backgroundColor: "hsl(var(--accent))",
                  color: "hsl(var(--navy))",
                  letterSpacing: "0.15em",
                  borderRadius: "2px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--accent-hover))")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--accent))")}
              >
                {submitting ? "Sending…" : "Send Enquiry"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

/* ---------- PAGE ---------- */
const Index = () => {
  useEffect(() => {
    document.documentElement.lang = "en";
  }, []);

  return (
    <SiteShell>
      <Seo
        title="NEOVA — Private Real Estate Practice · Paris"
        description="NEOVA is a private practice for the full lifecycle of exceptional Parisian properties. Acquisition, transformation, execution, and long-term stewardship — one practice, one standard."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "NEOVA",
          url: "https://neovaspace.com/",
          address: {
            "@type": "PostalAddress",
            streetAddress: "78 Av. des Champs-Élysées",
            addressLocality: "Paris",
            postalCode: "75008",
            addressCountry: "FR",
          },
        }}
      />
      <Hero />
      <ThePractice />
      <Lifecycle />
      <SelectedProjects />
      <EditorialQuote />
      <About />
      <Contact />
    </SiteShell>
  );
};

export default Index;