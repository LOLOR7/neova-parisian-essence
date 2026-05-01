/**
 * docusign-send-envelope
 * =====================================================================
 * Real DocuSign sandbox integration using JWT grant.
 *
 * Actions (POST body):
 *   { action: "ping" }
 *     → tests JWT auth and returns the access token expiry
 *   { action: "send", template_type, related_entity_type, related_entity_id }
 *     → creates an envelope from the matching template and updates DB
 *
 * All DocuSign secrets are read from environment (server-side only).
 * =====================================================================
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type TemplateType =
  | "CLIENT_REPRESENTATION"
  | "AGENT_REFERRAL"
  | "VIEWING_CONFIRMATION";

type SendBody = {
  action: "send";
  template_type: TemplateType;
  related_entity_type: "demand" | "option" | "viewing";
  related_entity_id: string;
};

type PingBody = { action: "ping" };

type PreviewBody = {
  action: "preview";
  template_type: TemplateType;
  related_entity_id?: string;
};

type Body = SendBody | PingBody | PreviewBody;

/* --------------------------------------------------------------- */
/* JWT helpers                                                     */
/* --------------------------------------------------------------- */

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const cleaned = pem
    .replace(/-----BEGIN [A-Z ]+-----/g, "")
    .replace(/-----END [A-Z ]+-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/**
 * Wrap a PKCS#1 RSA key (DER bytes from "BEGIN RSA PRIVATE KEY") into a
 * PKCS#8 container so WebCrypto can import it.
 *
 * PKCS#8 structure:
 *   SEQUENCE {
 *     INTEGER 0,
 *     SEQUENCE { OID rsaEncryption, NULL },
 *     OCTET STRING { <PKCS#1 DER> }
 *   }
 */
function pkcs1ToPkcs8(pkcs1: Uint8Array): Uint8Array {
  // DER for: SEQUENCE { OID 1.2.840.113549.1.1.1, NULL }
  const rsaOid = new Uint8Array([
    0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86,
    0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00,
  ]);
  const version = new Uint8Array([0x02, 0x01, 0x00]); // INTEGER 0

  const encodeLength = (len: number): Uint8Array => {
    if (len < 0x80) return new Uint8Array([len]);
    const bytes: number[] = [];
    let n = len;
    while (n > 0) { bytes.unshift(n & 0xff); n >>= 8; }
    return new Uint8Array([0x80 | bytes.length, ...bytes]);
  };

  // OCTET STRING wrapping the PKCS#1 key
  const octetLen = encodeLength(pkcs1.length);
  const octet = new Uint8Array(1 + octetLen.length + pkcs1.length);
  octet[0] = 0x04;
  octet.set(octetLen, 1);
  octet.set(pkcs1, 1 + octetLen.length);

  const inner = new Uint8Array(version.length + rsaOid.length + octet.length);
  inner.set(version, 0);
  inner.set(rsaOid, version.length);
  inner.set(octet, version.length + rsaOid.length);

  const seqLen = encodeLength(inner.length);
  const out = new Uint8Array(1 + seqLen.length + inner.length);
  out[0] = 0x30;
  out.set(seqLen, 1);
  out.set(inner, 1 + seqLen.length);
  return out;
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const isPkcs1 = /-----BEGIN RSA PRIVATE KEY-----/.test(pem);
  const raw = new Uint8Array(pemToArrayBuffer(pem));
  const pkcs8 = isPkcs1 ? pkcs1ToPkcs8(raw) : raw;
  return await crypto.subtle.importKey(
    "pkcs8",
    pkcs8.buffer.slice(pkcs8.byteOffset, pkcs8.byteOffset + pkcs8.byteLength),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

/** Returns the OAuth host derived from base URL. */
function oauthHost(baseUrl: string): string {
  // demo.docusign.net  → account-d.docusign.com
  // www.docusign.net   → account.docusign.com
  if (baseUrl.includes("demo")) return "account-d.docusign.com";
  return "account.docusign.com";
}

/** Normalise base URL: ensure it has /restapi suffix removed for joining. */
function apiBase(baseUrl: string): string {
  let b = baseUrl.replace(/\/+$/, "");
  if (!b.endsWith("/restapi")) b = `${b}/restapi`;
  return b;
}

async function getAccessToken(): Promise<{ token: string; expiresIn: number }> {
  const integrationKey = Deno.env.get("DOCUSIGN_INTEGRATION_KEY")!;
  const userId = Deno.env.get("DOCUSIGN_USER_ID")!;
  const baseUrl = Deno.env.get("DOCUSIGN_BASE_URL")!;
  const privateKey = Deno.env.get("DOCUSIGN_PRIVATE_KEY")!;

  const aud = oauthHost(baseUrl);
  const key = await importPrivateKey(privateKey);

  const jwt = await create(
    { alg: "RS256", typ: "JWT" },
    {
      iss: integrationKey,
      sub: userId,
      aud,
      iat: getNumericDate(0),
      exp: getNumericDate(60 * 60),
      scope: "signature impersonation",
    },
    key
  );

  const res = await fetch(`https://${aud}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const err: any = new Error(data?.error_description || data?.error || "JWT auth failed");
    err.docusign = data;
    err.status = res.status;
    if (data?.error === "consent_required") {
      err.consentUrl =
        `https://${aud}/oauth/auth?response_type=code&scope=signature%20impersonation` +
        `&client_id=${integrationKey}` +
        `&redirect_uri=https://www.docusign.com`;
      err.code = "consent_required";
    }
    throw err;
  }
  return { token: data.access_token, expiresIn: data.expires_in };
}

/* --------------------------------------------------------------- */
/* Envelope payload builders                                       */
/* --------------------------------------------------------------- */

function webhookUrl(): string {
  const projectRef = (Deno.env.get("SUPABASE_URL") || "").match(/https:\/\/([^.]+)/)?.[1];
  return `https://${projectRef}.functions.supabase.co/docusign-webhook`;
}

function eventNotification() {
  return {
    url: webhookUrl(),
    requireAcknowledgment: "true",
    loggingEnabled: "true",
    includeDocuments: "false",
    includeEnvelopeVoidReason: "true",
    includeTimeZone: "true",
    includeSenderAccountAsCustomField: "true",
    includeDocumentFields: "true",
    includeCertificateOfCompletion: "false",
    envelopeEvents: [
      { envelopeEventStatusCode: "sent" },
      { envelopeEventStatusCode: "delivered" },
      { envelopeEventStatusCode: "completed" },
      { envelopeEventStatusCode: "declined" },
      { envelopeEventStatusCode: "voided" },
    ],
  };
}

async function buildClientRepresentationPayload(supabase: any, demandId: string) {
  const { data: demand, error } = await supabase
    .from("property_requests").select("*").eq("id", demandId).single();
  if (error || !demand) throw new Error("Demande introuvable");

  const adminEmail = Deno.env.get("DOCUSIGN_ADMIN_EMAIL") || "";
  const adminName = Deno.env.get("DOCUSIGN_ADMIN_NAME") || "Neova Admin";

  return {
    demand,
    payload: {
      templateId: Deno.env.get("DOCUSIGN_TEMPLATE_CLIENT_REPRESENTATION"),
      status: "sent",
      emailSubject: `Neova — Accord de représentation client (${demand.demand_reference || "demande"})`,
      templateRoles: [
        {
          email: demand.email,
          name: demand.name,
          roleName: "Client",
          tabs: {
            textTabs: [
              { tabLabel: "client_name", value: demand.name || "" },
              { tabLabel: "client_email", value: demand.email || "" },
              { tabLabel: "demand_reference", value: demand.demand_reference || "" },
              { tabLabel: "date", value: new Date().toLocaleDateString("fr-FR") },
              { tabLabel: "budget", value: demand.budget || "" },
              { tabLabel: "location", value: demand.location || "" },
              { tabLabel: "criteria", value: demand.message || "" },
            ],
          },
        },
        {
          email: adminEmail,
          name: adminName,
          roleName: "Neova Admin",
        },
      ],
      eventNotification: eventNotification(),
    },
  };
}

async function buildAgentReferralPayload(supabase: any, optionId: string) {
  const { data: option, error } = await supabase
    .from("agent_options").select("*").eq("id", optionId).single();
  if (error || !option) throw new Error("Option introuvable");
  const { data: demand } = await supabase
    .from("property_requests").select("demand_reference, location, message").eq("id", option.demand_id).single();

  const adminEmail = Deno.env.get("DOCUSIGN_ADMIN_EMAIL") || "info@neovaspace.com";
  const adminName = Deno.env.get("DOCUSIGN_ADMIN_NAME") || "Neova";

  return {
    option,
    payload: {
      templateId: Deno.env.get("DOCUSIGN_TEMPLATE_AGENT_REFERRAL"),
      status: "sent",
      emailSubject: `Neova — Accord de référencement agent (${option.option_reference || "option"})`,
      templateRoles: [
        {
          email: option.agent_email,
          name: option.agent_name,
          roleName: "Agent",
          tabs: {
            textTabs: [
              { tabLabel: "agent_name", value: option.agent_name || "" },
              { tabLabel: "agency_name", value: option.agency_name || "" },
              { tabLabel: "agent_email", value: option.agent_email || "" },
              { tabLabel: "demand_reference", value: demand?.demand_reference || "" },
              { tabLabel: "option_reference", value: option.option_reference || "" },
              { tabLabel: "property_reference", value: option.property_reference || "" },
              { tabLabel: "anonymous_buyer_profile", value: `Critères : ${demand?.location || ""} — ${demand?.message || ""}` },
              { tabLabel: "fee", value: "20% de la commission brute perçue par l'agent / l'agence" },
              { tabLabel: "date", value: new Date().toLocaleDateString("fr-FR") },
            ],
          },
        },
        { email: adminEmail, name: adminName, roleName: "Neova Admin" },
      ],
      eventNotification: eventNotification(),
    },
  };
}

async function buildViewingConfirmationPayload(supabase: any, viewingId: string) {
  const { data: viewing, error } = await supabase
    .from("viewing_requests").select("*").eq("id", viewingId).single();
  if (error || !viewing) throw new Error("Visite introuvable");
  const { data: option } = await supabase
    .from("agent_options").select("option_reference, property_reference").eq("id", viewing.option_id).single();
  const { data: demand } = await supabase
    .from("property_requests").select("demand_reference").eq("id", viewing.demand_id).single();

  const adminEmail = Deno.env.get("DOCUSIGN_ADMIN_EMAIL") || "info@neovaspace.com";
  const adminName = Deno.env.get("DOCUSIGN_ADMIN_NAME") || "Neova";

  return {
    viewing,
    payload: {
      templateId: Deno.env.get("DOCUSIGN_TEMPLATE_VIEWING_CONFIRMATION"),
      status: "sent",
      emailSubject: `Neova — Confirmation de visite (${demand?.demand_reference || ""})`,
      templateRoles: [
        {
          email: viewing.client_email,
          name: viewing.client_name,
          roleName: "Client",
          tabs: {
            textTabs: [
              { tabLabel: "client_name", value: viewing.client_name || "" },
              { tabLabel: "agent_name", value: viewing.agent_name || "" },
              { tabLabel: "property_address", value: viewing.property_address || "" },
              { tabLabel: "viewing_date", value: viewing.viewing_date || "" },
              { tabLabel: "demand_reference", value: demand?.demand_reference || "" },
              { tabLabel: "property_reference", value: option?.property_reference || "" },
              { tabLabel: "date", value: new Date().toLocaleDateString("fr-FR") },
            ],
          },
        },
        { email: viewing.agent_email, name: viewing.agent_name, roleName: "Agent" },
        { email: adminEmail, name: adminName, roleName: "Neova Admin" },
      ],
      eventNotification: eventNotification(),
    },
  };
}

/* --------------------------------------------------------------- */
/* Server                                                          */
/* --------------------------------------------------------------- */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;

    // ---- shared config check ----
    const baseRequired = [
      "DOCUSIGN_INTEGRATION_KEY",
      "DOCUSIGN_USER_ID",
      "DOCUSIGN_ACCOUNT_ID",
      "DOCUSIGN_BASE_URL",
      "DOCUSIGN_PRIVATE_KEY",
    ];
    const missingBase = baseRequired.filter((k) => !Deno.env.get(k));
    if (missingBase.length > 0) {
      return json(
        { ok: false, configured: false, missing: missingBase, message: "DocuSign non configuré" },
        200
      );
    }

    // ---- ping ----
    if ((body as PingBody).action === "ping") {
      try {
        const { token, expiresIn } = await getAccessToken();
        return json({ ok: true, token_preview: token.slice(0, 16) + "…", expires_in: expiresIn });
      } catch (e: any) {
        return json(
          {
            ok: false,
            error: e?.message,
            code: e?.code,
            consentUrl: e?.consentUrl,
            details: e?.docusign,
          },
          200
        );
      }
    }

    // ---- preview (safe debug, no secrets, no DocuSign call) ----
    if ((body as PreviewBody).action === "preview") {
      const p = body as PreviewBody;
      if (p.template_type !== "CLIENT_REPRESENTATION") {
        return json({ ok: false, message: "Preview supporté uniquement pour CLIENT_REPRESENTATION" }, 200);
      }
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      let demandId = p.related_entity_id;
      if (!demandId) {
        const { data: latest } = await supabase
          .from("property_requests")
          .select("id")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!latest) return json({ ok: false, message: "Aucune demande en base" }, 200);
        demandId = latest.id;
      }
      try {
        const r = await buildClientRepresentationPayload(supabase, demandId!);
        const safe = {
          templateId: r.payload.templateId,
          emailSubject: r.payload.emailSubject,
          templateRoles: r.payload.templateRoles.map((tr: any) => ({
            roleName: tr.roleName,
            name: tr.name,
            email: tr.email,
            textTabs: tr.tabs?.textTabs?.map((t: any) => ({
              tabLabel: t.tabLabel,
              value: t.value,
            })) || [],
          })),
        };
        return json({ ok: true, demand_id: demandId, preview: safe });
      } catch (e: any) {
        return json({ ok: false, message: e?.message || "Erreur preview" }, 200);
      }
    }

    // ---- inspect recipients (debug) ----
    if ((body as any).action === "inspect") {
      const envelopeId = (body as any).envelope_id;
      try {
        const { token } = await getAccessToken();
        const accountId = Deno.env.get("DOCUSIGN_ACCOUNT_ID")!;
        const url = `${apiBase(Deno.env.get("DOCUSIGN_BASE_URL")!)}/v2.1/accounts/${accountId}/envelopes/${envelopeId}/recipients`;
        const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const data = await r.json();
        const signers = (data.signers || []).map((s: any) => ({
          roleName: s.roleName, name: s.name, email: s.email, status: s.status,
        }));
        return json({ ok: true, recipientCount: data.recipientCount, signers });
      } catch (e: any) {
        return json({ ok: false, error: e?.message }, 200);
      }
    }

    const send = body as SendBody;
    if (!send?.template_type || !send?.related_entity_id) {
      return json({ error: "Missing template_type or related_entity_id" }, 400);
    }

    const tplKey = `DOCUSIGN_TEMPLATE_${send.template_type}`;
    if (!Deno.env.get(tplKey)) {
      return json(
        {
          ok: false,
          configured: false,
          missing: [tplKey],
          message:
            "Template DocuSign manquant. Ajoutez le Template ID dans les variables d'environnement.",
        },
        200
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ---- build payload ----
    let envelopePayload: any;
    if (send.template_type === "CLIENT_REPRESENTATION") {
      const r = await buildClientRepresentationPayload(supabase, send.related_entity_id);
      envelopePayload = r.payload;
    } else if (send.template_type === "AGENT_REFERRAL") {
      const r = await buildAgentReferralPayload(supabase, send.related_entity_id);
      envelopePayload = r.payload;
    } else if (send.template_type === "VIEWING_CONFIRMATION") {
      const r = await buildViewingConfirmationPayload(supabase, send.related_entity_id);
      envelopePayload = r.payload;
    } else {
      return json({ error: "Unknown template_type" }, 400);
    }

    // ---- auth + send ----
    let token: string;
    try {
      const t = await getAccessToken();
      token = t.token;
    } catch (e: any) {
      return json(
        {
          ok: false,
          code: e?.code,
          consentUrl: e?.consentUrl,
          message:
            e?.code === "consent_required"
              ? "Consentement DocuSign requis. Cliquez sur « Autoriser l'intégration DocuSign »."
              : e?.message || "Erreur d'authentification DocuSign",
        },
        200
      );
    }

    const accountId = Deno.env.get("DOCUSIGN_ACCOUNT_ID")!;
    const url = `${apiBase(Deno.env.get("DOCUSIGN_BASE_URL")!)}/v2.1/accounts/${accountId}/envelopes`;
    const dsRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(envelopePayload),
    });
    const dsData = await dsRes.json();
    if (!dsRes.ok) {
      console.error("DocuSign error", dsData);
      await supabase.from("docusign_envelopes").insert({
        template_type: send.template_type,
        related_entity_type: send.related_entity_type,
        related_entity_id: send.related_entity_id,
        status: "error",
        raw_payload: dsData,
      });
      return json({ ok: false, message: dsData?.message || "Échec création enveloppe", details: dsData }, 200);
    }

    const envelopeId: string = dsData.envelopeId;

    // ---- persist ----
    await supabase.from("docusign_envelopes").insert({
      envelope_id: envelopeId,
      template_type: send.template_type,
      related_entity_type: send.related_entity_type,
      related_entity_id: send.related_entity_id,
      status: "sent",
      sent_at: new Date().toISOString(),
      raw_payload: dsData,
    });

    if (send.template_type === "CLIENT_REPRESENTATION") {
      await supabase
        .from("property_requests")
        .update({ status: "CLIENT_AGREEMENT_SENT", docusign_envelope_id: envelopeId })
        .eq("id", send.related_entity_id);
    } else if (send.template_type === "AGENT_REFERRAL") {
      await supabase
        .from("agent_options")
        .update({ status: "AGENT_AGREEMENT_SENT", docusign_envelope_id: envelopeId })
        .eq("id", send.related_entity_id);
    } else {
      await supabase
        .from("viewing_requests")
        .update({ status: "VIEWING_CONFIRMATION_SENT", docusign_envelope_id: envelopeId })
        .eq("id", send.related_entity_id);
    }

    return json({ ok: true, envelopeId });
  } catch (e: any) {
    console.error(e);
    return json({ ok: false, error: e?.message || "Unexpected error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}