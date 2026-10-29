import { z } from 'zod';
import { geminiClient, isAIAvailable } from '@/lib/ai/client';
import { getCategories } from './repository';
import type {
  StructuredMissionBrief,
  MissionUrgency,
  MissionDeliveryMode,
} from './mission-types';

export const structuredMissionBriefSchema = z.object({
  title: z.string().min(5).max(180),
  categorySlug: z.string().min(2),
  categoryName: z.string().min(2),
  scopeSummary: z.string().min(10).max(1000),
  deliverables: z.array(z.string().min(2)).min(1),
  specifications: z.record(z.string(), z.string()).default({}),
  qualityStandards: z.array(z.string()).default([]),
  urgencyLevel: z.enum(['STANDARD', 'URGENT', 'CRITICAL']).default('STANDARD'),
  timeline: z.string().min(2).default('Within 2–4 weeks'),
  budgetMin: z.number().int().nonnegative().nullable().default(null),
  budgetMax: z.number().int().nonnegative().nullable().default(null),
  city: z.string().min(2).default('Ahmedabad'),
  deliveryMode: z.enum(['ON_SITE', 'REMOTE', 'DELIVERY', 'EITHER']).default('EITHER'),
  priorities: z.array(z.string()).default([]),
  confidenceScore: z.number().min(0).max(1).default(0.85),
  missingInformation: z.array(z.string()).default([]),
  clarificationQuestions: z.array(z.string()).default([]),
  aiExtracted: z.boolean().default(false),
});

export type StructuredMissionBriefInput = z.infer<typeof structuredMissionBriefSchema>;

export interface RawMissionInput {
  naturalLanguagePrompt: string;
  structuredOverrides?: {
    city?: string;
    budgetMin?: number;
    budgetMax?: number;
    timeline?: string;
    urgencyLevel?: MissionUrgency;
    categorySlug?: string;
    deliveryMode?: MissionDeliveryMode;
  };
}

/**
 * Deterministic fallback requirement parser that analyzes keywords, city names,
 * budgets, and timelines without calling external AI APIs.
 */
