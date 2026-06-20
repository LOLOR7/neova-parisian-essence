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
    { to: "/before-after", label: t.nav.projects },
    { to: "/find-your-property", label: t.nav.findProperty },
    { to: "/contact", label: t.nav.contact },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
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

  // Routes whose hero is dark — header should be transparent at top and turn white on scroll
  const darkHeroRoutes = ["/", "/before-after"];
  const hasDarkHero = darkHeroRoutes.includes(pathname);
  const isTransparent = hasDarkHero && !scrolled && !open;

  return (
    <>
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
        isTransparent
          ? "bg-transparent border-b border-transparent"
          : "bg-background/95 backdrop-blur-md border-b border-hairline"
      }`}
    >
      <div className="container-editorial flex items-center justify-between h-[72px] md:h-[84px]">
        <Logo inverted={isTransparent} />

        <nav className="hidden md:flex items-center gap-6 lg:gap-9">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `text-[10.5px] uppercase tracking-[0.28em] transition-colors duration-500 link-underline ${
                  isTransparent
                    ? "text-background/85 hover:text-background"
                    : isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div
          className={`hidden md:flex items-center gap-6 lg:gap-8 transition-colors duration-500 ${
            isTransparent ? "text-background" : "text-foreground"
          }`}
        >
          <LangSwitcher />
          <Link
            to="/find-your-property"
            className={`${isTransparent ? "btn-line-light" : "btn-line"} !py-3 !px-5`}
          >
            {t.nav.cta}
          </Link>
        </div>

        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className={`md:hidden p-2 relative z-[60] transition-colors duration-500 ${
            isTransparent && !open ? "text-background" : "text-foreground"
          }`}
        >
          {open ? <X size={20} strokeWidth={1.4} /> : <Menu size={20} strokeWidth={1.4} />}
        </button>
      </div>
    </header>

    {/* Mobile fullscreen menu */}
    <div
      className={`md:hidden fixed inset-0 z-50 bg-background transition-opacity duration-300 ${
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
