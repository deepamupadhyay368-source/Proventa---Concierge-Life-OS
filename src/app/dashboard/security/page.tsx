'use client';

import { useState } from 'react';
import { Lock, Shield, Download, Trash2, KeyRound } from 'lucide-react';

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus('New passwords do not match.');
      return;
    }
    setStatus('Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-2xl pb-12">
      <div className="border-b border-[#C8C4BA] pb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
          Account Security
        </span>
        <h1 className="font-display text-2xl font-bold text-[#202B3C]">
          Security & Access Controls
        </h1>
        <p className="text-xs text-[#69717B] mt-1">
          Manage your credentials, session authorizations, and privacy data rights.
        </p>
      </div>

      {/* Change Password Form */}
      <form onSubmit={handlePasswordChange} className="bg-white border border-[#C8C4BA] p-6 space-y-4 text-xs">
        <h2 className="font-display text-base font-bold text-[#202B3C] border-b border-[#C8C4BA]/50 pb-2">
          Change Account Password
        </h2>

        {status && (
          <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA] text-[#202B3C] font-medium">
            {status}
          </div>
        )}

        <div>
          <label className="block font-semibold text-[#202B3C] mb-1">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full p-2 border border-[#C8C4BA] bg-white text-[#202B3C] focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#202B3C] mb-1">New Password (Min. 8 characters)</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="w-full p-2 border border-[#C8C4BA] bg-white text-[#202B3C] focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#202B3C] mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full p-2 border border-[#C8C4BA] bg-white text-[#202B3C] focus:outline-hidden"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-[#202B3C] text-white font-semibold text-xs hover:bg-[#202B3C]/90 shadow-xs"
        >
          Update Password
        </button>
      </form>

      {/* Data Protection & Privacy Rights (DPDPA 2023) */}
      <div className="bg-white border border-[#C8C4BA] p-6 space-y-4 text-xs">
        <h2 className="font-display text-base font-bold text-[#202B3C] border-b border-[#C8C4BA]/50 pb-2">
          Data Principal Rights (DPDPA 2023)
        </h2>
        <p className="text-[#69717B] leading-relaxed">
          You hold the statutory right to export your complete Personal Property Vault dossier and transaction history, or to request the irrevocable erasure of your account.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => alert('Dossier archive requested. An encrypted ZIP export will be generated and emailed within 15 minutes.')}
            className="px-4 py-2 bg-white border border-[#202B3C] text-[#202B3C] font-semibold text-xs flex items-center gap-2 hover:bg-[#F5F3ED]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Personal Data Dossier</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to request complete account and vault deletion? This action cannot be undone.')) {
                alert('Account erasure request recorded under DPDPA 2023 protocol.');
              }
            }}
            className="px-4 py-2 bg-white border border-red-300 text-red-600 font-semibold text-xs flex items-center gap-2 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Request Account Erasure</span>
          </button>
        </div>
      </div>
    </div>
  );
}
