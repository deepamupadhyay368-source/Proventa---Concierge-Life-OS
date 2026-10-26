'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Home,
  Building2,
  Package,
  PlusCircle,
  Bell,
  User,
  LogOut,
  Briefcase,
} from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { getTimeAwareGreeting } from '@/lib/auth/greeting';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<{
    name?: string | null;
    email?: string;
  } | null>(null);

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
    { href: '/dashboard', label: 'My Dashboard', icon: Home },
    { href: '/businesses', label: 'Explore Businesses', icon: Building2 },
    { href: '/listings', label: 'Products & Services', icon: Package },
    { href: '/business/dashboard', label: 'Business Mode', icon: Briefcase },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/profile', label: 'Account', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container-wide h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-foreground text-background flex items-center justify-center font-display font-bold text-sm">
                P
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                {BRAND_CONFIG.name}
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
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
              <span className="hidden lg:inline-flex text-xs font-medium text-muted-foreground border border-border bg-background px-3 py-1 rounded-full">
                {greeting}
              </span>
            )}

            <Link
              href="/enquiries/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-foreground text-background text-xs font-semibold rounded-lg hover:bg-foreground/90 transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Post an Enquiry</span>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container-wide w-full py-6 sm:py-10 pb-28 sm:pb-12">
        {children}
      </main>

      <footer className="border-t border-border bg-card py-6 text-xs text-muted-foreground hidden md:block">
        <div className="container-wide flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            &copy; {new Date().getFullYear()} {BRAND_CONFIG.name} &middot;{' '}
            {BRAND_CONFIG.tagline}
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/guidelines" className="hover:text-foreground">
              Marketplace Guidelines
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Help &amp; Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
