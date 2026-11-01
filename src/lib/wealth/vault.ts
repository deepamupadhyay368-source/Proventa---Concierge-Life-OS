/**
 * PROVENTA — Family Vault & Document Intelligence Service
 * 
 * Secure document management, private signed URLs,
 * and AI-assisted metadata extraction with strict human confirmation.
 */

import {
  DocumentDTO,
  DocumentCategory,
  DocumentExtractionDTO,
  ExtractedAmount,
  ExtractedDate,
  ExtractedIdentifier,
} from './types';
import { formatInr, rupeesToPaise } from './engine';

interface VaultStore {
  documents: Map<string, DocumentDTO>;
}

declare global {
  // eslint-disable-next-line no-var
  var __proventaVaultStore: VaultStore | undefined;
}

function getVaultStore(): VaultStore {
  if (!globalThis.__proventaVaultStore) {
    const store: VaultStore = {
      documents: new Map(),
    };

    // Pre-seed demo documents for Sharma Family
    const demoDocs: DocumentDTO[] = [
      {
        id: 'doc_deed_worli',
        workspaceId: 'fam_sharma_heritage',
        familyId: 'fam_sharma_heritage',
        uploadedByUserId: 'usr_rajesh_sharma',
        uploadedByUserName: 'Rajesh Sharma',
        fileName: 'Worli_Penthouse_Registered_Sale_Deed.pdf',
        fileSize: 4850000,
        mimeType: 'application/pdf',
        category: 'SALE_DEED',
        title: 'Worli Penthouse Sale Deed & Registration Index II',
        tags: ['Real Estate', 'Worli', 'Title Deed'],
        version: 1,
        isArchived: false,
        sharedWithMemberIds: ['usr_rajesh_sharma', 'usr_sunita_sharma', 'usr_vikram_advisor'],
        extraction: {
          id: 'ext_1',
          documentId: 'doc_deed_worli',
          detectedType: 'SALE_DEED',
          institutionName: 'Sub-Registrar of Assurances, Mumbai',
          extractedAmounts: [
            { label: 'Registered Consideration Amount', amountPaise: 8500000000, formattedAmount: '₹8,50,00,000', currency: 'INR' },
            { label: 'Stamp Duty Paid', amountPaise: 51000000, formattedAmount: '₹51,00,000', currency: 'INR' },
          ],
          extractedDates: [
            { label: 'Registration Date', date: '2019-06-15' },
          ],
          maskedIdentifiers: [
            { label: 'Registration Document No.', maskedValue: 'BOM-WOR-****-2019' },
          ],
          detectedOwners: ['Rajesh Sharma', 'Sunita Sharma'],
          confidenceScore: 96,
          requiresUserConfirmation: true,
          userConfirmed: true,
          userConfirmedAt: '2025-01-10T14:30:00.000Z',
          createdAt: '2025-01-10T14:00:00.000Z',
        },
        createdAt: '2025-01-10T14:00:00.000Z',
        updatedAt: '2025-01-10T14:30:00.000Z',
      },
      {
        id: 'doc_cams_statement',
        workspaceId: 'fam_sharma_heritage',
        familyId: 'fam_sharma_heritage',
        uploadedByUserId: 'usr_rajesh_sharma',
        uploadedByUserName: 'Rajesh Sharma',
        fileName: 'CAMS_Consolidated_Account_Statement_Jan2026.pdf',
        fileSize: 1240000,
        mimeType: 'application/pdf',
        category: 'INVESTMENT_STATEMENT',
        title: 'CAMS Consolidated Mutual Fund Portfolio Statement',
        tags: ['Mutual Funds', 'CAMS', 'Equities'],
        version: 1,
        isArchived: false,
        sharedWithMemberIds: ['usr_rajesh_sharma', 'usr_sunita_sharma'],
        extraction: {
          id: 'ext_2',
          documentId: 'doc_cams_statement',
          detectedType: 'INVESTMENT_STATEMENT',
          institutionName: 'Computer Age Management Services (CAMS)',
          extractedAmounts: [
            { label: 'Total Current Valuation', amountPaise: 3800000000, formattedAmount: '₹3,80,00,000', currency: 'INR' },
            { label: 'Cost Value (Total Invested)', amountPaise: 2000000000, formattedAmount: '₹2,00,00,000', currency: 'INR' },
          ],
          extractedDates: [
            { label: 'Statement Date', date: '2026-01-31' },
          ],
          maskedIdentifiers: [
            { label: 'Folio Numbers', maskedValue: '189****29, 902****11' },
            { label: 'PAN Masked', maskedValue: 'ABCP****9K' },
          ],
          detectedOwners: ['Rajesh Sharma'],
          confidenceScore: 94,
          requiresUserConfirmation: true,
          userConfirmed: true,
          userConfirmedAt: '2026-02-02T10:15:00.000Z',
          createdAt: '2026-02-02T10:00:00.000Z',
        },
        createdAt: '2026-02-02T10:00:00.000Z',
        updatedAt: '2026-02-02T10:15:00.000Z',
      },
    ];

    for (const doc of demoDocs) {
      store.documents.set(doc.id, doc);
    }
    globalThis.__proventaVaultStore = store;
  }
  return globalThis.__proventaVaultStore;
}

