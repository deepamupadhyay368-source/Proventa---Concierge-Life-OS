import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Cookie, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cookie & Session Security Policy | Proventa',
  description: 'Proventa Cookie Policy: Zero advertising cookies, strictly essential encrypted session tokens and CSRF protection.',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#141312] pt-24 pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/legal"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8a7053] hover:text-[#5a4733] mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Legal &amp; Compliance Center
        </Link>

        <div className="border-b border-[#e8e2d8] pb-8 mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#eef2f6] text-[#2c4e70]">
              Security &amp; Storage
            </span>
            <span className="text-xs text-[#8a8680]">Effective Date: September 18, 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141312] tracking-tight">
            Cookie &amp; Session Security Policy
          </h1>
          <p className="mt-2 text-sm text-[#6e6b65]">
            Proventa enforces a strict policy of zero advertising cookies, zero third-party telemetry beacons, and zero cross-site member tracking.
          </p>
        </div>

        <div className="space-y-10 text-sm text-[#3b3834] leading-relaxed">
          <div className="p-4 rounded-xl bg-white border border-[#ded7cc] space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#141312]">
              <ShieldCheck className="w-4 h-4 text-[#8a7053]" />
              <span>Zero Tracking Pledge:</span>
            </div>
            <p className="text-xs text-[#6e6b65]">
              We do not use advertising tracking cookies, behavioral profile pixels (such as Meta Pixel or Google Ads tracking), or affiliate cookies. We use only strictly necessary cookies essential for authentication and cryptographic session integrity.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              Strictly Essential Cookies Used
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-white rounded-xl border border-[#ded7cc]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#141312]">authjs.session-token / __Secure-authjs.session-token</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#faf8f5] rounded border border-[#ded7cc]">Essential</span>
                </div>
                <p className="text-[#6e6b65]">
                  Stores your encrypted JWT session token to maintain authentication across requests. Transmitted only over HTTPS and flagged as HttpOnly to protect against client-side script interception.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#ded7cc]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#141312]">authjs.csrf-token / __Host-authjs.csrf-token</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#faf8f5] rounded border border-[#ded7cc]">Essential</span>
                </div>
                <p className="text-[#6e6b65]">
                  Cryptographic anti-forgery token protecting against Cross-Site Request Forgery (CSRF) attacks when signing in or approving concierge actions.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#ded7cc]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#141312]">authjs.callback-url</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#faf8f5] rounded border border-[#ded7cc]">Essential</span>
                </div>
                <p className="text-[#6e6b65]">
                  Temporarily holds the target return URL so you are redirected back to your intended concierge request after authenticating.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              Managing Your Cookies
            </h2>
            <p className="text-xs text-[#524e48]">
              Because all cookies set by Proventa are strictly necessary for core platform security and authentication, disabling cookies in your browser settings will prevent you from signing in to the member dashboard and approving concierge tasks.
            </p>
          </section>

          <div className="pt-6 border-t border-[#e8e2d8] text-xs text-[#8a8680]">
            For questions regarding cookie practices, contact{' '}
            <a href="mailto:privacy@proventa.in" className="text-[#8a7053] underline">privacy@proventa.in</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
