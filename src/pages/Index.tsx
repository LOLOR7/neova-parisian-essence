import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import hero from "@/assets/hero-paris.jpg";
import moulding from "@/assets/detail-moulding.jpg";
import rooftops from "@/assets/paris-rooftops.jpg";
import before1 from "@/assets/before-1.jpg";
import after1 from "@/assets/after-1.jpg";
import { projects } from "@/data/projects";

const services = [
  "Rénovation complète",
  "Conduite de chantier",
  "Coordination architecture intérieure",
  "Lots techniques",
  "Menuiserie sur mesure",
  "Éclairage & systèmes intelligents",
  "Finitions & matériaux",
  "Gestion de patrimoine",
];

const steps = [
  { n: "01", t: "Visite initiale" },
  { n: "02", t: "Plans & devis détaillé" },
  { n: "03", t: "Planification" },
  { n: "04", t: "Exécution des travaux" },
  { n: "05", t: "Intégration technique" },
  { n: "06", t: "Finitions & livraison" },
];

const Index = () => (
  <SiteShell>
    {/* HERO */}
    <section className="relative -mt-20 md:-mt-24 h-[100svh] min-h-[640px] flex items-end overflow-hidden">
      <img src={hero} alt="Appartement haussmannien parisien rénové par Neova" className="absolute inset-0 w-full h-full object-cover animate-slow-zoom" width={1920} height={1280} />
      <div className="absolute inset-0" style={{ background: "var(--gradient-overlay)" }} />
      <div className="container-narrow relative pb-20 md:pb-28 text-background">
        <p className="eyebrow text-background/80 mb-6 animate-fade-in">Neova — Paris</p>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1.05] max-w-4xl animate-fade-up">
          Rénovations parisiennes,<br/>menées avec clarté et maîtrise.
        </h1>
        <p className="mt-8 max-w-xl text-background/85 text-base md:text-lg leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
          De l'acquisition à la rénovation et la gestion long terme, Neova assure continuité et précision à chaque étape.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "0.35s" }}>
          <Link to="/contact" className="text-[11px] uppercase tracking-[0.22em] bg-background text-foreground px-7 py-4 hover:opacity-90 transition-opacity">
            Démarrer votre projet
          </Link>
          <Link to="/projets" className="text-[11px] uppercase tracking-[0.22em] border border-background/80 px-7 py-4 hover:bg-background hover:text-foreground transition-colors">
            Voir nos réalisations
          </Link>
        </div>
      </div>
    </section>

    {/* BRAND STATEMENT */}
    <section className="py-28 md:py-44">
      <div className="container-narrow grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-5 reveal">
          <img src={moulding} alt="Détail d'une rosace haussmannienne" loading="lazy" className="w-full h-auto" />
        </div>
        <div className="md:col-span-7 md:pl-12 reveal">
          <p className="eyebrow mb-6">Notre conviction</p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight">
            Chaque appartement parisien porte une histoire.
          </h2>
          <p className="mt-8 max-w-xl text-muted-foreground leading-relaxed">
            Notre rôle est de la comprendre, de clarifier l'espace et de mener une rénovation cohérente, fonctionnelle et durable.
          </p>
        </div>
      </div>
    </section>

    {/* SERVICES PREVIEW */}
    <section className="py-24 md:py-32 bg-secondary/40 border-y border-hairline">
      <div className="container-narrow">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 reveal">
          <div>
            <p className="eyebrow mb-4">Services</p>
            <h2 className="font-display text-3xl md:text-5xl">Un accompagnement intégral</h2>
          </div>
          <Link to="/services" className="text-[11px] uppercase tracking-[0.22em] link-underline">Tous les services →</Link>
        </div>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
          {services.map((s, i) => (
            <li key={s} className="reveal border-t border-hairline py-6 flex items-center justify-between text-sm" style={{ transitionDelay: `${i * 40}ms` }}>
              <span>{s}</span>
              <span className="font-display text-muted-foreground text-xs">0{i + 1}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>

    {/* METHOD PREVIEW */}
    <section className="py-28 md:py-40">
      <div className="container-narrow">
        <div className="max-w-2xl mb-16 reveal">
          <p className="eyebrow mb-4">Méthode</p>
          <h2 className="font-display text-3xl md:text-5xl">Un processus clair et maîtrisé</h2>
        </div>
        <ol className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-3">
          {steps.map((s, i) => (
            <li key={s.n} className="reveal border-t border-foreground/80 pt-6" style={{ transitionDelay: `${i * 60}ms` }}>
              <p className="font-display text-3xl text-foreground">{s.n}</p>
              <p className="mt-3 text-sm">{s.t}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>

    {/* PROJECTS */}
    <section className="py-24 md:py-32 bg-secondary/40 border-y border-hairline">
      <div className="container-narrow">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 reveal">
          <div>
            <p className="eyebrow mb-4">Réalisations</p>
            <h2 className="font-display text-3xl md:text-5xl">Sélection de projets parisiens</h2>
          </div>
          <Link to="/projets" className="text-[11px] uppercase tracking-[0.22em] link-underline">Tous les projets →</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-16">
          {projects.slice(0, 4).map((p, i) => (
            <Link key={p.slug} to={`/projets/${p.slug}`} className="group reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="image-hover aspect-[4/5] bg-muted">
                <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div className="mt-5 flex justify-between items-start">
                <div>
                  <p className="font-display text-2xl">{p.name}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-2">{p.location} · {p.surface}</p>
                </div>
                <ArrowUpRight size={18} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* BEFORE/AFTER */}
    <section className="py-28 md:py-40">
      <div className="container-narrow">
        <div className="max-w-2xl mb-16 reveal">
          <p className="eyebrow mb-4">Avant / Après</p>
          <h2 className="font-display text-3xl md:text-5xl">La transformation, révélée avec précision.</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-3 md:gap-6 reveal">
          <figure className="relative">
            <img src={before1} alt="Avant rénovation" loading="lazy" className="w-full aspect-[4/3] object-cover" />
            <figcaption className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.3em] bg-background/90 px-3 py-1.5">Avant</figcaption>
          </figure>
          <figure className="relative">
            <img src={after1} alt="Après rénovation" loading="lazy" className="w-full aspect-[4/3] object-cover" />
            <figcaption className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.3em] bg-foreground text-background px-3 py-1.5">Après</figcaption>
          </figure>
        </div>
        <div className="mt-12 reveal">
          <Link to="/avant-apres" className="text-[11px] uppercase tracking-[0.22em] link-underline">Voir la galerie →</Link>
        </div>
      </div>
    </section>

    {/* FIND YOUR PROPERTY */}
    <section className="relative py-28 md:py-40 overflow-hidden border-t border-hairline">
      <img src={rooftops} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-background/70" />
      <div className="container-narrow relative grid md:grid-cols-12 gap-10">
        <div className="md:col-span-7 reveal">
          <p className="eyebrow mb-4">Recherche de bien</p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight">
            Trouvez le bon bien.<br/>Pas seulement ce qui est disponible.
          </h2>
          <p className="mt-8 max-w-xl text-muted-foreground leading-relaxed">
            Nous partons de votre demande, et activons notre réseau pour identifier — ou construire — la bonne opportunité.
          </p>
          <div className="mt-10">
            <Link to="/recherche-de-bien" className="text-[11px] uppercase tracking-[0.22em] bg-foreground text-background px-7 py-4 hover:opacity-90 transition-opacity">
              Trouver mon bien
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* FINAL CTA */}
    <section className="py-32 md:py-44 bg-foreground text-background">
      <div className="container-narrow text-center reveal">
        <p className="eyebrow text-background/70 mb-6">Commençons</p>
        <h2 className="font-display text-4xl md:text-6xl leading-tight max-w-3xl mx-auto">Commencer dans la clarté.</h2>
        <p className="mt-8 max-w-xl mx-auto text-background/80">
          Parlez-nous de votre appartement, de votre recherche, ou de votre projet de rénovation.
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link to="/contact" className="text-[11px] uppercase tracking-[0.22em] bg-background text-foreground px-7 py-4 hover:opacity-90 transition-opacity">
            Démarrer votre projet
          </Link>
          <Link to="/contact" className="text-[11px] uppercase tracking-[0.22em] border border-background/80 px-7 py-4 hover:bg-background hover:text-foreground transition-colors">
            Nous contacter
          </Link>
        </div>
      </div>
    </section>
  </SiteShell>
);

export default Index;
