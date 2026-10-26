'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Building2, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BRAND_CONFIG } from '@/lib/brand';

const navLinks = [
  { href: '/businesses', label: 'Explore Businesses' },
  { href: '/listings', label: 'Products & Services' },
  { href: '/enquiries/new', label: 'Post an Enquiry' },
  { href: '/for-businesses', label: 'For Businesses' },
];

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
        scrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-background/85 backdrop-blur-sm border-b border-border/50',
      )}
    >
      <div className="container-wide">
        <nav
          className="flex items-center justify-between h-16 md:h-20"
          aria-label="Main navigation"
        >
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-foreground text-background flex items-center justify-center font-display font-bold text-lg tracking-tight">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight text-foreground leading-none">
                {BRAND_CONFIG.name}
              </span>
              <span className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase mt-0.5 hidden sm:inline">
                {BRAND_CONFIG.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors py-1',
                    isActive
                      ? 'text-foreground font-semibold border-b-2 border-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-medium text-foreground border border-border hover:bg-secondary/70 transition-colors px-4 py-2 rounded-md"
            >
              Register
            </Link>
            <Link
              href="/business/register"
              className="inline-flex items-center gap-1.5 text-sm font-medium bg-foreground text-background px-4 py-2 rounded-md hover:bg-foreground/90 transition-colors shadow-sm"
            >
              <Building2 className="w-4 h-4" />
              Register Your Business
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-background border-b border-border px-4 pb-6 pt-2 shadow-lg">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'py-2.5 px-3 rounded-md text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-secondary text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-border flex flex-col gap-2.5">
              <Link
                href="/business/register"
                className="flex items-center justify-center gap-2 text-sm font-medium bg-foreground text-background px-4 py-2.5 rounded-md"
              >
                <Building2 className="w-4 h-4" />
                Register Your Business
              </Link>
              <Link
                href="/enquiries/new"
                className="flex items-center justify-center gap-2 text-sm font-medium border border-border text-foreground px-4 py-2.5 rounded-md hover:bg-secondary"
              >
                <PlusCircle className="w-4 h-4" />
                Post an Enquiry
              </Link>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/sign-in"
                  className="text-center text-sm font-medium text-muted-foreground hover:text-foreground py-2 border border-border rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="text-center text-sm font-medium text-foreground py-2 bg-secondary rounded-md"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export const PublicNav = MarketingNav;

