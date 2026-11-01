'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  Users,
  Coins,
  CreditCard,
  Lock,
  PieChart,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Identity', desc: 'Account & Credentials' },
  { id: 2, label: 'Verification', desc: 'Secure Authentication' },
  { id: 3, label: 'Individual Workspace', desc: 'Personal Sovereignty' },
  { id: 4, label: 'Profile', desc: 'Financial Jurisdiction' },
  { id: 5, label: 'Family Trust', desc: 'Multi-Generational Entity' },
  { id: 6, label: 'Invite Members', desc: 'Spouse, Children, Advisors' },
  { id: 7, label: 'First Asset', desc: 'Property, MF, or Equity' },
  { id: 8, label: 'Liabilities', desc: 'Mortgages & Facilities' },
  { id: 9, label: 'Vault Upload', desc: 'Encrypted Documents' },
  { id: 10, label: 'Living Dashboard', desc: 'Deterministic Synthesis' },
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
    <div className="min-h-screen bg-[#0B0F19] text-[#F8F9FD] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E1035] border border-[#3E236E] text-[10px] font-mono uppercase tracking-widest text-[#A78BFA]">
            <Sparkles className="w-3.5 h-3.5" />
            10-STEP WEALTH ONBOARDING JOURNEY
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-white">
            Set Up Your Living Financial System
          </h1>
          <p className="text-xs text-[#9D8BC9]">
            Step {currentStep} of 10: <strong className="text-white">{STEPS[currentStep - 1].desc}</strong>
          </p>
        </div>

        {/* Stepper Progress bar */}
        <div className="grid grid-cols-10 gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-2 rounded-full transition-all ${
                s.id < currentStep
                  ? 'bg-[#10B981]'
                  : s.id === currentStep
                  ? 'bg-[#7C3AED] shadow-sm shadow-[#7C3AED]'
                  : 'bg-[#1E293B]'
              }`}
            />
          ))}
        </div>

        {/* Dynamic Step Content Box */}
        <div className="p-8 rounded-3xl bg-[#0E1322] border border-[#2D1854] shadow-2xl space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Step 1: Create Sovereign Account</h2>
              <p className="text-xs text-[#9D8BC9] font-light">
                Your individual account establishes your master identity. You retain 100% data sovereignty across all future family relationships.
              </p>
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-[#064E3B]/40 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-white">Step 2: Authentication Key Verified</h2>
              <p className="text-xs text-[#9D8BC9] max-w-md mx-auto font-light leading-relaxed">
                Your email ({email}) has been cryptographically confirmed. Your session is protected by TLS 1.3 and hardware-backed session revocation.
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Step 3: Initializing Individual Workspace</h2>
              <p className="text-xs text-[#9D8BC9] font-light">
                Your Personal Workspace is isolated from all family members by default. Nothing added here will ever leak into a family workspace unless explicitly shared.
              </p>
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E293B] text-xs space-y-1">
                <div className="text-white font-medium">Personal Workspace: {fullName}</div>
                <div className="text-[10px] text-[#10B981] font-mono">Status: Private Sovereignty Active</div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Step 4: Financial Profile &amp; Jurisdiction</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E293B]">
                  <div className="text-[10px] text-[#9D8BC9] font-mono">Primary Currency</div>
                  <div className="text-sm font-semibold text-white mt-1">Indian Rupee (INR ₹)</div>
                </div>
                <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E293B]">
                  <div className="text-[10px] text-[#9D8BC9] font-mono">Tax Jurisdiction</div>
                  <div className="text-sm font-semibold text-white mt-1">India (DPDP Compliant)</div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Step 5: Create Family Trust Workspace</h2>
              <p className="text-xs text-[#9D8BC9] font-light">
                Enter the name of your family holdings or trust entity to invite members and manage joint holdings.
              </p>
              <div>
                <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Family Workspace Title</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Step 6: Invite Family Members</h2>
              <p className="text-xs text-[#9D8BC9] font-light">
                Optionally invite your spouse, children, or trusted CA. You can assign them Member or Advisor roles.
              </p>
              <div>
                <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Spouse or Member Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Step 7: Record Your First Wealth Asset</h2>
              <p className="text-xs text-[#9D8BC9] font-light">
                Add an initial real estate holding, mutual fund portfolio, or company shareholding.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Asset Description</label>
                  <input
                    type="text"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Estimated Value (₹)</label>
                  <input
                    type="number"
                    value={assetValue}
                    onChange={(e) => setAssetValue(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Step 8: Liabilities &amp; Facilities</h2>
              <p className="text-xs text-[#9D8BC9] font-light">
                Record any active home mortgage or business term loans to calculate accurate net worth.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Facility Name</label>
                  <input
                    type="text"
                    value={liabilityName}
                    onChange={(e) => setLiabilityName(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Outstanding Balance (₹)</label>
                  <input
                    type="number"
                    value={liabilityBalance}
                    onChange={(e) => setLiabilityBalance(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 9 && (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1E1035] border border-[#3E236E] flex items-center justify-center text-[#A78BFA] mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-white">Step 9: Encrypted Family Vault Initialized</h2>
              <p className="text-xs text-[#9D8BC9] max-w-md mx-auto font-light leading-relaxed">
                Your private vault is provisioned with client-side envelope encryption and signed download links. You can upload title deeds and ITR statements from the dashboard.
              </p>
            </div>
          )}

          {currentStep === 10 && (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#1E1035] flex items-center justify-center text-white mx-auto shadow-lg shadow-[#7C3AED]/30">
                <PieChart className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-white">Step 10: Living Wealth OS Ready</h2>
              <p className="text-xs text-[#9D8BC9] max-w-md mx-auto font-light leading-relaxed">
                Congratulations, {fullName}! Your family holdings, deterministic calculation engine, and AI assistant are fully synchronized.
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-[#1E293B] flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-[#9D8BC9] hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-[#7C3AED] hover:bg-[#8B5CF6] transition-all shadow-md shadow-[#7C3AED]/25"
            >
              <span>{currentStep === 10 ? 'Enter Living Console' : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
