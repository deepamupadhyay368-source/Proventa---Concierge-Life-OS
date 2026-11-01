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
      <div className="flex items-center justify-center min-h-[400px] border border-[#101010] bg-[#FAF9F6] p-8 font-mono text-xs uppercase tracking-widest text-[#101010]">
        Loading Family Trust &amp; Governance Matrix...
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* 1. INSTITUTIONAL HEADER & GOVERNANCE BANNER */}
      <div className="border border-[#101010] bg-[#FAF9F6]">
        <div className="p-6 sm:p-8 border-b border-[#101010] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#85827B]">
              05 // FAMILY GOVERNANCE &amp; TRUSTEESHIP
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl text-[#101010] tracking-tight mt-1">
              {workspace.name}
            </h1>
            <p className="font-sans text-xs text-[#85827B] mt-2 max-w-xl">
              Legal structure: Multi-Generational Family Trust &amp; Operating Entities. Granular resource-level permissions and intergenerational succession access.
            </p>
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-5 py-3 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] font-mono text-xs uppercase tracking-wider font-semibold border border-[#101010] transition-colors flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Enroll Trustee / Member</span>
          </button>
        </div>

        {/* Governance Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#101010] bg-[#F0EDE5]">
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              ACTIVE ENROLLED MEMBERS
            </div>
            <div className="font-serif text-2xl text-[#101010]">
              {workspace.members.length} Recognized Beneficiaries
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              PRIMARY JURISDICTION
            </div>
            <div className="font-serif text-2xl text-[#101010]">
              India // Hindu Succession / Trust Act
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              DATA SOVEREIGNTY
            </div>
            <div className="font-serif text-2xl text-[#263B35]">
              Strict Multi-Tenant Isolation
            </div>
          </div>
        </div>
      </div>

      {/* 2. ARCHITECTURAL MEMBERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workspace.members.map((member, idx) => (
          <div
            key={member.id}
            className="p-6 border border-[#101010] bg-[#FAF9F6] flex flex-col justify-between space-y-4 hover:bg-[#F0EDE5] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#101010] text-[#F0EDE5] border border-[#101010] flex items-center justify-center font-mono text-xs font-bold">
                  {member.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <div className="font-serif text-lg text-[#101010]">{member.name}</div>
                  <div className="font-mono text-[11px] text-[#85827B]">{member.email}</div>
                </div>
              </div>
              <span
                className={`font-mono text-[10px] px-2.5 py-1 uppercase tracking-wider border ${
                  member.role === 'OWNER'
                    ? 'bg-[#101010] text-[#F0EDE5] border-[#101010]'
                    : member.role === 'ADMIN'
                    ? 'bg-[#263B35] text-[#FAF9F6] border-[#263B35]'
                    : 'bg-[#FAF9F6] text-[#101010] border-[#101010]'
                }`}
              >
                {member.role}
              </span>
            </div>

            <div className="pt-4 border-t border-[#101010]/15 flex items-center justify-between font-mono text-xs">
              <span className="text-[#85827B]">RELATIONSHIP: <strong className="text-[#101010]">{member.relationship}</strong></span>
              <span className="text-[#85827B] text-[10px]">ENROLLED: {new Date(member.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. STRICT DPDP ACT & ISOLATION PROTOCOL */}
      <div className="p-6 border border-[#101010] bg-[#FAF9F6] space-y-2">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#101010] font-semibold">
          <Lock className="w-4 h-4 text-[#263B35]" />
          <span>STATUTORY TENANT ISOLATION GUARANTEE</span>
        </div>
        <p className="font-sans text-xs text-[#85827B] leading-relaxed">
          PROVENTA enforces cryptographic tenant isolation compliant with the Digital Personal Data Protection (DPDP) Act 2023. Enrolling a family member in this Trust workspace does not grant visibility into personal assets or separate business holding accounts without explicit dual-key consent.
        </p>
      </div>

      {/* 4. ENROLL MEMBER MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101010]/70">
          <div className="w-full max-w-md bg-[#FAF9F6] border border-[#101010] p-6 space-y-4 shadow-[8px_8px_0px_0px_#101010]">
            <div className="flex items-center justify-between pb-3 border-b border-[#101010]">
              <h3 className="font-serif text-xl text-[#101010]">Enroll Family Trustee / Member</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-[#101010] hover:bg-[#F0EDE5] p-1 border border-[#101010]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {inviteSuccessMsg ? (
              <div className="p-4 bg-[#F0EDE5] border border-[#263B35] font-mono text-xs text-[#263B35] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{inviteSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="family.member@email.com"
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                      Access Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                    >
                      <option value="MEMBER">Member (Read &amp; Record)</option>
                      <option value="ADMIN">Administrator (Full Trust)</option>
                      <option value="VIEWER">Auditor / CA (Read-Only)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                      Relationship
                    </label>
                    <select
                      value={inviteRelationship}
                      onChange={(e) => setInviteRelationship(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
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

                <div className="pt-3 border-t border-[#101010] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 border border-[#101010] font-mono text-xs uppercase text-[#101010] hover:bg-[#F0EDE5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] font-mono text-xs uppercase tracking-wider font-semibold border border-[#101010]"
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
