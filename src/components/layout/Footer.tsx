import { Link } from "react-router-dom";
import { Instagram, Linkedin } from "lucide-react";

const navLinks = [
  { to: "/method", label: "Approach" },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export const Footer = () => {
  return (
    <footer style={{ backgroundColor: "hsl(var(--navy))" }} className="text-stone">
      <div
        className="container-editorial pt-12 pb-10"
        style={{ borderTop: "1px solid hsl(var(--accent) / 0.15)" }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="flex flex-col gap-2">
            <span
              className="text-[11px] uppercase"
              style={{ color: "hsl(var(--stone) / 0.3)", letterSpacing: "0.2em" }}
            >
              NEOVA · PARIS
            </span>
            <span
              className="text-[10px] uppercase"
              style={{ color: "hsl(var(--stone) / 0.25)", letterSpacing: "0.15em" }}
            >
              Paris · Property · Practice
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-[10px] uppercase transition-colors duration-300 hover:text-accent"
                style={{ color: "hsl(var(--stone) / 0.25)", letterSpacing: "0.12em" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <a
              href="https://instagram.com/neovaspace"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="transition-colors duration-300 hover:text-accent"
              style={{ color: "hsl(var(--stone) / 0.3)" }}
            >
              <Instagram size={16} strokeWidth={1.2} />
            </a>
            <a
              href="https://www.linkedin.com/company/neovaspace"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="transition-colors duration-300 hover:text-accent"
              style={{ color: "hsl(var(--stone) / 0.3)" }}
            >
              <Linkedin size={16} strokeWidth={1.2} />
            </a>
          </div>
        </div>

        <p
          className="mt-10 text-center text-[11px]"
          style={{ color: "hsl(var(--stone) / 0.18)" }}
        >
          © {new Date().getFullYear()} Neova Space · Paris · All rights reserved ·{" "}
          <Link to="/admin" className="hover:text-accent transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </footer>
  );
};