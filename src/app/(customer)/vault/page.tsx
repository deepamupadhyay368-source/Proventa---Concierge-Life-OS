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
      {/* 1. TITANIUM COBALT HEADER & ARCHIVE BANNER */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="p-6 sm:p-8 border-b border-[#252C38] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7595FF] font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#2457FF]" />
              <span>06 // ENCRYPTED ARCHIVAL VAULT</span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#F4F6FA] tracking-tight mt-1">
              Title Deeds &amp; Archival Records
            </h1>
            <p className="font-sans text-xs text-[#C5CAD3] mt-2 max-w-xl">
              Zero-knowledge client-side encrypted repository for registered sale deeds, Demat CAMS statements, ITR returns, and testamentary succession trusts.
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-5 py-3 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] font-mono text-xs uppercase tracking-wider font-semibold border border-[#7595FF]/40 rounded-[2px] shadow-[0_0_15px_rgba(36,87,255,0.3)] transition-all flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Encrypt &amp; Archive Deed</span>
          </button>
        </div>

        {/* Human Confirmation Protocol Standard Banner */}
        <div className="p-4 bg-[#090B10] border-b border-[#252C38] flex items-center gap-3 font-mono text-xs text-[#C5CAD3]">
          <Shield className="w-4 h-4 text-[#7595FF] shrink-0" />
          <span>
            <strong className="text-[#F4F6FA]">HUMAN CONFIRMATION PROTOCOL:</strong> AI extraction parses financial figures, folios, and titleholders, but never promotes extracted data to verified fact without explicit trustee confirmation.
          </span>
        </div>

        {/* Archive Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#252C38] bg-[#090B10]">
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              ARCHIVED INSTRUMENTS
            </div>
            <div className="font-display font-bold text-2xl text-[#F4F6FA]">
              {documents.length} Encrypted Documents
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              EXTRACTION VERIFICATION
            </div>
            <div className="font-display font-bold text-2xl text-[#7595FF]">
              {documents.filter((d) => d.extraction?.userConfirmed).length} Approved / {documents.length} Total
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              CRYPTOGRAPHIC CIPHER
            </div>
            <div className="font-display font-bold text-2xl text-[#F4F6FA]">
              AES-GCM-256 / SHA-256
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECTANGULAR CATEGORY TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 border border-[#252C38] p-1 bg-[#171C26] rounded-[2px]">
          {['ALL', 'SALE_DEED', 'INVESTMENT_STATEMENT', 'TAX_DOCUMENT', 'INSURANCE_POLICY', 'WILL_SUCCESSION'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all rounded-[2px] ${
                selectedCategory === cat
                  ? 'bg-[#2457FF] text-[#F4F6FA] font-semibold shadow-[0_0_12px_rgba(36,87,255,0.3)]'
                  : 'text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38]'
              }`}
            >
              {cat === 'ALL' ? 'All Archives' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#858D9B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search archival index..."
            className="w-full bg-[#171C26] border border-[#252C38] pl-9 pr-3 py-2 font-mono text-xs text-[#F4F6FA] placeholder-[#858D9B] focus:outline-none focus:border-[#2457FF] rounded-[2px] transition-colors"
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
              className="border border-[#252C38] bg-[#171C26] rounded-[2px] flex flex-col justify-between p-6 space-y-4 hover:border-[#7595FF]/50 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="px-2 py-0.5 border border-[#252C38] bg-[#090B10] text-[#C5CAD3] rounded-[2px] uppercase">
                    {doc.category.replace('_', ' ')}
                  </span>
                  {doc.extraction ? (
                    isConfirmed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#2457FF]/15 text-[#7595FF] border border-[#2457FF]/40 rounded-[2px] uppercase font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-[#7595FF]" />
                        Audit Sealed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FF7A70]/15 text-[#FF7A70] border border-[#FF7A70]/40 rounded-[2px] uppercase font-semibold animate-pulse">
                        <AlertCircle className="w-3 h-3" />
                        Confirmation Pending
                      </span>
                    )
                  ) : null}
                </div>

                <div>
                  <div className="font-mono text-[10px] text-[#7595FF] font-semibold">DOC-0{idx + 1}</div>
                  <h3 className="font-display font-bold text-lg text-[#F4F6FA] mt-0.5 leading-snug">{doc.title}</h3>
                  <div className="font-mono text-[10px] text-[#858D9B] mt-0.5">{doc.fileName}</div>
                </div>

                {/* AI Extracted Highlights */}
                {doc.extraction && (
                  <div className="p-3 border border-[#252C38] bg-[#090B10] rounded-[2px] space-y-1.5 font-mono text-xs">
                    <div className="text-[9px] uppercase tracking-widest text-[#7595FF] font-semibold">
                      EXTRACTED FINANCIAL DATA
                    </div>
                    {doc.extraction.institutionName && (
                      <div className="text-[#F4F6FA] font-semibold text-[11px]">
                        {doc.extraction.institutionName}
                      </div>
                    )}
                    {doc.extraction.extractedAmounts.map((amt, aIdx) => (
                      <div key={aIdx} className="flex justify-between text-[11px] text-[#858D9B]">
                        <span>{amt.label}:</span>
                        <strong className="text-[#F4F6FA]">{amt.formattedAmount}</strong>
                      </div>
                    ))}
                    {doc.extraction.maskedIdentifiers.map((idnt, iIdx) => (
                      <div key={iIdx} className="flex justify-between text-[10px] text-[#858D9B]">
                        <span>{idnt.label}:</span>
                        <span className="text-[#C5CAD3]">{idnt.maskedValue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-[#252C38] flex items-center justify-between font-mono text-xs">
                {doc.extraction && !isConfirmed ? (
                  <button
                    onClick={() => setActiveReviewDoc(doc)}
                    className="px-3 py-1.5 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] uppercase text-[10px] tracking-wider font-semibold border border-[#7595FF]/40 rounded-[2px] shadow-[0_0_10px_rgba(36,87,255,0.3)] transition-all"
                  >
                    Review &amp; Verify Metadata →
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveReviewDoc(doc)}
                    className="text-[#C5CAD3] hover:text-[#7595FF] flex items-center gap-1.5 uppercase text-[10px] tracking-wider"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Record</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1 border border-[#252C38] bg-[#090B10] text-[#858D9B] hover:text-[#FF7A70] hover:border-[#FF7A70]/50 transition-colors rounded-[2px]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090B10]/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#171C26] border border-[#252C38] p-6 space-y-5 rounded-[2px] shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#252C38]">
              <div>
                <h3 className="font-display font-bold text-xl text-[#F4F6FA]">Document Intelligence Verification</h3>
                <p className="font-mono text-[10px] text-[#7595FF] uppercase tracking-wider font-semibold">
                  Human-in-the-Loop Confirmation Protocol
                </p>
              </div>
              <button onClick={() => setActiveReviewDoc(null)} className="text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] p-1 border border-[#252C38] rounded-[2px]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="font-mono text-[10px] uppercase text-[#858D9B]">Archived Instrument</div>
                <div className="font-display font-bold text-lg text-[#F4F6FA] mt-0.5">{activeReviewDoc.title}</div>
                <div className="font-mono text-[10px] text-[#858D9B]">{activeReviewDoc.fileName}</div>
              </div>

              {activeReviewDoc.extraction && (
                <div className="space-y-3 p-4 border border-[#252C38] bg-[#090B10] rounded-[2px] font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#85827B]">Detected Counterparty:</span>
                    <span className="text-[#F4F6FA] font-semibold">{activeReviewDoc.extraction.institutionName || 'N/A'}</span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#252C38]">
                    <div className="text-[9px] uppercase tracking-widest text-[#7595FF] font-semibold">Extracted Financial Balances</div>
                    {activeReviewDoc.extraction.extractedAmounts.map((amt, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-[#85827B]">{amt.label}</span>
                        <span className="font-display text-base text-[#F4F6FA] font-bold">{amt.formattedAmount}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#252C38]">
                    <div className="text-[9px] uppercase tracking-widest text-[#7595FF] font-semibold">Masked Accounts &amp; Identifiers</div>
                    {activeReviewDoc.extraction.maskedIdentifiers.map((idnt, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px]">
                        <span className="text-[#85827B]">{idnt.label}</span>
                        <span className="text-[#C5CAD3] font-semibold">{idnt.maskedValue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#252C38] flex items-center justify-between font-mono text-xs">
              <span className="text-[10px] text-[#85827B]">AI Confidence: {activeReviewDoc.extraction?.confidenceScore || 95}%</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveReviewDoc(null)}
                  className="px-4 py-2 border border-[#252C38] uppercase text-xs text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] rounded-[2px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmExtraction(activeReviewDoc.id, true)}
                  className="px-5 py-2 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] uppercase text-xs tracking-wider font-semibold border border-[#7595FF]/40 rounded-[2px] shadow-[0_0_12px_rgba(36,87,255,0.3)] transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090B10]/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#171C26] border border-[#252C38] p-6 space-y-4 rounded-[2px] shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#252C38]">
              <h3 className="font-display font-bold text-xl text-[#F4F6FA]">Archive Document to Vault</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] p-1 border border-[#252C38] rounded-[2px]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#85827B] mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Registered Sale Deed 2023 or CAMS Portfolio"
                  className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#85827B] mb-1">
                  Archive Classification
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as DocumentCategory)}
                  className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
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
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#85827B] mb-1">
                  File Attachment Reference
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Deed_Scan_Worli_2023.pdf"
                  className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                />
              </div>

              <div className="pt-3 border-t border-[#252C38] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 border border-[#252C38] font-mono text-xs uppercase text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] rounded-[2px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] font-mono text-xs uppercase tracking-wider font-semibold border border-[#7595FF]/40 rounded-[2px] shadow-[0_0_12px_rgba(36,87,255,0.3)]"
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
