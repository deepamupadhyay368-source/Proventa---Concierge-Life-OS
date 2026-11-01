'use client';

import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Plus,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Lock,
  X,
  FileText,
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
      <div className="flex items-center justify-center min-h-[300px] text-xs font-mono text-[#A78BFA]">
        Loading Family Protection &amp; Coverage Registers...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A78BFA] mb-1">
            FAMILY WEALTH OS // PROTECTION REGISTER
          </div>
          <h1 className="font-serif text-3xl text-white">Family Protection &amp; Coverage</h1>
          <p className="text-xs text-[#9D8BC9] font-light mt-1">
            Life term, health floater, property, and vehicle policies with renewal reminders and nominee records.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#7C3AED] hover:bg-[#8B5CF6] transition-all shadow-md shadow-[#7C3AED]/25"
        >
          <Plus className="w-4 h-4" />
          <span>Record Insurance Policy</span>
        </button>
      </div>

      {/* Statutory Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-[#0E1322] border border-[#1E293B] text-xs text-[#9D8BC9] flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
        <span>
          <strong>Informational &amp; Administrative Scope:</strong> PROVENTA provides digital recordkeeping and renewal reminders only. We do not sell insurance, solicit policies, or provide personalized insurance distribution.
        </span>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#9D8BC9]">
              Total Life Term Sum Assured
            </div>
            <div className="text-2xl font-serif text-white font-bold mt-2">
              {summary.formattedLifeCover}
            </div>
            <div className="text-xs text-[#10B981] mt-2">Pure term protection coverage</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#9D8BC9]">
              Total Family Health Floater
            </div>
            <div className="text-2xl font-serif text-white font-bold mt-2">
              {summary.formattedHealthCover}
            </div>
            <div className="text-xs text-[#9D8BC9] mt-2">Hospitalization &amp; critical buffer</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#9D8BC9]">
              Annual Premium Commitment
            </div>
            <div className="text-2xl font-serif text-white font-bold mt-2">
              {summary.formattedAnnualPremiums}
            </div>
            <div className="text-xs text-[#9D8BC9] mt-2">Across all active family policies</div>
          </div>
        </div>
      )}

      {/* Policies Table */}
      <div className="rounded-2xl bg-[#0E1322] border border-[#1E293B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070A12] border-b border-[#1E293B] text-[10px] font-mono uppercase tracking-wider text-[#9D8BC9]">
              <tr>
                <th className="py-3 px-4">Policy &amp; Insurer</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Policyholder</th>
                <th className="py-3 px-4">Sum Assured</th>
                <th className="py-3 px-4">Annual Premium</th>
                <th className="py-3 px-4">Next Renewal</th>
                <th className="py-3 px-4">Nominee Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-white">
              {policies.map((p) => (
                <tr key={p.id} className="hover:bg-[#1E1035]/30 transition-colors">
                  <td className="py-4 px-4 font-semibold text-white">
                    <div>{p.insurerName}</div>
                    <div className="text-[10px] text-[#9D8BC9] font-mono">{p.policyNumberMasked}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1E1035] text-[#DDD0F7] border border-[#3E236E]">
                      {p.policyType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-white font-medium">{p.policyholderName}</td>
                  <td className="py-4 px-4 font-serif text-base font-bold text-white">
                    {p.formattedSumAssured}
                  </td>
                  <td className="py-4 px-4 text-white font-mono">{p.formattedPremium}</td>
                  <td className="py-4 px-4">
                    <div className="text-white font-mono">{p.renewalDate}</div>
                    <span className="text-[10px] text-[#10B981] font-mono">Active</span>
                  </td>
                  <td className="py-4 px-4 text-[11px] text-[#9D8BC9]">
                    {p.nominees.map((n) => `${n.name} (${n.sharePercentage}%)`).join(', ') || 'Self'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD POLICY MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0E1322] border border-[#3E236E] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <h3 className="text-base font-semibold text-white">Record Family Policy</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-[#9D8BC9] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Insurer Name</label>
                <input
                  type="text"
                  required
                  value={insurerName}
                  onChange={(e) => setInsurerName(e.target.value)}
                  placeholder="e.g. HDFC Life or Care Health"
                  className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Policy Type</label>
                  <select
                    value={policyType}
                    onChange={(e) => setPolicyType(e.target.value as InsuranceType)}
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="LIFE_TERM">Term Life</option>
                    <option value="HEALTH_FAMILY_FLOATER">Health Family Floater</option>
                    <option value="VEHICLE_MOTOR">Motor Vehicle</option>
                    <option value="PROPERTY_HOME">Home / Property</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Policyholder</label>
                  <input
                    type="text"
                    value={policyholderName}
                    onChange={(e) => setPolicyholderName(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Sum Assured (₹)</label>
                  <input
                    type="number"
                    required
                    value={sumAssuredRupees}
                    onChange={(e) => setSumAssuredRupees(e.target.value)}
                    placeholder="e.g. 100000000 for 10 Cr"
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Annual Premium (₹)</label>
                  <input
                    type="number"
                    value={premiumRupees}
                    onChange={(e) => setPremiumRupees(e.target.value)}
                    placeholder="e.g. 145000"
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Next Renewal Date</label>
                <input
                  type="date"
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="pt-3 border-t border-[#1E293B] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[#9D8BC9] hover:bg-[#1E1035]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#7C3AED] hover:bg-[#8B5CF6]"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
