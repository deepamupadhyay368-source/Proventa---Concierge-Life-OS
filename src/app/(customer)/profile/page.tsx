import { requireAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { Shield, KeyRound, Lock, User, Sparkles, LogOut, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { DataControls } from './DataControls';
import { ProfileEditForm } from './ProfileEditForm';
import { MembershipManager } from './MembershipManager';
import { SignOutButton } from './SignOutButton';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const sessionUser = await requireAuth();
  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      customerProfile: true,
      userRoles: true,
    },
  });

  const hasAuthKey = Boolean(user?.securityKeyHash);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E1E5E8]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider bg-[#F1F3F5] text-[#1F2933] border border-[#E1E5E8] rounded-full px-2.5 py-0.5">
              Customer Account
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-[#1F2933]">Profile &amp; Security</h1>
          <p className="text-xs text-[#66717C] mt-1">
            Manage your sovereign identity, Proventa Authentication Key, membership, preferences, and privacy rights.
          </p>
        </div>

        <div className="shrink-0">
          <SignOutButton />
        </div>
      </div>

      {/* 1. PERSONAL INFORMATION & AVATAR CARD */}
      <section className="bg-white border border-[#E1E5E8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1F2933] text-white flex items-center justify-center text-2xl font-serif font-bold shadow-xs">
              {user?.name?.[0]?.toUpperCase() || 'P'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F2933]">{user?.name || 'Valued Member'}</h2>
              <p className="text-xs text-[#66717C] font-mono mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#F1F3F5] text-[#1F2933] border border-[#E1E5E8] rounded-md px-2 py-0.5">
                  Private Beta Member
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md px-2 py-0.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 text-xs bg-[#F7F8FA] border border-[#E1E5E8] p-3 rounded-xl">
            <div>
              <span className="text-[#66717C] block text-[10px] uppercase tracking-wider font-semibold">Primary City</span>
              <span className="font-semibold text-[#1F2933]">{user?.customerProfile?.city || 'Ahmedabad'}</span>
            </div>
            <div>
              <span className="text-[#66717C] block text-[10px] uppercase tracking-wider font-semibold">Member Since</span>
              <span className="font-semibold text-[#1F2933]">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '2024'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Settings & Preferences Editor */}
        <div className="pt-6 border-t border-[#E1E5E8]">
          <h3 className="text-sm font-semibold text-[#1F2933] mb-1">Personal Details &amp; Concierge Preferences</h3>
          <p className="text-xs text-[#66717C] mb-4">
            Our AI and senior concierge team use your location and communication channel to curate bespoke proposals.
          </p>
          <ProfileEditForm
            initialUser={{
              name: user?.name ?? null,
              email: user?.email ?? '',
              phone: user?.phone ?? null,
              city: user?.customerProfile?.city ?? 'Ahmedabad',
              preferredComm: user?.customerProfile?.preferredComm ?? 'IN_APP',
            }}
          />
        </div>
      </section>

      {/* 2. MEMBERSHIP PLAN */}
      <section className="bg-white border border-[#E1E5E8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#1F2933]" />
          <h2 className="text-base font-semibold text-[#1F2933]">Membership Plan &amp; Entitlements</h2>
        </div>
        <p className="text-xs text-[#66717C]">
          Your Proventa tier dictates your concierge priority desk, autonomous discovery depth, and lifestyle bookings.
        </p>
        <MembershipManager
          currentPlanSlug={user?.customerProfile?.membershipPlan || 'SELECT'}
          status={user?.customerProfile?.membershipStatus || 'ACTIVE'}
          startedAt={user?.customerProfile?.membershipStartedAt || user?.createdAt}
          renewsAt={user?.customerProfile?.membershipRenewsAt}
        />
      </section>

      {/* 3. SECURITY & PROVENTA AUTHENTICATION KEY */}
      <section className="bg-white border border-[#E1E5E8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-[#1F2933]" />
          <h2 className="text-base font-semibold text-[#1F2933]">Security &amp; Identity Credentials</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Proventa Authentication Key Status Box */}
          <div className="p-4 bg-[#F7F8FA] border border-[#E1E5E8] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1F2933] flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-[#1F2933]" />
                Proventa Authentication Key
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold">
                {hasAuthKey ? 'CONFIGURED' : 'PENDING'}
              </span>
            </div>
            <p className="text-[#66717C] leading-relaxed">
              Your 3-factor sovereign identity credential (`PV-XXXXXXXX-XXXXXXXX`). Stored strictly as a salted bcrypt hash.
            </p>
            <div className="pt-2">
              <Link
                href="/forgot-auth-key"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E1E5E8] hover:border-[#1F2933] rounded-lg font-semibold text-[#1F2933] transition-colors"
              >
                <span>Re-issue / Recover Key</span>
              </Link>
            </div>
          </div>

          {/* Password Status Box */}
          <div className="p-4 bg-[#F7F8FA] border border-[#E1E5E8] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1F2933] flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-[#1F2933]" />
                Password &amp; Access
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold">
                ACTIVE
              </span>
            </div>
            <p className="text-[#66717C] leading-relaxed">
              Used in combination with your email and Authentication Key to authorize consequential transactions.
            </p>
            <div className="pt-2">
              <Link
                href="/forgot-password"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E1E5E8] hover:border-[#1F2933] rounded-lg font-semibold text-[#1F2933] transition-colors"
              >
                <span>Change Password</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRIVACY & DATA SOVEREIGNTY CONTROLS (DPDP ACT 2023) */}
      <section className="bg-white border border-[#E1E5E8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#1F2933]" />
          <h2 className="text-base font-semibold text-[#1F2933]">Data Sovereignty &amp; Privacy Rights</h2>
        </div>
        <p className="text-xs text-[#66717C] leading-relaxed">
          In full accordance with India&apos;s Digital Personal Data Protection (DPDP) Act 2023 and Proventa&apos;s Privacy Framework, you retain total ownership of your concierge records. We never monetize personal request data or train public models on your profile.
        </p>

        <div className="pt-2">
          <DataControls />
        </div>
      </section>

      {/* 5. ACCOUNT & SIGN OUT */}
      <section className="bg-white border border-[#E1E5E8] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[#1F2933]">Sign Out of Proventa</h3>
          <p className="text-xs text-[#66717C] mt-0.5">
            Invalidate your active authenticated session on this device.
          </p>
        </div>
        <SignOutButton />
      </section>
    </div>
  );
}
