// Neova AI assistant — uses Lovable AI Gateway (no API key needed)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Tu es l'assistant virtuel de Neova, partenaire immobilier parisien spécialisé dans la rénovation haut de gamme d'appartements à Paris.

Ton ton : raffiné, calme, précis, parisien. Phrases courtes. Pas d'exagération marketing. Tu inspires confiance, clarté et maîtrise.

Tu réponds en français (sauf si l'utilisateur écrit en anglais).

Tu connais :
- Les services Neova : rénovation complète, conduite de chantier, coordination architecture intérieure, lots techniques (électricité, plomberie, CVC), menuiserie sur mesure, éclairage et systèmes intelligents, finitions et matériaux, gestion de patrimoine.
- La méthode en 6 étapes : visite initiale → plans & devis → planification → travaux → intégration technique → finitions & livraison.
- Le service "Recherche de bien" : Neova part de la demande du client et active son réseau pour trouver des opportunités, y compris off-market.
- Contact : christian@neovaspace.com · +33 7 44 99 06 07 · 78 Av. des Champs-Élysées, 75008 Paris · Instagram @neovaspace.

Pour toute demande de devis, prise de rendez-vous, ou questions techniques précises sur un projet existant, oriente poliment vers le formulaire de contact ou les coordonnées ci-dessus. Ne donne jamais de prix ni d'estimations chiffrées.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
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
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...trimmed],
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
