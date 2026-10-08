import { NextRequest, NextResponse } from 'next/server';
import { understandRequest } from '@/lib/ai/agents/understanding';
import { mapExtractedDataToForm } from '@/lib/requests/request-builder';
import { isAppError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Text is required for auto-fill' }, { status: 400 });
    }

    const extracted = await understandRequest(text.trim());
    const structured = mapExtractedDataToForm(extracted, text.trim());

    return NextResponse.json({
      success: true,
      extracted,
      structured,
    });
  } catch (error: any) {
    console.error('[POST /api/requests/parse-intent error]:', error);
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    return NextResponse.json(
      { error: 'Failed to extract structured fields from request text' },
      { status: 500 }
    );
  }
}
