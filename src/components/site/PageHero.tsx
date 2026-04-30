import { ReactNode } from "react";

export const PageHero = ({ eyebrow, title, intro, image }: { eyebrow?: string; title: string; intro?: ReactNode; image?: string }) => (
  <section className="relative">
    {image && (
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <img src={image} alt="" className="w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>
    )}
    <div className="container-narrow pt-16 md:pt-28 pb-16 md:pb-24">
      {eyebrow && <p className="eyebrow mb-6 reveal">{eyebrow}</p>}
      <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1.05] max-w-5xl reveal">
        {title}
      </h1>
      {intro && <div className="mt-8 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed reveal">{intro}</div>}
    </div>
    <div className="hairline" />
  </section>
);
