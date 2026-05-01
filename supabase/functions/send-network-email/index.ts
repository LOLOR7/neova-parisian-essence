import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  property_request_id: string;
  contact_ids: string[];
  subject: string;
  body: string;
  include_client_details: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { property_request_id, contact_ids, subject, body, include_client_details } =
      (await req.json()) as Payload;

    if (!property_request_id || !Array.isArray(contact_ids) || contact_ids.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch contacts
    const { data: contacts, error: cErr } = await supabase
      .from("network_contacts")
      .select("id, email, name")
      .in("id", contact_ids);
    if (cErr) throw cErr;

    // Log each send (status: queued — actual delivery wired later)
    const rows = (contacts ?? []).map((c) => ({
      property_request_id,
      contact_id: c.id,
      recipient_email: c.email,
      email_subject: subject,
      email_body: body,
      include_client_details,
      status: "queued",
    }));

    if (rows.length > 0) {
      const { error: sErr } = await supabase.from("request_sends").insert(rows);
      if (sErr) throw sErr;
    }

    // Mark request as sent
    await supabase
      .from("property_requests")
      .update({ status: "Envoyé au réseau" })
      .eq("id", property_request_id);

    return new Response(
      JSON.stringify({ ok: true, count: rows.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-network-email error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});