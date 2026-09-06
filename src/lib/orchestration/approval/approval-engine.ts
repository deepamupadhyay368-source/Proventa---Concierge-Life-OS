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
  if (params.userId) {
    policy = await db.approvalPolicy.findFirst({
      where: { userId: params.userId, category: params.category },
    });
  }

  if (!policy) {
    policy = await db.approvalPolicy.findFirst({
      where: { userId: null, category: params.category },
    });
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
