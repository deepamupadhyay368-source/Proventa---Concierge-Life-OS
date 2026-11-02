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
  calculateEMI,
  generateAmortisationSchedule,
  simulateLoanPrepayment,
  calculateSavingsRate,
  calculateEmergencyRunway,
  calculateInvestmentHealth,
  calculateGoalRequiredSIP,
  calculateFIRE,
  calculateBuyVsRent,
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

  describe('Debt Freedom Engine (EMI & Amortisation)', () => {
    it('calculates exact monthly EMI with integer paise precision', () => {
      // ₹50 Lakh loan at 8.5% for 20 years (240 months)
      const principalPaise = 500000000;
      const emi = calculateEMI(principalPaise, 8.5, 240);
      // Standard mathematical reducing-balance EMI for ₹50L @ 8.5% 20y is ₹43,391.16
      expect(emi).toBe(4339116); // ₹43,391.16 in paise
    });

    it('generates amortisation schedule reconciling closing balance to 0', () => {
      const schedule = generateAmortisationSchedule(120000000, 10.0, 12); // ₹12L @ 10% for 12 mos
      expect(schedule.length).toBe(12);
      expect(schedule[0].month).toBe(1);
      expect(schedule[11].closingBalancePaise).toBe(0);
      expect(schedule[11].cumulativeInterestPaise).toBeGreaterThan(0);
    });

    it('simulates loan prepayment showing exact interest saved and reduced tenure', () => {
      const principalPaise = 250000000; // ₹25 Lakh loan
      const result = simulateLoanPrepayment(principalPaise, 9.0, 120, 1000000, 0); // ₹10k extra monthly
      expect(result.monthsSaved).toBeGreaterThan(0);
      expect(result.interestSavedPaise).toBeGreaterThan(0);
      expect(result.newTenureMonths).toBeLessThan(120);
    });
  });

  describe('Treasury & Investment Health Engine', () => {
    it('calculates savings rate and emergency liquidity runway', () => {
      const savingsRate = calculateSavingsRate(20000000, 12000000); // ₹2L income, ₹1.2L expense
      expect(savingsRate).toBe(40.0);

      const runway = calculateEmergencyRunway(60000000, 10000000); // ₹6L liquid, ₹1L expense
      expect(runway.runwayMonths).toBe(6.0);
      expect(runway.status).toBe('HEALTHY');

      const lowRunway = calculateEmergencyRunway(20000000, 10000000); // 2 months
      expect(lowRunway.status).toBe('CRITICAL');
    });

    it('calculates investment health and flags high single-asset concentration', () => {
      const assets: AssetDTO[] = [
        {
          id: 'a1',
          workspaceId: 'w1',
          workspaceType: 'INDIVIDUAL',
          name: 'Apex Precision Shares',
          category: 'BUSINESS',
          subcategory: 'PRIVATE_COMPANY',
          currentValuePaise: 800000000, // ₹8 Crore (80% concentration)
          formattedCurrentValue: '₹8,00,00,000',
          currency: 'INR',
          legalOwnerId: 'u1',
          legalOwnerName: 'User 1',
          ownershipPercentage: 100,
          coOwners: [],
          valuationStatus: 'DOCUMENT_VERIFIED',
          lastValuationDate: '2026-01-01',
          valuationHistory: [],
          supportingDocumentIds: [],
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
        {
          id: 'a2',
          workspaceId: 'w1',
          workspaceType: 'INDIVIDUAL',
          name: 'HDFC Savings Account',
          category: 'FINANCIAL',
          subcategory: 'BANK_DEPOSIT',
          currentValuePaise: 200000000, // ₹2 Crore
          formattedCurrentValue: '₹2,00,00,000',
          currency: 'INR',
          legalOwnerId: 'u1',
          legalOwnerName: 'User 1',
          ownershipPercentage: 100,
          coOwners: [],
          valuationStatus: 'DOCUMENT_VERIFIED',
          lastValuationDate: '2026-01-01',
          valuationHistory: [],
          supportingDocumentIds: [],
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ];

      const health = calculateInvestmentHealth(assets);
      expect(health.percentages.equity).toBe(80.0);
      expect(health.percentages.cash).toBe(20.0);
      expect(health.topHoldingPercentage).toBe(80.0);
      expect(health.alerts.length).toBeGreaterThan(0);
      expect(health.alerts[0]).toContain('High concentration risk');
    });
  });

  describe('Goals SIP & Financial Decision Lab', () => {
    it('calculates required monthly SIP to achieve target corpus', () => {
      const targetPaise = 500000000; // ₹50 Lakh target
      const currentPaise = 100000000; // ₹10 Lakh current
      const sip = calculateGoalRequiredSIP(targetPaise, currentPaise, 12.0, 60); // 5 years at 12% CAGR
      expect(sip.requiredMonthlySipPaise).toBeGreaterThan(0);
      expect(sip.requiredLumpSumPaise).toBeGreaterThan(0);
    });

    it('calculates FIRE retirement timeline and required corpus', () => {
      const fire = calculateFIRE(1000000000, 120000000, 200000000, 10.0, 6.0, 3.5);
      expect(fire.targetFireCorpusPaise).toBeGreaterThan(0);
      expect(fire.yearsToFire).toBeGreaterThan(0);
      expect(fire.fireMilestones.length).toBeGreaterThan(0);
    });

    it('calculates Buy vs Rent institutional comparison', () => {
      const buyVsRent = calculateBuyVsRent(
        1500000000, // ₹1.5 Cr property
        20,
        8.5,
        20,
        6.0,
        3500000, // ₹35,000 rent
        5.0,
        12.0,
        15,
      );
      expect(buyVsRent.recommendation).toBeDefined();
      expect(buyVsRent.buyingNetWorthPaise).toBeGreaterThan(0);
      expect(buyVsRent.rentingNetWorthPaise).toBeGreaterThan(0);
      expect(buyVsRent.yearlyComparison.length).toBe(15);
    });
  });
});
