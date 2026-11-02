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
  TrendingUp,
} from 'lucide-react';
import { FinancialGoalDTO, ScenarioSimulationResult } from '@/lib/wealth/types';
import { useCurrentWorkspace } from '@/lib/wealth/workspace-context';

export default function GoalsPage() {
  const { currentWorkspaceId, isLoaded } = useCurrentWorkspace();
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
    if (!currentWorkspaceId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/wealth/goals?workspaceId=${encodeURIComponent(currentWorkspaceId)}`);
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
    if (isLoaded) {
      void loadGoals();
      void runSimulation();
    }
  }, [currentWorkspaceId, isLoaded]);

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
      {/* 1. LIVING CAPITAL TARGETS BANNER */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-[#E2E8F0]">
          <div className="font-mono text-xs uppercase tracking-wider text-[#2563EB] font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
            <span>REGISTER 08 // CAPITAL TARGETS &amp; SCENARIOS</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#0F172A] tracking-tight mt-1">
            Family Milestones &amp; Scenarios
          </h1>
          <p className="font-sans text-xs text-[#475569] mt-2 max-w-xl">
            Target progression tracking and deterministic forward compound projections with inflation-discounted purchasing power modeling.
          </p>
        </div>

        {/* Milestone Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] bg-[#FAFBFC]">
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
              ACTIVE CAPITAL MILESTONES
            </div>
            <div className="font-display font-bold text-2xl text-[#0F172A]">
              {goals.length} Goals Registered
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
              AVERAGE PROGRESS
            </div>
            <div className="font-display font-bold text-2xl text-[#2563EB]">
              {goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progressPercentage, 0) / goals.length) : 0}% Achieved
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
              SIMULATION METHODOLOGY
            </div>
            <div className="font-display font-bold text-2xl text-[#0D9488]">
              Continuous Compound Math
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE GOALS MATRIX */}
      <div className="space-y-4">
        <div className="font-mono text-xs uppercase tracking-wider text-[#2563EB] font-semibold">
          Active Family Capital Milestones
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g, idx) => (
            <div
              key={g.id}
              className="p-6 bg-white border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-md rounded-2xl space-y-4 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[10px] text-[#2563EB] font-bold">GOAL-0{idx + 1}</div>
                  <span className="font-mono text-[10px] px-2 py-0.5 bg-[#F1F5F9] text-[#475569] uppercase mt-1 inline-block rounded-md">
                    {g.category.replace('_', ' ')}
                  </span>
                  <h3 className="font-display font-bold text-xl text-[#0F172A] mt-1">{g.title}</h3>
                </div>
                <span className="font-mono text-[10px] px-2.5 py-1 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] uppercase font-bold rounded-full">
                  {g.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#64748B]">{g.formattedCurrentAmount} achieved</span>
                  <span className="text-[#0F172A] font-bold">{g.progressPercentage}%</span>
                </div>
                <div className="h-3 w-full bg-[#F1F5F9] overflow-hidden rounded-full">
                  <div
                    style={{ width: `${g.progressPercentage}%` }}
                    className="h-full bg-[#2563EB] rounded-full"
                  />
                </div>
                <div className="flex justify-between font-mono text-[11px] text-[#64748B] pt-1">
                  <span>Target: {g.formattedTargetAmount}</span>
                  <span>Target Date: {g.targetDate}</span>
                </div>
              </div>

              {/* Contributors */}
              <div className="pt-3 border-t border-[#F1F5F9] font-mono text-xs text-[#64748B]">
                <span>CONTRIBUTORS: </span>
                <span className="text-[#0F172A] font-semibold">
                  {g.contributors.map((c) => `${c.memberName} (${c.formattedContributed})`).join(', ')}
                </span>
              </div>
            </div>
          ))}
          {goals.length === 0 && (
            <div className="col-span-full p-10 text-center space-y-3 bg-white border border-[#E2E8F0] rounded-2xl">
              <div className="w-10 h-10 mx-auto bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center rounded-xl">
                <Target className="w-5 h-5" />
              </div>
              <div className="font-display font-bold text-base text-[#0F172A]">No Capital Goals Configured</div>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                No active wealth targets configured. Define education funds, retirement corpuses, or real estate acquisition milestones.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. DETERMINISTIC SCENARIO SIMULATOR (SYSTEM 04) */}
      <div className="bg-white border border-[#CBD5E1] text-[#0F172A] p-6 sm:p-8 space-y-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
          <div className="w-9 h-9 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl flex items-center justify-center">
            <Terminal className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#0F172A]">
              Deterministic Scenario Simulation Terminal
            </h3>
            <p className="font-mono text-xs text-[#2563EB] mt-0.5">
              Pure mathematical simulation modeling nominal growth and inflation-discounted real wealth. Informational only.
            </p>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1">
              Baseline Capital (₹)
            </label>
            <input
              type="number"
              value={startingWealthRupees}
              onChange={(e) => setStartingWealthRupees(e.target.value)}
              className="w-full bg-[#FAFBFC] border border-[#CBD5E1] px-3.5 py-2 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] rounded-lg"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1">
              Monthly Inflow (₹)
            </label>
            <input
              type="number"
              value={monthlySavingsRupees}
              onChange={(e) => setMonthlySavingsRupees(e.target.value)}
              className="w-full bg-[#FAFBFC] border border-[#CBD5E1] px-3.5 py-2 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] rounded-lg"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1">
              Expected Return (% p.a.)
            </label>
            <input
              type="number"
              step="0.5"
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(e.target.value)}
              className="w-full bg-[#FAFBFC] border border-[#CBD5E1] px-3.5 py-2 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] rounded-lg"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1">
              Inflation Rate (% p.a.)
            </label>
            <input
              type="number"
              step="0.5"
              value={inflationRate}
              onChange={(e) => setInflationRate(e.target.value)}
              className="w-full bg-[#FAFBFC] border border-[#CBD5E1] px-3.5 py-2 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] rounded-lg"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1">
              Projection Horizon
            </label>
            <select
              value={projectionYears}
              onChange={(e) => setProjectionYears(e.target.value)}
              className="w-full bg-[#FAFBFC] border border-[#CBD5E1] px-3.5 py-2 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] rounded-lg"
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
            className="px-6 py-2.5 bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-mono text-xs uppercase tracking-wider font-semibold rounded-lg shadow-sm shadow-blue-500/25 transition-all flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? 'Executing Compound Models...' : 'Recompute Projection'}</span>
          </button>
        </div>

        {/* Results Screen */}
        {simResult && (
          <div className="pt-6 border-t border-[#E2E8F0] space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-[#FAFBFC] border border-[#E2E8F0] rounded-xl space-y-1">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                  PROJECTED NOMINAL WEALTH
                </div>
                <div className="font-display font-bold text-3xl text-[#0F172A]">
                  {simResult.formattedProjectedNetWorth}
                </div>
                <div className="font-mono text-xs text-[#2563EB]">
                  Compounded @ {expectedReturnRate}% p.a.
                </div>
              </div>

              <div className="p-6 bg-[#FAFBFC] border border-[#E2E8F0] rounded-xl space-y-1">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                  REAL PURCHASING POWER (INFLATION-ADJUSTED)
                </div>
                <div className="font-display font-bold text-3xl text-[#0D9488]">
                  {simResult.formattedInflationAdjusted}
                </div>
                <div className="font-mono text-xs text-[#64748B]">
                  Discounted @ {inflationRate}% CPI
                </div>
              </div>

              <div className="p-6 bg-[#FAFBFC] border border-[#E2E8F0] rounded-xl space-y-1">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                  NET CAPITAL ACCRETION GAIN
                </div>
                <div className="font-display font-bold text-3xl text-[#0F172A]">
                  {simResult.formattedNetGain}
                </div>
                <div className="font-mono text-xs text-[#475569]">
                  Compounded gain above baseline principal
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl font-mono text-xs text-[#475569] leading-relaxed">
              <span className="font-bold text-[#2563EB]">STATED MATHEMATICAL ASSUMPTIONS:</span> Constant annualized compounding is assumed with monthly cashflow additions. Projections do not account for capital gains taxes, market volatility, or sequence-of-returns risk. Informational calculation model only.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
