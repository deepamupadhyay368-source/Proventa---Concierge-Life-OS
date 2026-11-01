'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Plus,
  CheckCircle2,
  X,
  CreditCard,
} from 'lucide-react';
import { CashflowTransactionDTO, CashflowSummaryDTO, CashflowType, CashflowCategory } from '@/lib/wealth/types';

export default function CashflowPage() {
  const [summary, setSummary] = useState<CashflowSummaryDTO | null>(null);
  const [transactions, setTransactions] = useState<CashflowTransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CashflowType>('INCOME');
  const [category, setCategory] = useState<CashflowCategory>('SALARY');
  const [amountRupees, setAmountRupees] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [isInternalTransfer, setIsInternalTransfer] = useState(false);

  async function loadCashflow() {
    setLoading(true);
    try {
      const res = await fetch('/api/wealth/cashflow?workspaceId=fam_sharma_heritage');
      const json = await res.json();
      if (json.success && json.data) {
        setSummary(json.data.summary);
        setTransactions(json.data.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCashflow();
  }, []);

  async function handleCreateCashflow(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !amountRupees) return;

    try {
      const res = await fetch('/api/wealth/cashflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type,
          category,
          amountRupees: parseFloat(amountRupees),
          isRecurring,
          isInternalTransfer,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setTitle('');
        setAmountRupees('');
        setIsInternalTransfer(false);
        await loadCashflow();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px] border border-[#252C38] bg-[#171C26] p-8 font-mono text-xs uppercase tracking-widest text-[#7595FF] rounded-[2px]">
        Loading Treasury Cashflow Engine...
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* 1. TITANIUM COBALT HEADER & LEDGER BANNER */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="p-6 sm:p-8 border-b border-[#252C38] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7595FF] font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#2457FF]" />
              <span>07 // CASHFLOW INTELLIGENCE &amp; TREASURY</span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#F4F6FA] tracking-tight mt-1">
              Operating Inflows &amp; Obligations
            </h1>
            <p className="font-sans text-xs text-[#C5CAD3] mt-2 max-w-xl">
              Deterministic double-entry cashflow ledger tracking executive salaries, rental yields, committed amortisation EMIs, and living expenditure with strict internal transfer filtering.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] font-mono text-xs uppercase tracking-wider font-semibold border border-[#7595FF]/40 rounded-[2px] shadow-[0_0_15px_rgba(36,87,255,0.3)] transition-all flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Record Cashflow Entry</span>
          </button>
        </div>

        {/* Internal Transfer Isolation Guarantee */}
        <div className="p-4 bg-[#090B10] border-b border-[#252C38] flex items-center gap-3 font-mono text-xs text-[#C5CAD3]">
          <CheckCircle2 className="w-4 h-4 text-[#7595FF] shrink-0" />
          <span>
            <strong className="text-[#F4F6FA]">INTERNAL TRANSFER ISOLATION:</strong> Capital movements between your own domestic accounts (e.g., Salary to Demat) are strictly isolated from operational revenue and expense totals.
          </span>
        </div>

        {/* 4-Part Metric Ledger Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#252C38] bg-[#171C26]">
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B] flex items-center justify-between">
              <span>01 // MONTHLY INFLOWS</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#7595FF]" />
            </div>
            <div className="font-display font-bold text-2xl text-[#7595FF]">
              {summary.formattedTotalIncome}
            </div>
            <div className="font-mono text-[10px] text-[#C5CAD3]">
              Executive salaries &amp; business dividends
            </div>
          </div>

          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B] flex items-center justify-between">
              <span>02 // MONTHLY OUTFLOWS</span>
              <TrendingDown className="w-3.5 h-3.5 text-[#FF7A70]" />
            </div>
            <div className="font-display font-bold text-2xl text-[#FF7A70]">
              {summary.formattedTotalExpenses}
            </div>
            <div className="font-mono text-[10px] text-[#C5CAD3]">
              Household expenditure &amp; lifestyle
            </div>
          </div>

          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B] flex items-center justify-between">
              <span>03 // NET CASHFLOW</span>
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#7595FF]" />
            </div>
            <div className="font-display font-bold text-2xl text-[#F4F6FA]">
              {summary.formattedNetCashflow}
            </div>
            <div className="font-mono text-[10px] text-[#7595FF] font-semibold">
              {summary.savingsRatePercentage}% Monthly Savings Ratio
            </div>
          </div>

          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B] flex items-center justify-between">
              <span>04 // RECURRING DEBT SERVICE</span>
              <CreditCard className="w-3.5 h-3.5 text-[#C5CAD3]" />
            </div>
            <div className="font-display font-bold text-2xl text-[#F4F6FA]">
              {summary.formattedRecurringObligations}
            </div>
            <div className="font-mono text-[10px] text-[#C5CAD3]">
              Fixed committed monthly loan EMIs
            </div>
          </div>
        </div>
      </div>

      {/* 2. TITANIUM TRANSACTIONS LEDGER */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] overflow-x-auto shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="p-4 bg-[#090B10] text-[#7595FF] font-mono text-xs uppercase tracking-wider font-semibold border-b border-[#252C38]">
          Treasury Activity Ledger &amp; Cash Movements
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#171C26] border-b border-[#252C38] text-[#858D9B] font-mono text-[10px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 border-b border-[#252C38]">Transaction Narration</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Member</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Classification</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Direction</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Amount</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Audit Rule</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252C38] text-[#F4F6FA]">
            {transactions.map((tx, idx) => (
              <tr key={tx.id} className="hover:bg-[#1C2230] transition-colors">
                <td className="py-4 px-4 font-mono">
                  <div className="text-[10px] text-[#7595FF] font-semibold">TXN-0{idx + 1}</div>
                  <div className="font-display font-bold text-base text-[#F4F6FA]">{tx.title}</div>
                </td>
                <td className="py-4 px-4 font-mono text-xs text-[#C5CAD3]">{tx.userName}</td>
                <td className="py-4 px-4 font-mono text-xs">
                  <span className="px-2 py-0.5 border border-[#252C38] bg-[#090B10] text-[#C5CAD3] rounded-[2px] uppercase text-[10px]">
                    {tx.category.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-4 font-mono text-xs font-semibold">
                  <span className={tx.type === 'INCOME' ? 'text-[#7595FF]' : 'text-[#FF7A70]'}>
                    {tx.type === 'INCOME' ? 'CREDIT // INFLOW' : 'DEBIT // OUTFLOW'}
                  </span>
                </td>
                <td className="py-4 px-4 font-display font-bold text-base">
                  <span className={tx.type === 'INCOME' ? 'text-[#7595FF]' : 'text-[#FF7A70]'}>
                    {tx.type === 'INCOME' ? '+' : '-'}{tx.formattedAmount}
                  </span>
                </td>
                <td className="py-4 px-4 font-mono text-xs">
                  {tx.isInternalTransfer ? (
                    <span className="px-2 py-0.5 bg-[#090B10] border border-[#252C38] text-[#858D9B] text-[10px] uppercase rounded-[2px]">
                      Internal Transfer (Filtered)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-[#2457FF]/15 border border-[#2457FF]/40 text-[#7595FF] text-[10px] uppercase rounded-[2px]">
                      Operational Movement
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. RECORD CASHFLOW ENTRY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090B10]/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#171C26] border border-[#252C38] p-6 space-y-4 rounded-[2px] shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#252C38]">
              <h3 className="font-display font-bold text-xl text-[#F4F6FA]">Record Cashflow Transaction</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] p-1 border border-[#252C38] rounded-[2px]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCashflow} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                  Narration / Description
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monthly Consulting Retainer or School Fee"
                  className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                    Movement Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CashflowType)}
                    className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  >
                    <option value="INCOME">Income / Inflow</option>
                    <option value="EXPENSE">Expense / Outflow</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                    Classification
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CashflowCategory)}
                    className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  >
                    <option value="SALARY">Salary / Consulting</option>
                    <option value="BUSINESS_INCOME">Business Dividend / LLP Draw</option>
                    <option value="RENTAL">Rental Yield</option>
                    <option value="DIVIDEND">Equity Dividend</option>
                    <option value="LOAN_REPAYMENT">Loan EMI Repayment</option>
                    <option value="HOUSEHOLD">Household Expense</option>
                    <option value="INSURANCE">Insurance Premium</option>
                    <option value="LIFESTYLE">Lifestyle &amp; Travel</option>
                    <option value="OTHER">Other Movement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(e.target.value)}
                  placeholder="e.g. 250000"
                  className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-[#252C38]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="accent-[#2457FF]"
                  />
                  <span className="font-mono text-xs text-[#C5CAD3]">Recurring Monthly Movement</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalTransfer}
                    onChange={(e) => setIsInternalTransfer(e.target.checked)}
                    className="accent-[#2457FF]"
                  />
                  <span className="font-mono text-xs text-[#C5CAD3]">Internal Transfer (Exclude from Inflows/Outflows)</span>
                </label>
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
                  Log Cashflow Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
