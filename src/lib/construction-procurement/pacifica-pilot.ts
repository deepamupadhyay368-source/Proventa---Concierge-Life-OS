/**
 * PROVENTA — Pacifica Companies Institutional Pilot Mode
 * Clearly labelled SAMPLE_PILOT_DATA strictly isolated from production database records.
 * Demonstrates one buyer organisation, one project, one material category (TMT Steel Fe-550D),
 * one procurement requirement, three competing supplier quotations, like-for-like comparison,
 * and a transparent Procurement Savings Assessment Report (never guaranteeing savings).
 */

import { buildComparisonMatrix } from './comparison-engine';
import { computeProcurementSavings } from './savings-intelligence';
import { rupeesToPaise, formatInrFromPaise } from './money';

export function generatePacificaPilotAssessment() {
  const quantityMt = 120;
  const baselineUnitLandedPaise = rupeesToPaise(68950); // ₹68,950/MT landed historical baseline (sample)

  const requestedSpecs = {
    brand: 'Tata Tiscon',
    grade: 'Fe-550D',
    diameterMm: '16mm',
    standard: 'IS 1786:2008',
    certification: 'BIS + MTC Mandatory',
  };

  const quotations = [
    {
      quotationId: 'PILOT-QUOTE-01',
      supplierId: 'PILOT-SUP-01',
      supplierName: 'Sample Authorised Distributor A (Changodar Yard)',
      verificationStatus: 'VERIFIED' as const,
      brandQuoted: 'Tata Tiscon',
      quotedSpecs: {
        grade: 'Fe-550D',
        diameterMm: '16mm',
        standard: 'IS 1786:2008',
        certification: 'BIS + MTC Mandatory',
      },
      quantity: quantityMt,
      unit: 'MT',
      baseMaterialPaise: rupeesToPaise(55400 * quantityMt),
      gstPaise: rupeesToPaise(Math.round(55400 * quantityMt * 0.18)),
      freightPaise: rupeesToPaise(950 * quantityMt),
      loadingPaise: rupeesToPaise(150 * quantityMt),
      unloadingPaise: rupeesToPaise(150 * quantityMt),
      insurancePaise: rupeesToPaise(120 * quantityMt),
      otherChargesPaise: BigInt(0),
      discountPaise: rupeesToPaise(350 * quantityMt),
      deliveryDays: 3,
      paymentTerms: '30 Days Credit against GRN & MTC',
      paymentCreditDays: 30,
      validUntilIso: new Date(Date.now() + 7 * 86400_000).toISOString(),
      historicalOnTimeRatePercent: 94,
      documentedOrderCount: 18,
    },
    {
      quotationId: 'PILOT-QUOTE-02',
      supplierId: 'PILOT-SUP-02',
      supplierName: 'Sample Authorised Distributor B (Sanand Depot)',
      verificationStatus: 'VERIFIED' as const,
      brandQuoted: 'JSW Neosteel',
      quotedSpecs: {
        grade: 'Fe-550D',
        diameterMm: '16mm',
        standard: 'IS 1786:2008',
        certification: 'BIS + MTC Mandatory',
      },
      quantity: quantityMt,
      unit: 'MT',
      baseMaterialPaise: rupeesToPaise(54600 * quantityMt),
      gstPaise: rupeesToPaise(Math.round(54600 * quantityMt * 0.18)),
      freightPaise: rupeesToPaise(1100 * quantityMt),
      loadingPaise: rupeesToPaise(150 * quantityMt),
      unloadingPaise: rupeesToPaise(200 * quantityMt),
      insurancePaise: rupeesToPaise(100 * quantityMt),
      otherChargesPaise: BigInt(0),
      discountPaise: rupeesToPaise(200 * quantityMt),
      deliveryDays: 4,
      paymentTerms: '45 Days Credit against GRN & MTC',
      paymentCreditDays: 45,
      validUntilIso: new Date(Date.now() + 7 * 86400_000).toISOString(),
      historicalOnTimeRatePercent: 91,
      documentedOrderCount: 12,
    },
    {
      quotationId: 'PILOT-QUOTE-03',
      supplierId: 'PILOT-SUP-03',
      supplierName: 'Sample Regional Dealer C (Non-Compliant Grade Quote)',
      verificationStatus: 'VERIFICATION_PENDING' as const,
      brandQuoted: 'Regional Secondary Mill',
      quotedSpecs: {
        grade: 'Fe-500', // Materially non-equivalent vs Fe-550D
        diameterMm: '16mm',
        standard: 'IS 1786:2008',
        certification: 'Dealer Certificate Only',
      },
      quantity: quantityMt,
      unit: 'MT',
      baseMaterialPaise: rupeesToPaise(49800 * quantityMt),
      gstPaise: rupeesToPaise(Math.round(49800 * quantityMt * 0.18)),
      freightPaise: rupeesToPaise(1200 * quantityMt),
      loadingPaise: rupeesToPaise(150 * quantityMt),
      unloadingPaise: rupeesToPaise(200 * quantityMt),
      insurancePaise: BigInt(0),
      otherChargesPaise: BigInt(0),
      discountPaise: BigInt(0),
      deliveryDays: 5,
      paymentTerms: '100% Advance prior to dispatch',
      paymentCreditDays: 0,
      validUntilIso: new Date(Date.now() + 5 * 86400_000).toISOString(),
      historicalOnTimeRatePercent: null,
      documentedOrderCount: 0,
    },
  ];

  const comparison = buildComparisonMatrix({
    rfqId: 'PILOT-RFQ-PACIFICA-001',
    categorySlug: 'tmt-steel',
    requestedSpecs,
    acceptableAlternativeBrands: ['JSW Neosteel'],
    quotations,
  });

  const bestCompliantRow = comparison.rows.find(
    (r) => r.quotationId === comparison.highlights.lowestCompliantLandedCostQuotationId
  )!;

  const potentialSavings = computeProcurementSavings({
    classification: 'POTENTIAL',
    rfqId: 'PILOT-RFQ-PACIFICA-001',
    quantity: quantityMt,
    unit: 'MT',
    baselineUnitLandedPaise,
    comparedUnitLandedPaise: bestCompliantRow.unitLandedCostPaise,
    disclosure: {
      dataSource: 'Illustrative Pilot Baseline vs. Sample Competitive Quotations (Non-Production Demonstration)',
      observationDateIso: new Date().toISOString().split('T')[0],
      productSpecification: 'TMT Steel 16mm Fe-550D IS 1786:2008 (Primary Mill, BIS + MTC)',
      geography: 'Ahmedabad West / S.G. Highway Corridor, Gujarat',
      sampleSize: 3,
      limitations:
        'SAMPLE DATA ONLY. Does not represent executed transactions or guaranteed savings. Actual realised savings depend on live mill pricing, freight distance, credit terms, and verified site delivery (GRN + Invoice).',
    },
  });

  return {
    isSampleData: true,
    dataClassificationLabel: 'INSTITUTIONAL PILOT DEMONSTRATION — SAMPLE DATA (ISOLATED FROM PRODUCTION)',
    buyerOrganisation: {
      name: 'Pacifica Companies (Institutional Pilot Template)',
      city: 'Ahmedabad, Gujarat',
      segment: 'Real Estate Developer',
    },
    project: {
      projectCode: 'PAC-AHM-PILOT-01',
      name: 'Sample Residential High-Rise Tower — S.G. Highway Corridor',
      location: 'Ahmedabad, Gujarat',
      materialCategory: 'TMT Steel Reinforcement Bars (Civil & Structural)',
      requirementQuantity: `${quantityMt} MT`,
    },
    baselineSummary: {
      baselineUnitLandedFormatted: formatInrFromPaise(baselineUnitLandedPaise),
      baselineTotalFormatted: potentialSavings.formattedBaselineTotal,
      lowestCompliantUnitLandedFormatted: bestCompliantRow.formattedUnitLandedCost,
      lowestCompliantTotalFormatted: bestCompliantRow.formattedTotalLandedCost,
      potentialSavingsFormatted: potentialSavings.formattedTotalSavings,
      potentialSavingsPercent: potentialSavings.savingsPercent,
      realisedSavingsStatus: '₹0.00 (Not yet executed — realised savings require approved PO + GRN + Invoice)',
    },
    comparison,
    potentialSavings,
    commercialAndDeliveryRisks: [
      'Steel market volatility: Primary mill base rates typically hold validity for 3–7 days; delayed approvals may trigger re-pricing.',
      'Specification substitution risk: Quote 3 offers a lower nominal price using secondary Fe-500 steel without MTC and is explicitly flagged NON-EQUIVALENT.',
      'Site unloading & crane access: S.G. Highway corridor restrictions may require night-window unloading slots for 25-MT trailers.',
      'Credit vs. cash-flow trade-off: Distributor B offers 45-day credit vs. 30-day credit on Distributor A.',
    ],
    disclaimer:
      'This Procurement Savings Assessment is a clearly labelled demonstration model. PROVENTA does not guarantee savings; actual outcomes depend on verified live supplier quotations, technical approval, and completed delivery reconciliation.',
  };
}
