'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserX, UserCheck, Loader2 } from 'lucide-react';

export function ClientStatusAction({
  userId,
  currentStatus,
}: {
  userId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isSuspended = currentStatus === 'SUSPENDED';
  const newStatus = isSuspended ? 'ACTIVE' : 'SUSPENDED';

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setConfirmOpen(false);
        router.refresh();
      } else {
        alert('Failed to update client status.');
      }
    } catch (e) {
      alert('Network error while updating status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors flex items-center gap-1 cursor-pointer font-medium ${
          isSuspended
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
        }`}
        title={isSuspended ? 'Reactivate Client Account' : 'Suspend Client Account'}
      >
        {isSuspended ? (
          <>
            <UserCheck className="w-3 h-3 text-emerald-600" />
            <span>Reactivate</span>
          </>
        ) : (
          <>
            <UserX className="w-3 h-3 text-red-600" />
            <span>Suspend</span>
          </>
        )}
      </button>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-[#111820]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E1E5E8] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl text-left">
            <h3 className="text-sm font-semibold text-[#111820]">
              Confirm Account {isSuspended ? 'Reactivation' : 'Suspension'}
            </h3>
            <p className="text-xs text-[#66717C] leading-relaxed">
              Are you sure you want to mark this client account as{' '}
              <span className="text-[#111820] font-semibold">{newStatus}</span>? This event will be
              permanently logged in the sovereign audit ledger.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                disabled={loading}
                onClick={() => setConfirmOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#E1E5E8] text-xs text-[#1F2933] hover:bg-[#F7F8FA] transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleToggle}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isSuspended
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm {newStatus}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
