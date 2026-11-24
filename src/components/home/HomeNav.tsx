'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/home/ui/Button';

const NAV_LINKS = [
  { label: 'Services', href: '/services' },
  { label: 'Membership', href: '/membership' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Societies', href: '/societies' },
  { label: 'About', href: '/about' },
];

export function HomeNav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 border-b border-[#E5E3DB] bg-[#F2F0E9]/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 md:px-12 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold tracking-tight text-[#171A17]">PROVENTA</span>
          <span className="text-xs font-medium uppercase tracking-widest text-[#53634A]">Home</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-[#4B5563] hover:text-[#53634A] transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-[#4B5563] hover:text-[#53634A] transition-colors">Sign In</Link>
          <Link href="/signup" className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded-md bg-[#53634A] text-white hover:bg-[#3d4a36] transition-all">Join PROVENTA</Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 text-[#171A17]" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-[#E5E3DB] bg-[#F2F0E9] px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-[#4B5563] hover:text-[#53634A]" onClick={() => setOpen(false)}>{link.label}</Link>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#E5E3DB]">
            <Link href="/login" className="text-sm font-medium text-[#4B5563]" onClick={() => setOpen(false)}>Sign In</Link>
            <Link href="/signup" className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded-md bg-[#53634A] text-white hover:bg-[#3d4a36]" onClick={() => setOpen(false)}>Join PROVENTA</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
