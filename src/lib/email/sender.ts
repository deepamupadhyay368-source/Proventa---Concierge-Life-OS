import { Resend } from 'resend';
import { logger } from '@/lib/logger';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM ?? 'Proventa <hello@proventa.in>';
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? 'concierge@proventa.in';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://proventa.in';

export async function sendVerificationEmail(params: {
  email: string;
  name: string;
  token: string;
}) {
  if (!resend) {
    logger.info({ email: params.email }, 'Resend API key not configured, skipping verification email');
    return;
  }
  const url = `${APP_URL}/verify?token=${params.token}`;
  try {
    await resend.emails.send({
      from: FROM,
      to: params.email,
      reply_to: REPLY_TO,
      subject: 'Verify your Proventa account',
      html: buildVerificationEmail({ name: params.name, url }),
    });
    logger.info({ email: params.email }, 'Verification email sent');
  } catch (error) {
    logger.error({ error, email: params.email }, 'Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(params: {
  email: string;
  name: string;
  token: string;
}) {
  if (!resend) {
    logger.info({ email: params.email }, 'Resend API key not configured, skipping password reset email');
    return;
  }
  const url = `${APP_URL}/reset-password?token=${params.token}`;
  try {
    await resend.emails.send({
      from: FROM,
      to: params.email,
      reply_to: REPLY_TO,
      subject: 'Reset your Proventa password',
      html: buildPasswordResetEmail({ name: params.name, url }),
    });
    logger.info({ email: params.email }, 'Password reset email sent');
  } catch (error) {
    logger.error({ error, email: params.email }, 'Failed to send password reset email');
  }
}

export async function sendWave1RegistrationEmail(params: {
  email: string;
  name: string;
}) {
  if (!resend) {
    logger.info({ email: params.email }, 'Resend API key not configured, skipping Wave 1 registration email');
    return;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: params.email,
      reply_to: REPLY_TO,
      subject: "You're on the Proventa Wave 1 list.",
      html: buildWave1RegistrationEmail({ name: params.name }),
    });
  } catch (error) {
    logger.error({ error, email: params.email }, 'Failed to send Wave 1 registration email');
  }
}

export async function sendWave1InvitationEmail(params: {
  email: string;
  name: string;
  token: string;
}) {
  if (!resend) {
    logger.info({ email: params.email }, 'Resend API key not configured, skipping Wave 1 invitation email');
    return;
  }
  const url = `${APP_URL}/wave1/accept?token=${params.token}`;
  try {
    await resend.emails.send({
      from: FROM,
      to: params.email,
      reply_to: REPLY_TO,
      subject: "You've been invited to Proventa Wave 1.",
      html: buildWave1InvitationEmail({ name: params.name, url }),
    });
  } catch (error) {
    logger.error({ error, email: params.email }, 'Failed to send Wave 1 invitation email');
  }
}

// ============================================================
// EMAIL TEMPLATES (inline HTML — clean, premium, minimal)
// ============================================================

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Proventa</title>
<style>
body { margin: 0; padding: 0; background: #fafaf9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #242321; }
.wrapper { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
.header { margin-bottom: 40px; }
.logo { font-size: 20px; font-weight: 600; letter-spacing: -0.5px; color: #242321; }
.logo span { color: #8a7053; font-size: 10px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; display: block; margin-top: 2px; }
.card { background: #ffffff; border: 1px solid #ebe9e6; border-radius: 8px; padding: 40px; margin: 24px 0; }
.cta { display: inline-block; background: #6d5941; color: #ffffff !important; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 15px; font-weight: 500; margin: 24px 0; }
.footer { margin-top: 40px; font-size: 13px; color: #928f88; line-height: 1.6; }
a { color: #6d5941; }
p { line-height: 1.7; margin: 0 0 16px; }
h2 { font-size: 22px; font-weight: 600; margin: 0 0 20px; letter-spacing: -0.5px; }
</style>
</head>
<body>
<div class="wrapper">
<div class="header"><div class="logo">Proventa<span>Concierge Life OS</span></div></div>
${content}
<div class="footer"><p>Proventa &mdash; Ahmedabad, Gujarat, India<br>If you did not request this, you can ignore this email safely.</p></div>
</div>
</body>
</html>`;
}

function buildVerificationEmail({ name, url }: { name: string; url: string }): string {
  return emailWrapper(`
<div class="card">
<h2>Verify your email address.</h2>
<p>Hello ${name},</p>
<p>Please verify your email address to activate your Proventa account.</p>
<a href="${url}" class="cta">Verify Email Address</a>
<p style="font-size:13px;color:#928f88;">This link expires in 24 hours. If the button doesn't work, copy and paste this URL:<br>${url}</p>
</div>`);
}

function buildPasswordResetEmail({ name, url }: { name: string; url: string }): string {
  return emailWrapper(`
<div class="card">
<h2>Reset your password.</h2>
<p>Hello ${name},</p>
<p>We received a request to reset your Proventa password. Click below to choose a new password.</p>
<a href="${url}" class="cta">Reset Password</a>
<p style="font-size:13px;color:#928f88;">This link expires in 1 hour. If you didn't request this, your password remains unchanged.</p>
</div>`);
}

function buildWave1RegistrationEmail({ name }: { name: string }): string {
  return emailWrapper(`
<div class="card">
<h2>You're on the list.</h2>
<p>Hello ${name},</p>
<p>Thank you for joining the Proventa Wave 1 waitlist. We're building something we think you'll find genuinely useful.</p>
<p>When we're ready to invite you, you'll hear from us directly at this address. We'll keep it brief.</p>
<p>In the meantime, if you have questions, reply to this email.</p>
</div>`);
}

function buildWave1InvitationEmail({ name, url }: { name: string; url: string }): string {
  return emailWrapper(`
<div class="card">
<h2>Your invitation to Proventa.</h2>
<p>Hello ${name},</p>
<p>You've been invited to join Proventa Wave 1 &mdash; our first cohort in Ahmedabad.</p>
<p>Your invitation is ready. Click below to create your account.</p>
<a href="${url}" class="cta">Accept Invitation</a>
<p style="font-size:13px;color:#928f88;">This invitation expires in 7 days.</p>
</div>`);
}
