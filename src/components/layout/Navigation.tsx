import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const links = [
  { to: "/method", label: "Approach" },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
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
        className="fixed top-0 inset-x-0 z-40 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? "hsl(var(--stone) / 0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        }}
      >
        <div className="container-editorial flex items-center justify-between h-[78px]">
          <Link
            to="/"
            aria-label="NEOVA"
            className="font-display text-[20px] font-normal text-ink select-none"
            style={{ letterSpacing: "0.12em" }}
          >
            NEOVA
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-[13px] font-normal transition-colors duration-300 ${
                    isActive ? "text-accent" : "text-ink hover:text-accent"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}

            <span aria-hidden className="block w-px h-4 bg-accent" />

            <Link
              to="/contact"
              className="inline-flex items-center px-7 py-[10px] text-[11px] uppercase border border-ink text-ink transition-all duration-300 hover:bg-ink hover:text-stone"
              style={{ letterSpacing: "0.15em", borderRadius: "2px" }}
            >
              Initiate a Project
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden relative z-[60] flex flex-col gap-[5px] p-2"
          >
            <span className={`block w-5 h-px transition-all duration-300 ${open ? "bg-stone rotate-45 translate-y-[3px]" : "bg-ink"}`} />
            <span className={`block w-5 h-px transition-all duration-300 ${open ? "bg-stone -rotate-45 -translate-y-[3px]" : "bg-ink"}`} />
          </button>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-500 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "hsl(var(--navy))" }}
        aria-hidden={!open}
      >
        <div className="h-full flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
            {links.map((l, i) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="font-display text-[44px] font-light text-stone transition-opacity"
                style={{
                  opacity: open ? 1 : 0,
                  transition: `opacity 0.6s ease ${0.1 * (i + 1)}s`,
                  letterSpacing: "-0.02em",
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div
            className="text-center pb-10 text-[10px] uppercase"
            style={{ color: "hsl(var(--stone) / 0.3)", letterSpacing: "0.15em" }}
          >
            78 Av. des Champs-Élysées · 75008 Paris
          </div>
        </div>
      </div>
    </>
  );
};