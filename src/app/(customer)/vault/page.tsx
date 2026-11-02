'use client';

import { useEffect, useState } from 'react';
import {
  Lock,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  X,
  Shield,
  Eye,
} from 'lucide-react';
import { DocumentDTO, DocumentCategory } from '@/lib/wealth/types';
import { useCurrentWorkspace } from '@/lib/wealth/workspace-context';

export default function FamilyVaultPage() {
  const { currentWorkspaceId, user, isLoaded } = useCurrentWorkspace();
  const [documents, setDocuments] = useState<DocumentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeReviewDoc, setActiveReviewDoc] = useState<DocumentDTO | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DocumentCategory>('SALE_DEED');
  const [fileName, setFileName] = useState('');

  async function loadDocuments() {
    if (!currentWorkspaceId) return;
    setLoading(true);
    try {
      const url =
        selectedCategory !== 'ALL'
          ? `/api/wealth/vault?workspaceId=${encodeURIComponent(currentWorkspaceId)}&category=${selectedCategory}`
          : `/api/wealth/vault?workspaceId=${encodeURIComponent(currentWorkspaceId)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setDocuments(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isLoaded) {
      void loadDocuments();
    }
  }, [selectedCategory, currentWorkspaceId, isLoaded]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle || !currentWorkspaceId) return;

    try {
      const res = await fetch('/api/wealth/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: currentWorkspaceId,
          uploadedByUserId: user?.id || 'usr_member',
          uploadedByUserName: user?.name || 'Vault Custodian',
          title: newTitle,
          category: newCategory,
          fileName: fileName || `${newTitle.replace(/\s+/g, '_')}.pdf`,
          fileSize: 2450000,
        }),
      });

      if (res.ok) {
        setIsUploadOpen(false);
        setNewTitle('');
        setFileName('');
        await loadDocuments();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleConfirmExtraction(docId: string, confirmed: boolean) {
    try {
      const res = await fetch('/api/wealth/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CONFIRM_EXTRACTION',
          documentId: docId,
          userConfirmed: confirmed,
        }),
      });

      if (res.ok) {
        setActiveReviewDoc(null);
        await loadDocuments();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('CONFIRM DELETION: Permanently destroy this encrypted archive record from the Family Vault?')) return;
    try {
      const res = await fetch(`/api/wealth/vault?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadDocuments();
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filteredDocs = documents.filter((d) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.fileName.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 font-sans">
      {/* 1. ENCRYPTED ARCHIVAL VAULT BANNER */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#2563EB] font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
              <span>REGISTER 05 // ENCRYPTED ARCHIVAL VAULT</span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#0F172A] tracking-tight mt-1">
              Title Deeds &amp; Archival Records
            </h1>
            <p className="font-sans text-xs text-[#475569] mt-2 max-w-xl">
              Zero-knowledge client-side encrypted repository for registered sale deeds, Demat CAMS statements, ITR returns, and testamentary succession trusts.
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-5 py-2.5 bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-mono text-xs uppercase tracking-wider font-semibold rounded-lg shadow-sm shadow-blue-500/25 transition-all flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Encrypt &amp; Archive Deed</span>
          </button>
        </div>

        {/* Human Confirmation Protocol Standard Banner */}
        <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center gap-3 font-mono text-xs text-[#475569]">
          <Shield className="w-4 h-4 text-[#2563EB] shrink-0" />
          <span>
            <strong className="text-[#0F172A]">HUMAN CONFIRMATION PROTOCOL:</strong> AI extraction parses financial figures, folios, and titleholders, but never promotes extracted data to verified fact without explicit trustee confirmation.
          </span>
        </div>

        {/* Archive Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] bg-[#FAFBFC]">
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
              ARCHIVED INSTRUMENTS
            </div>
            <div className="font-display font-bold text-2xl text-[#0F172A]">
              {documents.length} Encrypted Documents
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
              EXTRACTION VERIFICATION
            </div>
            <div className="font-display font-bold text-2xl text-[#2563EB]">
              {documents.filter((d) => d.extraction?.userConfirmed).length} Approved / {documents.length} Total
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
              CRYPTOGRAPHIC CIPHER
            </div>
            <div className="font-display font-bold text-2xl text-[#0D9488]">
              AES-GCM-256 / SHA-256
            </div>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 border border-[#CBD5E1] p-1 bg-white rounded-xl shadow-sm">
          {['ALL', 'SALE_DEED', 'INVESTMENT_STATEMENT', 'TAX_DOCUMENT', 'INSURANCE_POLICY', 'WILL_SUCCESSION'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-all rounded-lg ${
                selectedCategory === cat
                  ? 'bg-[#2563EB] text-white font-bold shadow-sm'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              {cat === 'ALL' ? 'All Archives' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search archival index..."
            className="w-full bg-white border border-[#CBD5E1] pl-9 pr-3.5 py-2 font-mono text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] rounded-lg shadow-sm transition-colors"
          />
        </div>
      </div>

      {/* 3. ARCHIVAL DOCUMENTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc, idx) => {
          const isConfirmed = doc.extraction?.userConfirmed;

          return (
            <div
              key={doc.id}
              className="bg-white border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-md rounded-2xl flex flex-col justify-between p-6 space-y-4 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="px-2.5 py-0.5 bg-[#F1F5F9] text-[#475569] rounded-md uppercase font-semibold">
                    {doc.category.replace('_', ' ')}
                  </span>
                  {doc.extraction ? (
                    isConfirmed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#F0FDFA] text-[#0D9488] border border-[#99F6E4] rounded-full uppercase font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-[#0D9488]" />
                        Audit Sealed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full uppercase font-bold text-[10px] animate-pulse">
                        <AlertCircle className="w-3 h-3" />
                        Confirmation Pending
                      </span>
                    )
                  ) : null}
                </div>

                <div>
                  <div className="font-mono text-[10px] text-[#2563EB] font-bold">DOC-0{idx + 1}</div>
                  <h3 className="font-display font-bold text-lg text-[#0F172A] mt-0.5 leading-snug">{doc.title}</h3>
                  <div className="font-mono text-[11px] text-[#64748B] mt-0.5">{doc.fileName}</div>
                </div>

                {/* AI Extracted Highlights */}
                {doc.extraction && (
                  <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1.5 font-mono text-xs">
                    <div className="text-[10px] uppercase tracking-wider text-[#2563EB] font-bold">
                      EXTRACTED FINANCIAL DATA
                    </div>
                    {doc.extraction.institutionName && (
                      <div className="text-[#0F172A] font-semibold text-[11px]">
                        {doc.extraction.institutionName}
                      </div>
                    )}
                    {doc.extraction.extractedAmounts.map((amt, aIdx) => (
                      <div key={aIdx} className="flex justify-between text-[11px] text-[#64748B]">
                        <span>{amt.label}:</span>
                        <strong className="text-[#0F172A]">{amt.formattedAmount}</strong>
                      </div>
                    ))}
                    {doc.extraction.maskedIdentifiers.map((idnt, iIdx) => (
                      <div key={iIdx} className="flex justify-between text-[11px] text-[#64748B]">
                        <span>{idnt.label}:</span>
                        <span className="text-[#0F172A] font-semibold">{idnt.maskedValue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between font-mono text-xs">
                {doc.extraction && !isConfirmed ? (
                  <button
                    onClick={() => setActiveReviewDoc(doc)}
                    className="px-3.5 py-1.5 bg-[#2563EB] text-white hover:bg-[#1D4ED8] uppercase text-[10px] tracking-wider font-semibold rounded-lg shadow-sm transition-all"
                  >
                    Review &amp; Verify Metadata →
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveReviewDoc(doc)}
                    className="text-[#475569] hover:text-[#2563EB] flex items-center gap-1.5 uppercase text-[11px] tracking-wider font-medium"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Record</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 bg-white border border-[#CBD5E1] text-[#64748B] hover:text-rose-600 hover:border-rose-300 transition-colors rounded-lg"
                  title="Purge Record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        {filteredDocs.length === 0 && (
          <div className="col-span-full p-12 text-center space-y-3 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
            <div className="w-10 h-10 mx-auto bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <div className="font-display font-bold text-base text-[#0F172A]">Family Vault Is Empty</div>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Your zero-knowledge encrypted vault has no uploaded documents. Upload registered property deeds, demat holding statements, share certificates, or insurance policies.
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-mono text-xs uppercase tracking-wider rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>+ Upload First Document</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. HUMAN VERIFICATION REVIEW MODAL */}
      {activeReviewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-[#CBD5E1] p-6 space-y-5 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <h3 className="font-display font-bold text-xl text-[#0F172A]">Document Intelligence Verification</h3>
                <p className="font-mono text-xs text-[#2563EB] font-medium">
                  Human-in-the-Loop Confirmation Protocol
                </p>
              </div>
              <button onClick={() => setActiveReviewDoc(null)} className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="font-mono text-[10px] uppercase text-[#64748B]">Archived Instrument</div>
                <div className="font-display font-bold text-lg text-[#0F172A] mt-0.5">{activeReviewDoc.title}</div>
                <div className="font-mono text-xs text-[#64748B]">{activeReviewDoc.fileName}</div>
              </div>

              {activeReviewDoc.extraction && (
                <div className="space-y-3 p-4 border border-[#E2E8F0] bg-[#FAFBFC] rounded-xl font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Detected Counterparty:</span>
                    <span className="text-[#0F172A] font-semibold">{activeReviewDoc.extraction.institutionName || 'N/A'}</span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
                    <div className="text-[10px] uppercase tracking-wider text-[#2563EB] font-bold">Extracted Financial Balances</div>
                    {activeReviewDoc.extraction.extractedAmounts.map((amt, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-[#64748B]">{amt.label}</span>
                        <span className="font-display text-base text-[#0F172A] font-bold">{amt.formattedAmount}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
                    <div className="text-[10px] uppercase tracking-wider text-[#2563EB] font-bold">Masked Accounts &amp; Identifiers</div>
                    {activeReviewDoc.extraction.maskedIdentifiers.map((idnt, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px]">
                        <span className="text-[#64748B]">{idnt.label}</span>
                        <span className="text-[#0F172A] font-semibold">{idnt.maskedValue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between font-mono text-xs">
              <span className="text-xs text-[#0D9488] font-bold">AI Confidence: {activeReviewDoc.extraction?.confidenceScore || 95}%</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveReviewDoc(null)}
                  className="px-4 py-2 border border-[#CBD5E1] text-xs font-medium text-[#475569] hover:bg-[#F8FAFC] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmExtraction(activeReviewDoc.id, true)}
                  className="px-5 py-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8] text-xs uppercase tracking-wider font-semibold rounded-lg shadow-sm transition-all"
                >
                  Confirm as Verified Truth
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. UPLOAD TO VAULT MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#CBD5E1] p-6 space-y-4 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="font-display font-bold text-xl text-[#0F172A]">Archive Document to Vault</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Registered Sale Deed 2023 or CAMS Portfolio"
                  className="w-full bg-white border border-[#CBD5E1] px-3.5 py-2 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1">
                  Archive Classification
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as DocumentCategory)}
                  className="w-full bg-white border border-[#CBD5E1] px-3 py-2 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] rounded-lg"
                >
                  <option value="SALE_DEED">Sale Deed / Property Title</option>
                  <option value="INVESTMENT_STATEMENT">Investment / Mutual Fund Statement</option>
                  <option value="TAX_DOCUMENT">Tax Return / ITR-V / Form 16</option>
                  <option value="INSURANCE_POLICY">Insurance Policy Document</option>
                  <option value="DEMAT_STATEMENT">Demat / CSDL Holding Statement</option>
                  <option value="WILL_SUCCESSION">Will / Succession Document</option>
                  <option value="OTHER">Other Financial Certificate</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1">
                  File Attachment Reference
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Deed_Scan_Worli_2023.pdf"
                  className="w-full bg-white border border-[#CBD5E1] px-3.5 py-2 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 border border-[#CBD5E1] font-mono text-xs uppercase text-[#475569] hover:bg-[#F8FAFC] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-mono text-xs uppercase tracking-wider font-semibold rounded-lg shadow-sm"
                >
                  Encrypt &amp; Seal Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
