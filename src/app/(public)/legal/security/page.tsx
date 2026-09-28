import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, Key, Server, Database, EyeOff, FileText, CheckCircle2 } from 'lucide-react';
import { LegalHeader, LegalNav } from '@/components/legal/legal-nav';
import { POLICY_VERSIONS, POLICY_EFFECTIVE_DATES } from '@/lib/legal/versions';

export const metadata: Metadata = {
  title: 'Security & Trust Architecture | Proventa Legal & Trust Center',
  description:
    'Technical breakdown of authentication safeguards, personal security keys, multi-tenant isolation, encryption, and immutable audit logs.',
};

export default function SecurityArchitecturePage() {
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
              title="Security &amp; Trust Architecture"
              subtitle="An in-depth, transparent overview of our security measures, encryption protocols, access controls, and data segregation safeguards."
              version={POLICY_VERSIONS.security}
              effectiveDate={POLICY_EFFECTIVE_DATES.security}
            />

            <div className="space-y-10 text-sm text-[#3b3834] leading-relaxed">
              {/* Pillar 1: Authentication */}
              <section className="space-y-4">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  1. Multi-Factor Identity: Password &amp; Proventa Authentication Key
                </h2>
                <p>
                  Proventa implements rigorous defense-in-depth protection for both member accounts and Concierge employee workstations:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                    <div className="flex items-center gap-2 font-semibold text-neutral-900">
                      <Lock className="w-4 h-4 text-[#8a7053]" />
                      <span>Password Hashing Standard</span>
                    </div>
                    <p className="text-neutral-600">
                      All account passwords are salted and hashed using bcrypt with an adaptive cost factor of 12 rounds before reaching the database. Plaintext passwords are never logged, stored, or transmitted internally.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                    <div className="flex items-center gap-2 font-semibold text-neutral-900">
                      <Key className="w-4 h-4 text-[#8a7053]" />
                      <span>Proventa Authentication Key</span>
                    </div>
                    <p className="text-neutral-600">
                      "Your private key. Your Proventa identity." Created during onboarding, this private credential is required for every subsequent sign-in. It is stored via dedicated one-way hashing; Proventa personnel cannot view or retrieve it. Attempts are protected by adaptive rate limiting.
                    </p>
                  </div>
                </div>
              </section>

              {/* Pillar 2: Tenant Isolation & RBAC */}
              <section className="space-y-4">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  2. Role-Based Access Control (RBAC) &amp; Customer Isolation
                </h2>
                <p>
                  Database queries enforce strict customer profile isolation. Members can only read and mutate their own tasks, preferences, and payment records.
                </p>
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#ded7cc] space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#141312]">
                    <Shield className="w-4 h-4 text-[#8a7053]" />
                    <span>Principle of Least Privilege:</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-[#6e6b65] space-y-1 pl-1">
                    <li><strong>Concierge Agents:</strong> Can only view task details assigned directly to their active shift queue.</li>
                    <li><strong>Concierge Managers:</strong> Operational oversight across team tasks without access to unassigned customer payment instruments.</li>
                    <li><strong>Founders &amp; Admins:</strong> System infrastructure, partner configurations, and immutable audit logs.</li>
                  </ul>
                </div>
              </section>

              {/* Pillar 3: Encryption */}
              <section className="space-y-4">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  3. Encryption in Transit &amp; at Rest
                </h2>
                <p>
                  All network communication between member devices and Proventa edge nodes is encrypted using TLS 1.3 with HSTS (HTTP Strict Transport Security) headers.
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#524e48] pl-2">
                  <li><strong>Database Storage:</strong> Stored on PostgreSQL with transparent disk-level AES-256 encryption.</li>
                  <li><strong>Session Cookies:</strong> HTTP-Only, Secure, SameSite=Lax/Strict flags preventing script injection and XSS exfiltration.</li>
                  <li><strong>Integrations:</strong> Partner API keys and webhook secrets encrypted via AES-256-GCM.</li>
                </ul>
              </section>

              {/* Pillar 4: Immutable Audit Trail */}
              <section className="space-y-4">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  4. Microsecond Immutable Audit Logging
                </h2>
                <p>
                  Every critical event across Proventa is recorded into an append-only audit log:
                </p>
                <div className="overflow-x-auto border border-neutral-200 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-100 text-neutral-900 border-b border-neutral-200">
                        <th className="p-3 font-semibold">Event Class</th>
                        <th className="p-3 font-semibold">Logged Metadata</th>
                        <th className="p-3 font-semibold">Security Safeguard</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 text-[#524e48]">
                      <tr>
                        <td className="p-3 font-medium text-neutral-900">Authentication</td>
                        <td className="p-3">Login successes, failures, password resets, key prompts.</td>
                        <td className="p-3">Rate limiting &amp; automated brute-force lockouts.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-neutral-900">Task Lifecycle</td>
                        <td className="p-3">Creation, AI summary generation, concierge assignment, customer approvals.</td>
                        <td className="p-3">Traceable chronological custody chain.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-neutral-900">Data &amp; Privacy</td>
                        <td className="p-3">Personal data exports, policy acceptances, erasure requests.</td>
                        <td className="p-3">Verifiable compliance records.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Pillar 5: Responsible Vulnerability Disclosure */}
              <section className="space-y-3 pt-4 border-t border-[#ded7cc]">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  5. Vulnerability Disclosure &amp; Security Inquiries
                </h2>
                <p>
                  We welcome responsible security research. If you believe you have discovered a potential security vulnerability or misconfiguration in Proventa, please contact our technical team at <a href="mailto:privacy@proventa.in" className="text-[#8a7053] underline font-medium">privacy@proventa.in</a>.
                </p>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
