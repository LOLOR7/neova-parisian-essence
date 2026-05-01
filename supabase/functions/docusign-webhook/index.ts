/**
 * docusign-webhook — PLACEHOLDER
 * =====================================================================
 * Receives DocuSign Connect notifications and updates the matching
 * row in `docusign_envelopes` plus the related demand / option /
 * viewing record.
 *
 * To activate:
 *   1. In DocuSign Admin → Connect, add a custom configuration with:
 *        URL = https://<project>.functions.supabase.co/docusign-webhook
 *        Format = JSON, Include HMAC, Events = Envelope Sent / Signed /
 *        Completed.
 *   2. Set DOCUSIGN_WEBHOOK_SECRET to the HMAC secret you configured.
 *   3. Replace the `verifySignature` stub with a proper HMAC SHA256
 *      check against the `X-DocuSign-Signature-1` header.
 * =====================================================================
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-docusign-signature-1",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const raw = await req.text();
    const signature = req.headers.get("x-docusign-signature-1") || "";
    const secret = Deno.env.get("DOCUSIGN_WEBHOOK_SECRET");

    if (secret && !verifySignature(raw, signature, secret)) {
      return json({ error: "Invalid signature" }, 401);
    }

    const payload = JSON.parse(raw);
    const envelopeId: string | undefined =
      payload?.data?.envelopeId || payload?.envelopeId;
    const status: string | undefined =
      payload?.data?.envelopeSummary?.status || payload?.status || payload?.event;

    if (!envelopeId) return json({ error: "Missing envelopeId" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const isCompleted = (status || "").toLowerCase() === "completed";

    // Find the envelope row to know which entity to update
    const { data: envRow } = await supabase
      .from("docusign_envelopes")
      .select("id, template_type, related_entity_id, related_entity_type")
      .eq("envelope_id", envelopeId)
      .maybeSingle();

    await supabase
      .from("docusign_envelopes")
      .update({
        status: status || "received",
        completed_at: isCompleted ? new Date().toISOString() : null,
        raw_payload: payload,
      })
      .eq("envelope_id", envelopeId);

    if (isCompleted && envRow) {
      if (envRow.template_type === "CLIENT_REPRESENTATION") {
        await supabase
          .from("property_requests")
          .update({ status: "CLIENT_AGREEMENT_SIGNED" })
          .eq("id", envRow.related_entity_id);
      } else if (envRow.template_type === "AGENT_REFERRAL") {
        await supabase
          .from("agent_options")
          .update({ status: "AGENT_AGREEMENT_SIGNED" })
          .eq("id", envRow.related_entity_id);
      } else if (envRow.template_type === "VIEWING_CONFIRMATION") {
        await supabase
          .from("viewing_requests")
          .update({ status: "VIEWING_CONFIRMATION_SIGNED" })
          .eq("id", envRow.related_entity_id);
      }
    }

    return json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return json({ error: e?.message || "Unexpected error" }, 500);
  }
});

/** PLACEHOLDER — replace with proper HMAC SHA256 verification. */
function verifySignature(_body: string, _signature: string, _secret: string): boolean {
  return true;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}