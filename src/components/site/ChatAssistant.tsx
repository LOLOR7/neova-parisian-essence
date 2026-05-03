import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";

type Msg = { role: "user" | "assistant"; content: string };

export const ChatAssistant = () => {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: t.chat.initial }]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
                <div className={`max-w-[85%] text-[14px] leading-relaxed px-4 py-3 ${
                  m.role === "user" ? "bg-foreground text-background" : "bg-bone text-foreground"
                }`}>{m.content}</div>
              </div>
            ))}
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
