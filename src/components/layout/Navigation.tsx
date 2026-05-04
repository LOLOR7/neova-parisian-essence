import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { LangSwitcher } from "@/components/site/LangSwitcher";
import { useI18n } from "@/i18n/I18nProvider";

export const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { t } = useI18n();

  const links = [
    { to: "/", label: t.nav.home, end: true },
    { to: "/about", label: t.nav.about },
    { to: "/services", label: t.nav.services },
    { to: "/method", label: t.nav.method },
    { to: "/projects", label: t.nav.projects },
    { to: "/before-after", label: t.nav.beforeAfter },
    { to: "/find-your-property", label: t.nav.findProperty },
    { to: "/contact", label: t.nav.contact },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
    <header
      className={`fixed top-0 inset-x-0 z-40 bg-background transition-[border-color,box-shadow] duration-500 ${
        scrolled || open ? "border-b border-hairline" : "border-b border-transparent"
      }`}
    >
      <div className="container-editorial flex items-center justify-between h-[72px] md:h-[84px]">
        <Logo />

        <nav className="hidden 2xl:flex items-center gap-9">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `text-[10.5px] uppercase tracking-[0.28em] transition-colors duration-500 link-underline ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden 2xl:flex items-center gap-8">
          <LangSwitcher />
          <Link to="/find-your-property" className="btn-line !py-3 !px-5">{t.nav.cta}</Link>
        </div>

        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="2xl:hidden text-foreground p-2 relative z-[60]"
        >
          {open ? <X size={20} strokeWidth={1.4} /> : <Menu size={20} strokeWidth={1.4} />}
        </button>
      </div>
    </header>

    {/* Mobile fullscreen menu */}
    <div
      className={`2xl:hidden fixed inset-0 z-50 bg-background transition-opacity duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div className="h-[72px] md:h-[84px]" />
      <div className="h-[calc(100vh-72px)] md:h-[calc(100vh-84px)] overflow-y-auto">
        <nav className="container-editorial py-10 flex flex-col gap-6">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
              onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-base ${isActive ? "text-foreground" : "text-muted-foreground"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="pt-6 border-t border-hairline flex items-center justify-between">
              <LangSwitcher />
            <Link to="/find-your-property" onClick={() => setOpen(false)} className="btn-line !py-3 !px-5">{t.nav.cta}</Link>
            </div>
        </nav>
      </div>
    </div>
    </>
  );
};
