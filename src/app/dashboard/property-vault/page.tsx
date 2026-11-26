'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  Upload,
  FileText,
  Building,
  Plus,
  Trash2,
  Download,
  Calendar,
  IndianRupee,
  Lock,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  FolderOpen,
  AlertCircle
} from 'lucide-react';

interface VaultDocument {
  id: string;
  category: 'SALE_DEED' | 'AGREEMENT_TO_SELL' | 'ALLOTMENT_LETTER' | 'TAX_RECEIPT' | 'LOAN_STATEMENT' | 'RENTAL_AGREEMENT' | 'MAINTENANCE_RECORD';
  name: string;
  uploadedDate: string;
  fileSize: string;
  verifiedStatus: 'STORED_ENCRYPTED';
}

interface VaultProperty {
  id: string;
  name: string;
  locality: string;
  project: string;
  address: string;
  carpetAreaSqFt: number;
  propertyType: string;
  purchaseDate: string;
  purchasePriceLakhs: number;
  registrationCostLakhs: number;
  renovationCostLakhs: number;
  currentEstimatedValueLakhs: number;
  monthlyRentalIncome: number;
  loanOutstandingLakhs: number;
  documents: VaultDocument[];
  notes: string;
}

const INITIAL_PROPERTIES: VaultProperty[] = [
  {
    id: 'vault-01',
    name: 'Primary Residence — Shela Flat',
    locality: 'Shela, Ahmedabad',
    project: 'Shilp Revanta',
    address: 'Flat 1102, Tower B, Shilp Revanta, Club O7 Road, Shela',
    carpetAreaSqFt: 1450,
    propertyType: 'Residential Apartment (3 BHK)',
    purchaseDate: '12-May-2023',
    purchasePriceLakhs: 82.0,
    registrationCostLakhs: 4.8,
    renovationCostLakhs: 6.5,
    currentEstimatedValueLakhs: 98.5,
    monthlyRentalIncome: 28000,
    loanOutstandingLakhs: 48.2,
    notes: 'Covered basement parking slot B-42 assigned. Maintenance charges paid quarterly to society.',
    documents: [
      {
        id: 'doc-01',
        category: 'SALE_DEED',
        name: 'Registered_Sale_Deed_Sanand_SubRegistrar.pdf',
        uploadedDate: '14-May-2023',
        fileSize: '6.4 MB',
        verifiedStatus: 'STORED_ENCRYPTED',
      },
      {
        id: 'doc-02',
        category: 'TAX_RECEIPT',
        name: 'AUDA_Property_Tax_Receipt_FY2025_26.pdf',
        uploadedDate: '20-Jun-2026',
        fileSize: '1.1 MB',
        verifiedStatus: 'STORED_ENCRYPTED',
      },
      {
        id: 'doc-03',
        category: 'LOAN_STATEMENT',
        name: 'HDFC_Home_Loan_Amortization_Schedule.pdf',
        uploadedDate: '01-Apr-2026',
        fileSize: '840 KB',
        verifiedStatus: 'STORED_ENCRYPTED',
      },
      {
        id: 'doc-04',
        category: 'ALLOTMENT_LETTER',
        name: 'Developer_Possession_Certificate_BUPermission.pdf',
        uploadedDate: '10-May-2023',
        fileSize: '3.2 MB',
        verifiedStatus: 'STORED_ENCRYPTED',
      },
    ],
  },
  {
    id: 'vault-02',
    name: 'Investment Asset — South Bopal',
    locality: 'South Bopal, Ahmedabad',
    project: 'Aarohi Elegance',
    address: 'Unit 404, Block C, Aarohi Elegance, South Bopal',
    carpetAreaSqFt: 880,
    propertyType: 'Residential Apartment (2 BHK)',
    purchaseDate: '18-Feb-2024',
    purchasePriceLakhs: 56.5,
    registrationCostLakhs: 3.3,
    renovationCostLakhs: 2.2,
    currentEstimatedValueLakhs: 64.2,
    monthlyRentalIncome: 19500,
    loanOutstandingLakhs: 0,
    notes: 'Leased out on 11-month registered agreement ending Jan 2027.',
    documents: [
      {
        id: 'doc-05',
        category: 'SALE_DEED',
        name: 'Registered_Sale_Deed_Aarohi_404.pdf',
        uploadedDate: '22-Feb-2024',
        fileSize: '5.8 MB',
        verifiedStatus: 'STORED_ENCRYPTED',
      },
      {
        id: 'doc-06',
        category: 'RENTAL_AGREEMENT',
        name: 'Registered_Rent_Agreement_Tenant_2026.pdf',
        uploadedDate: '15-Jan-2026',
        fileSize: '2.1 MB',
        verifiedStatus: 'STORED_ENCRYPTED',
      },
      {
        id: 'doc-07',
        category: 'TAX_RECEIPT',
        name: 'AMC_Tax_Bill_2026.pdf',
        uploadedDate: '05-May-2026',
        fileSize: '950 KB',
        verifiedStatus: 'STORED_ENCRYPTED',
      },
    ],
  },
];

