import type { Metadata } from 'next';
import { Wave1Form } from '@/components/marketing/wave1-form';

export const metadata: Metadata = {
  title: 'Apply for Wave 1 Membership | Proventa — Ahmedabad',
  description: 'Private waitlist application for Proventa Wave 1 in Ahmedabad. Meticulous lifestyle concierge.',
};

export default async function Wave1Page({ searchParams }: { searchParams: Promise<{ intent?: string }> | { intent?: string } }) {
  const params = await Promise.resolve(searchParams);
  return (
    <div className="min-h-screen bg-[#faf8f5] pt-20 pb-28">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full luxury-pill text-[11px] font-medium text-[#6d5941] mb-4">
            <span>AHMEDABAD WAVE 1 · STRICT CAPACITY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight text-[#141312] mb-4">
            Apply for Wave 1 Access
          </h1>
          <p className="text-sm sm:text-base text-[#5a4937] leading-relaxed font-sans max-w-md mx-auto">
            We onboard members in calibrated waves to maintain uncompromising responsiveness and personalized ground service.
          </p>
        </div>

        <div className="luxury-card rounded-2xl p-8 sm:p-10 shadow-lg border border-[#e8e2d8]">
          <Wave1Form prefilledIntent={params.intent} />
        </div>

        <div className="mt-8 text-center space-y-1 text-xs text-[#8a7053]">
          <p>No subscription fee during Wave 1 · Complete data discretion</p>
          <p className="text-[#a8a29e]">Direct concierge desk inquiries: <a href="mailto:proventa.in@gmail.com" className="underline hover:text-[#141312]">proventa.in@gmail.com</a></p>
        </div>
      </div>
    </div>
  );
}
