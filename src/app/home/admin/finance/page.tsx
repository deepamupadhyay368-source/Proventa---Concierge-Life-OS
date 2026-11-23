'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  IndianRupee, 
  ArrowLeft, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  PieChart, 
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { HomePricingEngine } from '@/lib/home/pricing-engine';

export default function AdminFinancePage() {
  const [scenario, setScenario] = useState<'LOW_UTILISATION' | 'EXPECTED_UTILISATION' | 'HIGH_UTILISATION'>('EXPECTED_UTILISATION');

  const currentResult = HomePricingEngine.runScenario(scenario);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DFD5] pb-6">
        <div>
          <Link href="/home/admin" className="text-xs text-[#53634A] font-semibold flex items-center gap-1 mb-2 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Operations Overview
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-[#171A17]">Unit Economics & Margin Simulator</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              Live Model
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Simulates monthly cohort profitability (1,000 Essential, 1,500 Family, 500 Premium members) under varying visit burnout rates.
          </p>
        </div>

        {/* Scenario Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold shrink-0">
          <button
            onClick={() => setScenario('LOW_UTILISATION')}
            className={`px-3 py-1.5 rounded-lg transition ${scenario === 'LOW_UTILISATION' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'}`}
          >
            Low
          </button>
          <button
            onClick={() => setScenario('EXPECTED_UTILISATION')}
            className={`px-3 py-1.5 rounded-lg transition ${scenario === 'EXPECTED_UTILISATION' ? 'bg-[#53634A] text-white shadow-xs' : 'text-stone-500'}`}
          >
            Expected (Baseline)
          </button>
          <button
            onClick={() => setScenario('HIGH_UTILISATION')}
            className={`px-3 py-1.5 rounded-lg transition ${scenario === 'HIGH_UTILISATION' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-500'}`}
          >
            High (Stress Test)
          </button>
        </div>
      </div>

      {/* Summary Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Gross Subscription Revenue</span>
          <div className="text-3xl font-bold text-[#171A17]">₹{(currentResult.blendedMonthlyRevenue / 100000).toFixed(2)}L</div>
          <div className="text-xs text-stone-500">3,000 active subscriber cohort</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Variable Fulfillment Cost</span>
          <div className="text-3xl font-bold text-stone-800">₹{(currentResult.blendedVariableCost / 100000).toFixed(2)}L</div>
          <div className="text-xs text-stone-500">Payouts, GST, PG, support & rework</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Contribution Margin (INR)</span>
          <div className={`text-3xl font-bold ${currentResult.isViableOverall ? 'text-[#53634A]' : 'text-rose-600'}`}>
            ₹{(currentResult.blendedContributionMarginAmount / 100000).toFixed(2)}L
          </div>
          <div className="text-xs text-stone-500">Net retained cash before fixed tech overhead</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Contribution Margin %</span>
          <div className={`text-3xl font-bold ${currentResult.blendedContributionMarginPercent > 20 ? 'text-emerald-700' : 'text-amber-700'}`}>
            {currentResult.blendedContributionMarginPercent}%
          </div>
          <div className="text-xs text-stone-500">
            {currentResult.isViableOverall ? '✓ Commercially healthy' : '⚠ Margin deficit'}
          </div>
        </div>
      </div>

      {/* Breakdown by Subscription Tier */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#171A17]">Tier Economics ({currentResult.label})</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['ESSENTIAL', 'FAMILY', 'PREMIUM'] as const).map(tier => {
            const sim = currentResult.simulations[tier];
            return (
              <div key={tier} className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E3DFD5] shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <h3 className="font-bold text-lg text-[#171A17]">{tier}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      ₹{sim.monthlySubscriptionPrice}/mo
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Simulated Cohort Size:</span>
                      <strong className="text-stone-900">{sim.projectedSubscribers} homes</strong>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Avg. Visits Burn / Month:</span>
                      <strong className="text-[#53634A]">{sim.averageVisitsUsedPerMonth} visits</strong>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Direct Technician Costs:</span>
                      <span>₹{sim.directTechnicianCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>GST (18%) + Gateway (2%):</span>
                      <span>₹{(sim.gstTaxDeduction + sim.paymentGatewayFee).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Support & Warranty Reserve:</span>
                      <span>₹{(sim.customerSupportAndCoordinationCost + sim.disputeAndReworkCostReserve).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-700">Contribution Margin:</span>
                    <span className={`font-bold text-sm ${sim.isProfitable ? 'text-emerald-700' : 'text-rose-600'}`}>
                      ₹{sim.contributionMarginAmount.toLocaleString()} ({sim.contributionMarginPercent}%)
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Break-even point: <strong>{sim.breakEvenVisitsPerMonth} visits/mo</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strategic Observations */}
      <div className="bg-stone-50 rounded-3xl p-6 sm:p-8 border border-stone-200 space-y-3">
        <h4 className="font-bold text-sm text-[#171A17] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#53634A]" />
          <span>Key Commercial Findings for Ahmedabad Launch</span>
        </h4>
        <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
          <li>
            • <strong>Family Plan (₹599/mo)</strong> provides the optimal blend of household value and platform profitability, generating ~32% contribution margin under expected 1.3 visits/mo utilization.
          </li>
          <li>
            • <strong>Emergency SLA buffer</strong> is protected because technician payouts are fixed at ₹350 standard, allowing predictable cost modeling without volatile surge fees.
          </li>
          <li>
            • <strong>Annual subscriptions</strong> with 20% discount lock in positive annual cash flow upfront while reducing churn below 3% in Indian residential societies.
          </li>
        </ul>
      </div>

    </div>
  );
}
