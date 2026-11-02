/**
 * PROVENTA — Cashflow Intelligence Module
 * 
 * Tracks family income, recurring obligations, household expenditure,
 * and strictly isolates internal transfers between accounts.
 */

import {
  CashflowTransactionDTO,
  CashflowSummaryDTO,
  CashflowCategory,
  CashflowType,
} from './types';
import { formatInr } from './engine';

interface CashflowStore {
  transactions: Map<string, CashflowTransactionDTO>;
}

declare global {
  // eslint-disable-next-line no-var
  var __proventaCashflowStore: CashflowStore | undefined;
}

function getCashflowStore(): CashflowStore {
  if (!globalThis.__proventaCashflowStore) {
    const store: CashflowStore = {
      transactions: new Map(),
    };

    if (process.env.NODE_ENV !== 'test') {
      globalThis.__proventaCashflowStore = store;
      return store;
    }

    const demoFamilyId = 'fam_sharma_heritage';

    // Realistic monthly family cashflows
    const demoTxs: CashflowTransactionDTO[] = [
      {
        id: 'tx_salary',
        workspaceId: demoFamilyId,
        familyId: demoFamilyId,
        userId: 'usr_rajesh_sharma',
        userName: 'Rajesh Sharma',
        title: 'Executive Managing Director Salary',
        type: 'INCOME',
        category: 'SALARY',
        amountPaise: 85000000, // ₹8.5 Lakh / month
        formattedAmount: '₹8,50,000',
        transactionDate: '2026-02-01',
        isRecurring: true,
        isInternalTransfer: false,
        createdAt: '2026-02-01T10:00:00.000Z',
      },
      {
        id: 'tx_dividends',
        workspaceId: demoFamilyId,
        familyId: demoFamilyId,
        userId: 'usr_sunita_sharma',
        userName: 'Sunita Sharma',
        title: 'Apex Precision Engineering Annual Dividend',
        type: 'INCOME',
        category: 'DIVIDENDS',
        amountPaise: 35000000, // ₹3.5 Lakh
        formattedAmount: '₹3,50,000',
        transactionDate: '2026-01-25',
        isRecurring: false,
        isInternalTransfer: false,
        createdAt: '2026-01-25T10:00:00.000Z',
      },
      {
        id: 'tx_home_loan_emi',
        workspaceId: demoFamilyId,
        familyId: demoFamilyId,
        userId: 'usr_rajesh_sharma',
        userName: 'Rajesh Sharma',
        title: 'SBI Home Loan EMI (Worli Penthouse)',
        type: 'EXPENSE',
        category: 'EMI_REPAYMENT',
        amountPaise: 35000000, // ₹3.5 Lakh
        formattedAmount: '₹3,50,000',
        transactionDate: '2026-02-05',
        isRecurring: true,
        isInternalTransfer: false,
        createdAt: '2026-02-05T10:00:00.000Z',
      },
      {
        id: 'tx_auto_loan_emi',
        workspaceId: demoFamilyId,
        familyId: demoFamilyId,
        userId: 'usr_aarav_sharma',
        userName: 'Aarav Sharma',
        title: 'BMW Auto Loan EMI',
        type: 'EXPENSE',
        category: 'EMI_REPAYMENT',
        amountPaise: 12500000, // ₹1.25 Lakh
        formattedAmount: '₹1,25,000',
        transactionDate: '2026-02-10',
        isRecurring: true,
        isInternalTransfer: false,
        createdAt: '2026-02-10T10:00:00.000Z',
      },
      {
        id: 'tx_household',
        workspaceId: demoFamilyId,
        familyId: demoFamilyId,
        userId: 'usr_sunita_sharma',
        userName: 'Sunita Sharma',
        title: 'Worli Household & Maintenance Bills',
        type: 'EXPENSE',
        category: 'HOUSEHOLD_EXPENSE',
        amountPaise: 18000000, // ₹1.80 Lakh
        formattedAmount: '₹1,80,000',
        transactionDate: '2026-02-08',
        isRecurring: true,
        isInternalTransfer: false,
        createdAt: '2026-02-08T10:00:00.000Z',
      },
      {
        id: 'tx_internal_transfer',
        workspaceId: demoFamilyId,
        familyId: demoFamilyId,
        userId: 'usr_rajesh_sharma',
        userName: 'Rajesh Sharma',
        title: 'Transfer to HDFC Savings for SIP Investment',
        type: 'EXPENSE',
        category: 'OTHER_EXPENSE',
        amountPaise: 20000000, // ₹2.0 Lakh
        formattedAmount: '₹2,00,000',
        transactionDate: '2026-02-02',
        isRecurring: true,
        isInternalTransfer: true, // Internal transfer: filtered out from net cashflow calculations
        sourceAccountId: 'acc_sbi_salary',
        destinationAccountId: 'acc_hdfc_invest',
        createdAt: '2026-02-02T10:00:00.000Z',
      },
    ];

    for (const tx of demoTxs) {
      store.transactions.set(tx.id, tx);
    }
    globalThis.__proventaCashflowStore = store;
  }
  return globalThis.__proventaCashflowStore;
}

