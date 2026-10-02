import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
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
  await requireAdmin();

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E1E5E8] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest bg-[#F1F3F5] text-[#1F2933] px-2.5 py-0.5 rounded border border-[#E1E5E8] font-medium">
              Sovereign Customer Vault
            </span>
            <span className="text-xs text-[#66717C] font-mono">
              DPDP Act 2023 Compliant · Direct Founder Telemetry
            </span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[#111820] mt-2">
            Customer Directory &amp; Intelligence
          </h1>
          <p className="text-xs text-[#66717C] mt-1 max-w-2xl">
            Audit customer accounts, explicit taste preferences, request volumes, and active bookings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-white border border-[#E1E5E8] text-xs font-mono text-[#1F2933] shadow-xs">
            Total Records: <span className="font-bold text-[#111820]">{totalCount}</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E1E5E8] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <form method="GET" action="/admin/customers" className="flex-1 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#66717C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={searchParams?.q || ''}
              placeholder="Search by customer name, email, or telephone..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] text-xs text-[#111820] placeholder-[#66717C] focus:bg-white focus:outline-hidden focus:border-[#1F2933] transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#1F2933] hover:bg-[#111820] text-xs font-medium text-white transition-colors cursor-pointer shadow-xs"
          >
            Filter
          </button>
          {(query || statusFilter || cityFilter) && (
            <Link
              href="/admin/customers"
              className="px-3 py-2 text-xs text-[#66717C] hover:text-[#111820] transition-colors font-mono"
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
                    ? 'bg-[#1F2933] text-white font-medium shadow-xs'
                    : 'text-[#66717C] hover:text-[#111820] hover:bg-[#F7F8FA]'
                }`}
              >
                {st}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Customer Directory Ledger */}
      <div className="bg-white border border-[#E1E5E8] rounded-2xl overflow-hidden shadow-xs">
        {customers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F8FA] border border-[#E1E5E8] text-[#66717C] flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-[#111820]">No customer records located</div>
            <p className="text-xs text-[#66717C] max-w-sm mx-auto">
              No customer profile matched your search query. Try clearing filters or inspecting the Wave 1 waitlist.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E1E5E8] bg-[#F7F8FA] text-[#66717C] font-mono uppercase text-[10px]">
                  <th className="py-3 px-4 font-medium">Customer</th>
                  <th className="py-3 px-4 font-medium">Plan</th>
                  <th className="py-3 px-4 font-medium">Entitlement</th>
                  <th className="py-3 px-4 font-medium">Contact</th>
                  <th className="py-3 px-4 font-medium">Location</th>
                  <th className="py-3 px-4 font-medium text-center">Requests</th>
                  <th className="py-3 px-4 font-medium text-center">Bookings</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Registered</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E5E8]">
                {customers.map((c) => {
                  const user = c.user;
                  const isVip = user.userRoles?.some((r) => r.role === 'SUPER_ADMIN' || r.role === 'ADMIN');
                  const plan = c.membershipPlan || 'SELECT';
                  const hasActiveMembership = c.membershipStatus === 'ACTIVE';
                  return (
                    <tr key={c.id} className="hover:bg-[#F7F8FA]/60 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#F1F3F5] border border-[#E1E5E8] flex items-center justify-center font-serif font-bold text-[#1F2933]">
                            {user.name ? user.name.charAt(0) : 'C'}
                          </div>
                          <div>
                            <div className="font-medium text-[#111820] flex items-center gap-1.5">
                              <span>{user.name || 'Private Member'}</span>
                              {isVip && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#F1F3F5] text-[#1F2933] border border-[#E1E5E8]">
                                  STAFF
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#66717C] font-mono">{user.id.slice(0, 10)}...</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            plan === 'RESERVE'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : plan === 'PRIVATE'
                              ? 'bg-[#1F2933] text-white border border-[#111820]'
                              : 'bg-[#F1F3F5] text-[#1F2933] border border-[#E1E5E8]'
                          }`}
                        >
                          {plan}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {hasActiveMembership ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ACTIVE MEMBER
                          </span>
                        ) : c.freeRequestUsed ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-medium bg-[#F1F3F5] text-[#66717C] border border-[#E1E5E8]">
                            FREE USED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            FREE AVAILABLE
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#111820]">
                        <div>{user.email}</div>
                        <div className="text-[#66717C] text-[11px]">{user.phone || 'No phone'}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#111820]">
                        {c.city || 'Ahmedabad'}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-medium text-[#111820]">
                        {c._count.tasks}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-medium text-[#111820]">
                        {c._count.bookings}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
                            user.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : user.status === 'PENDING_VERIFICATION'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#66717C] font-mono text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E1E5E8] hover:bg-[#F7F8FA] hover:border-[#A7B0B8] text-xs text-[#1F2933] font-medium transition-colors shadow-xs"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#66717C]" />
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
          <div className="p-4 border-t border-[#E1E5E8] bg-[#F7F8FA] flex items-center justify-between">
            <div className="text-xs text-[#66717C] font-mono">
              Showing {skip + 1} - {Math.min(skip + pageSize, totalCount)} of {totalCount} members
            </div>
            <div className="flex items-center gap-2">
              {currentPage > 1 ? (
                <Link
                  href={`/admin/customers?page=${currentPage - 1}${query ? `&q=${query}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E1E5E8] text-xs text-[#1F2933] hover:bg-[#F7F8FA] flex items-center gap-1 transition-colors shadow-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg bg-[#F7F8FA] border border-[#E1E5E8] text-xs text-[#8C96A0] flex items-center gap-1 cursor-not-allowed">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </span>
              )}

              <span className="text-xs font-mono text-[#111820] px-2 font-medium">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={`/admin/customers?page=${currentPage + 1}${query ? `&q=${query}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E1E5E8] text-xs text-[#1F2933] hover:bg-[#F7F8FA] flex items-center gap-1 transition-colors shadow-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg bg-[#F7F8FA] border border-[#E1E5E8] text-xs text-[#8C96A0] flex items-center gap-1 cursor-not-allowed">
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
