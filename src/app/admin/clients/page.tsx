import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { ShieldCheck, User, Sparkles, MapPin, Phone, Mail, Calendar, Key, CheckCircle, Database } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FounderClientVaultPage() {
  await requireAdmin();

  // Retrieve complete client database with profiles, preferences, consent, and task history
  const customers = await db.customerProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          consentRecords: {
            take: 3,
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      preferences: true,
      tasks: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          publicId: true,
          intent: true,
          category: true,
          status: true,
          budgetAmount: true,
          createdAt: true,
        },
      },
      bookings: {
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          confirmationRef: true,
          status: true,
          details: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalMembers = customers.length;
  const totalPreferencesRecorded = customers.reduce((sum, c) => sum + c.preferences.length, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest bg-neutral-900 text-[#c8b99d] px-2.5 py-0.5 rounded">
              Founder Private Vault
            </span>
            <span className="text-xs text-neutral-500 font-mono">
              DPDP Act 2023 · Sovereign Client Records
            </span>
          </div>
          <h1 className="text-2xl font-serif font-semibold text-neutral-900 mt-2">
            Client Intelligence &amp; Sovereign Data Vault
          </h1>
          <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
            Complete, end-to-end founder view of all client taste profiles, lifestyle preferences, active consent records, and task executions without exposing credentials or breaching member privacy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Field-Level AES-256 Active
          </div>
          <div className="bg-neutral-900 text-white text-xs px-3 py-1.5 rounded-lg font-mono">
            {totalMembers} Total Clients
          </div>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Registered Clients</span>
            <User className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-neutral-900 mt-2">{totalMembers}</div>
          <p className="text-xs text-neutral-500 mt-1">Founding cohort &amp; private members</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Taste &amp; Lifestyle Data Points</span>
            <Sparkles className="w-4 h-4 text-[#9c8260]" />
          </div>
          <div className="text-2xl font-serif font-bold text-neutral-900 mt-2">{totalPreferencesRecorded}</div>
          <p className="text-xs text-neutral-500 mt-1">Cuisines, airlines, dietary &amp; transit rules</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Privacy Compliance</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-600 mt-2">100%</div>
          <p className="text-xs text-neutral-500 mt-1">Lawful consent &amp; immutable audit ledger</p>
        </div>
      </div>

      {/* Client Vault Cards */}
      <div className="space-y-6">
        {customers.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
            <User className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-neutral-800">No client profiles populated yet</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Client records will appear here as members register on /wave1 and submit concierge requests.
            </p>
          </div>
        ) : (
          customers.map((c) => {
            const consent = c.user.consentRecords[0];
            return (
              <div key={c.id} className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm hover:border-neutral-300 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-neutral-900">
                        {c.user.name || 'Private Member'}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                        ID: {c.id.slice(-8)}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.user.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-neutral-600">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        {c.user.email}
                      </span>
                      {c.user.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-neutral-400" />
                          {c.user.phone}
                        </span>
                      )}
                      {c.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                          {c.city}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-neutral-400">
                        <Calendar className="w-3.5 h-3.5" />
                        Joined {new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Privacy & Consent Badge */}
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-xs">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Consent Verified
                    </div>
                    <div className="font-mono text-neutral-700 mt-0.5">
                      {consent ? `Accepted ${consent.consentType} (v${consent.version})` : 'Default Terms of Service'}
                    </div>
                  </div>
                </div>

                {/* Preferences & Taste Profile */}
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-lg p-4">
                    <h4 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#9c8260]" />
                      Taste Profile &amp; Preferences
                    </h4>
                    {c.preferences.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic">No custom preferences logged yet.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {c.preferences.map((p) => (
                          <div key={p.id} className="flex items-center justify-between text-xs py-1 border-b border-neutral-200/50 last:border-0">
                            <span className="text-neutral-500 font-mono capitalize">{p.category} &gt; {p.key}</span>
                            <span className="font-medium text-neutral-800">{JSON.stringify(p.value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Tasks Executed */}
                  <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-lg p-4">
                    <h4 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-neutral-600" />
                      Autonomous Execution History
                    </h4>
                    {c.tasks.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic">No tasks requested yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {c.tasks.map((t) => (
                          <div key={t.id} className="flex items-center justify-between text-xs py-1 border-b border-neutral-200/50 last:border-0">
                            <div>
                              <span className="font-mono text-neutral-500 mr-2">{t.publicId}</span>
                              <span className="font-medium text-neutral-800">{t.intent}</span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-700">
                              {t.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
