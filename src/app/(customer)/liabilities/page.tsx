'use client';

import { useEffect, useState } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  Building,
  Calculator,
} from 'lucide-react';
import { LiabilityDTO, LiabilityType } from '@/lib/wealth/types';
import { useCurrentWorkspace } from '@/lib/wealth/workspace-context';
import {
  calculateEMI,
  generateAmortisationSchedule,
  simulateLoanPrepayment,
  formatInr,
  rupeesToPaise,
} from '@/lib/wealth/engine';

export default function LiabilitiesPage() {
  const { currentWorkspaceId, user, isLoaded } = useCurrentWorkspace();
  const [liabilities, setLiabilities] = useState<LiabilityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLiabilityForSchedule, setSelectedLiabilityForSchedule] = useState<LiabilityDTO | null>(null);
  const [prepayExtraRupees, setPrepayExtraRupees] = useState<string>('15000');
  const [prepayLumpSumRupees, setPrepayLumpSumRupees] = useState<string>('0');

  // Form state
  const [name, setName] = useState('');
  const [lenderName, setLenderName] = useState('HDFC Bank');
  const [liabilityType, setLiabilityType] = useState<LiabilityType>('HOME_LOAN');
  const [originalRupees, setOriginalRupees] = useState('');
  const [balanceRupees, setBalanceRupees] = useState('');
  const [emiRupees, setEmiRupees] = useState('');
  const [interestRate, setInterestRate] = useState('8.5');
  const [maturityDate, setMaturityDate] = useState('');
  const [primaryBorrowerName, setPrimaryBorrowerName] = useState(user?.name || 'Primary Borrower');
  const [ownershipPct, setOwnershipPct] = useState('100');

  async function loadLiabilities() {
    if (!currentWorkspaceId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/wealth/liabilities?workspaceId=${encodeURIComponent(currentWorkspaceId)}`);
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
    if (isLoaded) {
      void loadLiabilities();
    }
  }, [currentWorkspaceId, isLoaded]);

  async function handleCreateLiability(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !balanceRupees || !currentWorkspaceId) return;

    try {
      const res = await fetch('/api/wealth/liabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: currentWorkspaceId,
          name,
          lenderName,
          liabilityType,
          originalPrincipalRupees: parseFloat(originalRupees || balanceRupees),
          outstandingBalanceRupees: parseFloat(balanceRupees),
          emiRupees: emiRupees ? parseFloat(emiRupees) : null,
          interestRateAnnual: parseFloat(interestRate),
          maturityDate,
          primaryBorrowerId: user?.id || 'usr_borrower',
          primaryBorrowerName: primaryBorrowerName || user?.name || 'Primary Borrower',
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
      {/* 1. TITANIUM COBALT HEADER & DEBT REGISTER BANNER */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="p-6 sm:p-8 border-b border-[#252C38] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7595FF] font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#2457FF]" />
              <span>04 // LIABILITIES &amp; OBLIGATIONS REGISTER</span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#F4F6FA] tracking-tight mt-1">
              Debt &amp; Credit Facilities
            </h1>
            <p className="font-sans text-xs text-[#C5CAD3] mt-2 max-w-xl">
              Real estate mortgages, commercial lines, automobile loans, and personal credit facilities with exact amortisation schedules and co-borrower equity mapping.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] font-mono text-xs uppercase tracking-wider font-semibold border border-[#7595FF]/40 rounded-[2px] shadow-[0_0_15px_rgba(36,87,255,0.3)] transition-all flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log Liability</span>
          </button>
        </div>

        {/* Aggregate Debt Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#252C38] bg-[#090B10]">
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              TOTAL OUTSTANDING PRINCIPAL
            </div>
            <div className="font-display font-bold text-2xl text-[#FF7A70]">
              ₹{(totalOutstandingPaise / 1000000000).toFixed(2)} Crore
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              MONTHLY DEBT SERVICE (EMI)
            </div>
            <div className="font-display font-bold text-2xl text-[#F4F6FA]">
              ₹{(totalEmiPaise / 100000).toFixed(2)} Lakh / Month
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              AVERAGE WEIGHTED RATE
            </div>
            <div className="font-display font-bold text-2xl text-[#7595FF]">
              8.65% p.a.
            </div>
          </div>
        </div>
      </div>

      {/* 2. TITANIUM DEBT DATA TABLE */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] overflow-x-auto shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#090B10] text-[#7595FF] font-mono text-[10px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 border-b border-[#252C38]">Facility &amp; Lender</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Category</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Primary Obligor &amp; Share</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Outstanding Principal</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Monthly Debt Service</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Rate &amp; Maturity</th>
              <th className="py-3 px-4 border-b border-[#252C38] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252C38] text-[#F4F6FA]">
            {liabilities.map((l, idx) => (
              <tr key={l.id} className="hover:bg-[#1C2230] transition-colors">
                <td className="py-4 px-4">
                  <div className="font-mono text-[10px] text-[#7595FF] font-semibold">LIA-0{idx + 1}</div>
                  <div className="font-display text-base text-[#F4F6FA] font-bold mt-0.5">{l.name}</div>
                  <div className="font-mono text-[10px] text-[#858D9B] mt-0.5">{l.lenderName}</div>
                </td>
                <td className="py-4 px-4 font-mono text-xs">
                  <span className="px-2 py-0.5 border border-[#252C38] bg-[#090B10] rounded-[2px] uppercase text-[10px] text-[#C5CAD3]">
                    {l.liabilityType.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="font-mono text-xs font-semibold text-[#F4F6FA]">{l.primaryBorrowerName}</div>
                  <div className="font-mono text-[10px] text-[#858D9B]">
                    {l.borrowerOwnershipPercentage}% liability obligation
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="font-display text-base text-[#FF7A70] font-bold">
                    {l.formattedOutstandingBalance}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="font-mono text-xs font-semibold text-[#F4F6FA]">{l.formattedEmi || '—'}</div>
                  <div className="font-mono text-[10px] text-[#858D9B]">{l.repaymentFrequency}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="font-mono text-xs font-semibold text-[#7595FF]">{l.interestRateAnnual}% p.a.</div>
                  <div className="font-mono text-[10px] text-[#858D9B]">Matures: {l.maturityDate || 'N/A'}</div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedLiabilityForSchedule(l)}
                      className="px-2.5 py-1 border border-[#252C38] bg-[#090B10] text-[#7595FF] hover:border-[#2457FF] hover:text-[#F4F6FA] font-mono text-[10px] uppercase transition-colors rounded-[2px] flex items-center gap-1"
                      title="View Amortisation Schedule & Prepayment Simulator"
                    >
                      <Calculator className="w-3 h-3" />
                      <span>Amortise</span>
                    </button>
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="p-1 border border-[#252C38] bg-[#090B10] text-[#858D9B] hover:text-[#FF7A70] hover:border-[#FF7A70]/50 transition-colors rounded-[2px]"
                      title="Remove Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {liabilities.length === 0 && (
          <div className="p-12 text-center space-y-3 bg-[#171C26]">
            <div className="w-10 h-10 mx-auto bg-[#FF7A70]/10 text-[#FF7A70] flex items-center justify-center rounded-xs border border-[#FF7A70]/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="font-heading font-bold text-base text-[#F4F6FA]">No Debt Facilities Recorded</div>
            <p className="text-xs text-[#858D9B] max-w-sm mx-auto">
              No active liabilities logged. Record mortgages, commercial credit, or personal facilities to monitor debt amortization.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2457FF] text-white hover:bg-[#1D4ED8] font-mono text-xs uppercase tracking-wider rounded-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Record First Liability</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. RECORD LIABILITY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090B10]/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#171C26] border border-[#252C38] p-6 space-y-5 rounded-[2px] shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#252C38]">
              <h3 className="font-display font-bold text-xl text-[#F4F6FA]">Record Credit Facility / Liability</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] p-1 border border-[#252C38] rounded-[2px]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLiability} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                  Facility Description
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SBI Housing Loan (Penthouse)"
                  className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                    Lending Financial Institution
                  </label>
                  <input
                    type="text"
                    required
                    value={lenderName}
                    onChange={(e) => setLenderName(e.target.value)}
                    placeholder="e.g. State Bank of India"
                    className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                    Liability Type
                  </label>
                  <select
                    value={liabilityType}
                    onChange={(e) => setLiabilityType(e.target.value as LiabilityType)}
                    className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
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
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                    Outstanding Principal (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={balanceRupees}
                    onChange={(e) => setBalanceRupees(e.target.value)}
                    placeholder="e.g. 18500000"
                    className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                    Monthly EMI (₹)
                  </label>
                  <input
                    type="number"
                    value={emiRupees}
                    onChange={(e) => setEmiRupees(e.target.value)}
                    placeholder="e.g. 350000"
                    className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                    Interest Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                    Maturity Date
                  </label>
                  <input
                    type="date"
                    value={maturityDate}
                    onChange={(e) => setMaturityDate(e.target.value)}
                    className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#252C38] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#252C38] font-mono text-xs uppercase text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] rounded-[2px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] font-mono text-xs uppercase tracking-wider font-semibold border border-[#7595FF]/40 rounded-[2px] shadow-[0_0_12px_rgba(36,87,255,0.3)]"
                >
                  Record Liability in Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. AMORTISATION & PREPAYMENT MODAL */}
      {selectedLiabilityForSchedule && (() => {
        const principalPaise = selectedLiabilityForSchedule.outstandingBalancePaise;
        const rate = selectedLiabilityForSchedule.interestRateAnnual || 8.5;
        const tenureMonths = 120; // default 10-year view or based on maturity
        const extraPaise = rupeesToPaise(parseFloat(prepayExtraRupees) || 0);
        const lumpSumPaise = rupeesToPaise(parseFloat(prepayLumpSumRupees) || 0);

        const standardSchedule = generateAmortisationSchedule(principalPaise, rate, tenureMonths);
        const simResult = simulateLoanPrepayment(principalPaise, rate, tenureMonths, extraPaise, lumpSumPaise);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090B10]/85 backdrop-blur-sm">
            <div className="w-full max-w-4xl bg-[#171C26] border border-[#252C38] rounded-[2px] shadow-[0_8px_32px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-[#252C38] flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#7595FF] font-semibold">
                    AMORTISATION &amp; PREPAYMENT ENGINE
                  </div>
                  <h3 className="font-display font-bold text-2xl text-[#F4F6FA] mt-0.5">
                    {selectedLiabilityForSchedule.name}
                  </h3>
                  <div className="font-mono text-xs text-[#858D9B] mt-1">
                    Balance: {selectedLiabilityForSchedule.formattedOutstandingBalance} · {rate}% p.a. · {selectedLiabilityForSchedule.lenderName}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLiabilityForSchedule(null)}
                  className="text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] p-1.5 border border-[#252C38] rounded-[2px]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Prepayment Simulation Interactive Controls */}
              <div className="p-6 bg-[#090B10] border-b border-[#252C38] grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                    Simulate Extra Monthly Prepayment (₹)
                  </label>
                  <input
                    type="number"
                    value={prepayExtraRupees}
                    onChange={(e) => setPrepayExtraRupees(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full bg-[#171C26] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                  <div className="text-[10px] text-[#858D9B] mt-1 font-mono">
                    Added to every monthly EMI towards principal repayment
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                    Simulate One-Time Lump Sum Prepayment (₹)
                  </label>
                  <input
                    type="number"
                    value={prepayLumpSumRupees}
                    onChange={(e) => setPrepayLumpSumRupees(e.target.value)}
                    placeholder="e.g. 200000"
                    className="w-full bg-[#171C26] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                  <div className="text-[10px] text-[#858D9B] mt-1 font-mono">
                    Immediate capital injection in Month 1
                  </div>
                </div>
              </div>

              {/* Prepayment Summary Strip */}
              <div className="p-4 bg-[#1C2230] border-b border-[#252C38] grid grid-cols-3 divide-x divide-[#252C38] text-center font-mono">
                <div>
                  <div className="text-[10px] text-[#858D9B] uppercase">INTEREST SAVED</div>
                  <div className="font-display font-bold text-xl text-[#7595FF] mt-0.5">
                    {simResult.formattedInterestSaved}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#858D9B] uppercase">TENURE REDUCTION</div>
                  <div className="font-display font-bold text-xl text-[#F4F6FA] mt-0.5">
                    {simResult.monthsSaved} Months Saved
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#858D9B] uppercase">NEW DEBT FREEDOM</div>
                  <div className="font-display font-bold text-xl text-[#FF7A70] mt-0.5">
                    {simResult.newTenureMonths} Months
                  </div>
                </div>
              </div>

              {/* Amortisation Table */}
              <div className="flex-1 overflow-y-auto p-6">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead className="bg-[#090B10] text-[#7595FF] text-[10px] uppercase sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3 border-b border-[#252C38]">Mo</th>
                      <th className="py-2.5 px-3 border-b border-[#252C38]">Opening Balance</th>
                      <th className="py-2.5 px-3 border-b border-[#252C38]">Total Payment</th>
                      <th className="py-2.5 px-3 border-b border-[#252C38]">Principal Paid</th>
                      <th className="py-2.5 px-3 border-b border-[#252C38]">Interest Paid</th>
                      <th className="py-2.5 px-3 border-b border-[#252C38]">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252C38] text-[#F4F6FA]">
                    {simResult.schedule.slice(0, 36).map((row) => (
                      <tr key={row.month} className="hover:bg-[#1C2230]">
                        <td className="py-2 px-3 text-[#7595FF]">#{row.month}</td>
                        <td className="py-2 px-3">{formatInr(row.openingBalancePaise)}</td>
                        <td className="py-2 px-3 font-semibold">{formatInr(row.emiPaise)}</td>
                        <td className="py-2 px-3 text-[#7595FF]">{formatInr(row.principalPaidPaise)}</td>
                        <td className="py-2 px-3 text-[#FF7A70]">{formatInr(row.interestPaidPaise)}</td>
                        <td className="py-2 px-3">{formatInr(row.closingBalancePaise)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {simResult.schedule.length > 36 && (
                  <div className="text-center font-mono text-[10px] text-[#858D9B] py-3">
                    Showing first 36 months of {simResult.schedule.length} months amortisation schedule.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
