'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  Phone,
  Mail,
  Shield,
  Plus,
  AlertTriangle,
  Lock,
  Edit2,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { FamilyContinuityDTO, EmergencyContact } from '@/lib/wealth/types';

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
      <div className="flex items-center justify-center min-h-[300px] text-xs font-mono text-[#A78BFA]">
        Loading Family Continuity &amp; Nominee Directory...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A78BFA] mb-1">
            FAMILY WEALTH OS // SUCCESSION &amp; CONTINUITY
          </div>
          <h1 className="font-serif text-3xl text-white">Family Continuity &amp; Emergency Directives</h1>
          <p className="text-xs text-[#9D8BC9] font-light mt-1">
            Centralized nominee records, registered wills, emergency medical directives, and key professional advisors.
          </p>
        </div>
      </div>

      {/* Statutory Disclaimer */}
      <div className="p-4 rounded-xl bg-[#0E1322] border border-[#1E293B] text-xs text-[#9D8BC9] flex items-center gap-2.5">
        <Shield className="w-4 h-4 text-[#10B981] shrink-0" />
        <span>
          <strong>Administrative Recordkeeping:</strong> PROVENTA does not provide legal opinions on succession, probate, or inheritance rights. Always consult your High Court advocate or legal counsel for registered will execution.
        </span>
      </div>

      {/* 1. EMERGENCY MEDICAL & FINANCIAL DIRECTIVES */}
      <div className="p-6 rounded-2xl bg-[#0E1322] border border-[#2D1854] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#A78BFA]" />
            <h3 className="text-sm font-semibold text-white">Emergency Directives &amp; Safe Locker Access</h3>
          </div>
          {!isEditingInstructions ? (
            <button
              onClick={() => setIsEditingInstructions(true)}
              className="text-xs text-[#A78BFA] hover:text-white flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Directives</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingInstructions(false)}
                className="text-xs text-[#9D8BC9] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInstructions}
                className="px-3 py-1 rounded bg-[#7C3AED] text-xs font-semibold text-white"
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
            className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
          />
        ) : (
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E293B] text-xs text-[#DDD0F7] font-light leading-relaxed">
            {continuity.emergencyInstructions}
          </div>
        )}
      </div>

      {/* 2. ESSENTIAL PROFESSIONAL ADVISORS DIRECTORY */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
          Trusted Family Professional Advisors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {continuity.importantContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E1035] text-[#A78BFA] border border-[#3E236E]">
                  {contact.role.replace('_', ' ')}
                </span>
                <UserCheck className="w-4 h-4 text-[#10B981]" />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white">{contact.name}</h4>
                {contact.organization && (
                  <div className="text-xs text-[#9D8BC9] mt-0.5">{contact.organization}</div>
                )}
              </div>

              <div className="space-y-1.5 pt-3 border-t border-[#1E293B] text-xs">
                <div className="flex items-center gap-2 text-white font-mono">
                  <Phone className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{contact.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-white font-mono">
                  <Mail className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{contact.email}</span>
                </div>
              </div>

              {contact.notes && (
                <div className="pt-2 text-[11px] text-[#64748B] font-light">
                  {contact.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. NOMINEE REGISTER */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
          Consolidated Nominee Register
        </h3>
        <div className="rounded-2xl bg-[#0E1322] border border-[#1E293B] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070A12] border-b border-[#1E293B] text-[10px] font-mono uppercase tracking-wider text-[#9D8BC9]">
              <tr>
                <th className="py-3 px-4">Asset / Insurance Policy</th>
                <th className="py-3 px-4">Designated Nominee</th>
                <th className="py-3 px-4">Relationship</th>
                <th className="py-3 px-4">Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-white">
              {continuity.nomineeRecords.map((nom, i) => (
                <tr key={i} className="hover:bg-[#1E1035]/30 transition-colors">
                  <td className="py-4 px-4 font-medium text-white">{nom.assetOrPolicyName}</td>
                  <td className="py-4 px-4 text-white font-semibold">{nom.nomineeName}</td>
                  <td className="py-4 px-4 text-[#9D8BC9]">{nom.relationship}</td>
                  <td className="py-4 px-4 font-mono font-bold text-[#10B981]">{nom.sharePercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
