'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Shield,
  CheckCircle2,
  X,
  Lock,
} from 'lucide-react';
import { FamilyWorkspaceDTO, FamilyMemberDTO } from '@/lib/wealth/types';

export default function FamilyWorkspacePage() {
  const [workspace, setWorkspace] = useState<FamilyWorkspaceDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');
  const [inviteRelationship, setInviteRelationship] = useState('CHILD');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);

  async function loadFamilyData() {
    setLoading(true);
    try {
      const res = await fetch('/api/wealth/workspaces?userId=usr_rajesh_sharma');
      const json = await res.json();
      if (json.success && json.data?.families?.length > 0) {
        setWorkspace(json.data.families[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFamilyData();
  }, []);

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail || !workspace) return;

    try {
      const res = await fetch('/api/wealth/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'INVITE_MEMBER',
          familyId: workspace.id,
          inviteeEmail: inviteEmail,
          role: inviteRole,
          relationship: inviteRelationship,
        }),
      });

      if (res.ok) {
        setInviteSuccessMsg(`Institutional invitation dispatched to ${inviteEmail}.`);
        setInviteEmail('');
        setTimeout(() => {
          setIsInviteModalOpen(false);
          setInviteSuccessMsg(null);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading || !workspace) {
    return (
      <div className="flex items-center justify-center min-h-[400px] border border-[#252C38] bg-[#171C26] p-8 font-mono text-xs uppercase tracking-widest text-[#7595FF] rounded-[2px]">
        Loading Family Trust &amp; Governance Matrix...
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* 1. TITANIUM COBALT HEADER & GOVERNANCE BANNER */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="p-6 sm:p-8 border-b border-[#252C38] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7595FF] font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#2457FF]" />
              <span>05 // FAMILY GOVERNANCE &amp; TRUSTEESHIP</span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#F4F6FA] tracking-tight mt-1">
              {workspace.name}
            </h1>
            <p className="font-sans text-xs text-[#C5CAD3] mt-2 max-w-xl">
              Legal structure: Multi-Generational Family Trust &amp; Operating Entities. Granular resource-level permissions and intergenerational succession access.
            </p>
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-5 py-3 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] font-mono text-xs uppercase tracking-wider font-semibold border border-[#7595FF]/40 rounded-[2px] shadow-[0_0_15px_rgba(36,87,255,0.3)] transition-all flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Enroll Trustee / Member</span>
          </button>
        </div>

        {/* Governance Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#252C38] bg-[#090B10]">
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              ACTIVE ENROLLED MEMBERS
            </div>
            <div className="font-display font-bold text-2xl text-[#F4F6FA]">
              {workspace.members.length} Recognized Beneficiaries
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              PRIMARY JURISDICTION
            </div>
            <div className="font-display font-bold text-2xl text-[#7595FF]">
              India // Trust Act 1882
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              DATA SOVEREIGNTY
            </div>
            <div className="font-display font-bold text-2xl text-[#F4F6FA]">
              Strict Multi-Tenant Isolation
            </div>
          </div>
        </div>
      </div>

      {/* 2. TITANIUM MEMBERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workspace.members.map((member, idx) => (
          <div
            key={member.id}
            className="p-6 border border-[#252C38] bg-[#171C26] rounded-[2px] flex flex-col justify-between space-y-4 hover:border-[#7595FF]/50 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#090B10] text-[#7595FF] border border-[#252C38] rounded-[2px] flex items-center justify-center font-mono text-xs font-bold">
                  {member.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <div className="font-display font-bold text-lg text-[#F4F6FA]">{member.name}</div>
                  <div className="font-mono text-[11px] text-[#858D9B]">{member.email}</div>
                </div>
              </div>
              <span
                className={`font-mono text-[10px] px-2.5 py-1 uppercase tracking-wider rounded-[2px] border ${
                  member.role === 'OWNER'
                    ? 'bg-[#2457FF]/15 text-[#7595FF] border-[#2457FF]'
                    : member.role === 'ADMIN'
                    ? 'bg-[#7595FF]/15 text-[#7595FF] border-[#7595FF]/40'
                    : 'bg-[#090B10] text-[#C5CAD3] border-[#252C38]'
                }`}
              >
                {member.role}
              </span>
            </div>

            <div className="pt-4 border-t border-[#252C38] flex items-center justify-between font-mono text-xs">
              <span className="text-[#858D9B]">RELATIONSHIP: <strong className="text-[#F4F6FA]">{member.relationship}</strong></span>
              <span className="text-[#858D9B] text-[10px]">ENROLLED: {new Date(member.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. STRICT DPDP ACT & ISOLATION PROTOCOL */}
      <div className="p-6 border border-[#252C38] bg-[#171C26] rounded-[2px] space-y-2">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#7595FF] font-semibold">
          <Lock className="w-4 h-4 text-[#2457FF]" />
          <span>STATUTORY TENANT ISOLATION GUARANTEE</span>
        </div>
        <p className="font-sans text-xs text-[#C5CAD3] leading-relaxed">
          PROVENTA enforces cryptographic tenant isolation compliant with the Digital Personal Data Protection (DPDP) Act 2023. Enrolling a family member in this Trust workspace does not grant visibility into personal assets or separate business holding accounts without explicit dual-key consent.
        </p>
      </div>

      {/* 4. ENROLL MEMBER MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090B10]/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#171C26] border border-[#252C38] p-6 space-y-4 rounded-[2px] shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#252C38]">
              <h3 className="font-display font-bold text-xl text-[#F4F6FA]">Enroll Family Trustee / Member</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] p-1 border border-[#252C38] rounded-[2px]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {inviteSuccessMsg ? (
              <div className="p-4 bg-[#090B10] border border-[#2457FF] font-mono text-xs text-[#7595FF] flex items-center gap-2 rounded-[2px]">
                <CheckCircle2 className="w-4 h-4" />
                <span>{inviteSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="family.member@email.com"
                    className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                      Access Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                    >
                      <option value="MEMBER">Member (Read &amp; Record)</option>
                      <option value="ADMIN">Administrator (Full Trust)</option>
                      <option value="VIEWER">Auditor / CA (Read-Only)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                      Relationship
                    </label>
                    <select
                      value={inviteRelationship}
                      onChange={(e) => setInviteRelationship(e.target.value)}
                      className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                    >
                      <option value="SPOUSE">Spouse</option>
                      <option value="CHILD">Child / Heir</option>
                      <option value="PARENT">Parent</option>
                      <option value="SIBLING">Sibling</option>
                      <option value="ADVISOR">Financial Advisor / CA</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#252C38] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 border border-[#252C38] font-mono text-xs uppercase text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] rounded-[2px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] font-mono text-xs uppercase tracking-wider font-semibold border border-[#7595FF]/40 rounded-[2px] shadow-[0_0_12px_rgba(36,87,255,0.3)]"
                  >
                    Dispatch Invitation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
