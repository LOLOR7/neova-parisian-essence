import { useI18n } from "@/i18n/I18nProvider";
import type { Lang } from "@/i18n/dict";

export const LangSwitcher = ({ className = "" }: { className?: string }) => {
  const { lang, setLang } = useI18n();
  const Btn = ({ code, label }: { code: Lang; label: string }) => (
    <button
      type="button"
      onClick={() => setLang(code)}
      aria-current={lang === code}
      className={`text-[10.5px] uppercase tracking-[0.28em] transition-opacity duration-500 ${
        lang === code ? "opacity-100" : "opacity-50 hover:opacity-100"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <Btn code="en" label="EN" />
      <span className="opacity-30 text-xs">·</span>
      <Btn code="fr" label="FR" />
    </div>
  );
};
