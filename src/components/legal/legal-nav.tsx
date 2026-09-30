'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? 'bg-[#1F2933] text-white shadow-xs'
                : 'text-[#66717C] hover:text-[#1F2933] hover:bg-[#F1F3F5]'
            }`}
          >
            <span>{doc.shortTitle}</span>
            <span className={`text-[10px] font-mono ${isActive ? 'text-[#E5E9ED]' : 'text-[#A7B0B8]'}`}>
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
    <div className="border-b border-[#E1E5E8] pb-8 mb-10">
      <Link
        href="/legal"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#1F2933] hover:text-[#111820] mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-[#A7B0B8]" /> Back to Legal &amp; Trust Hub
      </Link>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#F1F3F5] text-[#1F2933] border border-[#E1E5E8]">
          Version {version}
        </span>
        <span className="text-xs text-[#66717C]">Effective: {effectiveDate}</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-semibold text-[#1F2933] tracking-tight">
        {title}
      </h1>
      <p className="mt-3 text-sm text-[#66717C] leading-relaxed max-w-2xl">
        {subtitle}
      </p>
    </div>
  );
}
