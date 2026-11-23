'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Wrench, 
  Briefcase, 
  Calendar, 
  IndianRupee, 
  ShieldCheck, 
  User, 
  PhoneCall, 
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { homeDataStore } from '@/lib/home/repository';

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const techId = 'tech-elec-01'; // Jignesh Solanki
  const technician = homeDataStore.getTechnicianById(techId);
  const [isAvailable, setIsAvailable] = useState(technician?.isAvailableForDispatch ?? true);

  const navItems = [
    { label: 'Active Workbench', href: '/partner/dashboard', icon: Wrench },
    { label: 'Job Queue', href: '/partner/jobs', icon: Briefcase },
    { label: 'Availability & Schedule', href: '/partner/availability', icon: Calendar },
    { label: 'Earnings & Settlements', href: '/partner/earnings', icon: IndianRupee },
    { label: 'KYC & Profile', href: '/partner/profile', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F0E9] text-[#171A17] font-sans antialiased">
      {/* Top Bar with Status & Lead Partner Info */}
      <div className="bg-[#171A17] text-[#E3DFD5] text-xs py-2 px-4 sm:px-8 border-b border-[#323631]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white">Technician Partner:</span>
            <span>Jignesh Solanki</span>
            <span className="text-stone-400">• Electrical Trade (4.88 ★ · 142 Jobs)</span>
            <span className="text-stone-400">• South Bopal Cluster</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition ${
                isAvailable 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{isAvailable ? 'Available for Dispatch' : 'On Leave / Busy'}</span>
            </button>
            <span className="hidden md:inline text-stone-400">Partner Desk: <strong className="text-white">+91 79 4900 8820</strong></span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-[#E3DFD5] sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#53634A] text-white flex items-center justify-center font-bold text-base">
                P
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-lg text-[#171A17] leading-tight">PROVENTA</span>
                <span className="text-[10px] text-amber-700 uppercase tracking-wider font-bold">Partner Desk</span>
              </div>
            </Link>

            <Link 
              href="/"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-stone-500 hover:text-[#53634A] font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Website
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/partner/register"
              className="text-xs text-stone-600 hover:text-[#53634A] font-semibold hidden sm:inline"
            >
              Register New Tech
            </Link>
            <Link
              href="/partner/dashboard"
              className="inline-flex items-center gap-1.5 bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition"
            >
              <Wrench className="w-4 h-4" />
              <span>Today's Jobs</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 border-t border-stone-100 overflow-x-auto scrollbar-none">
          <nav className="flex space-x-1 min-w-max py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/partner/dashboard' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition ${
                    isActive
                      ? 'bg-[#53634A]/10 text-[#53634A] font-bold'
                      : 'text-stone-600 hover:text-[#171A17] hover:bg-stone-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E3DFD5] bg-white py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 PROVENTA Technologies • Technician Partner Network (Ahmedabad)</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:underline">Partner Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <a href="tel:+917949008820" className="text-[#53634A] font-semibold flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" /> Technician Helpline
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
