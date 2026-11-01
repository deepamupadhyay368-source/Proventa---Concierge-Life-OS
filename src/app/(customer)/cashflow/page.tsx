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
      <div className="flex items-center justify-center min-h-[400px] border border-[#101010] bg-[#FAF9F6] p-8 font-mono text-xs uppercase tracking-widest text-[#101010]">
        Loading Treasury Cashflow Engine...
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* 1. INSTITUTIONAL HEADER & LEDGER BANNER */}
      <div className="border border-[#101010] bg-[#FAF9F6]">
        <div className="p-6 sm:p-8 border-b border-[#101010] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#85827B]">
              07 // CASHFLOW INTELLIGENCE &amp; TREASURY
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl text-[#101010] tracking-tight mt-1">
              Operating Inflows &amp; Obligations
            </h1>
            <p className="font-sans text-xs text-[#85827B] mt-2 max-w-xl">
              Deterministic double-entry cashflow ledger tracking executive salaries, rental yields, committed amortisation EMIs, and living expenditure with strict internal transfer filtering.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] font-mono text-xs uppercase tracking-wider font-semibold border border-[#101010] transition-colors flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Record Cashflow Entry</span>
          </button>
        </div>

        {/* Internal Transfer Isolation Guarantee */}
        <div className="p-4 bg-[#F0EDE5] border-b border-[#101010] flex items-center gap-3 font-mono text-xs text-[#101010]">
          <CheckCircle2 className="w-4 h-4 text-[#263B35] shrink-0" />
          <span>
            <strong>INTERNAL TRANSFER ISOLATION:</strong> Capital movements between your own domestic accounts (e.g., Salary to Demat) are strictly isolated from operational revenue and expense totals.
          </span>
        </div>

        {/* 4-Part Metric Ledger Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#101010] bg-[#FAF9F6]">
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B] flex items-center justify-between">
              <span>01 // MONTHLY INFLOWS</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#263B35]" />
            </div>
            <div className="font-serif text-2xl text-[#263B35]">
              {summary.formattedTotalIncome}
            </div>
            <div className="font-mono text-[10px] text-[#85827B]">
              Executive salaries &amp; business dividends
            </div>
          </div>

          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B] flex items-center justify-between">
              <span>02 // MONTHLY OUTFLOWS</span>
              <TrendingDown className="w-3.5 h-3.5 text-[#A63B32]" />
            </div>
            <div className="font-serif text-2xl text-[#A63B32]">
              {summary.formattedTotalExpenses}
            </div>
            <div className="font-mono text-[10px] text-[#85827B]">
              Household expenditure &amp; lifestyle
            </div>
          </div>

          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B] flex items-center justify-between">
              <span>03 // NET CASHFLOW</span>
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#101010]" />
            </div>
            <div className="font-serif text-2xl text-[#101010]">
              {summary.formattedNetCashflow}
            </div>
            <div className="font-mono text-[10px] text-[#263B35] font-semibold">
              {summary.savingsRatePercentage}% Monthly Savings Ratio
            </div>
          </div>

          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B] flex items-center justify-between">
              <span>04 // RECURRING DEBT SERVICE</span>
              <CreditCard className="w-3.5 h-3.5 text-[#101010]" />
            </div>
            <div className="font-serif text-2xl text-[#101010]">
              {summary.formattedRecurringObligations}
            </div>
            <div className="font-mono text-[10px] text-[#85827B]">
              Fixed committed monthly loan EMIs
            </div>
          </div>
        </div>
      </div>

      {/* 2. ARCHITECTURAL TRANSACTIONS LEDGER */}
      <div className="border border-[#101010] bg-[#FAF9F6] overflow-x-auto">
        <div className="p-4 bg-[#101010] text-[#F0EDE5] font-mono text-xs uppercase tracking-wider font-semibold">
          Treasury Activity Ledger &amp; Cash Movements
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#FAF9F6] border-b border-[#101010] text-[#85827B] font-mono text-[10px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 border-b border-[#101010]">Transaction Narration</th>
              <th className="py-3 px-4 border-b border-[#101010]">Member</th>
              <th className="py-3 px-4 border-b border-[#101010]">Classification</th>
              <th className="py-3 px-4 border-b border-[#101010]">Direction</th>
              <th className="py-3 px-4 border-b border-[#101010]">Amount</th>
              <th className="py-3 px-4 border-b border-[#101010]">Audit Rule</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#101010] text-[#101010]">
            {transactions.map((tx, idx) => (
              <tr key={tx.id} className="hover:bg-[#F0EDE5] transition-colors">
                <td className="py-4 px-4 font-mono">
                  <div className="text-[10px] text-[#85827B]">TXN-0{idx + 1}</div>
                  <div className="font-serif text-base text-[#101010] font-normal">{tx.title}</div>
                </td>
                <td className="py-4 px-4 font-mono text-xs text-[#85827B]">{tx.userName}</td>
                <td className="py-4 px-4 font-mono text-xs">
                  <span className="px-2 py-0.5 border border-[#101010] bg-[#FAF9F6] uppercase text-[10px]">
                    {tx.category.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-4 font-mono text-xs font-semibold">
                  <span className={tx.type === 'INCOME' ? 'text-[#263B35]' : 'text-[#A63B32]'}>
                    {tx.type === 'INCOME' ? 'CREDIT // INFLOW' : 'DEBIT // OUTFLOW'}
                  </span>
                </td>
                <td className="py-4 px-4 font-serif text-base font-normal">
                  <span className={tx.type === 'INCOME' ? 'text-[#263B35]' : 'text-[#A63B32]'}>
                    {tx.type === 'INCOME' ? '+' : '-'}{tx.formattedAmount}
                  </span>
                </td>
                <td className="py-4 px-4 font-mono text-xs">
                  {tx.isInternalTransfer ? (
                    <span className="px-2 py-0.5 bg-[#F0EDE5] border border-[#101010]/30 text-[#85827B] text-[10px] uppercase">
                      Internal Transfer (Filtered)
                    </span>
                  ) : tx.isRecurring ? (
                    <span className="px-2 py-0.5 bg-[#FAF9F6] border border-[#101010] text-[#101010] text-[10px] uppercase font-semibold">
                      Committed Recurring
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#85827B] uppercase">Discretionary</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. RECORD CASHFLOW ENTRY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101010]/75">
          <div className="w-full max-w-md bg-[#FAF9F6] border border-[#101010] p-6 space-y-4 shadow-[8px_8px_0px_0px_#101010]">
            <div className="flex items-center justify-between pb-3 border-b border-[#101010]">
              <h3 className="font-serif text-xl text-[#101010]">Record Treasury Movement</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#101010] hover:bg-[#F0EDE5] p-1 border border-[#101010]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCashflow} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                  Narration / Description
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dividend Distribution or Property Tax"
                  className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                    Direction
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CashflowType)}
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                  >
                    <option value="INCOME">Inflow / Revenue (+)</option>
                    <option value="EXPENSE">Outflow / Expenditure (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={amountRupees}
                    onChange={(e) => setAmountRupees(e.target.value)}
                    placeholder="e.g. 850000"
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CashflowCategory)}
                  className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                >
                  <option value="SALARY">Salary / Professional Income</option>
                  <option value="BUSINESS_INCOME">Business / Dividend Income</option>
                  <option value="RENTAL_INCOME">Rental Income</option>
                  <option value="EMI_REPAYMENT">Loan EMI Repayment</option>
                  <option value="HOUSEHOLD_EXPENSE">Household &amp; Utilities</option>
                  <option value="EDUCATION_EXPENSE">Education Expense</option>
                  <option value="HEALTHCARE_EXPENSE">Healthcare &amp; Medical</option>
                  <option value="OTHER_EXPENSE">Other Outflow</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#101010]/15 font-mono text-xs">
                <label className="flex items-center gap-2 text-[#101010] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="accent-[#101010]"
                  />
                  <span>Committed monthly recurring schedule</span>
                </label>

                <label className="flex items-center gap-2 text-[#101010] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalTransfer}
                    onChange={(e) => setIsInternalTransfer(e.target.checked)}
                    className="accent-[#101010]"
                  />
                  <span>Internal transfer between own accounts (filter from totals)</span>
                </label>
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
                  Commit Entry to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
