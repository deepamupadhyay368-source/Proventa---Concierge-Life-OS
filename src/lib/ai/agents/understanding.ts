import { getGeminiModel, isAIAvailable } from '../client';
import { logger } from '@/lib/logger';
import { TaskDecisionEngine } from '@/lib/capabilities/task-decision-engine';
import type { ServiceCategory, TaskObjective } from '@/lib/capabilities/types';
import { EntityIntegrityValidator } from '@/lib/validation/entity-integrity';

export interface ExtractedRequestData {
  category: string;
  serviceCategory?: ServiceCategory;
  objective: TaskObjective;
  action: string;
  intent: string;
  location?: string;
  destination?: string;
  origin?: string;
  originAirport?: string;
  destinationAirport?: string;
  provenance?: Record<string, string>;
  dateTime?: string;
  timeframe?: string;
  date?: string;
  time?: string;
  partySize?: number;
  guests?: number;
  budgetRange?: string;
  budgetAmount?: number;
  budgetCurrency?: string;
  preferences?: string[];
  constraints?: string[];
  deadline?: string;
  urgency: 'NORMAL' | 'URGENT' | 'ASAP';
  customerProvidedDetails?: Record<string, any>;
  executionRequired: boolean;
  approvalRequired: boolean;
  missingInfo?: string[];
  requiresClarification: boolean;
  clarificationQuestion?: string;
  isProhibited?: boolean;
}

