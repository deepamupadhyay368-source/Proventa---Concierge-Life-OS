'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Home, Inbox, CalendarCheck, Sliders, Bell, User, LogOut, Sparkles, HelpCircle, ListTodo } from 'lucide-react';
import { FloatingConcierge } from '@/components/ui/FloatingConcierge';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Customer Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-semibold tracking-tight text-neutral-900">Proventa</span>
              <span className="text-[10px] uppercase tracking-wider bg-brand-50 text-brand-800 border border-brand-200 rounded px-1.5 py-0.5 font-medium">
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
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
            <Link
              href="/dashboard#new-request"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-700 text-white text-xs font-medium rounded-lg hover:bg-brand-800 transition-colors shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>New Request</span>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Floating Concierge Desk Widget */}
      <FloatingConcierge />

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 flex items-center justify-around py-2 px-1">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                active ? 'text-neutral-900 font-semibold' : 'text-neutral-500'
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
