/**
 * PROVENTA — Family Wealth OS Domain Types
 * Single Source of Truth for Data Structures & Contracts
 */

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SGD';

export type WorkspaceType = 'INDIVIDUAL' | 'FAMILY';

export type FamilyRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export type FamilyRelationshipType =
  | 'SELF'
  | 'SPOUSE'
  | 'CHILD'
  | 'PARENT'
  | 'SIBLING'
  | 'PARTNER'
  | 'ADVISOR'
  | 'OTHER';

export type ResourcePermissionLevel = 'VIEW' | 'EDIT' | 'UPLOAD' | 'DELETE' | 'FULL';

// ==========================================
// ASSET TYPES
// ==========================================

export type AssetCategoryType = 'FINANCIAL' | 'PHYSICAL' | 'BUSINESS';

export type AssetSubcategory =
  // Financial
  | 'BANK_DEPOSIT'
  | 'SAVINGS_ACCOUNT'
  | 'FIXED_DEPOSIT'
  | 'RECURRING_DEPOSIT'
  | 'MUTUAL_FUND'
  | 'STOCK'
  | 'BOND'
  | 'GOV_SECURITY'
  | 'PROVIDENT_FUND'
  | 'PPF'
  | 'NPS'
  | 'EPF'
  | 'OTHER_INVESTMENT'
  // Physical
  | 'RESIDENTIAL_PROPERTY'
  | 'COMMERCIAL_PROPERTY'
  | 'AGRICULTURAL_LAND'
  | 'GOLD'
  | 'JEWELLERY'
  | 'VEHICLE'
  | 'COLLECTIBLE'
  | 'OTHER_VALUABLE'
  // Business
  | 'PRIVATE_COMPANY'
  | 'PARTNERSHIP_INTEREST'
  | 'LLP_INTEREST'
  | 'FAMILY_BUSINESS'
  | 'OTHER_BUSINESS';

export type ValuationStatus =
  | 'ESTIMATED'
  | 'USER_REPORTED'
  | 'DOCUMENT_VERIFIED'
  | 'EXTERNALLY_VERIFIED';

export interface CoOwner {
  userId?: string;
  name: string;
  relationship?: FamilyRelationshipType;
  ownershipPercentage: number;
}

export interface ValuationRecord {
  id: string;
  valuationDate: string;
  valuePaise: number;
  formattedValue: string;
  valuationStatus: ValuationStatus;
  sourceNote?: string;
  documentId?: string;
  createdAt: string;
}

