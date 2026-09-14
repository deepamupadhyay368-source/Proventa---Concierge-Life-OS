import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Building,
  User,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string };
}) {
  await requireAdmin();

  const query = searchParams?.q?.toLowerCase()?.trim();
  const status = searchParams?.status;

  const bookings = await db.booking.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(query
        ? {
            OR: [
              { confirmationRef: { contains: query, mode: 'insensitive' } },
              { customer: { user: { name: { contains: query, mode: 'insensitive' } } } },
              { customer: { user: { email: { contains: query, mode: 'insensitive' } } } },
            ],
          }
        : {}),
    },
    include: {
      customer: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
      provider: {
        select: { name: true, category: { select: { name: true } } },
      },
      payment: true,
      request: {
        select: { publicId: true, rawInput: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#23201c] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest bg-[#26211b] text-[#c8b99d] px-2.5 py-0.5 rounded border border-[#3e352b]">
              Fulfillment Network
            </span>
            <span className="text-xs text-[#736f68] font-mono">
              Partner Providers &amp; Third-Party Gateways
            </span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[#f5f3ef] mt-2">
            Verified Bookings Hub
          </h1>
          <p className="text-xs text-[#928f88] mt-1 max-w-2xl">
            Real-time ledger of confirmed partner reservations across dining, luxury stays, PVR multiplex, and chauffeur mobility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-[#141210] border border-[#23201c] text-xs font-mono text-[#c8b99d]">
            Total Bookings: {bookings.length}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-[#141210] border border-[#23201c] rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#23201c] text-[#736f68] font-mono uppercase text-[10px]">
                <th className="py-3.5 px-6 font-medium">CONFIRMATION / PNR</th>
                <th className="py-3.5 px-4 font-medium">CLIENT</th>
                <th className="py-3.5 px-4 font-medium">PROVIDER / VENUE</th>
                <th className="py-3.5 px-4 font-medium">STATUS</th>
                <th className="py-3.5 px-4 font-medium">DATE & TIME</th>
                <th className="py-3.5 px-6 text-right font-medium">AMOUNT (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1b18]">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#736f68]">
                    No partner bookings match current criteria.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const isConfirmed = b.status === 'CONFIRMED';
                  const details = b.details as any;
                  const venueName =
                    b.provider?.name || details?.providerName || details?.restaurant || 'Bespoke Provider';

                  return (
                    <tr key={b.id} className="hover:bg-[#181512] transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-mono font-bold text-[#c8b99d]">
                          {b.confirmationRef || `BK-${b.id.slice(-6).toUpperCase()}`}
                        </div>
                        <div className="text-[10px] text-[#736f68] font-mono mt-0.5">
                          ID: {b.id.slice(0, 12)}...
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-[#f5f3ef]">
                          {b.customer?.user?.name || 'Private VIP Client'}
                        </div>
                        <div className="text-[11px] text-[#736f68] font-mono">
                          {b.customer?.user?.email}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-[#f5f3ef] font-medium">{venueName}</div>
                        <div className="text-[11px] text-[#736f68] font-mono">
                          {b.provider?.category?.name || 'Concierge Curation'}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-medium ${
                            isConfirmed
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-[#736f68] font-mono text-[11px]">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-6 text-right font-mono font-bold text-[#f5f3ef]">
                        {b.payment?.amount
                          ? `₹${(b.payment.amount / 100).toLocaleString('en-IN')}`
                          : details?.price || details?.estimatedPrice || 'Quoted'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
