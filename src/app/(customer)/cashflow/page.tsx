'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Plus,
  Filter,
  CheckCircle2,
  Calendar,
  AlertCircle,
  X,
  CreditCard,
  Banknote,
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
      <div className="flex items-center justify-center min-h-[300px] text-xs font-mono text-[#A78BFA]">
        Loading Cashflow Intelligence Engine...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A78BFA] mb-1">
            FAMILY WEALTH OS // CASHFLOW INTELLIGENCE
          </div>
          <h1 className="font-serif text-3xl text-white">Income &amp; Expenditure Intelligence</h1>
          <p className="text-xs text-[#9D8BC9] font-light mt-1">
            Monthly inflows, household expenses, and recurring EMI obligations with internal transfer filtering.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#7C3AED] hover:bg-[#8B5CF6] transition-all shadow-md shadow-[#7C3AED]/25"
        >
          <Plus className="w-4 h-4" />
          <span>Record Inflow / Outflow</span>
        </button>
      </div>

      {/* Protocol Banner */}
      <div className="p-4 rounded-xl bg-[#0E1322] border border-[#1E293B] flex items-center justify-between text-xs text-[#9D8BC9]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span>
            <strong>Internal Transfer Isolation Guarantee:</strong> Transfers between a family member&apos;s own accounts (e.g., salary to Demat account) are never counted as new income or expenses.
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B]">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#9D8BC9]">
            <span>Monthly Inflows</span>
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-2xl font-serif text-white font-bold mt-2">
            {summary.formattedTotalIncome}
          </div>
          <div className="text-xs text-[#9D8BC9] mt-2">Executive salaries &amp; dividends</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B]">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#9D8BC9]">
            <span>Monthly Outflows</span>
            <TrendingDown className="w-4 h-4 text-[#F43F5E]" />
          </div>
          <div className="text-2xl font-serif text-[#F43F5E] font-bold mt-2">
            {summary.formattedTotalExpenses}
          </div>
          <div className="text-xs text-[#9D8BC9] mt-2">Household bills &amp; living costs</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E1322] border border-[#2D1854]">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#A78BFA]">
            <span>Net Monthly Cashflow</span>
            <ArrowLeftRight className="w-4 h-4 text-[#A78BFA]" />
          </div>
          <div className="text-2xl font-serif text-white font-bold mt-2">
            {summary.formattedNetCashflow}
          </div>
          <div className="text-xs text-[#10B981] mt-2 font-mono">
            {summary.savingsRatePercentage}% Savings Rate
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B]">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#9D8BC9]">
            <span>Recurring Obligations</span>
            <CreditCard className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-serif text-white font-bold mt-2">
            {summary.formattedRecurringObligations}
          </div>
          <div className="text-xs text-[#9D8BC9] mt-2">Committed monthly debt service</div>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="rounded-2xl bg-[#0E1322] border border-[#1E293B] overflow-hidden">
        <div className="p-4 border-b border-[#1E293B] font-semibold text-sm text-white">
          Cashflow Activity Ledger
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070A12] border-b border-[#1E293B] text-[10px] font-mono uppercase tracking-wider text-[#9D8BC9]">
              <tr>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-white">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#1E1035]/30 transition-colors">
                  <td className="py-4 px-4 font-medium text-white">{tx.title}</td>
                  <td className="py-4 px-4 text-[#9D8BC9]">{tx.userName}</td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1E1035] text-[#DDD0F7] border border-[#3E236E]">
                      {tx.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`text-[10px] font-mono font-semibold ${
                        tx.type === 'INCOME' ? 'text-[#10B981]' : 'text-[#F43F5E]'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-serif text-sm font-bold text-white">
                    {tx.type === 'INCOME' ? '+' : '-'}{tx.formattedAmount}
                  </td>
                  <td className="py-4 px-4">
                    {tx.isInternalTransfer ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E293B] text-[#94A3B8]">
                        Internal Transfer (Filtered)
                      </span>
                    ) : tx.isRecurring ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E1035] text-[#A78BFA]">
                        Recurring Schedule
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#64748B]">Ad-hoc</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CASHFLOW MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0E1322] border border-[#3E236E] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <h3 className="text-base font-semibold text-white">Record Cashflow Transaction</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#9D8BC9] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCashflow} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Title / Narration</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Salary Inflow or Maintenance Bill"
                  className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CashflowType)}
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="INCOME">Income / Inflow (+)</option>
                    <option value="EXPENSE">Expense / Outflow (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={amountRupees}
                    onChange={(e) => setAmountRupees(e.target.value)}
                    placeholder="e.g. 850000"
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CashflowCategory)}
                  className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
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

              <div className="space-y-2 pt-2 border-t border-[#1E293B]">
                <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded text-[#7C3AED]"
                  />
                  <span>Recurring monthly schedule</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalTransfer}
                    onChange={(e) => setIsInternalTransfer(e.target.checked)}
                    className="rounded text-[#7C3AED]"
                  />
                  <span>Internal transfer between own accounts (filter from totals)</span>
                </label>
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
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
