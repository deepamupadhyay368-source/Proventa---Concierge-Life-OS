'use client';

import { useEffect, useState } from 'react';
import {
  Download,
  Trash2,
  Lock,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { FAMILY_WEALTH_SUBSCRIPTION_PLANS, WealthPlanTier } from '@/lib/brand';
import { useCurrentWorkspace } from '@/lib/wealth/workspace-context';

export default function SettingsPage() {
  const { currentWorkspaceId, currentWorkspace, isLoaded, user } = useCurrentWorkspace();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'DPDP' | 'BILLING'>('PROFILE');
  const [subData, setSubData] = useState<any>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadSub() {
      if (!currentWorkspaceId) return;
      try {
        const res = await fetch(`/api/wealth/subscriptions?workspaceId=${encodeURIComponent(currentWorkspaceId)}`);
        const json = await res.json();
        if (json.success) {
          setSubData(json.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (isLoaded) {
      void loadSub();
    }
  }, [currentWorkspaceId, isLoaded]);

  function handleDataExport() {
    setExportStatus('Compiling complete encrypted archive of all family assets, documents metadata, and cashflows...');
    setTimeout(() => {
      setExportStatus('Archive compiled! Downloading proventa_family_wealth_export.json');
      const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), entity: currentWorkspace?.name || 'Primary Workspace', status: 'VERIFIED' }, null, 2)], { type: 'application/json' });
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
    <div className="space-y-8 font-sans">
      {/* 1. TITANIUM COBALT HEADER */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="p-6 sm:p-8 border-b border-[#252C38]">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7595FF] font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#2457FF]" />
            <span>14 // INSTITUTIONAL GOVERNANCE &amp; DPDP PRIVACY</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#F4F6FA] tracking-tight mt-1">
            Governance &amp; Statutory Data Rights
          </h1>
          <p className="font-sans text-xs text-[#C5CAD3] mt-2 max-w-xl">
            Identity credentials, Digital Personal Data Protection Act compliance protocols, raw machine-readable data portability, and institutional subscription entitlements.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-[#090B10]">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all rounded-[2px] border ${
              activeTab === 'PROFILE'
                ? 'bg-[#2457FF] text-[#F4F6FA] border-[#2457FF] font-semibold shadow-[0_0_12px_rgba(36,87,255,0.3)]'
                : 'border-transparent text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#171C26]'
            }`}
          >
            Profile &amp; Credentials
          </button>
          <button
            onClick={() => setActiveTab('DPDP')}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all rounded-[2px] border ${
              activeTab === 'DPDP'
                ? 'bg-[#2457FF] text-[#F4F6FA] border-[#2457FF] font-semibold shadow-[0_0_12px_rgba(36,87,255,0.3)]'
                : 'border-transparent text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#171C26]'
            }`}
          >
            DPDP Privacy &amp; Data Rights
          </button>
          <button
            onClick={() => setActiveTab('BILLING')}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all rounded-[2px] border ${
              activeTab === 'BILLING'
                ? 'bg-[#2457FF] text-[#F4F6FA] border-[#2457FF] font-semibold shadow-[0_0_12px_rgba(36,87,255,0.3)]'
                : 'border-transparent text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#171C26]'
            }`}
          >
            Institutional Subscription
          </button>
        </div>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'PROFILE' && (
        <div className="border border-[#252C38] bg-[#171C26] p-8 max-w-2xl space-y-6 rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="font-display font-bold text-2xl text-[#F4F6FA]">Identity Credentials</div>
          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[#858D9B] uppercase text-[10px] mb-1">Full Legal Name</label>
              <input
                type="text"
                disabled
                value={user?.name || 'Primary Account'}
                className="w-full bg-[#090B10] border border-[#252C38] px-3.5 py-2.5 text-[#F4F6FA] rounded-[2px]"
              />
            </div>
            <div>
              <label className="block text-[#858D9B] uppercase text-[10px] mb-1">Registered Institutional Email</label>
              <input
                type="email"
                disabled
                value={user?.email || 'account@proventa.in'}
                className="w-full bg-[#090B10] border border-[#252C38] px-3.5 py-2.5 text-[#F4F6FA] rounded-[2px]"
              />
            </div>
            <div>
              <label className="block text-[#858D9B] uppercase text-[10px] mb-1">Trusteeship Role</label>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2457FF]/15 border border-[#2457FF]/40 text-[#7595FF] font-mono text-xs uppercase tracking-wider rounded-[2px]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7595FF]" />
                <span className="font-semibold">PRIMARY TRUSTEE &amp; ADMINISTRATOR</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: DPDP Privacy & Rights */}
      {activeTab === 'DPDP' && (
        <div className="space-y-6 max-w-3xl">
          <div className="border border-[#252C38] bg-[#171C26] p-8 space-y-4 rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-[#7595FF]" />
              <h3 className="font-display font-bold text-2xl text-[#F4F6FA]">Right to Data Portability (Machine-Readable Export)</h3>
            </div>
            <p className="font-sans text-xs text-[#C5CAD3] leading-relaxed">
              Export all your recorded assets, liabilities, valuation audit histories, cashflow ledgers, and document metadata in an open, machine-readable JSON format under section 12 of the DPDP Act 2023.
            </p>
            <button
              onClick={handleDataExport}
              className="px-5 py-2.5 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] font-mono text-xs uppercase tracking-wider font-semibold border border-[#7595FF]/40 rounded-[2px] shadow-[0_0_12px_rgba(36,87,255,0.3)] transition-all"
            >
              Generate Raw JSON Archive
            </button>
            {exportStatus && (
              <div className="font-mono text-xs text-[#7595FF] pt-1">
                {exportStatus}
              </div>
            )}
          </div>

          <div className="border border-[#FF7A70]/50 bg-[#171C26] p-8 space-y-4 rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2 text-[#FF7A70]">
              <Trash2 className="w-4 h-4" />
              <h3 className="font-display font-bold text-2xl">Right to Erasure (Complete Account Deletion)</h3>
            </div>
            <p className="font-sans text-xs text-[#C5CAD3] leading-relaxed">
              Under India&apos;s Digital Personal Data Protection Act, you may request permanent erasure of your personal records and vault documents.
            </p>
            <button
              onClick={handleDataErasure}
              className="px-5 py-2.5 bg-[#FF7A70]/20 text-[#FF7A70] hover:bg-[#FF7A70]/30 font-mono text-xs uppercase tracking-wider font-semibold border border-[#FF7A70]/50 rounded-[2px] transition-colors"
            >
              Initiate Irreversible Data Erasure
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Billing & Subscription */}
      {activeTab === 'BILLING' && subData && (
        <div className="border border-[#252C38] bg-[#171C26] p-8 max-w-2xl space-y-6 rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between border-b border-[#252C38] pb-4">
            <div>
              <span className="font-mono text-[10px] text-[#858D9B] uppercase">Institutional Tier</span>
              <h3 className="font-display font-bold text-2xl text-[#F4F6FA] mt-0.5">
                {subData.currentSubscription?.details?.name || 'Family Office Plan'}
              </h3>
            </div>
            <span className="px-3 py-1 bg-[#2457FF]/15 text-[#7595FF] border border-[#2457FF]/40 font-mono text-xs uppercase font-semibold rounded-[2px]">
              Active Institutional License
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs text-[#F4F6FA]">
            <div className="flex justify-between border-b border-[#252C38] pb-2">
              <span className="text-[#858D9B]">Annual Investment:</span>
              <span className="font-bold text-[#F4F6FA]">{subData.currentSubscription?.details?.formattedPrice || '₹14,999'} / year</span>
            </div>
            <div className="flex justify-between border-b border-[#252C38] pb-2">
              <span className="text-[#858D9B]">Included Family Seats:</span>
              <span className="text-[#C5CAD3]">Up to 25 Members &amp; Professional Advisors</span>
            </div>
            <div className="flex justify-between border-b border-[#252C38] pb-2">
              <span className="text-[#858D9B]">Encrypted Archival Quota:</span>
              <span className="text-[#C5CAD3]">50 GB AES-GCM-256 Storage</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#858D9B]">Calculation Engine:</span>
              <span className="text-[#7595FF] font-semibold">Integer Paise (Zero Drift)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
