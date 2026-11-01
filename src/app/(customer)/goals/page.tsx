'use client';

import { useEffect, useState } from 'react';
import {
  Target,
  Play,
  Calendar,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Terminal,
} from 'lucide-react';
import { FinancialGoalDTO, ScenarioSimulationResult } from '@/lib/wealth/types';

export default function GoalsPage() {
  const [goals, setGoals] = useState<FinancialGoalDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Scenario Simulator Inputs
  const [startingWealthRupees, setStartingWealthRupees] = useState('250000000'); // ₹25 Cr
  const [monthlySavingsRupees, setMonthlySavingsRupees] = useState('50000'); // ₹50k/mo
  const [expectedReturnRate, setExpectedReturnRate] = useState('9.0'); // 9%
  const [inflationRate, setInflationRate] = useState('6.0'); // 6%
  const [loanPrepaymentRupees, setLoanPrepaymentRupees] = useState('0');
  const [projectionYears, setProjectionYears] = useState('10');
  const [simResult, setSimResult] = useState<ScenarioSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  async function loadGoals() {
    setLoading(true);
    try {
      const res = await fetch('/api/wealth/goals?workspaceId=fam_sharma_heritage');
      const json = await res.json();
      if (json.success) {
        setGoals(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadGoals();
    void runSimulation();
  }, []);

  async function runSimulation() {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/wealth/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SIMULATE_SCENARIO',
          baseNetWorthRupees: parseFloat(startingWealthRupees),
          monthlyAdditionalSavingsRupees: parseFloat(monthlySavingsRupees),
          expectedAnnualReturnRate: parseFloat(expectedReturnRate),
          inflationRate: parseFloat(inflationRate),
          loanPrepaymentRupees: parseFloat(loanPrepaymentRupees),
          projectionYears: parseInt(projectionYears, 10),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSimResult(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  }

  return (
    <div className="space-y-8 font-sans">
      {/* 1. TITANIUM COBALT HEADER */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="p-6 sm:p-8 border-b border-[#252C38]">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7595FF] font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#2457FF]" />
            <span>09 // CAPITAL TARGETS &amp; DETERMINISTIC SCENARIOS</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#F4F6FA] tracking-tight mt-1">
            Family Milestones &amp; Scenarios
          </h1>
          <p className="font-sans text-xs text-[#C5CAD3] mt-2 max-w-xl">
            Target progression tracking and deterministic forward compound projections with inflation-discounted purchasing power modeling.
          </p>
        </div>

        {/* Milestone Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#252C38] bg-[#090B10]">
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              ACTIVE CAPITAL MILESTONES
            </div>
            <div className="font-display font-bold text-2xl text-[#F4F6FA]">
              {goals.length} Goals Registered
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              AVERAGE PROGRESS
            </div>
            <div className="font-display font-bold text-2xl text-[#7595FF]">
              {goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progressPercentage, 0) / goals.length) : 0}% Achieved
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              SIMULATION METHODOLOGY
            </div>
            <div className="font-display font-bold text-2xl text-[#F4F6FA]">
              Continuous Compound Math
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE GOALS MATRIX */}
      <div className="space-y-4">
        <div className="font-mono text-xs uppercase tracking-wider text-[#7595FF] font-semibold">
          Active Family Capital Milestones
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g, idx) => (
            <div
              key={g.id}
              className="p-6 border border-[#252C38] bg-[#171C26] rounded-[2px] space-y-4 hover:border-[#7595FF]/50 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[10px] text-[#7595FF] font-semibold">GOAL-0{idx + 1}</div>
                  <span className="font-mono text-[10px] px-2 py-0.5 border border-[#252C38] bg-[#090B10] text-[#C5CAD3] uppercase mt-1 inline-block rounded-[2px]">
                    {g.category.replace('_', ' ')}
                  </span>
                  <h3 className="font-display font-bold text-xl text-[#F4F6FA] mt-1">{g.title}</h3>
                </div>
                <span className="font-mono text-[10px] px-2.5 py-1 bg-[#2457FF]/15 text-[#7595FF] border border-[#2457FF]/40 uppercase tracking-wider font-semibold rounded-[2px]">
                  {g.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#858D9B]">{g.formattedCurrentAmount} achieved</span>
                  <span className="text-[#F4F6FA] font-bold">{g.progressPercentage}%</span>
                </div>
                <div className="h-4 w-full border border-[#252C38] bg-[#090B10] overflow-hidden rounded-[2px]">
                  <div
                    style={{ width: `${g.progressPercentage}%` }}
                    className="h-full bg-[#2457FF] shadow-[0_0_10px_rgba(36,87,255,0.5)]"
                  />
                </div>
                <div className="flex justify-between font-mono text-[10px] text-[#85827B] pt-1">
                  <span>Target: {g.formattedTargetAmount}</span>
                  <span>Target Date: {g.targetDate}</span>
                </div>
              </div>

              {/* Contributors */}
              <div className="pt-3 border-t border-[#252C38] font-mono text-xs text-[#85827B]">
                <span>CONTRIBUTORS: </span>
                <span className="text-[#C5CAD3] font-semibold">
                  {g.contributors.map((c) => `${c.memberName} (${c.formattedContributed})`).join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. DETERMINISTIC SCENARIO SIMULATOR (DARK TITANIUM TERMINAL) */}
      <div className="border border-[#252C38] bg-[#171C26] text-[#F4F6FA] p-6 sm:p-8 space-y-6 rounded-[2px] shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3 border-b border-[#252C38] pb-4">
          <div className="w-8 h-8 bg-[#2457FF]/15 border border-[#2457FF]/40 rounded-[2px] flex items-center justify-center">
            <Terminal className="w-4 h-4 text-[#7595FF]" />
          </div>
          <div>
            <h3 className="font-mono text-sm uppercase tracking-wider text-[#F4F6FA] font-bold">
              SCENARIO SIMULATION TERMINAL // DETERMINISTIC COMPOUND ENGINE
            </h3>
            <p className="font-mono text-[11px] text-[#7595FF] mt-0.5">
              Pure mathematical simulation modeling nominal growth and inflation-discounted real wealth. Informational only.
            </p>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
              Baseline Capital (₹)
            </label>
            <input
              type="number"
              value={startingWealthRupees}
              onChange={(e) => setStartingWealthRupees(e.target.value)}
              className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
              Monthly Inflow (₹)
            </label>
            <input
              type="number"
              value={monthlySavingsRupees}
              onChange={(e) => setMonthlySavingsRupees(e.target.value)}
              className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
              Expected Return (% p.a.)
            </label>
            <input
              type="number"
              step="0.5"
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(e.target.value)}
              className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
              Inflation Rate (% p.a.)
            </label>
            <input
              type="number"
              step="0.5"
              value={inflationRate}
              onChange={(e) => setInflationRate(e.target.value)}
              className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
              Projection Horizon
            </label>
            <select
              value={projectionYears}
              onChange={(e) => setProjectionYears(e.target.value)}
              className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
            >
              <option value="5">5 Years</option>
              <option value="10">10 Years</option>
              <option value="15">15 Years</option>
              <option value="20">20 Years</option>
              <option value="25">25 Years</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="px-6 py-2.5 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] font-mono text-xs uppercase tracking-wider font-semibold border border-[#7595FF]/40 rounded-[2px] shadow-[0_0_15px_rgba(36,87,255,0.3)] transition-all flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? 'Executing Compound Models...' : 'Recompute Projection'}</span>
          </button>
        </div>

        {/* Results Screen */}
        {simResult && (
          <div className="pt-6 border-t border-[#252C38] space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 bg-[#090B10] border border-[#252C38] rounded-[2px] space-y-1">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
                  PROJECTED NOMINAL WEALTH
                </div>
                <div className="font-display font-bold text-3xl text-[#F4F6FA]">
                  {simResult.formattedProjectedNetWorth}
                </div>
                <div className="font-mono text-[10px] text-[#7595FF]">
                  Compounded @ {expectedReturnRate}% p.a.
                </div>
              </div>

              <div className="p-5 bg-[#090B10] border border-[#252C38] rounded-[2px] space-y-1">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
                  REAL PURCHASING POWER (INFLATION-ADJUSTED)
                </div>
                <div className="font-display font-bold text-3xl text-[#7595FF]">
                  {simResult.formattedInflationAdjusted}
                </div>
                <div className="font-mono text-[10px] text-[#858D9B]">
                  Discounted @ {inflationRate}% CPI
                </div>
              </div>

              <div className="p-5 bg-[#090B10] border border-[#252C38] rounded-[2px] space-y-1">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
                  NET CAPITAL ACCRETION GAIN
                </div>
                <div className="font-display font-bold text-3xl text-[#F4F6FA]">
                  {simResult.formattedNetGain}
                </div>
                <div className="font-mono text-[10px] text-[#C5CAD3]">
                  Compounded gain above baseline principal
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#090B10] border border-[#252C38] rounded-[2px] font-mono text-[11px] text-[#C5CAD3] leading-relaxed">
              <span className="font-bold text-[#7595FF]">STATED MATHEMATICAL ASSUMPTIONS:</span> Constant annualized compounding is assumed with monthly cashflow additions. Projections do not account for capital gains taxes, market volatility, or sequence-of-returns risk. Informational calculation model only.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
