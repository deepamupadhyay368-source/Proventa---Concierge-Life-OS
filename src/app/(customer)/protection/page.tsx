'use client';

import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Calendar,
  X,
} from 'lucide-react';
import { InsurancePolicyDTO, InsuranceType } from '@/lib/wealth/types';

export default function ProtectionPage() {
  const [policies, setPolicies] = useState<InsurancePolicyDTO[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state
  const [insurerName, setInsurerName] = useState('HDFC Life');
  const [policyType, setPolicyType] = useState<InsuranceType>('LIFE_TERM');
  const [sumAssuredRupees, setSumAssuredRupees] = useState('');
  const [premiumRupees, setPremiumRupees] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [policyholderName, setPolicyholderName] = useState('Rajesh Sharma');

  async function loadProtection() {
    setLoading(true);
    try {
      const res = await fetch('/api/wealth/protection?workspaceId=fam_sharma_heritage');
      const json = await res.json();
      if (json.success && json.data) {
        setPolicies(json.data.policies || []);
        setSummary(json.data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProtection();
  }, []);

  async function handleCreatePolicy(e: React.FormEvent) {
    e.preventDefault();
    if (!insurerName || !sumAssuredRupees) return;

    try {
      const res = await fetch('/api/wealth/protection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insurerName,
          policyType,
          sumAssuredRupees: parseFloat(sumAssuredRupees),
          premiumAmountRupees: parseFloat(premiumRupees || '0'),
          renewalDate: renewalDate || new Date().toISOString().split('T')[0],
          policyholderName,
        }),
      });

      if (res.ok) {
        setIsAddOpen(false);
        setSumAssuredRupees('');
        setPremiumRupees('');
        await loadProtection();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] border border-[#252C38] bg-[#171C26] p-8 font-mono text-xs uppercase tracking-widest text-[#7595FF] rounded-[2px]">
        Loading Protection &amp; Coverage Registers...
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* 1. TITANIUM COBALT HEADER & PROTECTION BANNER */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="p-6 sm:p-8 border-b border-[#252C38] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7595FF] font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#2457FF]" />
              <span>08 // FAMILY PROTECTION &amp; RISK MANAGEMENT</span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#F4F6FA] tracking-tight mt-1">
              Coverage &amp; Policy Register
            </h1>
            <p className="font-sans text-xs text-[#C5CAD3] mt-2 max-w-xl">
              Centralized record of pure term life protection, comprehensive family health floaters, physical property coverage, and automobile policies with exact renewal countdown schedules.
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-5 py-3 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] font-mono text-xs uppercase tracking-wider font-semibold border border-[#7595FF]/40 rounded-[2px] shadow-[0_0_15px_rgba(36,87,255,0.3)] transition-all flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Record Insurance Policy</span>
          </button>
        </div>

        {/* Regulatory Disclaimer Banner */}
        <div className="p-4 bg-[#090B10] border-b border-[#252C38] flex items-center gap-3 font-mono text-xs text-[#C5CAD3]">
          <ShieldCheck className="w-4 h-4 text-[#7595FF] shrink-0" />
          <span>
            <strong className="text-[#F4F6FA]">INFORMATIONAL RECORDKEEPING STANDARD:</strong> PROVENTA provides digital recordkeeping, nominee tracking, and renewal alerts. We do not sell insurance, solicit policies, or provide regulated distribution.
          </span>
        </div>

        {/* Coverage Metrics Strip */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#252C38] bg-[#090B10]">
            <div className="p-5 space-y-1">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
                TOTAL PURE TERM LIFE SUM ASSURED
              </div>
              <div className="font-display font-bold text-2xl text-[#7595FF]">
                {summary.formattedLifeCover}
              </div>
              <div className="font-mono text-[10px] text-[#C5CAD3]">
                Protection against primary earner mortality
              </div>
            </div>

            <div className="p-5 space-y-1">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
                FAMILY HEALTH FLOATER BUFFER
              </div>
              <div className="font-display font-bold text-2xl text-[#F4F6FA]">
                {summary.formattedHealthCover}
              </div>
              <div className="font-mono text-[10px] text-[#C5CAD3]">
                Critical illness &amp; inpatient hospitalisation
              </div>
            </div>

            <div className="p-5 space-y-1">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
                ANNUAL PREMIUM COMMITMENT
              </div>
              <div className="font-display font-bold text-2xl text-[#F4F6FA]">
                {summary.formattedAnnualPremiums}
              </div>
              <div className="font-mono text-[10px] text-[#C5CAD3]">
                Across all active family policy instruments
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. TITANIUM POLICY TABLE */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] overflow-x-auto shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#090B10] text-[#7595FF] font-mono text-[10px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 border-b border-[#252C38]">Policy &amp; Underwriting Carrier</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Category</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Insured Life / Asset</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Sum Assured</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Annual Premium</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Next Renewal</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Nominee Allocation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252C38] text-[#F4F6FA]">
            {policies.map((p, idx) => (
              <tr key={p.id} className="hover:bg-[#1C2230] transition-colors">
                <td className="py-4 px-4 font-mono">
                  <div className="text-[10px] text-[#7595FF] font-semibold">POL-0{idx + 1}</div>
                  <div className="font-display font-bold text-base text-[#F4F6FA]">{p.insurerName}</div>
                  <div className="font-mono text-[10px] text-[#858D9B] mt-0.5">{p.policyNumberMasked}</div>
                </td>
                <td className="py-4 px-4 font-mono text-xs">
                  <span className="px-2 py-0.5 border border-[#252C38] bg-[#090B10] text-[#C5CAD3] rounded-[2px] uppercase text-[10px]">
                    {p.policyType.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-4 font-mono text-xs font-semibold text-[#F4F6FA]">{p.policyholderName}</td>
                <td className="py-4 px-4 font-display font-bold text-base text-[#7595FF]">
                  {p.formattedSumAssured}
                </td>
                <td className="py-4 px-4 font-mono text-xs text-[#F4F6FA]">{p.formattedPremium}</td>
                <td className="py-4 px-4 font-mono text-xs">
                  <div className="text-[#F4F6FA]">{p.renewalDate}</div>
                  <span className="text-[9px] uppercase tracking-widest text-[#7595FF] font-semibold">Active // In Force</span>
                </td>
                <td className="py-4 px-4 font-mono text-xs text-[#C5CAD3]">
                  {p.nominees.map((n) => `${n.name} (${n.sharePercentage}%)`).join(', ') || 'Direct Nominee'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. RECORD POLICY MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090B10]/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#171C26] border border-[#252C38] p-6 space-y-4 rounded-[2px] shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#252C38]">
              <h3 className="font-display font-bold text-xl text-[#F4F6FA]">Record Insurance Policy</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] p-1 border border-[#252C38] rounded-[2px]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                  Insurer / Underwriter Name
                </label>
                <input
                  type="text"
                  required
                  value={insurerName}
                  onChange={(e) => setInsurerName(e.target.value)}
                  placeholder="e.g. HDFC Life or ICICI Lombard"
                  className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                  Policy Category
                </label>
                <select
                  value={policyType}
                  onChange={(e) => setPolicyType(e.target.value as InsuranceType)}
                  className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                >
                  <option value="LIFE_TERM">Pure Term Life Protection</option>
                  <option value="HEALTH_INDIVIDUAL">Individual Health Insurance</option>
                  <option value="HEALTH_FLOATER">Family Health Floater</option>
                  <option value="PROPERTY">Residential / Commercial Property</option>
                  <option value="MOTOR">Motor / Automobile</option>
                  <option value="LIABILITY">Professional / Director Liability</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                    Sum Assured (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={sumAssuredRupees}
                    onChange={(e) => setSumAssuredRupees(e.target.value)}
                    placeholder="e.g. 50000000"
                    className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                    Annual Premium (₹)
                  </label>
                  <input
                    type="number"
                    value={premiumRupees}
                    onChange={(e) => setPremiumRupees(e.target.value)}
                    placeholder="e.g. 85000"
                    className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                    Policyholder Name
                  </label>
                  <input
                    type="text"
                    value={policyholderName}
                    onChange={(e) => setPolicyholderName(e.target.value)}
                    className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                    Next Renewal Date
                  </label>
                  <input
                    type="date"
                    value={renewalDate}
                    onChange={(e) => setRenewalDate(e.target.value)}
                    className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#252C38] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-[#252C38] font-mono text-xs uppercase text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] rounded-[2px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] font-mono text-xs uppercase tracking-wider font-semibold border border-[#7595FF]/40 rounded-[2px] shadow-[0_0_12px_rgba(36,87,255,0.3)]"
                >
                  Commit Policy to Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
