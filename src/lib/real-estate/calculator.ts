export interface InvestmentCalculatorInput {
  purchasePriceLakhs: number;
  stampDutyPercent?: number; // Gujarat standard ~4.9% - 5.9%
  registrationChargesPercent?: number; // ~1%
  brokeragePercent?: number; // ~1%
  renovationLakhs?: number;
  loanPercentage?: number; // e.g. 75%
  interestRateAnnual?: number; // e.g. 8.5%
  loanTenureYears?: number; // e.g. 20
  expectedMonthlyRentRupees: number;
  monthlyMaintenanceRupees: number;
  annualPropertyTaxRupees: number;
  vacancyWeeksPerYear?: number; // e.g. 3 weeks
  holdingPeriodYears?: number; // e.g. 7 years
  expectedAnnualAppreciationPercent?: number; // e.g. 8%
}

export interface InvestmentScenarioResult {
  totalAcquisitionCostLakhs: number;
  loanAmountLakhs: number;
  equityInvestedLakhs: number;
  monthlyEmiRupees: number;
  grossAnnualRentalIncomeRupees: number;
  netAnnualRentalIncomeRupees: number;
  annualOwnershipExpensesRupees: number;
  annualNetCashFlowRupees: number;
  grossRentalYieldPercent: number;
  netRentalYieldPercent: number;
  cashOnCashReturnPercent: number;
  projectedResaleValueLakhs: {
    conservative: number;
    base: number;
    optimistic: number;
  };
  totalEstimatedReturnPercent: {
    conservative: number;
    base: number;
    optimistic: number;
  };
  scenarios: {
    conservative: {
      appreciationRate: number;
      estimatedResaleValueLakhs: number;
      netGainLakhs: number;
      holdingReturnPercent: number;
    };
    base: {
      appreciationRate: number;
      estimatedResaleValueLakhs: number;
      netGainLakhs: number;
      holdingReturnPercent: number;
    };
    optimistic: {
      appreciationRate: number;
      estimatedResaleValueLakhs: number;
      netGainLakhs: number;
      holdingReturnPercent: number;
    };
  };
}

