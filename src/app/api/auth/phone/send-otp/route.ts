import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const rl = rateLimitMiddleware(req, { max: 10, windowMs: 60_000, keyPrefix: 'phone-otp-send' });
  if (rl) return rl;

  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Valid phone number is required.' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\s+/g, '');
    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      return NextResponse.json({ error: 'Please enter a valid phone number (10 to 15 digits).' }, { status: 400 });
    }

    const isDev = process.env.NODE_ENV !== 'production';
    const otp = isDev ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    try {
      await db.phoneVerification.create({
        data: {
          phone: cleanPhone,
          otpHash,
          expiresAt,
        },
      });
    } catch (dbErr) {
      console.warn('[phone/otp/send] DB write fallback:', dbErr);
    }

    console.info(`[PHONE_AUTH_OTP] OTP generated for ${cleanPhone}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your mobile number.',
      ...(isDev ? { devOtpHint: '123456' } : {}),
    });
  } catch (error: any) {
    console.error('[phone/otp/send]', error);
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}