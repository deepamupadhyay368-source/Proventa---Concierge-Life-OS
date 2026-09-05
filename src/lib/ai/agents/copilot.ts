import { getGeminiModel, isAIAvailable } from '../client';

export async function generateConciergeDraft(params: {
  customerName: string;
  requestSummary: string;
  actionType: 'CLARIFICATION' | 'OPTIONS_READY' | 'BOOKING_CONFIRMATION' | 'STATUS_UPDATE';
  details?: Record<string, any>;
}): Promise<string> {
  if (!isAIAvailable) {
    switch (params.actionType) {
      case 'CLARIFICATION':
        return `Hello ${params.customerName}, I'm reviewing your request. Could you clarify a few details so we can get this arranged perfectly?`;
      case 'OPTIONS_READY':
        return `Hello ${params.customerName}, we've researched the options for you. Please review the proposal and let us know if you'd like us to proceed.`;
      case 'BOOKING_CONFIRMATION':
        return `Hello ${params.customerName}, your reservation has been confirmed. All details are attached below.`;
      default:
        return `Hello ${params.customerName}, we are currently handling your request and will update you shortly.`;
    }
  }

  const model = getGeminiModel('gemini-1.5-flash');
  const prompt = `
You are the Concierge Copilot for Proventa.
Draft a warm, polite, discreet, and concise message for the human concierge to send to ${params.customerName}.
Context:
- Request: ${params.requestSummary}
- Action: ${params.actionType}
- Specific Details: ${JSON.stringify(params.details || {})}

Brand Voice:
- Premium, modern, calm, discreet, trustworthy, human
- NO hype, buzzwords, robot phrases, or exclamation mark overload
- Keep it under 3-4 sentences.
`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (e) {
    return `Hello ${params.customerName}, we are working on your request and will have an update shortly.`;
  }
}
