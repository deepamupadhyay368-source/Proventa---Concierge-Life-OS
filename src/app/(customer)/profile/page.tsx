import { requireAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { Shield } from 'lucide-react';
import { DataControls } from './DataControls';

export default async function ProfilePage() {
  const sessionUser = await requireAuth();
  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      customerProfile: true,
      userRoles: true,
    },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Your Account & Privacy</h1>
        <p className="text-xs text-neutral-500 mt-1">Manage your identity, communication preferences, and data rights.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 text-xl font-semibold">
            {user?.name?.[0] || 'P'}
          </div>
          <div>
            <h2 className="text-base font-semibold text-neutral-900">{user?.name}</h2>
            <p className="text-xs text-neutral-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-50 text-brand-800 border border-brand-200 rounded px-2 py-0.5">
                Wave 1 Member
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200 rounded px-2 py-0.5">
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-neutral-100 text-xs">
          <div>
            <span className="text-neutral-400 font-medium block mb-0.5">Primary Location</span>
            <span className="font-semibold text-neutral-900">{user?.customerProfile?.city || 'Early Access · Cohort 1'}</span>
          </div>
          <div>
            <span className="text-neutral-400 font-medium block mb-0.5">Preferred Channel</span>
            <span className="font-semibold text-neutral-900">{user?.customerProfile?.preferredComm || 'In-App'}</span>
          </div>
          <div>
            <span className="text-neutral-400 font-medium block mb-0.5">Member Since</span>
            <span className="font-semibold text-neutral-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '2024'}
            </span>
          </div>
        </div>
      </div>

      {/* Data Sovereignty & GDPR/DPDP Section */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-neutral-900" />
          <h2 className="text-base font-semibold text-neutral-900">Data Sovereignty & Privacy Controls</h2>
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed">
          In accordance with the Digital Personal Data Protection Act (DPDP) and Proventa's Privacy Guarantee, you retain full ownership of your data. We never use your request history for public model training.
        </p>

        <div className="pt-2">
          <DataControls />
        </div>
      </div>
    </div>
  );
}
