import { NextResponse } from 'next/server';
import { parseNaturalLanguageRequirement } from '@/lib/procurement/ai-extractor';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.prompt || body.text;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt text is required' },
        { status: 400 }
      );
    }

    const parsed = parseNaturalLanguageRequirement(prompt);
    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error parsing requirement:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to parse requirement' },
      { status: 500 }
    );
  }
}
