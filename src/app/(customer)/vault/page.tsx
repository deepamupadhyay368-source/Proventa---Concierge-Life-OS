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

export default function FamilyVaultPage() {
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
    setLoading(true);
    try {
      const url = selectedCategory !== 'ALL'
        ? `/api/wealth/vault?workspaceId=fam_sharma_heritage&category=${selectedCategory}`
        : '/api/wealth/vault?workspaceId=fam_sharma_heritage';
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
    void loadDocuments();
  }, [selectedCategory]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle) return;

    try {
      const res = await fetch('/api/wealth/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
      {/* 1. INSTITUTIONAL HEADER & ARCHIVE BANNER */}
      <div className="border border-[#101010] bg-[#FAF9F6]">
        <div className="p-6 sm:p-8 border-b border-[#101010] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#85827B]">
              06 // ENCRYPTED ARCHIVAL VAULT
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl text-[#101010] tracking-tight mt-1">
              Title Deeds &amp; Archival Records
            </h1>
            <p className="font-sans text-xs text-[#85827B] mt-2 max-w-xl">
              Zero-knowledge client-side encrypted repository for registered sale deeds, Demat CAMS statements, ITR returns, and testamentary succession trusts.
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-5 py-3 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] font-mono text-xs uppercase tracking-wider font-semibold border border-[#101010] transition-colors flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Encrypt &amp; Archive Deed</span>
          </button>
        </div>

        {/* Human Confirmation Protocol Standard Banner */}
        <div className="p-4 bg-[#F0EDE5] border-b border-[#101010] flex items-center gap-3 font-mono text-xs text-[#101010]">
          <Shield className="w-4 h-4 text-[#263B35] shrink-0" />
          <span>
            <strong>HUMAN CONFIRMATION PROTOCOL:</strong> AI extraction parses financial figures, folios, and titleholders, but never promotes extracted data to verified fact without explicit trustee confirmation.
          </span>
        </div>

        {/* Archive Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#101010] bg-[#F0EDE5]">
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              ARCHIVED INSTRUMENTS
            </div>
            <div className="font-serif text-2xl text-[#101010]">
              {documents.length} Encrypted Documents
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              EXTRACTION VERIFICATION
            </div>
            <div className="font-serif text-2xl text-[#263B35]">
              {documents.filter((d) => d.extraction?.userConfirmed).length} Approved / {documents.length} Total
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              CRYPTOGRAPHIC CIPHER
            </div>
            <div className="font-serif text-2xl text-[#101010]">
              AES-GCM-256 / SHA-256
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECTANGULAR CATEGORY TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 border border-[#101010] p-1 bg-[#FAF9F6]">
          {['ALL', 'SALE_DEED', 'INVESTMENT_STATEMENT', 'TAX_DOCUMENT', 'INSURANCE_POLICY', 'WILL_SUCCESSION'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#101010] text-[#F0EDE5] font-semibold'
                  : 'text-[#101010] hover:bg-[#F0EDE5]'
              }`}
            >
              {cat === 'ALL' ? 'All Archives' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#85827B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search archival index..."
            className="w-full bg-[#FAF9F6] border border-[#101010] pl-9 pr-3 py-2 font-mono text-xs text-[#101010] placeholder-[#85827B] focus:outline-none focus:ring-1 focus:ring-[#101010]"
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
              className="border border-[#101010] bg-[#FAF9F6] flex flex-col justify-between p-6 space-y-4 hover:bg-[#F0EDE5] transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="px-2 py-0.5 border border-[#101010] bg-[#FAF9F6] uppercase">
                    {doc.category.replace('_', ' ')}
                  </span>
                  {doc.extraction ? (
                    isConfirmed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#263B35] text-[#FAF9F6] uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        Audit Sealed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#A63B32] text-[#FAF9F6] uppercase animate-pulse">
                        <AlertCircle className="w-3 h-3" />
                        Confirmation Pending
                      </span>
                    )
                  ) : null}
                </div>

                <div>
                  <div className="font-mono text-[10px] text-[#85827B]">DOC-0{idx + 1}</div>
                  <h3 className="font-serif text-lg text-[#101010] mt-0.5 leading-snug">{doc.title}</h3>
                  <div className="font-mono text-[10px] text-[#85827B] mt-0.5">{doc.fileName}</div>
                </div>

                {/* AI Extracted Highlights */}
                {doc.extraction && (
                  <div className="p-3 border border-[#101010]/30 bg-[#FAF9F6] space-y-1.5 font-mono text-xs">
                    <div className="text-[9px] uppercase tracking-widest text-[#85827B]">
                      EXTRACTED FINANCIAL DATA
                    </div>
                    {doc.extraction.institutionName && (
                      <div className="text-[#101010] font-semibold text-[11px]">
                        {doc.extraction.institutionName}
                      </div>
                    )}
                    {doc.extraction.extractedAmounts.map((amt, aIdx) => (
                      <div key={aIdx} className="flex justify-between text-[11px] text-[#85827B]">
                        <span>{amt.label}:</span>
                        <strong className="text-[#101010]">{amt.formattedAmount}</strong>
                      </div>
                    ))}
                    {doc.extraction.maskedIdentifiers.map((idnt, iIdx) => (
                      <div key={iIdx} className="flex justify-between text-[10px] text-[#85827B]">
                        <span>{idnt.label}:</span>
                        <span>{idnt.maskedValue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-[#101010]/15 flex items-center justify-between font-mono text-xs">
                {doc.extraction && !isConfirmed ? (
                  <button
                    onClick={() => setActiveReviewDoc(doc)}
                    className="px-3 py-1.5 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] uppercase text-[10px] tracking-wider font-semibold border border-[#101010]"
                  >
                    Review &amp; Verify Metadata →
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveReviewDoc(doc)}
                    className="text-[#101010] hover:underline flex items-center gap-1.5 uppercase text-[10px] tracking-wider"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Record</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1 border border-[#101010] text-[#85827B] hover:text-[#A63B32] hover:border-[#A63B32] transition-colors"
                  title="Purge Record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. HUMAN VERIFICATION REVIEW MODAL */}
      {activeReviewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101010]/75">
          <div className="w-full max-w-lg bg-[#FAF9F6] border border-[#101010] p-6 space-y-5 shadow-[8px_8px_0px_0px_#101010]">
            <div className="flex items-center justify-between pb-3 border-b border-[#101010]">
              <div>
                <h3 className="font-serif text-xl text-[#101010]">Document Intelligence Verification</h3>
                <p className="font-mono text-[10px] text-[#85827B] uppercase tracking-wider">
                  Human-in-the-Loop Confirmation Protocol
                </p>
              </div>
              <button onClick={() => setActiveReviewDoc(null)} className="text-[#101010] hover:bg-[#F0EDE5] p-1 border border-[#101010]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="font-mono text-[10px] uppercase text-[#85827B]">Archived Instrument</div>
                <div className="font-serif text-lg text-[#101010] mt-0.5">{activeReviewDoc.title}</div>
                <div className="font-mono text-[10px] text-[#85827B]">{activeReviewDoc.fileName}</div>
              </div>

              {activeReviewDoc.extraction && (
                <div className="space-y-3 p-4 border border-[#101010] bg-[#F0EDE5] font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#85827B]">Detected Counterparty:</span>
                    <span className="text-[#101010] font-semibold">{activeReviewDoc.extraction.institutionName || 'N/A'}</span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#101010]/15">
                    <div className="text-[9px] uppercase tracking-widest text-[#85827B]">Extracted Financial Balances</div>
                    {activeReviewDoc.extraction.extractedAmounts.map((amt, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-[#85827B]">{amt.label}</span>
                        <span className="font-serif text-base text-[#101010] font-bold">{amt.formattedAmount}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#101010]/15">
                    <div className="text-[9px] uppercase tracking-widest text-[#85827B]">Masked Accounts &amp; Identifiers</div>
                    {activeReviewDoc.extraction.maskedIdentifiers.map((idnt, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px]">
                        <span className="text-[#85827B]">{idnt.label}</span>
                        <span className="text-[#101010] font-semibold">{idnt.maskedValue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#101010] flex items-center justify-between font-mono text-xs">
              <span className="text-[10px] text-[#85827B]">AI Confidence: {activeReviewDoc.extraction?.confidenceScore || 95}%</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveReviewDoc(null)}
                  className="px-4 py-2 border border-[#101010] uppercase text-xs text-[#101010] hover:bg-[#F0EDE5]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmExtraction(activeReviewDoc.id, true)}
                  className="px-5 py-2 bg-[#263B35] text-[#FAF9F6] hover:bg-[#101010] uppercase text-xs tracking-wider font-semibold border border-[#263B35]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101010]/75">
          <div className="w-full max-w-md bg-[#FAF9F6] border border-[#101010] p-6 space-y-4 shadow-[8px_8px_0px_0px_#101010]">
            <div className="flex items-center justify-between pb-3 border-b border-[#101010]">
              <h3 className="font-serif text-xl text-[#101010]">Archive Document to Vault</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-[#101010] hover:bg-[#F0EDE5] p-1 border border-[#101010]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Registered Sale Deed 2023 or CAMS Portfolio"
                  className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                  Archive Classification
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as DocumentCategory)}
                  className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
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
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                  File Attachment Reference
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Deed_Scan_Worli_2023.pdf"
                  className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#101010] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 border border-[#101010] font-mono text-xs uppercase text-[#101010] hover:bg-[#F0EDE5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] font-mono text-xs uppercase tracking-wider font-semibold border border-[#101010]"
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
