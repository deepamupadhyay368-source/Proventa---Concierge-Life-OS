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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
      
      {/* Header */}
      <div className="border-b border-[#C8C4BA] pb-6">
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#547568]">
          Institutional Real Estate Analytics &bull; Gujarat Market
        </span>
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#202B3C] tracking-tight mt-1">
          Property Investment Calculator
        </h1>
        <p className="text-xs sm:text-sm text-[#69717B] mt-2 max-w-3xl leading-relaxed">
          Comprehensive cashflow and holding-period model incorporating Gujarat statutory stamp duty, loan amortization schedules, recurring society maintenance, and conservative, base, and optimistic capital appreciation scenarios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Input Parameters Form (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#C8C4BA] p-6 space-y-5 shadow-xs">
          <div className="border-b border-[#C8C4BA] pb-3 flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#202B3C] flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#547568]" />
              <span>Investment Assumptions</span>
            </h2>
            <span className="text-[10px] font-mono text-[#69717B]">Inputs</span>
          </div>

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
                className="w-full h-10 bg-white border border-[#C8C4BA] px-3 text-[#202B3C] font-mono focus:outline-hidden focus:border-[#202B3C]"
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
                  className="w-full h-10 bg-white border border-[#C8C4BA] px-2.5 text-[#202B3C] font-mono focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#69717B] mb-1">Registration (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.registrationChargesPercent}
                  onChange={(e) => setInputs({ ...inputs, registrationChargesPercent: Number(e.target.value) })}
                  className="w-full h-10 bg-white border border-[#C8C4BA] px-2.5 text-[#202B3C] font-mono focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#69717B] mb-1">Brokerage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.brokeragePercent}
                  onChange={(e) => setInputs({ ...inputs, brokeragePercent: Number(e.target.value) })}
                  className="w-full h-10 bg-white border border-[#C8C4BA] px-2.5 text-[#202B3C] font-mono focus:outline-hidden"
                />
              </div>
            </div>

            {/* Renovation Expenses */}
            <div>
              <label className="block font-semibold text-[#202B3C] mb-1">
                Immediate Renovation / Interior Fit-out (₹ Lakhs)
              </label>
              <input
                type="number"
                step="0.5"
                value={inputs.renovationLakhs}
                onChange={(e) => setInputs({ ...inputs, renovationLakhs: Number(e.target.value) })}
                className="w-full h-10 bg-white border border-[#C8C4BA] px-3 text-[#202B3C] font-mono focus:outline-hidden"
              />
            </div>

            {/* Loan Details */}
            <div className="p-3.5 bg-[#F5F3ED] border border-[#C8C4BA]/50 space-y-3">
              <span className="font-bold text-[#202B3C] uppercase text-[10px] font-mono block">
                Financing & Mortgage Details
              </span>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-[#69717B] mb-1">Loan LTV (%)</label>
                  <input
                    type="number"
                    value={inputs.loanPercentage}
                    onChange={(e) => setInputs({ ...inputs, loanPercentage: Number(e.target.value) })}
                    className="w-full h-9 bg-white border border-[#C8C4BA] px-2 text-[#202B3C] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#69717B] mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.interestRateAnnual}
                    onChange={(e) => setInputs({ ...inputs, interestRateAnnual: Number(e.target.value) })}
                    className="w-full h-9 bg-white border border-[#C8C4BA] px-2 text-[#202B3C] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#69717B] mb-1">Tenure (Years)</label>
                  <input
                    type="number"
                    value={inputs.loanTenureYears}
                    onChange={(e) => setInputs({ ...inputs, loanTenureYears: Number(e.target.value) })}
                    className="w-full h-9 bg-white border border-[#C8C4BA] px-2 text-[#202B3C] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Rental Income & Expenses */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Expected Rent (₹/mo)</label>
                <input
                  type="number"
                  step="500"
                  value={inputs.expectedMonthlyRentRupees}
                  onChange={(e) => setInputs({ ...inputs, expectedMonthlyRentRupees: Number(e.target.value) })}
                  className="w-full h-10 bg-white border border-[#C8C4BA] px-3 text-[#202B3C] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Society Maintenance (₹/mo)</label>
                <input
                  type="number"
                  step="100"
                  value={inputs.monthlyMaintenanceRupees}
                  onChange={(e) => setInputs({ ...inputs, monthlyMaintenanceRupees: Number(e.target.value) })}
                  className="w-full h-10 bg-white border border-[#C8C4BA] px-3 text-[#202B3C] font-mono"
                />
              </div>
            </div>

            {/* Holding Period & Expected Appreciation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Holding Period (Years)</label>
                <input
                  type="number"
                  value={inputs.holdingPeriodYears}
                  onChange={(e) => setInputs({ ...inputs, holdingPeriodYears: Number(e.target.value) })}
                  className="w-full h-10 bg-white border border-[#C8C4BA] px-3 text-[#202B3C] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Expected Growth (%/yr)</label>
                <input
                  type="number"
                  step="0.5"
                  value={inputs.expectedAnnualAppreciationPercent}
                  onChange={(e) => setInputs({ ...inputs, expectedAnnualAppreciationPercent: Number(e.target.value) })}
                  className="w-full h-10 bg-white border border-[#C8C4BA] px-3 text-[#202B3C] font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-[#202B3C] text-white text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#151D29] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Recalculate Investment Scenarios</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right: Results Dossier (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#C8C4BA] p-6 sm:p-8 space-y-8 shadow-xs">
            
            {/* Header */}
            <div className="border-b border-[#C8C4BA] pb-4 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#547568] font-bold">
                  Cashflow & Appreciation Analysis
                </span>
                <h3 className="font-editorial text-2xl font-bold text-[#202B3C] mt-1">
                  Acquisition & Yield Performance
                </h3>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 bg-[#F5F3ED] border border-[#C8C4BA] font-bold text-[#202B3C]">
                {inputs.holdingPeriodYears}-Year Horizon
              </span>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-[#F5F3ED] border border-[#C8C4BA] font-mono">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B] block font-sans">
                  Total Acquisition Cost
                </span>
                <div className="text-xl font-bold text-[#202B3C] mt-1 tabular-nums">
                  ₹{result.totalAcquisitionCostLakhs} L
                </div>
                <span className="text-[10px] text-[#69717B]">Includes stamp duty & fitout</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B] block font-sans">
                  Monthly Home Loan EMI
                </span>
                <div className="text-xl font-bold text-[#202B3C] mt-1 tabular-nums">
                  ₹{result.monthlyEmiRupees.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-[#69717B]">75% LTV @ {inputs.interestRateAnnual}%</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B] block font-sans">
                  Gross / Net Yield
                </span>
                <div className="text-xl font-bold text-[#547568] mt-1 tabular-nums">
                  {result.grossRentalYieldPercent}% / {result.netRentalYieldPercent}%
                </div>
                <span className="text-[10px] text-[#69717B]">Net of society tax & maint.</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B] block font-sans">
                  Initial Equity Outlay
                </span>
                <div className="text-xl font-bold text-[#202B3C] mt-1 tabular-nums">
                  ₹{result.initialCashOutlayLakhs} L
                </div>
                <span className="text-[10px] text-[#69717B]">Down payment + stamp duty</span>
              </div>
            </div>

            {/* Cashflow Breakdown Table */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#202B3C] block border-b border-[#C8C4BA] pb-2">
                Annual Operating Cashflow Ledger
              </span>
              <div className="border border-[#C8C4BA] overflow-hidden text-xs font-mono">
                <div className="p-3 flex justify-between border-b border-[#E2DFD6] hover:bg-[#F5F3ED]/30">
                  <span className="text-[#69717B]">Gross Annual Rental Income:</span>
                  <span className="font-bold text-[#202B3C] tabular-nums">₹{(inputs.expectedMonthlyRentRupees * 12).toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 flex justify-between border-b border-[#E2DFD6] hover:bg-[#F5F3ED]/30">
                  <span className="text-[#69717B]">Annual Operating Expenses (Maint. + AUDA Tax + Vacancy):</span>
                  <span className="text-amber-800 font-bold tabular-nums">-₹{result.annualOwnershipExpensesRupees.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 flex justify-between border-b border-[#E2DFD6] hover:bg-[#F5F3ED]/30">
                  <span className="text-[#69717B]">Annual Debt Servicing (Mortgage EMI &times; 12):</span>
                  <span className="text-amber-800 font-bold tabular-nums">-₹{(result.monthlyEmiRupees * 12).toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3.5 bg-[#F5F3ED] flex justify-between items-center text-sm font-bold">
                  <span className="text-[#202B3C]">Net Pre-Tax Cash Flow (Annual):</span>
                  <span className={result.annualNetCashFlowRupees >= 0 ? 'text-[#547568]' : 'text-amber-800'}>
                    {result.annualNetCashFlowRupees >= 0 ? '+' : ''}₹{result.annualNetCashFlowRupees.toLocaleString('en-IN')}/year
                  </span>
                </div>
              </div>
            </div>

            {/* Three Scenario Analysis */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#C8C4BA] pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#202B3C]">
                  Capital Appreciation & Resale Scenarios ({inputs.holdingPeriodYears} Years)
                </span>
                <span className="text-[10px] font-mono text-[#69717B]">Base Rate: {inputs.expectedAnnualAppreciationPercent}%/yr</span>
              </div>

              <div className="border border-[#C8C4BA] overflow-x-auto text-xs font-mono">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C] text-[11px]">
                      <th className="p-3 font-bold uppercase">Scenario</th>
                      <th className="p-3 font-bold uppercase tabular-nums">Apprec. Rate</th>
                      <th className="p-3 font-bold uppercase tabular-nums">Estimated Resale</th>
                      <th className="p-3 font-bold uppercase tabular-nums">Net Profit</th>
                      <th className="p-3 font-bold uppercase tabular-nums">Total ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2DFD6]">
                    <tr className="hover:bg-[#F5F3ED]/40 transition-colors">
                      <td className="p-3 font-sans font-bold text-[#69717B]">Conservative</td>
                      <td className="p-3 tabular-nums">{result.scenarios.conservative.appreciationRate}% / yr</td>
                      <td className="p-3 font-bold text-[#202B3C] tabular-nums">₹{result.scenarios.conservative.estimatedResaleValueLakhs} L</td>
                      <td className="p-3 text-[#547568] tabular-nums">+₹{result.scenarios.conservative.netGainLakhs} L</td>
                      <td className="p-3 font-bold text-[#547568] tabular-nums">+{result.scenarios.conservative.holdingReturnPercent}%</td>
                    </tr>
                    <tr className="bg-[#547568]/5 font-bold hover:bg-[#547568]/10 transition-colors">
                      <td className="p-3 font-sans text-[#547568]">Base Model</td>
                      <td className="p-3 tabular-nums">{result.scenarios.base.appreciationRate}% / yr</td>
                      <td className="p-3 text-[#202B3C] tabular-nums">₹{result.scenarios.base.estimatedResaleValueLakhs} L</td>
                      <td className="p-3 text-[#547568] tabular-nums">+₹{result.scenarios.base.netGainLakhs} L</td>
                      <td className="p-3 text-[#547568] tabular-nums">+{result.scenarios.base.holdingReturnPercent}%</td>
                    </tr>
                    <tr className="hover:bg-[#F5F3ED]/40 transition-colors">
                      <td className="p-3 font-sans font-bold text-[#202B3C]">Optimistic</td>
                      <td className="p-3 tabular-nums">{result.scenarios.optimistic.appreciationRate}% / yr</td>
                      <td className="p-3 font-bold text-[#202B3C] tabular-nums">₹{result.scenarios.optimistic.estimatedResaleValueLakhs} L</td>
                      <td className="p-3 text-[#547568] tabular-nums">+₹{result.scenarios.optimistic.netGainLakhs} L</td>
                      <td className="p-3 font-bold text-[#547568] tabular-nums">+{result.scenarios.optimistic.holdingReturnPercent}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 bg-[#F5F3ED] border border-[#C8C4BA] space-y-1.5 text-[11px] text-[#69717B] leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-[#202B3C] font-mono text-[10px] uppercase">
                <ShieldAlert className="w-3.5 h-3.5 text-[#547568]" />
                <span>Investment Risk & Statutory Notice:</span>
              </div>
              <p>
                Calculations represent mathematical models based on user-supplied inputs and historical Gujarat market indicators. Past appreciation is not guaranteed. Does not account for capital gains taxes or individual loan prepayment charges.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
