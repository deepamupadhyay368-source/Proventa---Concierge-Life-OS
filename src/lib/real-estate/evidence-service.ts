import { db } from '@/lib/db';
import {
  EvidenceVerificationStatus,
  ValuationEligibilityStatus,
  EvidenceEntityType,
  EvidenceAuditAction,
  RealEstateType,
  SourceDocumentType,
} from '@prisma/client';

export interface CsvValidationResult {
  success: boolean;
  totalRows: number;
  importedCount: number;
  duplicateCount: number;
  errorCount: number;
  errors: Array<{ row: number; column?: string; message: string }>;
  importedIds: string[];
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateOfId?: string;
  similarityScore: number;
  reason?: string;
}

export interface LocalityCoverageAssessment {
  localityId: string;
  localitySlug: string;
  localityName: string;
  totalRecords: number;
  verifiedTransactionsCount: number;
  pendingTransactionsCount: number;
  verifiedListingsCount: number;
  pendingListingsCount: number;
  verifiedJantriBenchmarksCount: number;
  sourceQualityScore: number;
  earliestEvidenceDate: Date | null;
  latestEvidenceDate: Date | null;
  evidenceGaps: string[];
  valuationEligibility: ValuationEligibilityStatus;
  eligibilityReason: string;
}

// ============================================================================
// 1. DUPLICATE DETECTION LOGIC
// ============================================================================

