import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const INITIAL: Msg = {
  role: "assistant",
  content:
    "Bonjour, je suis l'assistant Neova. Je peux vous renseigner sur nos services, notre méthode, ou vous aider à préparer votre projet. Comment puis-je vous accompagner ?",
};

export const ChatAssistant = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([INITIAL]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { messages: next },
      });
      if (error) throw error;
      const reply = (data as any)?.reply ?? "Désolé, une erreur est survenue.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Désolé, l'assistant est momentanément indisponible. Vous pouvez nous écrire à christian@neovaspace.com." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Assistant Neova"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-foreground text-background flex items-center justify-center shadow-[var(--shadow-soft)] hover:opacity-90 transition-opacity"
      >
        {open ? <X size={20} /> : <MessageSquare size={20} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-md bg-background border border-hairline shadow-[var(--shadow-soft)] flex flex-col animate-fade-up" style={{ height: "min(560px, 70vh)" }}>
          <div className="px-5 py-4 border-b border-hairline">
            <p className="eyebrow">Assistant Neova</p>
            <p className="font-display text-xl mt-1">Comment puis-je vous aider ?</p>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] text-sm leading-relaxed px-4 py-3 ${
                  m.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-secondary text-foreground"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary px-4 py-3 text-sm text-muted-foreground">…</div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="border-t border-hairline p-3 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Votre message…"
              className="flex-1 bg-transparent px-3 py-3 text-sm focus:outline-none"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 bg-foreground text-background disabled:opacity-40"
              aria-label="Envoyer"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