export function extractMissionBriefFallback(
  input: RawMissionInput,
): StructuredMissionBrief {
  const text = input.naturalLanguagePrompt || '';
  const overrides = input.structuredOverrides || {};

  const categories = getCategories({ onlyTopLevel: true });
  const lower = text.toLowerCase();

  // 1. Identify category match by keywords
  let selectedCategory = categories.find((c) =>
    overrides.categorySlug ? c.slug === overrides.categorySlug : false,
  );

  if (!selectedCategory) {
    const categoryKeywords: Record<string, string[]> = {
      'manufacturing': ['cnc', 'machining', 'fabrication', 'metal', 'molding', 'casting', 'oem', 'lathe', 'tooling', 'parts', 'enclosures'],
      'construction-building-materials': ['construction', 'warehouse', 'shed', 'building', 'civil', 'contractor', 'flooring', 'architect', 'interior'],
      'industrial-supplies': ['packaging', 'boxes', 'cartons', 'corrugated', 'hardware', 'supplies'],
      'technology-software': ['software', 'app', 'website', 'portal', 'cloud', 'developer', 'crm', 'erp', 'api'],
      'logistics-transportation': ['logistics', 'transport', 'shipping', 'freight', 'dispatch', 'fleet'],
      'fashion-apparel': ['textile', 'fabric', 'yarn', 'garment', 'cotton', 'weaving', 'dyeing'],
      'food-hospitality': ['catering', 'food', 'beverage', 'snack', 'bakery', 'restaurant', 'meal'],
      'legal-compliance': ['legal', 'compliance', 'trademark', 'patent', 'contract', 'corporate law'],
      'accounting-finance': ['accounting', 'audit', 'gst', 'tax', 'chartered', 'bookkeeping'],
      'marketing-creative-services': ['marketing', 'branding', 'design', 'seo', 'campaign', 'creative'],
    };

    let bestCategorySlug = 'manufacturing';
    let maxHits = 0;

    for (const [slug, keywords] of Object.entries(categoryKeywords)) {
      const hits = keywords.filter((k) => lower.includes(k)).length;
      if (hits > maxHits) {
        maxHits = hits;
        bestCategorySlug = slug;
      }
    }

    selectedCategory =
      categories.find((c) => c.slug === bestCategorySlug) || categories[0];
  }

  // 2. Location extraction
  const cities = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Mumbai', 'Pune', 'Delhi', 'Bengaluru'];
  let matchedCity = overrides.city || 'Ahmedabad';
  for (const c of cities) {
    if (lower.includes(c.toLowerCase())) {
      matchedCity = c;
      break;
    }
  }

  // 3. Budget extraction (e.g. ₹50,000, 50k, 2 lakhs, 10-20 lakh)
  let bMin = overrides.budgetMin ?? null;
  let bMax = overrides.budgetMax ?? null;

  if (bMin === null && bMax === null) {
    const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)/i);
    const numMatch = lower.match(/₹?\s*(\d{2,3}(?:,\d{2,3})+|\d{4,9})/);

    if (lakhMatch) {
      const lakhVal = parseFloat(lakhMatch[1]) * 100000;
      bMin = Math.round(lakhVal * 0.8);
      bMax = Math.round(lakhVal * 1.2);
    } else if (numMatch) {
      const rawVal = parseInt(numMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(rawVal) && rawVal > 1000) {
        bMin = Math.round(rawVal * 0.8);
        bMax = Math.round(rawVal * 1.2);
      }
    }
  }

  // 4. Timeline & urgency
  let urgency: MissionUrgency = overrides.urgencyLevel || 'STANDARD';
  if (lower.includes('urgent') || lower.includes('asap') || lower.includes('immediate')) {
    urgency = 'CRITICAL';
  } else if (lower.includes('1 week') || lower.includes('few days')) {
    urgency = 'URGENT';
  }

  let timeline = overrides.timeline || 'Within 2–4 weeks';
  if (lower.includes('immediate') || lower.includes('urgently')) {
    timeline = 'Immediate / Within 1 week';
  } else if (lower.includes('2 weeks') || lower.includes('two weeks')) {
    timeline = 'Within 2 weeks';
  } else if (lower.includes('month') || lower.includes('30 days')) {
    timeline = 'Within 1 month';
  }

  // 5. Deliverables & Specifications
  const deliverables: string[] = [];
  const sentences = text
    .split(/[.\n;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);

  if (sentences.length > 0) {
    deliverables.push(sentences[0]);
    if (sentences.length > 1) {
      deliverables.push(...sentences.slice(1, 4));
    }
  } else {
    deliverables.push('Turnkey execution and verified supplier quotation according to customer specification.');
  }

  const missingInfo: string[] = [];
  const clarificationQuestions: string[] = [];

  if (!bMax && !bMin) {
    missingInfo.push('Indicative budget target or cap');
    clarificationQuestions.push('Do you have an indicative budget range (e.g. ₹50,000 to ₹1,50,000) to help suppliers tailor quotes?');
  }

  if (!lower.includes('unit') && !lower.includes('qty') && !lower.includes('quantity') && !lower.includes('sq.ft') && !lower.includes('kg') && !lower.includes('batch')) {
    missingInfo.push('Precise quantity or scope volume');
    clarificationQuestions.push('What specific quantity, batch volume, or square footage is required for this requirement?');
  }

  const titleCandidate = sentences[0]
    ? sentences[0].slice(0, 110)
    : `${selectedCategory.name} Requirement in ${matchedCity}`;

  return {
    title: titleCandidate,
    categorySlug: selectedCategory.slug,
    categoryName: selectedCategory.name,
    scopeSummary: text.length > 20 ? text : `Commercial requirement for ${selectedCategory.name} in ${matchedCity}.`,
    deliverables,
    specifications: {
      location: matchedCity,
      sector: selectedCategory.name,
      urgency,
    },
    qualityStandards: ['Standard commercial compliance', 'GST registered supplier preferred'],
    urgencyLevel: urgency,
    timeline,
    budgetMin: bMin,
    budgetMax: bMax,
    city: matchedCity,
    deliveryMode: overrides.deliveryMode || 'EITHER',
    priorities: ['Verified business credentials', 'Transparent pricing', 'Committed turnaround time'],
    confidenceScore: 0.82,
    missingInformation: missingInfo,
    clarificationQuestions,
    aiExtracted: false,
  };
}

