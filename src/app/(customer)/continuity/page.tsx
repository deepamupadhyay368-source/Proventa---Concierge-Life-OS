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
      <div className="flex items-center justify-center min-h-[400px] border border-[#252C38] bg-[#171C26] p-8 font-mono text-xs uppercase tracking-widest text-[#7595FF] rounded-[2px]">
        Loading Succession &amp; Continuity Protocol...
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* 1. TITANIUM COBALT HEADER & BANNER */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="p-6 sm:p-8 border-b border-[#252C38]">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7595FF] font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#2457FF]" />
            <span>11 // SUCCESSION &amp; FAMILY CONTINUITY</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#F4F6FA] tracking-tight mt-1">
            Intergenerational Continuity Archive
          </h1>
          <p className="font-sans text-xs text-[#C5CAD3] mt-2 max-w-xl">
            Asset-by-asset nominee records, registered wills, emergency medical protocols, and directory of chartered accountants and estate attorneys.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-[#090B10] border-b border-[#252C38] flex items-center gap-3 font-mono text-xs text-[#C5CAD3]">
          <Shield className="w-4 h-4 text-[#7595FF] shrink-0" />
          <span>
            <strong className="text-[#F4F6FA]">STATUTORY SUCCESSION NOTICE:</strong> Digital nominee records serve administrative facilitation. Official probate, will execution, and testamentary rights require registered execution under the Indian Succession Act.
          </span>
        </div>

        {/* Continuity Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#252C38] bg-[#090B10]">
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              REGISTERED NOMINEE ENTRIES
            </div>
            <div className="font-display font-bold text-2xl text-[#F4F6FA]">
              {continuity.nomineeRecords.length} Instruments Mapped
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              PRIMARY SUCCESSION COUNSEL
            </div>
            <div className="font-display font-bold text-2xl text-[#7595FF]">
              Senior Advocate Verified
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              EMERGENCY PROTOCOL STATUS
            </div>
            <div className="font-display font-bold text-2xl text-[#F4F6FA]">
              Active &amp; Sealed
            </div>
          </div>
        </div>
      </div>

      {/* 2. EMERGENCY MEDICAL & FINANCIAL DIRECTIVES */}
      <div className="border border-[#252C38] bg-[#171C26] p-6 space-y-4 rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between border-b border-[#252C38] pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#7595FF]" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#F4F6FA] font-bold">
              Emergency Directives &amp; Safe Locker Access Protocol
            </h3>
          </div>
          {!isEditingInstructions ? (
            <button
              onClick={() => setIsEditingInstructions(true)}
              className="font-mono text-xs uppercase tracking-wider text-[#7595FF] hover:underline flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Protocol Directives</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingInstructions(false)}
                className="px-3 py-1 border border-[#252C38] font-mono text-xs uppercase text-[#C5CAD3] hover:text-[#F4F6FA] rounded-[2px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInstructions}
                className="px-4 py-1 bg-[#2457FF] text-[#F4F6FA] font-mono text-xs uppercase font-semibold rounded-[2px]"
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
            className="w-full bg-[#090B10] border border-[#252C38] p-3 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
          />
        ) : (
          <div className="p-4 bg-[#090B10] border border-[#252C38] font-mono text-xs text-[#C5CAD3] leading-relaxed rounded-[2px]">
            {continuity.emergencyInstructions}
          </div>
        )}
      </div>

      {/* 3. ESSENTIAL PROFESSIONAL ADVISORS DIRECTORY */}
      <div className="space-y-4">
        <div className="font-mono text-xs uppercase tracking-wider text-[#7595FF] font-semibold">
          Primary Institutional Advisors &amp; Advocates
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {continuity.importantContacts.map((contact, idx) => (
            <div
              key={contact.id}
              className="p-6 border border-[#252C38] bg-[#171C26] space-y-3 hover:border-[#7595FF]/50 transition-colors rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="px-2 py-0.5 border border-[#252C38] bg-[#090B10] text-[#C5CAD3] rounded-[2px] uppercase">
                  {contact.role.replace('_', ' ')}
                </span>
                <span className="text-[#7595FF] font-semibold">ADV-0{idx + 1}</span>
              </div>

              <div>
                <h4 className="font-display font-bold text-lg text-[#F4F6FA]">{contact.name}</h4>
                {contact.organization && (
                  <div className="font-mono text-xs text-[#858D9B] mt-0.5">{contact.organization}</div>
                )}
              </div>

              <div className="space-y-1.5 pt-3 border-t border-[#252C38] font-mono text-xs">
                <div className="flex items-center gap-2 text-[#C5CAD3]">
                  <Phone className="w-3.5 h-3.5 text-[#7595FF]" />
                  <span>{contact.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-[#C5CAD3]">
                  <Mail className="w-3.5 h-3.5 text-[#7595FF]" />
                  <span>{contact.email}</span>
                </div>
              </div>

              {contact.notes && (
                <div className="pt-2 font-mono text-[10px] text-[#858D9B]">
                  {contact.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. ASSET-BY-ASSET NOMINEE REGISTER */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] overflow-x-auto shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="p-4 bg-[#090B10] text-[#7595FF] font-mono text-xs uppercase tracking-wider font-semibold border-b border-[#252C38]">
          Consolidated Nominee Allocation Register
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#171C26] border-b border-[#252C38] text-[#858D9B] font-mono text-[10px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 border-b border-[#252C38]">Asset Instrument or Policy</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Designated Nominee</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Relationship</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Nominated Share (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252C38] text-[#F4F6FA]">
            {continuity.nomineeRecords.map((nom, i) => (
              <tr key={i} className="hover:bg-[#1C2230] transition-colors">
                <td className="py-4 px-4 font-display font-bold text-base text-[#F4F6FA]">{nom.assetOrPolicyName}</td>
                <td className="py-4 px-4 font-mono text-xs font-semibold text-[#F4F6FA]">{nom.nomineeName}</td>
                <td className="py-4 px-4 font-mono text-xs text-[#85827B]">{nom.relationship}</td>
                <td className="py-4 px-4 font-mono text-xs font-bold text-[#7595FF]">{nom.sharePercentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
