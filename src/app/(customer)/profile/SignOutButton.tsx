'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { LogOut, Loader2 } from 'lucide-react';

export function SignOutButton({ className = '' }: { className?: string }) {
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut({ callbackUrl: '/sign-in' });
    } catch {
      window.location.href = '/sign-in';
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#F1F3F5] hover:bg-[#E1E5E8] text-[#1F2933] border border-[#E1E5E8] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-2xs ${className}`}
    >
      {signingOut ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Signing Out...</span>
        </>
      ) : (
        <>
          <LogOut className="h-3.5 w-3.5 text-[#66717C]" />
          <span>Sign Out</span>
        </>
      )}
    </button>
  );
}
