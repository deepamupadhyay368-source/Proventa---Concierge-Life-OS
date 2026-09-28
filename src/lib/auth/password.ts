import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Strong one-way hash for Proventa Authentication Key.
 * Never store plaintext Authentication Keys.
 */
export async function hashAuthKey(authKey: string): Promise<string> {
  return bcrypt.hash(authKey, SALT_ROUNDS);
}

/**
 * Verify Proventa Authentication Key against stored hash using timing-safe comparison.
 */
export async function verifyAuthKey(
  authKey: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(authKey, hash);
}
