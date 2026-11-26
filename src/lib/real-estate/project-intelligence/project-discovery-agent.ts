import { db } from '@/lib/db';
import { DiscoveredProjectCandidate } from './types';
import { detectProjectDuplicate } from './verification-duplicate-agent';

export interface DiscoveryBatchResult {
  jobId: string;
  totalDiscovered: number;
  totalNewCandidates: number;
  totalDuplicatesDetected: number;
  totalErrors: number;
  candidates: any[];
}

/**
 * Service 1: Project Discovery Agent
 * Discovers projects across Ahmedabad & Gandhinagar from official sources and logs candidate records
 */
export async function runProjectDiscoveryBatch(params: {
  sourceCode: string;
  district?: string;
  candidatesData: DiscoveredProjectCandidate[];
}): Promise<DiscoveryBatchResult> {
  const source = await db.dataSource.findUnique({
    where: { code: params.sourceCode },
  });
  if (!source) throw new Error(`Source ${params.sourceCode} not registered`);

  // Create CollectionJob record
  const job = await db.collectionJob.create({
    data: {
      jobType: 'PROJECT_DISCOVERY',
      sourceCode: params.sourceCode,
      localitySlug: params.district ? params.district.toLowerCase() : 'all',
      status: 'RUNNING',
      totalItemsDiscovered: params.candidatesData.length,
      startedAt: new Date(),
    },
  });

  let newCount = 0;
  let dupCount = 0;
  let errCount = 0;
  const processedCandidates: any[] = [];

  for (const raw of params.candidatesData) {
    try {
      // Find locality if exists
      const locality = await db.locality.findFirst({
        where: {
          OR: [
            { name: { equals: raw.rawLocalityName, mode: 'insensitive' } },
            { slug: { equals: raw.rawLocalityName.toLowerCase().replace(/\s+/g, '-'), mode: 'insensitive' } },
          ],
        },
      });

      // Run Duplicate Detection Agent (Service 4)
      const dupCheck = await detectProjectDuplicate({
        projectName: raw.rawProjectName,
        reraNumber: raw.rawReraNumber,
        localityId: locality?.id,
        district: raw.rawDistrictName || params.district,
      });

      let reviewStatus = 'PENDING_REVIEW';
      if (dupCheck.isDuplicate && dupCheck.confidenceScore >= 0.98) {
        reviewStatus = 'MERGED_EXISTING';
        dupCount++;
      } else {
        newCount++;
      }

      const candidate = await db.projectCandidate.create({
        data: {
          sourceId: source.id,
          externalReferenceId: raw.externalReferenceId,
          rawProjectName: raw.rawProjectName,
          rawDeveloperName: raw.rawDeveloperName,
          rawLocalityName: raw.rawLocalityName,
          rawDistrictName: raw.rawDistrictName || params.district || 'Ahmedabad',
          rawReraNumber: raw.rawReraNumber,
          rawDataJson: raw.rawData || {},
          duplicateOfProjectId: dupCheck.existingProjectId,
          matchConfidence: dupCheck.confidenceScore,
          reviewStatus,
          reviewerNotes: dupCheck.reasons.join('; '),
        },
      });

      processedCandidates.push(candidate);
    } catch (err: any) {
      errCount++;
      console.error(`Error processing candidate ${raw.rawProjectName}:`, err);
    }
  }

  // Update collection job status
  await db.collectionJob.update({
    where: { id: job.id },
    data: {
      status: 'COMPLETED',
      totalItemsIngested: newCount,
      totalDuplicatesDetected: dupCount,
      totalErrors: errCount,
      completedAt: new Date(),
      logs: {
        totalDiscovered: params.candidatesData.length,
        newCandidatesCount: newCount,
        duplicatesCount: dupCount,
        errorsCount: errCount,
      },
    },
  });

  return {
    jobId: job.id,
    totalDiscovered: params.candidatesData.length,
    totalNewCandidates: newCount,
    totalDuplicatesDetected: dupCount,
    totalErrors: errCount,
    candidates: processedCandidates,
  };
}
