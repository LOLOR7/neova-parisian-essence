/** DocuSign Connect listener — updates envelope + related entity status. */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const NEOVA_NOTIFICATIONS_EMAIL = "info@neovaspace.com";

async function notifyAdmin(
  supabase: any,
  params: {
    idempotencyKey: string;
    eventTitle: string;
    summary?: string;
    details?: Array<{ label: string; value: string }>;
    ctaNote?: string;
  }
) {
  try {
    const { error } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "admin-notification",
        recipientEmail: NEOVA_NOTIFICATIONS_EMAIL,
        idempotencyKey: params.idempotencyKey,
        templateData: {
          eventTitle: params.eventTitle,
          summary: params.summary || "",
          details: params.details || [],
          ctaNote: params.ctaNote || "",
        },
      },
    });
    if (error) console.error("[notify] send-transactional-email failed", error);
  } catch (err) {
    console.error("[notify] unexpected error sending admin notification", err);
  }
}

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

  // Audit: webhook received
  try {
    await supabase.from("audit_logs").insert({
      event_type: "webhook_received",
      envelope_id: envelopeId,
      related_entity_type: envRow?.related_entity_type ?? null,
      related_entity_id: envRow?.related_entity_id ?? null,
      message: `status=${status}`,
      payload: payload as any,
    });
  } catch {/* ignore */}

  let updated: string | null = null;
  if (isCompleted && envRow) {
    if (envRow.template_type === "CLIENT_REPRESENTATION") {
      const { data: demand } = await supabase
        .from("property_requests")
        .select("id, demand_reference, request_type")
        .eq("id", envRow.related_entity_id)
        .single();
      const VALID_RT = ["REAL_ESTATE_ONLY", "REAL_ESTATE_AND_PROJECT", "PROJECT_ONLY"];
      const rawRt = demand?.request_type ?? null;
      const isValidRt = rawRt && VALID_RT.includes(rawRt);

      let phase_1_status: string;
      let phase_2_status: string;

      if (!isValidRt) {
        // Do not silently assume a workflow bucket. Keep phases locked and
        // log an audit warning so an admin can correct request_type.
        phase_1_status = "LOCKED";
        phase_2_status = "LOCKED";
        await supabase.from("audit_logs").insert({
          event_type: "workflow_warning",
          envelope_id: envelopeId,
          related_entity_type: "demand",
          related_entity_id: envRow.related_entity_id,
          message: `Client agreement signed but request_type is missing or unknown ('${rawRt ?? "null"}'). Phases left LOCKED — admin must set a valid request_type.`,
          payload: { request_type: rawRt },
        });
      } else {
        phase_1_status = rawRt === "PROJECT_ONLY" ? "NOT_APPLICABLE" : "ACTIVE";
        phase_2_status =
          rawRt === "REAL_ESTATE_ONLY"
            ? "NOT_APPLICABLE"
            : rawRt === "PROJECT_ONLY"
              ? "ACTIVE"
              : "LOCKED";
      }

      await supabase
        .from("property_requests")
        .update({
          status: "CLIENT_AGREEMENT_SIGNED",
          client_agreement_status: "CLIENT_AGREEMENT_SIGNED",
          phase_1_status,
          phase_2_status,
        })
        .eq("id", envRow.related_entity_id);
      await supabase.from("admin_notifications").insert({
        message: `Accord client signé pour la demande ${demand?.demand_reference || ""}.`,
        category: "docusign",
        related_entity_type: "demand",
        related_entity_id: envRow.related_entity_id,
      });
      await notifyAdmin(supabase, {
        idempotencyKey: `client-agreement-signed-${envelopeId}`,
        eventTitle: "Client agreement fully signed",
        summary: `The client representation agreement for demand ${demand?.demand_reference || ""} has been fully signed.`,
        details: [
          { label: "Demand ref", value: demand?.demand_reference || "" },
          { label: "Envelope", value: envelopeId },
        ],
        ctaNote: "Phase 1 of the workflow is now active in the admin dashboard.",
      });
      updated = "demand:CLIENT_AGREEMENT_SIGNED";
    } else if (envRow.template_type === "AGENT_REFERRAL") {
      await supabase
        .from("agent_options")
        .update({ status: "AGENT_AGREEMENT_SIGNED" })
        .eq("id", envRow.related_entity_id);
      await supabase.from("admin_notifications").insert({
        message: "Accord agent signé.",
        category: "docusign",
        related_entity_type: "option",
        related_entity_id: envRow.related_entity_id,
      });
      const { data: opt } = await supabase
        .from("agent_options")
        .select("option_reference, agent_name, agency_name, property_address")
        .eq("id", envRow.related_entity_id)
        .maybeSingle();
      await notifyAdmin(supabase, {
        idempotencyKey: `agent-agreement-signed-${envelopeId}`,
        eventTitle: "Agent agreement fully signed",
        summary: `The agent referral agreement has been fully signed${opt?.agent_name ? ` by ${opt.agent_name}` : ""}.`,
        details: [
          { label: "Option ref", value: opt?.option_reference || "" },
          { label: "Agent", value: opt?.agent_name || "" },
          { label: "Agency", value: opt?.agency_name || "" },
          { label: "Property", value: opt?.property_address || "" },
          { label: "Envelope", value: envelopeId },
        ],
      });
      updated = "option:AGENT_AGREEMENT_SIGNED";
    } else if (envRow.template_type === "PROFESSIONAL_REFERRAL") {
      await supabase
        .from("professional_referrals")
        .update({
          status: "PROFESSIONAL_AGREEMENT_SIGNED",
          payment_status: "PENDING",
        })
        .eq("id", envRow.related_entity_id);
      await supabase.from("admin_notifications").insert({
        message:
          "Accord professionnel signé. Confirmation du paiement requise avant introduction.",
        category: "docusign",
        related_entity_type: "professional",
        related_entity_id: envRow.related_entity_id,
      });
      const { data: pro } = await supabase
        .from("professional_referrals")
        .select("professional_reference, professional_name, professional_type, company_name")
        .eq("id", envRow.related_entity_id)
        .maybeSingle();
      await notifyAdmin(supabase, {
        idempotencyKey: `professional-agreement-signed-${envelopeId}`,
        eventTitle: "Professional agreement fully signed",
        summary: `${pro?.professional_name || "A professional"} has fully signed the referral agreement. Payment confirmation is required before introduction.`,
        details: [
          { label: "Professional", value: pro?.professional_name || "" },
          { label: "Reference", value: pro?.professional_reference || "" },
          { label: "Type", value: pro?.professional_type || "" },
          { label: "Company", value: pro?.company_name || "" },
          { label: "Envelope", value: envelopeId },
        ],
        ctaNote: "Mark payment as received in the admin workflow to unlock client introduction.",
      });
      updated = "professional:PROFESSIONAL_AGREEMENT_SIGNED";
    } else if (envRow.template_type === "VIEWING_CONFIRMATION") {
      await supabase
        .from("viewing_requests")
        .update({ status: "VIEWING_CONFIRMATION_SIGNED" })
        .eq("id", envRow.related_entity_id);
      await supabase.from("admin_notifications").insert({
        message: "Confirmation de visite signée.",
        category: "docusign",
        related_entity_type: "viewing",
        related_entity_id: envRow.related_entity_id,
      });
      const { data: v } = await supabase
        .from("viewing_requests")
        .select("client_name, agent_name, property_address, viewing_date")
        .eq("id", envRow.related_entity_id)
        .maybeSingle();
      await notifyAdmin(supabase, {
        idempotencyKey: `viewing-confirmation-signed-${envelopeId}`,
        eventTitle: "Viewing confirmation fully signed",
        summary: "A viewing confirmation has been fully signed by all parties.",
        details: [
          { label: "Client", value: v?.client_name || "" },
          { label: "Agent", value: v?.agent_name || "" },
          { label: "Property", value: v?.property_address || "" },
          { label: "Viewing date", value: v?.viewing_date || "" },
          { label: "Envelope", value: envelopeId },
        ],
      });
      updated = "viewing:VIEWING_CONFIRMATION_SIGNED";
    }
    try {
      await supabase.from("audit_logs").insert({
        event_type: "envelope_completed",
        envelope_id: envelopeId,
        related_entity_type: envRow.related_entity_type,
        related_entity_id: envRow.related_entity_id,
        message: updated,
      });
    } catch {/* ignore */}
  }

  return { envelopeId, status: status || "received", isCompleted, entity: envRow, updated };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
