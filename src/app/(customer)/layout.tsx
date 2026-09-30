'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Home, Inbox, CalendarCheck, Sliders, Bell, User, LogOut, Sparkles, HelpCircle, ListTodo } from 'lucide-react';
import { FloatingConcierge } from '@/components/ui/FloatingConcierge';
import { getTimeAwareGreeting } from '@/lib/auth/greeting';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<{ name?: string | null; email?: string } | null>(null);

  useEffect(() => {
    fetch('/api/customer/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile) setUserProfile(data.profile);
      })
      .catch(() => {});
  }, []);

  const greeting = getTimeAwareGreeting(userProfile?.name);

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/tasks', label: 'Tasks', icon: ListTodo },
    { href: '/requests', label: 'Requests', icon: Inbox },
    { href: '/bookings', label: 'Bookings', icon: CalendarCheck },
    { href: '/preferences', label: 'Preferences', icon: Sliders },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/support', label: 'Support', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA]/70 flex flex-col font-sans text-[#1F2933] relative overflow-hidden live-bg-canvas">
      {/* Moving Ambient Glow Orbs for Customer Workspace */}
      <div className="absolute top-10 left-10 w-[450px] h-[450px] bg-gradient-to-br from-[#E5E9ED]/50 to-transparent blur-[120px] pointer-events-none -z-10 live-orb-1" />
      <div className="absolute top-40 right-10 w-[550px] h-[550px] bg-gradient-to-tl from-[#F1F3F5]/60 to-transparent blur-[140px] pointer-events-none -z-10 live-orb-2" />

      {/* Customer Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#E1E5E8]/80 shadow-[0_2px_15px_rgba(0,0,0,0.02)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <span className="text-xl font-semibold tracking-tight text-[#1F2933] group-hover:opacity-90 transition-opacity">Proventa</span>
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-[#F1F3F5] text-[#1F2933] border border-[#E1E5E8] rounded-full px-2 py-0.5 font-mono font-medium shadow-2xs">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10B981]"></span>
                </span>
                Wave 1
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                      active
                        ? 'bg-[#1F2933] text-white shadow-xs'
                        : 'text-[#66717C] hover:text-[#1F2933] hover:bg-white/80'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {userProfile?.name && (
              <span className="hidden lg:inline-flex text-xs font-medium text-[#66717C] border border-[#E1E5E8] bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-2xs">
                {greeting}
              </span>
            )}

            <Link
              href="/dashboard#new-request"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1F2933] text-white text-xs font-semibold rounded-xl hover:bg-[#111820] hover:shadow-md transition-all shadow-xs active:scale-[0.98]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#A7B0B8]" />
              <span>New Request</span>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-1.5 text-[#66717C] hover:text-[#1F2933] rounded-lg hover:bg-[#F1F3F5] transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>

      {/* Discreet Customer Portal Footer */}
      <footer className="border-t border-[#E1E5E8] bg-white py-6 text-xs text-[#66717C] font-sans hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Proventa · Concierge Life OS</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/legal" className="hover:text-[#1F2933] transition-colors">Trust Center</Link>
            <Link href="/legal/privacy" className="hover:text-[#1F2933] transition-colors">Privacy Policy</Link>
            <Link href="/legal/terms" className="hover:text-[#1F2933] transition-colors">Terms</Link>
            <Link href="/legal/privacy-requests" className="hover:text-[#1F2933] transition-colors font-medium text-[#1F2933]">Data Rights &amp; Export</Link>
            <Link href="/legal/grievance" className="hover:text-[#1F2933] transition-colors">Grievance Desk</Link>
          </div>
        </div>
      </footer>

      {/* Floating Concierge Desk Widget */}
      <FloatingConcierge />

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E1E5E8] flex items-center justify-around py-2 px-1">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                active ? 'text-[#1F2933] font-semibold' : 'text-[#66717C]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
