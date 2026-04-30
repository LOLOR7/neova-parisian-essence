import { ReactNode } from "react";

export const Section = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <section className={`py-20 md:py-32 ${className}`}>
    <div className="container-narrow">{children}</div>
  </section>
);
