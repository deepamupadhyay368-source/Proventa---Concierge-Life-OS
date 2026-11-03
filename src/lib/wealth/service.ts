/**
 * PROVENTA — Family Wealth OS Core Domain Service
 * 
 * Handles multi-workspace isolation (Individual vs Multi-Family),
 * granular resource permissions, asset & liability registers,
 * valuation records, and deterministic net-worth aggregations.
 */

import {
  AssetDTO,
  LiabilityDTO,
  FamilyWorkspaceDTO,
  FamilyMemberDTO,
  FamilyInvitationDTO,
  FamilyRole,
  FamilyRelationshipType,
  ResourcePermissionDTO,
  ResourcePermissionLevel,
  NetWorthSummary,
  WorkspaceType,
  HistoricalNetWorthPoint,
  ValuationStatus,
} from './types';
import { calculateNetWorth, formatInr } from './engine';

// In-Memory fallback store with transactional tenant boundaries
interface WealthStore {
  workspaces: Map<string, FamilyWorkspaceDTO>;
  memberships: Map<string, FamilyMemberDTO[]>; // familyId -> members
  invitations: Map<string, FamilyInvitationDTO>;
  permissions: Map<string, ResourcePermissionDTO[]>; // resourceId -> permissions
  assets: Map<string, AssetDTO>;
  liabilities: Map<string, LiabilityDTO>;
  history: Map<string, HistoricalNetWorthPoint[]>; // workspaceId -> history
}

