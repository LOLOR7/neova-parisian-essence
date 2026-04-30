import { Link } from "react-router-dom";
import { Logo } from "@/components/site/Logo";

export const Footer = () => (
  <footer className="border-t border-hairline mt-32">
    <div className="container-narrow py-20 grid gap-12 md:grid-cols-4">
      <div className="md:col-span-2">
        <Logo />
        <p className="mt-8 max-w-sm text-sm text-muted-foreground leading-relaxed">
          Neova accompagne la rénovation et la valorisation d'appartements parisiens haut de gamme — de l'acquisition à la gestion long terme.
        </p>
      </div>

      <div>
        <p className="eyebrow mb-5">Navigation</p>
        <ul className="space-y-3 text-sm">
          <li><Link className="link-underline text-muted-foreground hover:text-foreground" to="/a-propos">À propos</Link></li>
          <li><Link className="link-underline text-muted-foreground hover:text-foreground" to="/services">Services</Link></li>
          <li><Link className="link-underline text-muted-foreground hover:text-foreground" to="/methode">Méthode</Link></li>
          <li><Link className="link-underline text-muted-foreground hover:text-foreground" to="/projets">Projets</Link></li>
          <li><Link className="link-underline text-muted-foreground hover:text-foreground" to="/recherche-de-bien">Recherche de bien</Link></li>
        </ul>
      </div>

      <div>
        <p className="eyebrow mb-5">Contact</p>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li>78 Av. des Champs-Élysées<br/>75008 Paris</li>
          <li><a className="link-underline hover:text-foreground" href="mailto:christian@neovaspace.com">christian@neovaspace.com</a></li>
          <li><a className="link-underline hover:text-foreground" href="tel:+33744990607">+33 7 44 99 06 07</a></li>
          <li><a className="link-underline hover:text-foreground" href="https://instagram.com/neovaspace" target="_blank" rel="noreferrer">@neovaspace</a></li>
        </ul>
      </div>
    </div>

    <div className="border-t border-hairline">
      <div className="container-narrow py-6 flex flex-col md:flex-row justify-between gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <p>© {new Date().getFullYear()} Neova — Paris</p>
        <p>Mentions légales · Politique de confidentialité</p>
      </div>
    </div>
  </footer>
);
