'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  CalendarCheck, 
  FileText, 
  ShieldCheck, 
  CreditCard, 
  User, 
  PhoneCall, 
  PlusCircle,
  Clock,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/customer/dashboard', icon: Home },
    { label: 'Book Service', href: '/customer/book', icon: PlusCircle },
    { label: 'Service Requests', href: '/customer/requests', icon: Clock },
    { label: 'Maintenance Passport', href: '/customer/passport', icon: ShieldCheck },
    { label: 'My Membership', href: '/customer/subscription', icon: Sparkles },
    { label: 'Invoices & Payments', href: '/customer/payments', icon: CreditCard },
    { label: 'Household Profile', href: '/customer/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F0E9] text-[#171A17] font-sans antialiased">
      {/* Top Banner */}
      <div className="bg-[#171A17] text-[#E3DFD5] text-xs py-2 px-4 sm:px-8 border-b border-[#323631]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-white">Member:</span>
            <span>Rajesh & Meera Patel</span>
            <span className="text-stone-400">• Flat 402, Shivalik Parkview, South Bopal, Ahmedabad</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="bg-[#53634A] text-white px-2.5 py-0.5 rounded-full font-medium">Family Plan Active</span>
            <span className="font-mono text-emerald-400">3 of 4 visits left this month</span>
            <span className="hidden md:inline text-stone-400">24/7 Helpline: <strong className="text-white">+91 79 4900 8800</strong></span>
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
                <span className="text-[10px] text-stone-500 uppercase tracking-wider font-medium">Member Portal</span>
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
              href="/customer/book"
              className="inline-flex items-center gap-1.5 bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Book Service Visit</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 border-t border-stone-100 overflow-x-auto scrollbar-none">
          <nav className="flex space-x-1 min-w-max py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/customer/dashboard' && pathname?.startsWith(item.href));
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
          <p>© 2026 PROVENTA Technologies Pvt Ltd • Member Care Ahmedabad</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/refund-policy" className="hover:underline">Refund Policy</Link>
            <a href="tel:+917949008800" className="text-[#53634A] font-semibold flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" /> Emergency Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
