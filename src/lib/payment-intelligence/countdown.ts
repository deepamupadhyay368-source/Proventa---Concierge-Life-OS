/**
 * PROVENTA PAYMENT INTELLIGENCE
 * Payment Countdown Engine
 * Calculates real-time payment deadlines, overdue states, and urgency indicators.
 */

import type { PaymentCountdown, InvoiceStatus } from './types';

export function calculatePaymentCountdown(params: {
  dueDate: string | Date;
  status: InvoiceStatus;
  isDisputed?: boolean;
  paidAmount?: number;
  totalAmount?: number;
  referenceDate?: Date; // Allows deterministic testing
}): PaymentCountdown {
  const now = params.referenceDate || new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const targetDateRaw = typeof params.dueDate === 'string' ? new Date(params.dueDate) : params.dueDate;
  const targetDate = new Date(targetDateRaw.getFullYear(), targetDateRaw.getMonth(), targetDateRaw.getDate());

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const isFullyPaid = params.status === 'PAID' || (params.totalAmount && params.paidAmount && params.paidAmount >= params.totalAmount);
  const isPartiallyPaid = params.status === 'PARTIALLY_PAID' || (params.paidAmount && params.paidAmount > 0 && !isFullyPaid);
  const isDisputed = Boolean(params.isDisputed || params.status === 'DISPUTED');
  const isCancelled = params.status === 'CANCELLED' || params.status === 'WRITTEN_OFF';

  if (isFullyPaid) {
    return {
      daysRemaining: 0,
      daysOverdue: 0,
      isOverdue: false,
      isDueToday: false,
      displayStatus: 'FULLY PAID',
      urgencyLevel: 'SETTLED',
    };
  }

  if (isCancelled) {
    return {
      daysRemaining: 0,
      daysOverdue: 0,
      isOverdue: false,
      isDueToday: false,
      displayStatus: 'CANCELLED',
      urgencyLevel: 'SETTLED',
    };
  }

  if (isDisputed) {
    const daysRemaining = diffDays > 0 ? diffDays : 0;
    const daysOverdue = diffDays < 0 ? Math.abs(diffDays) : 0;
    return {
      daysRemaining,
      daysOverdue,
      isOverdue: false, // Disputed invoices are not marked as in default
      isDueToday: diffDays === 0,
      displayStatus: 'DISPUTED — NOT IN DEFAULT',
      urgencyLevel: 'MEDIUM',
    };
  }

  if (diffDays === 0) {
    return {
      daysRemaining: 0,
      daysOverdue: 0,
      isOverdue: false,
      isDueToday: true,
      displayStatus: 'PAYMENT DUE TODAY',
      urgencyLevel: 'HIGH',
    };
  }

  if (diffDays > 0) {
    return {
      daysRemaining: diffDays,
      daysOverdue: 0,
      isOverdue: false,
      isDueToday: false,
      displayStatus: isPartiallyPaid ? 'PARTIALLY PAID' : `PAYMENT DUE IN ${diffDays} DAYS`,
      urgencyLevel: diffDays <= 3 ? 'HIGH' : diffDays <= 7 ? 'MEDIUM' : 'LOW',
    };
  }

  // diffDays < 0: Overdue
  const daysOverdue = Math.abs(diffDays);
  return {
    daysRemaining: 0,
    daysOverdue,
    isOverdue: true,
    isDueToday: false,
    displayStatus: `OVERDUE BY ${daysOverdue} DAYS`,
    urgencyLevel: daysOverdue > 15 ? 'CRITICAL' : 'HIGH',
  };
}

/**
 * Calculates a contractual due date based on payment terms
 */
export function calculateContractualDueDate(params: {
  invoiceDate: string | Date;
  terms: string;
  termsDays?: number;
}): Date {
  const base = typeof params.invoiceDate === 'string' ? new Date(params.invoiceDate) : new Date(params.invoiceDate);
  const result = new Date(base.getTime());

  if (params.termsDays !== undefined && params.termsDays >= 0) {
    result.setDate(result.getDate() + params.termsDays);
    return result;
  }

  switch (params.terms.toUpperCase()) {
    case 'NET_7':
      result.setDate(result.getDate() + 7);
      break;
    case 'NET_15':
      result.setDate(result.getDate() + 15);
      break;
    case 'NET_45':
      result.setDate(result.getDate() + 45);
      break;
    case 'NET_60':
      result.setDate(result.getDate() + 60);
      break;
    case 'IMMEDIATE':
    case 'ADVANCE_100':
      // Due on same date
      break;
    case 'NET_30':
    default:
      result.setDate(result.getDate() + 30);
      break;
  }

  return result;
}
