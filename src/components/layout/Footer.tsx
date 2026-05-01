import { Link } from "react-router-dom";
import { Logo } from "@/components/site/Logo";
import { LangSwitcher } from "@/components/site/LangSwitcher";
import { useI18n } from "@/i18n/I18nProvider";

export const Footer = () => {
  const { t } = useI18n();
  return (
    <footer className="border-t border-hairline mt-32 md:mt-40">
      <div className="container-editorial py-20 md:py-28 grid gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-10 max-w-md text-[15px] leading-[1.8] text-slate-soft">
            {t.common.footer.tagline}
          </p>
          <div className="mt-10"><LangSwitcher /></div>
        </div>

        <div className="md:col-span-3 md:col-start-7">
          <p className="eyebrow mb-6">{t.common.footer.nav}</p>
          <ul className="space-y-4 text-sm">
            <li><Link className="link-underline text-slate-soft hover:text-foreground" to="/about">{t.nav.about}</Link></li>
            <li><Link className="link-underline text-slate-soft hover:text-foreground" to="/services">{t.nav.services}</Link></li>
            <li><Link className="link-underline text-slate-soft hover:text-foreground" to="/method">{t.nav.method}</Link></li>
            <li><Link className="link-underline text-slate-soft hover:text-foreground" to="/projects">{t.nav.projects}</Link></li>
            <li><Link className="link-underline text-slate-soft hover:text-foreground" to="/find-your-property">{t.nav.findProperty}</Link></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="eyebrow mb-6">{t.common.footer.contact}</p>
          <ul className="space-y-4 text-sm text-slate-soft leading-relaxed">
            <li>78 Av. des Champs-Élysées<br/>75008 Paris</li>
            <li><a className="link-underline hover:text-foreground" href="mailto:info@neovaspace.com">info@neovaspace.com</a></li>
            <li><a className="link-underline hover:text-foreground" href="https://instagram.com/neovaspace" target="_blank" rel="noreferrer">@neovaspace</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="container-editorial py-6 flex flex-col md:flex-row justify-between gap-3 text-[10.5px] uppercase tracking-[0.28em] text-muted-foreground">
          <p className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Neova — Paris</span>
            <Link
              to="/admin"
              aria-label="Espace admin"
              title="Espace admin"
              className="inline-block w-2 h-2 bg-[hsl(215_85%_55%)] hover:bg-[hsl(215_95%_60%)] transition-colors"
            />
          </p>
          <p>{t.common.footer.legal}</p>
        </div>
      </div>
    </footer>
  );
};
