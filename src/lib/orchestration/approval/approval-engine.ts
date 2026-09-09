import { db } from '@/lib/db';
import type { OptionProposal } from '../types';

export interface ApprovalEvaluation {
  requiresApproval: boolean;
  reason: string;
  autoApproveLimit: number;
  totalAmount: number;
  currency: string;
}

export async function evaluateApproval(params: {
  userId?: string;
  category: string;
  proposal: OptionProposal;
}): Promise<ApprovalEvaluation> {
  const amount = params.proposal.priceAmount || 0;
  const currency = params.proposal.priceCurrency || 'INR';

  // 1. Check custom user policy if exists, otherwise global default
  let policy = null;
  try {
    const fetchPolicy = async () => {
      if (params.userId) {
        const userPolicy = await db.approvalPolicy.findFirst({
          where: { userId: params.userId, category: params.category },
        });
        if (userPolicy) return userPolicy;
      }
      return await db.approvalPolicy.findFirst({
        where: { userId: null, category: params.category },
      });
    };

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB_TIMEOUT')), 500)
    );

    policy = (await Promise.race([fetchPolicy(), timeoutPromise])) as any;
  } catch {
    // If DB is unreachable, times out, or in isolated unit test environment, fallback directly to built-in policies
    policy = null;
  }

  // Built-in Defaults per Proventa Specification:
  // - Dining: Auto-approve under ₹5,000
  // - Mobility: Auto-approve under ₹2,000
  // - Travel / Hotels / Flights: Always requires approval
  // - Shopping / High Value: Always requires approval
  let autoApproveMax = 0;
  let alwaysRequire = false;

  if (policy) {
    autoApproveMax = policy.autoApproveMax;
    alwaysRequire = policy.alwaysRequire;
  } else {
    switch (params.category.toLowerCase()) {
      case 'dining':
        autoApproveMax = 5000;
        alwaysRequire = false;
        break;
      case 'mobility':
      case 'transit':
        autoApproveMax = 2000;
        alwaysRequire = false;
        break;
      case 'travel':
      case 'hotel':
      case 'flights':
      case 'shopping':
      case 'gift':
        autoApproveMax = 0;
        alwaysRequire = true;
        break;
      default:
        autoApproveMax = 1000;
        alwaysRequire = false;
    }
  }

  if (alwaysRequire) {
    return {
      requiresApproval: true,
      reason: `Client policy mandates explicit confirmation for ${params.category} transactions.`,
      autoApproveLimit: autoApproveMax,
      totalAmount: amount,
      currency,
    };
  }

  if (amount > autoApproveMax) {
    return {
      requiresApproval: true,
      reason: `Total amount (₹${amount.toLocaleString('en-IN')}) exceeds your auto-approval threshold (₹${autoApproveMax.toLocaleString('en-IN')}).`,
      autoApproveLimit: autoApproveMax,
      totalAmount: amount,
      currency,
    };
  }

  return {
    requiresApproval: false,
    reason: `Pre-authorized under client auto-approval limit (₹${autoApproveMax.toLocaleString('en-IN')}).`,
    autoApproveLimit: autoApproveMax,
    totalAmount: amount,
    currency,
  };
}
