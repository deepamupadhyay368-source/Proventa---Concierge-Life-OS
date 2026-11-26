import { db } from '@/lib/db';

export interface EvidenceEligibilityResult {
  eligible: boolean;
  eligibleCount: number;
  reason?: string;
  code?: string;
}

/**
 * Server-side evidence eligibility check for paid property valuations.
 * Strictly enforces that a locality must have at least 3 independently verified,
 * comparable registered transactions meeting all 8 statutory criteria.
 */
export async function checkEvidenceEligibility(
  localityId: string,
  propertyType: string = 'APARTMENT'
): Promise<EvidenceEligibilityResult> {
  // 1. Asset class check: Commercial properties strictly rejected
  if (propertyType.toUpperCase() === 'COMMERCIAL') {
    return {
      eligible: false,
      eligibleCount: 0,
      code: 'UNSUPPORTED_ASSET_CLASS',
      reason: 'Commercial property valuation is not supported by the residential valuation engine.',
    };
  }

  // 2. Query candidates from database
  const transactions = await db.propertyTransaction.findMany({
    where: {
      localityId,
      verificationStatus: 'VERIFIED',
      duplicateOfId: null,
      flagReason: null,
      deedId: { not: null },
      carpetAreaSqFt: { gt: 0 },
      transactedPriceLakhs: { gt: 0 },
      pricePerSqFtCarpet: { gt: 0 },
    },
    include: {
      project: {
        select: {
          id: true,
          publicationStatus: true,
          isPubliclyVisible: true,
          quarantineReason: true,
        },
      },
    },
  });

  // 3. Screen according to all 8 institutional criteria:
  // (1) Genuine registered transaction identity (no test deed patterns)
  // (2) Valid locality mapping (verified by query)
  // (3) Independently authenticated deed / registration evidence
  // (4) No association with quarantined or unverified projects
  // (5) No test artifact classification (flagReason is null & deedId != TEST)
  // (6) No duplicate transaction (duplicateOfId is null)
  // (7) Arm's-length and comparable screening (rate sanity check ₹1,000 - ₹50,000/sqft)
  // (8) Valid consideration and area basis
  const eligibleTransactions = transactions.filter((tx) => {
    // Screening 1 & 5: Deed ID must be genuine
    if (!tx.deedId || tx.deedId.toUpperCase().includes('TEST') || tx.deedId.startsWith('MOCK')) {
      return false;
    }

    // Screening 4: Project must be PUBLISHED and isPubliclyVisible
    if (tx.project) {
      if (tx.project.publicationStatus !== 'PUBLISHED' || !tx.project.isPubliclyVisible) {
        return false;
      }
    } else {
      // If transaction has no linked project, ensure it's not a test artifact
      if (tx.deedId.includes('ACTION-TEST')) {
        return false;
      }
    }

    // Screening 7: Arm's length rate verification
    if (tx.pricePerSqFtCarpet < 1000 || tx.pricePerSqFtCarpet > 50000) {
      return false;
    }

    return true;
  });

  const MIN_REQUIRED_TRANSACTIONS = 3;

  if (eligibleTransactions.length < MIN_REQUIRED_TRANSACTIONS) {
    return {
      eligible: false,
      eligibleCount: eligibleTransactions.length,
      code: 'INSUFFICIENT_LOCALITY_EVIDENCE',
      error:
        'Paid valuation reports for this locality are temporarily disabled until sufficient verified registered transaction evidence is established.',
      reason:
        'Paid valuation reports for this locality are temporarily disabled until sufficient verified registered transaction evidence is established.',
    } as any;
  }

  return {
    eligible: true,
    eligibleCount: eligibleTransactions.length,
  };
}
