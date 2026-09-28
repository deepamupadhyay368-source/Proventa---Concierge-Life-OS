import type { Metadata } from 'next';
import Link from 'next/link';
import { Cookie, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { LegalHeader, LegalNav } from '@/components/legal/legal-nav';
import { POLICY_VERSIONS, POLICY_EFFECTIVE_DATES } from '@/lib/legal/versions';

export const metadata: Metadata = {
  title: 'Cookie Policy | Proventa Legal & Trust Center',
  description:
    'Factual disclosure of cookies, local storage, and session tokens utilized by Proventa Concierge Life OS.',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#141312] pt-24 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-1 space-y-4">
            <div className="sticky top-28 p-4 bg-white rounded-2xl border border-[#ded7cc] shadow-xs space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a7053]">
                Legal &amp; Trust Index
              </p>
              <LegalNav />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3 bg-white p-8 sm:p-12 rounded-3xl border border-[#ded7cc] shadow-sm space-y-10">
            <LegalHeader
              title="Cookie Policy"
              subtitle="Clear and factual information regarding the cookies and local storage mechanisms used by Proventa to secure your session and remember preferences."
              version={POLICY_VERSIONS.cookies}
              effectiveDate={POLICY_EFFECTIVE_DATES.cookies}
            />

            <div className="space-y-10 text-sm text-[#3b3834] leading-relaxed">
              {/* Section 1: Overview */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  1. Transparent Cookie Architecture
                </h2>
                <p>
                  Proventa uses cookies and browser storage strictly for essential system security, authentication, and user experience persistence.
                </p>
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#ded7cc] space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#141312]">
                    <ShieldCheck className="w-4 h-4 text-[#8a7053]" />
                    <span>Zero Tracking Guarantee:</span>
                  </div>
                  <p className="text-xs text-[#6e6b65]">
                    Proventa does NOT deploy third-party advertising cookies, cross-site profiling trackers, retargeting pixels, or behavioral data broker scripts.
                  </p>
                </div>
              </section>

              {/* Section 2: Cookie Breakdown */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  2. Cookies We Deploy
                </h2>
                <div className="overflow-x-auto border border-neutral-200 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-100 text-neutral-900 border-b border-neutral-200">
                        <th className="p-3 font-semibold">Cookie Name</th>
                        <th className="p-3 font-semibold">Category</th>
                        <th className="p-3 font-semibold">Purpose</th>
                        <th className="p-3 font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 text-[#524e48]">
                      <tr>
                        <td className="p-3 font-mono font-medium text-neutral-900">authjs.session-token</td>
                        <td className="p-3">Strictly Necessary</td>
                        <td className="p-3">Encrypted JWT token authenticating your active user session.</td>
                        <td className="p-3">Session / 30 days</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-medium text-neutral-900">authjs.csrf-token</td>
                        <td className="p-3">Security</td>
                        <td className="p-3">Protects against Cross-Site Request Forgery (CSRF) attacks.</td>
                        <td className="p-3">Session</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-medium text-neutral-900">authjs.callback-url</td>
                        <td className="p-3">Functional</td>
                        <td className="p-3">Remembers destination page for post-login redirection.</td>
                        <td className="p-3">Session</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-medium text-neutral-900">theme</td>
                        <td className="p-3">Preferences</td>
                        <td className="p-3">Stores light/dark theme preference.</td>
                        <td className="p-3">Persistent (1 year)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Section 3: Managing Cookies */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  3. Managing &amp; Disabling Cookies
                </h2>
                <p>
                  You can configure your browser to reject cookies or alert you when cookies are being sent. However, because our cookies are strictly necessary for session authentication and account security, blocking them will prevent you from signing in or accessing member features.
                </p>
                <p className="text-xs text-[#6e6b65]">
                  For additional questions regarding our technical storage practices, review our <Link href="/legal/security" className="text-[#8a7053] underline font-medium">Security &amp; Trust Architecture</Link> or contact <a href="mailto:privacy@proventa.in" className="text-[#8a7053] underline font-medium">privacy@proventa.in</a>.
                </p>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
