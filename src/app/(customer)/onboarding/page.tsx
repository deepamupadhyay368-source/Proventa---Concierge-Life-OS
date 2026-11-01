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

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [fullName, setFullName] = useState('Rajesh Sharma');
  const [email, setEmail] = useState('rajesh.sharma@familywealth.internal');
  const [familyName, setFamilyName] = useState('Sharma Family Trust & Holdings');
  const [inviteEmail, setInviteEmail] = useState('sunita.sharma@familywealth.internal');
  const [assetName, setAssetName] = useState('Worli Penthouse Residence');
  const [assetValue, setAssetValue] = useState('125000000'); // ₹12.5 Cr
  const [hasLiability, setHasLiability] = useState(true);
  const [liabilityName, setLiabilityName] = useState('SBI Home Loan (Worli)');
  const [liabilityBalance, setLiabilityBalance] = useState('18500000'); // ₹1.85 Cr

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
    <div className="min-h-screen bg-[#F0EDE5] text-[#101010] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        {/* Institutional Stepper Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#101010] text-[#F0EDE5] font-mono text-[10px] uppercase tracking-[0.2em]">
            <span>PROVENTA // INSTITUTIONAL INTAKE</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#101010] tracking-tight mt-2">
            Establish Your Wealth Institution
          </h1>
          <p className="font-mono text-xs text-[#85827B] uppercase tracking-wider">
            Protocol Phase {String(currentStep).padStart(2, '0')} of 10: <strong className="text-[#101010]">{STEPS[currentStep - 1].desc}</strong>
          </p>
        </div>

        {/* Stepper Progress Bar (Neo-Brutalist Grid) */}
        <div className="grid grid-cols-10 gap-1 border border-[#101010] p-1 bg-[#FAF9F6]">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-3 transition-colors ${
                s.id < currentStep
                  ? 'bg-[#263B35]'
                  : s.id === currentStep
                  ? 'bg-[#101010]'
                  : 'bg-[#F0EDE5]'
              }`}
              title={`Phase ${s.id}: ${s.label}`}
            />
          ))}
        </div>

        {/* Step Content Box */}
        <div className="border border-[#101010] bg-[#FAF9F6] p-8 sm:p-10 shadow-[8px_8px_0px_0px_#101010] space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="font-mono text-[10px] text-[#85827B] uppercase tracking-widest">PHASE 01 // IDENTITY</div>
              <h2 className="font-serif text-2xl text-[#101010]">Master Identity Establishment</h2>
              <p className="font-sans text-xs text-[#85827B] leading-relaxed">
                Your individual account establishes sovereign master credentials. You retain absolute legal data isolation across all family trusts.
              </p>
              <div className="space-y-4 pt-2 font-mono text-xs">
                <div>
                  <label className="block text-[#85827B] uppercase text-[10px] mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3.5 py-2.5 text-[#101010] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#85827B] uppercase text-[10px] mb-1">Primary Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3.5 py-2.5 text-[#101010] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 text-center py-6">
              <div className="w-12 h-12 bg-[#263B35] text-[#FAF9F6] border border-[#101010] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="font-mono text-[10px] text-[#85827B] uppercase tracking-widest">PHASE 02 // CIPHER</div>
              <h2 className="font-serif text-2xl text-[#101010]">Authentication Keys Initialized</h2>
              <p className="font-sans text-xs text-[#85827B] max-w-md mx-auto leading-relaxed">
                Credentials for {email} verified. Session secured under TLS 1.3 with AES-GCM-256 envelope encryption.
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="font-mono text-[10px] text-[#85827B] uppercase tracking-widest">PHASE 03 // SOVEREIGNTY</div>
              <h2 className="font-serif text-2xl text-[#101010]">Personal Sovereign Workspace</h2>
              <p className="font-sans text-xs text-[#85827B] leading-relaxed">
                Your individual universe is strictly segregated. Private holdings logged here will never appear in family viewports without explicit conveyance.
              </p>
              <div className="p-4 border border-[#101010] bg-[#F0EDE5] font-mono text-xs space-y-1">
                <div className="font-semibold text-[#101010]">Personal Universe: {fullName}</div>
                <div className="text-[10px] text-[#263B35]">Status: Private Isolation Active</div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="font-mono text-[10px] text-[#85827B] uppercase tracking-widest">PHASE 04 // JURISDICTION</div>
              <h2 className="font-serif text-2xl text-[#101010]">Financial Jurisdiction &amp; Standards</h2>
              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 border border-[#101010] bg-[#F0EDE5]">
                  <div className="text-[10px] text-[#85827B] uppercase">Reporting Currency</div>
                  <div className="text-sm font-semibold text-[#101010] mt-1">Indian Rupee (INR ₹)</div>
                </div>
                <div className="p-4 border border-[#101010] bg-[#F0EDE5]">
                  <div className="text-[10px] text-[#85827B] uppercase">Statutory Standard</div>
                  <div className="text-sm font-semibold text-[#101010] mt-1">India (DPDP Compliant)</div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="font-mono text-[10px] text-[#85827B] uppercase tracking-widest">PHASE 05 // FAMILY TRUST</div>
              <h2 className="font-serif text-2xl text-[#101010]">Register Family Trust Entity</h2>
              <p className="font-sans text-xs text-[#85827B] leading-relaxed">
                Designate the legal name of your family trust, holding company, or multi-generational estate.
              </p>
              <div className="font-mono text-xs">
                <label className="block text-[#85827B] uppercase text-[10px] mb-1">Entity / Trust Title</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#101010] px-3.5 py-2.5 text-[#101010] focus:outline-none"
                />
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="font-mono text-[10px] text-[#85827B] uppercase tracking-widest">PHASE 06 // ENROLLMENT</div>
              <h2 className="font-serif text-2xl text-[#101010]">Enroll Trustees &amp; Beneficiaries</h2>
              <p className="font-sans text-xs text-[#85827B] leading-relaxed">
                Optionally enroll your spouse, adult heirs, or chartered accountant with specific access roles.
              </p>
              <div className="font-mono text-xs">
                <label className="block text-[#85827B] uppercase text-[10px] mb-1">Beneficiary Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#101010] px-3.5 py-2.5 text-[#101010] focus:outline-none"
                />
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="font-mono text-[10px] text-[#85827B] uppercase tracking-widest">PHASE 07 // CAPITAL INVENTORY</div>
              <h2 className="font-serif text-2xl text-[#101010]">Log Primary Capital Instrument</h2>
              <p className="font-sans text-xs text-[#85827B] leading-relaxed">
                Register an anchor real estate property, Demat folio, or corporate shareholding.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <label className="block text-[#85827B] uppercase text-[10px] mb-1">Asset Description</label>
                  <input
                    type="text"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3.5 py-2.5 text-[#101010] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#85827B] uppercase text-[10px] mb-1">Certified Valuation (₹)</label>
                  <input
                    type="number"
                    value={assetValue}
                    onChange={(e) => setAssetValue(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3.5 py-2.5 text-[#101010] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="space-y-4">
              <div className="font-mono text-[10px] text-[#85827B] uppercase tracking-widest">PHASE 08 // DEBT REGISTER</div>
              <h2 className="font-serif text-2xl text-[#101010]">Record Credit Liabilities</h2>
              <p className="font-sans text-xs text-[#85827B] leading-relaxed">
                Log home mortgages or credit lines to ensure exact net worth calculation.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <label className="block text-[#85827B] uppercase text-[10px] mb-1">Facility Description</label>
                  <input
                    type="text"
                    value={liabilityName}
                    onChange={(e) => setLiabilityName(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3.5 py-2.5 text-[#101010] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#85827B] uppercase text-[10px] mb-1">Outstanding Principal (₹)</label>
                  <input
                    type="number"
                    value={liabilityBalance}
                    onChange={(e) => setLiabilityBalance(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3.5 py-2.5 text-[#101010] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 9 && (
            <div className="space-y-4 text-center py-6">
              <div className="w-12 h-12 bg-[#101010] text-[#F0EDE5] border border-[#101010] flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <div className="font-mono text-[10px] text-[#85827B] uppercase tracking-widest">PHASE 09 // VAULT ENCRYPTION</div>
              <h2 className="font-serif text-2xl text-[#101010]">Encrypted Archive Provisioned</h2>
              <p className="font-sans text-xs text-[#85827B] max-w-md mx-auto leading-relaxed">
                Your private vault is active with hardware-backed encryption keys. You may upload registered sale deeds and CAMS statements from the main console.
              </p>
            </div>
          )}

          {currentStep === 10 && (
            <div className="space-y-4 text-center py-6">
              <div className="w-12 h-12 bg-[#263B35] text-[#FAF9F6] border border-[#101010] flex items-center justify-center mx-auto">
                <PieChart className="w-6 h-6" />
              </div>
              <div className="font-mono text-[10px] text-[#85827B] uppercase tracking-widest">PHASE 10 // OPERATIONAL</div>
              <h2 className="font-serif text-2xl text-[#101010]">Living Financial System Ready</h2>
              <p className="font-sans text-xs text-[#85827B] max-w-md mx-auto leading-relaxed">
                Welcome to PROVENTA, {fullName}. All 10 modules, the deterministic integer paise engine, and 6 intelligence agents are now active.
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-[#101010] flex items-center justify-between font-mono text-xs">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2.5 border border-[#101010] uppercase text-[#101010] hover:bg-[#F0EDE5] transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Phase</span>
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] uppercase tracking-wider font-semibold border border-[#101010] transition-colors flex items-center gap-2"
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
