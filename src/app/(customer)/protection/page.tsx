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
      <div className="flex items-center justify-center min-h-[400px] border border-[#101010] bg-[#FAF9F6] p-8 font-mono text-xs uppercase tracking-widest text-[#101010]">
        Loading Protection &amp; Coverage Registers...
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* 1. INSTITUTIONAL HEADER & PROTECTION BANNER */}
      <div className="border border-[#101010] bg-[#FAF9F6]">
        <div className="p-6 sm:p-8 border-b border-[#101010] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#85827B]">
              08 // FAMILY PROTECTION &amp; RISK MANAGEMENT
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl text-[#101010] tracking-tight mt-1">
              Coverage &amp; Policy Register
            </h1>
            <p className="font-sans text-xs text-[#85827B] mt-2 max-w-xl">
              Centralized record of pure term life protection, comprehensive family health floaters, physical property coverage, and automobile policies with exact renewal countdown schedules.
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-5 py-3 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] font-mono text-xs uppercase tracking-wider font-semibold border border-[#101010] transition-colors flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Record Insurance Policy</span>
          </button>
        </div>

        {/* Regulatory Disclaimer Banner */}
        <div className="p-4 bg-[#F0EDE5] border-b border-[#101010] flex items-center gap-3 font-mono text-xs text-[#101010]">
          <ShieldCheck className="w-4 h-4 text-[#263B35] shrink-0" />
          <span>
            <strong>INFORMATIONAL RECORDKEEPING STANDARD:</strong> PROVENTA provides digital recordkeeping, nominee tracking, and renewal alerts. We do not sell insurance, solicit policies, or provide regulated distribution.
          </span>
        </div>

        {/* Coverage Metrics Strip */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#101010] bg-[#FAF9F6]">
            <div className="p-5 space-y-1">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
                TOTAL PURE TERM LIFE SUM ASSURED
              </div>
              <div className="font-serif text-2xl text-[#263B35]">
                {summary.formattedLifeCover}
              </div>
              <div className="font-mono text-[10px] text-[#85827B]">
                Protection against primary earner mortality
              </div>
            </div>

            <div className="p-5 space-y-1">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
                FAMILY HEALTH FLOATER BUFFER
              </div>
              <div className="font-serif text-2xl text-[#101010]">
                {summary.formattedHealthCover}
              </div>
              <div className="font-mono text-[10px] text-[#85827B]">
                Critical illness &amp; inpatient hospitalisation
              </div>
            </div>

            <div className="p-5 space-y-1">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
                ANNUAL PREMIUM COMMITMENT
              </div>
              <div className="font-serif text-2xl text-[#101010]">
                {summary.formattedAnnualPremiums}
              </div>
              <div className="font-mono text-[10px] text-[#85827B]">
                Across all active family policy instruments
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. ARCHITECTURAL POLICY TABLE */}
      <div className="border border-[#101010] bg-[#FAF9F6] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#101010] text-[#F0EDE5] font-mono text-[10px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 border-b border-[#101010]">Policy &amp; Underwriting Carrier</th>
              <th className="py-3 px-4 border-b border-[#101010]">Category</th>
              <th className="py-3 px-4 border-b border-[#101010]">Insured Life / Asset</th>
              <th className="py-3 px-4 border-b border-[#101010]">Sum Assured</th>
              <th className="py-3 px-4 border-b border-[#101010]">Annual Premium</th>
              <th className="py-3 px-4 border-b border-[#101010]">Next Renewal</th>
              <th className="py-3 px-4 border-b border-[#101010]">Nominee Allocation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#101010] text-[#101010]">
            {policies.map((p, idx) => (
              <tr key={p.id} className="hover:bg-[#F0EDE5] transition-colors">
                <td className="py-4 px-4 font-mono">
                  <div className="text-[10px] text-[#85827B]">POL-0{idx + 1}</div>
                  <div className="font-serif text-base text-[#101010] font-normal">{p.insurerName}</div>
                  <div className="font-mono text-[10px] text-[#85827B] mt-0.5">{p.policyNumberMasked}</div>
                </td>
                <td className="py-4 px-4 font-mono text-xs">
                  <span className="px-2 py-0.5 border border-[#101010] bg-[#FAF9F6] uppercase text-[10px]">
                    {p.policyType.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-4 font-mono text-xs font-semibold">{p.policyholderName}</td>
                <td className="py-4 px-4 font-serif text-base text-[#263B35] font-normal">
                  {p.formattedSumAssured}
                </td>
                <td className="py-4 px-4 font-mono text-xs">{p.formattedPremium}</td>
                <td className="py-4 px-4 font-mono text-xs">
                  <div>{p.renewalDate}</div>
                  <span className="text-[9px] uppercase tracking-widest text-[#263B35] font-semibold">Active // In Force</span>
                </td>
                <td className="py-4 px-4 font-mono text-xs text-[#85827B]">
                  {p.nominees.map((n) => `${n.name} (${n.sharePercentage}%)`).join(', ') || 'Direct Nominee'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. RECORD POLICY MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101010]/75">
          <div className="w-full max-w-md bg-[#FAF9F6] border border-[#101010] p-6 space-y-4 shadow-[8px_8px_0px_0px_#101010]">
            <div className="flex items-center justify-between pb-3 border-b border-[#101010]">
              <h3 className="font-serif text-xl text-[#101010]">Record Insurance Policy</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-[#101010] hover:bg-[#F0EDE5] p-1 border border-[#101010]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                  Insurer / Underwriter Name
                </label>
                <input
                  type="text"
                  required
                  value={insurerName}
                  onChange={(e) => setInsurerName(e.target.value)}
                  placeholder="e.g. HDFC Life or ICICI Lombard"
                  className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                    Coverage Type
                  </label>
                  <select
                    value={policyType}
                    onChange={(e) => setPolicyType(e.target.value as InsuranceType)}
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                  >
                    <option value="LIFE_TERM">Term Life</option>
                    <option value="HEALTH_FAMILY_FLOATER">Health Family Floater</option>
                    <option value="VEHICLE_MOTOR">Motor Vehicle</option>
                    <option value="PROPERTY_HOME">Home / Property</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                    Insured Life / Titleholder
                  </label>
                  <input
                    type="text"
                    value={policyholderName}
                    onChange={(e) => setPolicyholderName(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                    Sum Assured (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={sumAssuredRupees}
                    onChange={(e) => setSumAssuredRupees(e.target.value)}
                    placeholder="e.g. 100000000"
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                    Annual Premium (₹)
                  </label>
                  <input
                    type="number"
                    value={premiumRupees}
                    onChange={(e) => setPremiumRupees(e.target.value)}
                    placeholder="e.g. 145000"
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                  Next Renewal Date
                </label>
                <input
                  type="date"
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#101010] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-[#101010] font-mono text-xs uppercase text-[#101010] hover:bg-[#F0EDE5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] font-mono text-xs uppercase tracking-wider font-semibold border border-[#101010]"
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
