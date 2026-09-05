'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Layers, CheckCircle2, ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';

export default function ConciergeOpsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans">
      {/* Concierge Ops Top Bar */}
      <header className="bg-neutral-900 text-white px-6 h-14 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-tight text-white text-base">Proventa Concierge OS</span>
            <span className="text-[10px] bg-neutral-800 text-neutral-300 border border-neutral-700 px-2 py-0.5 rounded font-mono">
              Operations Hub
            </span>
          </div>

          <nav className="flex items-center gap-2 text-xs">
            <Link
              href="/concierge-ops/queue"
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                pathname.startsWith('/concierge-ops/queue')
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Operations Queue
            </Link>
            <Link
              href="/admin/overview"
              className="px-3 py-1.5 rounded-md font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Admin Panel
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-green-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Shift Active (09:00 - 21:00)</span>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Customer View</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-neutral-400 hover:text-white"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Operations Container */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
    </div>
  );
}
