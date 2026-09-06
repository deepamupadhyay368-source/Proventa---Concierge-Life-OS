import { getGeminiModel, isAIAvailable } from '../client';
import { logger } from '@/lib/logger';

export interface ExtractedRequestData {
  category?: string;
  intent: string;
  location?: string;
  dateTime?: string;
  timeframe?: string;
  destination?: string;
  partySize?: number;
  budgetRange?: string;
  urgency: 'NORMAL' | 'URGENT' | 'ASAP';
  missingInfo?: string[];
  requiresClarification: boolean;
  clarificationQuestion?: string;
}

export async function understandRequest(rawInput: string): Promise<ExtractedRequestData> {
  const lower = rawInput.toLowerCase();

  // Robust Heuristic Engine (works both offline and as instant fallback)
  let category = 'other';
  if (
    lower.includes('dinner') ||
    lower.includes('restaurant') ||
    lower.includes('table') ||
    lower.includes('food') ||
    lower.includes('lunch') ||
    lower.includes('dine') ||
    lower.includes('agashiye')
  ) {
    category = 'dining';
  } else if (
    lower.includes('flight') ||
    lower.includes('hotel') ||
    lower.includes('suite') ||
    lower.includes('travel') ||
    lower.includes('trip') ||
    lower.includes('stay') ||
    lower.includes('itc narmada') ||
    lower.includes('taj')
  ) {
    category = 'travel';
  } else if (
    lower.includes('sedan') ||
    lower.includes('pickup') ||
    lower.includes('chauffeur') ||
    lower.includes('car') ||
    lower.includes('transfer') ||
    lower.includes('airport') ||
    lower.includes('mobility')
  ) {
    category = 'mobility';
  } else if (
    lower.includes('gift') ||
    lower.includes('buy') ||
    lower.includes('shop') ||
    lower.includes('stole') ||
    lower.includes('bandhej')
  ) {
    category = 'shopping';
  } else if (
    lower.includes('walk') ||
    lower.includes('movie') ||
    lower.includes('ticket') ||
    lower.includes('event') ||
    lower.includes('heritage')
  ) {
    category = 'experiences';
  } else if (
    lower.includes('salon') ||
    lower.includes('spa') ||
    lower.includes('massage') ||
    lower.includes('appointment')
  ) {
    category = 'appointments';
  } else if (
    lower.includes('repair') ||
    lower.includes('plumber') ||
    lower.includes('clean') ||
    lower.includes('polishing') ||
    lower.includes('estate')
  ) {
    category = 'home';
  }

  const urgency =
    lower.includes('urgent') || lower.includes('tonight') || lower.includes('asap')
      ? 'URGENT'
      : 'NORMAL';

  // Extract party size if stated (e.g. "for 4", "for 2")
  const partyMatch = lower.match(/(?:for|party of)\s*(\d+)/);
  const partySize = partyMatch ? parseInt(partyMatch[1]) : (lower.includes('for two') ? 2 : (lower.includes('for four') ? 4 : 2));

  // Extract time/date indication
  let dateTime: string | undefined = undefined;
  if (lower.includes('saturday')) dateTime = 'Saturday 8:00 PM';
  else if (lower.includes('tomorrow')) dateTime = 'Tomorrow 11:00 AM';
  else if (lower.includes('next weekend')) dateTime = 'Next Weekend';
  else if (lower.includes('tonight')) dateTime = 'Tonight';

  const heuristicResult: ExtractedRequestData = {
    category,
    intent: rawInput,
    location: lower.includes('ahmedabad') || lower.includes('svpia') ? 'Ahmedabad' : undefined,
    destination: lower.includes('itc narmada') ? 'ITC Narmada' : undefined,
    partySize,
    dateTime,
    timeframe: dateTime,
    urgency,
    requiresClarification: false,
  };

  if (!isAIAvailable) {
    return heuristicResult;
  }

  try {
    const model = getGeminiModel('gemini-1.5-flash');
    const prompt =
      'Analyze this customer request and return a strict JSON object with category, intent, location, dateTime, timeframe, destination, partySize, budgetRange, urgency, missingInfo, requiresClarification, clarificationQuestion.\n\nCustomer Request:\n' +
      rawInput;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json\s*|\s*```$/g, '');
    const parsed = JSON.parse(text);
    return { ...heuristicResult, ...parsed };
  } catch (error) {
    logger.warn({ error, rawInput }, 'AI request understanding fallback to heuristics');
    return heuristicResult;
  }
}
