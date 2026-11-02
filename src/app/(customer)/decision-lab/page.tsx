'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Calculator,
  TrendingUp,
  CreditCard,
  Building,
  ShieldAlert,
  ArrowRight,
  Info,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  calculateEMI,
  simulateLoanPrepayment,
  calculateFIRE,
  calculateBuyVsRent,
  formatInr,
  rupeesToPaise,
} from '@/lib/wealth/engine';

export default function DecisionLabPage() {
  const [activeTab, setActiveTab] = useState<'PREPAY_VS_INVEST' | 'FIRE_LAB' | 'BUY_VS_RENT'>('PREPAY_VS_INVEST');

  // ==========================================
  // SCENARIO 1: PREPAY VS INVEST STATE
  // ==========================================
  const [loanPrincipalLakhs, setLoanPrincipalLakhs] = useState<number>(75); // ₹75 Lakh
  const [loanInterestRate, setLoanInterestRate] = useState<number>(8.5); // 8.5%
  const [loanTenureYears, setLoanTenureYears] = useState<number>(15); // 15 years
  const [monthlyExtraLakhs, setMonthlyExtraLakhs] = useState<number>(0.25); // ₹25,000 / month
  const [investmentCagr, setInvestmentCagr] = useState<number>(12.0); // 12% Nifty 50 return

  const prepayVsInvestResult = useMemo(() => {
    const principalPaise = rupeesToPaise(loanPrincipalLakhs * 100000);
    const tenureMonths = loanTenureYears * 12;
    const extraMonthlyPaise = rupeesToPaise(monthlyExtraLakhs * 100000);

    const standardEmiPaise = calculateEMI(principalPaise, loanInterestRate, tenureMonths);
    const prepaySim = simulateLoanPrepayment(principalPaise, loanInterestRate, tenureMonths, extraMonthlyPaise, 0);

    // If invested instead: Future Value of monthly SIP of extraMonthlyPaise for the tenure
    const monthlyReturnRate = investmentCagr / (12 * 100);
    const months = tenureMonths;
    const sipGrowthFactor = Math.pow(1 + monthlyReturnRate, months);
    const investedFutureValuePaise = Math.round(
      (extraMonthlyPaise * (sipGrowthFactor - 1) * (1 + monthlyReturnRate)) / monthlyReturnRate,
    );
    const totalInvestedCapitalPaise = extraMonthlyPaise * months;
    const investmentGainsPaise = investedFutureValuePaise - totalInvestedCapitalPaise;

    const netAdvantagePaise = investmentGainsPaise - prepaySim.interestSavedPaise;
    const recommendation = netAdvantagePaise > 0 ? 'INVEST_IN_EQUITY' : 'PREPAY_MORTGAGE';

    return {
      standardEmiPaise,
      prepaySim,
      investedFutureValuePaise,
      investmentGainsPaise,
      netAdvantagePaise: Math.abs(netAdvantagePaise),
      recommendation,
    };
  }, [loanPrincipalLakhs, loanInterestRate, loanTenureYears, monthlyExtraLakhs, investmentCagr]);

  // ==========================================
  // SCENARIO 2: FIRE INDEPENDENCE STATE
  // ==========================================
  const [currentNetWorthLakhs, setCurrentNetWorthLakhs] = useState<number>(150); // ₹1.5 Cr
  const [monthlyExpenseLakhs, setMonthlyExpenseLakhs] = useState<number>(1.5); // ₹1.5 Lakh / month
  const [annualSavingsLakhs, setAnnualSavingsLakhs] = useState<number>(18); // ₹18 Lakh / year
  const [expectedFireReturn, setExpectedFireReturn] = useState<number>(10.0);
  const [assumedInflation, setAssumedInflation] = useState<number>(6.0);
  const [swrPct, setSwrPct] = useState<number>(3.5); // 3.5% safe withdrawal rate

  const fireResult = useMemo(() => {
    const currentPaise = rupeesToPaise(currentNetWorthLakhs * 100000);
    const annualExpensePaise = rupeesToPaise(monthlyExpenseLakhs * 12 * 100000);
    const annualSavingsPaise = rupeesToPaise(annualSavingsLakhs * 100000);

    return calculateFIRE(
      currentPaise,
      annualExpensePaise,
      annualSavingsPaise,
      expectedFireReturn,
      assumedInflation,
      swrPct,
    );
  }, [currentNetWorthLakhs, monthlyExpenseLakhs, annualSavingsLakhs, expectedFireReturn, assumedInflation, swrPct]);

  // ==========================================
  // SCENARIO 3: BUY VS RENT STATE
  // ==========================================
  const [propertyCostCrores, setPropertyCostCrores] = useState<number>(1.8); // ₹1.8 Cr
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
  const [propLoanRate, setPropLoanRate] = useState<number>(8.5);
  const [propLoanTenure, setPropLoanTenure] = useState<number>(20);
  const [propAppreciation, setPropAppreciation] = useState<number>(6.0);
  const [monthlyRentRupees, setMonthlyRentRupees] = useState<number>(45000);
  const [rentInflation, setRentInflation] = useState<number>(5.0);
  const [portfolioCagr, setPortfolioCagr] = useState<number>(11.5);
  const [projectionHorizonYears, setProjectionHorizonYears] = useState<number>(15);

  const buyVsRentResult = useMemo(() => {
    const propertyPaise = rupeesToPaise(propertyCostCrores * 10000000);
    const rentPaise = rupeesToPaise(monthlyRentRupees);

    return calculateBuyVsRent(
      propertyPaise,
      downPaymentPct,
      propLoanRate,
      propLoanTenure,
      propAppreciation,
      rentPaise,
      rentInflation,
      portfolioCagr,
      projectionHorizonYears,
    );
  }, [
    propertyCostCrores,
    downPaymentPct,
    propLoanRate,
    propLoanTenure,
    propAppreciation,
    monthlyRentRupees,
    rentInflation,
    portfolioCagr,
    projectionHorizonYears,
  ]);

  return (
    <div className="space-y-8 font-sans">
      {/* 1. TITANIUM COBALT HEADER BANNER */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="p-6 sm:p-8 border-b border-[#252C38] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7595FF] font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#2457FF]" />
              <span>09 // FINANCIAL DECISION LAB &amp; SCENARIO SIMULATOR</span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#F4F6FA] tracking-tight mt-1">
              Deterministic Decision Lab
            </h1>
            <p className="font-sans text-xs text-[#C5CAD3] mt-2 max-w-xl">
              Model high-impact family capital allocation decisions with integer paise precision. Compare home loan prepayment versus index equity SIP, evaluate FIRE retirement independence, and run institutional buy-versus-rent real estate trade-offs.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#090B10] p-1.5 border border-[#252C38] rounded-[2px]">
            <button
              onClick={() => setActiveTab('PREPAY_VS_INVEST')}
              className={`px-3 py-2 font-mono text-[11px] uppercase tracking-wider font-semibold rounded-[2px] transition-all flex items-center gap-2 ${
                activeTab === 'PREPAY_VS_INVEST'
                  ? 'bg-[#2457FF] text-[#F4F6FA] shadow-[0_0_12px_rgba(36,87,255,0.4)]'
                  : 'text-[#858D9B] hover:text-[#F4F6FA]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Prepay vs Invest</span>
            </button>
            <button
              onClick={() => setActiveTab('FIRE_LAB')}
              className={`px-3 py-2 font-mono text-[11px] uppercase tracking-wider font-semibold rounded-[2px] transition-all flex items-center gap-2 ${
                activeTab === 'FIRE_LAB'
                  ? 'bg-[#2457FF] text-[#F4F6FA] shadow-[0_0_12px_rgba(36,87,255,0.4)]'
                  : 'text-[#858D9B] hover:text-[#F4F6FA]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>FIRE Independence</span>
            </button>
            <button
              onClick={() => setActiveTab('BUY_VS_RENT')}
              className={`px-3 py-2 font-mono text-[11px] uppercase tracking-wider font-semibold rounded-[2px] transition-all flex items-center gap-2 ${
                activeTab === 'BUY_VS_RENT'
                  ? 'bg-[#2457FF] text-[#F4F6FA] shadow-[0_0_12px_rgba(36,87,255,0.4)]'
                  : 'text-[#858D9B] hover:text-[#F4F6FA]'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Buy vs Rent</span>
            </button>
          </div>
        </div>

        {/* Regulatory Educational Safe Harbour Strip */}
        <div className="p-4 bg-[#090B10] flex items-center gap-3 font-mono text-[11px] text-[#C5CAD3]">
          <Info className="w-4 h-4 text-[#7595FF] shrink-0" />
          <span>
            <strong className="text-[#F4F6FA]">DETERMINISTIC SIMULATION ENGINE:</strong> Projections utilize exact compound interest equations and historical compounding models for educational decision support. In strict compliance with SEBI (Investment Advisers) Regulations, 2013, this does not constitute investment advice or recommendations.
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SCENARIO 1: PREPAY LOAN VS INVEST IN NIFTY 50 INDEX */}
      {/* ======================================================== */}
      {activeTab === 'PREPAY_VS_INVEST' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Input Parameters */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#252C38] bg-[#171C26] p-6 rounded-[2px] space-y-5">
              <div className="font-mono text-xs uppercase tracking-wider text-[#7595FF] font-semibold flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <span>Simulation Parameters</span>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-[#858D9B] mb-1">
                    <span>OUTSTANDING HOME LOAN</span>
                    <span className="text-[#F4F6FA] font-bold">₹{loanPrincipalLakhs} Lakh</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="5"
                    value={loanPrincipalLakhs}
                    onChange={(e) => setLoanPrincipalLakhs(Number(e.target.value))}
                    className="w-full accent-[#2457FF] bg-[#090B10]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#858D9B] mb-1">
                    <span>ANNUAL LOAN INTEREST RATE</span>
                    <span className="text-[#7595FF] font-bold">{loanInterestRate}% p.a.</span>
                  </div>
                  <input
                    type="range"
                    min="6.5"
                    max="14.0"
                    step="0.1"
                    value={loanInterestRate}
                    onChange={(e) => setLoanInterestRate(Number(e.target.value))}
                    className="w-full accent-[#2457FF] bg-[#090B10]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#858D9B] mb-1">
                    <span>REMAINING TENURE</span>
                    <span className="text-[#F4F6FA] font-bold">{loanTenureYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    step="1"
                    value={loanTenureYears}
                    onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                    className="w-full accent-[#2457FF] bg-[#090B10]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#858D9B] mb-1">
                    <span>EXTRA MONTHLY CAPITAL AVAILABLE</span>
                    <span className="text-[#F4F6FA] font-bold">₹{(monthlyExtraLakhs * 100000).toLocaleString('en-IN')} / Mo</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="2.0"
                    step="0.05"
                    value={monthlyExtraLakhs}
                    onChange={(e) => setMonthlyExtraLakhs(Number(e.target.value))}
                    className="w-full accent-[#2457FF] bg-[#090B10]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#858D9B] mb-1">
                    <span>EXPECTED DIVERSIFIED EQUITY CAGR</span>
                    <span className="text-[#7595FF] font-bold">{investmentCagr}% p.a.</span>
                  </div>
                  <input
                    type="range"
                    min="8.0"
                    max="16.0"
                    step="0.5"
                    value={investmentCagr}
                    onChange={(e) => setInvestmentCagr(Number(e.target.value))}
                    className="w-full accent-[#2457FF] bg-[#090B10]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Comparative Output & Analytical Verdict */}
          <div className="lg:col-span-7 space-y-6">
            {/* Recommendation Hero Card */}
            <div className="border border-[#252C38] bg-[#171C26] p-6 rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
                DECISION ENGINE SYNTHESIS
              </div>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-[2px] ${
                  prepayVsInvestResult.recommendation === 'INVEST_IN_EQUITY'
                    ? 'bg-[#2457FF]/20 text-[#7595FF] border border-[#2457FF]/40'
                    : 'bg-[#FF7A70]/20 text-[#FF7A70] border border-[#FF7A70]/40'
                }`}>
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-display font-bold text-2xl text-[#F4F6FA]">
                    {prepayVsInvestResult.recommendation === 'INVEST_IN_EQUITY'
                      ? 'Optimal Strategy: Invest Capital in Equity Index SIP'
                      : 'Optimal Strategy: Accelerate Home Loan Prepayment'}
                  </div>
                  <p className="font-sans text-xs text-[#C5CAD3] mt-1">
                    {prepayVsInvestResult.recommendation === 'INVEST_IN_EQUITY'
                      ? `At an assumed ${investmentCagr}% CAGR vs an ${loanInterestRate}% borrowing cost, systematic investment yields a net wealth surplus of ${formatInr(prepayVsInvestResult.netAdvantagePaise)} over the debt tenure.`
                      : `Prepaying your loan guarantees an immediate, risk-free post-tax return equal to your borrowing rate (${loanInterestRate}%).`}
                  </p>
                </div>
              </div>

              {/* Side-by-side metric comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#252C38]">
                <div className="p-4 bg-[#090B10] border border-[#252C38] rounded-[2px] space-y-1">
                  <div className="font-mono text-[10px] uppercase text-[#858D9B]">
                    PATH A // PREPAY MORTGAGE
                  </div>
                  <div className="font-display font-bold text-xl text-[#7595FF]">
                    {prepayVsInvestResult.prepaySim.formattedInterestSaved}
                  </div>
                  <div className="font-mono text-[10px] text-[#C5CAD3]">
                    Guaranteed interest saved · Tenure reduced by {prepayVsInvestResult.prepaySim.monthsSaved} months
                  </div>
                </div>

                <div className="p-4 bg-[#090B10] border border-[#252C38] rounded-[2px] space-y-1">
                  <div className="font-mono text-[10px] uppercase text-[#858D9B]">
                    PATH B // INVEST IN INDEX SIP
                  </div>
                  <div className="font-display font-bold text-xl text-[#F4F6FA]">
                    {formatInr(prepayVsInvestResult.investedFutureValuePaise)}
                  </div>
                  <div className="font-mono text-[10px] text-[#7595FF] font-semibold">
                    Includes {formatInr(prepayVsInvestResult.investmentGainsPaise)} compounding gains
                  </div>
                </div>
              </div>
            </div>

            {/* Standard Loan Baseline */}
            <div className="border border-[#252C38] bg-[#090B10] p-5 rounded-[2px] text-xs font-mono flex items-center justify-between">
              <div>
                <span className="text-[#858D9B]">STANDARD MONTHLY EMI: </span>
                <span className="text-[#F4F6FA] font-bold">{formatInr(prepayVsInvestResult.standardEmiPaise)}</span>
              </div>
              <div>
                <span className="text-[#858D9B]">REDUCED TENURE WITH PREPAYMENT: </span>
                <span className="text-[#7595FF] font-bold">
                  {Math.floor(prepayVsInvestResult.prepaySim.newTenureMonths / 12)} Yrs {prepayVsInvestResult.prepaySim.newTenureMonths % 12} Mos
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SCENARIO 2: FIRE INDEPENDENCE LAB */}
      {/* ======================================================== */}
      {activeTab === 'FIRE_LAB' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Input Parameters */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#252C38] bg-[#171C26] p-6 rounded-[2px] space-y-5">
              <div className="font-mono text-xs uppercase tracking-wider text-[#7595FF] font-semibold flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <span>Retirement Parameters</span>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-[#858D9B] mb-1">
                    <span>CURRENT LIQUID WEALTH</span>
                    <span className="text-[#F4F6FA] font-bold">₹{currentNetWorthLakhs} Lakh</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={currentNetWorthLakhs}
                    onChange={(e) => setCurrentNetWorthLakhs(Number(e.target.value))}
                    className="w-full accent-[#2457FF] bg-[#090B10]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#858D9B] mb-1">
                    <span>CURRENT MONTHLY FAMILY EXPENSE</span>
                    <span className="text-[#FF7A70] font-bold">₹{monthlyExpenseLakhs} Lakh / Mo</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10.0"
                    step="0.25"
                    value={monthlyExpenseLakhs}
                    onChange={(e) => setMonthlyExpenseLakhs(Number(e.target.value))}
                    className="w-full accent-[#2457FF] bg-[#090B10]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#858D9B] mb-1">
                    <span>ANNUAL SAVINGS ADDED</span>
                    <span className="text-[#F4F6FA] font-bold">₹{annualSavingsLakhs} Lakh / Year</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="100"
                    step="2"
                    value={annualSavingsLakhs}
                    onChange={(e) => setAnnualSavingsLakhs(Number(e.target.value))}
                    className="w-full accent-[#2457FF] bg-[#090B10]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#858D9B] mb-1">
                    <span>EXPECTED PORTFOLIO RETURN</span>
                    <span className="text-[#7595FF] font-bold">{expectedFireReturn}% p.a.</span>
                  </div>
                  <input
                    type="range"
                    min="6.0"
                    max="14.0"
                    step="0.5"
                    value={expectedFireReturn}
                    onChange={(e) => setExpectedFireReturn(Number(e.target.value))}
                    className="w-full accent-[#2457FF] bg-[#090B10]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#858D9B] mb-1">
                    <span>SAFE WITHDRAWAL RATE (SWR)</span>
                    <span className="text-[#7595FF] font-bold">{swrPct}% SWR</span>
                  </div>
                  <input
                    type="range"
                    min="2.5"
                    max="4.5"
                    step="0.1"
                    value={swrPct}
                    onChange={(e) => setSwrPct(Number(e.target.value))}
                    className="w-full accent-[#2457FF] bg-[#090B10]"
                  />
                  <div className="text-[10px] text-[#858D9B] mt-1">
                    3.5% SWR = ~28.5x annual expenses (Institutional Standard for 30+ year horizons)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Output Timeline & Target Corpus */}
          <div className="lg:col-span-7 space-y-6">
            <div className="border border-[#252C38] bg-[#171C26] p-6 rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
                INDEPENDENCE MILESTONE ANALYSIS
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#090B10] border border-[#252C38] rounded-[2px] space-y-1">
                  <div className="font-mono text-[10px] uppercase text-[#858D9B]">
                    REQUIRED TARGET FIRE CORPUS
                  </div>
                  <div className="font-display font-bold text-2xl text-[#7595FF]">
                    {formatInr(fireResult.targetFireCorpusPaise)}
                  </div>
                  <div className="font-mono text-[10px] text-[#C5CAD3]">
                    Based on ₹{(monthlyExpenseLakhs * 12).toFixed(1)} Lakh/yr expenditure
                  </div>
                </div>

                <div className="p-4 bg-[#090B10] border border-[#252C38] rounded-[2px] space-y-1">
                  <div className="font-mono text-[10px] uppercase text-[#858D9B]">
                    TIME TO FINANCIAL FREEDOM
                  </div>
                  <div className="font-display font-bold text-2xl text-[#F4F6FA]">
                    {fireResult.isAchieved ? 'Achieved Today' : `${fireResult.yearsToFire} Years`}
                  </div>
                  <div className="font-mono text-[10px] text-[#7595FF] font-semibold">
                    {fireResult.isAchieved ? 'Full Financial Independence' : `Target Year: ${new Date().getFullYear() + fireResult.yearsToFire}`}
                  </div>
                </div>
              </div>

              {/* Milestones Progress Table */}
              <div className="border border-[#252C38] rounded-[2px] overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#090B10] text-[#858D9B] text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Horizon</th>
                      <th className="py-2.5 px-3">Projected Net Worth</th>
                      <th className="py-2.5 px-3">Target Required</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252C38] text-[#F4F6FA]">
                    {fireResult.fireMilestones.slice(0, 10).map((row) => (
                      <tr key={row.year} className="hover:bg-[#1C2230]">
                        <td className="py-2 px-3 text-[#7595FF]">Year {row.year} ({new Date().getFullYear() + row.year})</td>
                        <td className="py-2 px-3">{formatInr(row.projectedPaise)}</td>
                        <td className="py-2 px-3 text-[#858D9B]">{formatInr(row.targetPaise)}</td>
                        <td className="py-2 px-3 text-right">
                          {row.projectedPaise >= row.targetPaise ? (
                            <span className="text-[#7595FF] font-bold">FREEDOM ACHIEVED</span>
                          ) : (
                            <span className="text-[#858D9B]">{((row.projectedPaise / row.targetPaise) * 100).toFixed(0)}% Funded</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SCENARIO 3: BUY REAL ESTATE VS RENT & INVEST */}
      {/* ======================================================== */}
      {activeTab === 'BUY_VS_RENT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Input Parameters */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#252C38] bg-[#171C26] p-6 rounded-[2px] space-y-5">
              <div className="font-mono text-xs uppercase tracking-wider text-[#7595FF] font-semibold flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <span>Property &amp; Rent Assumptions</span>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-[#858D9B] mb-1">
                    <span>PROPERTY ACQUISITION VALUE</span>
                    <span className="text-[#F4F6FA] font-bold">₹{propertyCostCrores.toFixed(2)} Crore</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10.0"
                    step="0.1"
                    value={propertyCostCrores}
                    onChange={(e) => setPropertyCostCrores(Number(e.target.value))}
                    className="w-full accent-[#2457FF] bg-[#090B10]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#858D9B] mb-1">
                    <span>DOWN PAYMENT</span>
                    <span className="text-[#7595FF] font-bold">{downPaymentPct}% (₹{(propertyCostCrores * downPaymentPct / 100).toFixed(2)} Cr)</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    className="w-full accent-[#2457FF] bg-[#090B10]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#858D9B] mb-1">
                    <span>EXPECTED PROPERTY APPRECIATION</span>
                    <span className="text-[#7595FF] font-bold">{propAppreciation}% p.a.</span>
                  </div>
                  <input
                    type="range"
                    min="3.0"
                    max="10.0"
                    step="0.5"
                    value={propAppreciation}
                    onChange={(e) => setPropAppreciation(Number(e.target.value))}
                    className="w-full accent-[#2457FF] bg-[#090B10]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#858D9B] mb-1">
                    <span>EQUIVALENT MONTHLY RENT</span>
                    <span className="text-[#FF7A70] font-bold">₹{monthlyRentRupees.toLocaleString('en-IN')} / Mo</span>
                  </div>
                  <input
                    type="range"
                    min="15000"
                    max="250000"
                    step="5000"
                    value={monthlyRentRupees}
                    onChange={(e) => setMonthlyRentRupees(Number(e.target.value))}
                    className="w-full accent-[#2457FF] bg-[#090B10]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#858D9B] mb-1">
                    <span>EQUITY PORTFOLIO RETURN</span>
                    <span className="text-[#7595FF] font-bold">{portfolioCagr}% p.a.</span>
                  </div>
                  <input
                    type="range"
                    min="8.0"
                    max="15.0"
                    step="0.5"
                    value={portfolioCagr}
                    onChange={(e) => setPortfolioCagr(Number(e.target.value))}
                    className="w-full accent-[#2457FF] bg-[#090B10]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Synthesis & Year-by-Year Wealth comparison */}
          <div className="lg:col-span-7 space-y-6">
            <div className="border border-[#252C38] bg-[#171C26] p-6 rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
                15-YEAR WEALTH OUTCOME ANALYSIS
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-[2px] bg-[#2457FF]/20 text-[#7595FF] border border-[#2457FF]/40">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-display font-bold text-2xl text-[#F4F6FA]">
                    Recommendation: {buyVsRentResult.recommendation === 'BUY' ? 'Acquire Property (Buy)' : 'Rent & Invest Difference'}
                  </div>
                  <p className="font-sans text-xs text-[#C5CAD3] mt-1">
                    Over a {projectionHorizonYears}-year holding period, {buyVsRentResult.recommendation === 'BUY' ? 'buying real estate' : 'renting and systematically investing the down payment and EMI differential in equities'} creates an estimated {formatInr(buyVsRentResult.financialAdvantagePaise)} net wealth surplus.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#252C38]">
                <div className="p-4 bg-[#090B10] border border-[#252C38] rounded-[2px] space-y-1">
                  <div className="font-mono text-[10px] uppercase text-[#858D9B]">
                    BUYING: NET EQUITY (YEAR {projectionHorizonYears})
                  </div>
                  <div className="font-display font-bold text-xl text-[#7595FF]">
                    {formatInr(buyVsRentResult.buyingNetWorthPaise)}
                  </div>
                  <div className="font-mono text-[10px] text-[#C5CAD3]">
                    Property Value minus Remaining Debt
                  </div>
                </div>

                <div className="p-4 bg-[#090B10] border border-[#252C38] rounded-[2px] space-y-1">
                  <div className="font-mono text-[10px] uppercase text-[#858D9B]">
                    RENTING: INVESTMENT PORTFOLIO
                  </div>
                  <div className="font-display font-bold text-xl text-[#F4F6FA]">
                    {formatInr(buyVsRentResult.rentingNetWorthPaise)}
                  </div>
                  <div className="font-mono text-[10px] text-[#7595FF] font-semibold">
                    Downpayment + Monthly Savings Compounded
                  </div>
                </div>
              </div>

              {/* Yearly Milestones Table */}
              <div className="border border-[#252C38] rounded-[2px] overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#090B10] text-[#858D9B] text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Horizon</th>
                      <th className="py-2.5 px-3">Buying Equity</th>
                      <th className="py-2.5 px-3">Renting Portfolio</th>
                      <th className="py-2.5 px-3 text-right">Advantage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252C38] text-[#F4F6FA]">
                    {buyVsRentResult.yearlyComparison.slice(0, 10).map((row) => (
                      <tr key={row.year} className="hover:bg-[#1C2230]">
                        <td className="py-2 px-3 text-[#7595FF]">Year {row.year}</td>
                        <td className="py-2 px-3">{formatInr(row.buyWealthPaise)}</td>
                        <td className="py-2 px-3 text-[#858D9B]">{formatInr(row.rentWealthPaise)}</td>
                        <td className="py-2 px-3 text-right font-semibold">
                          {row.buyWealthPaise >= row.rentWealthPaise ? (
                            <span className="text-[#7595FF]">+Buy</span>
                          ) : (
                            <span className="text-[#FF7A70]">+Rent</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
