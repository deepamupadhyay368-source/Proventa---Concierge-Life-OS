import { logger } from "@/lib/logger";

export interface SendWhatsAppNotificationParams {
  phone: string;
  template: "PROPOSAL_READY" | "BOOKING_CONFIRMED" | "WELCOME_COHORT_1" | "INTERACTIVE_PROPOSAL";
  params: {
    name: string;
    details?: string;
    actionUrl?: string;
    options?: Array<{ id: string; title: string; priceFormatted?: string; providerName?: string }>;
    approvalToken?: string;
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

  let message = "";
  if (template === "INTERACTIVE_PROPOSAL" && params.options && params.options.length > 0) {
    const optionLines = params.options
      .map((opt, i) => `${i + 1}. *${opt.title}* (${opt.priceFormatted || "Direct Settlement"})`)
      .join("\n");
    message = `👑 *PROVENTA PRIVATE CONCIERGE*\n\nGood day ${params.name}, our specialists have curated verified options for your request:\n\n${optionLines}\n\n👉 *Reply with 1 or 2* to immediately authorize & book.\nOr 1-click approve online: ${params.actionUrl || "https://proventa.in"}`;
  } else {
    const textMap: Record<string, string> = {
      PROPOSAL_READY: `👑 *Proventa Concierge*: Greetings ${params.name}, your concierge has prepared a private proposal: "${params.details}". Review and approve at: ${params.actionUrl}`,
      BOOKING_CONFIRMED: `✨ *Proventa Concierge*: Reservation Confirmed for ${params.name}.\n\nDetails: ${params.details}\n\nView Digital Pass in your Life OS: ${params.actionUrl}`,
      WELCOME_COHORT_1: `🏛️ *Proventa*: Welcome to Early Access · Cohort 1, ${params.name}. Your dedicated concierge desk is active 24/7 at ${params.actionUrl}`,
    };
    message = textMap[template] || textMap.PROPOSAL_READY;
  }

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
