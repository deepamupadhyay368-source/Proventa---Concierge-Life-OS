/**
 * PROVENTA Access Key Generator & Cryptographic Verification
 * 
 * Provides cryptographically secure, high-entropy (128-bit) access keys
 * formatted as: PROV-XXXX-XXXX-XXXX-XXXX
 * Only the bcrypt/PBKDF2 hash is persisted in the database.
 */

import bcrypt from 'bcryptjs';

export interface GeneratedAccessKey {
  plaintextKey: string;
  hash: string;
}

// Temporary one-time access key store (cleared immediately upon consumption)
const oneTimeKeyStore = new Map<string, { key: string; expiresAt: number }>();

function getRandomHex(byteCount: number): string {
  const bytes = new Uint8Array(byteCount);
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < byteCount; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Generates a high-entropy PROVENTA Access Key and its cryptographic hash.
 * 128-bit random entropy formatted into uppercase 4-character blocks.
 */
export async function generateProventaAccessKey(): Promise<GeneratedAccessKey> {
  // 16 bytes = 128 bits of cryptographic randomness
  const hex = getRandomHex(16);

  // Format into 4 chunks: PROV-XXXX-XXXX-XXXX-XXXX
  const part1 = hex.slice(0, 4);
  const part2 = hex.slice(4, 8);
  const part3 = hex.slice(8, 12);
  const part4 = hex.slice(12, 16);

  const plaintextKey = `PROV-${part1}-${part2}-${part3}-${part4}`;

  // Hash using bcrypt with cost factor 12
  const hash = await bcrypt.hash(plaintextKey, 12);

  return {
    plaintextKey,
    hash,
  };
}

/**
 * Normalizes user-entered access key (trims whitespace, converts to uppercase)
 */
export function normalizeAccessKey(rawKey: string): string {
  const cleaned = rawKey.trim().toUpperCase();
  if (cleaned.startsWith('PROV-')) {
    return cleaned;
  }
  return `PROV-${cleaned}`;
}

/**
 * Verifies an access key against a stored hash
 */
export async function verifyAccessKey(candidateKey: string, storedHash: string): Promise<boolean> {
  if (!candidateKey || !storedHash) return false;
  const normalized = normalizeAccessKey(candidateKey);
  try {
    return await bcrypt.compare(normalized, storedHash);
  } catch {
    return false;
  }
}

/**
 * Stages a newly generated key for strictly one-time display to the user.
 * Expires automatically after 10 minutes if unconsumed.
 */
export function stageOneTimeAccessKey(userId: string, plaintextKey: string): void {
  oneTimeKeyStore.set(userId, {
    key: plaintextKey,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
}

/**
 * Consumes and deletes the one-time access key.
 * Can only be read once.
 */
export function consumeOneTimeAccessKey(userId: string): string | null {
  const entry = oneTimeKeyStore.get(userId);
  if (!entry) return null;
  oneTimeKeyStore.delete(userId);
  if (entry.expiresAt < Date.now()) return null;
  return entry.key;
}
