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
  | "PROFESSIONAL_REFERRAL"
  | "VIEWING_CONFIRMATION";

type SendBody = {
  action: "send";
  template_type: TemplateType;
  related_entity_type: "demand" | "option" | "professional" | "viewing";
  related_entity_id: string;
};

type PingBody = { action: "ping" };

type JwtDiagnosticBody = {
  action: "jwt_diagnostic";
  expected_base_url?: string;
  expected_user_id_prefix?: string;
  expected_account_id_prefix?: string;
};

type PreviewBody = {
  action: "preview";
  template_type: TemplateType;
  related_entity_id?: string;
};

type Body = SendBody | PingBody | JwtDiagnosticBody | PreviewBody;

/* --------------------------------------------------------------- */
/* Audit + email helpers                                           */
/* --------------------------------------------------------------- */

async function audit(
  supabase: any,
  event_type: string,
  data: {
    related_entity_type?: string | null;
    related_entity_id?: string | null;
    envelope_id?: string | null;
    message?: string | null;
    payload?: unknown;
  } = {}
) {
  try {
    await supabase.from("audit_logs").insert({
      event_type,
      related_entity_type: data.related_entity_type ?? null,
      related_entity_id: data.related_entity_id ?? null,
      envelope_id: data.envelope_id ?? null,
      message: data.message ?? null,
      payload: (data.payload as any) ?? null,
    });
  } catch (e) {
    console.error("audit insert failed", e);
  }
}

