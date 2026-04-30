import { ReactNode } from "react";
export const Section = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <section className={`py-24 md:py-36 ${className}`}>
    <div className="container-editorial">{children}</div>
  </section>
);
