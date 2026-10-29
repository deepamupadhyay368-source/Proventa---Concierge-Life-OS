import { NextRequest, NextResponse } from 'next/server';
import { extractStructuredMissionBrief } from '@/lib/marketplace/mission-ai';
import { isAppError, toSafeError, ValidationError } from '@/lib/errors';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rateLimited = rateLimitMiddleware(req, {
      keyPrefix: 'mission_ai_extract',
      max: 30,
      windowMs: 60_000,
    });
    if (rateLimited) return rateLimited;

    const body = await req.json();
    if (!body.naturalLanguagePrompt || typeof body.naturalLanguagePrompt !== 'string') {
      throw new ValidationError('naturalLanguagePrompt is required.');
    }

    const brief = await extractStructuredMissionBrief({
      naturalLanguagePrompt: body.naturalLanguagePrompt,
      structuredOverrides: body.structuredOverrides,
    });

    return NextResponse.json({ brief });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}
