import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { wave1RegisterSchema } from '@/lib/validation/schemas';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { sendWave1RegistrationEmail, sendWave1AdminNotificationEmail } from '@/lib/email/sender';
import { trackEvent } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  const rl = rateLimitMiddleware(req, { max: 20, windowMs: 60_000, keyPrefix: 'wave1-reg' });
  if (rl) return rl;

  try {
    const body = await req.json();
    const parsed = wave1RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please check your details and try again.', fields: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    const { name, email, phone, city, profession, company, intendedUse, communicationPref, referralSource, consentGiven } = parsed.data;

    // Persist to database with fast timeout fallback (never blocks customer)
    try {
      const dbOperation = async () => {
        const existing = await db.earlyAccessRegistration.findUnique({ where: { email } });
        if (existing) return existing;
        return await db.earlyAccessRegistration.create({
          data: {
            name,
            email,
            phone: phone || null,
            city,
            profession: profession || null,
            company: company || null,
            intendedUse: intendedUse || null,
            communicationPref: communicationPref || 'EMAIL',
            referralSource: referralSource || null,
            consentGiven,
            status: 'WAITLISTED',
          },
        });
      };

      await Promise.race([
        dbOperation(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), 2000)),
      ]);
    } catch (dbError) {
      console.warn('[wave1/register] DB persistence bypassed (proceeding with direct notification):', dbError);
    }

    // Always send confirmation email to applicant & notify admin mailbox (proventa.in@gmail.com)
    try {
      await sendWave1RegistrationEmail({ email, name });
    } catch (e) {
      console.warn('[wave1/register] User email error:', e);
    }

    try {
      await sendWave1AdminNotificationEmail({
        name,
        email,
        phone,
        city,
        profession,
        company,
        intendedUse,
        communicationPref,
        referralSource,
      });
    } catch (e) {
      console.warn('[wave1/register] Admin email error:', e);
    }

    void trackEvent({
      event: 'wave1_completed',
      properties: { city, referralSource: referralSource || 'direct' },
    });

    return NextResponse.json({ message: 'Registration received.' }, { status: 201 });
  } catch (error: any) {
    console.error('[wave1/register]', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
