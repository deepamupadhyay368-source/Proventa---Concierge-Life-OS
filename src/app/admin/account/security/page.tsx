import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth/session';
import {
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  Lock,
  User,
  Clock,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { ChangePasswordForm } from '@/components/admin/ChangePasswordForm';

export const dynamic = 'force-dynamic';

export default async function AdminSecurityPage() {
  const sessionUser = await requireSuperAdmin();

  // Fetch current user details from DB
  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      userRoles: { select: { role: true } },
    },
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Breadcrumb & Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-[#858077] hover:text-[#c8b99d] transition-colors mb-3 font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Command Center</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#23201c] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1e1a16] border border-[#3d342a] flex items-center justify-center font-mono text-xl font-bold text-[#c8b99d]">
              <KeyRound className="w-7 h-7 text-[#c8b99d]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-medium text-[#f5f3ef]">
                  Account Security &amp; Credentials
                </h1>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  SUPER_ADMIN
                </span>
              </div>
              <p className="text-xs text-[#736f68] font-mono mt-1">
                Sovereign authentication credentials · Root Founder Access Control
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-[#736f68] uppercase block">Authenticated Account</span>
          <span className="text-[#f5f3ef] font-medium block truncate">{user?.email || sessionUser.email}</span>
          <span className="text-[10px] text-[#524e47] block">ID: {user?.id.slice(0, 12)}...</span>
        </div>

        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-[#736f68] uppercase block">Assigned Elevation</span>
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {user?.userRoles.map((r) => (
              <span key={r.role} className="text-[10px] px-2 py-0.5 rounded bg-[#1f1b17] border border-[#352f27] text-[#c8b99d]">
                {r.role}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-[#736f68] uppercase block">Last Credential Update</span>
          <span className="text-[#f5f3ef] font-medium block">
            {user?.updatedAt
              ? new Date(user.updatedAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Initial setup'}
          </span>
          <span className="text-[10px] text-[#524e47] block">Session policy enforced</span>
        </div>
      </div>

      {/* Change Password Form Component */}
      <ChangePasswordForm />

      {/* Security Policies Notice */}
      <div className="p-5 rounded-2xl bg-[#141210] border border-[#23201c] space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#f5f3ef]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Sovereign Security Standards</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#736f68] font-mono leading-relaxed">
          <div>
            <span className="text-[#a8a49c] font-medium block">Rate Limiting Protection:</span>
            Password modification attempts are throttled to a maximum of 5 requests per 15-minute sliding window to prevent automated brute-force attempts.
          </div>
          <div>
            <span className="text-[#a8a49c] font-medium block">Session Invalidation:</span>
            Upon successful modification, all previous active sessions are revoked. You must re-authenticate with the newly configured password.
          </div>
        </div>
      </div>
    </div>
  );
}
