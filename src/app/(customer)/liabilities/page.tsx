'use client';

import { useEffect, useState } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  X,
  AlertTriangle,
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
    if (!confirm('CONFIRM DELETION: Permanently remove this liability instrument from the family register?')) return;
    try {
      const res = await fetch(`/api/wealth/liabilities?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadLiabilities();
      }
    } catch (err) {
      console.error(err);
    }
  }

  const totalOutstandingPaise = liabilities.reduce((sum, l) => sum + l.outstandingBalancePaise, 0);
  const totalEmiPaise = liabilities.reduce((sum, l) => sum + (l.emiPaise || 0), 0);

  return (
    <div className="space-y-8 font-sans">
      {/* 1. INSTITUTIONAL HEADER & DEBT REGISTER BANNER */}
      <div className="border border-[#101010] bg-[#FAF9F6]">
        <div className="p-6 sm:p-8 border-b border-[#101010] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#85827B]">
              04 // LIABILITIES &amp; OBLIGATIONS REGISTER
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl text-[#101010] tracking-tight mt-1">
              Debt &amp; Credit Facilities
            </h1>
            <p className="font-sans text-xs text-[#85827B] mt-2 max-w-xl">
              Real estate mortgages, commercial lines, automobile loans, and personal credit facilities with exact amortisation schedules and co-borrower equity mapping.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] font-mono text-xs uppercase tracking-wider font-semibold border border-[#101010] transition-colors flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log Liability</span>
          </button>
        </div>

        {/* Aggregate Debt Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#101010] bg-[#F0EDE5]">
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              TOTAL OUTSTANDING PRINCIPAL
            </div>
            <div className="font-serif text-2xl text-[#A63B32]">
              ₹{(totalOutstandingPaise / 1000000000).toFixed(2)} Crore
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              MONTHLY DEBT SERVICE (EMI)
            </div>
            <div className="font-serif text-2xl text-[#101010]">
              ₹{(totalEmiPaise / 100000).toFixed(2)} Lakh / Month
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              AVERAGE WEIGHTED RATE
            </div>
            <div className="font-serif text-2xl text-[#101010]">
              8.65% p.a.
            </div>
          </div>
        </div>
      </div>

      {/* 2. ARCHITECTURAL DEBT TABLE */}
      <div className="border border-[#101010] bg-[#FAF9F6] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#101010] text-[#F0EDE5] font-mono text-[10px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 border-b border-[#101010]">Facility &amp; Lender</th>
              <th className="py-3 px-4 border-b border-[#101010]">Category</th>
              <th className="py-3 px-4 border-b border-[#101010]">Primary Obligor &amp; Share</th>
              <th className="py-3 px-4 border-b border-[#101010]">Outstanding Principal</th>
              <th className="py-3 px-4 border-b border-[#101010]">Monthly Debt Service</th>
              <th className="py-3 px-4 border-b border-[#101010]">Rate &amp; Maturity</th>
              <th className="py-3 px-4 border-b border-[#101010] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#101010] text-[#101010]">
            {liabilities.map((l, idx) => (
              <tr key={l.id} className="hover:bg-[#F0EDE5] transition-colors">
                <td className="py-4 px-4">
                  <div className="font-mono text-[10px] text-[#85827B]">LIA-0{idx + 1}</div>
                  <div className="font-serif text-base text-[#101010] font-normal mt-0.5">{l.name}</div>
                  <div className="font-mono text-[10px] text-[#85827B] mt-0.5">{l.lenderName}</div>
                </td>
                <td className="py-4 px-4 font-mono text-xs">
                  <span className="px-2 py-0.5 border border-[#101010] bg-[#FAF9F6] uppercase text-[10px]">
                    {l.liabilityType.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="font-mono text-xs font-semibold">{l.primaryBorrowerName}</div>
                  <div className="font-mono text-[10px] text-[#85827B]">
                    {l.borrowerOwnershipPercentage}% liability obligation
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="font-serif text-base text-[#A63B32] font-normal">
                    {l.formattedOutstandingBalance}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="font-mono text-xs font-semibold">{l.formattedEmi || '—'}</div>
                  <div className="font-mono text-[10px] text-[#85827B]">{l.repaymentFrequency}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="font-mono text-xs font-semibold">{l.interestRateAnnual}% p.a.</div>
                  <div className="font-mono text-[10px] text-[#85827B]">Matures: {l.maturityDate || 'N/A'}</div>
                </td>
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => handleDelete(l.id)}
                    className="p-1 border border-[#101010] text-[#85827B] hover:text-[#A63B32] hover:border-[#A63B32] transition-colors"
                    title="Remove Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. RECORD LIABILITY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101010]/70">
          <div className="w-full max-w-lg bg-[#FAF9F6] border border-[#101010] p-6 space-y-5 shadow-[8px_8px_0px_0px_#101010]">
            <div className="flex items-center justify-between pb-3 border-b border-[#101010]">
              <h3 className="font-serif text-xl text-[#101010]">Record Credit Facility / Liability</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#101010] hover:bg-[#F0EDE5] p-1 border border-[#101010]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLiability} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                  Facility Description
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SBI Housing Loan (Penthouse)"
                  className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                    Lending Financial Institution
                  </label>
                  <input
                    type="text"
                    required
                    value={lenderName}
                    onChange={(e) => setLenderName(e.target.value)}
                    placeholder="e.g. State Bank of India"
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                    Liability Type
                  </label>
                  <select
                    value={liabilityType}
                    onChange={(e) => setLiabilityType(e.target.value as LiabilityType)}
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
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
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                    Outstanding Principal (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={balanceRupees}
                    onChange={(e) => setBalanceRupees(e.target.value)}
                    placeholder="e.g. 18500000"
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                    Monthly EMI (₹)
                  </label>
                  <input
                    type="number"
                    value={emiRupees}
                    onChange={(e) => setEmiRupees(e.target.value)}
                    placeholder="e.g. 350000"
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                    Interest Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                    Maturity Date
                  </label>
                  <input
                    type="date"
                    value={maturityDate}
                    onChange={(e) => setMaturityDate(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#101010] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#101010] font-mono text-xs uppercase text-[#101010] hover:bg-[#F0EDE5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] font-mono text-xs uppercase tracking-wider font-semibold border border-[#101010]"
                >
                  Record Liability in Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
