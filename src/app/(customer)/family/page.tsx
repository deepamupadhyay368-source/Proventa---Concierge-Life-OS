'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Shield,
  CheckCircle2,
  Clock,
  X,
  Building2,
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
        setInviteSuccessMsg(`Invitation dispatched to ${inviteEmail}.`);
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
      <div className="flex items-center justify-center min-h-[300px] text-xs font-mono text-[#A78BFA]">
        Loading Family Workspace &amp; Governance Matrix...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A78BFA] mb-1">
            FAMILY WEALTH OS // WORKSPACES &amp; GOVERNANCE
          </div>
          <h1 className="font-serif text-3xl text-white">{workspace.name}</h1>
          <p className="text-xs text-[#9D8BC9] font-light mt-1">
            Multi-generational family members, professional advisors, and resource-level access controls.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#7C3AED] hover:bg-[#8B5CF6] transition-all shadow-md shadow-[#7C3AED]/25"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workspace.members.map((member) => (
          <div
            key={member.id}
            className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B] space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1E1035] border border-[#3E236E] flex items-center justify-center text-sm font-bold text-white">
                  {member.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{member.name}</div>
                  <div className="text-xs text-[#9D8BC9]">{member.email}</div>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider ${
                  member.role === 'OWNER'
                    ? 'bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/40'
                    : member.role === 'ADMIN'
                    ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                    : 'bg-[#1E1035] text-[#DDD0F7] border border-[#3E236E]'
                }`}
              >
                {member.role}
              </span>
            </div>

            <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs text-[#9D8BC9]">
              <span>Relationship: <strong className="text-white">{member.relationship}</strong></span>
              <span className="font-mono text-[10px]">Joined: {new Date(member.joinedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Privacy & Permission Rules Notice */}
      <div className="p-5 rounded-2xl bg-[#070A12] border border-[#1E293B] space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <Lock className="w-4 h-4 text-[#10B981]" />
          <span>Family Permission Boundaries</span>
        </div>
        <p className="text-xs text-[#9D8BC9] font-light leading-relaxed">
          PROVENTA strictly enforces tenant and resource-level isolation. Inviting a family member into this workspace does not automatically grant them visibility into your separate personal workspace or unrelated family trusts.
        </p>
      </div>

      {/* INVITE MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0E1322] border border-[#3E236E] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <h3 className="text-base font-semibold text-white">Invite Family Member or Advisor</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-[#9D8BC9] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteSuccessMsg ? (
              <div className="p-4 rounded-xl bg-[#064E3B]/40 border border-[#10B981]/40 text-xs text-[#10B981] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{inviteSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="family.member@email.com"
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                    >
                      <option value="MEMBER">Member (Read &amp; Record)</option>
                      <option value="ADMIN">Administrator (Full Family)</option>
                      <option value="VIEWER">Viewer (Advisor / Read-Only)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Relationship</label>
                    <select
                      value={inviteRelationship}
                      onChange={(e) => setInviteRelationship(e.target.value)}
                      className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
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

                <div className="pt-3 border-t border-[#1E293B] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-[#9D8BC9] hover:bg-[#1E1035]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#7C3AED] hover:bg-[#8B5CF6]"
                  >
                    Send Invitation
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
