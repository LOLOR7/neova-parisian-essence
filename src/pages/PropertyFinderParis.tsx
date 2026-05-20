import { Link } from "react-router-dom";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { Seo } from "@/components/site/Seo";

const faqs = [
  {
    q: "What does a property finder in Paris actually do?",
    a: "A property finder represents the buyer exclusively — sourcing properties (including off-market), shortlisting, visiting, negotiating, and coordinating the acquisition. Unlike an estate agent, we never act for the seller.",
  },
  {
    q: "Do you work with international buyers?",
    a: "Yes. A large part of our clients are based in London, Geneva, New York, Dubai, Singapore or Hong Kong. We coordinate everything remotely — video tours, notary, banking, renovation — so the acquisition happens without a single unnecessary trip to Paris.",
  },
  {
    q: "What is your fee model?",
    a: "A success fee, calculated as a percentage of the acquisition price, payable only when the deed of sale is signed. The fee is agreed upfront in a buyer-mandate. No retainer for standard searches.",
  },
  {
    q: "How long does a typical search take?",
    a: "Between 6 and 16 weeks for a focused brief. Off-market searches and very specific criteria (haussmannien with view, mansion-style hôtel particulier, double living, etc.) can take longer.",
  },
  {
    q: "Can you handle renovation after purchase?",
    a: "Yes. Neova is one of the few firms in Paris that pairs property search with full renovation and interior architecture — one team, one contract, one delivery date.",
  },
];

const PropertyFinderParis = () => {
  return (
    <SiteShell>
      <Seo
        title="Property Finder in Paris — Discreet acquisition for international buyers | Neova"
        description="Neova is a Paris-based property finder for international buyers. Off-market access, discreet sourcing, negotiation and renovation across the 6e, 7e, 8e and 16e."
        path="/property-finder-paris"
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            serviceType: "Property finder",
            areaServed: { "@type": "City", name: "Paris" },
            provider: {
              "@type": "Organization",
              name: "Neova",
              url: "https://www.neovaspace.com",
              address: {
                "@type": "PostalAddress",
                streetAddress: "78 Av. des Champs-Élysées",
                postalCode: "75008",
                addressLocality: "Paris",
                addressCountry: "FR",
              },
            },
            url: "https://www.neovaspace.com/property-finder-paris",
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://www.neovaspace.com/" },
              {
                "@type": "ListItem",
                position: 2,
                name: "Property Finder Paris",
                item: "https://www.neovaspace.com/property-finder-paris",
              },
            ],
          },
        ]}
      />

      <PageHero
        eyebrow="Neova — Property Finder"
        index="IX"
        title={
          <>
            Property Finder<br />
            <em className="display-italic">in Paris.</em>
          </>
        }
        intro="Discreet acquisition of Parisian apartments for international buyers — off-market access, negotiation, renovation."
      />

      <Section>
        <div className="max-w-2xl mx-auto">
          <p className="eyebrow mb-6">Buyer-side only</p>
          <p className="body-lg mb-7 reveal">
            Neova works exclusively for the buyer. We never represent the seller and never collect a commission from them.
            Our role is to source the right property, anticipate the pitfalls of the Parisian market, and negotiate the
            most favourable conditions on your behalf.
          </p>
          <p className="body-lg mb-7 reveal">
            A significant share of the most desirable apartments in central Paris never reach the public portals.
            They circulate within a confidential network of private brokers, notaries, syndics and family offices —
            the network we have spent years building.
          </p>
        </div>
      </Section>

      <Section className="bg-bone">
        <p className="eyebrow mb-10">Who we work with</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
          {[
            ["International executives", "Relocating to Paris for work, family, or a secondary residence — full remote coordination."],
            ["Investors", "Pied-à-terre, yield-driven acquisitions, value-add renovation projects in prime arrondissements."],
            ["Family offices", "Hôtels particuliers, trophy assets and discreet, off-market transactions handled with full confidentiality."],
          ].map(([h, p]) => (
            <div key={h} className="reveal">
              <h3 className="font-display text-xl mb-3">{h}</h3>
              <p className="text-slate-soft leading-relaxed">{p}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="max-w-3xl">
          <p className="eyebrow mb-6">Our process</p>
          <div className="space-y-8">
            {[
              ["01", "Brief", "A working session to define the property, the lifestyle, the budget and the timeline."],
              ["02", "Sourcing", "On-market scan + activation of our off-market network across the 6e, 7e, 8e, 16e and beyond."],
              ["03", "Shortlist", "Pre-visits by our team. You only see properties that genuinely match the brief."],
              ["04", "Negotiation", "Price, conditions, suspensive clauses, calendar — handled with the seller or their broker."],
              ["05", "Acquisition", "Coordination with the notary, the bank and, when needed, the tax advisor."],
              ["06", "Renovation", "Optional — Neova takes the keys, redesigns, renovates and delivers a turnkey apartment."],
            ].map(([n, h, p]) => (
              <div key={n} className="grid grid-cols-[60px_140px_1fr] gap-6 reveal pb-6 border-b border-hairline">
                <p className="numeral text-xs tracking-[0.2em] text-muted-foreground">{n}</p>
                <p className="font-display text-lg">{h}</p>
                <p className="text-slate-soft leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="bg-bone">
        <p className="eyebrow mb-10">Frequently asked questions</p>
        <div className="max-w-3xl space-y-10">
          {faqs.map((f) => (
            <div key={f.q} className="reveal">
              <h3 className="font-display text-xl mb-3">{f.q}</h3>
              <p className="text-slate-soft leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="max-w-3xl">
          <p className="eyebrow mb-6">Start a search</p>
          <p className="body-lg mb-10 reveal">
            Share your brief in confidence. We come back within 48 hours with a first read of the market and the next steps.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/find-your-property" className="btn-line !py-3 !px-5">Start your search</Link>
            <Link to="/about" className="btn-line !py-3 !px-5">About Neova</Link>
          </div>
        </div>
      </Section>
    </SiteShell>
  );
};

export default PropertyFinderParis;