import { getGeminiModel, isAIAvailable } from '../client';
import { logger } from '@/lib/logger';

export interface ExtractedRequestData {
  category?: string;
  intent: string;
  location?: string;
  dateTime?: string;
  partySize?: number;
  budgetRange?: string;
  urgency: 'NORMAL' | 'URGENT' | 'ASAP';
  missingInfo?: string[];
  requiresClarification: boolean;
  clarificationQuestion?: string;
}

export async function understandRequest(rawInput: string): Promise<ExtractedRequestData> {
  if (!isAIAvailable) {
    const lower = rawInput.toLowerCase();
    let category = 'other';
    if (lower.includes('dinner') || lower.includes('restaurant') || lower.includes('table') || lower.includes('food') || lower.includes('lunch')) category = 'dining';
    else if (lower.includes('flight') || lower.includes('hotel') || lower.includes('travel') || lower.includes('trip')) category = 'travel';
    else if (lower.includes('gift') || lower.includes('buy') || lower.includes('shop')) category = 'shopping';
    else if (lower.includes('movie') || lower.includes('ticket') || lower.includes('event')) category = 'experiences';
    else if (lower.includes('salon') || lower.includes('spa') || lower.includes('massage')) category = 'appointments';
    else if (lower.includes('repair') || lower.includes('plumber') || lower.includes('clean')) category = 'home';

    const urgency = lower.includes('urgent') || lower.includes('tonight') || lower.includes('asap') ? 'URGENT' : 'NORMAL';

    return {
      category,
      intent: rawInput,
      location: lower.includes('ahmedabad') ? 'Ahmedabad' : undefined,
      urgency,
      requiresClarification: false,
    };
  }

  try {
    const model = getGeminiModel('gemini-1.5-flash');
    const prompt = 'Analyze this customer request and return a strict JSON object with category, intent, location, dateTime, partySize, budgetRange, urgency, missingInfo, requiresClarification, clarificationQuestion.\n\nCustomer Request:\n' + rawInput;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json\s*|\s*```$/g, '');
    return JSON.parse(text);
  } catch (error) {
    logger.warn({ error, rawInput }, 'AI request understanding fallback to heuristics');
    return {
      intent: rawInput,
      urgency: 'NORMAL',
      requiresClarification: false,
    };
  }
}
