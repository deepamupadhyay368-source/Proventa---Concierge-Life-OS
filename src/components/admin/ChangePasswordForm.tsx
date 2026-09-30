'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  LogOut,
} from 'lucide-react';

export function ChangePasswordForm() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Live password validation checks
  const checks = {
    length: newPassword.length >= 10,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(newPassword),
    match: newPassword.length > 0 && newPassword === confirmPassword,
    different: newPassword.length > 0 && currentPassword.length > 0 && newPassword !== currentPassword,
  };

  const isFormValid =
    checks.length &&
    checks.upper &&
    checks.lower &&
    checks.number &&
    checks.special &&
    checks.match &&
    checks.different &&
    currentPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update password. Please check your credentials.');
      } else {
        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setError('A network exception occurred while transmitting credentials. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#141210] border border-emerald-800/40 rounded-2xl p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#1F2933]">
              Password Successfully Updated
            </h3>
            <p className="text-xs text-[#66717C] font-mono mt-0.5">
              Cryptographic hash verified · Sessions revoked
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] text-xs text-[#303942] space-y-2 font-mono">
          <p className="text-[#1F2933] font-medium">Security Confirmation:</p>
          <ul className="list-disc list-inside space-y-1 text-[#66717C]">
            <li>Your new private password has been safely hashed with bcrypt (12 rounds).</li>
            <li>All other active sessions and tokens have been revoked.</li>
            <li>Please re-authenticate now with your new credentials to establish an active session.</li>
          </ul>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F2933] hover:bg-[#111820] text-white font-semibold text-xs shadow-xs transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out &amp; Log In With New Password</span>
          </button>
          <button
            onClick={() => setSuccess(false)}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#E1E5E8] hover:bg-[#F7F8FA] text-xs font-mono text-[#1F2933] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#E1E5E8] rounded-2xl p-8 space-y-6 shadow-xs">
      <div className="space-y-1 pb-4 border-b border-[#E1E5E8]">
        <h2 className="text-base font-semibold text-[#1F2933] flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#1F2933]" />
          <span>Update Founder Password</span>
        </h2>
        <p className="text-xs text-[#66717C]">
          Set a unique, private password for sovereign SUPER_ADMIN access. Plaintext passwords are never stored or logged.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{error}</div>
        </div>
      )}

      {/* Current Password */}
      <div className="space-y-1.5">
        <label className="block text-xs font-mono text-[#1F2933] tracking-wide uppercase">
          Current Password
        </label>
        <div className="relative">
          <input
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            placeholder="Enter your current account password..."
            className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] text-xs text-[#1F2933] placeholder-[#66717C] focus:outline-none focus:border-[#1F2933] focus:bg-white transition-colors font-mono"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#66717C] hover:text-[#1F2933] transition-colors"
            tabIndex={-1}
          >
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div className="space-y-1.5">
        <label className="block text-xs font-mono text-[#1F2933] tracking-wide uppercase">
          New Private Password
        </label>
        <div className="relative">
          <input
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Choose a strong new password..."
            className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] text-xs text-[#1F2933] placeholder-[#66717C] focus:outline-none focus:border-[#1F2933] focus:bg-white transition-colors font-mono"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#66717C] hover:text-[#1F2933] transition-colors"
            tabIndex={-1}
          >
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Confirm New Password */}
      <div className="space-y-1.5">
        <label className="block text-xs font-mono text-[#1F2933] tracking-wide uppercase">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Re-enter your new password..."
            className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] text-xs text-[#1F2933] placeholder-[#66717C] focus:outline-none focus:border-[#1F2933] focus:bg-white transition-colors font-mono"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#66717C] hover:text-[#1F2933] transition-colors"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Live Strength Checklist */}
      <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] space-y-2">
        <span className="text-[10px] font-mono uppercase text-[#66717C] tracking-wider block">
          Password Complexity Requirements
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          <div className={`flex items-center gap-2 ${checks.length ? 'text-emerald-700' : 'text-[#66717C]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${checks.length ? 'bg-emerald-600' : 'bg-[#A7B0B8]'}`} />
            <span>Minimum 10 characters</span>
          </div>
          <div className={`flex items-center gap-2 ${checks.upper ? 'text-emerald-700' : 'text-[#66717C]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${checks.upper ? 'bg-emerald-600' : 'bg-[#A7B0B8]'}`} />
            <span>One uppercase letter (A-Z)</span>
          </div>
          <div className={`flex items-center gap-2 ${checks.lower ? 'text-emerald-700' : 'text-[#66717C]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${checks.lower ? 'bg-emerald-600' : 'bg-[#A7B0B8]'}`} />
            <span>One lowercase letter (a-z)</span>
          </div>
          <div className={`flex items-center gap-2 ${checks.number ? 'text-emerald-700' : 'text-[#66717C]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${checks.number ? 'bg-emerald-600' : 'bg-[#A7B0B8]'}`} />
            <span>One number (0-9)</span>
          </div>
          <div className={`flex items-center gap-2 ${checks.special ? 'text-emerald-700' : 'text-[#66717C]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${checks.special ? 'bg-emerald-600' : 'bg-[#A7B0B8]'}`} />
            <span>One special symbol (!@#$%^&*...)</span>
          </div>
          <div className={`flex items-center gap-2 ${checks.match ? 'text-emerald-700' : 'text-[#66717C]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${checks.match ? 'bg-emerald-600' : 'bg-[#A7B0B8]'}`} />
            <span>Both passwords match</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !isFormValid}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1F2933] hover:bg-[#111820] text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying &amp; Encrypting...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            <span>Update Password &amp; Invalidate Sessions</span>
          </>
        )}
      </button>
    </form>
  );
}
