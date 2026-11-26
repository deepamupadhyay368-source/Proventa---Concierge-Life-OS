import { db } from '@/lib/db';
import { MonitoringDiffResult } from './types';

/**
 * Service 5: Continuous Monitoring Agent
 * Compares current observed official state against stored database records,
 * logs immutable historical snapshots, and updates modified fields
 */
export async function monitorAndSyncProject(params: {
  projectId: string;
  sourceCode: string;
  latestObservedData: Record<string, any>;
  changeType?: string;
  reason?: string;
}): Promise<MonitoringDiffResult> {
  const project = await db.project.findUnique({
    where: { id: params.projectId },
    include: {
      configurations: true,
      specifications: true,
      amenities: true,
      constructionProgress: { orderBy: { asOfDate: 'desc' }, take: 1 },
      regulatoryEvents: true,
    },
  });

  if (!project) throw new Error(`Project ${params.projectId} not found`);

  const changedFields: string[] = [];
  const previousValues: Record<string, any> = {};
  const newValues: Record<string, any> = {};

  const fieldsToCheck = [
    'completionYear',
    'possessionStatus',
    'totalTowers',
    'totalUnits',
    'priceRangeMinLakhs',
    'priceRangeMaxLakhs',
    'carpetAreaRangeMin',
    'carpetAreaRangeMax',
    'registrationValidityDate',
    'buildingType',
  ];

  for (const field of fieldsToCheck) {
    if (
      params.latestObservedData[field] !== undefined &&
      params.latestObservedData[field] !== (project as any)[field]
    ) {
      changedFields.push(field);
      previousValues[field] = (project as any)[field];
      newValues[field] = params.latestObservedData[field];
    }
  }

  const hasChanges = changedFields.length > 0;

  if (hasChanges) {
    // 1. Create Immutable Historical Snapshot
    await db.projectHistoricalSnapshot.create({
      data: {
        projectId: project.id,
        sourceId: params.sourceCode,
        changeType: params.changeType || 'PROGRESS_UPDATE',
        changedFields,
        previousDataJson: previousValues,
        newDataJson: newValues,
        reason: params.reason || `Continuous monitoring detected update across ${changedFields.join(', ')}`,
      },
    });

    // 2. Update Project fields
    await db.project.update({
      where: { id: project.id },
      data: {
        ...newValues,
        lastCheckedDate: new Date(),
        updatedAt: new Date(),
      },
    });
  } else {
    // Stamp lastCheckedDate
    await db.project.update({
      where: { id: project.id },
      data: { lastCheckedDate: new Date() },
    });
  }

  return {
    hasChanges,
    projectId: project.id,
    changedFields,
    previousValues,
    newValues,
    changeSummary: hasChanges
      ? `Updated ${changedFields.length} field(s): ${changedFields.join(', ')}`
      : 'No modifications detected; state is verified current',
  };
}

/**
 * Runs a continuous monitoring sweep across all registered active projects
 */
export async function runMonitoringSweep(district?: string) {
  const projects = await db.project.findMany({
    where: district ? { district: { equals: district, mode: 'insensitive' } } : undefined,
    select: { id: true, name: true, reraNumber: true, possessionStatus: true, completionYear: true },
  });

  const job = await db.collectionJob.create({
    data: {
      jobType: 'MONITORING_SWEEP',
      localitySlug: district ? district.toLowerCase() : 'all',
      status: 'RUNNING',
      totalItemsDiscovered: projects.length,
      startedAt: new Date(),
    },
  });

  let changesDetected = 0;
  for (const p of projects) {
    // In continuous monitoring, simulate observing latest regulatory filing status
    // E.g., verifying if possession is ready or construction progressed
    await db.project.update({
      where: { id: p.id },
      data: { lastCheckedDate: new Date() },
    });
  }

  await db.collectionJob.update({
    where: { id: job.id },
    data: {
      status: 'COMPLETED',
      totalItemsIngested: projects.length,
      completedAt: new Date(),
      logs: {
        totalMonitored: projects.length,
        changesDetected,
      },
    },
  });

  return {
    jobId: job.id,
    totalMonitored: projects.length,
    changesDetected,
  };
}
