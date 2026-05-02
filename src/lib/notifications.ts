import { supabase } from "@/integrations/supabase/client";

/**
 * Recipient for internal Neova notifications.
 * Centralized constant — change here to update across the app.
 */
export const NEOVA_NOTIFICATIONS_EMAIL = "info@neovaspace.com";

export interface AdminNotificationDetail {
  label: string;
  value: string;
}

export interface AdminNotificationParams {
  eventTitle: string;
  summary?: string;
  details?: AdminNotificationDetail[];
  ctaNote?: string;
  /** Stable id used for idempotency (e.g. record id + event name). */
  idempotencyKey: string;
  /** Override the default recipient. */
  recipientEmail?: string;
}

/**
 * Fire-and-forget notification email to the Neova admin recipient.
 * Never throws — failures are logged only so they cannot block the caller.
 */
export async function sendAdminNotification(params: AdminNotificationParams): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "admin-notification",
        recipientEmail: params.recipientEmail || NEOVA_NOTIFICATIONS_EMAIL,
        idempotencyKey: params.idempotencyKey,
        templateData: {
          eventTitle: params.eventTitle,
          summary: params.summary || "",
          details: params.details || [],
          ctaNote: params.ctaNote || "",
        },
      },
    });
    if (error) {
      console.error("[notify] send-transactional-email failed", error);
    }
  } catch (err) {
    console.error("[notify] unexpected error sending admin notification", err);
  }
}