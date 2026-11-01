'use client';

import { useEffect, useState } from 'react';
import {
  Target,
  Sparkles,
  TrendingUp,
  Plus,
  Play,
  Calendar,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  X,
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A78BFA] mb-1">
            FAMILY WEALTH OS // GOALS &amp; SCENARIOS
          </div>
          <h1 className="font-serif text-3xl text-white">Family Goals &amp; Scenarios</h1>
          <p className="text-xs text-[#9D8BC9] font-light mt-1">
            Milestone tracking and deterministic mathematical forward simulations with inflation adjustment.
          </p>
        </div>
      </div>

      {/* 1. ACTIVE GOALS PROGRESS */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
          Active Family Milestones
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => (
            <div
              key={g.id}
              className="p-6 rounded-2xl bg-[#0E1322] border border-[#1E293B] space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E1035] text-[#DDD0F7] border border-[#3E236E]">
                    {g.category.replace('_', ' ')}
                  </span>
                  <h3 className="font-semibold text-white text-base mt-2">{g.title}</h3>
                </div>
                <span className="text-xs font-mono text-[#10B981] font-bold px-2 py-0.5 rounded bg-[#064E3B]/40 border border-[#10B981]/30">
                  {g.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#9D8BC9]">{g.formattedCurrentAmount} achieved</span>
                  <span className="text-white font-bold">{g.progressPercentage}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#1E293B] overflow-hidden">
                  <div
                    style={{ width: `${g.progressPercentage}%` }}
                    className="h-full bg-gradient-to-r from-[#7C3AED] to-[#10B981] rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#64748B] font-mono pt-1">
                  <span>Target: {g.formattedTargetAmount}</span>
                  <span>Target Date: {g.targetDate}</span>
                </div>
              </div>

              {/* Contributors */}
              <div className="pt-3 border-t border-[#1E293B] text-xs text-[#9D8BC9]">
                <span>Contributors: </span>
                <span className="text-white">
                  {g.contributors.map((c) => `${c.memberName} (${c.formattedContributed})`).join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. DETERMINISTIC SCENARIO SIMULATOR */}
      <div className="p-6 rounded-2xl bg-[#0E1322] border border-[#2D1854] space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#A78BFA]" />
          <div>
            <h3 className="text-base font-semibold text-white">Hypothetical Scenario Simulator</h3>
            <p className="text-xs text-[#9D8BC9] font-light">
              Deterministic compound calculation with inflation adjustments. Purely mathematical; not investment advice.
            </p>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-[#9D8BC9] mb-1 font-mono">
              Baseline Wealth (₹)
            </label>
            <input
              type="number"
              value={startingWealthRupees}
              onChange={(e) => setStartingWealthRupees(e.target.value)}
              className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#9D8BC9] mb-1 font-mono">
              Monthly Savings (₹)
            </label>
            <input
              type="number"
              value={monthlySavingsRupees}
              onChange={(e) => setMonthlySavingsRupees(e.target.value)}
              className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#9D8BC9] mb-1 font-mono">
              Hypothetical Return (% p.a.)
            </label>
            <input
              type="number"
              step="0.5"
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(e.target.value)}
              className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#9D8BC9] mb-1 font-mono">
              Inflation Rate (% p.a.)
            </label>
            <input
              type="number"
              step="0.5"
              value={inflationRate}
              onChange={(e) => setInflationRate(e.target.value)}
              className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#9D8BC9] mb-1 font-mono">
              Projection Horizon
            </label>
            <select
              value={projectionYears}
              onChange={(e) => setProjectionYears(e.target.value)}
              className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
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
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#7C3AED] hover:bg-[#8B5CF6] transition-all shadow-md shadow-[#7C3AED]/25"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>{isSimulating ? 'Computing...' : 'Recalculate Scenario'}</span>
        </button>

        {/* Output Presentation */}
        {simResult && (
          <div className="pt-6 border-t border-[#1E293B] space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E293B]">
                <div className="text-[10px] text-[#9D8BC9] uppercase font-mono">Projected Nominal Wealth</div>
                <div className="text-2xl font-serif font-bold text-white mt-1">
                  {simResult.formattedProjectedNetWorth}
                </div>
                <div className="text-xs text-[#10B981] mt-1 font-mono">
                  +{simResult.formattedNetGain} cumulative gain
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E293B]">
                <div className="text-[10px] text-[#9D8BC9] uppercase font-mono">Inflation-Adjusted Purchasing Power</div>
                <div className="text-2xl font-serif font-bold text-[#DDD0F7] mt-1">
                  {simResult.formattedInflationAdjusted}
                </div>
                <div className="text-xs text-[#9D8BC9] mt-1 font-mono">
                  At {inflationRate}% compounding annual inflation
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E293B]">
                <div className="text-[10px] text-[#9D8BC9] uppercase font-mono">Simulation Horizon</div>
                <div className="text-2xl font-serif font-bold text-white mt-1">
                  {simResult.projectionYears} Years
                </div>
                <div className="text-xs text-[#A78BFA] mt-1 font-mono">
                  Deterministic compound schedule
                </div>
              </div>
            </div>

            {/* Assumptions explicitly stated */}
            <div className="p-4 rounded-xl bg-[#070A12] border border-[#1E293B] space-y-1.5 text-xs text-[#9D8BC9]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-white">Stated Mathematical Assumptions:</div>
              {simResult.assumptionsStated.map((assump, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
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