export async function understandRequest(rawInput: string): Promise<ExtractedRequestData> {
  const lower = rawInput.toLowerCase().trim();

  // 1. Initial Evaluation via TaskDecisionEngine
  const decision = TaskDecisionEngine.evaluate({ rawInput });

  // 2. Extract Party Size / Number of Guests
  let partySize: number | undefined = undefined;
  const partyMatch = lower.match(/(?:for|party of)\s*(\d+)/i);
  if (partyMatch) {
    partySize = parseInt(partyMatch[1], 10);
  } else if (lower.includes('for two') || lower.includes('dinner for two') || lower.includes('couple')) {
    partySize = 2;
  } else if (lower.includes('for four') || lower.includes('table for four')) {
    partySize = 4;
  } else if (lower.includes('solo') || lower.includes('for one') || lower.includes('for myself')) {
    partySize = 1;
  }

  // 3. Extract Budget
  let budgetAmount: number | undefined = undefined;
  let budgetRange: string | undefined = undefined;
  const budgetMatch = rawInput.match(/(?:₹|rs\.?|inr)\s*([0-9,]+)/i) || rawInput.match(/under\s*(?:₹|rs\.?|inr)?\s*([0-9,]+)/i);
  if (budgetMatch) {
    const parsed = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(parsed)) {
      budgetAmount = parsed;
      budgetRange = `₹${parsed.toLocaleString('en-IN')}`;
    }
  }

  // 4. Extract Date / Time / Urgency
  let date: string | undefined = undefined;
  let time: string | undefined = undefined;
  let dateTime: string | undefined = undefined;

  if (lower.includes('this friday') || lower.includes('friday')) date = 'Friday';
  else if (lower.includes('saturday')) date = 'Saturday';
  else if (lower.includes('sunday')) date = 'Sunday';
  else if (lower.includes('tomorrow morning')) {
    date = 'Tomorrow';
    time = 'Morning (09:00 AM)';
  } else if (lower.includes('tomorrow')) {
    date = 'Tomorrow';
  } else if (lower.includes('tonight')) {
    date = 'Tonight';
    time = 'Evening (20:00)';
  }

  const timeMatch = rawInput.match(/(?:around|at|by)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
  if (timeMatch) {
    time = timeMatch[1].trim();
  }

  if (date && time) dateTime = `${date} at ${time}`;
  else if (date) dateTime = date;
  else if (time) dateTime = time;

  const urgency: 'NORMAL' | 'URGENT' | 'ASAP' =
    lower.includes('urgent') || lower.includes('tonight') || lower.includes('asap') || lower.includes('immediately')
      ? 'URGENT'
      : 'NORMAL';

  // 5. Deterministic Travel & Location Entity Extraction
  const deterministic = EntityIntegrityValidator.extractTravelEntities(rawInput);
  let location: string = deterministic.location?.value || 'Ahmedabad';
  let destination: string | undefined = deterministic.destination?.value;
  let origin: string | undefined = deterministic.origin?.value;
  let originAirport: string | undefined = deterministic.originAirport?.value;
  let destinationAirport: string | undefined = deterministic.destinationAirport?.value;

  // Local landmark recognition in Ahmedabad
  if (lower.includes('itc narmada')) {
    destination = 'ITC Narmada, Ahmedabad';
    location = 'Ahmedabad';
  } else if (lower.includes('agashiye')) {
    destination = 'Agashiye — The House of MG';
    location = 'Ahmedabad';
  }

  // 6. Extract Preferences & Action Flags
  const preferences: string[] = [];
  if (lower.includes('nice')) preferences.push('Curated / Premium ambiance');
  if (lower.includes('quiet rooftop') || lower.includes('rooftop')) preferences.push('Rooftop seating');
  if (lower.includes('business dinner') || lower.includes('business')) preferences.push('Business dining / discreet');
  if (lower.includes('business class')) preferences.push('Business Class cabin');
  if (lower.includes('recliner') || lower.includes('insignia') || lower.includes('imax')) preferences.push('IMAX Laser / Recliner seating');
  if (lower.includes('vegetarian') || lower.includes('jain')) preferences.push('Vegetarian / Jain friendly');

  // Execution requirements
  const executionRequired =
    decision.objective === 'BOOK' ||
    decision.objective === 'ARRANGE' ||
    lower.startsWith('book ') ||
    lower.includes('book me') ||
    lower.includes('arrange a') ||
    lower.includes('buy me') ||
    lower.includes('call the');

  let compatCategory = decision.category.toLowerCase();
  if (decision.category === 'TRAVEL' && (lower.includes('flight') || lower.includes('airline') || lower.includes('airfare'))) {
    compatCategory = 'flights';
  } else if (decision.category === 'MOVIES_ENTERTAINMENT') {
    compatCategory = 'movies';
  }

  const effectivePartySize = deterministic.partySize?.value || partySize || 2;
  const rawBudgetVal = deterministic.budget?.value;
  const effectiveBudget = typeof rawBudgetVal === 'number'
    ? rawBudgetVal
    : (typeof rawBudgetVal === 'string' ? parseInt(rawBudgetVal.replace(/[^\d]/g, ''), 10) || undefined : budgetAmount);

  const heuristicResult: ExtractedRequestData = {
    category: compatCategory,
    serviceCategory: decision.category,
    objective: decision.objective,
    action: decision.objective,
    intent: rawInput,
    location,
    destination,
    origin,
    originAirport,
    destinationAirport,
    provenance: {
      destination: deterministic.destination?.source || 'UNKNOWN',
      origin: deterministic.origin?.source || 'UNKNOWN',
      location: deterministic.location?.source || 'INFERRED',
      partySize: deterministic.partySize?.source || (partySize ? 'EXPLICIT' : 'INFERRED'),
      budget: deterministic.budget?.source || (budgetRange ? 'EXPLICIT' : 'UNKNOWN'),
    },
    dateTime,
    timeframe: dateTime,
    date,
    time,
    partySize: effectivePartySize,
    guests: effectivePartySize,
    budgetRange: budgetRange || (effectiveBudget ? `₹${effectiveBudget.toLocaleString('en-IN')}` : undefined),
    budgetAmount: effectiveBudget,
    budgetCurrency: 'INR',
    preferences,
    constraints: [],
    deadline: dateTime,
    urgency,
    customerProvidedDetails: { rawInput },
    executionRequired,
    approvalRequired: decision.approvalRequired,
    requiresClarification: false,
    isProhibited: decision.isProhibited,
  };

  // If AI is not configured or in testing environment, return heuristic result immediately
  if (!isAIAvailable) {
    return heuristicResult;
  }

  try {
    const model = getGeminiModel(process.env.GEMINI_FLASH_MODEL || process.env.GEMINI_MODEL || 'gemini-3.5-flash');
    const prompt = `You are the Proventa Concierge Intent Extraction Engine.
Analyze the customer request below and extract a strict JSON object with these keys:
- category: One of [DINING, TRAVEL, HOTELS, TRANSPORT, FOOD_DELIVERY, MOVIES_ENTERTAINMENT, GIFTS, SHOPPING, SALON_WELLNESS, APPOINTMENTS, EVENTS, WEEKEND_ESCAPES, RESEARCH_PLANNING, OTHER_CONCIERGE]
- objective: One of [BOOK, SEARCH, RECOMMEND, RESEARCH, COMPARE, CANCEL, INQUIRE, ARRANGE]
- action: One-word summary of desired action
- intent: Normalized short sentence stating the core mandate
- origin: Departure city or airport if travel
- destination: Target destination, hotel, restaurant, or city
- location: Origin or relevant city
- date: Day or date of event/booking
- time: Preferred time
- dateTime: Combined date and time
- partySize: Integer count of people/guests
- budgetRange: String representation of budget if mentioned (e.g. "₹5,000")
- budgetAmount: Integer numeric budget
- preferences: Array of extracted preference keywords
- constraints: Array of explicit constraints
- executionRequired: Boolean (true if user explicitly wants to book, order, buy, arrange)
- approvalRequired: Boolean (true for consequential bookings/financial commitments)
- missingInfo: Array of critical missing information strings (only if action is impossible without it)

Customer Request:
"${rawInput}"

Respond strictly with valid JSON. No markdown ticks, no preamble.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json\s*|\s*```$/g, '');
    const parsed = JSON.parse(text);

    // Reconcile AI extraction with deterministic customer constraints
    const reconciled = EntityIntegrityValidator.validateAndReconcile({
      rawInput,
      aiCategory: parsed.category,
      aiDestination: parsed.destination || destination,
      aiOrigin: parsed.origin || origin,
      aiLocation: parsed.location || location,
      aiPartySize: parsed.partySize || effectivePartySize,
      aiBudget: parsed.budgetAmount || parsed.budgetRange || effectiveBudget,
    });

    return {
      ...heuristicResult,
      ...parsed,
      category: (parsed.category || heuristicResult.category).toLowerCase(),
      serviceCategory: (parsed.category || heuristicResult.serviceCategory) as ServiceCategory,
      objective: (parsed.objective || heuristicResult.objective) as TaskObjective,
      action: parsed.action || heuristicResult.action,
      intent: parsed.intent || heuristicResult.intent,
      origin: reconciled.origin,
      destination: reconciled.destination,
      originAirport: reconciled.originAirport,
      destinationAirport: reconciled.destinationAirport,
      location: reconciled.location,
      partySize: reconciled.partySize || heuristicResult.partySize,
      guests: reconciled.partySize || heuristicResult.guests,
      provenance: reconciled.provenance,
      customerProvidedDetails: {
        rawInput,
        mismatchDetected: reconciled.isMismatchDetected,
        mismatchDetails: reconciled.mismatchDetails,
      },
      executionRequired: parsed.executionRequired !== undefined ? parsed.executionRequired : heuristicResult.executionRequired,
      approvalRequired: parsed.approvalRequired !== undefined ? parsed.approvalRequired : heuristicResult.approvalRequired,
    };
  } catch (error) {
    logger.warn({ error, rawInput }, 'AI request understanding fallback to heuristics');
    return heuristicResult;
  }
}
