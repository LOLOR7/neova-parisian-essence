import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { CookieBanner } from "@/components/site/CookieBanner";
import { ChatAssistant } from "@/components/site/ChatAssistant";

export const SiteShell = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();

  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);

  // Reveal-on-scroll for both .reveal and .reveal-image
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal, .reveal-image");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
      <ChatAssistant />
    </div>
  );
};
