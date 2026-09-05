import { searchProviders } from '../tools/allowlist';
import { getGeminiModel, isAIAvailable } from '../client';
import { logger } from '@/lib/logger';

export interface ResearchBrief {
  query: string;
  category: string;
  matchedProviders: Array<{
    id: string;
    name: string;
    address: string | null;
    reliabilityScore: number | null;
    services: Array<{ name: string; priceRange: string | null }>;
  }>;
  aiNotes: string;
  requiresManualVerification: boolean;
}

export async function conductResearch(params: {
  category: string;
  intent: string;
  location?: string;
}): Promise<ResearchBrief> {
  const providers = await searchProviders({
    citySlug: 'ahmedabad',
    categorySlug: params.category,
    query: params.intent,
  });

  let aiNotes = 'Providers retrieved from Ahmedabad verified network.';
  let requiresManualVerification = true;

  if (isAIAvailable && providers.length > 0) {
    try {
      const model = getGeminiModel('gemini-1.5-flash');
      const prompt = 'Given customer intent: ' + params.intent + ' and verified providers in Ahmedabad: ' + JSON.stringify(providers) + '. Evaluate which provider best fits.';
      const response = await model.generateContent(prompt);
      aiNotes = response.response.text();
    } catch (e) {
      logger.warn({ error: e }, 'AI brief generation failed, using default notes');
    }
  }

  return {
    query: params.intent,
    category: params.category,
    matchedProviders: providers,
    aiNotes,
    requiresManualVerification,
  };
}