export function syncWorkspaceCashflows(workspaceId: string, txs: CashflowTransactionDTO[]): void {
  const store = getCashflowStore();
  for (const [id, tx] of Array.from(store.transactions.entries())) {
    if (tx.workspaceId === workspaceId) {
      store.transactions.delete(id);
    }
  }
  for (const tx of txs) {
    store.transactions.set(tx.id, tx);
  }
}

export function listCashflows(params: {
  workspaceId: string;
  type?: CashflowType;
  category?: CashflowCategory;
}): CashflowTransactionDTO[] {
  const store = getCashflowStore();
  const results: CashflowTransactionDTO[] = [];

  for (const tx of store.transactions.values()) {
    if (tx.workspaceId === params.workspaceId) {
      if (params.type && tx.type !== params.type) continue;
      if (params.category && tx.category !== params.category) continue;
      results.push(tx);
    }
  }

  return results.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
}

export function createCashflowTransaction(
  params: Omit<CashflowTransactionDTO, 'id' | 'formattedAmount' | 'createdAt'>,
): CashflowTransactionDTO {
  const store = getCashflowStore();
  const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newTx: CashflowTransactionDTO = {
    ...params,
    id,
    formattedAmount: formatInr(params.amountPaise),
    createdAt: now,
  };

  store.transactions.set(id, newTx);
  return newTx;
}

/**
 * Calculates monthly net cashflow summary.
 * Crucial engineering guarantee: Strictly excludes internal account transfers.
 */
export function getCashflowSummary(workspaceId: string, periodMonth?: string): CashflowSummaryDTO {
  const transactions = listCashflows({ workspaceId });
  const targetMonth = periodMonth || new Date().toISOString().substring(0, 7); // YYYY-MM

  let totalIncomePaise = 0;
  let totalExpensesPaise = 0;
  let recurringObligationsPaise = 0;

  const categoryMap = new Map<CashflowCategory, { type: CashflowType; amount: number }>();

  for (const tx of transactions) {
    // Filter out internal transfers from income/expense counting
    if (tx.isInternalTransfer) {
      continue;
    }

    if (tx.type === 'INCOME') {
      totalIncomePaise += tx.amountPaise;
    } else {
      totalExpensesPaise += tx.amountPaise;
      if (tx.isRecurring) {
        recurringObligationsPaise += tx.amountPaise;
      }
    }

    const existing = categoryMap.get(tx.category) || { type: tx.type, amount: 0 };
    existing.amount += tx.amountPaise;
    categoryMap.set(tx.category, existing);
  }

  const netCashflowPaise = totalIncomePaise - totalExpensesPaise;
  const savingsRate = totalIncomePaise > 0 ? Number(((netCashflowPaise / totalIncomePaise) * 100).toFixed(1)) : 0;

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([cat, data]) => {
    const base = data.type === 'INCOME' ? totalIncomePaise : totalExpensesPaise;
    const pct = base > 0 ? Number(((data.amount / base) * 100).toFixed(1)) : 0;
    return {
      category: cat,
      type: data.type,
      amountPaise: data.amount,
      formattedAmount: formatInr(data.amount),
      percentage: pct,
    };
  });

  return {
    periodMonth: targetMonth,
    totalIncomePaise,
    formattedTotalIncome: formatInr(totalIncomePaise),
    totalExpensesPaise,
    formattedTotalExpenses: formatInr(totalExpensesPaise),
    netCashflowPaise,
    formattedNetCashflow: formatInr(netCashflowPaise),
    savingsRatePercentage: savingsRate,
    recurringObligationsPaise,
    formattedRecurringObligations: formatInr(recurringObligationsPaise),
    categoryBreakdown,
  };
}
