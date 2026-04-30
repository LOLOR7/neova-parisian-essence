import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";

const KEY = "neova.cookies.v1";

export const CookieBanner = () => {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => { if (!localStorage.getItem(KEY)) setShow(true); }, 1200);
    return () => clearTimeout(id);
  }, []);

  const decide = (val: "accepted" | "refused") => {
    localStorage.setItem(KEY, val);
    setShow(false);
  };

  if (!show) return null;
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 animate-fade-up">
      <div className="container-editorial pb-6">
        <div className="bg-background/95 backdrop-blur-xl border border-hairline shadow-[var(--shadow-soft)] p-7 md:p-9 grid md:grid-cols-[1fr_auto] gap-7 items-center">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">{t.cookies.title}</p>
            <p className="text-[14px] leading-[1.7] text-slate-soft">{t.cookies.text}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => decide("refused")} className="btn-line !py-3 !px-5">{t.cookies.refuse}</button>
            <button onClick={() => decide("accepted")} className="btn-solid !py-3 !px-5">{t.cookies.accept}</button>
          </div>
        </div>
      </div>
    </div>
  );
};
