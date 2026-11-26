import crypto from 'crypto';

export interface ReportAccessTokenPayload {
  requestId: string;
  userId: string;
  exp: number; // Unix timestamp in seconds
  iat: number; // Unix timestamp in seconds
}

export interface VerifyReportTokenResult {
  valid: boolean;
  payload?: ReportAccessTokenPayload;
  error?: 'MALFORMED_TOKEN' | 'INVALID_SIGNATURE' | 'MALFORMED_PAYLOAD' | 'TOKEN_REQUEST_MISMATCH' | 'TOKEN_EXPIRED';
}

function getReportTokenSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_SECRET or JWT_SECRET must be configured in production for report token issuance.');
    }
    return 'proventa-report-access-dev-secret-key-32chars';
  }
  return secret;
}

/**
 * Generates a cryptographically signed, time-limited access token bound to a specific valuation request and user.
 * Format: <base64urlPayload>.<base64urlHmacSignature>
 */
export function generateReportAccessToken(
  requestId: string,
  userId: string,
  expiresInSeconds: number = 86400 * 30 // Default: 30 days
): string {
  if (!requestId || !userId) {
    throw new Error('requestId and userId are required to generate report access token.');
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: ReportAccessTokenPayload = {
    requestId,
    userId,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = getReportTokenSecret();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

/**
 * Validates a cryptographically signed report access token against an expected requestId.
 * Enforces signature validity, request binding, and expiration check.
 */
export function verifyReportAccessToken(
  token: string,
  expectedRequestId: string
): VerifyReportTokenResult {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'MALFORMED_TOKEN' };
  }

  const parts = token.trim().split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'MALFORMED_TOKEN' };
  }

  const [encodedPayload, providedSignature] = parts;
  if (!encodedPayload || !providedSignature) {
    return { valid: false, error: 'MALFORMED_TOKEN' };
  }

  const secret = getReportTokenSecret();
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  const providedSigBuffer = Buffer.from(providedSignature);
  const expectedSigBuffer = Buffer.from(expectedSignature);

  if (
    providedSigBuffer.length !== expectedSigBuffer.length ||
    !crypto.timingSafeEqual(providedSigBuffer, expectedSigBuffer)
  ) {
    return { valid: false, error: 'INVALID_SIGNATURE' };
  }

  let payload: ReportAccessTokenPayload;
  try {
    const decodedStr = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    payload = JSON.parse(decodedStr);
  } catch {
    return { valid: false, error: 'MALFORMED_PAYLOAD' };
  }

  if (!payload.requestId || !payload.userId || !payload.exp) {
    return { valid: false, error: 'MALFORMED_PAYLOAD' };
  }

  // Verify binding to expected request
  if (payload.requestId !== expectedRequestId) {
    return { valid: false, error: 'TOKEN_REQUEST_MISMATCH' };
  }

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (now > payload.exp) {
    return { valid: false, error: 'TOKEN_EXPIRED' };
  }

  return { valid: true, payload };
}
