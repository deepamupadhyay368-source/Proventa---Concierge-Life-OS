import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { createAuditLog } from '@/lib/audit';
import { POLICY_VERSIONS } from './versions';
import { PolicyType, PrivacyRequestType } from '@prisma/client';

export interface RecordAcceptanceParams {
  userId: string;
  policyTypes: PolicyType[];
  context: 'SIGNUP' | 'WAVE1_ACCEPT' | 'DASHBOARD_REACCEPT' | 'CHECKOUT' | 'PROFILE_UPDATE';
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Persists immutable policy acceptance records for a customer across one or more policies.
 */
export async function recordPolicyAcceptances(params: RecordAcceptanceParams): Promise<{ count: number }> {
  const { userId, policyTypes, context, ipAddress, userAgent } = params;

  try {
    const records = policyTypes.map((type) => {
      let version = '1.0';
      switch (type) {
        case 'PRIVACY_POLICY':
          version = POLICY_VERSIONS.privacy;
          break;
        case 'TERMS_OF_SERVICE':
          version = POLICY_VERSIONS.terms;
          break;
        case 'PRIVATE_BETA_TERMS':
          version = POLICY_VERSIONS.privateBeta;
          break;
        case 'CONCIERGE_TERMS':
          version = POLICY_VERSIONS.conciergeTerms;
          break;
        case 'PAYMENT_TERMS':
          version = POLICY_VERSIONS.payments;
          break;
        case 'AI_DISCLOSURE':
          version = POLICY_VERSIONS.aiDisclosure;
          break;
        case 'COOKIE_POLICY':
          version = POLICY_VERSIONS.cookies;
          break;
        case 'REFUND_POLICY':
          version = POLICY_VERSIONS.refunds;
          break;
        default:
          version = '1.0';
      }

      return {
        userId,
        policyType: type,
        policyVersion: version,
        acceptanceContext: context,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      };
    });

    await db.policyAcceptance.createMany({
      data: records,
    });

    await createAuditLog({
      actorId: userId,
      actorRole: 'CUSTOMER',
      action: 'UPDATE',
      resourceType: 'PolicyAcceptance',
      resourceId: userId,
      after: { policies: policyTypes, context },
      ipAddress,
      userAgent,
    });

    return { count: records.length };
  } catch (error) {
    logger.error({ error, userId, policyTypes }, '[Consent] Failed to record policy acceptances');
    return { count: 0 };
  }
}

/**
 * Checks whether a user has accepted the latest version of required policies.
 */
export async function getMissingPolicies(userId: string, requiredPolicies: PolicyType[]): Promise<PolicyType[]> {
  const acceptances = await db.policyAcceptance.findMany({
    where: { userId },
    orderBy: { acceptedAt: 'desc' },
  });

  const acceptedMap = new Map<string, string>();
  for (const acc of acceptances) {
    if (!acceptedMap.has(acc.policyType)) {
      acceptedMap.set(acc.policyType, acc.policyVersion);
    }
  }

  const missing: PolicyType[] = [];
  for (const policy of requiredPolicies) {
    let currentVersion = '1.0';
    if (policy === 'PRIVACY_POLICY') currentVersion = POLICY_VERSIONS.privacy;
    if (policy === 'TERMS_OF_SERVICE') currentVersion = POLICY_VERSIONS.terms;
    if (policy === 'PRIVATE_BETA_TERMS') currentVersion = POLICY_VERSIONS.privateBeta;

    const acceptedVersion = acceptedMap.get(policy);
    if (!acceptedVersion || acceptedVersion !== currentVersion) {
      missing.push(policy);
    }
  }

  return missing;
}

/**
 * Submits a customer privacy or data rights request.
 */
export async function submitPrivacyRequest(params: {
  email: string;
  name?: string;
  requestType: PrivacyRequestType;
  details?: string;
  userId?: string;
  ipAddress?: string;
}) {
  const { email, name, requestType, details, userId, ipAddress } = params;

  const req = await db.privacyRequest.create({
    data: {
      email: email.toLowerCase().trim(),
      name: name?.trim() || null,
      requestType,
      details: details?.trim() || null,
      userId: userId || null,
      ipAddress: ipAddress || null,
      status: 'PENDING',
    },
  });

  await createAuditLog({
    actorId: userId || undefined,
    actorRole: 'CUSTOMER',
    action: 'CREATE',
    resourceType: 'PrivacyRequest',
    resourceId: req.id,
    after: { email, requestType },
    ipAddress,
  });

  return req;
}
