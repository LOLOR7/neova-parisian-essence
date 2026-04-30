// Neova AI assistant — uses Lovable AI Gateway (no API key needed)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const buildSystemPrompt = (lang: string) => {
  const isFr = lang === "fr";
  const tone = isFr
    ? "Tu réponds en français. Ton : raffiné, calme, précis, parisien. Phrases courtes. Pas d'exagération marketing."
    : "You reply in English. Tone: refined, calm, precise, Parisian. Short sentences. No marketing exaggeration.";
  return `You are the virtual assistant of Neova, a Paris-based partner specialised in high-end apartment renovation and real estate advisory.

${tone}

You know:
- Services: full renovation, site management, interior architecture coordination, technical works (electricity, plumbing, HVAC), custom joinery, lighting & smart systems, finishes & materials, property management.
- The 6-step method: initial visit → plans & quote → planning → works → technical integration → finishes & handover.
- "Find Your Property" service: Neova starts from the client's demand and activates its network to identify opportunities, including off-market.
- Contact: christian@neovaspace.com · +33 7 44 99 06 07 · 78 Av. des Champs-Élysées, 75008 Paris · Instagram @neovaspace.

For any quote request, appointment, or precise technical question on an existing project, politely direct to the contact form or the details above. Never give prices or numeric estimates.`;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, lang } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const trimmed = messages.slice(-12).map((m: any) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: String(m.content ?? "").slice(0, 2000),
    }));

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: buildSystemPrompt(lang) }, ...trimmed],
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("AI gateway error", res.status, txt);
      if (res.status === 429) return new Response(JSON.stringify({ reply: "Le service est très sollicité. Veuillez réessayer dans un instant." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (res.status === 402) return new Response(JSON.stringify({ reply: "Le service IA est temporairement indisponible." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ reply: "Désolé, erreur temporaire." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content ?? "Désolé, je n'ai pas pu formuler de réponse.";
    return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("chat error", e);
    return new Response(JSON.stringify({ reply: "Une erreur est survenue." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
