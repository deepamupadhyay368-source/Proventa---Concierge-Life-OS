import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth/session';
import {
  Users,
  Search,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowUpRight,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  CalendarCheck,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string; city?: string; page?: string };
}) {
  await requireSuperAdmin();

  const query = searchParams?.q?.toLowerCase()?.trim();
  const statusFilter = searchParams?.status;
  const cityFilter = searchParams?.city;
  const currentPage = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const pageSize = 15;
  const skip = (currentPage - 1) * pageSize;

  const whereClause: any = {
    user: {
      ...(query
        ? {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(statusFilter ? { status: statusFilter as any } : {}),
    },
    ...(cityFilter ? { city: { equals: cityFilter, mode: 'insensitive' } } : {}),
  };

  const [totalCount, customers] = await Promise.all([
    db.customerProfile.count({ where: whereClause }),
    db.customerProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
            userRoles: true,
          },
        },
        preferences: true,
        _count: {
          select: {
            tasks: true,
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#23201c] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest bg-[#26211b] text-[#c8b99d] px-2.5 py-0.5 rounded border border-[#3e352b]">
              Sovereign Customer Vault
            </span>
            <span className="text-xs text-[#736f68] font-mono">
              DPDP Act 2023 Compliant · Direct Founder Telemetry
            </span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[#f5f3ef] mt-2">
            Customer Directory &amp; Intelligence
          </h1>
          <p className="text-xs text-[#928f88] mt-1 max-w-2xl">
            Audit customer accounts, explicit taste preferences, request volumes, and active bookings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#141210] border border-[#23201c] text-xs font-mono text-[#c8b99d]">
            Total Records: <span className="font-bold text-[#f5f3ef]">{totalCount}</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#141210] border border-[#23201c] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form method="GET" action="/admin/customers" className="flex-1 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#736f68] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={searchParams?.q || ''}
              placeholder="Search by customer name, email, or telephone..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0e0d0c] border border-[#23201c] text-xs text-[#f5f3ef] placeholder-[#524e47] focus:outline-none focus:border-[#9c8260] transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#26211b] border border-[#3e352b] hover:bg-[#322c24] text-xs font-medium text-[#f5f3ef] transition-colors"
          >
            Filter
          </button>
          {(query || statusFilter || cityFilter) && (
            <Link
              href="/admin/customers"
              className="px-3 py-2 text-xs text-[#736f68] hover:text-[#c8b99d] transition-colors font-mono"
            >
              Reset
            </Link>
          )}
        </form>

        <div className="flex items-center gap-2">
          {['ALL', 'ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED'].map((st) => {
            const isCurrent =
              st === 'ALL' ? !statusFilter : statusFilter === st;
            const queryParams = new URLSearchParams();
            if (query) queryParams.set('q', query);
            if (cityFilter) queryParams.set('city', cityFilter);
            if (st !== 'ALL') queryParams.set('status', st);

            return (
              <Link
                key={st}
                href={`/admin/customers?${queryParams.toString()}`}
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

      {/* Customer Directory Ledger */}
      <div className="bg-[#141210] border border-[#23201c] rounded-2xl overflow-hidden shadow-md">
        {customers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1a1714] border border-[#282420] text-[#736f68] flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-[#f5f3ef]">No customer records located</div>
            <p className="text-xs text-[#736f68] max-w-sm mx-auto">
              No customer profile matched your search query. Try clearing filters or inspecting the Wave 1 waitlist.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#23201c] bg-[#100f0d] text-[#736f68] font-mono uppercase text-[10px]">
                  <th className="py-3 px-4 font-normal">Customer</th>
                  <th className="py-3 px-4 font-normal">Contact</th>
                  <th className="py-3 px-4 font-normal">Location</th>
                  <th className="py-3 px-4 font-normal text-center">Requests</th>
                  <th className="py-3 px-4 font-normal text-center">Bookings</th>
                  <th className="py-3 px-4 font-normal">Status</th>
                  <th className="py-3 px-4 font-normal">Registered</th>
                  <th className="py-3 px-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1916]">
                {customers.map((c) => {
                  const user = c.user;
                  const isVip = user.userRoles?.some((r) => r.role === 'SUPER_ADMIN' || r.role === 'ADMIN');
                  return (
                    <tr key={c.id} className="hover:bg-[#181614] transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#1f1b17] border border-[#352f27] flex items-center justify-center font-serif font-bold text-[#c8b99d]">
                            {user.name ? user.name.charAt(0) : 'C'}
                          </div>
                          <div>
                            <div className="font-medium text-[#f5f3ef] flex items-center gap-1.5">
                              <span>{user.name || 'Private Member'}</span>
                              {isVip && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#2a241e] text-[#c8b99d] border border-[#3d342a]">
                                  STAFF
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#736f68] font-mono">{user.id.slice(0, 10)}...</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#a8a49c]">
                        <div>{user.email}</div>
                        <div className="text-[#736f68] text-[11px]">{user.phone || 'No phone'}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#a8a49c]">
                        {c.city || 'Ahmedabad'}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-medium text-[#f5f3ef]">
                        {c._count.tasks}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-medium text-[#f5f3ef]">
                        {c._count.bookings}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
                            user.status === 'ACTIVE'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : user.status === 'PENDING_VERIFICATION'
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                              : 'bg-red-950/60 text-red-400 border border-red-800/40'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#736f68] font-mono text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1c1916] border border-[#2a241e] hover:border-[#3d342a] text-xs text-[#c8b99d] transition-colors"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
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
              Showing {skip + 1} - {Math.min(skip + pageSize, totalCount)} of {totalCount} members
            </div>
            <div className="flex items-center gap-2">
              {currentPage > 1 ? (
                <Link
                  href={`/admin/customers?page=${currentPage - 1}${query ? `&q=${query}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
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
                  href={`/admin/customers?page=${currentPage + 1}${query ? `&q=${query}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
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
