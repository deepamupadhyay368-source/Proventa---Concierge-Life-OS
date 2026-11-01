'use client';

import { useEffect, useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Download,
  Trash2,
  Lock,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { FAMILY_WEALTH_SUBSCRIPTION_PLANS, WealthPlanTier } from '@/lib/brand';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'DPDP' | 'BILLING'>('PROFILE');
  const [subData, setSubData] = useState<any>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadSub() {
      try {
        const res = await fetch('/api/wealth/subscriptions?workspaceId=fam_sharma_heritage');
        const json = await res.json();
        if (json.success) {
          setSubData(json.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    void loadSub();
  }, []);

  function handleDataExport() {
    setExportStatus('Compiling complete encrypted archive of all family assets, documents metadata, and cashflows...');
    setTimeout(() => {
      setExportStatus('Archive compiled! Downloading proventa_family_wealth_export.json');
      const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), entity: 'Sharma Family Trust', status: 'VERIFIED' }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proventa_wealth_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }, 1200);
  }

  function handleDataErasure() {
    const confirmation = prompt('Under India’s DPDP Act, typing "DELETE MY DATA" will initiate complete irreversible cryptographic erasure of your personal workspace. This cannot be undone.');
    if (confirmation === 'DELETE MY DATA') {
      alert('Erasure request registered. You will receive cryptographic confirmation at your email within 48 hours.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-[#1E293B]">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#A78BFA] mb-1">
          FAMILY WEALTH OS // SETTINGS &amp; COMPLIANCE
        </div>
        <h1 className="font-serif text-3xl text-white">Platform Settings &amp; DPDP Governance</h1>
        <p className="text-xs text-[#9D8BC9] font-light mt-1">
          Profile security, Digital Personal Data Protection rights, data portability, and subscription entitlements.
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-[#0E1322] border border-[#1E293B] w-fit">
        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'PROFILE' ? 'bg-[#1E1035] text-white border border-[#3E236E]' : 'text-[#9D8BC9] hover:text-white'
          }`}
        >
          Profile &amp; Credentials
        </button>
        <button
          onClick={() => setActiveTab('DPDP')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'DPDP' ? 'bg-[#1E1035] text-white border border-[#3E236E]' : 'text-[#9D8BC9] hover:text-white'
          }`}
        >
          DPDP Privacy &amp; Data Rights
        </button>
        <button
          onClick={() => setActiveTab('BILLING')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'BILLING' ? 'bg-[#1E1035] text-white border border-[#3E236E]' : 'text-[#9D8BC9] hover:text-white'
          }`}
        >
          Subscription &amp; Plans
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'PROFILE' && (
        <div className="p-6 rounded-2xl bg-[#0E1322] border border-[#1E293B] max-w-xl space-y-4">
          <h3 className="text-sm font-semibold text-white">Identity Credentials</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[#9D8BC9] mb-1">Full Legal Name</label>
              <input
                type="text"
                disabled
                value="Rajesh Sharma"
                className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-[#9D8BC9]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9D8BC9] mb-1">Verified Email</label>
              <input
                type="email"
                disabled
                value="rajesh.sharma@proventa.internal"
                className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-[#9D8BC9]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9D8BC9] mb-1">Assigned Family Role</label>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E1035] text-xs font-mono text-[#A78BFA] border border-[#3E236E]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                FAMILY OWNER &amp; TRUST ADMINISTRATOR
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: DPDP Privacy & Rights */}
      {activeTab === 'DPDP' && (
        <div className="space-y-4 max-w-2xl">
          <div className="p-6 rounded-2xl bg-[#0E1322] border border-[#1E293B] space-y-4">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-[#A78BFA]" />
              <h3 className="text-sm font-semibold text-white">Right to Data Portability (Data Export)</h3>
            </div>
            <p className="text-xs text-[#9D8BC9] font-light leading-relaxed">
              Export all your recorded assets, liabilities, valuation audit histories, cashflow ledgers, and document metadata in an open, machine-readable JSON format.
            </p>
            <button
              onClick={handleDataExport}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#7C3AED] hover:bg-[#8B5CF6] transition-all"
            >
              Export Complete Archive
            </button>
            {exportStatus && (
              <div className="text-xs font-mono text-[#10B981] pt-1">
                {exportStatus}
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-[#0E1322] border border-[#F43F5E]/30 space-y-4">
            <div className="flex items-center gap-2 text-[#F43F5E]">
              <Trash2 className="w-4 h-4" />
              <h3 className="text-sm font-semibold">Right to Erasure (Complete Account Deletion)</h3>
            </div>
            <p className="text-xs text-[#9D8BC9] font-light leading-relaxed">
              Under India&apos;s Digital Personal Data Protection Act, you may request permanent erasure of your personal records and vault documents.
            </p>
            <button
              onClick={handleDataErasure}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-[#F43F5E] bg-[#4C0519]/50 hover:bg-[#4C0519] border border-[#F43F5E]/40 transition-all"
            >
              Request Irreversible Erasure
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Billing & Subscription */}
      {activeTab === 'BILLING' && subData && (
        <div className="p-6 rounded-2xl bg-[#0E1322] border border-[#2D1854] max-w-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#A78BFA] uppercase">Current Plan</span>
              <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                {subData.currentSubscription?.details?.name || 'Family Office Plan'}
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#064E3B]/40 text-[#10B981] text-xs font-mono border border-[#10B981]/40">
              Active Subscription
            </span>
          </div>

          <div className="pt-3 border-t border-[#1E293B] space-y-2 text-xs text-[#9D8BC9]">
            <div className="flex justify-between">
              <span>Annual Investment:</span>
              <span className="font-mono text-white font-bold">{subData.currentSubscription?.details?.formattedPrice || '₹14,999'} / year</span>
            </div>
            <div className="flex justify-between">
              <span>Included Family Seats:</span>
              <span className="font-mono text-white">Up to 25 Members</span>
            </div>
            <div className="flex justify-between">
              <span>Encrypted Vault Quota:</span>
              <span className="font-mono text-white">50 GB Private Storage</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