export default function PropertyVaultPage() {
  const [properties, setProperties] = useState<VaultProperty[]>(INITIAL_PROPERTIES);
  const [activePropertyId, setActivePropertyId] = useState<string>(INITIAL_PROPERTIES[0].id);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Property Form State
  const [newProp, setNewProp] = useState({
    name: '',
    locality: 'Shela, Ahmedabad',
    project: '',
    address: '',
    carpetAreaSqFt: 1200,
    propertyType: 'Residential Apartment (3 BHK)',
    purchaseDate: '',
    purchasePriceLakhs: 75,
    registrationCostLakhs: 4.5,
    renovationCostLakhs: 3.0,
    monthlyRentalIncome: 25000,
    loanOutstandingLakhs: 40,
    notes: '',
  });

  // Upload Form State
  const [uploadCategory, setUploadCategory] = useState<VaultDocument['category']>('TAX_RECEIPT');
  const [uploadFileName, setUploadFileName] = useState('');

  const activeProperty = properties.find((p) => p.id === activePropertyId) || properties[0];

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProp.name.trim()) return;

    const created: VaultProperty = {
      id: `vault-${Date.now()}`,
      name: newProp.name,
      locality: newProp.locality,
      project: newProp.project || 'Independent Society',
      address: newProp.address || newProp.locality,
      carpetAreaSqFt: Number(newProp.carpetAreaSqFt),
      propertyType: newProp.propertyType,
      purchaseDate: newProp.purchaseDate || '2026',
      purchasePriceLakhs: Number(newProp.purchasePriceLakhs),
      registrationCostLakhs: Number(newProp.registrationCostLakhs),
      renovationCostLakhs: Number(newProp.renovationCostLakhs),
      currentEstimatedValueLakhs: Number(newProp.purchasePriceLakhs) * 1.08,
      monthlyRentalIncome: Number(newProp.monthlyRentalIncome),
      loanOutstandingLakhs: Number(newProp.loanOutstandingLakhs),
      documents: [],
      notes: newProp.notes,
    };

    setProperties([created, ...properties]);
    setActivePropertyId(created.id);
    setShowAddModal(false);
  };

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;

    const newDoc: VaultDocument = {
      id: `doc-${Date.now()}`,
      category: uploadCategory,
      name: uploadFileName.endsWith('.pdf') ? uploadFileName : `${uploadFileName}.pdf`,
      uploadedDate: 'Today',
      fileSize: '1.8 MB',
      verifiedStatus: 'STORED_ENCRYPTED',
    };

    setProperties((prev) =>
      prev.map((p) =>
        p.id === activeProperty.id ? { ...p, documents: [newDoc, ...p.documents] } : p
      )
    );
    setUploadFileName('');
    setShowUploadModal(false);
  };

  const handleDeleteDocument = (docId: string) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === activeProperty.id
          ? { ...p, documents: p.documents.filter((d) => d.id !== docId) }
          : p
      )
    );
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Non-Persistence Warning Banner */}
      <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold uppercase tracking-wider font-mono text-[11px]">
            PROTOTYPE INTERFACE — DATA NON-PERSISTENT
          </p>
          <p className="text-amber-800 leading-relaxed">
            Properties and documents added in this session are stored temporarily in your local browser session and are not permanently committed to encrypted cloud storage. Backend encrypted vault persistence is under development. Do not upload sensitive confidential documents until production encryption infrastructure is activated.
          </p>
        </div>
      </div>

      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C8C4BA] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
              Personal Property Vault
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 font-bold flex items-center gap-1 font-mono">
              <AlertCircle className="h-3 w-3" />
              <span>Prototype Session (In-Memory)</span>
            </span>
          </div>
          <h1 className="font-editorial text-2xl md:text-3xl font-normal text-[#202B3C] mt-1">
            Personal Property Vault
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 bg-[#202B3C] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 hover:bg-[#202B3C]/90"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Property Asset</span>
          </button>
        </div>
      </div>

      {/* Property Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#C8C4BA]">
        {properties.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePropertyId(p.id)}
            className={`px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap border-b-2 ${
              activePropertyId === p.id
                ? 'border-[#202B3C] text-[#202B3C] bg-white'
                : 'border-transparent text-[#69717B] hover:text-[#202B3C]'
            }`}
          >
            <Building className="h-3.5 w-3.5 text-[#547568]" />
            <span>{p.name}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#F5F3ED] text-[#69717B]">
              {p.documents.length} docs
            </span>
          </button>
        ))}
      </div>

      {/* Active Property Dossier */}
      {activeProperty && (
        <div className="space-y-8">
          {/* Top Summary Banner */}
          <div className="bg-white border border-[#C8C4BA] p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#C8C4BA]/50 pb-4">
              <div>
                <span className="text-[11px] font-mono text-[#547568] font-bold uppercase">
                  {activeProperty.propertyType}
                </span>
                <h2 className="font-editorial text-2xl font-normal text-[#202B3C]">
                  {activeProperty.name}
                </h2>
                <p className="text-xs text-[#69717B] flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-[#547568]" />
                  <span>{activeProperty.address}</span>
                </p>
              </div>

              <div className="flex items-center gap-3 font-mono">
                <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA]/40 text-right">
                  <span className="text-[10px] text-[#69717B] block uppercase">Current Valuation</span>
                  <span className="text-lg font-bold text-[#202B3C]">
                    ₹{activeProperty.currentEstimatedValueLakhs} Lakhs
                  </span>
                </div>
                <div className="p-3 bg-[#547568]/10 border border-[#547568]/20 text-right">
                  <span className="text-[10px] text-[#547568] block uppercase">Unrealized Gain</span>
                  <span className="text-lg font-bold text-[#547568]">
                    +₹{(activeProperty.currentEstimatedValueLakhs - activeProperty.purchasePriceLakhs).toFixed(1)} L
                  </span>
                </div>
              </div>
            </div>

            {/* Financial & Physical Attribute Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-[#F5F3ED] border border-[#C8C4BA]/40">
                <span className="text-[10px] text-[#69717B] block">Usable Carpet</span>
                <span className="font-bold text-[#202B3C]">{activeProperty.carpetAreaSqFt} sq ft</span>
              </div>
              <div className="p-2.5 bg-[#F5F3ED] border border-[#C8C4BA]/40">
                <span className="text-[10px] text-[#69717B] block">Purchase Price</span>
                <span className="text-[#202B3C]">₹{activeProperty.purchasePriceLakhs} L ({activeProperty.purchaseDate})</span>
              </div>
              <div className="p-2.5 bg-[#F5F3ED] border border-[#C8C4BA]/40">
                <span className="text-[10px] text-[#69717B] block">Stamp & Reg. Duty</span>
                <span className="text-[#202B3C]">₹{activeProperty.registrationCostLakhs} Lakhs</span>
              </div>
              <div className="p-2.5 bg-[#F5F3ED] border border-[#C8C4BA]/40">
                <span className="text-[10px] text-[#69717B] block">Renovation Spent</span>
                <span className="text-[#202B3C]">₹{activeProperty.renovationCostLakhs} Lakhs</span>
              </div>
              <div className="p-2.5 bg-[#F5F3ED] border border-[#C8C4BA]/40">
                <span className="text-[10px] text-[#69717B] block">Monthly Rent</span>
                <span className="text-[#202B3C]">₹{activeProperty.monthlyRentalIncome.toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="p-2.5 bg-[#F5F3ED] border border-[#C8C4BA]/40">
                <span className="text-[10px] text-[#69717B] block">Loan Outstanding</span>
                <span className="text-[#202B3C]">
                  {activeProperty.loanOutstandingLakhs > 0 ? `₹${activeProperty.loanOutstandingLakhs} L` : 'Debt Free'}
                </span>
              </div>
            </div>

            {activeProperty.notes && (
              <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA]/40 text-xs text-[#69717B]">
                <strong className="text-[#202B3C]">Private Owner Notes:</strong> {activeProperty.notes}
              </div>
            )}
          </div>

          {/* Secure Document Locker Section */}
          <div className="bg-white border border-[#C8C4BA] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C8C4BA]/50 pb-3">
              <div>
                <h3 className="font-editorial text-xl font-normal text-[#202B3C]">
                  Stored Legal & Financial Records
                </h3>
                <p className="text-xs text-[#69717B]">
                  Encrypted deeds, tax receipts, allotment certificates, and municipal documents.
                </p>
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="px-3 py-1.5 bg-[#202B3C] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#202B3C]/90 shadow-xs"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Document</span>
              </button>
            </div>

            {activeProperty.documents.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#69717B] border border-dashed border-[#C8C4BA] space-y-2">
                <FolderOpen className="h-8 w-8 mx-auto text-[#C8C4BA]" />
                <p>No legal records uploaded for this asset yet.</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="font-bold text-[#547568] hover:underline"
                >
                  Upload your first sale deed or tax receipt →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#C8C4BA]/50">
                {activeProperty.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F5F3ED]/40 px-2 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-[#547568] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-[#202B3C]">{doc.name}</p>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#69717B] mt-0.5">
                          <span className="px-1.5 py-0.2 bg-[#F5F3ED] border border-[#C8C4BA]">
                            {doc.category.replace('_', ' ')}
                          </span>
                          <span>Uploaded: {doc.uploadedDate}</span>
                          <span>{doc.fileSize}</span>
                          <span className="text-[#547568] font-bold">Encrypted</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => alert(`Downloading verified encrypted copy: ${doc.name}`)}
                        className="p-1.5 text-[#202B3C] hover:bg-[#F5F3ED] border border-[#C8C4BA] text-xs flex items-center gap-1"
                        title="Download Document"
                      >
                        <Download className="h-3.5 w-3.5 text-[#547568]" />
                        <span className="text-[11px]">Download</span>
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200"
                        title="Delete Document"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#202B3C] max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#C8C4BA] pb-3">
              <h3 className="font-editorial text-xl font-normal text-[#202B3C]">
                Add Asset to Personal Property Vault
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProperty} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">
                  Property Asset Nickname
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shela Home or Science City Commercial Office"
                  value={newProp.name}
                  onChange={(e) => setNewProp({ ...newProp, name: e.target.value })}
                  required
                  className="w-full p-2 border border-[#C8C4BA] bg-white text-[#202B3C] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">Locality</label>
                  <select
                    value={newProp.locality}
                    onChange={(e) => setNewProp({ ...newProp, locality: e.target.value })}
                    className="w-full p-2 border border-[#C8C4BA] bg-white text-[#202B3C] focus:outline-hidden"
                  >
                    <option value="Shela, Ahmedabad">Shela</option>
                    <option value="South Bopal, Ahmedabad">South Bopal</option>
                    <option value="Bodakdev, Ahmedabad">Bodakdev</option>
                    <option value="Satellite, Ahmedabad">Satellite</option>
                    <option value="Science City, Ahmedabad">Science City</option>
                    <option value="GIFT City, Gandhinagar">GIFT City</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">Project / Society</label>
                  <input
                    type="text"
                    placeholder="e.g. Shilp Revanta"
                    value={newProp.project}
                    onChange={(e) => setNewProp({ ...newProp, project: e.target.value })}
                    className="w-full p-2 border border-[#C8C4BA] bg-white text-[#202B3C] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">Usable Carpet Area (Sq Ft)</label>
                  <input
                    type="number"
                    value={newProp.carpetAreaSqFt}
                    onChange={(e) => setNewProp({ ...newProp, carpetAreaSqFt: Number(e.target.value) })}
                    required
                    className="w-full p-2 border border-[#C8C4BA] bg-white text-[#202B3C] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">Acquisition Price (₹ Lakhs)</label>
                  <input
                    type="number"
                    value={newProp.purchasePriceLakhs}
                    onChange={(e) => setNewProp({ ...newProp, purchasePriceLakhs: Number(e.target.value) })}
                    required
                    className="w-full p-2 border border-[#C8C4BA] bg-white text-[#202B3C] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Private Notes</label>
                <textarea
                  placeholder="Registry number, parking slot, loan details..."
                  rows={2}
                  value={newProp.notes}
                  onChange={(e) => setNewProp({ ...newProp, notes: e.target.value })}
                  className="w-full p-2 border border-[#C8C4BA] bg-white text-[#202B3C] focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#202B3C] text-white font-semibold text-xs hover:bg-[#202B3C]/90"
                >
                  Save Asset in Vault
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-white border border-[#C8C4BA] text-[#202B3C] font-semibold text-xs hover:bg-[#F5F3ED]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#202B3C] max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#C8C4BA] pb-3">
              <h3 className="font-editorial text-xl font-normal text-[#202B3C]">
                Upload Encrypted Record
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">
                  Document Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as VaultDocument['category'])}
                  className="w-full p-2 border border-[#C8C4BA] bg-white text-[#202B3C] focus:outline-hidden"
                >
                  <option value="SALE_DEED">Sale Deed / Sub-Registrar Conveyance</option>
                  <option value="TAX_RECEIPT">AUDA / AMC Municipal Property Tax Receipt</option>
                  <option value="ALLOTMENT_LETTER">Builder Allotment Letter / BU Permission</option>
                  <option value="LOAN_STATEMENT">Bank Loan Statement / NOC</option>
                  <option value="RENTAL_AGREEMENT">Registered Rent Agreement</option>
                  <option value="MAINTENANCE_RECORD">Society Maintenance Receipts</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">
                  Document Name / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Registered_Sale_Deed_2026.pdf"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  required
                  className="w-full p-2 border border-[#C8C4BA] bg-white text-[#202B3C] focus:outline-hidden"
                />
              </div>

              <div className="p-4 border border-dashed border-[#C8C4BA] text-center space-y-1 bg-[#F5F3ED]">
                <Upload className="h-6 w-6 mx-auto text-[#547568]" />
                <p className="font-semibold text-[#202B3C]">Simulated Encrypted Upload</p>
                <p className="text-[10px] text-[#69717B]">Supports PDF, PNG, JPEG up to 25 MB</p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#202B3C] text-white font-semibold text-xs hover:bg-[#202B3C]/90"
                >
                  Store Document
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 bg-white border border-[#C8C4BA] text-[#202B3C] font-semibold text-xs hover:bg-[#F5F3ED]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
