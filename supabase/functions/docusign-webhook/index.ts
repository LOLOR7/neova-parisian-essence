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
    const status: string | undefined = payload?.data?.envelopeSummary?.status || payload?.status;

    if (!envelopeId) return json({ error: "Missing envelopeId" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase
      .from("docusign_envelopes")
      .update({
        status: status || "received",
        completed_at: status === "completed" ? new Date().toISOString() : null,
        raw_payload: payload,
      })
      .eq("envelope_id", envelopeId);

    // TODO: based on template_type + completion, update the related
    // demand/option/viewing row to its next status (CLIENT_AGREEMENT_SIGNED,
    // AGENT_AGREEMENT_SIGNED, VIEWING_CONFIRMATION_SIGNED).

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