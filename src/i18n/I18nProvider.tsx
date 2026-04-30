import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { dict, Lang, Dict } from "./dict";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };
const I18nContext = createContext<Ctx | null>(null);
const KEY = "neova.lang";

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "fr";
    const saved = localStorage.getItem(KEY) as Lang | null;
    if (saved === "en" || saved === "fr") return saved;
    return navigator.language?.toLowerCase().startsWith("en") ? "en" : "fr";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(KEY, lang);
  }, [lang]);

  const value = useMemo<Ctx>(() => ({ lang, setLang: setLangState, t: dict[lang] as Dict }), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): Ctx => {
  const ctx = useContext(I18nContext);
  if (ctx) return ctx;
  // Fallback to avoid hard crashes during HMR or when used outside provider
  return { lang: "fr", setLang: () => {}, t: dict.fr as Dict };
};
