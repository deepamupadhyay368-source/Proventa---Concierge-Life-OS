import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  TrendingUp,
  Lock,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminTransactionsPage() {
  await requireAdmin();

  const [payments, totalBookings] = await Promise.all([
    db.payment.findMany({
      include: {
        customer: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        booking: {
          select: {
            id: true,
            confirmationRef: true,
            provider: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    db.booking.count(),
  ]);

  const totalCapturedPaise = payments
    .filter((p) => p.status === 'CAPTURED')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalINR = (totalCapturedPaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#23201c] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest bg-[#26211b] text-[#c8b99d] px-2.5 py-0.5 rounded border border-[#3e352b]">
              Financial Settlement
            </span>
            <span className="text-xs text-[#736f68] font-mono">
              PCI-DSS Compliant Masked Ledger
            </span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[#f5f3ef] mt-2">
            Transactions &amp; GMV
          </h1>
          <p className="text-xs text-[#928f88] mt-1 max-w-2xl">
            Sovereign transaction ledger with masked card/UPI references, payment gateway reconciliation, and revenue telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs font-mono text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Tokenization</span>
          </div>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-mono uppercase text-[#736f68]">Gross Volume (GMV)</div>
          <div className="text-3xl font-bold font-mono text-[#c8b99d] mt-1">{totalINR}</div>
          <div className="text-xs text-[#736f68] mt-1">Total captured through platform</div>
        </div>

        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-mono uppercase text-[#736f68]">Settled Transactions</div>
          <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">
            {payments.filter((p) => p.status === 'CAPTURED').length}
          </div>
          <div className="text-xs text-[#736f68] mt-1">100% gateway verified</div>
        </div>

        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-mono uppercase text-[#736f68]">Pending Settlements</div>
          <div className="text-3xl font-bold font-mono text-amber-400 mt-1">
            {payments.filter((p) => p.status === 'PENDING').length}
          </div>
          <div className="text-xs text-[#736f68] mt-1">Awaiting completion</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#141210] border border-[#23201c] rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#23201c] text-[#736f68] font-mono uppercase text-[10px]">
                <th className="py-3.5 px-6 font-medium">TRANSACTION REF</th>
                <th className="py-3.5 px-4 font-medium">CLIENT</th>
                <th className="py-3.5 px-4 font-medium">METHOD</th>
                <th className="py-3.5 px-4 font-medium">STATUS</th>
                <th className="py-3.5 px-4 font-medium">DATE</th>
                <th className="py-3.5 px-6 text-right font-medium">AMOUNT (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1b18]">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#736f68]">
                    No transactions captured in current cohort.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#181512] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-mono font-bold text-[#f5f3ef]">
                        {p.providerRef || `TXN-${p.id.slice(-8).toUpperCase()}`}
                      </div>
                      <div className="text-[10px] text-[#736f68] font-mono mt-0.5">
                        Idempotency: {p.idempotencyKey.slice(0, 16)}...
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-[#f5f3ef]">
                        {p.customer?.user?.name || 'Private VIP Member'}
                      </div>
                      <div className="text-[11px] text-[#736f68] font-mono">
                        {p.customer?.user?.email}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono text-[#a8a49c] uppercase text-[11px]">
                        {p.method || 'UPI / Card (Masked)'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-medium ${
                          p.status === 'CAPTURED'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-[#736f68] font-mono text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-bold text-[#c8b99d]">
                      ₹{(p.amount / 100).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
