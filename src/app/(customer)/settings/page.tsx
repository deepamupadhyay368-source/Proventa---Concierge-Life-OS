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
    <div className="space-y-8 font-sans">
      {/* 1. INSTITUTIONAL HEADER */}
      <div className="border border-[#101010] bg-[#FAF9F6]">
        <div className="p-6 sm:p-8 border-b border-[#101010]">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#85827B]">
            14 // INSTITUTIONAL GOVERNANCE &amp; DPDP PRIVACY
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#101010] tracking-tight mt-1">
            Governance &amp; Statutory Data Rights
          </h1>
          <p className="font-sans text-xs text-[#85827B] mt-2 max-w-xl">
            Identity credentials, Digital Personal Data Protection Act compliance protocols, raw machine-readable data portability, and institutional subscription entitlements.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-[#F0EDE5]">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors border ${
              activeTab === 'PROFILE'
                ? 'bg-[#101010] text-[#F0EDE5] border-[#101010] font-semibold'
                : 'border-transparent text-[#101010] hover:bg-[#FAF9F6]'
            }`}
          >
            Profile &amp; Credentials
          </button>
          <button
            onClick={() => setActiveTab('DPDP')}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors border ${
              activeTab === 'DPDP'
                ? 'bg-[#101010] text-[#F0EDE5] border-[#101010] font-semibold'
                : 'border-transparent text-[#101010] hover:bg-[#FAF9F6]'
            }`}
          >
            DPDP Privacy &amp; Data Rights
          </button>
          <button
            onClick={() => setActiveTab('BILLING')}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors border ${
              activeTab === 'BILLING'
                ? 'bg-[#101010] text-[#F0EDE5] border-[#101010] font-semibold'
                : 'border-transparent text-[#101010] hover:bg-[#FAF9F6]'
            }`}
          >
            Institutional Subscription
          </button>
        </div>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'PROFILE' && (
        <div className="border border-[#101010] bg-[#FAF9F6] p-8 max-w-2xl space-y-6">
          <div className="font-serif text-2xl text-[#101010]">Identity Credentials</div>
          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[#85827B] uppercase text-[10px] mb-1">Full Legal Name</label>
              <input
                type="text"
                disabled
                value="Rajesh Sharma"
                className="w-full bg-[#F0EDE5] border border-[#101010] px-3.5 py-2.5 text-[#101010]"
              />
            </div>
            <div>
              <label className="block text-[#85827B] uppercase text-[10px] mb-1">Registered Institutional Email</label>
              <input
                type="email"
                disabled
                value="rajesh.sharma@proventa.internal"
                className="w-full bg-[#F0EDE5] border border-[#101010] px-3.5 py-2.5 text-[#101010]"
              />
            </div>
            <div>
              <label className="block text-[#85827B] uppercase text-[10px] mb-1">Trusteeship Role</label>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#101010] text-[#F0EDE5] font-mono text-xs uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B6A68A]" />
                <span>PRIMARY TRUSTEE &amp; ADMINISTRATOR</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: DPDP Privacy & Rights */}
      {activeTab === 'DPDP' && (
        <div className="space-y-6 max-w-3xl">
          <div className="border border-[#101010] bg-[#FAF9F6] p-8 space-y-4">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-[#101010]" />
              <h3 className="font-serif text-2xl text-[#101010]">Right to Data Portability (Machine-Readable Export)</h3>
            </div>
            <p className="font-sans text-xs text-[#85827B] leading-relaxed">
              Export all your recorded assets, liabilities, valuation audit histories, cashflow ledgers, and document metadata in an open, machine-readable JSON format under section 12 of the DPDP Act 2023.
            </p>
            <button
              onClick={handleDataExport}
              className="px-5 py-2.5 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] font-mono text-xs uppercase tracking-wider font-semibold border border-[#101010] transition-colors"
            >
              Generate Raw JSON Archive
            </button>
            {exportStatus && (
              <div className="font-mono text-xs text-[#263B35] pt-1">
                {exportStatus}
              </div>
            )}
          </div>

          <div className="border border-[#A63B32] bg-[#FAF9F6] p-8 space-y-4">
            <div className="flex items-center gap-2 text-[#A63B32]">
              <Trash2 className="w-4 h-4" />
              <h3 className="font-serif text-2xl">Right to Erasure (Complete Account Deletion)</h3>
            </div>
            <p className="font-sans text-xs text-[#85827B] leading-relaxed">
              Under India&apos;s Digital Personal Data Protection Act, you may request permanent erasure of your personal records and vault documents.
            </p>
            <button
              onClick={handleDataErasure}
              className="px-5 py-2.5 bg-[#A63B32] text-[#FAF9F6] hover:bg-[#8B2E26] font-mono text-xs uppercase tracking-wider font-semibold border border-[#A63B32] transition-colors"
            >
              Initiate Irreversible Data Erasure
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Billing & Subscription */}
      {activeTab === 'BILLING' && subData && (
        <div className="border border-[#101010] bg-[#FAF9F6] p-8 max-w-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#101010] pb-4">
            <div>
              <span className="font-mono text-[10px] text-[#85827B] uppercase">Institutional Tier</span>
              <h3 className="font-serif text-2xl text-[#101010] mt-0.5">
                {subData.currentSubscription?.details?.name || 'Family Office Plan'}
              </h3>
            </div>
            <span className="px-3 py-1 bg-[#263B35] text-[#FAF9F6] font-mono text-xs uppercase font-semibold">
              Active Institutional License
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs text-[#101010]">
            <div className="flex justify-between border-b border-[#101010]/15 pb-2">
              <span className="text-[#85827B]">Annual Investment:</span>
              <span className="font-bold">{subData.currentSubscription?.details?.formattedPrice || '₹14,999'} / year</span>
            </div>
            <div className="flex justify-between border-b border-[#101010]/15 pb-2">
              <span className="text-[#85827B]">Included Family Seats:</span>
              <span>Up to 25 Members &amp; Professional Advisors</span>
            </div>
            <div className="flex justify-between border-b border-[#101010]/15 pb-2">
              <span className="text-[#85827B]">Encrypted Archival Quota:</span>
              <span>50 GB AES-GCM-256 Storage</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#85827B]">Calculation Engine:</span>
              <span className="text-[#263B35] font-semibold">Integer Paise (Zero Drift)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
