import { Link } from "react-router-dom";

const navItems = [
  { to: "/method", label: "Approach" },
  { to: "/services", label: "Expertise" },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export const Footer = () => {
  return (
    <footer className="bg-neova-dark">
      <div className="container-editorial py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "rgba(244,241,236,0.4)" }}>
          NEOVA · PARIS
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-[10px] uppercase tracking-[0.18em] transition-opacity duration-300 hover:opacity-100"
              style={{ color: "rgba(244,241,236,0.55)" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <a
            href="https://instagram.com/neovaspace"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] uppercase tracking-[0.18em]"
            style={{ color: "rgba(244,241,236,0.55)" }}
          >
            Instagram
          </a>
          <a
            href="https://linkedin.com/company/neovaspace"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] uppercase tracking-[0.18em]"
            style={{ color: "rgba(244,241,236,0.55)" }}
          >
            LinkedIn
          </a>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(244,241,236,0.08)" }}>
        <div className="container-editorial py-5 flex items-center justify-center gap-3">
          <p className="text-[11px] text-center" style={{ color: "rgba(244,241,236,0.3)" }}>
            © {new Date().getFullYear()} Neova Space · All rights reserved · Privacy Policy
          </p>
          <Link
            to="/admin"
            aria-label="Admin"
            title="Admin"
            className="inline-block w-1.5 h-1.5"
            style={{ backgroundColor: "rgba(156,134,90,0.5)" }}
          />
        </div>
      </div>
    </footer>
  );
};
