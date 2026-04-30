import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { useI18n } from "@/i18n/I18nProvider";
import moulding from "@/assets/detail-moulding.jpg";
import rooftops from "@/assets/paris-rooftops.jpg";
import before1 from "@/assets/before-1.jpg";
import after1 from "@/assets/after-1.jpg";
import { projects } from "@/data/projects";

const Index = () => {
  const { t, lang } = useI18n();
  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative h-[calc(100svh-72px)] md:h-[calc(100svh-84px)] min-h-[560px] flex items-end overflow-hidden bg-foreground">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster=""
        >
          <source src="/hero-renovation.mp4" type="video/mp4" />
        </video>
        {/* Subtle readability overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-foreground/15 to-foreground/10" />
        <div className="container-editorial relative pb-16 md:pb-24 text-background">
          <p className="eyebrow !text-background/85 mb-6 md:mb-8 animate-fade-in">
            {t.common.eyebrow.studio}
          </p>
          <h1 className="display-xl max-w-5xl text-background animate-fade-up text-balance">
            {t.home.heroTitle.l1}<br/><em className="display-italic">{t.home.heroTitle.l2}</em>
          </h1>
          <p className="mt-8 md:mt-10 max-w-xl text-background/90 text-[15px] md:text-[17px] leading-[1.75] animate-fade-up" style={{ animationDelay: "0.2s" }}>
            {t.home.heroIntro}
          </p>
          <div className="mt-10 md:mt-12 flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <Link to="/contact" className="btn-line-light">Démarrer un projet</Link>
            <Link to="/projects" className="btn-line-light">Découvrir nos réalisations</Link>
          </div>
        </div>
      </section>

      {/* BRAND STATEMENT — asymmetric */}
      <section className="py-32 md:py-48">
        <div className="container-editorial grid md:grid-cols-12 gap-x-12 gap-y-16 items-end">
          <div className="md:col-span-5 md:col-start-1 reveal-image">
            <img src={moulding} alt="Haussmannian rosette detail" loading="lazy" className="w-full h-auto" />
          </div>
          <div className="md:col-span-6 md:col-start-7 md:pb-8 reveal">
            <span className="brass-rule mb-8" />
            <h2 className="display-lg text-balance">
              {t.home.brandTitle.l1}<br/><em className="display-italic">{t.home.brandTitle.l2}</em>
            </h2>
            <p className="mt-10 max-w-md body-lg">{t.home.brandText}</p>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24 md:py-32 border-t border-hairline">
        <div className="container-editorial">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20 reveal">
            <div>
              <p className="eyebrow mb-5">{t.common.eyebrow.services}</p>
              <h2 className="display-lg">{t.home.servicesTitle}</h2>
            </div>
            <Link to="/services" className="text-[10.5px] uppercase tracking-[0.28em] link-underline">{t.common.cta.allServices} →</Link>
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-10">
            {t.home.services.map((s, i) => (
              <li key={s} className="reveal border-t border-hairline py-7 flex items-baseline justify-between gap-4 text-[15px]" style={{ transitionDelay: `${i * 60}ms` }}>
                <span className="text-pretty">{s}</span>
                <span className="numeral text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* METHOD */}
      <section className="py-32 md:py-44 bg-bone">
        <div className="container-editorial">
          <div className="max-w-2xl mb-20 reveal">
            <p className="eyebrow mb-5">{t.common.eyebrow.method}</p>
            <h2 className="display-lg">{t.home.methodTitle}</h2>
          </div>
          <ol className="grid md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-4">
            {t.home.steps.map((s, i) => (
              <li key={s} className="reveal border-t border-foreground/70 pt-6" style={{ transitionDelay: `${i * 80}ms` }}>
                <p className="numeral text-3xl">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-4 text-[14px] leading-relaxed">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="py-32 md:py-44">
        <div className="container-editorial">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20 reveal">
            <div>
              <p className="eyebrow mb-5">{t.common.eyebrow.projects}</p>
              <h2 className="display-lg">{t.home.projectsTitle}</h2>
            </div>
            <Link to="/projects" className="text-[10.5px] uppercase tracking-[0.28em] link-underline">{t.common.cta.all} →</Link>
          </div>
          <div className="grid md:grid-cols-12 gap-x-8 gap-y-24">
            {projects.slice(0, 4).map((p, i) => (
              <Link
                key={p.slug}
                to={`/projects/${p.slug}`}
                className={`group reveal ${
                  i === 0 ? "md:col-span-7" :
                  i === 1 ? "md:col-span-5 md:mt-32" :
                  i === 2 ? "md:col-span-5" :
                  "md:col-span-7 md:mt-16"
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="image-frame aspect-[4/5]">
                  <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="mt-6 flex justify-between items-start">
                  <div>
                    <p className="numeral text-xs text-muted-foreground">{p.index}</p>
                    <p className="font-display text-2xl mt-1">{p.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground mt-3">{p.location[lang]} · {p.surface}</p>
                  </div>
                  <ArrowUpRight size={18} strokeWidth={1.2} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-700" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="py-32 md:py-44 border-t border-hairline">
        <div className="container-editorial">
          <div className="max-w-2xl mb-20 reveal">
            <p className="eyebrow mb-5">{t.common.eyebrow.beforeAfter}</p>
            <h2 className="display-lg text-balance">
              {t.home.baTitle.l1}<br/><em className="display-italic">{t.home.baTitle.l2}</em>
            </h2>
          </div>
          <div className="grid md:grid-cols-12 gap-4 md:gap-6">
            <figure className="relative md:col-span-6 reveal-image">
              <img src={before1} alt="Before renovation" loading="lazy" className="w-full aspect-[4/3] object-cover" />
              <figcaption className="absolute top-5 left-5 text-[10px] uppercase tracking-[0.3em] bg-background/90 px-3 py-2">{t.common.labels.before}</figcaption>
            </figure>
            <figure className="relative md:col-span-6 md:mt-16 reveal-image">
              <img src={after1} alt="After renovation" loading="lazy" className="w-full aspect-[4/3] object-cover" />
              <figcaption className="absolute top-5 left-5 text-[10px] uppercase tracking-[0.3em] bg-foreground text-background px-3 py-2">{t.common.labels.after}</figcaption>
            </figure>
          </div>
          <div className="mt-14 reveal">
            <Link to="/before-after" className="text-[10.5px] uppercase tracking-[0.28em] link-underline">{t.common.cta.viewGallery} →</Link>
          </div>
        </div>
      </section>

      {/* FIND PROPERTY */}
      <section className="relative py-32 md:py-44 overflow-hidden border-t border-hairline">
        <img src={rooftops} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-background/75" />
        <div className="container-editorial relative grid md:grid-cols-12 gap-10">
          <div className="md:col-span-8 reveal">
            <p className="eyebrow mb-5">{t.common.eyebrow.findProperty}</p>
            <h2 className="display-lg text-balance">
              {t.home.findTitle.l1}<br/><em className="display-italic">{t.home.findTitle.l2}</em>
            </h2>
            <p className="mt-10 max-w-xl body-lg">{t.home.findText}</p>
            <div className="mt-12">
              <Link to="/find-your-property" className="btn-solid">{t.common.cta.findProperty}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-36 md:py-52 bg-foreground text-background">
        <div className="container-editorial text-center reveal">
          <p className="eyebrow !text-background/60 mb-8">{t.common.eyebrow.begin}</p>
          <h2 className="display-xl text-background max-w-3xl mx-auto text-balance">{t.home.finalTitle}</h2>
          <p className="mt-10 max-w-xl mx-auto text-background/75 leading-[1.75]">{t.home.finalText}</p>
          <div className="mt-14 flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn-line-light">{t.common.cta.start}</Link>
            <Link to="/contact" className="btn-line-light">{t.common.cta.contact}</Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
};

export default Index;
