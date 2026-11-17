'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center border-b border-[#414957] overflow-hidden bg-[#191B20]">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-arch-cityscape.jpg"
          alt="Construction & Infrastructure Engineering"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#191B20]/95 via-[#292F3D]/90 to-[#292F3D]/75" />
        <div className="absolute inset-0 bg-[#191B20]/40 backdrop-brightness-75" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28 w-full">
        <div className="max-w-3xl space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#303746]/80 border border-[#414957] rounded-sm text-xs font-mono text-[#C66A42] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-[#C66A42] rounded-full" />
              <span>PROVENTA 2.0 &bull; INFRASTRUCTURE PROCUREMENT</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-[#FFFFFF] leading-[1.02]">
              Procurement, Connected from Requirement to Delivery.
            </h1>
            <p className="text-base sm:text-lg text-[#A8ADB7] max-w-2xl leading-relaxed">
              One connected platform to organise material sourcing, discover suppliers, compare quotations and manage construction procurement workflows.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Link
              href="/sign-up?role=buyer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm shadow-sm"
            >
              <span>I&apos;m a Buyer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-up?role=supplier"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#303746] hover:bg-[#252B38] border border-[#536B88] text-[#F1F2F4] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm"
            >
              <span>I&apos;m a Supplier</span>
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-[#414957] text-[#A8ADB7] hover:text-[#F1F2F4] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm"
            >
              <span>Explore PROVENTA</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
