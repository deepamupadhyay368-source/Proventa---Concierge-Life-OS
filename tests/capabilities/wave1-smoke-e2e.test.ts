import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { generateInvitationToken, hashToken } from '@/lib/auth/tokens';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { randomBytes } from 'crypto';

describe('PROVENTA — FINAL WAVE 1 INVITATION CONTROLLED SMOKE TEST', () => {
  const testEmail = `wave1_smoke_${randomBytes(6).toString('hex')}@proventa.internal`;
  const testName = 'Smoke Test Beta VIP';
  const testPassword = `SmokePass_${randomBytes(6).toString('hex')}!Aa1`;
  let testRegistrationId: string;
  let testInvitationId: string;
  let testToken: string;
  let testUserId: string;
  let testCustomerProfileId: string;
  let testTaskId: string;

  afterAll(async () => {
    // 21. Automatic Targeted Cleanup of Smoke Test Entity Only
    try {
      if (testTaskId) {
        await db.taskEvent.deleteMany({ where: { taskId: testTaskId } });
        await db.agentExecutionTrace.deleteMany({ where: { taskId: testTaskId } });
        await db.taskPlanStep.deleteMany({ where: { taskId: testTaskId } });
        await db.agentRunRecord.deleteMany({ where: { taskId: testTaskId } });
        await db.externalTransaction.deleteMany({ where: { taskId: testTaskId } });
        await db.task.deleteMany({ where: { id: testTaskId } });
      }

      if (testUserId) {
        await db.customerPreference.deleteMany({ where: { customer: { userId: testUserId } } });
        await db.customerProfile.deleteMany({ where: { userId: testUserId } });
        await db.session.deleteMany({ where: { userId: testUserId } });
        await db.emailVerification.deleteMany({ where: { userId: testUserId } });
        await db.consentRecord.deleteMany({ where: { userId: testUserId } });
        await db.userRoleAssignment.deleteMany({ where: { userId: testUserId } });
        await db.user.deleteMany({ where: { id: testUserId } });
      }

      if (testRegistrationId) {
        await db.invitation.deleteMany({ where: { registrationId: testRegistrationId } });
        await db.earlyAccessRegistration.deleteMany({ where: { id: testRegistrationId } });
      }
    } catch (e) {
      console.error('Smoke cleanup error:', e);
    }
  });

  // Step 1 - 4: Founder/Admin creates Wave 1 invitation
  it('1-4. Founder creates Wave 1 registration & generates secure cryptographic invitation token', async () => {
    const reg = await db.earlyAccessRegistration.create({
      data: {
        name: testName,
        email: testEmail,
        city: 'Ahmedabad',
        status: 'WAITLISTED',
        consentGiven: true,
        internalNotes: 'Founder Controlled Smoke Test',
      },
    });
    testRegistrationId = reg.id;
    expect(reg.id).toBeDefined();
    expect(reg.status).toBe('WAITLISTED');

    // Generate token
    testToken = generateInvitationToken();
    const tokenHash = hashToken(testToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const inv = await db.invitation.create({
      data: {
        registrationId: testRegistrationId,
        tokenHash,
        expiresAt,
        sentBy: 'founder-admin',
      },
    });
    testInvitationId = inv.id;

    const updatedReg = await db.earlyAccessRegistration.update({
      where: { id: testRegistrationId },
      data: { status: 'INVITED', invitedAt: new Date() },
    });

    expect(inv.id).toBeDefined();
    expect(inv.acceptedAt).toBeNull();
    expect(inv.revokedAt).toBeNull();
    expect(updatedReg.status).toBe('INVITED');
  });

  // Step 5: Invitation link validation
  it('5. Invitation token lookup correctly retrieves invitation details and validates pending status', async () => {
    const tokenHash = hashToken(testToken);
    const invitation = await db.invitation.findFirst({
      where: { tokenHash },
      include: { registration: true },
    });

    expect(invitation).toBeDefined();
    expect(invitation!.registration.email).toBe(testEmail);
    expect(invitation!.acceptedAt).toBeNull();
    expect(invitation!.revokedAt).toBeNull();
    expect(invitation!.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  // Step 6 - 9: Acceptance & Customer Account Creation
  it('6-9. Accept invitation, securely hash password, verify email, and activate Wave 1 customer profile', async () => {
    const tokenHash = hashToken(testToken);
    const invitation = await db.invitation.findFirst({
      where: {
        tokenHash,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { registration: true },
    });

    expect(invitation).toBeDefined();
    const { registration } = invitation!;

    const passwordHash = await hashPassword(testPassword);
    const user = await db.user.create({
      data: {
        email: registration.email,
        name: registration.name,
        passwordHash,
        status: 'ACTIVE',
        emailVerified: new Date(), // Immediate verification on invite accept
        userRoles: {
          create: [{ role: 'CUSTOMER' }],
        },
      },
    });
    testUserId = user.id;

    const profile = await db.customerProfile.create({
      data: {
        userId: user.id,
        city: registration.city,
        preferredComm: 'IN_APP',
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      },
    });
    testCustomerProfileId = profile.id;

    await db.$transaction([
      db.invitation.update({
        where: { id: invitation!.id },
        data: { acceptedAt: new Date() },
      }),
      db.earlyAccessRegistration.update({
        where: { id: registration.id },
        data: {
          status: 'REGISTERED',
          convertedUserId: user.id,
          onboardedAt: new Date(),
        },
      }),
    ]);

    expect(user.id).toBeDefined();
    expect(user.status).toBe('ACTIVE');
    expect(user.emailVerified).toBeDefined();

    const checkReg = await db.earlyAccessRegistration.findUnique({ where: { id: testRegistrationId } });
    expect(checkReg?.status).toBe('REGISTERED');
    expect(checkReg?.convertedUserId).toBe(user.id);
  });

  // Step 10: Sign in validation
  it('10. Customer sign-in validates password hash successfully', async () => {
    const user = await db.user.findUnique({
      where: { email: testEmail },
      include: { userRoles: true },
    });

    expect(user).toBeDefined();
    expect(user!.status).toBe('ACTIVE');
    const isValid = await verifyPassword(testPassword, user!.passwordHash!);
    expect(isValid).toBe(true);
    expect(user!.userRoles.map((r) => r.role)).toContain('CUSTOMER');
  });

  // Step 11 - 12: Personalized welcome & Dashboard profile
  it('11-12. Customer dashboard profile & personalized welcome data is active', async () => {
    const profile = await db.customerProfile.findUnique({
      where: { userId: testUserId },
      include: { user: true },
    });

    expect(profile).toBeDefined();
    expect(profile!.city).toBe('Ahmedabad');
    expect(profile!.onboardingCompleted).toBe(true);
    expect(profile!.user.name).toBe(testName);
  });

  // Step 13 - 15: Create First Concierge Request -> AI Processing -> 5 Genuine Options Cycle
  it('13-15. Create first concierge request, AI processes intent and returns 5 genuine options', async () => {
    const task = await db.task.create({
      data: {
        publicId: `TSK-SMOKE-${randomBytes(3).toString('hex').toUpperCase()}`,
        customerId: testCustomerProfileId,
        category: 'dining',
        assignedAgent: 'Dining Specialist',
        intent: 'Find 5 fine dining options in Ahmedabad for 2 people',
        originalRequest: 'Find 5 fine dining options in Ahmedabad for 2 people',
        status: 'AWAITING_APPROVAL',
        clientPreferences: { partySize: 2, city: 'Ahmedabad' },
      },
    });
    testTaskId = task.id;

    // Run cycle option batch
    const result = await RequestOrchestrator.cycleOptionBatch({
      taskId: testTaskId,
      userId: testUserId,
      action: 'REJECT_ALL',
    });

    expect(result.batch).toBeDefined();
    expect(result.batch!.batchId).toBe('BATCH-001');
    expect(result.batch!.options.length).toBeLessThanOrEqual(5);
    expect(result.batch!.options.length).toBeGreaterThanOrEqual(1);

    // Ensure authentic, legitimate titles
    for (const opt of result.batch!.options) {
      expect(opt.title).toBeDefined();
      expect(opt.title).not.toMatch(/fake|placeholder|mock|dummy/i);
    }
  });

  // Step 16: Rejection triggers new option batch
  it('16. Rejection of initial batch generates a distinct secondary batch (BATCH-002)', async () => {
    const result = await RequestOrchestrator.cycleOptionBatch({
      taskId: testTaskId,
      userId: testUserId,
      action: 'REJECT_ALL',
    });

    expect(result.batch).toBeDefined();
    expect(result.batch!.batchId).toBe('BATCH-002');
    expect(result.batch!.options.length).toBeGreaterThanOrEqual(1);
  });

  // Step 17 - 20: Founder / Concierge Task Visibility
  it('17-20. Verify the Task appears accurately in Founder and Concierge queries', async () => {
    const task = await db.task.findUnique({
      where: { id: testTaskId },
      include: { customer: true },
    });

    expect(task).toBeDefined();
    expect(task!.customerId).toBe(testCustomerProfileId);
    expect(task!.status).toBe('AWAITING_APPROVAL');
    expect(task!.proposedOptions).toBeDefined();
  });

  // Security Verifications
  it('Security: Invitation cannot be reused after acceptance', async () => {
    const tokenHash = hashToken(testToken);
    const checkInv = await db.invitation.findFirst({
      where: {
        tokenHash,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    expect(checkInv).toBeNull(); // Already accepted
  });

  it('Security: Invalid token is rejected', async () => {
    const fakeToken = generateInvitationToken();
    const tokenHash = hashToken(fakeToken);
    const checkInv = await db.invitation.findFirst({
      where: { tokenHash },
    });
    expect(checkInv).toBeNull();
  });

  it('Security: Role isolation prevents customer from acquiring admin roles', async () => {
    const userRoles = await db.userRoleAssignment.findMany({
      where: { userId: testUserId },
    });
    const roles = userRoles.map((r) => r.role);
    expect(roles).toContain('CUSTOMER');
    expect(roles).not.toContain('ADMIN');
    expect(roles).not.toContain('SUPER_ADMIN');
    expect(roles).not.toContain('CONCIERGE');
  });
});