export async function checkTransactionDuplicate(data: {
  localityId: string;
  projectId?: string | null;
  carpetAreaSqFt: number;
  transactedPriceLakhs: number;
  registrationDate: Date;
  floor?: number | null;
  deedId?: string | null;
}): Promise<DuplicateCheckResult> {
  // 1. If exact Deed ID match
  if (data.deedId && data.deedId.trim()) {
    const existingDeed = await db.propertyTransaction.findFirst({
      where: { deedId: data.deedId.trim() },
    });
    if (existingDeed) {
      return {
        isDuplicate: true,
        duplicateOfId: existingDeed.id,
        similarityScore: 1.0,
        reason: `Exact Sub-Registrar Deed ID match (${data.deedId}) with existing transaction ${existingDeed.id}`,
      };
    }
  }

  // 2. Tolerance match: same locality, project (if present), carpet area within ±2%, price within ±2%, reg date within ±7 days
  const minCarpet = data.carpetAreaSqFt * 0.98;
  const maxCarpet = data.carpetAreaSqFt * 1.02;
  const minPrice = data.transactedPriceLakhs * 0.98;
  const maxPrice = data.transactedPriceLakhs * 1.02;
  const minDate = new Date(data.registrationDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const maxDate = new Date(data.registrationDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  const potentialDuplicate = await db.propertyTransaction.findFirst({
    where: {
      localityId: data.localityId,
      ...(data.projectId ? { projectId: data.projectId } : {}),
      carpetAreaSqFt: { gte: minCarpet, lte: maxCarpet },
      transactedPriceLakhs: { gte: minPrice, lte: maxPrice },
      registrationDate: { gte: minDate, lte: maxDate },
      ...(data.floor !== undefined && data.floor !== null ? { floor: data.floor } : {}),
    },
  });

  if (potentialDuplicate) {
    return {
      isDuplicate: true,
      duplicateOfId: potentialDuplicate.id,
      similarityScore: 0.95,
      reason: `Identical asset parameters (Carpet: ${data.carpetAreaSqFt} sq ft, Price: ₹${data.transactedPriceLakhs}L, Reg Date: ${data.registrationDate.toISOString().slice(0, 10)}) within tolerance of transaction ${potentialDuplicate.id}`,
    };
  }

  return { isDuplicate: false, similarityScore: 0.0 };
}

export async function checkListingDuplicate(data: {
  localityId: string;
  projectId?: string | null;
  carpetAreaSqFt: number;
  askingPriceLakhs: number;
  sourceUrl?: string | null;
  sourceReference?: string | null;
}): Promise<DuplicateCheckResult> {
  // Check exact source URL or reference match
  if (data.sourceUrl && data.sourceUrl.trim()) {
    const existingUrl = await db.propertyListing.findFirst({
      where: { sourceUrl: data.sourceUrl.trim() },
    });
    if (existingUrl) {
      return {
        isDuplicate: true,
        duplicateOfId: existingUrl.id,
        similarityScore: 1.0,
        reason: `Exact listing source URL match with existing record ${existingUrl.id}`,
      };
    }
  }

  // Check asset tolerance
  const minCarpet = data.carpetAreaSqFt * 0.98;
  const maxCarpet = data.carpetAreaSqFt * 1.02;
  const minPrice = data.askingPriceLakhs * 0.98;
  const maxPrice = data.askingPriceLakhs * 1.02;

  const potential = await db.propertyListing.findFirst({
    where: {
      localityId: data.localityId,
      ...(data.projectId ? { projectId: data.projectId } : {}),
      carpetAreaSqFt: { gte: minCarpet, lte: maxCarpet },
      askingPriceLakhs: { gte: minPrice, lte: maxPrice },
      listingStatus: 'ACTIVE',
    },
  });

  if (potential) {
    return {
      isDuplicate: true,
      duplicateOfId: potential.id,
      similarityScore: 0.9,
      reason: `Identical active listing parameters (Carpet: ${data.carpetAreaSqFt} sq ft, Asking: ₹${data.askingPriceLakhs}L) match listing ${potential.id}`,
    };
  }

  return { isDuplicate: false, similarityScore: 0.0 };
}

export async function checkJantriDuplicate(data: {
  localityId: string;
  jantriEdition: string;
  tpSchemeNo?: string | null;
  finalPlotNo?: string | null;
  surveyNumber?: string | null;
}): Promise<DuplicateCheckResult> {
  const existing = await db.jantriBenchmark.findFirst({
    where: {
      localityId: data.localityId,
      jantriEdition: data.jantriEdition,
      ...(data.tpSchemeNo ? { tpSchemeNo: data.tpSchemeNo } : {}),
      ...(data.finalPlotNo ? { finalPlotNo: data.finalPlotNo } : {}),
      ...(data.surveyNumber ? { surveyNumber: data.surveyNumber } : {}),
    },
  });

  if (existing) {
    return {
      isDuplicate: true,
      duplicateOfId: existing.id,
      similarityScore: 1.0,
      reason: `Existing government Jantri rate benchmark already registered for Edition ${data.jantriEdition} (${existing.id})`,
    };
  }

  return { isDuplicate: false, similarityScore: 0.0 };
}

// ============================================================================
// 2. CSV PARSER & IMPORT VALIDATOR
// ============================================================================

function parseCsvLines(csvText: string): Array<Record<string, string>> {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  if (lines.length < 2) return [];

  // Parse header
  const header = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const rows: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    // Basic CSV splitting handling commas inside quotes
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let charIndex = 0; charIndex < lines[i].length; charIndex++) {
      const char = lines[i][charIndex];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^["']|["']$/g, ''));

    const rowObj: Record<string, string> = {};
    header.forEach((col, idx) => {
      rowObj[col] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(rowObj);
  }

  return rows;
}

export async function importEvidenceCsv(params: {
  entityType: 'TRANSACTIONS' | 'LISTINGS' | 'JANTRI';
  csvText: string;
  sourceId: string;
  sourceDocumentId?: string;
  userId: string;
  userEmail?: string;
  ipAddress?: string;
}): Promise<CsvValidationResult> {
  const rows = parseCsvLines(params.csvText);
  const result: CsvValidationResult = {
    success: true,
    totalRows: rows.length,
    importedCount: 0,
    duplicateCount: 0,
    errorCount: 0,
    errors: [],
    importedIds: [],
  };

  if (rows.length === 0) {
    result.success = false;
    result.errors.push({ row: 0, message: 'CSV file is empty or does not contain header and data rows.' });
    return result;
  }

  // Pre-load active localities
  const allLocalities = await db.locality.findMany();
  const localityMap = new Map(allLocalities.map((l) => [l.slug.toLowerCase(), l]));
  const localityNameMap = new Map(allLocalities.map((l) => [l.name.toLowerCase(), l]));

  // Pre-load canonical projects
  const allProjects = await db.project.findMany();
  const projectMap = new Map(allProjects.map((p) => [p.name.toLowerCase(), p]));

  // Process rows sequentially to prevent race conditions during duplicate detection
  for (let idx = 0; idx < rows.length; idx++) {
    const rowNum = idx + 2; // Header is line 1
    const row = rows[idx];

    try {
      if (params.entityType === 'TRANSACTIONS') {
        // Required: registrationDate, localitySlug (or locality), bhk, carpetAreaSqFt, transactedPriceLakhs
        if (!row.registrationDate) throw new Error('Missing registrationDate (format: YYYY-MM-DD)');
        const regDate = new Date(row.registrationDate);
        if (isNaN(regDate.getTime())) throw new Error(`Invalid registrationDate: ${row.registrationDate}`);

        const locSlug = (row.localitySlug || row.locality || '').toLowerCase().trim();
        const locality = localityMap.get(locSlug) || localityNameMap.get(locSlug);
        if (!locality) throw new Error(`Locality '${locSlug}' not found in registered localities`);

        const carpetArea = parseFloat(row.carpetAreaSqFt);
        if (isNaN(carpetArea) || carpetArea <= 0) throw new Error(`Invalid carpetAreaSqFt: ${row.carpetAreaSqFt}`);

        const priceLakhs = parseFloat(row.transactedPriceLakhs || row.priceLakhs);
        if (isNaN(priceLakhs) || priceLakhs <= 0) throw new Error(`Invalid transactedPriceLakhs: ${row.transactedPriceLakhs}`);

        const bhk = parseFloat(row.bhk || '2');
        const floor = row.floor ? parseInt(row.floor, 10) : null;
        const totalFloors = row.totalFloors ? parseInt(row.totalFloors, 10) : null;
        const deedId = row.deedId?.trim() || null;
        const sourceReference = row.sourceReference?.trim() || null;
        const remarks = row.remarks?.trim() || null;
        const subRegistrar = row.subRegistrarOffice?.trim() || null;

        // Resolve Project if specified
        let projectId: string | null = null;
        if (row.projectName || row.project) {
          const pName = (row.projectName || row.project).toLowerCase().trim();
          const proj = projectMap.get(pName);
          if (proj) projectId = proj.id;
        }

        const totalPriceRupees = Math.round(priceLakhs * 100000);
        const derivedRateSqFt = Math.round(totalPriceRupees / carpetArea);

        // Run Duplicate Detection
        const dupCheck = await checkTransactionDuplicate({
          localityId: locality.id,
          projectId,
          carpetAreaSqFt: carpetArea,
          transactedPriceLakhs: priceLakhs,
          registrationDate: regDate,
          floor,
          deedId,
        });

        const verificationStatus: EvidenceVerificationStatus = dupCheck.isDuplicate
          ? EvidenceVerificationStatus.DUPLICATE
          : EvidenceVerificationStatus.PENDING_VERIFICATION;

        const tx = await db.propertyTransaction.create({
          data: {
            deedId,
            registrationDate: regDate,
            localityId: locality.id,
            projectId,
            propertyType: RealEstateType.APARTMENT,
            bhk,
            carpetAreaSqFt: carpetArea,
            floor,
            totalFloors,
            transactedPriceLakhs: priceLakhs,
            totalPriceRupees,
            pricePerSqFtCarpet: derivedRateSqFt,
            derivedRateSqFt,
            areaUnit: 'SQ_FT',
            subRegistrarOffice: subRegistrar,
            sourceId: params.sourceId,
            sourceDocumentId: params.sourceDocumentId,
            sourceReference,
            verificationStatus,
            duplicateOfId: dupCheck.duplicateOfId || null,
            remarks: dupCheck.isDuplicate ? `[DUPLICATE DETECTED] ${dupCheck.reason}` : remarks,
          },
        });

        // Audit Log
        await db.evidenceAuditLog.create({
          data: {
            entityType: EvidenceEntityType.TRANSACTION,
            entityId: tx.id,
            transactionId: tx.id,
            action: EvidenceAuditAction.IMPORT,
            newStateJson: tx as any,
            changeSummary: `CSV batch imported transaction record ${tx.id} (${verificationStatus})`,
            performedByUserId: params.userId,
            performedByEmail: params.userEmail,
            ipAddress: params.ipAddress,
          },
        });

        if (dupCheck.isDuplicate) {
          result.duplicateCount++;
        } else {
          result.importedCount++;
        }
        result.importedIds.push(tx.id);
      } else if (params.entityType === 'LISTINGS') {
        // Required: listingDate, localitySlug, bhk, carpetAreaSqFt, askingPriceLakhs
        if (!row.listingDate) throw new Error('Missing listingDate (format: YYYY-MM-DD)');
        const listDate = new Date(row.listingDate);
        if (isNaN(listDate.getTime())) throw new Error(`Invalid listingDate: ${row.listingDate}`);

        const locSlug = (row.localitySlug || row.locality || '').toLowerCase().trim();
        const locality = localityMap.get(locSlug) || localityNameMap.get(locSlug);
        if (!locality) throw new Error(`Locality '${locSlug}' not found in registered localities`);

        const carpetArea = parseFloat(row.carpetAreaSqFt);
        if (isNaN(carpetArea) || carpetArea <= 0) throw new Error(`Invalid carpetAreaSqFt: ${row.carpetAreaSqFt}`);

        const askingPriceLakhs = parseFloat(row.askingPriceLakhs || row.priceLakhs);
        if (isNaN(askingPriceLakhs) || askingPriceLakhs <= 0) throw new Error(`Invalid askingPriceLakhs: ${row.askingPriceLakhs}`);

        const bhk = parseFloat(row.bhk || '2');
        const floor = row.floor ? parseInt(row.floor, 10) : null;
        const totalFloors = row.totalFloors ? parseInt(row.totalFloors, 10) : null;
        const sourceUrl = row.sourceUrl?.trim() || null;
        const sourceReference = row.sourceReference?.trim() || null;
        const sellerType = row.sellerType?.toUpperCase().trim() || 'OWNER';

        let projectId: string | null = null;
        if (row.projectName || row.project) {
          const pName = (row.projectName || row.project).toLowerCase().trim();
          const proj = projectMap.get(pName);
          if (proj) projectId = proj.id;
        }

        const totalPriceRupees = Math.round(askingPriceLakhs * 100000);
        const derivedRateSqFt = Math.round(totalPriceRupees / carpetArea);

        const dupCheck = await checkListingDuplicate({
          localityId: locality.id,
          projectId,
          carpetAreaSqFt: carpetArea,
          askingPriceLakhs,
          sourceUrl,
          sourceReference,
        });

        const verificationStatus: EvidenceVerificationStatus = dupCheck.isDuplicate
          ? EvidenceVerificationStatus.DUPLICATE
          : EvidenceVerificationStatus.PENDING_VERIFICATION;

        const listing = await db.propertyListing.create({
          data: {
            listingDate: listDate,
            sourceUrl,
            sourceReference,
            localityId: locality.id,
            projectId,
            propertyType: RealEstateType.APARTMENT,
            bhk,
            carpetAreaSqFt: carpetArea,
            askingPriceLakhs,
            totalPriceRupees,
            pricePerSqFtCarpet: derivedRateSqFt,
            derivedRateSqFt,
            areaUnit: 'SQ_FT',
            sellerType,
            floor,
            totalFloors,
            sourceId: params.sourceId,
            sourceDocumentId: params.sourceDocumentId,
            verificationStatus,
            duplicateOfId: dupCheck.duplicateOfId || null,
          },
        });

        // Audit Log
        await db.evidenceAuditLog.create({
          data: {
            entityType: EvidenceEntityType.ASKING_LISTING,
            entityId: listing.id,
            listingId: listing.id,
            action: EvidenceAuditAction.IMPORT,
            newStateJson: listing as any,
            changeSummary: `CSV batch imported asking listing ${listing.id} (${verificationStatus})`,
            performedByUserId: params.userId,
            performedByEmail: params.userEmail,
            ipAddress: params.ipAddress,
          },
        });

        if (dupCheck.isDuplicate) {
          result.duplicateCount++;
        } else {
          result.importedCount++;
        }
        result.importedIds.push(listing.id);
      } else if (params.entityType === 'JANTRI') {
        // Required: jantriEdition, effectiveDate, localitySlug, residentialApartmentRateSqFt
        if (!row.effectiveDate) throw new Error('Missing effectiveDate (format: YYYY-MM-DD)');
        const effDate = new Date(row.effectiveDate);
        if (isNaN(effDate.getTime())) throw new Error(`Invalid effectiveDate: ${row.effectiveDate}`);

        const locSlug = (row.localitySlug || row.locality || '').toLowerCase().trim();
        const locality = localityMap.get(locSlug) || localityNameMap.get(locSlug);
        if (!locality) throw new Error(`Locality '${locSlug}' not found in registered localities`);

        const rateSqFt = parseFloat(row.residentialApartmentRateSqFt || row.rateSqFt);
        if (isNaN(rateSqFt) || rateSqFt <= 0) throw new Error(`Invalid residentialApartmentRateSqFt: ${row.residentialApartmentRateSqFt}`);

        const jantriEdition = row.jantriEdition?.trim() || '2024_25';
        const tpSchemeNo = row.tpSchemeNo?.trim() || null;
        const finalPlotNo = row.finalPlotNo?.trim() || null;
        const surveyNumber = row.surveyNumber?.trim() || null;
        const sourceReference = row.sourceReference?.trim() || null;
        const remarks = row.remarks?.trim() || null;

        let projectId: string | null = null;
        if (row.projectName || row.project) {
          const pName = (row.projectName || row.project).toLowerCase().trim();
          const proj = projectMap.get(pName);
          if (proj) projectId = proj.id;
        }

        const dupCheck = await checkJantriDuplicate({
          localityId: locality.id,
          jantriEdition,
          tpSchemeNo,
          finalPlotNo,
          surveyNumber,
        });

        const verificationStatus: EvidenceVerificationStatus = dupCheck.isDuplicate
          ? EvidenceVerificationStatus.DUPLICATE
          : EvidenceVerificationStatus.PENDING_VERIFICATION;

        const jantri = await db.jantriBenchmark.create({
          data: {
            jantriEdition,
            effectiveDate: effDate,
            localityId: locality.id,
            projectId,
            tpSchemeNo,
            finalPlotNo,
            surveyNumber,
            residentialApartmentRateSqFt: rateSqFt,
            residentialLandRateSqMeter: row.residentialLandRateSqMeter ? parseFloat(row.residentialLandRateSqMeter) : null,
            commercialShopRateSqFt: row.commercialShopRateSqFt ? parseFloat(row.commercialShopRateSqFt) : null,
            sourceId: params.sourceId,
            sourceDocumentId: params.sourceDocumentId,
            sourceReference,
            verificationStatus,
            remarks: dupCheck.isDuplicate ? `[DUPLICATE] ${dupCheck.reason}` : remarks,
          },
        });

        await db.evidenceAuditLog.create({
          data: {
            entityType: EvidenceEntityType.JANTRI,
            entityId: jantri.id,
            jantriId: jantri.id,
            action: EvidenceAuditAction.IMPORT,
            newStateJson: jantri as any,
            changeSummary: `CSV batch imported Jantri rate benchmark ${jantri.id} (${verificationStatus})`,
            performedByUserId: params.userId,
            performedByEmail: params.userEmail,
            ipAddress: params.ipAddress,
          },
        });

        if (dupCheck.isDuplicate) {
          result.duplicateCount++;
        } else {
          result.importedCount++;
        }
        result.importedIds.push(jantri.id);
      }
    } catch (err: any) {
      result.errorCount++;
      result.errors.push({
        row: rowNum,
        message: err.message || 'Row processing failure',
      });
    }
  }

  // Set overall success based on whether any rows imported
  result.success = result.importedCount > 0 || (result.duplicateCount > 0 && result.errorCount === 0);
  return result;
}

// ============================================================================
// 3. VERIFICATION & WORKFLOW ACTION ENGINE (APPROVE / REJECT / FLAG / CORRECT)
// ============================================================================

export async function processEvidenceAction(params: {
  entityType: 'TRANSACTION' | 'LISTING' | 'JANTRI';
  entityId: string;
  action: 'APPROVE' | 'REJECT' | 'FLAG' | 'CORRECT';
  reason?: string;
  correctionData?: Record<string, any>;
  reviewerUserId: string;
  reviewerEmail?: string;
  ipAddress?: string;
}) {
  let localityIdToReassess: string | null = null;
  let previousState: any = null;
  let newState: any = null;

  if (params.entityType === 'TRANSACTION') {
    const existing = await db.propertyTransaction.findUnique({
      where: { id: params.entityId },
    });
    if (!existing) throw new Error(`Transaction ${params.entityId} not found`);
    previousState = existing;
    localityIdToReassess = existing.localityId;

    if (params.action === 'APPROVE') {
      newState = await db.propertyTransaction.update({
        where: { id: params.entityId },
        data: {
          verificationStatus: EvidenceVerificationStatus.VERIFIED,
          reviewedByUserId: params.reviewerUserId,
          reviewedAt: new Date(),
          rejectionReason: null,
          flagReason: null,
        },
      });
      // Increment locality transaction count
      await db.locality.update({
        where: { id: existing.localityId },
        data: { totalTransactions: { increment: 1 } },
      });
    } else if (params.action === 'REJECT') {
      newState = await db.propertyTransaction.update({
        where: { id: params.entityId },
        data: {
          verificationStatus: EvidenceVerificationStatus.REJECTED,
          reviewedByUserId: params.reviewerUserId,
          reviewedAt: new Date(),
          rejectionReason: params.reason || 'Rejected by data integrity officer',
        },
      });
    } else if (params.action === 'FLAG') {
      newState = await db.propertyTransaction.update({
        where: { id: params.entityId },
        data: {
          verificationStatus: EvidenceVerificationStatus.FLAGGED,
          reviewedByUserId: params.reviewerUserId,
          reviewedAt: new Date(),
          flagReason: params.reason || 'Flagged for statutory provenance audit',
        },
      });
    } else if (params.action === 'CORRECT') {
      const data = params.correctionData || {};
      const carpet = data.carpetAreaSqFt !== undefined ? parseFloat(data.carpetAreaSqFt) : existing.carpetAreaSqFt;
      const priceLakhs = data.transactedPriceLakhs !== undefined ? parseFloat(data.transactedPriceLakhs) : existing.transactedPriceLakhs;
      const totalPriceRupees = Math.round(priceLakhs * 100000);
      const derivedRate = Math.round(totalPriceRupees / carpet);

      newState = await db.propertyTransaction.update({
        where: { id: params.entityId },
        data: {
          ...(data.bhk !== undefined ? { bhk: parseFloat(data.bhk) } : {}),
          carpetAreaSqFt: carpet,
          transactedPriceLakhs: priceLakhs,
          totalPriceRupees,
          pricePerSqFtCarpet: derivedRate,
          derivedRateSqFt: derivedRate,
          ...(data.floor !== undefined ? { floor: parseInt(data.floor, 10) } : {}),
          ...(data.deedId !== undefined ? { deedId: data.deedId } : {}),
          ...(data.subRegistrarOffice !== undefined ? { subRegistrarOffice: data.subRegistrarOffice } : {}),
          ...(data.remarks !== undefined ? { remarks: data.remarks } : {}),
          reviewedByUserId: params.reviewerUserId,
          reviewedAt: new Date(),
        },
      });
    }

    // Write Audit Log
    const auditAction: EvidenceAuditAction =
      params.action === 'APPROVE' ? EvidenceAuditAction.VERIFY : (params.action as EvidenceAuditAction);

    await db.evidenceAuditLog.create({
      data: {
        entityType: EvidenceEntityType.TRANSACTION,
        entityId: params.entityId,
        transactionId: params.entityId,
        action: auditAction,
        previousStateJson: previousState,
        newStateJson: newState,
        reason: params.reason,
        changeSummary: `Transaction ${params.entityId} action: ${params.action}`,
        performedByUserId: params.reviewerUserId,
        performedByEmail: params.reviewerEmail,
        ipAddress: params.ipAddress,
      },
    });
  } else if (params.entityType === 'LISTING') {
    const existing = await db.propertyListing.findUnique({
      where: { id: params.entityId },
    });
    if (!existing) throw new Error(`Listing ${params.entityId} not found`);
    previousState = existing;
    localityIdToReassess = existing.localityId;

    if (params.action === 'APPROVE') {
      newState = await db.propertyListing.update({
        where: { id: params.entityId },
        data: {
          verificationStatus: EvidenceVerificationStatus.VERIFIED,
          reviewedByUserId: params.reviewerUserId,
          reviewedAt: new Date(),
          rejectionReason: null,
          flagReason: null,
        },
      });
    } else if (params.action === 'REJECT') {
      newState = await db.propertyListing.update({
        where: { id: params.entityId },
        data: {
          verificationStatus: EvidenceVerificationStatus.REJECTED,
          reviewedByUserId: params.reviewerUserId,
          reviewedAt: new Date(),
          rejectionReason: params.reason || 'Rejected by reviewer',
        },
      });
    } else if (params.action === 'FLAG') {
      newState = await db.propertyListing.update({
        where: { id: params.entityId },
        data: {
          verificationStatus: EvidenceVerificationStatus.FLAGGED,
          reviewedByUserId: params.reviewerUserId,
          reviewedAt: new Date(),
          flagReason: params.reason || 'Flagged for price or area discrepancy',
        },
      });
    } else if (params.action === 'CORRECT') {
      const data = params.correctionData || {};
      const carpet = data.carpetAreaSqFt !== undefined ? parseFloat(data.carpetAreaSqFt) : existing.carpetAreaSqFt;
      const priceLakhs = data.askingPriceLakhs !== undefined ? parseFloat(data.askingPriceLakhs) : existing.askingPriceLakhs;
      const totalPriceRupees = Math.round(priceLakhs * 100000);
      const derivedRate = Math.round(totalPriceRupees / carpet);

      newState = await db.propertyListing.update({
        where: { id: params.entityId },
        data: {
          ...(data.bhk !== undefined ? { bhk: parseFloat(data.bhk) } : {}),
          carpetAreaSqFt: carpet,
          askingPriceLakhs: priceLakhs,
          totalPriceRupees,
          pricePerSqFtCarpet: derivedRate,
          derivedRateSqFt: derivedRate,
          ...(data.sourceUrl !== undefined ? { sourceUrl: data.sourceUrl } : {}),
          reviewedByUserId: params.reviewerUserId,
          reviewedAt: new Date(),
        },
      });
    }

    const auditActionListing: EvidenceAuditAction =
      params.action === 'APPROVE' ? EvidenceAuditAction.VERIFY : (params.action as EvidenceAuditAction);

    await db.evidenceAuditLog.create({
      data: {
        entityType: EvidenceEntityType.ASKING_LISTING,
        entityId: params.entityId,
        listingId: params.entityId,
        action: auditActionListing,
        previousStateJson: previousState,
        newStateJson: newState,
        reason: params.reason,
        changeSummary: `Listing ${params.entityId} action: ${params.action}`,
        performedByUserId: params.reviewerUserId,
        performedByEmail: params.reviewerEmail,
        ipAddress: params.ipAddress,
      },
    });
  } else if (params.entityType === 'JANTRI') {
    const existing = await db.jantriBenchmark.findUnique({
      where: { id: params.entityId },
    });
    if (!existing) throw new Error(`Jantri record ${params.entityId} not found`);
    previousState = existing;
    localityIdToReassess = existing.localityId;

    if (params.action === 'APPROVE') {
      newState = await db.jantriBenchmark.update({
        where: { id: params.entityId },
        data: {
          verificationStatus: EvidenceVerificationStatus.VERIFIED,
          reviewedByUserId: params.reviewerUserId,
          reviewedAt: new Date(),
        },
      });
    } else if (params.action === 'REJECT') {
      newState = await db.jantriBenchmark.update({
        where: { id: params.entityId },
        data: {
          verificationStatus: EvidenceVerificationStatus.REJECTED,
          reviewedByUserId: params.reviewerUserId,
          reviewedAt: new Date(),
        },
      });
    } else if (params.action === 'CORRECT') {
      const data = params.correctionData || {};
      newState = await db.jantriBenchmark.update({
        where: { id: params.entityId },
        data: {
          ...(data.residentialApartmentRateSqFt !== undefined ? { residentialApartmentRateSqFt: parseFloat(data.residentialApartmentRateSqFt) } : {}),
          ...(data.tpSchemeNo !== undefined ? { tpSchemeNo: data.tpSchemeNo } : {}),
          ...(data.finalPlotNo !== undefined ? { finalPlotNo: data.finalPlotNo } : {}),
          ...(data.remarks !== undefined ? { remarks: data.remarks } : {}),
          reviewedByUserId: params.reviewerUserId,
          reviewedAt: new Date(),
        },
      });
    }

    const auditActionJantri: EvidenceAuditAction =
      params.action === 'APPROVE' ? EvidenceAuditAction.VERIFY : (params.action as EvidenceAuditAction);

    await db.evidenceAuditLog.create({
      data: {
        entityType: EvidenceEntityType.JANTRI,
        entityId: params.entityId,
        jantriId: params.entityId,
        action: auditActionJantri,
        previousStateJson: previousState,
        newStateJson: newState,
        reason: params.reason,
        changeSummary: `Jantri benchmark ${params.entityId} action: ${params.action}`,
        performedByUserId: params.reviewerUserId,
        performedByEmail: params.reviewerEmail,
        ipAddress: params.ipAddress,
      },
    });
  }

  // Trigger automated coverage and eligibility re-assessment for the affected locality
  if (localityIdToReassess) {
    await assessLocalityCoverage(localityIdToReassess);
  }

  return { success: true, action: params.action, record: newState };
}

// ============================================================================
// 4. DATA COVERAGE & DETERMINISTIC VALUATION ELIGIBILITY RULES
// ============================================================================

export async function assessLocalityCoverage(localityId: string): Promise<LocalityCoverageAssessment> {
  const locality = await db.locality.findUnique({
    where: { id: localityId },
    include: {
      transactions: true,
      listings: true,
      jantriBenchmarks: true,
    },
  });

  if (!locality) throw new Error(`Locality ${localityId} not found`);

  // Count by verified vs pending
  const verifiedTx = locality.transactions.filter(
    (t) => t.verificationStatus === EvidenceVerificationStatus.VERIFIED
  );
  const pendingTx = locality.transactions.filter(
    (t) => t.verificationStatus === EvidenceVerificationStatus.PENDING_VERIFICATION
  );

  const verifiedListings = locality.listings.filter(
    (l) => l.verificationStatus === EvidenceVerificationStatus.VERIFIED
  );
  const pendingListings = locality.listings.filter(
    (l) => l.verificationStatus === EvidenceVerificationStatus.PENDING_VERIFICATION
  );

  const verifiedJantri = locality.jantriBenchmarks.filter(
    (j) => j.verificationStatus === EvidenceVerificationStatus.VERIFIED
  );

  const totalRecords = locality.transactions.length + locality.listings.length + locality.jantriBenchmarks.length;

  // Determine date boundaries
  const allDates: Date[] = [
    ...locality.transactions.map((t) => t.registrationDate),
    ...locality.listings.map((l) => l.listingDate),
    ...locality.jantriBenchmarks.map((j) => j.effectiveDate),
  ].sort((a, b) => a.getTime() - b.getTime());

  const earliestEvidenceDate = allDates.length > 0 ? allDates[0] : null;
  const latestEvidenceDate = allDates.length > 0 ? allDates[allDates.length - 1] : null;

  // Recent transactions within last 6 months (180 days)
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  const recentVerifiedTxCount = verifiedTx.filter((t) => t.registrationDate >= sixMonthsAgo).length;

  // Explicit Evidence-Quality Rules Evaluation
  const evidenceGaps: string[] = [];

  // Rule 1: Transaction Density (min 3 verified residential transactions)
  if (verifiedTx.length < 3) {
    evidenceGaps.push(`Insufficient verified transaction density: ${verifiedTx.length}/3 required deeds`);
  }

  // Rule 2: Recency (at least 1 verified transaction or listing in last 6 months)
  if (recentVerifiedTxCount === 0 && verifiedListings.length === 0) {
    evidenceGaps.push('No recent evidence within the last 180 days (transaction recency gap)');
  }

  // Rule 3: Statutory Anchor (at least 1 verified government Jantri circle rate benchmark)
  if (verifiedJantri.length === 0) {
    evidenceGaps.push('Missing statutory government Jantri circle rate benchmark for this micro-market');
  }

  // Determine Valuation Eligibility Status
  let valuationEligibility: ValuationEligibilityStatus = ValuationEligibilityStatus.INSUFFICIENT_DATA;
  let eligibilityReason = '';

  if (evidenceGaps.length === 0) {
    valuationEligibility = ValuationEligibilityStatus.VERIFIED_VALUATION_ELIGIBLE;
    eligibilityReason =
      'Meets all 3 explicit data-quality criteria: >=3 verified deeds, active recent benchmark records, and official Jantri anchor.';
  } else if (verifiedTx.length >= 1 || verifiedJantri.length >= 1) {
    valuationEligibility = ValuationEligibilityStatus.PRELIMINARY_CALIBRATION;
    eligibilityReason = `Staging calibration only: ${evidenceGaps.join('; ')}`;
  } else {
    valuationEligibility = ValuationEligibilityStatus.INSUFFICIENT_DATA;
    eligibilityReason = `Data gaps block valuation: ${evidenceGaps.join('; ')}`;
  }

  // Source Quality Score (0 to 100)
  const verifiedCount = verifiedTx.length + verifiedListings.length + verifiedJantri.length;
  const sourceQualityScore = totalRecords > 0 ? Math.round((verifiedCount / totalRecords) * 100) : 0;

  // Persist DataCoverageAudit
  await db.dataCoverageAudit.create({
    data: {
      localityId: locality.id,
      totalRecordsCount: totalRecords,
      verifiedTransactionsCount: verifiedTx.length,
      pendingTransactionsCount: pendingTx.length,
      verifiedListingsCount: verifiedListings.length,
      pendingListingsCount: pendingListings.length,
      verifiedJantriBenchmarksCount: verifiedJantri.length,
      sourceQualityScore,
      earliestEvidenceDate,
      latestEvidenceDate,
      evidenceGaps: evidenceGaps as any,
      valuationEligibility,
      eligibilityReason,
    },
  });

  // Update Locality record with status
  await db.locality.update({
    where: { id: locality.id },
    data: {
      valuationReady: valuationEligibility === ValuationEligibilityStatus.VERIFIED_VALUATION_ELIGIBLE,
      valuationEligibility,
      evidenceScore: sourceQualityScore,
    },
  });

  return {
    localityId: locality.id,
    localitySlug: locality.slug,
    localityName: locality.name,
    totalRecords,
    verifiedTransactionsCount: verifiedTx.length,
    pendingTransactionsCount: pendingTx.length,
    verifiedListingsCount: verifiedListings.length,
    pendingListingsCount: pendingListings.length,
    verifiedJantriBenchmarksCount: verifiedJantri.length,
    sourceQualityScore,
    earliestEvidenceDate,
    latestEvidenceDate,
    evidenceGaps,
    valuationEligibility,
    eligibilityReason,
  };
}

// ============================================================================
// 5. EXPORT OF APPROVED EVIDENCE (CSV GENERATOR)
// ============================================================================

export async function exportApprovedEvidenceCsv(params: {
  entityType: 'TRANSACTIONS' | 'LISTINGS' | 'JANTRI';
  localityId?: string;
}): Promise<string> {
  if (params.entityType === 'TRANSACTIONS') {
    const transactions = await db.propertyTransaction.findMany({
      where: {
        verificationStatus: EvidenceVerificationStatus.VERIFIED,
        ...(params.localityId ? { localityId: params.localityId } : {}),
      },
      include: {
        locality: true,
        project: true,
        source: true,
      },
      orderBy: { registrationDate: 'desc' },
    });

    const headers = [
      'Record ID',
      'Deed ID',
      'Registration Date',
      'Locality',
      'Project',
      'BHK',
      'Carpet Area (Sq.Ft)',
      'Floor',
      'Transacted Price (Lakhs)',
      'Derived Rate (₹/Sq.Ft)',
      'Sub-Registrar Office',
      'Source Name',
      'Source Reference',
      'Status',
      'Reviewed At',
      'Reviewer ID',
    ];

    const rows = transactions.map((t) => [
      t.id,
      t.deedId || '',
      t.registrationDate.toISOString().slice(0, 10),
      `"${t.locality.name}"`,
      `"${t.project?.name || ''}"`,
      t.bhk,
      t.carpetAreaSqFt,
      t.floor !== null ? t.floor : '',
      t.transactedPriceLakhs,
      t.derivedRateSqFt,
      `"${t.subRegistrarOffice || ''}"`,
      `"${t.source.name}"`,
      `"${t.sourceReference || ''}"`,
      t.verificationStatus,
      t.reviewedAt ? t.reviewedAt.toISOString().slice(0, 10) : '',
      t.reviewedByUserId || '',
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  } else if (params.entityType === 'LISTINGS') {
    const listings = await db.propertyListing.findMany({
      where: {
        verificationStatus: EvidenceVerificationStatus.VERIFIED,
        ...(params.localityId ? { localityId: params.localityId } : {}),
      },
      include: {
        locality: true,
        project: true,
        source: true,
      },
      orderBy: { listingDate: 'desc' },
    });

    const headers = [
      'Record ID',
      'Listing Date',
      'Locality',
      'Project',
      'BHK',
      'Carpet Area (Sq.Ft)',
      'Asking Price (Lakhs)',
      'Derived Rate (₹/Sq.Ft)',
      'Seller Type',
      'Source URL',
      'Source Name',
      'Status',
      'Reviewed At',
    ];

    const rows = listings.map((l) => [
      l.id,
      l.listingDate.toISOString().slice(0, 10),
      `"${l.locality.name}"`,
      `"${l.project?.name || ''}"`,
      l.bhk,
      l.carpetAreaSqFt,
      l.askingPriceLakhs,
      l.derivedRateSqFt,
      l.sellerType || '',
      `"${l.sourceUrl || ''}"`,
      `"${l.source.name}"`,
      l.verificationStatus,
      l.reviewedAt ? l.reviewedAt.toISOString().slice(0, 10) : '',
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  } else {
    const benchmarks = await db.jantriBenchmark.findMany({
      where: {
        verificationStatus: EvidenceVerificationStatus.VERIFIED,
        ...(params.localityId ? { localityId: params.localityId } : {}),
      },
      include: {
        locality: true,
        project: true,
        source: true,
      },
      orderBy: { effectiveDate: 'desc' },
    });

    const headers = [
      'Benchmark ID',
      'Jantri Edition',
      'Effective Date',
      'Locality',
      'Project',
      'TP Scheme No',
      'Final Plot No',
      'Survey Number',
      'Residential Apartment Rate (₹/Sq.Ft)',
      'Residential Land Rate (₹/Sq.Meter)',
      'Commercial Shop Rate (₹/Sq.Ft)',
      'Source Name',
      'Status',
    ];

    const rows = benchmarks.map((j) => [
      j.id,
      j.jantriEdition,
      j.effectiveDate.toISOString().slice(0, 10),
      `"${j.locality.name}"`,
      `"${j.project?.name || ''}"`,
      `"${j.tpSchemeNo || ''}"`,
      `"${j.finalPlotNo || ''}"`,
      `"${j.surveyNumber || ''}"`,
      j.residentialApartmentRateSqFt,
      j.residentialLandRateSqMeter || '',
      j.commercialShopRateSqFt || '',
      `"${j.source.name}"`,
      j.verificationStatus,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
