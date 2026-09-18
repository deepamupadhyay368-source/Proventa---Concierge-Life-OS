import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@/lib/logger';

const apiKey = process.env.GEMINI_API_KEY || '';

export const isAIAvailable = Boolean(apiKey && apiKey !== 'your-gemini-api-key');

export const geminiClient = isAIAvailable ? new GoogleGenerativeAI(apiKey) : null;

export function getGeminiModel(modelName?: string) {
  if (!geminiClient) {
    throw new Error('Gemini API is not configured or unavailable');
  }
  const resolvedModel = modelName || process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  return geminiClient.getGenerativeModel({ model: resolvedModel });
}