async function notifyAdminEmail(subject: string, body: string) {
  try {
    const to = Deno.env.get("DOCUSIGN_ADMIN_EMAIL");
    if (!to) return;
    // Best-effort send via the existing send-network-email function (Resend).
    // If that function is not configured the call is silently skipped.
    const url = `${(Deno.env.get("SUPABASE_URL") || "").replace(/\/+$/, "")}/functions/v1/send-network-email`;
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""}`,
      },
      body: JSON.stringify({
        to,
        subject,
        text: body,
        html: `<p>${body.replace(/\n/g, "<br/>")}</p>`,
      }),
    }).catch(() => null);
  } catch (e) {
    console.error("notifyAdminEmail failed", e);
  }
}

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

function maskSecret(value = "", visibleStart = 8, visibleEnd = 4): string {
  if (!value) return "";
  if (value.length <= visibleStart + visibleEnd) return "••••";
  return `${value.slice(0, visibleStart)}…${value.slice(-visibleEnd)}`;
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

async function applyEnvelopeStatus(
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

  // Try to extract a normalized signer list from either the envelope payload
  // (when sync polls /envelopes/:id) or recipients payload.
  let signers: any = null;
  try {
    const p: any = payload || {};
    const raw = p?.recipients?.signers || p?.signers || null;
    if (Array.isArray(raw)) {
      signers = raw.map((s: any) => ({
        roleName: s.roleName ?? null,
        name: s.name ?? null,
        email: s.email ?? null,
        status: s.status ?? null,
        signedDateTime: s.signedDateTime ?? null,
        deliveredDateTime: s.deliveredDateTime ?? null,
        routingOrder: s.routingOrder ?? null,
      }));
    }
  } catch {
    signers = null;
  }

  await supabase
    .from("docusign_envelopes")
    .update({
      status: status || "received",
      completed_at: isCompleted ? new Date().toISOString() : null,
      raw_payload: payload as any,
      ...(signers ? { signers } : {}),
    })
    .eq("envelope_id", envelopeId);

  let updated: string | null = null;
  if (isCompleted && envRow) {
    if (envRow.template_type === "CLIENT_REPRESENTATION") {
      // Read demand to know request_type → which phase to unlock
      const { data: demand } = await supabase
        .from("property_requests")
        .select("id, demand_reference, request_type")
        .eq("id", envRow.related_entity_id)
        .single();
      const rt = demand?.request_type || "REAL_ESTATE_AND_PROJECT";
      const phase_1_status =
        rt === "PROJECT_ONLY" ? "NOT_APPLICABLE" : "ACTIVE";
      const phase_2_status =
        rt === "REAL_ESTATE_ONLY"
          ? "NOT_APPLICABLE"
          : rt === "PROJECT_ONLY"
            ? "ACTIVE"
            : "LOCKED";
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
        message: `Accord client signé pour la demande ${demand?.demand_reference || ""}. Vous pouvez maintenant lancer la prochaine étape.`,
        category: "docusign",
        related_entity_type: "demand",
        related_entity_id: envRow.related_entity_id,
      });
      await notifyAdminEmail(
        `Neova — Accord client signé (${demand?.demand_reference || ""})`,
        `L'accord de représentation client pour la demande ${demand?.demand_reference || ""} vient d'être signé. Connectez-vous au tableau de bord pour passer à l'étape suivante.`
      );
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
      await notifyAdminEmail(
        "Neova — Accord agent signé",
        "L'accord de référencement agent vient d'être signé."
      );
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
      await notifyAdminEmail(
        "Neova — Accord professionnel signé",
        "L'accord de référencement professionnel vient d'être signé. Confirmez le paiement avant d'introduire le professionnel au client."
      );
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
      await notifyAdminEmail(
        "Neova — Confirmation de visite signée",
        "La confirmation de visite vient d'être signée par toutes les parties."
      );
      updated = "viewing:VIEWING_CONFIRMATION_SIGNED";
    }
    await audit(supabase, "envelope_completed", {
      related_entity_type: envRow.related_entity_type,
      related_entity_id: envRow.related_entity_id,
      envelope_id: envelopeId,
      message: updated,
    });
  }

  return { envelopeId, status: status || "received", isCompleted, entity: envRow, updated };
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

  // Build a criteria summary if the client did not write a free-text message
  const buildCriteriaSummary = (d: any): string => {
    const parts: Array<[string, string | null | undefined]> = [
      ["Type de projet", d.service_type],
      ["Type de bien", d.property_type],
      ["Usage", d.intended_use],
      ["Niveau de travaux", d.works_level],
      ["État actuel", d.current_condition],
      ["Objectif rénovation", d.renovation_objective],
      ["Localisation", d.location],
      ["Adresse", d.address],
      ["Budget", d.budget],
      ["Surface", d.surface],
      ["Échéance", d.timeline],
    ];
    return parts
      .filter(([, v]) => v && String(v).trim().length > 0)
      .map(([k, v]) => `${k} : ${v}`)
      .join("\n");
  };
  const criteriaValue =
    (demand.message && String(demand.message).trim().length > 0)
      ? demand.message
      : buildCriteriaSummary(demand);

  const clientTextTabs = [
    { tabLabel: "client_name", value: demand.name || "" },
    { tabLabel: "client_email", value: demand.email || "" },
    { tabLabel: "demand_reference", value: demand.demand_reference || "" },
    { tabLabel: "date", value: new Date().toLocaleDateString("fr-FR") },
    { tabLabel: "budget", value: demand.budget || "" },
    { tabLabel: "location", value: demand.location || "" },
    { tabLabel: "criteria", value: criteriaValue },
  ];

  return {
    demand,
    payload: {
      status: "sent",
      emailSubject: `Neova — Accord de représentation client (${demand.demand_reference || "demande"})`,
      templateId: Deno.env.get("DOCUSIGN_TEMPLATE_CLIENT_REPRESENTATION"),
      templateRoles: [
        {
          roleName: "Client",
          email: demand.email,
          name: demand.name,
          tabs: { textTabs: clientTextTabs },
        },
        {
          roleName: "Neova Admin",
          email: adminEmail,
          name: adminName,
        },
      ],
      eventNotification: eventNotification(),
    },
  };
}

