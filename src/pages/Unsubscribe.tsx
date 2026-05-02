import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SiteShell } from "@/components/layout/SiteShell";
import { Section } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";

type State = "loading" | "valid" | "already" | "invalid" | "submitting" | "success" | "error";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const Unsubscribe = () => {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON_KEY } }
        );
        const data = await res.json();
        if (data?.valid === true) setState("valid");
        else if (data?.reason === "already_unsubscribed") setState("already");
        else setState("invalid");
      } catch {
        setState("invalid");
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState("submitting");
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success === true) setState("success");
      else if (data?.reason === "already_unsubscribed") setState("already");
      else setState("error");
    } catch {
      setState("error");
    }
  };

  return (
    <SiteShell>
      <Section>
        <div className="max-w-xl mx-auto py-20 text-center">
          <p className="eyebrow mb-4">{t.unsubscribe.eyebrow}</p>
          <h1 className="font-display text-3xl md:text-4xl mb-6">{t.unsubscribe.title}</h1>
          {state === "loading" && <p className="text-foreground/70">{t.unsubscribe.checking}</p>}
          {state === "valid" && (
            <>
              <p className="text-foreground/70 mb-8">{t.unsubscribe.validIntro}</p>
              <button onClick={confirm} className="btn-solid">{t.unsubscribe.confirm}</button>
            </>
          )}
          {state === "submitting" && <p className="text-foreground/70">{t.unsubscribe.submitting}</p>}
          {state === "success" && (
            <p className="text-foreground/80">{t.unsubscribe.success}</p>
          )}
          {state === "already" && (
            <p className="text-foreground/80">{t.unsubscribe.already}</p>
          )}
          {state === "invalid" && (
            <p className="text-foreground/70">{t.unsubscribe.invalid}</p>
          )}
          {state === "error" && (
            <p className="text-foreground/70">{t.unsubscribe.error}</p>
          )}
        </div>
      </Section>
    </SiteShell>
  );
};

export default Unsubscribe;