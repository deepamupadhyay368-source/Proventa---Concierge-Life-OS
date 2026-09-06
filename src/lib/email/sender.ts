import { Resend } from 'resend';
import { logger } from '@/lib/logger';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM ?? 'Proventa <hello@proventa.in>';
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? 'concierge@proventa.in';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://proventa.in';

// Centralized email dispatcher prioritizing native Gmail SMTP (proventa.in@gmail.com)
// with Resend fallback.
async function dispatchEmail(params: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const replyTo = params.replyTo || REPLY_TO;

  // 1. Primary: Native Gmail SMTP (Sends authentically from proventa.in@gmail.com)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: `"Proventa" <${process.env.SMTP_USER}>`,
        to: params.to,
        replyTo,
        subject: params.subject,
        html: params.html,
      });

      logger.info({ to: params.to, messageId: info.messageId }, 'Email dispatched via Gmail SMTP');
      return true;
    } catch (smtpErr) {
      logger.warn({ smtpErr, to: params.to }, 'Gmail SMTP dispatch failed, trying fallback');
    }
  }

  // 2. Secondary: Resend API
  if (resend) {
    try {
      await resend.emails.send({
        from: FROM.includes('@gmail.com') ? 'Proventa <onboarding@resend.dev>' : FROM,
        to: params.to,
        reply_to: replyTo,
        subject: params.subject,
        html: params.html,
      });
      logger.info({ to: params.to }, 'Email dispatched via Resend');
      return true;
    } catch (resendErr) {
      logger.error({ resendErr, to: params.to }, 'Resend dispatch failed');
    }
  }

  logger.warn({ to: params.to, subject: params.subject }, 'No active email provider succeeded');
  return false;
}

export async function sendVerificationEmail(params: {
  email: string;
  name: string;
  token: string;
}) {
  const url = `${APP_URL}/verify?token=${params.token}`;
  await dispatchEmail({
    to: params.email,
    subject: 'Verify your Proventa account',
    html: buildVerificationEmail({ name: params.name, url }),
  });
}

export async function sendPasswordResetEmail(params: {
  email: string;
  name: string;
  token: string;
}) {
  const url = `${APP_URL}/reset-password?token=${params.token}`;
  await dispatchEmail({
    to: params.email,
    subject: 'Reset your Proventa password',
    html: buildPasswordResetEmail({ name: params.name, url }),
  });
}

export interface Wave1RegistrationDetails {
  name: string;
  email: string;
  phone?: string | null;
  city: string;
  profession?: string | null;
  company?: string | null;
  intendedUse?: string | null;
  communicationPref?: string | null;
  referralSource?: string | null;
}

export async function sendWave1RegistrationEmail(params: {
  email: string;
  name: string;
}) {
  await dispatchEmail({
    to: params.email,
    subject: "You're on the Proventa Cohort 1 list.",
    html: buildWave1RegistrationEmail({ name: params.name }),
  });
}

export async function sendWave1AdminNotificationEmail(details: Wave1RegistrationDetails) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'proventa.in@gmail.com';
  const html = buildWave1AdminNotificationEmail(details);

  await dispatchEmail({
    to: adminEmail,
    subject: `[PROVENTA COHORT 1] New Application: ${details.name} (${details.email})`,
    html,
  });
}

export async function sendWave1InvitationEmail(params: {
  email: string;
  name: string;
  token: string;
}) {
  const url = `${APP_URL}/wave1/accept?token=${params.token}`;
  await dispatchEmail({
    to: params.email,
    subject: 'Your invitation to Proventa Cohort 1',
    html: buildWave1InvitationEmail({ name: params.name, url }),
  });
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
<div class="footer"><p>Proventa Concierge Life OS<br>If you did not request this, you can ignore this email safely.</p></div>
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
<p>You've been invited to join Proventa Cohort 1.</p>
<p>Your invitation is ready. Click below to create your account.</p>
<a href="${url}" class="cta">Accept Invitation</a>
<p style="font-size:13px;color:#928f88;">This invitation expires in 7 days.</p>
</div>`);
}

function buildWave1AdminNotificationEmail(details: Wave1RegistrationDetails): string {
  return emailWrapper(`
<div class="card">
<div style="display:inline-block;padding:4px 10px;background:#e0f2fe;color:#0369a1;font-family:monospace;font-size:11px;font-weight:600;border-radius:4px;margin-bottom:16px;">
  NEW EARLY ACCESS APPLICATION · COHORT 1
</div>
<h2>New Application Received</h2>
<p style="color:#57544f;font-size:14px;">A prospective member has submitted their Early Access Cohort 1 registration with the following details:</p>

<table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px;text-align:left;">
  <tbody>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 0;color:#64748b;width:35%;font-weight:500;">Applicant Name</td>
      <td style="padding:10px 0;color:#0f172a;font-weight:600;">${details.name}</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 0;color:#64748b;font-weight:500;">Email Address</td>
      <td style="padding:10px 0;color:#0f172a;"><a href="mailto:${details.email}" style="color:#0284c7;text-decoration:none;">${details.email}</a></td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 0;color:#64748b;font-weight:500;">Phone Number</td>
      <td style="padding:10px 0;color:#0f172a;">${details.phone || 'Not provided'}</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 0;color:#64748b;font-weight:500;">Target City</td>
      <td style="padding:10px 0;color:#0f172a;font-weight:600;">${details.city}</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 0;color:#64748b;font-weight:500;">Profession / Role</td>
      <td style="padding:10px 0;color:#0f172a;">${details.profession || 'Not provided'}</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 0;color:#64748b;font-weight:500;">Organization / Company</td>
      <td style="padding:10px 0;color:#0f172a;">${details.company || 'Not provided'}</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 0;color:#64748b;font-weight:500;">Preferred Comm Channel</td>
      <td style="padding:10px 0;color:#0f172a;">${details.communicationPref || 'EMAIL'}</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 0;color:#64748b;font-weight:500;">Referral Source</td>
      <td style="padding:10px 0;color:#0f172a;">${details.referralSource || 'Direct'}</td>
    </tr>
    <tr>
      <td style="padding:12px 0;color:#64748b;vertical-align:top;font-weight:500;">Intended Delegation Use</td>
      <td style="padding:12px 0;color:#0f172a;line-height:1.6;font-style:italic;">"${details.intendedUse || 'No specific notes entered'}"</td>
    </tr>
  </tbody>
</table>

<div style="margin-top:24px;padding:12px 16px;background:#f8fafc;border-left:4px solid #0284c7;border-radius:4px;font-size:12px;color:#475569;">
  Logged to Proventa Operations Portal. You can invite or manage this candidate from the Admin Wave 1 dashboard.
</div>
</div>`);
}
