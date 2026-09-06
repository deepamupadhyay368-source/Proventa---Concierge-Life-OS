import { logger } from "@/lib/logger";

export interface SendWhatsAppNotificationParams {
  phone: string;
  template: "PROPOSAL_READY" | "BOOKING_CONFIRMED" | "WELCOME_COHORT_1";
  params: {
    name: string;
    details?: string;
    actionUrl?: string;
  };
}

export async function sendWhatsAppNotification({
  phone,
  template,
  params,
}: SendWhatsAppNotificationParams) {
  const isEnabled = process.env.FEATURE_WHATSAPP_ENABLED === "true";
  const apiKey = process.env.WHATSAPP_API_KEY;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  const textMap = {
    PROPOSAL_READY: `Proventa Concierge: Greetings ${params.name}, your concierge has prepared a private proposal: "${params.details}". Review and approve at: ${params.actionUrl}`,
    BOOKING_CONFIRMED: `Proventa Concierge: Reservation Confirmed for ${params.name}. Details: ${params.details}. View in your Life OS: ${params.actionUrl}`,
    WELCOME_COHORT_1: `Proventa: Welcome to Early Access · Cohort 1, ${params.name}. Your dedicated concierge desk is active 24/7 at ${params.actionUrl}`,
  };

  const message = textMap[template];

  if (!isEnabled || !apiKey || !phoneNumberId) {
    logger.info(
      { phone, template, message },
      "[WhatsApp] Notification queued (Enable FEATURE_WHATSAPP_ENABLED & set WHATSAPP_API_KEY for live WhatsApp Cloud dispatch)"
    );
    return { success: true, mode: "SIMULATED_SAFE" };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone.replace(/[^0-9]/g, ""),
        type: "text",
        text: { preview_url: true, body: message },
      }),
    });

    const data = await res.json();
    logger.info({ phone, data }, "[WhatsApp] Message dispatched via Cloud API");
    return { success: true, data };
  } catch (err) {
    logger.error({ err, phone }, "[WhatsApp] Dispatch error");
    return { success: false, error: err };
  }
}