async function buildProfessionalReferralPayload(
  supabase: any,
  professionalId: string
) {
  const { data: pro, error } = await supabase
    .from("professional_referrals")
    .select("*")
    .eq("id", professionalId)
    .single();
  if (error || !pro) throw new Error("Professionnel introuvable");
  const { data: demand } = await supabase
    .from("property_requests")
    .select(
      "demand_reference, name, location, budget, message, service_type, property_type, intended_use, works_level, current_condition, renovation_objective, surface, timeline"
    )
    .eq("id", pro.demand_id)
    .single();

  const adminEmail = Deno.env.get("DOCUSIGN_ADMIN_EMAIL") || "";
  const adminName = Deno.env.get("DOCUSIGN_ADMIN_NAME") || "Neova Admin";

  const projectSummary = [
    demand?.service_type && `Type : ${demand.service_type}`,
    demand?.property_type && `Bien : ${demand.property_type}`,
    demand?.intended_use && `Usage : ${demand.intended_use}`,
    demand?.works_level && `Travaux : ${demand.works_level}`,
    demand?.current_condition && `État : ${demand.current_condition}`,
    demand?.renovation_objective && `Objectif : ${demand.renovation_objective}`,
    demand?.surface && `Surface : ${demand.surface}`,
    demand?.timeline && `Échéance : ${demand.timeline}`,
    demand?.message && `Note : ${demand.message}`,
  ]
    .filter(Boolean)
    .join("\n");

  // Anonymous client profile (full identity only revealed after sign + payment).
  const clientProfile = [
    demand?.location && `Localisation : ${demand.location}`,
    demand?.budget && `Budget : ${demand.budget}`,
    demand?.surface && `Surface : ${demand.surface}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    professional: pro,
    payload: {
      templateId: Deno.env.get("DOCUSIGN_TEMPLATE_PROFESSIONAL_REFERRAL"),
      status: "sent",
      emailSubject: `Neova — Accord de référencement professionnel (${pro.professional_reference || ""})`,
      templateRoles: [
        {
          roleName: "Professional",
          email: pro.professional_email,
          name: pro.professional_name,
          tabs: {
            textTabs: [
              { tabLabel: "professional_name", value: pro.professional_name || "" },
              { tabLabel: "company_name", value: pro.company_name || "" },
              { tabLabel: "professional_email", value: pro.professional_email || "" },
              { tabLabel: "professional_type", value: pro.professional_type || "" },
              { tabLabel: "date", value: new Date().toLocaleDateString("fr-FR") },
              { tabLabel: "demand_reference", value: demand?.demand_reference || "" },
              { tabLabel: "commitment_fee", value: pro.commitment_fee || "" },
              { tabLabel: "success_fee", value: pro.success_fee || "" },
              { tabLabel: "client_profile", value: clientProfile || "Profil client anonyme" },
              { tabLabel: "project_summary", value: projectSummary || "" },
            ],
          },
        },
        { roleName: "Neova Admin", email: adminEmail, name: adminName },
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

    // ---- JWT diagnostic (safe: no envelopes, no template calls, no private key output) ----
    if ((body as JwtDiagnosticBody).action === "jwt_diagnostic") {
      const p = body as JwtDiagnosticBody;
      const integrationKey = Deno.env.get("DOCUSIGN_INTEGRATION_KEY") || "";
      const baseUrl = Deno.env.get("DOCUSIGN_BASE_URL") || "";
      const userId = Deno.env.get("DOCUSIGN_USER_ID") || "";
      const accountId = Deno.env.get("DOCUSIGN_ACCOUNT_ID") || "";
      return json({
        ok: true,
        integration_key: {
          set: !!integrationKey,
          masked: maskSecret(integrationKey, 8, 4),
        },
        base_url: {
          value: baseUrl,
          matches_expected: p.expected_base_url ? baseUrl === p.expected_base_url : null,
          oauth_host: baseUrl ? oauthHost(baseUrl) : null,
        },
        user_id: {
          set: !!userId,
          masked: maskSecret(userId, 8, 4),
          matches_expected_prefix: p.expected_user_id_prefix ? userId.startsWith(p.expected_user_id_prefix) : null,
        },
        account_id: {
          set: !!accountId,
          masked: maskSecret(accountId, 8, 4),
          matches_expected_prefix: p.expected_account_id_prefix ? accountId.startsWith(p.expected_account_id_prefix) : null,
        },
        private_key: {
          set: !!Deno.env.get("DOCUSIGN_PRIVATE_KEY"),
        },
      });
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
          templateRoles: (r.payload.templateRoles || []).map((tr: any) => ({
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

    // ---- inspect template recipients (debug) ----
    if ((body as any).action === "inspect_template") {
      try {
        const { token } = await getAccessToken();
        const accountId = Deno.env.get("DOCUSIGN_ACCOUNT_ID")!;
        const tplId = Deno.env.get("DOCUSIGN_TEMPLATE_CLIENT_REPRESENTATION");
        const url = `${apiBase(Deno.env.get("DOCUSIGN_BASE_URL")!)}/v2.1/accounts/${accountId}/templates/${tplId}/recipients`;
        const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const data = await r.json();
        const signers = (data.signers || []).map((s: any) => ({
          recipientId: s.recipientId, roleName: s.roleName, name: s.name, email: s.email,
        }));
        return json({ ok: true, recipientCount: data.recipientCount, signers });
      } catch (e: any) {
        return json({ ok: false, error: e?.message }, 200);
      }
    }

    // ---- env info (sandbox vs production + admin name/email) ----
    if ((body as any).action === "env_info") {
      const baseUrl = Deno.env.get("DOCUSIGN_BASE_URL") || "";
      const isSandbox = /demo\.docusign\.net/i.test(baseUrl);
      return json({
        ok: true,
        base_url: baseUrl,
        environment: isSandbox ? "SANDBOX" : "PRODUCTION",
        admin_name: Deno.env.get("DOCUSIGN_ADMIN_NAME") || "",
        admin_email_set: !!Deno.env.get("DOCUSIGN_ADMIN_EMAIL"),
        templates_set: {
          CLIENT_REPRESENTATION: !!Deno.env.get("DOCUSIGN_TEMPLATE_CLIENT_REPRESENTATION"),
          AGENT_REFERRAL: !!Deno.env.get("DOCUSIGN_TEMPLATE_AGENT_REFERRAL"),
          PROFESSIONAL_REFERRAL: !!Deno.env.get("DOCUSIGN_TEMPLATE_PROFESSIONAL_REFERRAL"),
          VIEWING_CONFIRMATION: !!Deno.env.get("DOCUSIGN_TEMPLATE_VIEWING_CONFIRMATION"),
        },
      });
    }

    // ---- validate templates (role-only + required tabs) ----
    if ((body as any).action === "validate_templates") {
      try {
        const { token } = await getAccessToken();
        const accountId = Deno.env.get("DOCUSIGN_ACCOUNT_ID")!;
        const base = apiBase(Deno.env.get("DOCUSIGN_BASE_URL")!);

        const SPECS: Record<
          string,
          { envVar: string; expectedRoles: string[]; requiredTabs: string[] }
        > = {
          CLIENT_REPRESENTATION: {
            envVar: "DOCUSIGN_TEMPLATE_CLIENT_REPRESENTATION",
            expectedRoles: ["Client", "Neova Admin"],
            requiredTabs: [
              "client_name",
              "client_email",
              "demand_reference",
              "date",
              "budget",
              "location",
              "criteria",
            ],
          },
          AGENT_REFERRAL: {
            envVar: "DOCUSIGN_TEMPLATE_AGENT_REFERRAL",
            expectedRoles: ["Agent", "Neova Admin"],
            requiredTabs: [
              "agent_name",
              "agency_name",
              "agent_email",
              "demand_reference",
              "option_reference",
              "property_reference",
              "anonymous_buyer_profile",
              "fee",
              "date",
            ],
          },
          PROFESSIONAL_REFERRAL: {
            envVar: "DOCUSIGN_TEMPLATE_PROFESSIONAL_REFERRAL",
            expectedRoles: ["Professional", "Neova Admin"],
            requiredTabs: [
              "professional_name",
              "company_name",
              "professional_email",
              "professional_type",
              "date",
              "demand_reference",
              "commitment_fee",
              "success_fee",
              "client_profile",
              "project_summary",
            ],
          },
          VIEWING_CONFIRMATION: {
            envVar: "DOCUSIGN_TEMPLATE_VIEWING_CONFIRMATION",
            expectedRoles: ["Client", "Agent", "Neova Admin"],
            requiredTabs: [
              "client_name",
              "agent_name",
              "property_address",
              "viewing_date",
              "demand_reference",
              "property_reference",
              "date",
            ],
          },
        };

        const results: Record<string, any> = {};

        for (const [key, spec] of Object.entries(SPECS)) {
          const tplId = Deno.env.get(spec.envVar);
          if (!tplId) {
            results[key] = {
              ok: false,
              configured: false,
              message: `Secret ${spec.envVar} non configuré`,
            };
            continue;
          }

          // Recipients
          const recRes = await fetch(
            `${base}/v2.1/accounts/${accountId}/templates/${tplId}/recipients`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const recData = await recRes.json();
          if (!recRes.ok) {
            results[key] = {
              ok: false,
              configured: true,
              templateId: tplId,
              message: recData?.message || "Échec récupération du template",
            };
            continue;
          }

          const signers = (recData.signers || []) as any[];
          const roleNames = signers.map((s) => s.roleName).filter(Boolean);
          const missingRoles = spec.expectedRoles.filter(
            (r) => !roleNames.includes(r)
          );
          const extraRoles = roleNames.filter((r) => !spec.expectedRoles.includes(r));

          // Hardcoded recipients = role with non-empty name OR email
          const hardcoded = signers
            .filter((s) => (s.name && s.name.trim()) || (s.email && s.email.trim()))
            .map((s) => ({
              roleName: s.roleName,
              name: s.name || null,
              email: s.email || null,
            }));

          // Tabs (from /documents/.../tabs aggregate via /custom_fields fallback) — use template tabs endpoint
          let foundTabLabels: string[] = [];
          try {
            // Aggregate over recipients
            for (const s of signers) {
              const tRes = await fetch(
                `${base}/v2.1/accounts/${accountId}/templates/${tplId}/recipients/${s.recipientId}/tabs`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (!tRes.ok) continue;
              const tData = await tRes.json();
              const collect = (arr: any[] | undefined) =>
                (arr || []).map((x: any) => x.tabLabel).filter(Boolean);
              foundTabLabels.push(
                ...collect(tData.textTabs),
                ...collect(tData.dateTabs),
                ...collect(tData.numberTabs),
                ...collect(tData.checkboxTabs),
                ...collect(tData.signHereTabs),
              );
            }
          } catch {
            /* ignore tab errors */
          }
          foundTabLabels = Array.from(new Set(foundTabLabels));
          const missingTabs = spec.requiredTabs.filter(
            (t) => !foundTabLabels.includes(t)
          );

          const ok =
            missingRoles.length === 0 &&
            extraRoles.length === 0 &&
            hardcoded.length === 0 &&
            missingTabs.length === 0;

          results[key] = {
            ok,
            configured: true,
            templateId: tplId,
            roles: roleNames,
            expectedRoles: spec.expectedRoles,
            missingRoles,
            extraRoles,
            hardcodedRecipients: hardcoded,
            requiredTabs: spec.requiredTabs,
            foundTabs: foundTabLabels,
            missingTabs,
          };
        }

        const allOk = Object.values(results).every((r: any) => r.ok);
        return json({ ok: allOk, results });
      } catch (e: any) {
        return json({ ok: false, error: e?.message }, 200);
      }
    }

    // ---- sync envelope status (manual fallback when webhook missed) ----
    if ((body as any).action === "sync") {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        let envelopeId: string | undefined = (body as any).envelope_id;
        if (!envelopeId) {
          const { data: latest } = await supabase
            .from("docusign_envelopes")
            .select("envelope_id")
            .not("envelope_id", "is", null)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          envelopeId = latest?.envelope_id ?? undefined;
        }
        if (!envelopeId) return json({ ok: false, message: "Aucune enveloppe à synchroniser" }, 200);

        const { token } = await getAccessToken();
        const accountId = Deno.env.get("DOCUSIGN_ACCOUNT_ID")!;
        const url = `${apiBase(Deno.env.get("DOCUSIGN_BASE_URL")!)}/v2.1/accounts/${accountId}/envelopes/${envelopeId}`;
        const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const data = await r.json();
        if (!r.ok) return json({ ok: false, message: data?.message || "Échec récupération enveloppe", details: data }, 200);

        // Also fetch recipients so we can persist signer-level status (waiting for whom).
        let recipients: any = null;
        try {
          const rr = await fetch(`${url}/recipients`, { headers: { Authorization: `Bearer ${token}` } });
          if (rr.ok) recipients = await rr.json();
        } catch { /* ignore */ }
        const merged = { ...data, recipients: recipients ?? data?.recipients };
        const result = await applyEnvelopeStatus(supabase, envelopeId, data.status || "received", merged);
        return json({ ok: true, ...result });
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
    } else if (send.template_type === "PROFESSIONAL_REFERRAL") {
      const r = await buildProfessionalReferralPayload(supabase, send.related_entity_id);
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
        .update({
          status: "CLIENT_AGREEMENT_SENT",
          client_agreement_status: "CLIENT_AGREEMENT_SENT",
          docusign_envelope_id: envelopeId,
        })
        .eq("id", send.related_entity_id);
    } else if (send.template_type === "AGENT_REFERRAL") {
      await supabase
        .from("agent_options")
        .update({ status: "AGENT_AGREEMENT_SENT", docusign_envelope_id: envelopeId })
        .eq("id", send.related_entity_id);
    } else if (send.template_type === "PROFESSIONAL_REFERRAL") {
      await supabase
        .from("professional_referrals")
        .update({
          status: "PROFESSIONAL_AGREEMENT_SENT",
          docusign_envelope_id: envelopeId,
        })
        .eq("id", send.related_entity_id);
    } else {
      await supabase
        .from("viewing_requests")
        .update({ status: "VIEWING_CONFIRMATION_SENT", docusign_envelope_id: envelopeId })
        .eq("id", send.related_entity_id);
    }

    await audit(supabase, "envelope_sent", {
      related_entity_type: send.related_entity_type,
      related_entity_id: send.related_entity_id,
      envelope_id: envelopeId,
      message: `Template ${send.template_type} sent`,
    });

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