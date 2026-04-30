import { useEffect, useState } from "react";

const KEY = "neova.cookies.v1";

export const CookieBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!localStorage.getItem(KEY)) setShow(true);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  const decide = (val: "accepted" | "refused") => {
    localStorage.setItem(KEY, val);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 animate-fade-up">
      <div className="container-narrow pb-6">
        <div className="bg-background border border-hairline shadow-[var(--shadow-soft)] p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <p className="eyebrow mb-2">Confidentialité</p>
            <p className="text-sm text-foreground/90 max-w-2xl leading-relaxed">
              Nous utilisons des cookies pour améliorer votre expérience et mesurer l'audience du site. Vous pouvez accepter ou refuser à tout moment.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => decide("refused")}
              className="text-[11px] uppercase tracking-[0.22em] px-5 py-3 border border-hairline hover:bg-secondary transition-colors"
            >
              Refuser
            </button>
            <button
              onClick={() => decide("accepted")}
              className="text-[11px] uppercase tracking-[0.22em] px-5 py-3 bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
