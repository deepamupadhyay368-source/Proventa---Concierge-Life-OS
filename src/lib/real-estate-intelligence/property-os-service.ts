/**
 * PROVENTA — MODULE 6: PROPERTY OS (DIGITAL PROPERTY PASSPORT) ENGINE
 * Strictly private owner portfolio analytics & lifecycle reminders.
 * Owner data is NEVER leaked to the public Property Registry.
 */

import { formatInrFromPaise } from '@/lib/construction-procurement/money';

export interface PassportSummaryInput {
  id: string;
  ownerUserId: string;
  purchasePricePaise: bigint;
  currentEstimatedPaise: bigint;
  occupancyStatus: string;
  expenses: Array<{ amountPaise: bigint; expenseDate: Date }>;
  leases: Array<{ monthlyRentPaise: bigint; leaseEndDate: Date; status: string; tenantName: string }>;
  maintenanceRecords: Array<{ costPaise: bigint; status: string; title: string; scheduledDate?: Date | null }>;
}

export function computeOwnerPortfolioSummary(
  passports: readonly PassportSummaryInput[],
  now: Date = new Date()
) {
  let totalAcquisitionPaise = BigInt(0);
  let totalEstimatedValuePaise = BigInt(0);
  let annualRentalIncomePaise = BigInt(0);
  let annualExpensesPaise = BigInt(0);
  let vacantCount = 0;

  const upcomingAlerts: Array<{ type: 'LEASE_EXPIRY' | 'MAINTENANCE_DUE'; passportId: string; message: string }> = [];
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 3600 * 1000);
  const in60Days = new Date(now.getTime() + 60 * 24 * 3600 * 1000);

  for (const p of passports) {
    totalAcquisitionPaise += p.purchasePricePaise;
    totalEstimatedValuePaise += p.currentEstimatedPaise > BigInt(0) ? p.currentEstimatedPaise : p.purchasePricePaise;
    if (p.occupancyStatus === 'VACANT') vacantCount++;

    for (const exp of p.expenses) {
      if (exp.expenseDate.getTime() >= oneYearAgo.getTime()) {
        annualExpensesPaise += exp.amountPaise;
      }
    }

    for (const lease of p.leases) {
      if (lease.status === 'ACTIVE') {
        annualRentalIncomePaise += lease.monthlyRentPaise * BigInt(12);
        if (lease.leaseEndDate.getTime() <= in60Days.getTime() && lease.leaseEndDate.getTime() >= now.getTime()) {
          upcomingAlerts.push({
            type: 'LEASE_EXPIRY',
            passportId: p.id,
            message: `Lease with ${lease.tenantName} expires on ${lease.leaseEndDate.toISOString().split('T')[0]}.`,
          });
        }
      }
    }

    for (const m of p.maintenanceRecords) {
      if (m.status !== 'COMPLETED') {
        upcomingAlerts.push({
          type: 'MAINTENANCE_DUE',
          passportId: p.id,
          message: `Open maintenance task: ${m.title}${m.scheduledDate ? ` (due ${m.scheduledDate.toISOString().split('T')[0]})` : ''}.`,
        });
      }
    }
  }

  const appreciationPaise = totalEstimatedValuePaise - totalAcquisitionPaise;
  const appreciationPercent =
    totalAcquisitionPaise > BigInt(0)
      ? Math.round((Number(appreciationPaise) / Number(totalAcquisitionPaise)) * 10000) / 100
      : 0;

  const netAnnualIncomePaise = annualRentalIncomePaise - annualExpensesPaise;
  const netRentalYieldPercent =
    totalEstimatedValuePaise > BigInt(0)
      ? Math.round((Number(netAnnualIncomePaise) / Number(totalEstimatedValuePaise)) * 10000) / 100
      : 0;

  return {
    totalProperties: passports.length,
    vacantProperties: vacantCount,
    totalAcquisitionPaise: totalAcquisitionPaise.toString(),
    totalAcquisitionFormatted: formatInrFromPaise(totalAcquisitionPaise),
    totalEstimatedValuePaise: totalEstimatedValuePaise.toString(),
    totalEstimatedValueFormatted: formatInrFromPaise(totalEstimatedValuePaise),
    appreciationFormatted: formatInrFromPaise(appreciationPaise),
    appreciationPercent,
    annualRentalIncomeFormatted: formatInrFromPaise(annualRentalIncomePaise),
    annualExpensesFormatted: formatInrFromPaise(annualExpensesPaise),
    netRentalYieldPercent,
    upcomingAlerts,
    privacyNotice: 'Private Property OS portfolio data is strictly owner-isolated and never published to the public registry.',
  };
}
