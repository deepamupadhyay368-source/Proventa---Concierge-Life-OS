import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@/lib/logger';

const apiKey = process.env.GEMINI_API_KEY || '';

export const isAIAvailable = Boolean(apiKey && apiKey !== 'your-gemini-api-key');

export const geminiClient = isAIAvailable ? new GoogleGenerativeAI(apiKey) : null;

export function getGeminiModel(modelName = 'gemini-1.5-pro') {
  if (!geminiClient) {
    throw new Error('Gemini API is not configured or unavailable');
  }
  return geminiClient.getGenerativeModel({ model: modelName });
}
