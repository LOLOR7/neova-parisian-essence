import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { LangSwitcher } from "@/components/site/LangSwitcher";

const links = [
  { to: "/method", label: "Approach" },
  { to: "/services", label: "Expertise" },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header
        className="fixed top-0 inset-x-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300"
        style={
          scrolled || open
            ? {
                backgroundColor: open ? "transparent" : "rgba(244,241,236,0.88)",
                backdropFilter: open ? undefined : "blur(12px)",
                borderBottom: open ? "1px solid transparent" : "1px solid hsl(var(--hairline))",
              }
            : { backgroundColor: "transparent", borderBottom: "1px solid transparent" }
        }
      >
        <div className="container-editorial flex items-center justify-between h-[72px] md:h-[84px]">
          <div className="relative z-[60]">
            <Logo inverted={open} />
          </div>

          <nav className="hidden lg:flex items-center gap-9">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 link-underline ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-6">
            <LangSwitcher />
            <Link
              to="/contact"
              className="inline-flex items-center px-5 py-3 text-[11px] uppercase border border-foreground/85 text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background"
              style={{ letterSpacing: "0.15em" }}
            >
              Initiate a Project
            </Link>
          </div>

          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden p-2 relative z-[60]"
            style={{ color: open ? "#F4F1EC" : undefined }}
          >
            {open ? <X size={20} strokeWidth={1.4} /> : <Menu size={20} strokeWidth={1.4} />}
          </button>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "#111009" }}
        aria-hidden={!open}
      >
        <div className="h-[72px] md:h-[84px]" />
        <div className="h-[calc(100vh-72px)] md:h-[calc(100vh-84px)] overflow-y-auto">
          <nav className="container-editorial py-16 flex flex-col gap-8 items-center text-center">
            {links.map((l, i) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `font-display text-4xl md:text-5xl font-light tracking-tight transition-opacity duration-500 ${
                    isActive ? "opacity-100" : "opacity-75 hover:opacity-100"
                  }`
                }
                style={{
                  color: "#F4F1EC",
                  animation: open ? `fade-up 0.7s ${i * 0.08}s cubic-bezier(0.25,0.46,0.45,0.94) both` : undefined,
                }}
              >
                {l.label}
              </NavLink>
            ))}
            <div
              className="mt-10 pt-8 w-full max-w-xs flex items-center justify-between"
              style={{ borderTop: "1px solid rgba(244,241,236,0.15)" }}
            >
              <LangSwitcher />
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="btn-ghost-light !py-3 !px-5"
              >
                Initiate
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};
