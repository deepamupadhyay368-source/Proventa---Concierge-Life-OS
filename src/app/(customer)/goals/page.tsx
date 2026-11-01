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
      {/* 1. INSTITUTIONAL HEADER */}
      <div className="border border-[#101010] bg-[#FAF9F6]">
        <div className="p-6 sm:p-8 border-b border-[#101010]">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#85827B]">
            09 // CAPITAL TARGETS &amp; DETERMINISTIC SCENARIOS
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#101010] tracking-tight mt-1">
            Family Milestones &amp; Scenarios
          </h1>
          <p className="font-sans text-xs text-[#85827B] mt-2 max-w-xl">
            Target progression tracking and deterministic forward compound projections with inflation-discounted purchasing power modeling.
          </p>
        </div>

        {/* Milestone Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#101010] bg-[#F0EDE5]">
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              ACTIVE CAPITAL MILESTONES
            </div>
            <div className="font-serif text-2xl text-[#101010]">
              {goals.length} Goals Registered
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              AVERAGE PROGRESS
            </div>
            <div className="font-serif text-2xl text-[#263B35]">
              {goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progressPercentage, 0) / goals.length) : 0}% Achieved
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              SIMULATION METHODOLOGY
            </div>
            <div className="font-serif text-2xl text-[#101010]">
              Continuous Compound Math
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE GOALS MATRIX */}
      <div className="space-y-4">
        <div className="font-mono text-xs uppercase tracking-wider text-[#101010] font-semibold">
          Active Family Capital Milestones
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g, idx) => (
            <div
              key={g.id}
              className="p-6 border border-[#101010] bg-[#FAF9F6] space-y-4 hover:bg-[#F0EDE5] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[10px] text-[#85827B]">GOAL-0{idx + 1}</div>
                  <span className="font-mono text-[10px] px-2 py-0.5 border border-[#101010] bg-[#FAF9F6] uppercase mt-1 inline-block">
                    {g.category.replace('_', ' ')}
                  </span>
                  <h3 className="font-serif text-xl text-[#101010] mt-1">{g.title}</h3>
                </div>
                <span className="font-mono text-[10px] px-2.5 py-1 bg-[#263B35] text-[#FAF9F6] uppercase tracking-wider font-semibold">
                  {g.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#85827B]">{g.formattedCurrentAmount} achieved</span>
                  <span className="text-[#101010] font-bold">{g.progressPercentage}%</span>
                </div>
                <div className="h-4 w-full border border-[#101010] bg-[#FAF9F6] overflow-hidden">
                  <div
                    style={{ width: `${g.progressPercentage}%` }}
                    className="h-full bg-[#101010]"
                  />
                </div>
                <div className="flex justify-between font-mono text-[10px] text-[#85827B] pt-1">
                  <span>Target: {g.formattedTargetAmount}</span>
                  <span>Target Date: {g.targetDate}</span>
                </div>
              </div>

              {/* Contributors */}
              <div className="pt-3 border-t border-[#101010]/15 font-mono text-xs text-[#85827B]">
                <span>CONTRIBUTORS: </span>
                <span className="text-[#101010] font-semibold">
                  {g.contributors.map((c) => `${c.memberName} (${c.formattedContributed})`).join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. DETERMINISTIC SCENARIO SIMULATOR (DARK RECTANGULAR TERMINAL) */}
      <div className="border border-[#101010] bg-[#101010] text-[#F0EDE5] p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-[#2A2925] pb-4">
          <Terminal className="w-5 h-5 text-[#B6A68A]" />
          <div>
            <h3 className="font-mono text-sm uppercase tracking-wider text-[#F0EDE5] font-semibold">
              SCENARIO SIMULATION TERMINAL // DETERMINISTIC COMPOUND ENGINE
            </h3>
            <p className="font-mono text-[11px] text-[#B6A68A] mt-0.5">
              Pure mathematical simulation modeling nominal growth and inflation-discounted real wealth. Informational only.
            </p>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#B6A68A] mb-1">
              Baseline Capital (₹)
            </label>
            <input
              type="number"
              value={startingWealthRupees}
              onChange={(e) => setStartingWealthRupees(e.target.value)}
              className="w-full bg-[#070707] border border-[#2A2925] px-3 py-2 font-mono text-xs text-[#F0EDE5] focus:outline-none focus:border-[#B6A68A]"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#B6A68A] mb-1">
              Monthly Inflow (₹)
            </label>
            <input
              type="number"
              value={monthlySavingsRupees}
              onChange={(e) => setMonthlySavingsRupees(e.target.value)}
              className="w-full bg-[#070707] border border-[#2A2925] px-3 py-2 font-mono text-xs text-[#F0EDE5] focus:outline-none focus:border-[#B6A68A]"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#B6A68A] mb-1">
              Expected Return (% p.a.)
            </label>
            <input
              type="number"
              step="0.5"
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(e.target.value)}
              className="w-full bg-[#070707] border border-[#2A2925] px-3 py-2 font-mono text-xs text-[#F0EDE5] focus:outline-none focus:border-[#B6A68A]"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#B6A68A] mb-1">
              Inflation Rate (% p.a.)
            </label>
            <input
              type="number"
              step="0.5"
              value={inflationRate}
              onChange={(e) => setInflationRate(e.target.value)}
              className="w-full bg-[#070707] border border-[#2A2925] px-3 py-2 font-mono text-xs text-[#F0EDE5] focus:outline-none focus:border-[#B6A68A]"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#B6A68A] mb-1">
              Time Horizon
            </label>
            <select
              value={projectionYears}
              onChange={(e) => setProjectionYears(e.target.value)}
              className="w-full bg-[#070707] border border-[#2A2925] px-3 py-2 font-mono text-xs text-[#F0EDE5] focus:outline-none focus:border-[#B6A68A]"
            >
              <option value="5">5 Years</option>
              <option value="10">10 Years</option>
              <option value="15">15 Years</option>
              <option value="20">20 Years</option>
            </select>
          </div>
        </div>

        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className="px-6 py-3 bg-[#263B35] text-[#FAF9F6] hover:bg-[#314C44] font-mono text-xs uppercase tracking-wider font-semibold border border-[#263B35] transition-colors flex items-center gap-2"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isSimulating ? 'Computing Model...' : 'Execute Simulation Model'}</span>
        </button>

        {/* Simulation Output Presentation */}
        {simResult && (
          <div className="pt-6 border-t border-[#2A2925] space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-[#070707] border border-[#2A2925] space-y-1">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#B6A68A]">
                  NOMINAL PROJECTED CAPITAL
                </div>
                <div className="font-serif text-3xl font-normal text-[#F0EDE5]">
                  {simResult.formattedProjectedNetWorth}
                </div>
                <div className="font-mono text-xs text-[#263B35]">
                  +{simResult.formattedNetGain} cumulative gain
                </div>
              </div>

              <div className="p-5 bg-[#070707] border border-[#2A2925] space-y-1">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#B6A68A]">
                  REAL PURCHASING POWER (INFLATION DISCOUNTED)
                </div>
                <div className="font-serif text-3xl font-normal text-[#B6A68A]">
                  {simResult.formattedInflationAdjusted}
                </div>
                <div className="font-mono text-xs text-[#85827B]">
                  At {inflationRate}% annual compounding inflation
                </div>
              </div>

              <div className="p-5 bg-[#070707] border border-[#2A2925] space-y-1">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#B6A68A]">
                  COMPOUNDING HORIZON
                </div>
                <div className="font-serif text-3xl font-normal text-[#F0EDE5]">
                  {simResult.projectionYears} Years
                </div>
                <div className="font-mono text-xs text-[#85827B]">
                  Formula: P(1+r)^t + PMT[((1+r)^t - 1)/r]
                </div>
              </div>
            </div>

            {/* Assumptions explicitly stated */}
            <div className="p-4 bg-[#070707] border border-[#2A2925] space-y-1.5 font-mono text-xs text-[#85827B]">
              <div className="text-[10px] uppercase tracking-wider text-[#F0EDE5]">Stated Model Assumptions:</div>
              {simResult.assumptionsStated.map((assump, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#B6A68A]" />
                  <span>{assump}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
