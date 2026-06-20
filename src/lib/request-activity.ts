import { supabase } from "@/integrations/supabase/client";

export type ActivityType =
  | "email_sent"
  | "agreement_generated"
  | "agreement_attached"
  | "document_attached"
  | "status_changed"
  | "manual_note";

export type ActivityRole = "client" | "agent" | "professional" | "architect" | "other";

export type ActivityPayload = {
  type: ActivityType;
  title: string;
  description?: string | null;
  recipientName?: string | null;
  recipientEmail?: string | null;
  recipientRole?: ActivityRole | null;
  relatedAgreementId?: string | null;
  relatedDocumentId?: string | null;
  metadata?: Record<string, any>;
};

export async function logActivity(requestId: string, p: ActivityPayload) {
  try {
    await supabase.from("request_activity_log" as any).insert({
      request_id: requestId,
      type: p.type,
      title: p.title,
      description: p.description ?? null,
      recipient_name: p.recipientName ?? null,
      recipient_email: p.recipientEmail ?? null,
      recipient_role: p.recipientRole ?? null,
      related_agreement_id: p.relatedAgreementId ?? null,
      related_document_id: p.relatedDocumentId ?? null,
      metadata: p.metadata ?? {},
    });
  } catch (e) {
    // Non-blocking: never break the user action because of a log write.
    console.warn("activity log failed", e);
  }
}

/** 30-day signed URL for a private document stored in `agreements` bucket. */
export async function getDocumentSignedUrl(path: string, expiresInSec = 60 * 60 * 24 * 30) {
  const { data, error } = await supabase.storage
    .from("agreements")
    .createSignedUrl(path, expiresInSec);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export function roleFromContactRole(role: string | null | undefined): ActivityRole {
  if (!role) return "other";
  const r = role.toLowerCase();
  if (r.includes("agent")) return "agent";
  if (r.includes("archi")) return "architect";
  if (r.includes("entreprise") || r.includes("artisan") || r.includes("contractant")) return "professional";
  return "other";
}
