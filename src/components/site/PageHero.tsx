import { ReactNode } from "react";

export const PageHero = ({
  eyebrow, title, intro, image, index,
}: { eyebrow?: string; title: ReactNode; intro?: ReactNode; image?: string; index?: string }) => (
  <section className="relative pt-32 md:pt-40 pb-20 md:pb-28 overflow-hidden">
    {image && (
      <div className="absolute inset-x-0 top-0 -z-10 h-[80%] reveal-image">
        <img src={image} alt="" className="w-full h-full object-cover opacity-40" loading="eager" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(var(--background) / 0.4) 0%, hsl(var(--background) / 0.92) 70%, hsl(var(--background)) 100%)" }} />
      </div>
    )}
    <div className="container-editorial">
      <div className="flex items-baseline justify-between mb-10 reveal">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : <span />}
        {index && <p className="numeral text-xs tracking-[0.2em] text-muted-foreground">{index}</p>}
      </div>
      <h1 className="display-xl max-w-5xl text-balance reveal">{title}</h1>
      {intro && <div className="mt-12 max-w-2xl body-lg reveal">{intro}</div>}
    </div>
  </section>
);
