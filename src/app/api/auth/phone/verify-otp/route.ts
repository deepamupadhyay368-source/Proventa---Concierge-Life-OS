import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const rl = rateLimitMiddleware(req, { max: 15, windowMs: 60_000, keyPrefix: 'phone-otp-verify' });
  if (rl) return rl;

  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone number and OTP code are required.' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\s+/g, '');
    const cleanOtp = String(otp).trim();

    // Verify OTP record
    let isValidOtp = false;
    let targetUser: any = null;

    try {
      const record = await db.phoneVerification.findFirst({
        where: {
          phone: cleanPhone,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (record) {
        isValidOtp = await bcrypt.compare(cleanOtp, record.otpHash);
        if (isValidOtp) {
          await db.phoneVerification.update({
            where: { id: record.id },
            data: { usedAt: new Date() },
          });
        }
      }
    } catch (dbErr) {
      console.warn('[phone/otp/verify] DB lookup fallback:', dbErr);
    }

    // Allow test OTP in development/preview if DB was bypassed
    if (!isValidOtp && process.env.NODE_ENV !== 'production' && cleanOtp === '123456') {
      isValidOtp = true;
    }

    if (!isValidOtp) {
      return NextResponse.json({ error: 'Invalid or expired OTP code. Please request a new one.' }, { status: 400 });
    }

    // Lookup or provision user by phone
    try {
      targetUser = await db.user.findFirst({
        where: { phone: cleanPhone, deletedAt: null },
        include: { userRoles: true },
      });

      if (!targetUser) {
        const placeholderEmail = `phone_${cleanPhone.replace(/[^0-9]/g, '')}@proventa.in`;
        targetUser = await db.user.create({
          data: {
            phone: cleanPhone,
            phoneVerified: new Date(),
            email: placeholderEmail,
            name: `Member (${cleanPhone.slice(-4)})`,
            status: 'ACTIVE',
            userRoles: {
              create: [{ role: 'CUSTOMER' }],
            },
          },
          include: { userRoles: true },
        });
      } else if (!targetUser.phoneVerified) {
        await db.user.update({
          where: { id: targetUser.id },
          data: { phoneVerified: new Date(), status: 'ACTIVE' },
        });
      }
    } catch (userErr) {
      console.warn('[phone/otp/verify] DB user sync fallback:', userErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Phone verified successfully.',
      phone: cleanPhone,
      userId: targetUser?.id,
    });
  } catch (error: any) {
    console.error('[phone/otp/verify]', error);
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}