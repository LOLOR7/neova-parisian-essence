/** DocuSign Connect listener — updates envelope + related entity status. */
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
    const { envelopeId, status, payload } = parseConnectPayload(
      raw,
      req.headers.get("content-type") || ""
    );

    if (!envelopeId) return json({ error: "Missing envelopeId" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const result = await applyEnvelopeStatus(supabase, envelopeId, status || "received", payload);
    return json({ ok: true, ...result });
  } catch (e: any) {
    console.error("docusign-webhook error", e);
    return json({ error: e?.message || "Unexpected error" }, 500);
  }
});

function parseConnectPayload(raw: string, contentType: string) {
  const trimmed = raw.trim();
  if (contentType.includes("json") || trimmed.startsWith("{")) {
    const payload = JSON.parse(raw);
    return {
      payload,
      envelopeId: payload?.data?.envelopeId || payload?.envelopeId,
      status:
        payload?.data?.envelopeSummary?.status ||
        payload?.envelopeSummary?.status ||
        payload?.status ||
        payload?.event,
    };
  }
  return {
    payload: { rawXml: trimmed },
    envelopeId: tag(trimmed, "EnvelopeID") || tag(trimmed, "EnvelopeId"),
    status: tag(trimmed, "Status") || tag(trimmed, "EnvelopeStatus"),
  };
}

function tag(xml: string, name: string): string | undefined {
  const m = xml.match(new RegExp(`<[^>]*${name}[^>]*>([\\s\\S]*?)<\\/[^>]*${name}>`, "i"));
  return m?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim();
}

export async function applyEnvelopeStatus(
  supabase: any,
  envelopeId: string,
  status: string,
  payload: unknown
) {
  const normalized = (status || "").toLowerCase();
  const isCompleted = normalized === "completed" || normalized.endsWith("completed");

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

  let updated: string | null = null;
  if (isCompleted && envRow) {
    if (envRow.template_type === "CLIENT_REPRESENTATION") {
      await supabase
        .from("property_requests")
        .update({ status: "CLIENT_AGREEMENT_SIGNED" })
        .eq("id", envRow.related_entity_id);
      await supabase.from("admin_notifications").insert({
        message:
          "Client agreement signed. Demand is ready to be shared anonymously with agents.",
        category: "docusign",
        related_entity_type: "demand",
        related_entity_id: envRow.related_entity_id,
      });
      updated = "demand:CLIENT_AGREEMENT_SIGNED";
    } else if (envRow.template_type === "AGENT_REFERRAL") {
      await supabase
        .from("agent_options")
        .update({ status: "AGENT_AGREEMENT_SIGNED" })
        .eq("id", envRow.related_entity_id);
      await supabase.from("admin_notifications").insert({
        message: "Agent referral agreement signed.",
        category: "docusign",
        related_entity_type: "option",
        related_entity_id: envRow.related_entity_id,
      });
      updated = "option:AGENT_AGREEMENT_SIGNED";
    } else if (envRow.template_type === "VIEWING_CONFIRMATION") {
      await supabase
        .from("viewing_requests")
        .update({ status: "VIEWING_CONFIRMATION_SIGNED" })
        .eq("id", envRow.related_entity_id);
      await supabase.from("admin_notifications").insert({
        message: "Viewing confirmation signed.",
        category: "docusign",
        related_entity_type: "viewing",
        related_entity_id: envRow.related_entity_id,
      });
      updated = "viewing:VIEWING_CONFIRMATION_SIGNED";
    }
  }

  return { envelopeId, status: status || "received", isCompleted, entity: envRow, updated };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
