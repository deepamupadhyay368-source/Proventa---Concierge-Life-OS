'use client';

import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import {
  User,
  ShieldCheck,
  Clock,
  LogOut,
  Mail,
  Phone,
  Calendar,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function ConciergeProfilePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const s = await res.json();
          if (s?.user) setCurrentUser(s.user);
        }
      } catch (e) {}
    }
    loadSession();
  }, []);

  const roles: string[] = currentUser?.roles || [];
  const primaryRole = roles[0] || 'CONCIERGE';
  const name = currentUser?.name || 'Concierge Operator';
  const email = currentUser?.email || '';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Operator Profile & Shift Control</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Your Proventa employee identity, credentials, and active shift configuration
        </p>
      </div>

      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
        {/* Avatar & Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 border-2 border-neutral-700 flex items-center justify-center text-xl font-bold text-neutral-950">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{name}</h2>
            <div className="text-xs text-neutral-400">{email}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                {primaryRole.replace(/_/g, ' ')}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Shift</span>
              </span>
            </div>
          </div>
        </div>

        {/* Shift Details */}
        <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">Current Operational Shift:</span>
            <span className="font-mono text-neutral-200">09:00 - 21:00 IST</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">Concierge Desk:</span>
            <span className="text-neutral-200">Ahmedabad & National Operations</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">Execution Policy:</span>
            <span className="text-amber-400 font-mono text-[11px]">Strict Zero-Fabrication</span>
          </div>
        </div>

        {/* Roles & Permissions */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-neutral-300">Assigned System Roles</div>
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <span key={r} className="text-xs font-mono px-2.5 py-1 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-300">
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={() => signOut({ callbackUrl: '/sign-in' })}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-rose-950/60 hover:text-rose-300 text-xs font-semibold text-neutral-300 border border-neutral-700 hover:border-rose-700/60 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>End Shift & Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
