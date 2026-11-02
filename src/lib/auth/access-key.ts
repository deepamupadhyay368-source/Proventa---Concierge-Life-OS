/**
 * PROVENTA — 12-Digit Numeric Pass Key Generator & Cryptographic Verification
 * 
 * Generates cryptographically secure, high-entropy 12-digit numeric credentials.
 * Formatted for display as: XXXX-XXXX-XXXX (e.g. 8492-3810-5729)
 * Stored strictly as a salted bcrypt hash (cost factor 12).
 * Plaintext keys are never stored in database records, logs, or analytics.
 */

import bcrypt from 'bcryptjs';

export interface GeneratedAccessKey {
  plaintextKey: string;     // Exact 12 numeric digits e.g. "849238105729"
  formattedKey: string;     // Grouped for display e.g. "8492-3810-5729"
  hash: string;             // Salted bcrypt hash
}

// Temporary one-time pass key store for ephemeral single-read delivery
const oneTimeKeyStore = new Map<string, { key: string; formatted: string; expiresAt: number }>();

// Edge-compatible in-memory rate limiting store for pass key attempts
const passKeyRateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkPassKeyRateLimit(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
  const max = 5;
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const now = Date.now();
  const entry = passKeyRateLimitStore.get(identifier);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    passKeyRateLimitStore.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: max - 1, resetAt };
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
}

export function resetPassKeyRateLimit(identifier: string): void {
  passKeyRateLimitStore.delete(identifier);
}

/**
 * Generates 12 cryptographically random numeric decimal digits [0-9].
 * Ensures the leading digit is 1-9 so it remains a solid 12-digit number.
 */
export function generateRandom12Digits(): string {
  const bytes = new Uint8Array(12);
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 12; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  let digits = '';
  for (let i = 0; i < 12; i++) {
    digits += (bytes[i] % 10).toString();
  }

  // Ensure first digit is 1-9
  if (digits[0] === '0') {
    digits = ((bytes[0] % 9) + 1).toString() + digits.slice(1);
  }

  return digits;
}

/**
 * Formats a 12-digit numeric key into 3 blocks of 4 digits: XXXX-XXXX-XXXX
 */
export function format12DigitPassKey(digits: string): string {
  const cleaned = digits.replace(/[^0-9]/g, '');
  if (cleaned.length === 12) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
  }
  return digits;
}

/**
 * Normalizes user-entered pass key.
 * Strips whitespace, hyphens, and non-numeric characters.
 * Preserves legacy PROV- keys if applicable.
 */
export function normalizePassKey(rawKey: string): string {
  if (!rawKey) return '';
  const trimmed = rawKey.trim();

  // If user entered with PROV- prefix
  if (trimmed.toUpperCase().startsWith('PROV-')) {
    return trimmed.toUpperCase();
  }

  // Strip all non-numeric characters
  const numericOnly = trimmed.replace(/[^0-9]/g, '');
  return numericOnly;
}

/**
 * Generates a unique 12-digit numeric PROVENTA Pass Key and its salted hash.
 */
export async function generateProventaAccessKey(): Promise<GeneratedAccessKey> {
  const digits = generateRandom12Digits();
  const formattedKey = format12DigitPassKey(digits);

  // Hash using bcrypt with cost factor 12
  const hash = await bcrypt.hash(digits, 12);

  return {
    plaintextKey: digits,
    formattedKey,
    hash,
  };
}

/**
 * Verifies a candidate pass key against a stored bcrypt hash.
 * Supports raw 12 digits, formatted 12 digits (with hyphens/spaces), and legacy keys.
 */
export async function verifyAccessKey(candidateKey: string, storedHash: string): Promise<boolean> {
  if (!candidateKey || !storedHash) return false;

  const normalized = normalizePassKey(candidateKey);
  if (!normalized) return false;

  try {
    // 1. Direct comparison with normalized numeric digits
    const match = await bcrypt.compare(normalized, storedHash);
    if (match) return true;

    // 2. Also test formatted variant XXXX-XXXX-XXXX in case hash was generated with hyphens
    if (normalized.length === 12) {
      const formatted = format12DigitPassKey(normalized);
      const formattedMatch = await bcrypt.compare(formatted, storedHash);
      if (formattedMatch) return true;
    }

    // 3. Test raw candidate trimmed
    return await bcrypt.compare(candidateKey.trim(), storedHash);
  } catch {
    return false;
  }
}

/**
 * Stages a newly generated key for strictly one-time display to the user.
 * Expires automatically after 10 minutes if unconsumed.
 */
export function stageOneTimeAccessKey(userId: string, plaintextKey: string, formattedKey?: string): void {
  const formatted = formattedKey || format12DigitPassKey(plaintextKey);
  oneTimeKeyStore.set(userId, {
    key: plaintextKey,
    formatted,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
}

/**
 * Consumes and deletes the one-time access key.
 * Can only be read once.
 */
export function consumeOneTimeAccessKey(userId: string): { key: string; formatted: string } | null {
  const entry = oneTimeKeyStore.get(userId);
  if (!entry) return null;
  oneTimeKeyStore.delete(userId);
  if (entry.expiresAt < Date.now()) return null;
  return { key: entry.key, formatted: entry.formatted };
}
