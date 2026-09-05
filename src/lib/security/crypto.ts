import { createHash, createHmac, randomBytes } from 'crypto';

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function createSignedToken(payload: string, secret: string): string {
  const token = randomBytes(32).toString('base64url');
  const signature = createHmac('sha256', secret).update(`${token}.${payload}`).digest('base64url');
  return `${token}.${signature}`;
}

export function verifySignedToken(
  signedToken: string,
  payload: string,
  secret: string,
): boolean {
  const parts = signedToken.split('.');
  if (parts.length !== 2) return false;
  const [token, signature] = parts;
  const expectedSig = createHmac('sha256', secret)
    .update(`${token}.${payload}`)
    .digest('base64url');
  // Timing-safe comparison
  return timingSafeEqual(signature, expectedSig);
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Run comparison anyway to prevent timing attacks
    let diff = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function generateNumericOTP(digits = 6): string {
  const max = Math.pow(10, digits);
  const min = Math.pow(10, digits - 1);
  const random = parseInt(randomBytes(4).toString('hex'), 16);
  return String(min + (random % (max - min))).padStart(digits, '0');
}

/**
 * AES-256-GCM authenticated encryption for sensitive PII & credentials at rest
 */
const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || process.env.AUTH_SECRET || 'proventa_secure_symmetric_encryption_key_32bytes!';
  return createHash('sha256').update(secret).digest();
}

export function encryptData(text: string): string {
  const iv = randomBytes(12);
  const cipher = require('crypto').createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptData(cipherText: string): string | null {
  try {
    const [ivHex, authTagHex, encrypted] = cipherText.split(':');
    if (!ivHex || !authTagHex || !encrypted) return null;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = require('crypto').createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return null;
  }
}
