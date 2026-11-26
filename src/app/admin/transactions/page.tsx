'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Database,
  Plus,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Flag,
  Edit,
  History,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  FileText,
  FileSpreadsheet,
  Layers,
  Building2,
  ExternalLink,
} from 'lucide-react';

interface TransactionItem {
  id: string;
  deedId: string | null;
  registrationDate: string;
  collectionDate: string;
  localityId: string;
  projectId: string | null;
  locality: { id: string; name: string; slug: string };
  project?: { id: string; name: string; slug: string } | null;
  source: { id: string; name: string; code: string };
  sourceDocument?: { id: string; fileName: string; fileUrl: string } | null;
  bhk: number;
  carpetAreaSqFt: number;
  transactedPriceLakhs: number;
  totalPriceRupees: number;
  pricePerSqFtCarpet: number;
  derivedRateSqFt: number;
  floor: number | null;
  totalFloors: number | null;
  subRegistrarOffice: string | null;
  sourceReference: string | null;
  verificationStatus: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'FLAGGED' | 'DUPLICATE' | 'PROVISIONAL';
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  flagReason: string | null;
  duplicateOf?: { id: string; deedId: string | null; transactedPriceLakhs: number } | null;
  remarks: string | null;
  createdAt: string;
}

export default function AdminTransactionsEvidencePage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState<string>('');
  const [page, setPage] = useState(1);

  // Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedAuditTxId, setSelectedAuditTxId] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Edit / Correction Modal
  const [correctingTx, setCorrectingTx] = useState<TransactionItem | null>(null);
  const [correctionForm, setCorrectionForm] = useState({
    carpetAreaSqFt: '',
    transactedPriceLakhs: '',
    bhk: '',
    floor: '',
    deedId: '',
    subRegistrarOffice: '',
    remarks: '',
  });

  // Action Reason Modal (for Reject / Flag)
  const [actionPrompt, setActionPrompt] = useState<{
    txId: string;
    action: 'REJECT' | 'FLAG';
    title: string;
  } | null>(null);
  const [promptReason, setPromptReason] = useState('');

  // CSV Import State
  const [importText, setImportText] = useState('');
  const [importEntityType, setImportEntityType] = useState<'TRANSACTIONS' | 'LISTINGS' | 'JANTRI'>('TRANSACTIONS');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Load Transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== 'ALL') params.set('status', activeTab);
      if (selectedLocality) params.set('localityId', selectedLocality);
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', page.toString());
      params.set('limit', '50');

      const res = await fetch(`/api/admin/evidence/transactions?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data || []);
        setTotalCount(json.totalCount || 0);
        setStatusCounts(json.statusCounts || {});
      }
    } catch (err) {
      console.error('Failed to load transaction evidence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [activeTab, selectedLocality, page]);

  // Handle Search Submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  // Perform Verification Action (Approve / Reject / Flag / Correct)
  const handleProcessAction = async (
    txId: string,
    action: 'APPROVE' | 'REJECT' | 'FLAG' | 'CORRECT',
    reason?: string,
    correctionData?: Record<string, any>
  ) => {
    try {
      const res = await fetch('/api/admin/evidence/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'TRANSACTION',
          entityId: txId,
          action,
          reason,
          correctionData,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || 'Failed to apply action.');
        return;
      }

      // Close modals and refresh
      setActionPrompt(null);
      setPromptReason('');
      setCorrectingTx(null);
      fetchTransactions();
    } catch (err: any) {
      alert(err.message || 'Error processing action');
    }
  };

  // Open Audit History Drawer
  const handleOpenAudit = async (txId: string) => {
    setSelectedAuditTxId(txId);
    setShowAuditModal(true);
    setAuditLoading(true);
    try {
      const res = await fetch(`/api/admin/evidence/audit-logs?entityType=TRANSACTION&entityId=${txId}`);
      const json = await res.json();
      if (json.success) {
        setAuditLogs(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch audit trail:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  // Submit CSV Import
  const handleRunImport = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    setImportResult(null);

    try {
      // Default to first data source (Statutory SRO / Government registry code)
      const res = await fetch('/api/admin/evidence/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: importEntityType,
          csvText: importText,
          sourceId: 'src_sro_registry', // Default system source
        }),
      });

      const json = await res.json();
      setImportResult(json.data || json);
      if (json.success) {
        fetchTransactions();
      }
    } catch (err: any) {
      setImportResult({ success: false, errorCount: 1, errors: [{ row: 0, message: err.message }] });
    } finally {
      setImporting(false);
    }
  };

  // Trigger CSV Export
  const handleExportCsv = () => {
    window.location.href = `/api/admin/evidence/export?entityType=TRANSACTIONS${
      selectedLocality ? `&localityId=${selectedLocality}` : ''
    }`;
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#C8C4BA] pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#547568] font-bold">
            Evidence Ingestion &bull; Sub-Registrar Deeds
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#202B3C] tracking-tight mt-1">
            Registered Transaction Evidence Ledger
          </h1>
          <p className="text-xs text-[#69717B] mt-1 max-w-2xl">
            Audit and verify legal property sale deeds recorded across Ahmedabad and Gandhinagar. Imported records default strictly to <strong>Pending Verification</strong> until authenticated.
          </p>
        </div>

        <div className="flex items-center gap-2.5 font-mono">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-white border border-[#C8C4BA] text-[#202B3C] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#F5F3ED] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Approved CSV</span>
          </button>

          <button
            onClick={() => {
              setShowImportModal(true);
              setImportResult(null);
              setImportText('');
            }}
            className="px-3.5 py-2 bg-[#202B3C] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#202B3C]/90 shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Evidence CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs / Status Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#C8C4BA] pb-2 text-xs font-mono">
        <div className="flex items-center gap-1">
          {[
            { id: 'ALL', label: 'All Records' },
            { id: 'PENDING_VERIFICATION', label: 'Pending Verification', badge: statusCounts['PENDING_VERIFICATION'] },
            { id: 'VERIFIED', label: 'Verified', badge: statusCounts['VERIFIED'] },
            { id: 'FLAGGED', label: 'Flagged', badge: statusCounts['FLAGGED'] },
            { id: 'REJECTED', label: 'Rejected', badge: statusCounts['REJECTED'] },
            { id: 'DUPLICATE', label: 'Duplicates', badge: statusCounts['DUPLICATE'] },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#202B3C] text-white shadow-xs'
                    : 'bg-white text-[#69717B] hover:text-[#202B3C] border border-[#C8C4BA]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 text-[9px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#E2DFD8] text-[#202B3C]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Refresh */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#69717B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deed, project, SRO..."
              className="h-8 pl-8 pr-3 bg-white border border-[#C8C4BA] text-xs font-mono placeholder:text-[#69717B] focus:outline-hidden focus:border-[#202B3C]"
            />
          </div>
          <button
            type="submit"
            className="h-8 px-3 bg-[#547568] text-white text-xs font-bold font-mono uppercase"
          >
            Filter
          </button>
          <button
            type="button"
            onClick={fetchTransactions}
            className="h-8 w-8 bg-white border border-[#C8C4BA] flex items-center justify-center text-[#69717B] hover:text-[#202B3C]"
            title="Refresh Table"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </form>
      </div>

      {/* Main Evidence Table */}
      <div className="bg-white border border-[#C8C4BA] overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C] font-mono text-[11px]">
              <th className="p-3.5 font-bold uppercase tracking-wider">Deed ID / Date</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Locality &amp; Project</th>
              <th className="p-3.5 font-bold uppercase tracking-wider tabular-nums">Carpet Area</th>
              <th className="p-3.5 font-bold uppercase tracking-wider tabular-nums">Transacted Price</th>
              <th className="p-3.5 font-bold uppercase tracking-wider tabular-nums">Derived Rate</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Sub-Registrar</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Status</th>
              <th className="p-3.5 font-bold uppercase tracking-wider text-right">Verification Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2DFD8] font-mono">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-[#69717B] space-y-2">
                  <Database className="w-8 h-8 mx-auto text-[#C8C4BA]" />
                  <p className="text-xs uppercase font-mono tracking-wider">No evidence records found matching criteria.</p>
                  <p className="text-[11px] text-[#69717B]">Use &quot;Import Evidence CSV&quot; to ingest verified deeds.</p>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#F5F3ED]/40 transition-colors">
                  {/* Deed ID & Date */}
                  <td className="p-3.5">
                    <div className="font-bold text-[#202B3C]">{tx.deedId || 'NO-DEED-ID'}</div>
                    <div className="text-[10px] text-[#69717B]">
                      {new Date(tx.registrationDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </td>

                  {/* Locality & Project */}
                  <td className="p-3.5 font-sans">
                    <div className="font-bold text-[#202B3C]">{tx.project?.name || 'Independent Residence'}</div>
                    <div className="text-[11px] text-[#547568]">{tx.locality.name}</div>
                  </td>

                  {/* Carpet Area */}
                  <td className="p-3.5 tabular-nums">
                    <div className="font-bold text-[#202B3C]">{tx.carpetAreaSqFt} sq ft</div>
                    <div className="text-[10px] text-[#69717B]">
                      {tx.bhk} BHK {tx.floor !== null ? `&bull; Fl ${tx.floor}` : ''}
                    </div>
                  </td>

                  {/* Transacted Price */}
                  <td className="p-3.5 tabular-nums">
                    <div className="font-bold text-[#202B3C]">₹{tx.transactedPriceLakhs} L</div>
                    <div className="text-[10px] text-[#69717B]">₹{(tx.totalPriceRupees).toLocaleString('en-IN')}</div>
                  </td>

                  {/* Derived Rate */}
                  <td className="p-3.5 tabular-nums">
                    <div className="font-bold text-[#547568]">₹{tx.derivedRateSqFt.toLocaleString('en-IN')}/sq ft</div>
                    <div className="text-[9px] text-[#69717B]">Usable Carpet</div>
                  </td>

                  {/* Sub-Registrar / Provenance */}
                  <td className="p-3.5 font-sans text-xs">
                    <div className="text-[#202B3C] truncate max-w-[140px]">{tx.subRegistrarOffice || 'Gujarat SRO'}</div>
                    <div className="text-[10px] font-mono text-[#69717B]">{tx.source.name}</div>
                  </td>

                  {/* Status Badge */}
                  <td className="p-3.5 font-sans">
                    {tx.verificationStatus === 'VERIFIED' ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold">
                        VERIFIED
                      </span>
                    ) : tx.verificationStatus === 'PENDING_VERIFICATION' ? (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-mono font-bold">
                        PENDING
                      </span>
                    ) : tx.verificationStatus === 'FLAGGED' ? (
                      <span className="px-2 py-0.5 bg-orange-50 text-orange-800 border border-orange-300 text-[10px] font-mono font-bold">
                        FLAGGED
                      </span>
                    ) : tx.verificationStatus === 'DUPLICATE' ? (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-300 text-[10px] font-mono font-bold">
                        DUPLICATE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-50 text-red-800 border border-red-300 text-[10px] font-mono font-bold">
                        REJECTED
                      </span>
                    )}
                  </td>

                  {/* Action Controls */}
                  <td className="p-3.5 text-right font-sans">
                    <div className="inline-flex items-center gap-1.5">
                      {tx.verificationStatus !== 'VERIFIED' && (
                        <button
                          onClick={() => handleProcessAction(tx.id, 'APPROVE')}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 border border-emerald-300 text-[11px] font-bold"
                          title="Approve / Certify Record"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {tx.verificationStatus !== 'FLAGGED' && (
                        <button
                          onClick={() =>
                            setActionPrompt({
                              txId: tx.id,
                              action: 'FLAG',
                              title: `Flag Record ${tx.deedId || tx.id}`,
                            })
                          }
                          className="p-1.5 text-amber-700 hover:bg-amber-50 border border-amber-300 text-[11px]"
                          title="Flag Discrepancy"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {tx.verificationStatus !== 'REJECTED' && (
                        <button
                          onClick={() =>
                            setActionPrompt({
                              txId: tx.id,
                              action: 'REJECT',
                              title: `Reject Record ${tx.deedId || tx.id}`,
                            })
                          }
                          className="p-1.5 text-red-700 hover:bg-red-50 border border-red-300 text-[11px]"
                          title="Reject Record"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setCorrectingTx(tx);
                          setCorrectionForm({
                            carpetAreaSqFt: tx.carpetAreaSqFt.toString(),
                            transactedPriceLakhs: tx.transactedPriceLakhs.toString(),
                            bhk: tx.bhk.toString(),
                            floor: tx.floor !== null ? tx.floor.toString() : '',
                            deedId: tx.deedId || '',
                            subRegistrarOffice: tx.subRegistrarOffice || '',
                            remarks: tx.remarks || '',
                          });
                        }}
                        className="p-1.5 text-[#202B3C] hover:bg-[#F5F3ED] border border-[#C8C4BA]"
                        title="Correct Record"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenAudit(tx.id)}
                        className="p-1.5 text-[#69717B] hover:text-[#202B3C] hover:bg-[#F5F3ED] border border-[#C8C4BA]"
                        title="Audit History"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs font-mono text-[#69717B]">
        <div>
          Displaying {transactions.length} of {totalCount} Records &bull; Page {page}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-white border border-[#C8C4BA] disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={transactions.length < 50}
            className="px-3 py-1 bg-white border border-[#C8C4BA] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CSV IMPORT MODAL                                                        */}
      {/* ========================================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#202B3C] max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#C8C4BA] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#547568]">
                  Evidence Ingestion Gateway
                </span>
                <h3 className="font-editorial text-xl font-bold text-[#202B3C] mt-0.5">
                  Batch Import Evidence CSV
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-[#69717B] hover:text-[#202B3C] text-sm font-bold font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="flex items-center gap-4">
                <span className="text-[#69717B] uppercase">Evidence Type:</span>
                {(['TRANSACTIONS', 'LISTINGS', 'JANTRI'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setImportEntityType(t)}
                    className={`px-3 py-1 border text-xs font-bold ${
                      importEntityType === t
                        ? 'bg-[#202B3C] text-white border-[#202B3C]'
                        : 'bg-[#F5F3ED] text-[#69717B] border-[#C8C4BA]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* CSV Header Spec Notice */}
              <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA] text-[11px] space-y-1">
                <span className="font-bold text-[#202B3C] block uppercase text-[10px]">Expected CSV Header Schema:</span>
                {importEntityType === 'TRANSACTIONS' ? (
                  <code className="text-[#547568] break-all block">
                    registrationDate,localitySlug,projectName,bhk,carpetAreaSqFt,transactedPriceLakhs,floor,totalFloors,subRegistrarOffice,deedId,sourceReference,remarks
                  </code>
                ) : importEntityType === 'LISTINGS' ? (
                  <code className="text-[#547568] break-all block">
                    listingDate,localitySlug,projectName,bhk,carpetAreaSqFt,askingPriceLakhs,floor,totalFloors,sellerType,sourceUrl,sourceReference
                  </code>
                ) : (
                  <code className="text-[#547568] break-all block">
                    jantriEdition,effectiveDate,localitySlug,projectName,tpSchemeNo,finalPlotNo,surveyNumber,residentialApartmentRateSqFt,residentialLandRateSqMeter,commercialShopRateSqFt
                  </code>
                )}
              </div>

              {/* CSV Textarea */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#69717B] block">
                  Paste CSV Payload (Header + Rows):
                </label>
                <textarea
                  rows={8}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`registrationDate,localitySlug,projectName,bhk,carpetAreaSqFt,transactedPriceLakhs,floor,totalFloors,subRegistrarOffice,deedId,sourceReference,remarks\n2026-08-14,shela,Shilp Revanta,3,1380,82.5,11,14,Sanand SRO,DEED-SN-9021,VOL-84/PG-12,Arm-length sale`}
                  className="w-full p-3 bg-white border border-[#C8C4BA] font-mono text-[11px] text-[#202B3C] focus:outline-hidden focus:border-[#202B3C]"
                />
              </div>

              {/* Import Results Summary */}
              {importResult && (
                <div
                  className={`p-3 border text-xs space-y-1 ${
                    importResult.success ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>
                      Import Outcome: {importResult.importedCount} Imported &bull; {importResult.duplicateCount} Flagged Duplicate &bull; {importResult.errorCount} Errors
                    </span>
                  </div>
                  {importResult.errors && importResult.errors.length > 0 && (
                    <ul className="text-[11px] list-disc pl-4 space-y-0.5 mt-2 max-h-24 overflow-y-auto">
                      {importResult.errors.map((err: any, eIdx: number) => (
                        <li key={eIdx}>
                          Row {err.row}: {err.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-[#C8C4BA] flex items-center justify-between">
                <span className="text-[10px] text-[#69717B]">
                  Imported records default strictly to <strong>PENDING_VERIFICATION</strong>.
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 border border-[#C8C4BA] text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRunImport}
                    disabled={importing || !importText.trim()}
                    className="px-5 py-2 bg-[#202B3C] text-white text-xs font-bold uppercase disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{importing ? 'Validating & Ingesting...' : 'Run Import Validation'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RECORD CORRECTION (EDIT) MODAL                                         */}
      {/* ========================================================================= */}
      {correctingTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#202B3C] max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between border-b border-[#C8C4BA] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#547568]">
                  Data Correction &bull; Audit Logged
                </span>
                <h3 className="font-editorial text-lg font-bold text-[#202B3C]">
                  Correct Transaction Record {correctingTx.deedId || correctingTx.id}
                </h3>
              </div>
              <button
                onClick={() => setCorrectingTx(null)}
                className="text-[#69717B] hover:text-[#202B3C] font-bold font-mono"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-[10px] uppercase text-[#69717B] block">Carpet Area (Sq Ft)</label>
                <input
                  type="number"
                  value={correctionForm.carpetAreaSqFt}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, carpetAreaSqFt: e.target.value })}
                  className="w-full h-8 px-2 bg-white border border-[#C8C4BA]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-[#69717B] block">Transacted Price (Lakhs)</label>
                <input
                  type="number"
                  step="0.1"
                  value={correctionForm.transactedPriceLakhs}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, transactedPriceLakhs: e.target.value })}
                  className="w-full h-8 px-2 bg-white border border-[#C8C4BA]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-[#69717B] block">BHK</label>
                <input
                  type="number"
                  step="0.5"
                  value={correctionForm.bhk}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, bhk: e.target.value })}
                  className="w-full h-8 px-2 bg-white border border-[#C8C4BA]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-[#69717B] block">Floor Level</label>
                <input
                  type="number"
                  value={correctionForm.floor}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, floor: e.target.value })}
                  className="w-full h-8 px-2 bg-white border border-[#C8C4BA]"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] uppercase text-[#69717B] block">Deed ID</label>
                <input
                  type="text"
                  value={correctionForm.deedId}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, deedId: e.target.value })}
                  className="w-full h-8 px-2 bg-white border border-[#C8C4BA]"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] uppercase text-[#69717B] block">Sub-Registrar Office</label>
                <input
                  type="text"
                  value={correctionForm.subRegistrarOffice}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, subRegistrarOffice: e.target.value })}
                  className="w-full h-8 px-2 bg-white border border-[#C8C4BA]"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] uppercase text-[#69717B] block">Correction Notes / Reason</label>
                <input
                  type="text"
                  value={correctionForm.remarks}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, remarks: e.target.value })}
                  placeholder="e.g. Corrected carpet area based on physical deed scan"
                  className="w-full h-8 px-2 bg-white border border-[#C8C4BA]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#C8C4BA] flex justify-end gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setCorrectingTx(null)}
                className="px-4 py-2 border border-[#C8C4BA] font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleProcessAction(
                    correctingTx.id,
                    'CORRECT',
                    correctionForm.remarks || 'Record parameters adjusted',
                    correctionForm
                  )
                }
                className="px-4 py-2 bg-[#202B3C] text-white font-bold uppercase"
              >
                Save Correction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. REASON PROMPT MODAL (REJECT / FLAG)                                    */}
      {/* ========================================================================= */}
      {actionPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#202B3C] max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-editorial text-lg font-bold text-[#202B3C] border-b border-[#C8C4BA] pb-2">
              {actionPrompt.title}
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <label className="text-[10px] uppercase text-[#69717B] block">
                Audit Reason for {actionPrompt.action}:
              </label>
              <textarea
                rows={3}
                value={promptReason}
                onChange={(e) => setPromptReason(e.target.value)}
                placeholder="e.g. Suspected non-arms-length transfer or unverified index reference"
                className="w-full p-2.5 bg-white border border-[#C8C4BA]"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs font-mono pt-2">
              <button
                onClick={() => setActionPrompt(null)}
                className="px-3 py-1.5 border border-[#C8C4BA] font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleProcessAction(actionPrompt.txId, actionPrompt.action, promptReason)
                }
                disabled={!promptReason.trim()}
                className="px-4 py-1.5 bg-[#202B3C] text-white font-bold uppercase disabled:opacity-50"
              >
                Confirm {actionPrompt.action}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. AUDIT HISTORY DRAWER                                                    */}
      {/* ========================================================================= */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#202B3C] max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between border-b border-[#C8C4BA] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#547568]">
                  Immutable Provenance Trail
                </span>
                <h3 className="font-editorial text-lg font-bold text-[#202B3C]">
                  Evidence Audit History &bull; {selectedAuditTxId}
                </h3>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-[#69717B] hover:text-[#202B3C] font-bold font-mono"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 font-mono text-xs">
              {auditLoading ? (
                <div className="p-8 text-center text-[#69717B]">Loading audit trail...</div>
              ) : auditLogs.length === 0 ? (
                <div className="p-8 text-center text-[#69717B]">No audit history logged for this record.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-[#F5F3ED] border border-[#C8C4BA]/60 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#202B3C]">{log.action}</span>
                      <span className="text-[#69717B]">
                        {new Date(log.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[#202B3C]">{log.changeSummary}</p>
                    {log.reason && (
                      <p className="text-[11px] text-[#547568]">Reason: {log.reason}</p>
                    )}
                    <div className="text-[10px] text-[#69717B]">
                      Actor: {log.performedByEmail || log.performedByUserId} &bull; IP: {log.ipAddress || 'Internal'}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-[#C8C4BA] text-right font-mono">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-1.5 bg-[#202B3C] text-white text-xs font-bold uppercase"
              >
                Close Audit Trail
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