export function calculatePropertyInvestment(input: InvestmentCalculatorInput): InvestmentScenarioResult {
  const stampRate = input.stampDutyPercent ?? 4.9;
  const regRate = input.registrationChargesPercent ?? 1.0;
  const brokerageRate = input.brokeragePercent ?? 1.0;
  const renoLakhs = input.renovationLakhs ?? 0;

  const basePriceRupees = input.purchasePriceLakhs * 100000;
  const stampDutyRupees = (basePriceRupees * stampRate) / 100;
  const regChargesRupees = (basePriceRupees * regRate) / 100;
  const brokerageRupees = (basePriceRupees * brokerageRate) / 100;
  const renoRupees = renoLakhs * 100000;

  const totalAcquisitionCostRupees =
    basePriceRupees + stampDutyRupees + regChargesRupees + brokerageRupees + renoRupees;
  const totalAcquisitionCostLakhs = Math.round((totalAcquisitionCostRupees / 100000) * 10) / 10;

  // Loan computation
  const loanPct = input.loanPercentage ?? 75;
  const loanAmountRupees = (basePriceRupees * loanPct) / 100;
  const loanAmountLakhs = Math.round((loanAmountRupees / 100000) * 10) / 10;
  const equityInvestedRupees = totalAcquisitionCostRupees - loanAmountRupees;
  const equityInvestedLakhs = Math.round((equityInvestedRupees / 100000) * 10) / 10;

  // Monthly EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
  const annualRate = input.interestRateAnnual ?? 8.5;
  const monthlyRate = annualRate / (12 * 100);
  const totalMonths = (input.loanTenureYears ?? 20) * 12;

  let monthlyEmiRupees = 0;
  if (loanAmountRupees > 0 && monthlyRate > 0) {
    monthlyEmiRupees = Math.round(
      (loanAmountRupees * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
    );
  }

  // Rental income computation
  const vacancyWeeks = input.vacancyWeeksPerYear ?? 3;
  const occupiedMonthsFraction = (52 - vacancyWeeks) / 52;
  const grossAnnualRentalRupees = Math.round(
    input.expectedMonthlyRentRupees * 12 * occupiedMonthsFraction
  );

  // Annual ownership expenses (maintenance + property tax)
  const annualMaintenanceRupees = input.monthlyMaintenanceRupees * 12;
  const annualPropertyTaxRupees = input.annualPropertyTaxRupees;
  const annualOwnershipExpensesRupees = annualMaintenanceRupees + annualPropertyTaxRupees;

  const netAnnualRentalIncomeRupees = grossAnnualRentalRupees - annualOwnershipExpensesRupees;
  const annualDebtServiceRupees = monthlyEmiRupees * 12;
  const annualNetCashFlowRupees = netAnnualRentalIncomeRupees - annualDebtServiceRupees;

  // Yields
  const grossRentalYieldPercent =
    Math.round(((input.expectedMonthlyRentRupees * 12) / basePriceRupees) * 1000) / 10;
  const netRentalYieldPercent =
    Math.round((netAnnualRentalIncomeRupees / totalAcquisitionCostRupees) * 1000) / 10;

  const cashOnCashReturnPercent =
    equityInvestedRupees > 0
      ? Math.round((annualNetCashFlowRupees / equityInvestedRupees) * 1000) / 10
      : 0;

  // Scenario Holding Projections
  const holdingYears = input.holdingPeriodYears ?? 7;
  const baseApprecRate = input.expectedAnnualAppreciationPercent ?? 8.0;

  const conservativeRate = Math.max(3.0, baseApprecRate - 3.0) / 100;
  const baseRate = baseApprecRate / 100;
  const optimisticRate = (baseApprecRate + 3.0) / 100;

  const conservativeResaleRupees = basePriceRupees * Math.pow(1 + conservativeRate, holdingYears);
  const baseResaleRupees = basePriceRupees * Math.pow(1 + baseRate, holdingYears);
  const optimisticResaleRupees = basePriceRupees * Math.pow(1 + optimisticRate, holdingYears);

  return {
    totalAcquisitionCostLakhs,
    loanAmountLakhs,
    equityInvestedLakhs,
    monthlyEmiRupees,
    grossAnnualRentalIncomeRupees: grossAnnualRentalRupees,
    netAnnualRentalIncomeRupees,
    annualOwnershipExpensesRupees,
    annualNetCashFlowRupees,
    grossRentalYieldPercent,
    netRentalYieldPercent,
    cashOnCashReturnPercent,
    projectedResaleValueLakhs: {
      conservative: Math.round((conservativeResaleRupees / 100000) * 10) / 10,
      base: Math.round((baseResaleRupees / 100000) * 10) / 10,
      optimistic: Math.round((optimisticResaleRupees / 100000) * 10) / 10,
    },
    totalEstimatedReturnPercent: {
      conservative: Math.round(((conservativeResaleRupees - totalAcquisitionCostRupees) / equityInvestedRupees) * 100),
      base: Math.round(((baseResaleRupees - totalAcquisitionCostRupees) / equityInvestedRupees) * 100),
      optimistic: Math.round(((optimisticResaleRupees - totalAcquisitionCostRupees) / equityInvestedRupees) * 100),
    },
    scenarios: {
      conservative: {
        appreciationRate: Math.round(conservativeRate * 100 * 10) / 10,
        estimatedResaleValueLakhs: Math.round((conservativeResaleRupees / 100000) * 10) / 10,
        netGainLakhs: Math.round(((conservativeResaleRupees - totalAcquisitionCostRupees) / 100000) * 10) / 10,
        holdingReturnPercent: Math.round(((conservativeResaleRupees - totalAcquisitionCostRupees) / equityInvestedRupees) * 100),
      },
      base: {
        appreciationRate: Math.round(baseRate * 100 * 10) / 10,
        estimatedResaleValueLakhs: Math.round((baseResaleRupees / 100000) * 10) / 10,
        netGainLakhs: Math.round(((baseResaleRupees - totalAcquisitionCostRupees) / 100000) * 10) / 10,
        holdingReturnPercent: Math.round(((baseResaleRupees - totalAcquisitionCostRupees) / equityInvestedRupees) * 100),
      },
      optimistic: {
        appreciationRate: Math.round(optimisticRate * 100 * 10) / 10,
        estimatedResaleValueLakhs: Math.round((optimisticResaleRupees / 100000) * 10) / 10,
        netGainLakhs: Math.round(((optimisticResaleRupees - totalAcquisitionCostRupees) / 100000) * 10) / 10,
        holdingReturnPercent: Math.round(((optimisticResaleRupees - totalAcquisitionCostRupees) / equityInvestedRupees) * 100),
      },
    },
  };
}
