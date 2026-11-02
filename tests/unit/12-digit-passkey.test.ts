import { describe, it, expect } from 'vitest';
import {
  generateProventaAccessKey,
  verifyAccessKey,
  format12DigitPassKey,
  normalizePassKey,
  generateRandom12Digits,
} from '@/lib/auth/access-key';

describe('PROVENTA 12-Digit Pass Key Protocol', () => {
  it('generates exactly 12 numeric digits', () => {
    const digits = generateRandom12Digits();
    expect(digits).toHaveLength(12);
    expect(/^\d{12}$/.test(digits)).toBe(true);
    expect(digits[0]).not.toBe('0');
  });

  it('formats 12 digits into 3 blocks of 4 digits (XXXX-XXXX-XXXX)', () => {
    const formatted = format12DigitPassKey('849238105729');
    expect(formatted).toBe('8492-3810-5729');
  });

  it('normalizes user input by stripping spaces and hyphens', () => {
    expect(normalizePassKey('8492-3810-5729')).toBe('849238105729');
    expect(normalizePassKey('8492 3810 5729')).toBe('849238105729');
    expect(normalizePassKey('  8492-3810-5729  ')).toBe('849238105729');
    expect(normalizePassKey('849238105729')).toBe('849238105729');
  });

  it('generates a valid salted bcrypt hash for 12-digit pass key', async () => {
    const { plaintextKey, formattedKey, hash } = await generateProventaAccessKey();
    expect(plaintextKey).toHaveLength(12);
    expect(formattedKey).toMatch(/^\d{4}-\d{4}-\d{4}$/);
    expect(hash.startsWith('$2')).toBe(true);
  });

  it('verifies correct candidate pass key in raw digits and formatted hyphens', async () => {
    const { plaintextKey, formattedKey, hash } = await generateProventaAccessKey();

    // Verify raw 12 digits
    const isValidRaw = await verifyAccessKey(plaintextKey, hash);
    expect(isValidRaw).toBe(true);

    // Verify formatted with hyphens
    const isValidFormatted = await verifyAccessKey(formattedKey, hash);
    expect(isValidFormatted).toBe(true);

    // Verify with arbitrary spaces
    const isValidSpaces = await verifyAccessKey(
      `${plaintextKey.slice(0, 4)} ${plaintextKey.slice(4, 8)} ${plaintextKey.slice(8, 12)}`,
      hash,
    );
    expect(isValidSpaces).toBe(true);

    // Reject wrong key
    const isWrongValid = await verifyAccessKey('111122223333', hash);
    expect(isWrongValid).toBe(false);
  });
});
