'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  FileText,
  Search,
  Filter,
  ArrowRight,
  X,
  Check,
} from 'lucide-react';
import { PublicNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

export default function AdminVerificationDeskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'VERIFIED' | 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED'>('VERIFIED');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchApplications = async (filter: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/verification?status=${filter}`);
      if (res.status === 401 || res.status === 403) {
        router.push('/sign-in?callbackUrl=/admin/verification');
        return;
      }
      const json = await res.json();
      if (json.success) {
        setApplications(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(statusFilter);
  }, [statusFilter]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setSubmittingReview(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/admin/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedApp.id,
          status: reviewStatus,
          notes: reviewNotes || `Decision: ${reviewStatus}`,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to submit review');
      setFeedbackMsg(`Application for "${selectedApp.name}" updated to ${reviewStatus}.`);
      setSelectedApp(null);
      setReviewNotes('');
      fetchApplications(statusFilter);
    } catch (err: any) {
      setFeedbackMsg(`Error: ${err.message}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  const pendingCount = applications.filter((a) => a.verificationStatus === 'UNDER_REVIEW' || a.verificationStatus === 'SUBMITTED').length;
  const verifiedCount = applications.filter((a) => a.verificationStatus === 'VERIFIED').length;
  const rejectedCount = applications.filter((a) => a.verificationStatus === 'REJECTED').length;

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans flex flex-col">
      <PublicNav />

      {/* Header Bar */}
      <div className="border-b border-[#414957] bg-[#191B20] py-6 sm:py-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#536B88] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#C66A42]" />
              <span>PROVENTA COMPLIANCE & VERIFICATION DESK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-[#FFFFFF] mt-1 font-heading">
              Enterprise Business Verification Desk
            </h1>
            <p className="text-xs sm:text-sm text-[#A8ADB7] mt-1">
              Audit corporate identity records, validate MCA/GST registrations, inspect compliance documents, and issue badges.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/procurement"
              className="px-4 py-2 bg-[#252B38] hover:bg-[#303746] border border-[#414957] text-[#FFFFFF] text-xs font-mono uppercase rounded-sm transition-colors"
            >
              Procurement Desk
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-8 py-8 space-y-6">
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-[#303746] border border-[#414957] p-5 rounded-sm">
            <span className="text-xs font-mono text-[#A8ADB7] uppercase font-bold">Total Applications</span>
            <div className="text-2xl font-black text-[#FFFFFF] font-mono mt-1">{applications.length}</div>
          </div>
          <div className="bg-[#303746] border border-amber-500/40 p-5 rounded-sm">
            <span className="text-xs font-mono text-amber-400 uppercase font-bold">Pending Review</span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">{pendingCount}</div>
          </div>
          <div className="bg-[#303746] border border-emerald-500/40 p-5 rounded-sm">
            <span className="text-xs font-mono text-emerald-400 uppercase font-bold">Verified Enterprises</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{verifiedCount}</div>
          </div>
          <div className="bg-[#303746] border border-red-500/40 p-5 rounded-sm">
            <span className="text-xs font-mono text-red-400 uppercase font-bold">Rejected / Remediation</span>
            <div className="text-2xl font-black text-red-400 font-mono mt-1">{rejectedCount}</div>
          </div>
        </div>

        {feedbackMsg && (
          <div className="p-4 bg-[#252B38] border border-[#C66A42] text-xs sm:text-sm text-[#F1F2F4] rounded-sm flex items-center justify-between">
            <span>{feedbackMsg}</span>
            <button type="button" onClick={() => setFeedbackMsg(null)} className="text-[#A8ADB7] hover:text-[#FFFFFF]">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#303746] border border-[#414957] p-4 rounded-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#A8ADB7] uppercase px-1">Filter Status:</span>
            {['ALL', 'UNDER_REVIEW', 'SUBMITTED', 'VERIFIED', 'REJECTED'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1 text-xs font-mono uppercase rounded-sm border transition-colors ${
                  statusFilter === f
                    ? 'bg-[#C66A42] border-[#C66A42] text-[#FFFFFF] font-bold'
                    : 'bg-[#252B38] border-[#414957] text-[#A8ADB7] hover:text-[#FFFFFF]'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-[#303746] border border-[#414957] rounded-sm overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#191B20] text-[#A8ADB7] uppercase font-mono border-b border-[#414957] text-[11px]">
                <tr>
                  <th className="py-3 px-4">Business / Legal Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Tax IDs</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Docs</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#414957]/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#A8ADB7] font-mono">
                      Loading verification queue...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#A8ADB7] font-mono">
                      No business applications found matching filter.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-[#252B38]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#FFFFFF] text-sm">{app.name}</div>
                        <div className="text-[#A8ADB7] text-[11px] font-mono">{app.legalName || 'Legal Name Pending'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#536B88]">
                        {app.platformRole}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div>GST: <span className="text-[#FFFFFF]">{app.gstNumber || 'None'}</span></div>
                        <div>PAN: <span className="text-[#FFFFFF]">{app.pan || 'None'}</span></div>
                      </td>
                      <td className="py-3.5 px-4 text-[#A8ADB7]">
                        {app.city}, {app.state}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#FFFFFF]">
                        {app.documents?.length || 0} attached
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase font-bold border ${
                            app.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : app.verificationStatus === 'UNDER_REVIEW' || app.verificationStatus === 'SUBMITTED'
                              ? 'bg-amber-950 text-amber-400 border-amber-800'
                              : app.verificationStatus === 'REJECTED'
                              ? 'bg-red-950 text-red-400 border-red-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {app.verificationStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedApp(app)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#252B38] hover:bg-[#191B20] border border-[#414957] hover:border-[#C66A42] text-xs font-mono uppercase text-[#FFFFFF] rounded-sm transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#C66A42]" />
                          <span>Audit</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Audit Inspector */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
            <div className="bg-[#303746] border border-[#414957] max-w-2xl w-full rounded-sm shadow-xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#414957] pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#536B88] font-bold">
                    COMPLIANCE AUDIT DOSSIER
                  </span>
                  <h3 className="text-xl font-bold uppercase tracking-wider text-[#FFFFFF] mt-0.5">
                    {selectedApp.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="text-[#A8ADB7] hover:text-[#FFFFFF] p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dossier details */}
              <div className="grid grid-cols-2 gap-4 bg-[#252B38] p-4 rounded-sm border border-[#414957] text-xs font-sans">
                <div>
                  <span className="font-mono uppercase text-[10px] text-[#A8ADB7] block">Legal Name:</span>
                  <span className="font-bold text-[#FFFFFF]">{selectedApp.legalName || 'Not Set'}</span>
                </div>
                <div>
                  <span className="font-mono uppercase text-[10px] text-[#A8ADB7] block">Entity Type:</span>
                  <span className="font-bold text-[#FFFFFF]">{selectedApp.entityType || 'Not Set'}</span>
                </div>
                <div>
                  <span className="font-mono uppercase text-[10px] text-[#A8ADB7] block">GSTIN:</span>
                  <span className="font-mono font-bold text-[#C66A42]">{selectedApp.gstNumber || 'Not Set'}</span>
                </div>
                <div>
                  <span className="font-mono uppercase text-[10px] text-[#A8ADB7] block">PAN:</span>
                  <span className="font-mono font-bold text-[#C66A42]">{selectedApp.pan || 'Not Set'}</span>
                </div>
                <div>
                  <span className="font-mono uppercase text-[10px] text-[#A8ADB7] block">Registered Address:</span>
                  <span className="text-[#F1F2F4]">{selectedApp.addressLine1}, {selectedApp.city}, {selectedApp.state} - {selectedApp.postalCode}</span>
                </div>
                <div>
                  <span className="font-mono uppercase text-[10px] text-[#A8ADB7] block">Platform Role:</span>
                  <span className="font-bold text-[#FFFFFF]">{selectedApp.platformRole}</span>
                </div>
              </div>

              {/* Documents attached */}
              <div>
                <span className="text-xs font-mono uppercase text-[#A8ADB7] font-bold block mb-2">
                  Attached Verification Documents ({selectedApp.documents?.length || 0})
                </span>
                <div className="space-y-2">
                  {selectedApp.documents && selectedApp.documents.length > 0 ? (
                    selectedApp.documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-[#252B38] border border-[#414957] rounded-sm text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#536B88]" />
                          <span className="font-bold text-[#FFFFFF]">{doc.fileName}</span>
                          <span className="text-[10px] font-mono text-[#A8ADB7]">({doc.documentType})</span>
                        </div>
                        <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-sm border border-emerald-800">
                          Ready for Review
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-[#252B38] border border-[#414957] rounded-sm text-xs text-[#A8ADB7]">
                      No documents attached.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Form */}
              <form onSubmit={handleReviewSubmit} className="space-y-4 pt-4 border-t border-[#414957]">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">
                    Compliance Decision *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'VERIFIED', label: 'Approve & Verify', color: 'emerald' },
                      { val: 'ADDITIONAL_INFO_REQUIRED', label: 'Request Info', color: 'amber' },
                      { val: 'REJECTED', label: 'Reject Profile', color: 'red' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setReviewStatus(opt.val as any)}
                        className={`p-2.5 rounded-sm border text-xs font-mono uppercase font-bold text-center transition-colors ${
                          reviewStatus === opt.val
                            ? 'bg-[#C66A42] border-[#C66A42] text-[#FFFFFF]'
                            : 'bg-[#252B38] border-[#414957] text-[#A8ADB7]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">
                    Auditor Notes & Feedback *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter compliance decision rationale, verified GST registration state, or specific missing items..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full bg-[#252B38] border border-[#414957] p-2.5 text-xs text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="px-4 py-2 border border-[#414957] text-[#A8ADB7] hover:text-[#FFFFFF] text-xs font-mono uppercase rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs font-mono uppercase rounded-sm transition-colors shadow-sm disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Confirm Decision'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <MarketingFooter />
    </div>
  );
}
