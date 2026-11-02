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
  Orbit,
} from 'lucide-react';
import { FamilyWorkspaceDTO, FamilyMemberDTO } from '@/lib/wealth/types';
import { FinancialUniverse } from '@/components/wealth/universe/FinancialUniverse';
import { useCurrentWorkspace } from '@/lib/wealth/workspace-context';

export default function FamilyWorkspacePage() {
  const { user, isLoaded, refreshWorkspaces } = useCurrentWorkspace();
  const [workspace, setWorkspace] = useState<FamilyWorkspaceDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');
  const [inviteRelationship, setInviteRelationship] = useState('CHILD');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);

  async function loadFamilyData() {
    setLoading(true);
    try {
      const userId = user?.id;
      if (!userId) {
        setWorkspace(null);
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/wealth/workspaces?userId=${encodeURIComponent(userId)}`);
      const json = await res.json();
      if (json.success && json.data?.families?.length > 0) {
        setWorkspace(json.data.families[0]);
      } else {
        setWorkspace(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isLoaded) {
      void loadFamilyData();
    }
  }, [user?.id, isLoaded]);

  async function handleCreateFamily(e: React.FormEvent) {
    e.preventDefault();
    if (!newFamilyName.trim()) return;

    try {
      const res = await fetch('/api/wealth/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFamilyName.trim(),
          ownerId: user?.id,
          ownerName: user?.name || 'Primary Trustee',
          ownerEmail: user?.email || 'trustee@proventa.internal',
        }),
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewFamilyName('');
        await loadFamilyData();
        await refreshWorkspaces();
      }
    } catch (err) {
      console.error(err);
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] border border-[#CBD5E1] bg-white p-8 font-mono text-xs uppercase tracking-wider text-[#2563EB] rounded-2xl shadow-sm">
        Loading Living Family Governance Topology...
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="space-y-6">
        <div className="p-8 sm:p-12 border border-[#CBD5E1] bg-white rounded-2xl shadow-sm text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-2xl text-[#0F172A]">
            Register Your Family Trust
          </h2>
          <p className="text-sm text-[#64748B] max-w-md mx-auto">
            You are currently operating in your Personal Workspace. Register a multi-member family trust to invite family beneficiaries, advisors, and co-trustees.
          </p>
          <div className="pt-2 max-w-sm mx-auto">
            <form onSubmit={handleCreateFamily} className="space-y-3">
              <input
                type="text"
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                placeholder="e.g. Heritage Family Trust"
                className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:outline-none rounded-xl text-sm text-[#0F172A]"
                required
              />
              <button
                type="submit"
                className="w-full py-3 bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-mono text-xs uppercase tracking-wider font-semibold rounded-xl shadow-sm transition-all"
              >
                + Register Family Trust
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* 1. FINANCIAL UNIVERSE INTERACTIVE TOPOLOGY (SYSTEM 02) */}
      <FinancialUniverse />

      {/* 2. FAMILY GOVERNANCE & TRUSTEESHIP BANNER */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#2563EB] font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
              <span>REGISTER 04 // TRUSTEES &amp; BENEFICIARIES</span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#0F172A] tracking-tight mt-1">
              {workspace.name}
            </h1>
            <p className="font-sans text-xs text-[#475569] mt-2 max-w-xl">
              Legal structure: Multi-Generational Family Trust under Indian Trusts Act 1882. Granular resource-level permissions and intergenerational succession access.
            </p>
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-5 py-2.5 bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-mono text-xs uppercase tracking-wider font-semibold rounded-lg shadow-sm shadow-blue-500/25 transition-all flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Enroll Trustee / Member</span>
          </button>
        </div>

        {/* Governance Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] bg-[#FAFBFC]">
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
              ACTIVE ENROLLED MEMBERS
            </div>
            <div className="font-display font-bold text-2xl text-[#0F172A]">
              {workspace.members.length} Recognized Beneficiaries
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
              PRIMARY JURISDICTION
            </div>
            <div className="font-display font-bold text-2xl text-[#2563EB]">
              India // Trust Act 1882
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
              DATA SOVEREIGNTY
            </div>
            <div className="font-display font-bold text-2xl text-[#0D9488]">
              Strict Multi-Tenant Isolation
            </div>
          </div>
        </div>
      </div>

      {/* 3. MEMBERS DIRECTORY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workspace.members.map((member) => (
          <div
            key={member.id}
            className="p-6 bg-white border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-md rounded-2xl flex flex-col justify-between space-y-4 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded-xl flex items-center justify-center font-mono text-xs font-bold">
                  {member.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <div className="font-display font-bold text-lg text-[#0F172A]">{member.name}</div>
                  <div className="font-mono text-xs text-[#64748B]">{member.email}</div>
                </div>
              </div>
              <span
                className={`font-mono text-[10px] px-2.5 py-1 uppercase tracking-wider rounded-full font-bold border ${
                  member.role === 'OWNER'
                    ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                    : member.role === 'ADMIN'
                    ? 'bg-[#F0FDFA] text-[#0D9488] border-[#99F6E4]'
                    : 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]'
                }`}
              >
                {member.role}
              </span>
            </div>

            <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between font-mono text-xs">
              <span className="text-[#64748B]">RELATIONSHIP: <strong className="text-[#0F172A]">{member.relationship}</strong></span>
              <span className="text-[#94A3B8] text-[11px]">ENROLLED: {new Date(member.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 4. STRICT DPDP ACT & ISOLATION PROTOCOL */}
      <div className="p-6 bg-white border border-[#CBD5E1] rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#0D9488] font-semibold">
          <Lock className="w-4 h-4 text-[#0D9488]" />
          <span>STATUTORY TENANT ISOLATION GUARANTEE</span>
        </div>
        <p className="font-sans text-xs text-[#475569] leading-relaxed">
          PROVENTA enforces cryptographic tenant isolation compliant with the Digital Personal Data Protection (DPDP) Act 2023. Enrolling a family member in this Trust workspace does not grant visibility into personal assets or separate business holding accounts without explicit dual-key consent.
        </p>
      </div>

      {/* 5. ENROLL MEMBER MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#CBD5E1] p-6 space-y-4 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="font-display font-bold text-xl text-[#0F172A]">Enroll Family Trustee / Member</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {inviteSuccessMsg ? (
              <div className="p-4 bg-[#F0FDFA] border border-[#99F6E4] font-mono text-xs text-[#0D9488] flex items-center gap-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                <span>{inviteSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="family.member@email.com"
                    className="w-full bg-white border border-[#CBD5E1] px-3.5 py-2 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1">
                      Access Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full bg-white border border-[#CBD5E1] px-3 py-2 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] rounded-lg"
                    >
                      <option value="MEMBER">Member (Read &amp; Record)</option>
                      <option value="ADMIN">Administrator (Full Trust)</option>
                      <option value="VIEWER">Auditor / CA (Read-Only)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1">
                      Relationship
                    </label>
                    <select
                      value={inviteRelationship}
                      onChange={(e) => setInviteRelationship(e.target.value)}
                      className="w-full bg-white border border-[#CBD5E1] px-3 py-2 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] rounded-lg"
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

                <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 border border-[#CBD5E1] font-mono text-xs uppercase text-[#475569] hover:bg-[#F8FAFC] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-mono text-xs uppercase tracking-wider font-semibold rounded-lg shadow-sm"
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
