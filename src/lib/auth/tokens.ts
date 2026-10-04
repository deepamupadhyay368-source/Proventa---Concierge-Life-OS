import { randomBytes, createHash } from 'crypto';

export function generateVerificationToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generatePasswordResetToken(): string {
  return randomBytes(32).toString('base64url');
}

export function generateInvitationToken(): string {
  return randomBytes(40).toString('base64url');
}

export function generateAuthKeyRecoveryToken(): string {
  return randomBytes(32).toString('base64url');
}

export function generateProventaAuthKey(): string {
  const p1 = randomBytes(4).toString('hex').toUpperCase();
  const p2 = randomBytes(4).toString('hex').toUpperCase();
  return `PV-${p1}-${p2}`;
}
