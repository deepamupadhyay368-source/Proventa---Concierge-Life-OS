'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  Phone,
  Mail,
  Shield,
  Lock,
  Edit2,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { FamilyContinuityDTO } from '@/lib/wealth/types';

export default function ContinuityPage() {
  const [continuity, setContinuity] = useState<FamilyContinuityDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [instructionsText, setInstructionsText] = useState('');

  async function loadContinuity() {
    setLoading(true);
    try {
      const res = await fetch('/api/wealth/continuity?familyId=fam_sharma_heritage');
      const json = await res.json();
      if (json.success && json.data) {
        setContinuity(json.data);
        setInstructionsText(json.data.emergencyInstructions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadContinuity();
  }, []);

  async function handleSaveInstructions() {
    try {
      const res = await fetch('/api/wealth/continuity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_INSTRUCTIONS',
          familyId: 'fam_sharma_heritage',
          instructions: instructionsText,
        }),
      });
      if (res.ok) {
        setIsEditingInstructions(false);
        await loadContinuity();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading || !continuity) {
    return (
      <div className="flex items-center justify-center min-h-[400px] border border-[#101010] bg-[#FAF9F6] p-8 font-mono text-xs uppercase tracking-widest text-[#101010]">
        Loading Succession &amp; Continuity Protocol...
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* 1. INSTITUTIONAL HEADER & BANNER */}
      <div className="border border-[#101010] bg-[#FAF9F6]">
        <div className="p-6 sm:p-8 border-b border-[#101010]">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#85827B]">
            11 // SUCCESSION &amp; FAMILY CONTINUITY
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#101010] tracking-tight mt-1">
            Intergenerational Continuity Archive
          </h1>
          <p className="font-sans text-xs text-[#85827B] mt-2 max-w-xl">
            Asset-by-asset nominee records, registered wills, emergency medical protocols, and directory of chartered accountants and estate attorneys.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-[#F0EDE5] border-b border-[#101010] flex items-center gap-3 font-mono text-xs text-[#101010]">
          <Shield className="w-4 h-4 text-[#263B35] shrink-0" />
          <span>
            <strong>STATUTORY SUCCESSION NOTICE:</strong> Digital nominee records serve administrative facilitation. Official probate, will execution, and testamentary rights require registered execution under the Indian Succession Act.
          </span>
        </div>

        {/* Continuity Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#101010] bg-[#FAF9F6]">
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              REGISTERED NOMINEE ENTRIES
            </div>
            <div className="font-serif text-2xl text-[#101010]">
              {continuity.nomineeRecords.length} Instruments Mapped
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              PRIMARY SUCCESSION COUNSEL
            </div>
            <div className="font-serif text-2xl text-[#263B35]">
              Senior Advocate Verified
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              EMERGENCY PROTOCOL STATUS
            </div>
            <div className="font-serif text-2xl text-[#101010]">
              Active &amp; Sealed
            </div>
          </div>
        </div>
      </div>

      {/* 2. EMERGENCY MEDICAL & FINANCIAL DIRECTIVES */}
      <div className="border border-[#101010] bg-[#FAF9F6] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#101010] pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#101010]" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#101010] font-semibold">
              Emergency Directives &amp; Safe Locker Access Protocol
            </h3>
          </div>
          {!isEditingInstructions ? (
            <button
              onClick={() => setIsEditingInstructions(true)}
              className="font-mono text-xs uppercase tracking-wider text-[#101010] underline flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Protocol Directives</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingInstructions(false)}
                className="px-3 py-1 border border-[#101010] font-mono text-xs uppercase text-[#101010]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInstructions}
                className="px-4 py-1 bg-[#101010] text-[#F0EDE5] font-mono text-xs uppercase font-semibold"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {isEditingInstructions ? (
          <textarea
            rows={4}
            value={instructionsText}
            onChange={(e) => setInstructionsText(e.target.value)}
            className="w-full bg-[#FAF9F6] border border-[#101010] p-3 font-mono text-xs text-[#101010] focus:outline-none"
          />
        ) : (
          <div className="p-4 bg-[#F0EDE5] border border-[#101010] font-mono text-xs text-[#101010] leading-relaxed">
            {continuity.emergencyInstructions}
          </div>
        )}
      </div>

      {/* 3. ESSENTIAL PROFESSIONAL ADVISORS DIRECTORY */}
      <div className="space-y-4">
        <div className="font-mono text-xs uppercase tracking-wider text-[#101010] font-semibold">
          Primary Institutional Advisors &amp; Advocates
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {continuity.importantContacts.map((contact, idx) => (
            <div
              key={contact.id}
              className="p-6 border border-[#101010] bg-[#FAF9F6] space-y-3 hover:bg-[#F0EDE5] transition-colors"
            >
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="px-2 py-0.5 border border-[#101010] bg-[#FAF9F6] uppercase">
                  {contact.role.replace('_', ' ')}
                </span>
                <span className="text-[#85827B]">ADV-0{idx + 1}</span>
              </div>

              <div>
                <h4 className="font-serif text-lg text-[#101010]">{contact.name}</h4>
                {contact.organization && (
                  <div className="font-mono text-xs text-[#85827B] mt-0.5">{contact.organization}</div>
                )}
              </div>

              <div className="space-y-1.5 pt-3 border-t border-[#101010]/15 font-mono text-xs">
                <div className="flex items-center gap-2 text-[#101010]">
                  <Phone className="w-3.5 h-3.5 text-[#85827B]" />
                  <span>{contact.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-[#101010]">
                  <Mail className="w-3.5 h-3.5 text-[#85827B]" />
                  <span>{contact.email}</span>
                </div>
              </div>

              {contact.notes && (
                <div className="pt-2 font-mono text-[10px] text-[#85827B]">
                  {contact.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. ASSET-BY-ASSET NOMINEE REGISTER */}
      <div className="border border-[#101010] bg-[#FAF9F6] overflow-x-auto">
        <div className="p-4 bg-[#101010] text-[#F0EDE5] font-mono text-xs uppercase tracking-wider font-semibold">
          Consolidated Nominee Allocation Register
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#FAF9F6] border-b border-[#101010] text-[#85827B] font-mono text-[10px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 border-b border-[#101010]">Asset Instrument or Policy</th>
              <th className="py-3 px-4 border-b border-[#101010]">Designated Nominee</th>
              <th className="py-3 px-4 border-b border-[#101010]">Relationship</th>
              <th className="py-3 px-4 border-b border-[#101010]">Nominated Share (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#101010] text-[#101010]">
            {continuity.nomineeRecords.map((nom, i) => (
              <tr key={i} className="hover:bg-[#F0EDE5] transition-colors">
                <td className="py-4 px-4 font-serif text-base text-[#101010] font-normal">{nom.assetOrPolicyName}</td>
                <td className="py-4 px-4 font-mono text-xs font-semibold">{nom.nomineeName}</td>
                <td className="py-4 px-4 font-mono text-xs text-[#85827B]">{nom.relationship}</td>
                <td className="py-4 px-4 font-mono text-xs font-bold text-[#263B35]">{nom.sharePercentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
