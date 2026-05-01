/**
 * docusign-send-envelope — PLACEHOLDER
 * =====================================================================
 * Creates a DocuSign envelope from a template for one of the three
 * Neova workflow steps. NOT YET WIRED to the real DocuSign API.
 *
 * To activate:
 *   1. Add the secrets listed in /admin/settings/docusign
 *   2. Replace the `sendViaDocuSign` stub with a JWT grant call to
 *      DocuSign's REST API:
 *        POST {DOCUSIGN_BASE_URL}/v2.1/accounts/{ACCOUNT_ID}/envelopes
 *        body: {
 *          templateId: <one of the 3 template IDs>,
 *          templateRoles: [...signers with tabs...],
 *          status: "sent",
 *          eventNotification: { url: <webhook URL>, ... }
 *        }
 *   3. Persist the returned envelopeId on the related row.
 * =====================================================================
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Body = {
  template_type: "CLIENT_REPRESENTATION" | "AGENT_REFERRAL" | "VIEWING_CONFIRMATION";
  related_entity_type: "demand" | "option" | "viewing";
  related_entity_id: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    if (!body?.template_type || !body?.related_entity_id) {
      return json({ error: "Missing template_type or related_entity_id" }, 400);
    }

    const REQUIRED = [
      "DOCUSIGN_INTEGRATION_KEY",
      "DOCUSIGN_USER_ID",
      "DOCUSIGN_ACCOUNT_ID",
      "DOCUSIGN_BASE_URL",
      "DOCUSIGN_PRIVATE_KEY",
      `DOCUSIGN_TEMPLATE_${body.template_type}`,
    ];
    const missing = REQUIRED.filter((k) => !Deno.env.get(k));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (missing.length > 0) {
      // Log the attempt so the admin sees it in the envelopes table
      await supabase.from("docusign_envelopes").insert({
        template_type: body.template_type,
        related_entity_type: body.related_entity_type,
        related_entity_id: body.related_entity_id,
        status: "pending_configuration",
        raw_payload: { missing },
      });
      return json(
        {
          ok: false,
          configured: false,
          message:
            "DocuSign n'est pas encore configuré. Ajoutez les identifiants et Template IDs pour activer l'envoi.",
          missing,
        },
        200
      );
    }

    // TODO: real DocuSign call here (JWT grant + Envelopes API).
    const envelopeId = await sendViaDocuSign(body);

    await supabase.from("docusign_envelopes").insert({
      envelope_id: envelopeId,
      template_type: body.template_type,
      related_entity_type: body.related_entity_type,
      related_entity_id: body.related_entity_id,
      status: "sent",
      sent_at: new Date().toISOString(),
    });

    return json({ ok: true, envelopeId });
  } catch (e: any) {
    console.error(e);
    return json({ error: e?.message || "Unexpected error" }, 500);
  }
});

/** PLACEHOLDER — replace with real DocuSign API integration. */
async function sendViaDocuSign(_body: Body): Promise<string> {
  return `placeholder-${crypto.randomUUID()}`;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}