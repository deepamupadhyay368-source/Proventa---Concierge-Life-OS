import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth/session';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Building,
  User,
  ExternalLink,
  Search,
  Filter,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string; page?: string };
}) {
  await requireSuperAdmin();

  const query = searchParams?.q?.toLowerCase()?.trim();
  const statusFilter = searchParams?.status;
  const currentPage = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const pageSize = 15;
  const skip = (currentPage - 1) * pageSize;

  const whereClause: any = {
    ...(statusFilter ? { status: statusFilter as any } : {}),
    ...(query
      ? {
          OR: [
            { confirmationRef: { contains: query, mode: 'insensitive' } },
            { customer: { user: { name: { contains: query, mode: 'insensitive' } } } },
            { customer: { user: { email: { contains: query, mode: 'insensitive' } } } },
            { provider: { name: { contains: query, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [totalCount, bookings, totalAll, confirmedCount, payments] = await Promise.all([
    db.booking.count({ where: whereClause }),
    db.booking.findMany({
      where: whereClause,
      include: {
        customer: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
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
      skip,
      take: pageSize,
    }),
    db.booking.count(),
    db.booking.count({ where: { status: 'CONFIRMED' } }),
    db.payment.findMany({
      where: { status: 'CAPTURED' },
      select: { amount: true },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const totalGMVPaise = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalGMVFormatted = (totalGMVPaise / 100).toLocaleString('en-IN', {
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
              Transactions Ledger
            </span>
            <span className="text-xs text-[#736f68] font-mono">
              Partner Network Reservations &amp; Settlement
            </span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[#f5f3ef] mt-2">
            Master Bookings Ledger
          </h1>
          <p className="text-xs text-[#928f88] mt-1 max-w-2xl">
            Audit confirmed reservations, payment receipts, external reference codes, and venue fulfillment across all categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#141210] border border-[#23201c] text-xs font-mono text-[#c8b99d]">
            Total Bookings: <span className="font-bold text-[#f5f3ef]">{totalAll}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-4">
          <span className="text-[10px] font-mono text-[#736f68] uppercase block">Total Bookings</span>
          <span className="text-2xl font-bold font-mono text-[#f5f3ef] mt-1 block">{totalAll}</span>
          <span className="text-[11px] text-[#736f68] mt-1 block">Lifetime ledger</span>
        </div>
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-4">
          <span className="text-[10px] font-mono text-emerald-400 uppercase block">Confirmed &amp; Active</span>
          <span className="text-2xl font-bold font-mono text-emerald-300 mt-1 block">{confirmedCount}</span>
          <span className="text-[11px] text-[#736f68] mt-1 block">Fulfillment verified</span>
        </div>
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-4">
          <span className="text-[10px] font-mono text-amber-400 uppercase block">Pending Processing</span>
          <span className="text-2xl font-bold font-mono text-amber-300 mt-1 block">{totalAll - confirmedCount}</span>
          <span className="text-[11px] text-[#736f68] mt-1 block">Awaiting partner lock</span>
        </div>
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-4">
          <span className="text-[10px] font-mono text-[#c8b99d] uppercase block">Captured Volume</span>
          <span className="text-xl font-bold font-mono text-[#f5f3ef] mt-1 block truncate" title={totalGMVFormatted}>
            {totalGMVFormatted}
          </span>
          <span className="text-[11px] text-[#736f68] mt-1 block">Gross merchandise value</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#141210] border border-[#23201c] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form method="GET" action="/admin/bookings" className="flex-1 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#736f68] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={searchParams?.q || ''}
              placeholder="Search by confirmation reference, customer name/email, or provider..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0e0d0c] border border-[#23201c] text-xs text-[#f5f3ef] placeholder-[#524e47] focus:outline-none focus:border-[#9c8260] transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#26211b] border border-[#3e352b] hover:bg-[#322c24] text-xs font-medium text-[#f5f3ef] transition-colors"
          >
            Filter
          </button>
          {(query || statusFilter) && (
            <Link
              href="/admin/bookings"
              className="px-3 py-2 text-xs text-[#736f68] hover:text-[#c8b99d] transition-colors font-mono"
            >
              Reset
            </Link>
          )}
        </form>

        <div className="flex items-center gap-2">
          {['ALL', 'CONFIRMED', 'DRAFT', 'PROCESSING', 'CANCELLED'].map((st) => {
            const isCurrent = st === 'ALL' ? !statusFilter : statusFilter === st;
            const queryParams = new URLSearchParams();
            if (query) queryParams.set('q', query);
            if (st !== 'ALL') queryParams.set('status', st);

            return (
              <Link
                key={st}
                href={`/admin/bookings?${queryParams.toString()}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  isCurrent
                    ? 'bg-[#2a241e] text-[#c8b99d] border border-[#3d342a]'
                    : 'text-[#736f68] hover:text-[#f5f3ef] hover:bg-[#1a1714]'
                }`}
              >
                {st}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bookings Ledger Table */}
      <div className="bg-[#141210] border border-[#23201c] rounded-2xl overflow-hidden shadow-md">
        {bookings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1a1714] border border-[#282420] text-[#736f68] flex items-center justify-center mx-auto">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-[#f5f3ef]">No bookings recorded</div>
            <p className="text-xs text-[#736f68] max-w-sm mx-auto">
              No confirmed bookings match your filter criteria. Bookings are automatically generated once customer approvals are executed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#23201c] bg-[#100f0d] text-[#736f68] font-mono uppercase text-[10px]">
                  <th className="py-3 px-4 font-normal">Reference</th>
                  <th className="py-3 px-4 font-normal">Customer</th>
                  <th className="py-3 px-4 font-normal">Provider &amp; Venue</th>
                  <th className="py-3 px-4 font-normal">Status</th>
                  <th className="py-3 px-4 font-normal">Payment</th>
                  <th className="py-3 px-4 font-normal">Booked At</th>
                  <th className="py-3 px-4 font-normal text-right">Linked Request</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1916]">
                {bookings.map((b) => {
                  const customerUser = b.customer?.user;
                  const details = b.details as any;
                  return (
                    <tr key={b.id} className="hover:bg-[#181614] transition-colors group">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#c8b99d]">
                        {b.confirmationRef || `BKG-${b.id.slice(0, 8).toUpperCase()}`}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-[#f5f3ef] font-medium">{customerUser?.name || 'Private VIP'}</div>
                        <div className="text-[#736f68] text-[11px]">{customerUser?.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-[#f5f3ef] font-medium">
                          {b.provider?.name || details?.venueName || details?.providerName || 'Curated Partner'}
                        </div>
                        <div className="text-[#736f68] text-[11px] font-mono">
                          {b.provider?.category?.name || 'Concierge Partner Network'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : b.status === 'CANCELLED'
                              ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                              : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {b.payment ? (
                          <div>
                            <span className="text-emerald-400 font-medium">
                              ₹{(b.payment.amount / 100).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-[#736f68] block uppercase">
                              {b.payment.status}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#736f68] text-[11px]">Billed on Fulfilment</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[#736f68] font-mono text-[11px]">
                        {new Date(b.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {b.requestId ? (
                          <Link
                            href={`/admin/requests/${b.requestId}`}
                            className="inline-flex items-center gap-1 text-xs text-[#c8b99d] hover:underline font-mono"
                          >
                            <span>#{b.request?.publicId || 'View'}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span className="text-[#524e47] text-[11px] font-mono">Direct Entry</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#23201c] bg-[#100f0d] flex items-center justify-between">
            <div className="text-xs text-[#736f68] font-mono">
              Showing {skip + 1} - {Math.min(skip + pageSize, totalCount)} of {totalCount} bookings
            </div>
            <div className="flex items-center gap-2">
              {currentPage > 1 ? (
                <Link
                  href={`/admin/bookings?page=${currentPage - 1}${query ? `&q=${query}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
                  className="px-3 py-1.5 rounded-lg bg-[#1a1714] border border-[#282420] text-xs text-[#f5f3ef] hover:border-[#3e352b] flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg bg-[#12110f] border border-[#1c1916] text-xs text-[#423e38] flex items-center gap-1 cursor-not-allowed">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </span>
              )}

              <span className="text-xs font-mono text-[#c8b99d] px-2">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={`/admin/bookings?page=${currentPage + 1}${query ? `&q=${query}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
                  className="px-3 py-1.5 rounded-lg bg-[#1a1714] border border-[#282420] text-xs text-[#f5f3ef] hover:border-[#3e352b] flex items-center gap-1 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg bg-[#12110f] border border-[#1c1916] text-xs text-[#423e38] flex items-center gap-1 cursor-not-allowed">
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
