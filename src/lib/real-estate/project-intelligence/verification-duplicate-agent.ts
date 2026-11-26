import { db } from '@/lib/db';
import { DuplicateDetectionResult } from './types';

/**
 * Normalizes project names for robust deduplication comparison
 */
export function normalizeProjectName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\b(group|infra|realty|developers|llp|pvt|ltd|limited|the|by)\b/g, '')
    .trim();
}

/**
 * Calculates Token Jaccard / Levenshtein hybrid similarity between two strings
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeProjectName(str1);
  const norm2 = normalizeProjectName(str2);

  if (norm1 === norm2) return 1.0;
  if (!norm1 || !norm2) return 0.0;

  const tokens1 = new Set(norm1.split(' '));
  const tokens2 = new Set(norm2.split(' '));

  const intersection = new Set([...tokens1].filter((t) => tokens2.has(t)));
  const union = new Set([...tokens1, ...tokens2]);

  const jaccard = union.size > 0 ? intersection.size / union.size : 0;

  // If one contains the other completely
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return Math.max(jaccard, 0.88);
  }

  return jaccard;
}

/**
 * Service 4: Verification & Duplicate Detection Agent
 */
export async function detectProjectDuplicate(candidate: {
  projectName: string;
  reraNumber?: string;
  localityId?: string;
  district?: string;
}): Promise<DuplicateDetectionResult> {
  // 1. Exact RERA Number check (Statutory Ground Truth)
  if (candidate.reraNumber && candidate.reraNumber.trim().length > 5) {
    const cleanRera = candidate.reraNumber.trim().toUpperCase();
    const existingByRera = await db.project.findFirst({
      where: {
        reraNumber: {
          equals: cleanRera,
          mode: 'insensitive',
        },
      },
      include: { locality: true },
    });

    if (existingByRera) {
      return {
        isDuplicate: true,
        matchType: 'EXACT_RERA',
        confidenceScore: 1.0,
        existingProjectId: existingByRera.id,
        existingProjectName: existingByRera.name,
        reasons: [`Exact statutory Gujarat RERA match: ${cleanRera}`],
      };
    }
  }

  // 2. Exact Name and Locality check
  if (candidate.localityId) {
    const existingInLocality = await db.project.findMany({
      where: { localityId: candidate.localityId },
    });

    for (const proj of existingInLocality) {
      const similarity = calculateStringSimilarity(candidate.projectName, proj.name);
      if (similarity >= 0.95) {
        return {
          isDuplicate: true,
          matchType: 'EXACT_NAME_LOCALITY',
          confidenceScore: 0.98,
          existingProjectId: proj.id,
          existingProjectName: proj.name,
          reasons: [
            `Exact match within same micro-market (${proj.name}) with string similarity ${(similarity * 100).toFixed(0)}%`,
          ],
        };
      } else if (similarity >= 0.75) {
        return {
          isDuplicate: true,
          matchType: 'FUZZY_NAME_PROXIMITY',
          confidenceScore: similarity,
          existingProjectId: proj.id,
          existingProjectName: proj.name,
          reasons: [
            `Fuzzy name match within same micro-market (${proj.name}) with token similarity ${(similarity * 100).toFixed(0)}%. Requires review.`,
          ],
        };
      }
    }
  }

  // 3. District-wide scan for identical high-confidence match
  const districtProjects = await db.project.findMany({
    where: candidate.district
      ? {
          district: {
            equals: candidate.district,
            mode: 'insensitive',
          },
        }
      : undefined,
  });

  for (const proj of districtProjects) {
    const similarity = calculateStringSimilarity(candidate.projectName, proj.name);
    if (similarity >= 0.92) {
      return {
        isDuplicate: true,
        matchType: 'FUZZY_NAME_PROXIMITY',
        confidenceScore: similarity,
        existingProjectId: proj.id,
        existingProjectName: proj.name,
        reasons: [
          `District-wide name similarity match with existing project "${proj.name}" (${(similarity * 100).toFixed(0)}%)`,
        ],
      };
    }
  }

  return {
    isDuplicate: false,
    matchType: 'NONE',
    confidenceScore: 0,
    reasons: ['No existing project matched on RERA number, locality, or name similarity'],
  };
}

/**
 * Resolves a candidate review decision (Admin or Autonomous Agent)
 */
export async function resolveCandidateDecision(params: {
  candidateId: string;
  decision: 'APPROVED_NEW' | 'MERGED_EXISTING' | 'REJECTED';
  duplicateOfProjectId?: string;
  reviewerUserId: string;
  notes?: string;
}) {
  const candidate = await db.projectCandidate.findUnique({
    where: { id: params.candidateId },
  });
  if (!candidate) throw new Error(`Candidate ${params.candidateId} not found`);

  return await db.projectCandidate.update({
    where: { id: params.candidateId },
    data: {
      reviewStatus: params.decision,
      duplicateOfProjectId: params.duplicateOfProjectId || candidate.duplicateOfProjectId,
      reviewedByUserId: params.reviewerUserId,
      reviewedAt: new Date(),
      reviewerNotes: params.notes,
    },
  });
}
