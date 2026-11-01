'use client';

import { useEffect, useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  X,
  AlertTriangle,
  Calendar,
  Building,
} from 'lucide-react';
import { LiabilityDTO, LiabilityType } from '@/lib/wealth/types';

export default function LiabilitiesPage() {
  const [liabilities, setLiabilities] = useState<LiabilityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [lenderName, setLenderName] = useState('HDFC Bank');
  const [liabilityType, setLiabilityType] = useState<LiabilityType>('HOME_LOAN');
  const [originalRupees, setOriginalRupees] = useState('');
  const [balanceRupees, setBalanceRupees] = useState('');
  const [emiRupees, setEmiRupees] = useState('');
  const [interestRate, setInterestRate] = useState('8.5');
  const [maturityDate, setMaturityDate] = useState('');
  const [primaryBorrowerName, setPrimaryBorrowerName] = useState('Rajesh Sharma');
  const [ownershipPct, setOwnershipPct] = useState('100');

  async function loadLiabilities() {
    setLoading(true);
    try {
      const res = await fetch('/api/wealth/liabilities?workspaceId=fam_sharma_heritage');
      const json = await res.json();
      if (json.success) {
        setLiabilities(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLiabilities();
  }, []);

  async function handleCreateLiability(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !balanceRupees) return;

    try {
      const res = await fetch('/api/wealth/liabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          lenderName,
          liabilityType,
          originalPrincipalRupees: parseFloat(originalRupees || balanceRupees),
          outstandingBalanceRupees: parseFloat(balanceRupees),
          emiRupees: emiRupees ? parseFloat(emiRupees) : null,
          interestRateAnnual: parseFloat(interestRate),
          maturityDate,
          primaryBorrowerName,
          borrowerOwnershipPercentage: parseFloat(ownershipPct),
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setName('');
        setOriginalRupees('');
        setBalanceRupees('');
        setEmiRupees('');
        await loadLiabilities();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to remove this liability record?')) return;
    try {
      const res = await fetch(`/api/wealth/liabilities?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadLiabilities();
      }
    } catch (err) {
      console.error(err);
    }
  }

  const totalOutstanding = liabilities.reduce((sum, l) => sum + l.outstandingBalancePaise, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A78BFA] mb-1">
            FAMILY WEALTH OS // LIABILITIES REGISTER
          </div>
          <h1 className="font-serif text-3xl text-white">Liabilities &amp; Debt Register</h1>
          <p className="text-xs text-[#9D8BC9] font-light mt-1">
            Home mortgages, automobile loans, credit facilities, and personal obligations with interest &amp; EMI schedules.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#7C3AED] hover:bg-[#8B5CF6] transition-all shadow-md shadow-[#7C3AED]/25"
        >
          <Plus className="w-4 h-4" />
          <span>Record Liability</span>
        </button>
      </div>

      {/* Liabilities Table */}
      <div className="rounded-2xl bg-[#0E1322] border border-[#1E293B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070A12] border-b border-[#1E293B] text-[10px] font-mono uppercase tracking-wider text-[#9D8BC9]">
              <tr>
                <th className="py-3 px-4">Facility &amp; Lender</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Borrower &amp; Share</th>
                <th className="py-3 px-4">Outstanding Balance</th>
                <th className="py-3 px-4">Monthly EMI</th>
                <th className="py-3 px-4">Rate &amp; Maturity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-white">
              {liabilities.map((l) => (
                <tr key={l.id} className="hover:bg-[#1E1035]/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-semibold text-white">{l.name}</div>
                    <div className="text-[10px] text-[#9D8BC9] font-mono">{l.lenderName}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1E1035] text-[#DDD0F7] border border-[#3E236E]">
                      {l.liabilityType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-white font-medium">{l.primaryBorrowerName}</div>
                    <div className="text-[10px] text-[#9D8BC9] font-mono">
                      {l.borrowerOwnershipPercentage}% liability
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-serif text-base font-bold text-[#F43F5E]">
                      {l.formattedOutstandingBalance}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-white font-medium">{l.formattedEmi || '—'}</div>
                    <div className="text-[10px] text-[#9D8BC9] font-mono">{l.repaymentFrequency}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-white font-mono">{l.interestRateAnnual}% p.a.</div>
                    <div className="text-[10px] text-[#9D8BC9] font-mono">Matures: {l.maturityDate || 'N/A'}</div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="p-1.5 rounded-lg text-[#9D8BC9] hover:text-[#F43F5E] hover:bg-[#1E1035] transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD LIABILITY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0E1322] border border-[#3E236E] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <h3 className="text-base font-semibold text-white">Record Family Debt / Facility</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#9D8BC9] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLiability} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Loan / Facility Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SBI Housing Loan (Penthouse)"
                  className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Lending Institution</label>
                  <input
                    type="text"
                    required
                    value={lenderName}
                    onChange={(e) => setLenderName(e.target.value)}
                    placeholder="e.g. State Bank of India"
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Liability Type</label>
                  <select
                    value={liabilityType}
                    onChange={(e) => setLiabilityType(e.target.value as LiabilityType)}
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="HOME_LOAN">Home Mortgage</option>
                    <option value="VEHICLE_LOAN">Auto / Vehicle Loan</option>
                    <option value="BUSINESS_LOAN">Business Term Loan</option>
                    <option value="PERSONAL_LOAN">Personal Loan</option>
                    <option value="EDUCATION_LOAN">Education Loan</option>
                    <option value="CREDIT_CARD">Credit Card / Overdraft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Outstanding Balance (₹)</label>
                  <input
                    type="number"
                    required
                    value={balanceRupees}
                    onChange={(e) => setBalanceRupees(e.target.value)}
                    placeholder="e.g. 18500000 for 1.85 Cr"
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Monthly EMI (₹)</label>
                  <input
                    type="number"
                    value={emiRupees}
                    onChange={(e) => setEmiRupees(e.target.value)}
                    placeholder="e.g. 350000 for 3.5 Lakh"
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Maturity Date</label>
                  <input
                    type="date"
                    value={maturityDate}
                    onChange={(e) => setMaturityDate(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#1E293B] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[#9D8BC9] hover:bg-[#1E1035]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#7C3AED] hover:bg-[#8B5CF6]"
                >
                  Save Liability
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
