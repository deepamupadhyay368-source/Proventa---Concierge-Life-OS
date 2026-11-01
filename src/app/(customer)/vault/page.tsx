'use client';

import { useEffect, useState } from 'react';
import {
  Lock,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  X,
  ExternalLink,
  Shield,
  Clock,
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
    if (!confirm('Are you sure you want to delete this document from the Family Vault?')) return;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A78BFA] mb-1">
            FAMILY WEALTH OS // ENCRYPTED REPOSITORY
          </div>
          <h1 className="font-serif text-3xl text-white">Family Vault &amp; Documents</h1>
          <p className="text-xs text-[#9D8BC9] font-light mt-1">
            Encrypted repository for title deeds, demat statements, ITR returns, and succession records with AI extraction.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#7C3AED] hover:bg-[#8B5CF6] transition-all shadow-md shadow-[#7C3AED]/25"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Protocol Banner: Human Confirmation Standard */}
      <div className="p-4 rounded-xl bg-[#1E1035]/60 border border-[#3E236E] flex items-center justify-between text-xs text-[#DDD0F7]">
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-[#10B981]" />
          <span>
            <strong>Human Confirmation Protocol:</strong> AI extraction identifies key financial figures and masked account numbers, but never marks records as verified facts without your explicit approval.
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#0E1322] border border-[#1E293B]">
          {['ALL', 'SALE_DEED', 'INVESTMENT_STATEMENT', 'TAX_DOCUMENT', 'INSURANCE_POLICY', 'WILL_SUCCESSION'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-[#1E1035] text-white border border-[#3E236E]'
                  : 'text-[#9D8BC9] hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'All Documents' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents or tags..."
            className="w-full bg-[#0E1322] border border-[#1E293B] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED]"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const isConfirmed = doc.extraction?.userConfirmed;

          return (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B] hover:border-[#3E236E] transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1E1035] text-[#DDD0F7] border border-[#3E236E]">
                    {doc.category.replace('_', ' ')}
                  </span>
                  {doc.extraction ? (
                    isConfirmed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#064E3B]/40 text-[#10B981] border border-[#10B981]/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Confirmed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#451A03]/50 text-[#F59E0B] border border-[#F59E0B]/30 animate-pulse">
                        <AlertCircle className="w-3 h-3" />
                        Verification Required
                      </span>
                    )
                  ) : null}
                </div>

                <div>
                  <h3 className="font-semibold text-white text-sm line-clamp-1">{doc.title}</h3>
                  <div className="text-[11px] text-[#9D8BC9] font-mono mt-0.5 line-clamp-1">{doc.fileName}</div>
                </div>

                {/* AI Extracted Highlights */}
                {doc.extraction && (
                  <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-1.5 text-xs">
                    <div className="text-[10px] font-mono text-[#A78BFA] uppercase">
                      Extracted by Document Agent
                    </div>
                    {doc.extraction.institutionName && (
                      <div className="text-white font-medium text-[11px]">
                        {doc.extraction.institutionName}
                      </div>
                    )}
                    {doc.extraction.extractedAmounts.map((amt, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] text-[#9D8BC9]">
                        <span>{amt.label}:</span>
                        <strong className="text-white font-mono">{amt.formattedAmount}</strong>
                      </div>
                    ))}
                    {doc.extraction.maskedIdentifiers.map((idnt, idx) => (
                      <div key={idx} className="flex justify-between text-[10px] text-[#64748B] font-mono">
                        <span>{idnt.label}:</span>
                        <span>{idnt.maskedValue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-[#1E293B] flex items-center justify-between text-xs">
                {doc.extraction && !isConfirmed ? (
                  <button
                    onClick={() => setActiveReviewDoc(doc)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#8B5CF6]"
                  >
                    Review &amp; Verify
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveReviewDoc(doc)}
                    className="text-[#A78BFA] hover:text-white flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1 rounded text-[#64748B] hover:text-[#F43F5E]"
                  title="Delete Document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* HUMAN VERIFICATION REVIEW MODAL */}
      {activeReviewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0E1322] border border-[#3E236E] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <div>
                <h3 className="text-base font-semibold text-white">Document Intelligence Review</h3>
                <p className="text-xs text-[#9D8BC9]">Verify extracted metadata before sealing as authoritative fact.</p>
              </div>
              <button onClick={() => setActiveReviewDoc(null)} className="text-[#9D8BC9] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="text-[10px] text-[#9D8BC9] font-mono uppercase">Document Title &amp; File</div>
                <div className="text-white font-medium text-sm mt-0.5">{activeReviewDoc.title}</div>
                <div className="text-[#9D8BC9] font-mono text-[11px]">{activeReviewDoc.fileName}</div>
              </div>

              {activeReviewDoc.extraction && (
                <div className="space-y-3 p-4 rounded-xl bg-[#0B0F19] border border-[#1E293B]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9D8BC9]">Detected Institution:</span>
                    <span className="text-white font-semibold">{activeReviewDoc.extraction.institutionName || 'N/A'}</span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#1E293B]">
                    <div className="text-[10px] font-mono text-[#A78BFA] uppercase">Extracted Values</div>
                    {activeReviewDoc.extraction.extractedAmounts.map((amt, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-[#9D8BC9]">{amt.label}</span>
                        <span className="font-serif text-white font-bold">{amt.formattedAmount}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#1E293B]">
                    <div className="text-[10px] font-mono text-[#A78BFA] uppercase">Masked Identifiers</div>
                    {activeReviewDoc.extraction.maskedIdentifiers.map((idnt, idx) => (
                      <div key={idx} className="flex justify-between items-center font-mono text-[11px]">
                        <span className="text-[#9D8BC9]">{idnt.label}</span>
                        <span className="text-white">{idnt.maskedValue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
              <span className="text-[10px] text-[#64748B]">Confidence Score: {activeReviewDoc.extraction?.confidenceScore || 90}%</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveReviewDoc(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[#9D8BC9] hover:bg-[#1E1035]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmExtraction(activeReviewDoc.id, true)}
                  className="px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#10B981] hover:bg-[#059669]"
                >
                  Confirm as Verified Truth
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0E1322] border border-[#3E236E] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <h3 className="text-base font-semibold text-white">Upload to Encrypted Vault</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-[#9D8BC9] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Registered Sale Deed 2023 or ITR-V Form"
                  className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as DocumentCategory)}
                  className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
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
                <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Simulated File Upload</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Deed_Scan_Worli_2023.pdf"
                  className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="pt-3 border-t border-[#1E293B] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[#9D8BC9] hover:bg-[#1E1035]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#7C3AED] hover:bg-[#8B5CF6]"
                >
                  Encrypt &amp; Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
