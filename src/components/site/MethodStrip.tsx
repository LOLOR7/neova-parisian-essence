import { useI18n } from "@/i18n/I18nProvider";

export const MethodStrip = () => {
  const { t } = useI18n();
  const m = (t.home as any).methodStrip as { eyebrow: string; text: string; steps: string[] };
  if (!m) return null;
  return (
    <section className="border-t border-b border-hairline bg-background">
      <div className="container-editorial py-12 md:py-16">
        <div className="grid md:grid-cols-12 gap-x-10 gap-y-8 items-start">
          <div className="md:col-span-5">
            <p className="eyebrow mb-4">{m.eyebrow}</p>
            <p className="text-[14.5px] leading-[1.75] text-slate-soft max-w-md">{m.text}</p>
          </div>
          <ol className="md:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
            {m.steps.map((s, i) => (
              <li key={s} className="flex items-baseline gap-3 border-t border-hairline pt-4">
                <span className="numeral text-[10.5px] tracking-[0.28em] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[11px] uppercase tracking-[0.28em] text-foreground">
                  {s}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};