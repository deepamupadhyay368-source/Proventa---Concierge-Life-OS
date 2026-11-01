/**
 * PROVENTA — Financial Calculation Engine Unit Tests
 * Rigorous tests for deterministic math, joint ownership, double-counting prevention & scenarios.
 */

import { describe, it, expect } from 'vitest';
import {
  formatInr,
  rupeesToPaise,
  paiseToRupees,
  calculateOwnershipAdjustedAssetValue,
  calculateOwnershipAdjustedLiabilityValue,
  deduplicateAssets,
  calculateNetWorth,
  runScenarioSimulation,
} from '@/lib/wealth/engine';
import { AssetDTO, LiabilityDTO } from '@/lib/wealth/types';

describe('Deterministic Financial Calculation Engine', () => {
  describe('Indian Rupee Formatting & Precision Conversions', () => {
    it('correctly converts rupees to integer paise and back without float drift', () => {
      expect(rupeesToPaise(100)).toBe(10000);
      expect(rupeesToPaise('₹ 1,50,000.50')).toBe(15000050);
      expect(paiseToRupees(15000050)).toBe(150000.5);
    });

    it('formats values according to Indian numbering standards (Lakhs and Crores)', () => {
      // ₹1,000
      expect(formatInr(100000)).toBe('₹1,000');
      // ₹1 Lakh (1,00,000)
      expect(formatInr(10000000)).toBe('₹1,00,000');
      // ₹1.5 Crore (1,50,00,000)
      expect(formatInr(1500000000)).toBe('₹1,50,00,000');
      // Negative value -₹50,000
      expect(formatInr(-5000000)).toBe('-₹50,000');
    });
  });

  describe('Joint Ownership & Double Counting Prevention', () => {
    const mockApartment: AssetDTO = {
      id: 'asset_apt_1',
      workspaceId: 'family_1',
      workspaceType: 'FAMILY',
      familyId: 'family_1',
      name: 'South Bombay Luxury Apartment',
      category: 'PHYSICAL',
      subcategory: 'RESIDENTIAL_PROPERTY',
      currentValuePaise: 5000000000, // ₹5 Crore
      formattedCurrentValue: '₹5,00,00,000',
      currency: 'INR',
      legalOwnerId: 'user_father',
      legalOwnerName: 'Rajesh Sharma',
      ownershipPercentage: 60, // Father owns 60%
      coOwners: [
        {
          userId: 'user_son',
          name: 'Aarav Sharma',
          relationship: 'CHILD',
          ownershipPercentage: 40, // Son owns 40%
        },
      ],
      valuationStatus: 'DOCUMENT_VERIFIED',
      lastValuationDate: '2026-01-15',
      valuationHistory: [],
      supportingDocumentIds: ['doc_deed_1'],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-15',
    };

    const mockHomeLoan: LiabilityDTO = {
      id: 'liab_loan_1',
      workspaceId: 'family_1',
      workspaceType: 'FAMILY',
      familyId: 'family_1',
      name: 'HDFC Home Loan',
      lenderName: 'HDFC Bank',
      liabilityType: 'HOME_LOAN',
      originalPrincipalPaise: 2000000000, // ₹2 Crore
      outstandingBalancePaise: 1500000000, // ₹1.5 Crore
      formattedOutstandingBalance: '₹1,50,00,000',
      currency: 'INR',
      interestRateAnnual: 8.5,
      repaymentFrequency: 'MONTHLY',
      primaryBorrowerId: 'user_father',
      primaryBorrowerName: 'Rajesh Sharma',
      borrowerOwnershipPercentage: 50,
      coBorrowers: [
        {
          userId: 'user_son',
          name: 'Aarav Sharma',
          ownershipPercentage: 50,
        },
      ],
      supportingDocumentIds: ['doc_loan_1'],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-15',
    };

    it('correctly calculates ownership-adjusted values for individual family members', () => {
      // In family consolidated view (no targetUserId), full ₹5 Cr is returned
      expect(calculateOwnershipAdjustedAssetValue(mockApartment)).toBe(5000000000);

      // Father's 60% share: 60% of 5 Cr = ₹3 Crore (30,00,00,000 paise)
      expect(calculateOwnershipAdjustedAssetValue(mockApartment, 'user_father')).toBe(3000000000);

      // Son's 40% share: 40% of 5 Cr = ₹2 Crore (20,00,00,000 paise)
      expect(calculateOwnershipAdjustedAssetValue(mockApartment, 'user_son')).toBe(2000000000);

      // Unrelated user has 0% share
      expect(calculateOwnershipAdjustedAssetValue(mockApartment, 'user_stranger')).toBe(0);
    });

    it('correctly calculates ownership-adjusted liabilities for co-borrowers', () => {
      // Family view: full ₹1.5 Cr
      expect(calculateOwnershipAdjustedLiabilityValue(mockHomeLoan)).toBe(1500000000);

      // Father's 50% liability = ₹75 Lakh (75,00,000 paise)
      expect(calculateOwnershipAdjustedLiabilityValue(mockHomeLoan, 'user_father')).toBe(750000000);

      // Son's 50% liability = ₹75 Lakh
      expect(calculateOwnershipAdjustedLiabilityValue(mockHomeLoan, 'user_son')).toBe(750000000);
    });

    it('deduplicates duplicate asset records to strictly avoid double counting', () => {
      const duplicatedList = [mockApartment, mockApartment, mockApartment];
      const deduped = deduplicateAssets(duplicatedList);
      expect(deduped.length).toBe(1);
      expect(deduped[0].id).toBe('asset_apt_1');
    });
  });

  describe('Consolidated Net Worth Calculations', () => {
    const assets: AssetDTO[] = [
      {
        id: 'ast_1',
        workspaceId: 'fam_1',
        workspaceType: 'FAMILY',
        name: 'Equity Portfolio',
        category: 'FINANCIAL',
        subcategory: 'STOCK',
        currentValuePaise: 1000000000, // ₹1 Crore
        formattedCurrentValue: '₹1,00,00,000',
        currency: 'INR',
        legalOwnerId: 'user_1',
        legalOwnerName: 'User One',
        ownershipPercentage: 100,
        coOwners: [],
        valuationStatus: 'DOCUMENT_VERIFIED',
        lastValuationDate: '2026-02-01',
        valuationHistory: [],
        supportingDocumentIds: ['doc_1'],
        createdAt: '2026-01-01',
        updatedAt: '2026-02-01',
      },
      {
        id: 'ast_2',
        workspaceId: 'fam_1',
        workspaceType: 'FAMILY',
        name: 'Commercial Office Space',
        category: 'PHYSICAL',
        subcategory: 'COMMERCIAL_PROPERTY',
        currentValuePaise: 2000000000, // ₹2 Crore
        formattedCurrentValue: '₹2,00,00,000',
        currency: 'INR',
        legalOwnerId: 'user_1',
        legalOwnerName: 'User One',
        ownershipPercentage: 50,
        coOwners: [{ userId: 'user_2', name: 'User Two', ownershipPercentage: 50 }],
        valuationStatus: 'ESTIMATED',
        lastValuationDate: '2026-02-01',
        valuationHistory: [],
        supportingDocumentIds: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-02-01',
      },
    ];

    const liabilities: LiabilityDTO[] = [
      {
        id: 'liab_1',
        workspaceId: 'fam_1',
        workspaceType: 'FAMILY',
        name: 'Vehicle Loan',
        lenderName: 'ICICI Bank',
        liabilityType: 'VEHICLE_LOAN',
        originalPrincipalPaise: 600000000,
        outstandingBalancePaise: 500000000, // ₹50 Lakh (5,000,000 rupees = 500,000,000 paise)
        formattedOutstandingBalance: '₹50,00,000',
        currency: 'INR',
        interestRateAnnual: 9.0,
        repaymentFrequency: 'MONTHLY',
        primaryBorrowerId: 'user_1',
        primaryBorrowerName: 'User One',
        borrowerOwnershipPercentage: 100,
        coBorrowers: [],
        supportingDocumentIds: ['doc_v'],
        createdAt: '2026-01-01',
        updatedAt: '2026-02-01',
      },
    ];

    it('computes accurate gross net worth and category allocation', () => {
      // Gross Assets = ₹1 Cr + ₹2 Cr = ₹3 Crore (3,000,000,000 paise)
      // Gross Liabilities = ₹50 Lakh (500,000,000 paise)
      // Net Worth = ₹2.5 Crore (2,500,000,000 paise)
      const summary = calculateNetWorth({
        workspaceId: 'fam_1',
        workspaceType: 'FAMILY',
        assets,
        liabilities,
      });

      expect(summary.grossAssetsPaise).toBe(3000000000);
      expect(summary.formattedGrossAssets).toBe('₹3,00,00,000');
      expect(summary.grossLiabilitiesPaise).toBe(500000000);
      expect(summary.formattedGrossLiabilities).toBe('₹50,00,000');
      expect(summary.grossNetWorthPaise).toBe(2500000000);
      expect(summary.formattedGrossNetWorth).toBe('₹2,50,00,000');

      // Asset allocation: Financial = 33.3%, Physical = 66.7%
      const financialAlloc = summary.assetAllocation.find((a) => a.category === 'FINANCIAL');
      expect(financialAlloc?.totalPaise).toBe(1000000000);
      expect(financialAlloc?.percentage).toBe(33.3);

      const physicalAlloc = summary.assetAllocation.find((a) => a.category === 'PHYSICAL');
      expect(physicalAlloc?.totalPaise).toBe(2000000000);
      expect(physicalAlloc?.percentage).toBe(66.7);
    });

    it('computes ownership-adjusted net worth for an individual member within the family', () => {
      // User 2 owns 50% of the Commercial Office (₹1 Crore) and 0% of the Equity Portfolio and 0% of the loan
      const user2Summary = calculateNetWorth({
        workspaceId: 'fam_1',
        workspaceType: 'FAMILY',
        assets,
        liabilities,
        targetUserId: 'user_2',
      });

      expect(user2Summary.ownershipAdjustedAssetsPaise).toBe(1000000000); // ₹1 Crore
      expect(user2Summary.ownershipAdjustedLiabilitiesPaise).toBe(0);
      expect(user2Summary.ownershipAdjustedNetWorthPaise).toBe(1000000000);
      expect(user2Summary.formattedAdjustedNetWorth).toBe('₹1,00,00,000');
    });
  });

  describe('Scenario Simulation Engine', () => {
    it('runs mathematical compound growth scenarios with clear assumptions', () => {
      const result = runScenarioSimulation({
        baseNetWorthPaise: 1000000000, // ₹1 Crore starting
        monthlyAdditionalSavingsPaise: 5000000, // ₹50,000 monthly
        expectedAnnualReturnRate: 10.0, // 10% annual return
        inflationRate: 6.0,
        projectionYears: 5,
      });

      expect(result.projectionYears).toBe(5);
      expect(result.startingNetWorthPaise).toBe(1000000000);
      expect(result.yearlyMilestones.length).toBe(5);
      expect(result.projectedNetWorthPaise).toBeGreaterThan(1000000000);
      expect(result.netGainPaise).toBe(result.projectedNetWorthPaise - 1000000000);
      expect(result.assumptionsStated.length).toBeGreaterThanOrEqual(4);
    });
  });
});
