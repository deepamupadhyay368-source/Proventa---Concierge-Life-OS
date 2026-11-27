'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Calculator,
  Download,
  Gauge,
  Sliders,
  TrendingUp,
} from 'lucide-react';
import type { InvestmentAnalysisResult } from '@/lib/real-estate-intelligence/investment-engine';

function formatInr(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}

export default function InvestmentIntelligencePage() {
  const [inputs, setInputs] = useState({
    purchasePriceRupees: 12_500_000, // 1.25 Cr
    stampDutyPercent: 4.9,
    registrationPercent: 1.0,
    brokeragePercent: 1.0,
    renovationCostRupees: 400_000,
    monthlyRentRupees: 42_000,
    annualMaintenanceRupees: 48_000,
    vacancyRatePercent: 8,
    loanToValuePercent: 70,
    interestRatePercent: 8.75,
    loanTenureYears: 20,
    holdingPeriodYears: 7,
    annualAppreciationPercent: 8,
    annualRentEscalationPercent: 5,
  });

  const [analysis, setAnalysis] = useState<InvestmentAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportNotice, setReportNotice] = useState<string | null>(null);

  async function runModel(payload = inputs) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/real-estate/investment/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Investment calculation failed.');
      setAnalysis(data.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to run investment analysis.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleExportFeasibilityReport() {
    if (!analysis) return;
    setReportNotice(null);
    const res = await fetch('/api/real-estate/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportType: 'INVESTMENT_FEASIBILITY',
        investmentInput: inputs,
      }),
    });

    if (res.status === 401) {
      setReportNotice('Sign in (/login) to generate and download a server-verified PDF report.');
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setReportNotice(data.error || 'PDF report generation failed.');
      return;
    }
    window.open(data.downloadUrl, '_blank', 'noopener,noreferrer');
    setReportNotice(
      `Generated ${data.pageCount}-page PDF ${data.reportReference} (SHA-256: ${String(data.sha256Checksum).slice(0, 12)}...).`
    );
  }

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
              MODULE 04 // INSTITUTIONAL INVESTMENT INTELLIGENCE
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Real Estate Underwriting &amp; IRR Engine
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Deterministic cash-flow underwriting calibrated for Gujarat acquisition costs (stamp duty, registration,
              brokerage), debt service, rental yield, exact IRR, equity multiple, 3-scenario stress tests, and
              6-parameter sensitivity matrices.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportFeasibilityReport}
            disabled={!analysis}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export Feasibility Report
          </button>
        </div>

        {reportNotice && (
          <div className="mt-4 rounded-lg border border-sky-500/40 bg-sky-500/10 px-4 py-2.5 text-xs text-sky-200">
            {reportNotice}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* Left Inputs Panel */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runModel();
            }}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 lg:col-span-4"
          >
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Underwriting Assumptions</h2>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Purchase Price (INR)</label>
                <input
                  type="number"
                  value={inputs.purchasePriceRupees}
                  onChange={(e) => setInputs({ ...inputs, purchasePriceRupees: Number(e.target.value) })}
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400">Stamp Duty %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.stampDutyPercent}
                    onChange={(e) => setInputs({ ...inputs, stampDutyPercent: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-2 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Reg. %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.registrationPercent}
                    onChange={(e) => setInputs({ ...inputs, registrationPercent: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-2 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Brokerage %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.brokeragePercent}
                    onChange={(e) => setInputs({ ...inputs, brokeragePercent: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-2 font-mono text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400">Monthly Rent (INR)</label>
                  <input
                    type="number"
                    value={inputs.monthlyRentRupees}
                    onChange={(e) => setInputs({ ...inputs, monthlyRentRupees: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Vacancy %</label>
                  <input
                    type="number"
                    step="0.5"
                    value={inputs.vacancyRatePercent}
                    onChange={(e) => setInputs({ ...inputs, vacancyRatePercent: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400">Annual Maint. (INR)</label>
                  <input
                    type="number"
                    value={inputs.annualMaintenanceRupees}
                    onChange={(e) => setInputs({ ...inputs, annualMaintenanceRupees: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Renovation (INR)</label>
                  <input
                    type="number"
                    value={inputs.renovationCostRupees}
                    onChange={(e) => setInputs({ ...inputs, renovationCostRupees: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400">LTV %</label>
                  <input
                    type="number"
                    value={inputs.loanToValuePercent}
                    onChange={(e) => setInputs({ ...inputs, loanToValuePercent: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-2 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Interest %</label>
                  <input
                    type="number"
                    step="0.05"
                    value={inputs.interestRatePercent}
                    onChange={(e) => setInputs({ ...inputs, interestRatePercent: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-2 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Tenure (Y)</label>
                  <input
                    type="number"
                    value={inputs.loanTenureYears}
                    onChange={(e) => setInputs({ ...inputs, loanTenureYears: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-2 font-mono text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400">Hold Period (Years)</label>
                  <input
                    type="number"
                    value={inputs.holdingPeriodYears}
                    onChange={(e) => setInputs({ ...inputs, holdingPeriodYears: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Appreciation %/yr</label>
                  <input
                    type="number"
                    step="0.5"
                    value={inputs.annualAppreciationPercent}
                    onChange={(e) => setInputs({ ...inputs, annualAppreciationPercent: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
              >
                <Calculator className="h-4 w-4" />
                {loading ? 'Computing IRR...' : 'Run Deterministic Model'}
              </button>
            </div>
          </form>

          {/* Right Output Panel */}
          <div className="space-y-6 lg:col-span-8">
            {error && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
                {error}
              </div>
            )}

            {analysis && (
              <>
                {/* Top KPI Strip */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <span className="font-mono text-[11px] text-slate-400">BASE IRR</span>
                    <p className="mt-1 font-mono text-2xl font-bold text-emerald-400">
                      {analysis.base.irrPercent !== null ? `${analysis.base.irrPercent}%` : 'N/A'}
                    </p>
                    <span className="text-[11px] text-slate-500">
                      {analysis.base.irrStatus === 'CONVERGED'
                        ? `MIRR: ${analysis.base.mirrPercent ?? '—'}%`
                        : analysis.base.irrStatus}
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <span className="font-mono text-[11px] text-slate-400">EQUITY MULTIPLE</span>
                    <p className="mt-1 font-mono text-2xl font-bold text-white">
                      {analysis.base.equityMultiple}x
                    </p>
                    <span className="text-[11px] text-slate-500">ROI: {analysis.base.roiPercent}%</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <span className="font-mono text-[11px] text-slate-400">NET / GROSS YIELD</span>
                    <p className="mt-1 font-mono text-2xl font-bold text-sky-300">
                      {analysis.base.netRentalYieldPercent}%
                    </p>
                    <span className="text-[11px] text-slate-500">
                      Gross: {analysis.base.grossRentalYieldPercent}%
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <span className="font-mono text-[11px] text-slate-400">TOTAL ACQUISITION</span>
                    <p className="mt-1 font-mono text-xl font-bold text-white">
                      {formatInr(analysis.base.totalAcquisitionCostRupees)}
                    </p>
                    <span className="text-[11px] text-slate-500">
                      Equity: {formatInr(analysis.base.equityInvestedRupees)}
                    </span>
                  </div>
                </div>

                {/* 3-Scenario Matrix */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    Conservative / Base / Optimistic Scenarios
                  </h3>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="border-b border-slate-800 text-slate-400">
                        <tr>
                          <th className="py-2 pr-4">Scenario</th>
                          <th className="py-2 pr-4">IRR</th>
                          <th className="py-2 pr-4">ROI</th>
                          <th className="py-2 pr-4">Equity Mult.</th>
                          <th className="py-2 pr-4">Exit Value</th>
                          <th className="py-2">Net Profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {(
                          [
                            ['Conservative', analysis.scenarios.conservative, 'text-amber-300'],
                            ['Base Case', analysis.scenarios.base, 'text-emerald-300'],
                            ['Optimistic', analysis.scenarios.optimistic, 'text-sky-300'],
                          ] as const
                        ).map(([label, m, color]) => (
                          <tr key={label}>
                            <td className={`py-2.5 pr-4 font-sans font-semibold ${color}`}>{label}</td>
                            <td className="py-2.5 pr-4 text-white">{m.irrPercent}%</td>
                            <td className="py-2.5 pr-4 text-slate-300">{m.roiPercent}%</td>
                            <td className="py-2.5 pr-4 text-slate-300">{m.equityMultiple}x</td>
                            <td className="py-2.5 pr-4 text-slate-300">{formatInr(m.projectedExitValueRupees)}</td>
                            <td className="py-2.5 text-white">{formatInr(m.netProfitRupees)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sensitivity Matrix + 6-Factor Scorecard */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                      <BarChart3 className="h-4 w-4 text-emerald-400" />
                      6-Parameter Sensitivity Matrix
                    </h3>
                    <div className="mt-3 space-y-2 text-xs">
                      {analysis.sensitivity.map((row, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded bg-slate-950/70 px-3 py-2"
                        >
                          <div>
                            <p className="font-medium text-slate-200">{row.parameter}</p>
                            <p className="font-mono text-[11px] text-slate-500">{row.deltaLabel}</p>
                          </div>
                          <div className="text-right font-mono">
                            <p className="text-emerald-300">IRR {row.irrPercent}%</p>
                            <p className="text-[11px] text-slate-400">Yield {row.netYieldPercent}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Gauge className="h-4 w-4 text-emerald-400" />
                      6-Factor Transparent Scorecard
                    </h3>
                    <div className="mt-3 space-y-2.5 text-xs">
                      {[
                        ['Location', analysis.scorecard.location],
                        ['Market Liquidity', analysis.scorecard.marketLiquidity],
                        ['Rental Potential', analysis.scorecard.rentalPotential],
                        ['Price Competitiveness', analysis.scorecard.priceCompetitiveness],
                        ['Developer / Project Risk', analysis.scorecard.developerProjectRisk],
                        ['Data Confidence', analysis.scorecard.dataConfidence],
                      ].map(([label, score]) => (
                        <div key={String(label)}>
                          <div className="flex justify-between">
                            <span className="text-slate-300">{label}</span>
                            <span className="font-mono text-white">
                              {score !== null ? `${score}/100` : 'INSUFFICIENT_DATA'}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800">
                            <div
                              className="h-1.5 rounded-full bg-emerald-500"
                              style={{ width: `${score !== null ? Math.min(100, Math.max(0, Number(score))) : 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                        <span className="font-semibold text-white">Composite Indicative Score</span>
                        <span className="font-mono text-lg font-bold text-emerald-400">
                          {analysis.scorecard.compositeIndicativeScore !== null
                            ? `${analysis.scorecard.compositeIndicativeScore}/100`
                            : 'INSUFFICIENT_DATA'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{analysis.scorecard.note}</p>
                    </div>
                  </div>
                </div>

                {/* Mandatory Non-Advice Disclaimer */}
                <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-200/90">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <p>{analysis.disclaimer}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
