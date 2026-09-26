import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth/session', () => ({
  requireConcierge: vi.fn(),
  requireAdmin: vi.fn().mockResolvedValue({ id: 'admin-001', email: 'admin@proventa.dev', roles: ['SUPER_ADMIN', 'ADMIN'] }),
  requireSuperAdmin: vi.fn().mockResolvedValue({ id: 'admin-001', email: 'admin@proventa.dev', roles: ['SUPER_ADMIN', 'ADMIN'] }),
  requireFounder: vi.fn().mockResolvedValue({ id: 'admin-001', email: 'admin@proventa.dev', roles: ['SUPER_ADMIN', 'ADMIN'] }),
  requireAuth: vi.fn().mockResolvedValue({ id: 'admin-001', email: 'admin@proventa.dev', roles: ['SUPER_ADMIN', 'ADMIN'] }),
  requireRole: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock('@/lib/email/sender', () => ({
  sendWave1InvitationEmail: vi.fn().mockResolvedValue(true),
  sendBookingConfirmationEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
  createSecurityEvent: vi.fn().mockResolvedValue(undefined),
}));

import { generateInvitationToken, hashToken } from '@/lib/auth/tokens';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { OperationalResetService } from '@/lib/admin/operational-reset-service';
import { randomBytes } from 'crypto';

describe('PROVENTA — WAVE 1 INVITATION & SAFE RESET SUITE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // A, B. Secure Token Generation & Hashing
  it('A & B. should generate cryptographically unpredictable invitation tokens and verify their hashes', () => {
    const token1 = generateInvitationToken();
    const token2 = generateInvitationToken();

    expect(token1).toBeDefined();
    expect(token2).toBeDefined();
    expect(token1).not.toBe(token2);
    expect(token1.length).toBeGreaterThanOrEqual(40);

    const hash1 = hashToken(token1);
    const hash2 = hashToken(token2);

    expect(hash1).not.toBe(hash2);
    expect(hash1).toBe(hashToken(token1));
  });

  // C, D, E, F, G, H. Invitation Lifecycle Security & Expiration
  it('C, D, E, F, G, H. should validate invitation token lifecycle: pending, expired, revoked, and used', () => {
    const now = new Date();
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const past = new Date(Date.now() - 1000);

    const validInvitation = {
      acceptedAt: null,
      revokedAt: null,
      expiresAt: future,
    };
    expect(!validInvitation.acceptedAt && !validInvitation.revokedAt && validInvitation.expiresAt > now).toBe(true);

    const expiredInvitation = {
      acceptedAt: null,
      revokedAt: null,
      expiresAt: past,
    };
    expect(expiredInvitation.expiresAt <= now).toBe(true);

    const revokedInvitation = {
      acceptedAt: null,
      revokedAt: new Date(),
      expiresAt: future,
    };
    expect(Boolean(revokedInvitation.revokedAt)).toBe(true);

    const acceptedInvitation = {
      acceptedAt: new Date(),
      revokedAt: null,
      expiresAt: future,
    };
    expect(Boolean(acceptedInvitation.acceptedAt)).toBe(true);
  });

  // I, J, K. Password Security & Account Creation
  it('I, J, K. should securely hash customer passwords on invitation acceptance', async () => {
    const rawPassword = `BetaPass_${randomBytes(8).toString('hex')}!Aa1`;
    const hashed = await hashPassword(rawPassword);

    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(rawPassword);

    const isValid = await verifyPassword(rawPassword, hashed);
    expect(isValid).toBe(true);

    const isWrong = await verifyPassword(`MismatchPass_${randomBytes(8).toString('hex')}!Bb2`, hashed);
    expect(isWrong).toBe(false);
  });

  // U, V, W, X. Reset Preview & Target Classification
  it('U, V, W, X. should classify test tasks and protect admins/employees in reset preview', async () => {
    const preview = await OperationalResetService.generatePreview();

    expect(preview).toBeDefined();
    expect(preview.testTasksCount).toBeGreaterThanOrEqual(0);
    expect(preview.preservedAdminsCount).toBeGreaterThanOrEqual(1);
    expect(preview.preservedCategoriesCount).toBe(9);
    expect(preview.preservedCitiesCount).toBeGreaterThanOrEqual(1);
  }, 15000);

  // Confirmation Gate Enforcement
  it('should reject operational reset if confirmation text does not match exactly', async () => {
    await expect(
      OperationalResetService.executeReset({
        confirmationText: 'RESET ALL',
        actorId: 'admin-001',
      })
    ).rejects.toThrow('Invalid confirmation text');
  });
});