/**
 * Extracts structured mission brief from natural language using Gemini AI
 * with full fallback and Zod schema validation.
 */
export async function extractStructuredMissionBrief(
  input: RawMissionInput,
): Promise<StructuredMissionBrief> {
  const fallback = extractMissionBriefFallback(input);

  if (!isAIAvailable || !geminiClient) {
    return fallback;
  }

  try {
    const categories = getCategories({ onlyTopLevel: true });
    const categoryList = categories.map((c) => `${c.slug} (${c.name})`).join(', ');

    const prompt = `You are the PROVENTA Mission Engine AI Extraction Architect.
PROVENTA is a verified business marketplace connecting commercial buyers with registered suppliers, manufacturers, contractors, and service providers.

Your job is to parse the user's natural language business requirement into a structured mission brief JSON.

AVAILABLE SECTORS:
${categoryList}

USER INPUT:
"${input.naturalLanguagePrompt}"

STRUCTURED OVERRIDES (if any):
${JSON.stringify(input.structuredOverrides || {})}

Return a valid JSON object strictly matching this TypeScript structure:
{
  "title": "Clear concise 8-15 word commercial headline describing the requirement",
  "categorySlug": "exact matching slug from available sectors",
  "categoryName": "exact matching name from available sectors",
  "scopeSummary": "1-3 sentences structured summary of the requirement",
  "deliverables": ["array of 2-5 specific tangible deliverables or line items required"],
  "specifications": { "key": "value" pairs of dimensions, materials, technical specs },
  "qualityStandards": ["e.g. ISO 9001, CE, BIS, GST compliant, warranty required"],
  "urgencyLevel": "STANDARD" | "URGENT" | "CRITICAL",
  "timeline": "e.g. Within 10 days, Within 2 weeks, 1 to 3 months",
  "budgetMin": integer number in INR or null,
  "budgetMax": integer number in INR or null,
  "city": "operating city e.g. Ahmedabad, Surat, Mumbai, or Pan-India",
  "deliveryMode": "ON_SITE" | "REMOTE" | "DELIVERY" | "EITHER",
  "priorities": ["top 2-3 customer evaluation priorities e.g. certified quality, turnaround speed, price efficiency"],
  "confidenceScore": float between 0.70 and 0.99,
  "missingInformation": ["array of any missing critical specs needed for formal supplier quotes"],
  "clarificationQuestions": ["array of polite clarifying questions for any missing critical information"]
}

OUTPUT RULES:
- Output ONLY the raw JSON object. Do not wrap in markdown or backticks.
- Never invent fake supplier names or prices if not specified.
- Clearly note missing specifications in missingInformation and clarificationQuestions.`;

    const model = geminiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const response = await model.generateContent(prompt);
    const rawText = response.response.text().trim();

    // Clean any backticks or markdown
    const cleanedText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '')
      .trim();

    const parsedJson = JSON.parse(cleanedText);
    const validated = structuredMissionBriefSchema.safeParse({
      ...parsedJson,
      aiExtracted: true,
    });

    if (validated.success) {
      return validated.data;
    }

    // Fallback if schema validation failed
    return {
      ...fallback,
      confidenceScore: 0.88,
    };
  } catch (err) {
    console.warn('[MissionAI] Gemini parsing failed or timed out, using fallback:', err);
    return fallback;
  }
}