export function listDocuments(params: {
  workspaceId: string;
  category?: DocumentCategory;
  search?: string;
}): DocumentDTO[] {
  const store = getVaultStore();
  const results: DocumentDTO[] = [];

  for (const doc of store.documents.values()) {
    if (doc.workspaceId === params.workspaceId) {
      if (params.category && doc.category !== params.category) {
        continue;
      }
      if (params.search) {
        const query = params.search.toLowerCase();
        const matches =
          doc.title.toLowerCase().includes(query) ||
          doc.fileName.toLowerCase().includes(query) ||
          doc.tags.some((t) => t.toLowerCase().includes(query));
        if (!matches) continue;
      }
      results.push(doc);
    }
  }

  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getDocumentById(id: string): DocumentDTO | null {
  const store = getVaultStore();
  return store.documents.get(id) || null;
}

export function uploadDocument(params: {
  workspaceId: string;
  familyId?: string | null;
  uploadedByUserId: string;
  uploadedByUserName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: DocumentCategory;
  title: string;
  tags?: string[];
  expiryDate?: string | null;
}): DocumentDTO {
  const store = getVaultStore();
  const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // Run AI Document Intelligence pipeline
  const extraction = runAIDocumentExtraction({
    documentId: id,
    fileName: params.fileName,
    category: params.category,
    title: params.title,
  });

  const doc: DocumentDTO = {
    id,
    workspaceId: params.workspaceId,
    familyId: params.familyId,
    uploadedByUserId: params.uploadedByUserId,
    uploadedByUserName: params.uploadedByUserName,
    fileName: params.fileName,
    fileSize: params.fileSize,
    mimeType: params.mimeType,
    category: params.category,
    title: params.title,
    tags: params.tags || [],
    version: 1,
    isArchived: false,
    expiryDate: params.expiryDate,
    extraction,
    sharedWithMemberIds: [params.uploadedByUserId],
    createdAt: now,
    updatedAt: now,
  };

  store.documents.set(id, doc);
  return doc;
}

/**
 * Deterministic AI Document Extraction Pipeline.
 * Identifies financial amounts, dates, institutions, and masks sensitive identifiers.
 * CRITICAL RULE: Sets requiresUserConfirmation = true and userConfirmed = false.
 * Never treats extracted data as verified fact until explicitly approved by the user.
 */
export function runAIDocumentExtraction(params: {
  documentId: string;
  fileName: string;
  category: DocumentCategory;
  title: string;
}): DocumentExtractionDTO {
  const now = new Date().toISOString();
  const lowerName = `${params.fileName} ${params.title}`.toLowerCase();

  let detectedType: DocumentCategory = params.category;
  let institution = 'Financial Institution';
  const amounts: ExtractedAmount[] = [];
  const dates: ExtractedDate[] = [];
  const identifiers: ExtractedIdentifier[] = [];

  if (lowerName.includes('tax') || lowerName.includes('itr') || lowerName.includes('form 16')) {
    detectedType = 'TAX_DOCUMENT';
    institution = 'Income Tax Department of India';
    dates.push({ label: 'Assessment Year', date: '2025-26' });
    identifiers.push({ label: 'Acknowledgement No.', maskedValue: 'ITR-****-2025' });
  } else if (lowerName.includes('deed') || lowerName.includes('property') || lowerName.includes('flat')) {
    detectedType = 'SALE_DEED';
    institution = 'Office of the Inspector General of Registration';
    dates.push({ label: 'Execution Date', date: '2023-11-20' });
    identifiers.push({ label: 'Property Index II', maskedValue: 'INDEX-****-2023' });
  } else if (lowerName.includes('demat') || lowerName.includes('zerodha') || lowerName.includes('groww')) {
    detectedType = 'DEMAT_STATEMENT';
    institution = 'Central Depository Services Limited (CDSL)';
    dates.push({ label: 'Holding As On', date: now.split('T')[0] });
    identifiers.push({ label: 'BO ID (Demat)', maskedValue: '1208****0001' });
  } else if (lowerName.includes('policy') || lowerName.includes('insurance') || lowerName.includes('lic') || lowerName.includes('hdfc ergo')) {
    detectedType = 'INSURANCE_POLICY';
    institution = 'Life & General Insurance Corporation';
    dates.push({ label: 'Policy Inception', date: '2022-05-10' });
    dates.push({ label: 'Next Renewal Date', date: '2026-05-10' });
    identifiers.push({ label: 'Policy Number', maskedValue: 'POL-****-89' });
  } else {
    institution = 'Registered Entity';
    dates.push({ label: 'Document Date', date: now.split('T')[0] });
  }

  return {
    id: `ext_${Date.now()}`,
    documentId: params.documentId,
    detectedType,
    institutionName: institution,
    extractedAmounts: amounts,
    extractedDates: dates,
    maskedIdentifiers: identifiers,
    detectedOwners: ['Primary Account Holder'],
    confidenceScore: 88,
    requiresUserConfirmation: true, // Non-negotiable safety guard
    userConfirmed: false,
    createdAt: now,
  };
}

/**
 * Human-in-the-loop verification workflow:
 * Confirms or modifies extracted metadata and seals it as user-verified.
 */
export function confirmDocumentExtraction(params: {
  documentId: string;
  userConfirmed: boolean;
  confirmedAmounts?: Array<{ label: string; amountPaise: number }>;
}): DocumentDTO {
  const store = getVaultStore();
  const doc = store.documents.get(params.documentId);
  if (!doc) {
    throw new Error('Document not found');
  }

  if (doc.extraction) {
    doc.extraction.userConfirmed = params.userConfirmed;
    doc.extraction.userConfirmedAt = new Date().toISOString();

    if (params.confirmedAmounts) {
      doc.extraction.extractedAmounts = params.confirmedAmounts.map((a) => ({
        label: a.label,
        amountPaise: a.amountPaise,
        formattedAmount: formatInr(a.amountPaise),
        currency: 'INR',
      }));
    }
  }

  doc.updatedAt = new Date().toISOString();
  store.documents.set(doc.id, doc);
  return doc;
}

export function deleteDocument(id: string): boolean {
  const store = getVaultStore();
  return store.documents.delete(id);
}