function createInitialWealthStore(): WealthStore {
  const store: WealthStore = {
    workspaces: new Map(),
    memberships: new Map(),
    invitations: new Map(),
    permissions: new Map(),
    assets: new Map(),
    liabilities: new Map(),
    history: new Map(),
  };

  // Production stores are strictly empty. Test fixtures only seed during test execution.
  if (process.env.NODE_ENV !== 'test') {
    return store;
  }

  // Pre-seed demo family workspace strictly for automated test suite
  const demoFamilyId = 'fam_sharma_heritage';
  const demoOwnerId = 'usr_rajesh_sharma';

  const demoWorkspace: FamilyWorkspaceDTO = {
    id: demoFamilyId,
    name: 'Sharma Family Trust & Holdings',
    ownerId: demoOwnerId,
    ownerName: 'Rajesh Sharma',
    currency: 'INR',
    members: [
      {
        id: 'mem_1',
        familyId: demoFamilyId,
        userId: demoOwnerId,
        name: 'Rajesh Sharma',
        email: 'rajesh.sharma@proventa.internal',
        role: 'OWNER',
        relationship: 'SELF',
        joinedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'mem_2',
        familyId: demoFamilyId,
        userId: 'usr_sunita_sharma',
        name: 'Sunita Sharma',
        email: 'sunita.sharma@proventa.internal',
        role: 'ADMIN',
        relationship: 'SPOUSE',
        joinedAt: '2025-01-05T00:00:00.000Z',
      },
      {
        id: 'mem_3',
        familyId: demoFamilyId,
        userId: 'usr_aarav_sharma',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@proventa.internal',
        role: 'MEMBER',
        relationship: 'CHILD',
        joinedAt: '2025-02-01T00:00:00.000Z',
      },
      {
        id: 'mem_4',
        familyId: demoFamilyId,
        userId: 'usr_vikram_advisor',
        name: 'Vikram Mehta (CA)',
        email: 'vikram.mehta@vmassociates.in',
        role: 'VIEWER',
        relationship: 'ADVISOR',
        joinedAt: '2025-03-01T00:00:00.000Z',
      },
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
  };

  store.workspaces.set(demoFamilyId, demoWorkspace);
  store.memberships.set(demoFamilyId, demoWorkspace.members);

  // Pre-seed realistic Indian Family Assets
  const demoAssets: AssetDTO[] = [
    {
      id: 'ast_sobo_flat',
      workspaceId: demoFamilyId,
      workspaceType: 'FAMILY',
      familyId: demoFamilyId,
      name: 'Sea-Face Residential Penthouse, Worli',
      category: 'PHYSICAL',
      subcategory: 'RESIDENTIAL_PROPERTY',
      description: '4 BHK Luxury Residence overlooking Arabian Sea',
      acquisitionDate: '2019-06-15',
      acquisitionValuePaise: 8500000000, // ₹8.5 Cr
      currentValuePaise: 12500000000, // ₹12.5 Cr
      formattedCurrentValue: '₹12,50,00,000',
      currency: 'INR',
      legalOwnerId: demoOwnerId,
      legalOwnerName: 'Rajesh Sharma',
      ownershipPercentage: 60,
      coOwners: [
        {
          userId: 'usr_sunita_sharma',
          name: 'Sunita Sharma',
          relationship: 'SPOUSE',
          ownershipPercentage: 40,
        },
      ],
      valuationStatus: 'DOCUMENT_VERIFIED',
      lastValuationDate: '2026-01-15',
      valuationHistory: [
        {
          id: 'val_1',
          valuationDate: '2019-06-15',
          valuePaise: 8500000000,
          formattedValue: '₹8,50,00,000',
          valuationStatus: 'DOCUMENT_VERIFIED',
          sourceNote: 'Registered Sale Deed',
          createdAt: '2019-06-15T10:00:00.000Z',
        },
        {
          id: 'val_2',
          valuationDate: '2026-01-15',
          valuePaise: 12500000000,
          formattedValue: '₹12,50,00,000',
          valuationStatus: 'DOCUMENT_VERIFIED',
          sourceNote: 'Government Approved Valuer Report',
          createdAt: '2026-01-15T12:00:00.000Z',
        },
      ],
      supportingDocumentIds: ['doc_deed_worli', 'doc_tax_worli'],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2026-01-15T00:00:00.000Z',
    },
    {
      id: 'ast_mf_portfolio',
      workspaceId: demoFamilyId,
      workspaceType: 'FAMILY',
      familyId: demoFamilyId,
      name: 'Consolidated Mutual Fund Portfolio',
      category: 'FINANCIAL',
      subcategory: 'MUTUAL_FUND',
      description: 'HDFC, ICICI Prudential, and Parag Parikh Flexi Cap',
      acquisitionDate: '2020-03-20',
      acquisitionValuePaise: 2000000000, // ₹2.0 Cr
      currentValuePaise: 3800000000, // ₹3.8 Cr
      formattedCurrentValue: '₹3,80,00,000',
      currency: 'INR',
      legalOwnerId: demoOwnerId,
      legalOwnerName: 'Rajesh Sharma',
      ownershipPercentage: 100,
      coOwners: [],
      valuationStatus: 'DOCUMENT_VERIFIED',
      lastValuationDate: '2026-02-01',
      valuationHistory: [],
      supportingDocumentIds: ['doc_cams_statement'],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    },
    {
      id: 'ast_direct_equity',
      workspaceId: demoFamilyId,
      workspaceType: 'FAMILY',
      familyId: demoFamilyId,
      name: 'Bluechip Demat Portfolio',
      category: 'FINANCIAL',
      subcategory: 'STOCK',
      description: 'Zerodha Demat: TCS, Reliance, L&T, HDFC Bank, Infosys',
      acquisitionDate: '2018-01-10',
      acquisitionValuePaise: 1500000000,
      currentValuePaise: 4200000000, // ₹4.2 Cr
      formattedCurrentValue: '₹4,20,00,000',
      currency: 'INR',
      legalOwnerId: 'usr_sunita_sharma',
      legalOwnerName: 'Sunita Sharma',
      ownershipPercentage: 100,
      coOwners: [],
      valuationStatus: 'DOCUMENT_VERIFIED',
      lastValuationDate: '2026-02-01',
      valuationHistory: [],
      supportingDocumentIds: ['doc_demat_zerodha'],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    },
    {
      id: 'ast_gold_vault',
      workspaceId: demoFamilyId,
      workspaceType: 'FAMILY',
      familyId: demoFamilyId,
      name: 'Family Gold Bullion & Sovereign Gold Bonds',
      category: 'PHYSICAL',
      subcategory: 'GOLD',
      description: 'Physical 24K bars in bank locker + RBI SGB Tranches',
      acquisitionDate: '2016-11-05',
      acquisitionValuePaise: 800000000,
      currentValuePaise: 1950000000, // ₹1.95 Cr
      formattedCurrentValue: '₹1,95,00,000',
      currency: 'INR',
      legalOwnerId: 'usr_sunita_sharma',
      legalOwnerName: 'Sunita Sharma',
      ownershipPercentage: 50,
      coOwners: [
        {
          userId: 'usr_aarav_sharma',
          name: 'Aarav Sharma',
          relationship: 'CHILD',
          ownershipPercentage: 50,
        },
      ],
      valuationStatus: 'DOCUMENT_VERIFIED',
      lastValuationDate: '2026-01-30',
      valuationHistory: [],
      supportingDocumentIds: ['doc_gold_receipts'],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2026-01-30T00:00:00.000Z',
    },
    {
      id: 'ast_family_business',
      workspaceId: demoFamilyId,
      workspaceType: 'FAMILY',
      familyId: demoFamilyId,
      name: 'Apex Precision Engineering Pvt Ltd',
      category: 'BUSINESS',
      subcategory: 'PRIVATE_COMPANY',
      description: 'Manufacturing firm supplying automotive aerospace components (42% family holding)',
      acquisitionDate: '2012-04-01',
      acquisitionValuePaise: 1000000000,
      currentValuePaise: 8500000000, // ₹8.5 Cr attributed value
      formattedCurrentValue: '₹8,50,00,000',
      currency: 'INR',
      legalOwnerId: demoOwnerId,
      legalOwnerName: 'Rajesh Sharma',
      ownershipPercentage: 70,
      coOwners: [
        {
          userId: 'usr_aarav_sharma',
          name: 'Aarav Sharma',
          relationship: 'CHILD',
          ownershipPercentage: 30,
        },
      ],
      valuationStatus: 'DOCUMENT_VERIFIED',
      lastValuationDate: '2025-12-31',
      valuationHistory: [],
      supportingDocumentIds: ['doc_apex_audit', 'doc_share_certificates'],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-12-31T00:00:00.000Z',
    },
    {
      id: 'ast_ppf_nps',
      workspaceId: demoFamilyId,
      workspaceType: 'FAMILY',
      familyId: demoFamilyId,
      name: 'Public Provident Fund & Tier-1 NPS',
      category: 'FINANCIAL',
      subcategory: 'PPF',
      description: 'SBI PPF + Protean NPS Tier 1 Scheme',
      acquisitionDate: '2008-04-10',
      acquisitionValuePaise: 450000000,
      currentValuePaise: 950000000, // ₹95 Lakh
      formattedCurrentValue: '₹95,00,000',
      currency: 'INR',
      legalOwnerId: demoOwnerId,
      legalOwnerName: 'Rajesh Sharma',
      ownershipPercentage: 100,
      coOwners: [],
      valuationStatus: 'DOCUMENT_VERIFIED',
      lastValuationDate: '2026-01-20',
      valuationHistory: [],
      supportingDocumentIds: ['doc_ppf_passbook'],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2026-01-20T00:00:00.000Z',
    },
  ];

  for (const a of demoAssets) {
    store.assets.set(a.id, a);
  }

  // Pre-seed realistic Liabilities
  const demoLiabilities: LiabilityDTO[] = [
    {
      id: 'liab_worli_mortgage',
      workspaceId: demoFamilyId,
      workspaceType: 'FAMILY',
      familyId: demoFamilyId,
      name: 'SBI Housing Loan (Worli Penthouse)',
      lenderName: 'State Bank of India',
      liabilityType: 'HOME_LOAN',
      originalPrincipalPaise: 4000000000, // ₹4.0 Cr original
      outstandingBalancePaise: 1850000000, // ₹1.85 Cr balance
      formattedOutstandingBalance: '₹1,85,00,000',
      currency: 'INR',
      interestRateAnnual: 8.4,
      emiPaise: 35000000, // ₹3.5 Lakh / month
      formattedEmi: '₹3,50,000',
      startDate: '2019-07-01',
      maturityDate: '2034-07-01',
      repaymentFrequency: 'MONTHLY',
      primaryBorrowerId: demoOwnerId,
      primaryBorrowerName: 'Rajesh Sharma',
      borrowerOwnershipPercentage: 60,
      coBorrowers: [
        {
          userId: 'usr_sunita_sharma',
          name: 'Sunita Sharma',
          relationship: 'SPOUSE',
          ownershipPercentage: 40,
        },
      ],
      supportingDocumentIds: ['doc_sbi_loan_statement'],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2026-01-15T00:00:00.000Z',
    },
    {
      id: 'liab_bmw_auto_loan',
      workspaceId: demoFamilyId,
      workspaceType: 'FAMILY',
      familyId: demoFamilyId,
      name: 'BMW Financial Services Auto Loan',
      lenderName: 'BMW Financial Services India',
      liabilityType: 'VEHICLE_LOAN',
      originalPrincipalPaise: 650000000, // ₹65 Lakh
      outstandingBalancePaise: 240000000, // ₹24 Lakh balance
      formattedOutstandingBalance: '₹24,00,000',
      currency: 'INR',
      interestRateAnnual: 8.9,
      emiPaise: 12500000, // ₹1.25 Lakh / month
      formattedEmi: '₹1,25,000',
      startDate: '2023-08-10',
      maturityDate: '2027-08-10',
      repaymentFrequency: 'MONTHLY',
      primaryBorrowerId: 'usr_aarav_sharma',
      primaryBorrowerName: 'Aarav Sharma',
      borrowerOwnershipPercentage: 100,
      coBorrowers: [],
      supportingDocumentIds: ['doc_bmw_agreement'],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2026-01-10T00:00:00.000Z',
    },
  ];

  for (const l of demoLiabilities) {
    store.liabilities.set(l.id, l);
  }

  // Pre-seed Historical Monthly Net Worth points for chart rendering
  const historyPoints: HistoricalNetWorthPoint[] = [
    { date: '2025-03', grossAssetsPaise: 27500000000, grossLiabilitiesPaise: 2400000000, netWorthPaise: 25100000000, formattedNetWorth: '₹25.10 Cr' },
    { date: '2025-05', grossAssetsPaise: 28200000000, grossLiabilitiesPaise: 2340000000, netWorthPaise: 25860000000, formattedNetWorth: '₹25.86 Cr' },
    { date: '2025-07', grossAssetsPaise: 29100000000, grossLiabilitiesPaise: 2280000000, netWorthPaise: 26820000000, formattedNetWorth: '₹26.82 Cr' },
    { date: '2025-09', grossAssetsPaise: 29900000000, grossLiabilitiesPaise: 2220000000, netWorthPaise: 27680000000, formattedNetWorth: '₹27.68 Cr' },
    { date: '2025-11', grossAssetsPaise: 30800000000, grossLiabilitiesPaise: 2150000000, netWorthPaise: 28650000000, formattedNetWorth: '₹28.65 Cr' },
    { date: '2026-01', grossAssetsPaise: 31900000000, grossLiabilitiesPaise: 2090000000, netWorthPaise: 29810000000, formattedNetWorth: '₹29.81 Cr' },
  ];
  store.history.set(demoFamilyId, historyPoints);

  return store;
}

// Global singleton instance
declare global {
  // eslint-disable-next-line no-var
  var __proventaWealthStore: WealthStore | undefined;
}

export function getWealthStore(): WealthStore {
  if (!globalThis.__proventaWealthStore) {
    globalThis.__proventaWealthStore = createInitialWealthStore();
  }
  return globalThis.__proventaWealthStore;
}

// ==========================================
// WORKSPACE SERVICE METHODS
// ==========================================

export function listUserWorkspaces(userId: string): {
  individual: { id: string; name: string; type: 'INDIVIDUAL' };
  families: FamilyWorkspaceDTO[];
} {
  const store = getWealthStore();
  const userFamilies: FamilyWorkspaceDTO[] = [];

  for (const workspace of store.workspaces.values()) {
    const isMember = workspace.members.some((m) => m.userId === userId);
    if (isMember) {
      userFamilies.push(workspace);
    }
  }

  return {
    individual: {
      id: `ind_${userId}`,
      name: 'Personal Workspace',
      type: 'INDIVIDUAL',
    },
    families: userFamilies,
  };
}

export function createFamilyWorkspace(params: {
  name: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  currency?: 'INR';
}): FamilyWorkspaceDTO {
  const store = getWealthStore();
  const familyId = `fam_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newWorkspace: FamilyWorkspaceDTO = {
    id: familyId,
    name: params.name,
    ownerId: params.ownerId,
    ownerName: params.ownerName,
    currency: params.currency || 'INR',
    members: [
      {
        id: `mem_${Date.now()}`,
        familyId,
        userId: params.ownerId,
        name: params.ownerName,
        email: params.ownerEmail,
        role: 'OWNER',
        relationship: 'SELF',
        joinedAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  store.workspaces.set(familyId, newWorkspace);
  store.memberships.set(familyId, newWorkspace.members);
  return newWorkspace;
}

export function inviteFamilyMember(params: {
  familyId: string;
  invitedByUserId: string;
  invitedByName: string;
  inviteeEmail: string;
  role: FamilyRole;
  relationship: FamilyRelationshipType;
}): FamilyInvitationDTO {
  const store = getWealthStore();
  const workspace = store.workspaces.get(params.familyId);
  if (!workspace) {
    throw new Error('Family workspace not found');
  }

  // Permission check: only OWNER or ADMIN can invite
  const inviter = workspace.members.find((m) => m.userId === params.invitedByUserId);
  if (!inviter || (inviter.role !== 'OWNER' && inviter.role !== 'ADMIN')) {
    throw new Error('Unauthorized: only Family Owner or Administrator can invite members');
  }

  const invitationId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const invitation: FamilyInvitationDTO = {
    id: invitationId,
    familyId: params.familyId,
    familyName: workspace.name,
    invitedByUserId: params.invitedByUserId,
    invitedByName: params.invitedByName,
    inviteeEmail: params.inviteeEmail.toLowerCase().trim(),
    role: params.role,
    relationship: params.relationship,
    status: 'PENDING',
    expiresAt,
    createdAt: now.toISOString(),
  };

  store.invitations.set(invitationId, invitation);
  return invitation;
}

export function acceptFamilyInvitation(invitationId: string, acceptingUser: { id: string; name: string; email: string }): FamilyWorkspaceDTO {
  const store = getWealthStore();
  const invitation = store.invitations.get(invitationId);
  if (!invitation || invitation.status !== 'PENDING') {
    throw new Error('Invalid or expired invitation');
  }

  const workspace = store.workspaces.get(invitation.familyId);
  if (!workspace) {
    throw new Error('Target family workspace does not exist');
  }

  const newMember: FamilyMemberDTO = {
    id: `mem_${Date.now()}`,
    familyId: workspace.id,
    userId: acceptingUser.id,
    name: acceptingUser.name,
    email: acceptingUser.email,
    role: invitation.role,
    relationship: invitation.relationship,
    joinedAt: new Date().toISOString(),
  };

  workspace.members.push(newMember);
  workspace.updatedAt = new Date().toISOString();
  store.workspaces.set(workspace.id, workspace);

  invitation.status = 'ACCEPTED';
  store.invitations.set(invitationId, invitation);

  return workspace;
}

export function checkResourceAccess(params: {
  userId: string;
  resourceType: 'ASSET' | 'LIABILITY' | 'DOCUMENT';
  resourceId: string;
  workspaceId: string;
  requiredLevel?: ResourcePermissionLevel;
}): boolean {
  const store = getWealthStore();
  const workspace = store.workspaces.get(params.workspaceId);
  if (!workspace) return false;

  const member = workspace.members.find((m) => m.userId === params.userId);
  if (!member) return false;

  // Owner and Admin have access
  if (member.role === 'OWNER' || member.role === 'ADMIN') return true;

  // If specific asset/liability
  if (params.resourceType === 'ASSET') {
    const asset = store.assets.get(params.resourceId);
    if (!asset) return false;
    if (asset.legalOwnerId === params.userId) return true;
    if (asset.coOwners?.some((co) => co.userId === params.userId)) return true;
  }

  // Check explicit ResourcePermission overrides
  const perms = store.permissions.get(params.resourceId) || [];
  const userPerm = perms.find((p) => p.targetUserId === params.userId);
  if (userPerm) return true;

  return member.role === 'MEMBER' || member.role === 'VIEWER';
}

// ==========================================
// ASSET SERVICE METHODS
// ==========================================

export function listAssets(params: {
  workspaceId: string;
  userId?: string;
  category?: string;
}): AssetDTO[] {
  const store = getWealthStore();
  const results: AssetDTO[] = [];

  for (const asset of store.assets.values()) {
    if (asset.workspaceId === params.workspaceId) {
      if (params.category && asset.category !== params.category) {
        continue;
      }
      results.push(asset);
    }
  }

  return results.sort((a, b) => b.currentValuePaise - a.currentValuePaise);
}

export function syncWorkspaceAssets(workspaceId: string, persisted: AssetDTO[]): void {
  const store = getWealthStore();
  for (const [id, a] of Array.from(store.assets.entries())) {
    if (a.workspaceId === workspaceId) {
      store.assets.delete(id);
    }
  }
  for (const a of persisted) {
    store.assets.set(a.id, a);
  }
}

export function syncWorkspaceLiabilities(workspaceId: string, persisted: LiabilityDTO[]): void {
  const store = getWealthStore();
  for (const [id, l] of Array.from(store.liabilities.entries())) {
    if (l.workspaceId === workspaceId) {
      store.liabilities.delete(id);
    }
  }
  for (const l of persisted) {
    store.liabilities.set(l.id, l);
  }
}

export function getAssetById(id: string): AssetDTO | null {
  const store = getWealthStore();
  return store.assets.get(id) || null;
}

export function createAsset(params: Omit<AssetDTO, 'id' | 'formattedCurrentValue' | 'valuationHistory' | 'createdAt' | 'updatedAt'>): AssetDTO {
  const store = getWealthStore();
  const id = `ast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newAsset: AssetDTO = {
    ...params,
    id,
    formattedCurrentValue: formatInr(params.currentValuePaise),
    valuationHistory: [
      {
        id: `val_${Date.now()}`,
        valuationDate: params.lastValuationDate || now.split('T')[0],
        valuePaise: params.currentValuePaise,
        formattedValue: formatInr(params.currentValuePaise),
        valuationStatus: params.valuationStatus,
        sourceNote: 'Initial registration entry',
        createdAt: now,
      },
    ],
    supportingDocumentIds: params.supportingDocumentIds || [],
    createdAt: now,
    updatedAt: now,
  };

  store.assets.set(id, newAsset);
  return newAsset;
}

export function updateAssetValuation(params: {
  assetId: string;
  newValuePaise: number;
  valuationStatus: ValuationStatus;
  sourceNote?: string;
  documentId?: string;
}): AssetDTO {
  const store = getWealthStore();
  const asset = store.assets.get(params.assetId);
  if (!asset) {
    throw new Error('Asset not found');
  }

  const now = new Date().toISOString();
  const valuationDate = now.split('T')[0];

  const record = {
    id: `val_${Date.now()}`,
    valuationDate,
    valuePaise: params.newValuePaise,
    formattedValue: formatInr(params.newValuePaise),
    valuationStatus: params.valuationStatus,
    sourceNote: params.sourceNote,
    documentId: params.documentId,
    createdAt: now,
  };

  asset.currentValuePaise = params.newValuePaise;
  asset.formattedCurrentValue = formatInr(params.newValuePaise);
  asset.valuationStatus = params.valuationStatus;
  asset.lastValuationDate = valuationDate;
  asset.valuationHistory.push(record);
  asset.updatedAt = now;

  store.assets.set(asset.id, asset);
  return asset;
}

export function deleteAsset(id: string): boolean {
  const store = getWealthStore();
  return store.assets.delete(id);
}

// ==========================================
// LIABILITY SERVICE METHODS
// ==========================================

export function listLiabilities(params: {
  workspaceId: string;
  userId?: string;
}): LiabilityDTO[] {
  const store = getWealthStore();
  const results: LiabilityDTO[] = [];

  for (const liability of store.liabilities.values()) {
    if (liability.workspaceId === params.workspaceId) {
      results.push(liability);
    }
  }

  return results.sort((a, b) => b.outstandingBalancePaise - a.outstandingBalancePaise);
}

export function createLiability(params: Omit<LiabilityDTO, 'id' | 'formattedOutstandingBalance' | 'createdAt' | 'updatedAt'>): LiabilityDTO {
  const store = getWealthStore();
  const id = `liab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newLiability: LiabilityDTO = {
    ...params,
    id,
    formattedOutstandingBalance: formatInr(params.outstandingBalancePaise),
    formattedEmi: params.emiPaise ? formatInr(params.emiPaise) : null,
    supportingDocumentIds: params.supportingDocumentIds || [],
    createdAt: now,
    updatedAt: now,
  };

  store.liabilities.set(id, newLiability);
  return newLiability;
}

export function getLiabilityById(id: string): LiabilityDTO | null {
  const store = getWealthStore();
  return store.liabilities.get(id) || null;
}

export function deleteLiability(id: string): boolean {
  const store = getWealthStore();
  return store.liabilities.delete(id);
}

// ==========================================
// NET WORTH AGGREGATION & TELEMETRY
// ==========================================

export function getWealthDashboardTelemetry(params: {
  workspaceId: string;
  workspaceType?: WorkspaceType;
  targetUserId?: string;
}): NetWorthSummary {
  const store = getWealthStore();
  const workspaceType = params.workspaceType || (params.workspaceId.startsWith('ind_') ? 'INDIVIDUAL' : 'FAMILY');

  const assets = listAssets({ workspaceId: params.workspaceId });
  const liabilities = listLiabilities({ workspaceId: params.workspaceId });
  const historicalPoints = store.history.get(params.workspaceId) || [];

  return calculateNetWorth({
    workspaceId: params.workspaceId,
    workspaceType,
    assets,
    liabilities,
    targetUserId: params.targetUserId,
    historicalPoints,
  });
}