export interface AssetDTO {
  id: string;
  workspaceId: string;
  workspaceType: WorkspaceType;
  familyId?: string | null;
  name: string;
  category: AssetCategoryType;
  subcategory: AssetSubcategory;
  description?: string | null;
  acquisitionDate?: string | null;
  acquisitionValuePaise?: number | null;
  currentValuePaise: number;
  formattedCurrentValue: string;
  currency: CurrencyCode;
  legalOwnerId: string;
  legalOwnerName: string;
  ownershipPercentage: number;
  coOwners: CoOwner[];
  valuationStatus: ValuationStatus;
  lastValuationDate: string;
  valuationHistory: ValuationRecord[];
  supportingDocumentIds: string[];
  metadata?: Record<string, unknown>;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// LIABILITY TYPES
// ==========================================

export type LiabilityType =
  | 'HOME_LOAN'
  | 'PERSONAL_LOAN'
  | 'BUSINESS_LOAN'
  | 'VEHICLE_LOAN'
  | 'EDUCATION_LOAN'
  | 'CREDIT_CARD'
  | 'OTHER_LIABILITY';

export type RepaymentFrequency = 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' | 'LUMP_SUM';

export interface LiabilityDTO {
  id: string;
  workspaceId: string;
  workspaceType: WorkspaceType;
  familyId?: string | null;
  name: string;
  lenderName: string;
  liabilityType: LiabilityType;
  originalPrincipalPaise: number;
  outstandingBalancePaise: number;
  formattedOutstandingBalance: string;
  currency: CurrencyCode;
  interestRateAnnual: number;
  emiPaise?: number | null;
  formattedEmi?: string | null;
  startDate?: string | null;
  maturityDate?: string | null;
  repaymentFrequency: RepaymentFrequency;
  primaryBorrowerId: string;
  primaryBorrowerName: string;
  borrowerOwnershipPercentage: number;
  coBorrowers: CoOwner[];
  supportingDocumentIds: string[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// CALCULATION & NET WORTH TYPES
// ==========================================

export interface CategoryAllocation {
  category: AssetCategoryType;
  label: string;
  totalPaise: number;
  formattedTotal: string;
  percentage: number;
  count: number;
}

export interface MemberOwnershipShare {
  memberId: string;
  memberName: string;
  relationship: FamilyRelationshipType;
  assetsTotalPaise: number;
  formattedAssetsTotal: string;
  liabilitiesTotalPaise: number;
  formattedLiabilitiesTotal: string;
  netWorthPaise: number;
  formattedNetWorth: string;
  percentageOfFamilyNetWorth: number;
}

export interface HistoricalNetWorthPoint {
  date: string;
  grossAssetsPaise: number;
  grossLiabilitiesPaise: number;
  netWorthPaise: number;
  formattedNetWorth: string;
}

export interface NetWorthSummary {
  workspaceId: string;
  workspaceType: WorkspaceType;
  calculatedAt: string;
  currency: CurrencyCode;
  
  // Gross Totals
  grossAssetsPaise: number;
  formattedGrossAssets: string;
  grossLiabilitiesPaise: number;
  formattedGrossLiabilities: string;
  grossNetWorthPaise: number;
  formattedGrossNetWorth: string;

  // Ownership-Adjusted (prevents double counting in joint holdings)
  ownershipAdjustedAssetsPaise: number;
  formattedAdjustedAssets: string;
  ownershipAdjustedLiabilitiesPaise: number;
  formattedAdjustedLiabilities: string;
  ownershipAdjustedNetWorthPaise: number;
  formattedAdjustedNetWorth: string;

  // Growth & Delta
  monthlyChangePaise: number;
  formattedMonthlyChange: string;
  monthlyGrowthPercentage: number;
  yearlyChangePaise: number;
  formattedYearlyChange: string;
  yearlyGrowthPercentage: number;

  // Distributions
  assetAllocation: CategoryAllocation[];
  memberShares: MemberOwnershipShare[];
  historicalPoints: HistoricalNetWorthPoint[];

  // Counts & Flags
  totalAssetsCount: number;
  totalLiabilitiesCount: number;
  missingInformationCount: number;
  unverifiedAssetsCount: number;
}

// ==========================================
// FAMILY WORKSPACE & PERMISSIONS
// ==========================================

export interface FamilyMemberDTO {
  id: string;
  familyId: string;
  userId: string;
  name: string;
  email: string;
  role: FamilyRole;
  relationship: FamilyRelationshipType;
  avatarUrl?: string | null;
  joinedAt: string;
  isCurrentUser?: boolean;
}

export interface FamilyInvitationDTO {
  id: string;
  familyId: string;
  familyName: string;
  invitedByUserId: string;
  invitedByName: string;
  inviteeEmail: string;
  role: FamilyRole;
  relationship: FamilyRelationshipType;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REVOKED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
}

export interface FamilyWorkspaceDTO {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  currency: CurrencyCode;
  members: FamilyMemberDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface ResourcePermissionDTO {
  id: string;
  resourceType: 'ASSET' | 'LIABILITY' | 'DOCUMENT' | 'GOAL' | 'REPORT';
  resourceId: string;
  targetUserId: string;
  permissionLevel: ResourcePermissionLevel;
  grantedByUserId: string;
  createdAt: string;
}

// ==========================================
// FAMILY VAULT & DOCUMENT INTELLIGENCE
// ==========================================

export type DocumentCategory =
  | 'BANK_STATEMENT'
  | 'PROPERTY_DEED'
  | 'SALE_DEED'
  | 'INVESTMENT_STATEMENT'
  | 'INSURANCE_POLICY'
  | 'LOAN_AGREEMENT'
  | 'TAX_DOCUMENT'
  | 'COMPANY_DOCUMENT'
  | 'DEMAT_STATEMENT'
  | 'FINANCIAL_CERTIFICATE'
  | 'WILL_SUCCESSION'
  | 'OTHER';

export interface ExtractedAmount {
  label: string;
  amountPaise: number;
  formattedAmount: string;
  currency: CurrencyCode;
}

export interface ExtractedDate {
  label: string;
  date: string;
}

export interface ExtractedIdentifier {
  label: string;
  maskedValue: string;
}

export interface DocumentExtractionDTO {
  id: string;
  documentId: string;
  detectedType: DocumentCategory;
  institutionName?: string | null;
  extractedAmounts: ExtractedAmount[];
  extractedDates: ExtractedDate[];
  maskedIdentifiers: ExtractedIdentifier[];
  detectedOwners: string[];
  expiryOrMaturityDate?: string | null;
  confidenceScore: number; // 0-100
  requiresUserConfirmation: true;
  userConfirmed: boolean;
  userConfirmedAt?: string | null;
  createdAt: string;
}

export interface DocumentDTO {
  id: string;
  workspaceId: string;
  familyId?: string | null;
  uploadedByUserId: string;
  uploadedByUserName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: DocumentCategory;
  title: string;
  tags: string[];
  downloadUrl?: string; // Expiring signed URL
  version: number;
  isArchived: boolean;
  expiryDate?: string | null;
  extraction?: DocumentExtractionDTO | null;
  sharedWithMemberIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// CASHFLOW INTELLIGENCE
// ==========================================

export type CashflowType = 'INCOME' | 'EXPENSE';

export type CashflowCategory =
  | 'SALARY'
  | 'BUSINESS_INCOME'
  | 'RENTAL_INCOME'
  | 'DIVIDENDS'
  | 'INTEREST_INCOME'
  | 'OTHER_INCOME'
  | 'HOUSEHOLD_EXPENSE'
  | 'EMI_REPAYMENT'
  | 'RECURRING_BILL'
  | 'EDUCATION_EXPENSE'
  | 'HEALTHCARE_EXPENSE'
  | 'TRAVEL_EXPENSE'
  | 'OTHER_EXPENSE';

export interface CashflowTransactionDTO {
  id: string;
  workspaceId: string;
  familyId?: string | null;
  userId: string;
  userName: string;
  title: string;
  type: CashflowType;
  category: CashflowCategory;
  amountPaise: number;
  formattedAmount: string;
  transactionDate: string;
  isRecurring: boolean;
  isInternalTransfer: boolean; // Excluded from net income & expense
  sourceAccountId?: string | null;
  destinationAccountId?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface CashflowSummaryDTO {
  periodMonth: string; // YYYY-MM
  totalIncomePaise: number;
  formattedTotalIncome: string;
  totalExpensesPaise: number;
  formattedTotalExpenses: string;
  netCashflowPaise: number;
  formattedNetCashflow: string;
  savingsRatePercentage: number;
  recurringObligationsPaise: number;
  formattedRecurringObligations: string;
  categoryBreakdown: Array<{
    category: CashflowCategory;
    type: CashflowType;
    amountPaise: number;
    formattedAmount: string;
    percentage: number;
  }>;
}

// ==========================================
// FAMILY PROTECTION (INSURANCE)
// ==========================================

export type InsuranceType =
  | 'LIFE_TERM'
  | 'LIFE_ENDOWMENT'
  | 'HEALTH_INDIVIDUAL'
  | 'HEALTH_FAMILY_FLOATER'
  | 'VEHICLE_MOTOR'
  | 'PROPERTY_HOME'
  | 'BUSINESS_LIABILITY'
  | 'CRITICAL_ILLNESS'
  | 'OTHER_POLICY';

export interface InsurancePolicyDTO {
  id: string;
  workspaceId: string;
  familyId?: string | null;
  policyholderId: string;
  policyholderName: string;
  insurerName: string;
  policyNumberMasked: string;
  policyType: InsuranceType;
  sumAssuredPaise: number;
  formattedSumAssured: string;
  premiumAmountPaise: number;
  formattedPremium: string;
  premiumFrequency: RepaymentFrequency;
  renewalDate: string;
  maturityDate?: string | null;
  nominees: Array<{ name: string; relationship: string; sharePercentage: number }>;
  coveredMembers: string[];
  supportingDocumentId?: string | null;
  status: 'ACTIVE' | 'LAPSED' | 'MATURED';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// GOALS & SCENARIO SIMULATIONS
// ==========================================

export type GoalCategory =
  | 'CHILDREN_EDUCATION'
  | 'PROPERTY_PURCHASE'
  | 'RETIREMENT'
  | 'EMERGENCY_RESERVE'
  | 'BUSINESS_EXPANSION'
  | 'FAMILY_EVENT'
  | 'WEALTH_PRESERVATION'
  | 'OTHER';

export interface GoalContributor {
  memberId: string;
  memberName: string;
  contributedPaise: number;
  formattedContributed: string;
}

export interface FinancialGoalDTO {
  id: string;
  workspaceId: string;
  familyId?: string | null;
  title: string;
  category: GoalCategory;
  targetAmountPaise: number;
  formattedTargetAmount: string;
  currentAmountPaise: number;
  formattedCurrentAmount: string;
  progressPercentage: number;
  targetDate: string;
  contributors: GoalContributor[];
  status: 'ON_TRACK' | 'BEHIND' | 'ACHIEVED';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioSimulationInput {
  baseNetWorthPaise: number;
  monthlyAdditionalSavingsPaise?: number;
  expectedAnnualReturnRate?: number; // e.g. 8.5 for 8.5%
  inflationRate?: number; // e.g. 6.0 for 6%
  propertyValueAdjustmentPercentage?: number;
  loanPrepaymentLumpSumPaise?: number;
  projectionYears: number;
}

export interface ScenarioSimulationResult {
  projectionYears: number;
  startingNetWorthPaise: number;
  projectedNetWorthPaise: number;
  formattedProjectedNetWorth: string;
  netGainPaise: number;
  formattedNetGain: string;
  inflationAdjustedNetWorthPaise: number;
  formattedInflationAdjusted: string;
  yearlyMilestones: Array<{
    year: number;
    projectedAmountPaise: number;
    formattedAmount: string;
  }>;
  assumptionsStated: string[];
}

// ==========================================
// BUSINESS & OWNERSHIP INTELLIGENCE
// ==========================================

export type BusinessEntityType =
  | 'PRIVATE_LIMITED_COMPANY'
  | 'PUBLIC_LIMITED_COMPANY'
  | 'LIMITED_LIABILITY_PARTNERSHIP'
  | 'PARTNERSHIP_FIRM'
  | 'SOLE_PROPRIETORSHIP'
  | 'FAMILY_HOLDING_TRUST'
  | 'OTHER_ENTITY';

export interface BusinessOwnershipNode {
  id: string;
  name: string;
  entityType: BusinessEntityType;
  registrationNumber?: string | null;
  directOwners: Array<{
    ownerId: string;
    ownerName: string;
    isFamilyMember: boolean;
    equityPercentage: number;
  }>;
  estimatedValuationPaise: number;
  formattedValuation: string;
  annualTurnoverPaise?: number | null;
  supportingDocumentIds: string[];
}

export interface OwnershipGraphEdge {
  fromNodeId: string;
  fromNodeName: string;
  toNodeId: string;
  toNodeName: string;
  equityPercentage: number;
  isDirect: boolean;
}

export interface BusinessOwnershipGraphDTO {
  entities: BusinessOwnershipNode[];
  edges: OwnershipGraphEdge[];
  familyEffectiveOwnership: Array<{
    entityId: string;
    entityName: string;
    effectiveFamilySharePercentage: number;
    attributedValuePaise: number;
    formattedAttributedValue: string;
  }>;
}

// ==========================================
// FAMILY CONTINUITY & DIRECTORY
// ==========================================

export interface EmergencyContact {
  id: string;
  name: string;
  role: 'CHARTERED_ACCOUNTANT' | 'LAWYER' | 'FAMILY_PHYSICIAN' | 'WEALTH_ADVISOR' | 'TRUSTEE' | 'OTHER';
  phone: string;
  email: string;
  organization?: string;
  notes?: string;
}

export interface FamilyContinuityDTO {
  emergencyInstructions: string;
  importantContacts: EmergencyContact[];
  nomineeRecords: Array<{
    assetOrPolicyName: string;
    nomineeName: string;
    relationship: string;
    sharePercentage: number;
  }>;
  willsAndSuccessionDocumentIds: string[];
  lastUpdated: string;
}

// ==========================================
// AI MULTI-AGENT INTELLIGENCE ENGINE
// ==========================================

export type AIAgentRole =
  | 'WEALTH_ANALYST'
  | 'ASSET_INTELLIGENCE'
  | 'CASHFLOW_ANALYST'
  | 'DOCUMENT_INTELLIGENCE'
  | 'GOAL_SCENARIO'
  | 'FAMILY_ASSISTANT';

export interface AIAssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentRole?: AIAgentRole;
  dataSourcesCited?: string[];
  dataDate?: string;
  timestamp: string;
}

export interface AIInsightObservation {
  id: string;
  agentRole: AIAgentRole;
  title: string;
  observation: string;
  severity: 'INFO' | 'OPPORTUNITY' | 'ALERT' | 'REVIEW';
  actionableStep?: string;
  resourceLink?: string;
  createdAt: string;
}
