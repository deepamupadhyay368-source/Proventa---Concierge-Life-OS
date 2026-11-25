'use client';

import React, { useState } from 'react';
import { 
  InvestmentCalculatorInput, 
  InvestmentScenarioResult, 
  calculatePropertyInvestment 
} from '@/lib/real-estate/calculator';
import { 
  Calculator, 
  TrendingUp, 
  Percent, 
  FileText, 
  ShieldAlert, 
  ArrowRight,
  Info
} from 'lucide-react';
import Link from 'next/link';

export default function InvestmentIntelligencePage() {
  const [inputs, setInputs] = useState<InvestmentCalculatorInput>({
    purchasePriceLakhs: 85,
    stampDutyPercent: 4.9,
    registrationChargesPercent: 1.0,
    brokeragePercent: 1.0,
    renovationLakhs: 4.0,
    loanPercentage: 75,
    interestRateAnnual: 8.5,
    loanTenureYears: 20,
    expectedMonthlyRentRupees: 28000,
    monthlyMaintenanceRupees: 3500,
    annualPropertyTaxRupees: 6500,
    vacancyWeeksPerYear: 3,
    holdingPeriodYears: 7,
    expectedAnnualAppreciationPercent: 8.0,
  });

  const [result, setResult] = useState<InvestmentScenarioResult>(() =>
    calculatePropertyInvestment(inputs)
  );

  const handleRecalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(calculatePropertyInvestment(inputs));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="border-b border-[#C8C4BA] pb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#547568]">
          Institutional Real Estate Analytics
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#202B3C] tracking-tight mt-1">
          Property Investment Calculator
        </h1>
        <p className="text-xs sm:text-sm text-[#69717B] mt-2 max-w-3xl leading-relaxed">
          Comprehensive cashflow and holding-period model incorporating Gujarat statutory stamp duty, loan amortization schedules, recurring society maintenance, and conservative, base, and optimistic capital appreciation scenarios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Input Parameters Form */}
        <div className="lg:col-span-5 bg-white border border-[#C8C4BA] p-6 rounded-xs shadow-xs space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#202B3C] border-b border-stone-200 pb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#547568]" />
            <span>Investment Parameters</span>
          </h2>

          <form onSubmit={handleRecalculate} className="space-y-4 text-xs">
            
            {/* Purchase Price */}
            <div>
              <label className="block font-semibold text-[#202B3C] mb-1">
                Property Purchase Price (₹ Lakhs) *
              </label>
              <input
                type="number"
                required
                value={inputs.purchasePriceLakhs}
                onChange={(e) => setInputs({ ...inputs, purchasePriceLakhs: Number(e.target.value) })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-[#202B3C] font-mono"
              />
            </div>

            {/* Acquisition Fees */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-[#69717B] mb-1">Stamp Duty (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.stampDutyPercent}
                  onChange={(e) => setInputs({ ...inputs, stampDutyPercent: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-2.5 py-2 text-[#202B3C] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#69717B] mb-1">Reg Charges (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.registrationChargesPercent}
                  onChange={(e) => setInputs({ ...inputs, registrationChargesPercent: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-2.5 py-2 text-[#202B3C] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#69717B] mb-1">Renovation (₹L)</label>
                <input
                  type="number"
                  step="0.5"
                  value={inputs.renovationLakhs}
                  onChange={(e) => setInputs({ ...inputs, renovationLakhs: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-2.5 py-2 text-[#202B3C] font-mono"
                />
              </div>
            </div>

            {/* Loan Terms */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Loan LTV (%)</label>
                <input
                  type="number"
                  value={inputs.loanPercentage}
                  onChange={(e) => setInputs({ ...inputs, loanPercentage: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-2.5 py-2 text-[#202B3C] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.interestRateAnnual}
                  onChange={(e) => setInputs({ ...inputs, interestRateAnnual: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-2.5 py-2 text-[#202B3C] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Tenure (Yrs)</label>
                <input
                  type="number"
                  value={inputs.loanTenureYears}
                  onChange={(e) => setInputs({ ...inputs, loanTenureYears: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-2.5 py-2 text-[#202B3C] font-mono"
                />
              </div>
            </div>

            {/* Rental & Expenses */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Expected Rent (₹/mo)</label>
                <input
                  type="number"
                  value={inputs.expectedMonthlyRentRupees}
                  onChange={(e) => setInputs({ ...inputs, expectedMonthlyRentRupees: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-[#202B3C] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Maintenance (₹/mo)</label>
                <input
                  type="number"
                  value={inputs.monthlyMaintenanceRupees}
                  onChange={(e) => setInputs({ ...inputs, monthlyMaintenanceRupees: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-[#202B3C] font-mono"
                />
              </div>
            </div>

            {/* Holding Period & Expected Appreciation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Holding Period (Yrs)</label>
                <input
                  type="number"
                  value={inputs.holdingPeriodYears}
                  onChange={(e) => setInputs({ ...inputs, holdingPeriodYears: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-[#202B3C] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Expected Apprec. (%/yr)</label>
                <input
                  type="number"
                  step="0.5"
                  value={inputs.expectedAnnualAppreciationPercent}
                  onChange={(e) => setInputs({ ...inputs, expectedAnnualAppreciationPercent: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-[#202B3C] font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#202B3C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#151D29] rounded-xs cursor-pointer transition-all mt-4"
            >
              Recalculate Projections
            </button>
          </form>
        </div>

        {/* Right: Output Projections */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#C8C4BA] p-6 sm:p-8 rounded-xs shadow-xs space-y-8">
            
            <div className="border-b border-stone-200 pb-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#547568]">
                PROVENTA Financial Output Brief
              </span>
              <h3 className="text-2xl font-black text-[#202B3C] tracking-tight mt-0.5">
                Acquisition & Yield Performance
              </h3>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-[#F5F3ED] border border-[#C8C4BA] rounded-xs font-mono">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B] block font-sans">
                  Total Acquisition
                </span>
                <div className="text-xl font-black text-[#202B3C] mt-1">
                  ₹{result.totalAcquisitionCostLakhs}L
                </div>
                <span className="text-[10px] text-[#69717B]">Equity: ₹{result.equityInvestedLakhs}L</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B] block font-sans">
                  Monthly EMI
                </span>
                <div className="text-xl font-black text-[#202B3C] mt-1">
                  ₹{result.monthlyEmiRupees.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-[#69717B]">Loan: ₹{result.loanAmountLakhs}L</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B] block font-sans">
                  Gross Yield
                </span>
                <div className="text-xl font-black text-[#547568] mt-1">
                  {result.grossRentalYieldPercent}%
                </div>
                <span className="text-[10px] text-[#69717B]">Net: {result.netRentalYieldPercent}%</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B] block font-sans">
                  Annual Net Cashflow
                </span>
                <div className={`text-xl font-black mt-1 ${result.annualNetCashFlowRupees >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  ₹{result.annualNetCashFlowRupees.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-[#69717B]">Post EMI & Tax</span>
              </div>
            </div>

            {/* Scenario Holding Period Resale Matrix */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#202B3C]">
                {inputs.holdingPeriodYears}-Year Holding Period Scenario Projections
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#69717B]">Conservative Scenario</span>
                  <div className="text-lg font-black text-[#202B3C] font-mono">
                    ₹{result.projectedResaleValueLakhs.conservative} Lakhs
                  </div>
                  <span className="text-xs text-[#69717B]">Est. ROI: {result.totalEstimatedReturnPercent.conservative}%</span>
                </div>

                <div className="p-4 bg-[#F5F3ED] border border-[#C8C4BA] rounded-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#547568]">Base Case Scenario</span>
                  <div className="text-lg font-black text-[#202B3C] font-mono">
                    ₹{result.projectedResaleValueLakhs.base} Lakhs
                  </div>
                  <span className="text-xs text-[#547568] font-semibold">Est. ROI: {result.totalEstimatedReturnPercent.base}%</span>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#69717B]">Optimistic Scenario</span>
                  <div className="text-lg font-black text-[#202B3C] font-mono">
                    ₹{result.projectedResaleValueLakhs.optimistic} Lakhs
                  </div>
                  <span className="text-xs text-[#69717B]">Est. ROI: {result.totalEstimatedReturnPercent.optimistic}%</span>
                </div>

              </div>
            </div>

            {/* Compliance Warning */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs text-xs text-[#69717B] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#202B3C]">
                <Info className="w-4 h-4 text-[#547568]" />
                <span>Model Disclosure</span>
              </div>
              <p>
                Calculations are illustrative scenarios based on user assumptions and prevailing Gujarat municipal and banking standards. PROVENTA does not guarantee future resale valuations, tenant continuity, or rental returns.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
