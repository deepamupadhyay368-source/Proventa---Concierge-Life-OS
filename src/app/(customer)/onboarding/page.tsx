'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  Coins,
  CreditCard,
  Lock,
  PieChart,
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Identity', desc: 'Sovereign Credentials' },
  { id: 2, label: 'Verification', desc: 'Secure Key Protocol' },
  { id: 3, label: 'Workspace', desc: 'Personal Sovereignty' },
  { id: 4, label: 'Jurisdiction', desc: 'Statutory DPDP Standards' },
  { id: 5, label: 'Family Trust', desc: 'Trust Holding Entity' },
  { id: 6, label: 'Enrollment', desc: 'Trustees & Beneficiaries' },
  { id: 7, label: 'First Asset', desc: 'Capital Inventory Initial' },
  { id: 8, label: 'Liabilities', desc: 'Debt Facilities' },
  { id: 9, label: 'Vault Archive', desc: 'AES-256 Provisioning' },
  { id: 10, label: 'Synthesis', desc: 'Deterministic Terminal' },
];

import { useSession } from 'next-auth/react';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [fullName, setFullName] = useState(session?.user?.name || '');
  const [email, setEmail] = useState(session?.user?.email || '');
  const [familyName, setFamilyName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [assetName, setAssetName] = useState('');
  const [assetValue, setAssetValue] = useState('');
  const [hasLiability, setHasLiability] = useState(false);
  const [liabilityName, setLiabilityName] = useState('');
  const [liabilityBalance, setLiabilityBalance] = useState('');

  function nextStep() {
    if (currentStep < 10) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/dashboard');
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        {/* Institutional Stepper Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#171C26] border border-[#252C38] rounded-[2px] font-mono text-[10px] uppercase tracking-[0.2em] text-[#7595FF]">
            <span>PROVENTA // TITANIUM INTAKE PROTOCOL</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#F4F6FA] tracking-tight mt-2">
            Establish Your Financial Intelligence Platform
          </h1>
          <p className="font-mono text-xs text-[#858D9B] uppercase tracking-wider">
            Protocol Phase {String(currentStep).padStart(2, '0')} of 10: <strong className="text-[#F4F6FA]">{STEPS[currentStep - 1].desc}</strong>
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-10 gap-1 border border-[#252C38] p-1 bg-[#171C26] rounded-[2px]">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-2.5 transition-all rounded-[1px] ${
                s.id < currentStep
                  ? 'bg-[#2457FF]'
                  : s.id === currentStep
                  ? 'bg-[#7595FF] shadow-[0_0_8px_rgba(117,149,255,0.6)]'
                  : 'bg-[#252C38]'
              }`}
              title={`Phase ${s.id}: ${s.label}`}
            />
          ))}
        </div>

        {/* Step Content Box */}
        <div className="border border-[#252C38] bg-[#171C26] p-8 sm:p-10 rounded-[2px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="font-mono text-[10px] text-[#7595FF] uppercase tracking-widest font-semibold">PHASE 01 // IDENTITY</div>
              <h2 className="font-display font-bold text-2xl text-[#F4F6FA]">Master Identity Establishment</h2>
              <p className="font-sans text-xs text-[#C5CAD3] leading-relaxed">
                Your individual account establishes sovereign master credentials. You retain absolute legal data isolation across all family trusts.
              </p>
              <div className="space-y-4 pt-2 font-mono text-xs">
                <div>
                  <label className="block text-[#858D9B] uppercase text-[10px] mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#090B10] border border-[#252C38] px-3.5 py-2.5 text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                </div>
                <div>
                  <label className="block text-[#858D9B] uppercase text-[10px] mb-1">Primary Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#090B10] border border-[#252C38] px-3.5 py-2.5 text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 text-center py-6">
              <div className="w-12 h-12 bg-[#2457FF]/15 text-[#7595FF] border border-[#2457FF]/40 flex items-center justify-center mx-auto rounded-[2px]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="font-mono text-[10px] text-[#7595FF] uppercase tracking-widest font-semibold">PHASE 02 // CIPHER</div>
              <h2 className="font-display font-bold text-2xl text-[#F4F6FA]">Authentication Keys Initialized</h2>
              <p className="font-sans text-xs text-[#C5CAD3] max-w-md mx-auto leading-relaxed">
                Credentials for {email} verified. Session secured under TLS 1.3 with AES-GCM-256 envelope encryption.
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="font-mono text-[10px] text-[#7595FF] uppercase tracking-widest font-semibold">PHASE 03 // SOVEREIGNTY</div>
              <h2 className="font-display font-bold text-2xl text-[#F4F6FA]">Personal Sovereign Workspace</h2>
              <p className="font-sans text-xs text-[#C5CAD3] leading-relaxed">
                Your individual universe is strictly segregated. Private holdings logged here will never appear in family viewports without explicit conveyance.
              </p>
              <div className="p-4 border border-[#252C38] bg-[#090B10] rounded-[2px] font-mono text-xs space-y-1">
                <div className="font-semibold text-[#F4F6FA]">Personal Universe: {fullName}</div>
                <div className="text-[10px] text-[#7595FF]">Status: Private Isolation Active</div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="font-mono text-[10px] text-[#7595FF] uppercase tracking-widest font-semibold">PHASE 04 // JURISDICTION</div>
              <h2 className="font-display font-bold text-2xl text-[#F4F6FA]">Financial Jurisdiction &amp; Standards</h2>
              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 border border-[#252C38] bg-[#090B10] rounded-[2px]">
                  <div className="text-[10px] text-[#858D9B] uppercase">Reporting Currency</div>
                  <div className="text-sm font-semibold text-[#F4F6FA] mt-1">Indian Rupee (INR ₹)</div>
                </div>
                <div className="p-4 border border-[#252C38] bg-[#090B10] rounded-[2px]">
                  <div className="text-[10px] text-[#85827B] uppercase">Statutory Standard</div>
                  <div className="text-sm font-semibold text-[#7595FF] mt-1">India (DPDP Compliant)</div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="font-mono text-[10px] text-[#7595FF] uppercase tracking-widest font-semibold">PHASE 05 // FAMILY TRUST</div>
              <h2 className="font-display font-bold text-2xl text-[#F4F6FA]">Register Family Trust Entity</h2>
              <p className="font-sans text-xs text-[#C5CAD3] leading-relaxed">
                Designate the legal name of your family trust, holding company, or multi-generational estate.
              </p>
              <div className="font-mono text-xs">
                <label className="block text-[#858D9B] uppercase text-[10px] mb-1">Entity / Trust Title</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full bg-[#090B10] border border-[#252C38] px-3.5 py-2.5 text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                />
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="font-mono text-[10px] text-[#7595FF] uppercase tracking-widest font-semibold">PHASE 06 // ENROLLMENT</div>
              <h2 className="font-display font-bold text-2xl text-[#F4F6FA]">Enroll Trustees &amp; Beneficiaries</h2>
              <p className="font-sans text-xs text-[#C5CAD3] leading-relaxed">
                Optionally enroll your spouse, adult heirs, or chartered accountant with specific access roles.
              </p>
              <div className="font-mono text-xs">
                <label className="block text-[#858D9B] uppercase text-[10px] mb-1">Beneficiary Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#090B10] border border-[#252C38] px-3.5 py-2.5 text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                />
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="font-mono text-[10px] text-[#7595FF] uppercase tracking-widest font-semibold">PHASE 07 // CAPITAL INVENTORY</div>
              <h2 className="font-display font-bold text-2xl text-[#F4F6FA]">Log Primary Capital Instrument</h2>
              <p className="font-sans text-xs text-[#C5CAD3] leading-relaxed">
                Register an anchor real estate property, Demat folio, or corporate shareholding.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <label className="block text-[#858D9B] uppercase text-[10px] mb-1">Asset Description</label>
                  <input
                    type="text"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    className="w-full bg-[#090B10] border border-[#252C38] px-3.5 py-2.5 text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                </div>
                <div>
                  <label className="block text-[#858D9B] uppercase text-[10px] mb-1">Certified Valuation (₹)</label>
                  <input
                    type="number"
                    value={assetValue}
                    onChange={(e) => setAssetValue(e.target.value)}
                    className="w-full bg-[#090B10] border border-[#252C38] px-3.5 py-2.5 text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="space-y-4">
              <div className="font-mono text-[10px] text-[#7595FF] uppercase tracking-widest font-semibold">PHASE 08 // DEBT REGISTER</div>
              <h2 className="font-display font-bold text-2xl text-[#F4F6FA]">Record Credit Liabilities</h2>
              <p className="font-sans text-xs text-[#C5CAD3] leading-relaxed">
                Log home mortgages or credit lines to ensure exact net worth calculation.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <label className="block text-[#858D9B] uppercase text-[10px] mb-1">Facility Description</label>
                  <input
                    type="text"
                    value={liabilityName}
                    onChange={(e) => setLiabilityName(e.target.value)}
                    className="w-full bg-[#090B10] border border-[#252C38] px-3.5 py-2.5 text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                </div>
                <div>
                  <label className="block text-[#858D9B] uppercase text-[10px] mb-1">Outstanding Principal (₹)</label>
                  <input
                    type="number"
                    value={liabilityBalance}
                    onChange={(e) => setLiabilityBalance(e.target.value)}
                    className="w-full bg-[#090B10] border border-[#252C38] px-3.5 py-2.5 text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 9 && (
            <div className="space-y-4 text-center py-6">
              <div className="w-12 h-12 bg-[#2457FF]/15 text-[#7595FF] border border-[#2457FF]/40 flex items-center justify-center mx-auto rounded-[2px]">
                <Lock className="w-6 h-6" />
              </div>
              <div className="font-mono text-[10px] text-[#7595FF] uppercase tracking-widest font-semibold">PHASE 09 // VAULT ENCRYPTION</div>
              <h2 className="font-display font-bold text-2xl text-[#F4F6FA]">Encrypted Archive Provisioned</h2>
              <p className="font-sans text-xs text-[#C5CAD3] max-w-md mx-auto leading-relaxed">
                Your private vault is active with hardware-backed encryption keys. You may upload registered sale deeds and CAMS statements from the main console.
              </p>
            </div>
          )}

          {currentStep === 10 && (
            <div className="space-y-4 text-center py-6">
              <div className="w-12 h-12 bg-[#2457FF] text-[#F4F6FA] flex items-center justify-center mx-auto rounded-[2px] shadow-[0_0_20px_rgba(36,87,255,0.4)]">
                <PieChart className="w-6 h-6" />
              </div>
              <div className="font-mono text-[10px] text-[#7595FF] uppercase tracking-widest font-semibold">PHASE 10 // OPERATIONAL</div>
              <h2 className="font-display font-bold text-2xl text-[#F4F6FA]">Living Financial System Ready</h2>
              <p className="font-sans text-xs text-[#C5CAD3] max-w-md mx-auto leading-relaxed">
                Welcome to PROVENTA, {fullName}. All 10 modules, the deterministic integer paise engine, and 6 intelligence agents are now active.
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-[#252C38] flex items-center justify-between font-mono text-xs">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2.5 border border-[#252C38] bg-[#090B10] uppercase text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] transition-colors flex items-center gap-1.5 rounded-[2px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Phase</span>
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] uppercase tracking-wider font-semibold border border-[#7595FF]/40 transition-all flex items-center gap-2 rounded-[2px] shadow-[0_0_12px_rgba(36,87,255,0.3)]"
            >
              <span>{currentStep === 10 ? 'Enter Living Console' : 'Proceed to Next Phase'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
