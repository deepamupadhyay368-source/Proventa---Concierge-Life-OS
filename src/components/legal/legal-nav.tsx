'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  FileText,
  Lock,
  RefreshCw,
  Cpu,
  Database,
  ArrowLeft,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { LEGAL_DOCUMENTS } from '@/lib/legal/versions';

export function LegalNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {LEGAL_DOCUMENTS.map((doc) => {
        const isActive = pathname === doc.href;
        return (
          <Link
            key={doc.href}
            href={doc.href}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              isActive
                ? 'bg-[#1f1b16] text-[#faf8f5] shadow-xs'
                : 'text-[#6e6b65] hover:text-[#141312] hover:bg-neutral-100'
            }`}
          >
            <span>{doc.shortTitle}</span>
            <span className={`text-[10px] font-mono ${isActive ? 'text-amber-300' : 'text-neutral-400'}`}>
              v{doc.version}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function LegalHeader({
  title,
  subtitle,
  version,
  effectiveDate,
}: {
  title: string;
  subtitle: string;
  version: string;
  effectiveDate: string;
}) {
  return (
    <div className="border-b border-[#e8e2d8] pb-8 mb-10">
      <Link
        href="/legal"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#8a7053] hover:text-[#5a4733] mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Legal &amp; Trust Center
      </Link>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#f5ede0] text-[#8a7053] border border-[#e8e2d8]">
          Version {version}
        </span>
        <span className="text-xs text-[#8a8680]">Effective: {effectiveDate}</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141312] tracking-tight">
        {title}
      </h1>
      <p className="mt-3 text-sm text-[#6e6b65] leading-relaxed max-w-2xl">
        {subtitle}
      </p>
    </div>
  );
}
