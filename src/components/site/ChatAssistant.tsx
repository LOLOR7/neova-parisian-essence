import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";

type ServiceKey = "find" | "renovate" | "both" | "consultancy" | "sell";
type Msg = {
  role: "user" | "assistant";
  content: string;
  cta?: { service: ServiceKey };
};

const SERVICE_LABELS: Record<"en" | "fr", Record<ServiceKey, string>> = {
  en: {
    find: "Find a property",
    renovate: "Renovate an existing property",
    both: "Find + renovate",
    consultancy: "Consultancy",
    sell: "Sell your property",
  },
  fr: {
    find: "Trouver un bien",
    renovate: "Rénover un bien existant",
    both: "Trouver + rénover",
    consultancy: "Conseil",
    sell: "Vendre votre bien",
  },
};

const SERVICE_REPLIES: Record<"en" | "fr", Record<ServiceKey, string>> = {
  en: {
    find: "Neova can help you identify and qualify real estate opportunities aligned with your goals, budget, and preferred areas.",
    renovate: "Neova can support renovation planning, connect you with trusted professionals, and help structure the project before execution.",
    both: "Neova can guide you from property search through renovation planning, helping you coordinate both phases with more clarity.",
    consultancy: "Neova offers tailored advisory for buyers, owners, and investors who need clarity before making a real estate or renovation decision.",
    sell: "Neova can help you review your property confidentially, assess its potential, and prepare the best strategy before selling.",
  },
  fr: {
    find: "Neova vous aide à identifier et qualifier des opportunités immobilières alignées avec vos objectifs, votre budget et vos secteurs.",
    renovate: "Neova accompagne la planification de votre rénovation, met en relation avec des professionnels de confiance et structure votre projet avant exécution.",
    both: "Neova vous guide de la recherche du bien jusqu'à la planification des travaux, pour coordonner les deux phases avec clarté.",
    consultancy: "Neova propose un accompagnement sur mesure pour les acheteurs, propriétaires et investisseurs qui souhaitent y voir clair avant une décision immobilière ou travaux.",
    sell: "Neova vous aide à étudier votre bien en toute confidentialité, évaluer son potentiel et préparer la meilleure stratégie avant la mise en vente.",
  },
};

const COPY = {
  en: {
    interestedIn: (s: string) => `I'm interested in ${s}`,
    followup: "Would you like to submit your project details?",
    openForm: "Open form",
  },
  fr: {
    interestedIn: (s: string) => `Je suis intéressé(e) par : ${s}`,
    followup: "Souhaitez-vous nous transmettre les détails de votre projet ?",
    openForm: "Ouvrir le formulaire",
  },
};

const SERVICE_KEYS: ServiceKey[] = ["find", "renovate", "both", "consultancy", "sell"];

export const ChatAssistant = () => {
  const { t, lang } = useI18n();
  const L = (lang === "fr" ? "fr" : "en") as "en" | "fr";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: t.chat.initial }]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const showSuggestions = messages.length <= 1;

  // Reset welcome message when language changes (only if conversation hasn't started)
  useEffect(() => {
    setMessages((m) => (m.length <= 1 ? [{ role: "assistant", content: t.chat.initial }] : m));
  }, [t.chat.initial]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("chat", { body: { messages: next, lang } });
      if (error) throw error;
      const reply = (data as any)?.reply ?? t.chat.error;
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: t.chat.error }]);
    } finally {
      setLoading(false);
    }
  };

  const pickService = (key: ServiceKey) => {
    const label = SERVICE_LABELS[L][key];
    setMessages((m) => [
      ...m,
      { role: "user", content: COPY[L].interestedIn(label) },
      { role: "assistant", content: `${SERVICE_REPLIES[L][key]}\n\n${COPY[L].followup}`, cta: { service: key } },
    ]);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t.chat.label}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-30 w-12 h-12 md:w-14 md:h-14 bg-foreground text-background flex items-center justify-center shadow-[var(--shadow-soft)] hover:bg-slate-deep transition-colors duration-700"
      >
        {open ? <X size={18} strokeWidth={1.4} /> : <MessageSquare size={18} strokeWidth={1.4} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-md bg-background border border-hairline shadow-[var(--shadow-soft)] flex flex-col animate-fade-up" style={{ height: "min(580px, 72vh)" }}>
          <div className="px-6 py-5 border-b border-hairline">
            <p className="eyebrow">{t.chat.label}</p>
            <p className="font-display text-2xl mt-1.5">{t.chat.title}</p>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${m.role === "user" ? "" : "space-y-3"}`}>
                  <div className={`text-[14px] leading-relaxed px-4 py-3 whitespace-pre-line ${
                    m.role === "user" ? "bg-foreground text-background" : "bg-bone text-foreground"
                  }`}>{m.content}</div>
                  {m.cta && (
                    <Link
                      to={`/find-your-property?service=${m.cta.service}#form`}
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-[12px] tracking-[0.18em] uppercase hover:bg-slate-deep transition-colors duration-500"
                    >
                      {COPY[L].openForm}
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {showSuggestions && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SERVICE_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => pickService(key)}
                    className="text-left text-[13px] px-3.5 py-2 border border-hairline hover:border-foreground hover:bg-bone transition-colors duration-300"
                  >
                    {SERVICE_LABELS[L][key]}
                  </button>
                ))}
              </div>
            )}
            {loading && (
              <div className="flex justify-start"><div className="bg-bone px-4 py-3 text-sm text-muted-foreground">…</div></div>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-hairline p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.chat.placeholder}
              className="flex-1 bg-transparent px-3 py-3 text-sm focus:outline-none"
              maxLength={500}
            />
            <button type="submit" disabled={loading || !input.trim()} className="px-4 bg-foreground text-background disabled:opacity-40" aria-label="Send">
              <Send size={15} strokeWidth={1.5} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
