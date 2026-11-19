import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

export function FinalCTASection() {
  return (
    <section className="py-24 bg-[#F4F7FA] border-t border-b border-[#E2E8EF] relative overflow-hidden text-center">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#E2E8EF] text-xs font-mono text-[#315F91] uppercase tracking-wider shadow-xs">
          <span>GET STARTED WITH PROVENTA</span>
        </div>

        <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-[#243447] tracking-tight leading-tight">
          Build better procurement relationships.
        </h2>

        <p className="text-base sm:text-lg text-[#6B7785] max-w-2xl mx-auto leading-relaxed">
          Join leading infrastructure developers, contractors, and verified material suppliers streamlining procurement on PROVENTA.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/rfq/new"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#315F91] hover:bg-[#264B74] text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-xs"
          >
            <span>Start Procuring</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/sign-up"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-[#FFFFFF] border border-[#E2E8EF] hover:border-[#AEBBC6] text-[#243447] font-semibold text-xs uppercase tracking-wider transition-all shadow-xs"
          >
            <span>Join PROVENTA</span>
          </Link>
        </div>

        <div className="pt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[#6B7785]">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#315F91]" />
            <span>Direct Verified Suppliers</span>
          </div>
          <span className="text-[#AEBBC6]">•</span>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#315F91]" />
            <span>Transparent Landed Costs</span>
          </div>
          <span className="text-[#AEBBC6]">•</span>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#315F91]" />
            <span>Tracked Delivery Logistics</span>
          </div>
        </div>
      </div>
    </section>
  );
}
