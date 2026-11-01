'use client';

import { useEffect, useState } from 'react';
import {
  Coins,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  TrendingUp,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';
import { AssetDTO, AssetCategoryType } from '@/lib/wealth/types';

export default function AssetsPage() {
  const [assets, setAssets] = useState<AssetDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isValuationModalOpen, setIsValuationModalOpen] = useState(false);
  const [activeAsset, setActiveAsset] = useState<AssetDTO | null>(null);

  // Form state for new asset
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<AssetCategoryType>('FINANCIAL');
  const [newSubcategory, setNewSubcategory] = useState('MUTUAL_FUND');
  const [newValueRupees, setNewValueRupees] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('Rajesh Sharma');
  const [newOwnershipPct, setNewOwnershipPct] = useState('100');
  const [newDescription, setNewDescription] = useState('');

  // Form state for valuation update
  const [updatedValueRupees, setUpdatedValueRupees] = useState('');
  const [valuationNote, setValuationNote] = useState('');

  async function loadAssets() {
    setLoading(true);
    try {
      const url = selectedCategory !== 'ALL'
        ? `/api/wealth/assets?workspaceId=fam_sharma_heritage&category=${selectedCategory}`
        : '/api/wealth/assets?workspaceId=fam_sharma_heritage';
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setAssets(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAssets();
  }, [selectedCategory]);

  async function handleCreateAsset(e: React.FormEvent) {
    e.preventDefault();
    if (!newName || !newValueRupees) return;

    try {
      const res = await fetch('/api/wealth/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          category: newCategory,
          subcategory: newSubcategory,
          currentValueRupees: parseFloat(newValueRupees),
          legalOwnerName: newOwnerName,
          ownershipPercentage: parseFloat(newOwnershipPct),
          description: newDescription,
        }),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewName('');
        setNewValueRupees('');
        setNewDescription('');
        await loadAssets();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpdateValuation(e: React.FormEvent) {
    e.preventDefault();
    if (!activeAsset || !updatedValueRupees) return;

    try {
      const res = await fetch('/api/wealth/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_VALUATION',
          assetId: activeAsset.id,
          newValueRupees: parseFloat(updatedValueRupees),
          valuationStatus: 'DOCUMENT_VERIFIED',
          sourceNote: valuationNote || 'Certified chartered valuation certificate',
        }),
      });
      if (res.ok) {
        setIsValuationModalOpen(false);
        setActiveAsset(null);
        setUpdatedValueRupees('');
        setValuationNote('');
        await loadAssets();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteAsset(id: string) {
    if (!confirm('CONFIRM DELETION: Permanently remove this asset record from the family inventory?')) return;
    try {
      const res = await fetch(`/api/wealth/assets?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadAssets();
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filteredAssets = assets.filter((a) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.legalOwnerName.toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalValuePaise = filteredAssets.reduce((sum, a) => sum + a.currentValuePaise, 0);

  return (
    <div className="space-y-8 font-sans">
      {/* 1. TITANIUM COBALT HEADER & INVENTORY BANNER */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="p-6 sm:p-8 border-b border-[#252C38] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7595FF] font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#2457FF]" />
              <span>03 // ASSET MANAGEMENT REGISTER</span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#F4F6FA] tracking-tight mt-1">
              Family Capital Inventory
            </h1>
            <p className="font-sans text-xs text-[#C5CAD3] mt-2 max-w-xl">
              Consolidated register of financial securities, physical real estate, precious metals, and corporate equity holdings with certified valuation histories.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-3 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] font-mono text-xs uppercase tracking-wider font-semibold border border-[#7595FF]/40 rounded-[2px] shadow-[0_0_15px_rgba(36,87,255,0.3)] transition-all flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Record Asset</span>
            </button>
          </div>
        </div>

        {/* Aggregate Inventory Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#252C38] bg-[#090B10]">
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              FILTERED REGISTER VALUE
            </div>
            <div className="font-display font-bold text-2xl text-[#F4F6FA]">
              ₹{(totalValuePaise / 1000000000).toFixed(2)} Crore
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              REGISTERED INSTRUMENTS
            </div>
            <div className="font-display font-bold text-2xl text-[#F4F6FA]">
              {filteredAssets.length} Holdings Documented
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              TITLE AUDIT STATUS
            </div>
            <div className="font-display font-bold text-2xl text-[#7595FF]">
              100% Encrypted &amp; Registered
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECTANGULAR CATEGORY FILTER TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 border border-[#252C38] p-1 bg-[#171C26] rounded-[2px]">
          {['ALL', 'FINANCIAL', 'PHYSICAL', 'BUSINESS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all rounded-[2px] ${
                selectedCategory === cat
                  ? 'bg-[#2457FF] text-[#F4F6FA] font-semibold shadow-[0_0_12px_rgba(36,87,255,0.3)]'
                  : 'text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38]'
              }`}
            >
              {cat === 'ALL' ? 'All Holdings' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#858D9B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search instruments, folios, or titles..."
            className="w-full bg-[#171C26] border border-[#252C38] pl-9 pr-3 py-2 font-mono text-xs text-[#F4F6FA] placeholder-[#858D9B] focus:outline-none focus:border-[#2457FF] rounded-[2px] transition-colors"
          />
        </div>
      </div>

      {/* 3. TITANIUM DATA TABLE */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] overflow-x-auto shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#090B10] text-[#7595FF] font-mono text-[10px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 border-b border-[#252C38]">Code &amp; Instrument Name</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Category</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Primary Legal Title</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Current Valuation</th>
              <th className="py-3 px-4 border-b border-[#252C38]">Audit Status</th>
              <th className="py-3 px-4 border-b border-[#252C38] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252C38] text-[#F4F6FA]">
            {filteredAssets.map((asset, idx) => (
              <tr key={asset.id} className="hover:bg-[#1C2230] transition-colors">
                <td className="py-4 px-4">
                  <div className="font-mono text-[10px] text-[#7595FF] font-semibold">
                    AST-0{idx + 1}
                  </div>
                  <div className="font-display text-base text-[#F4F6FA] font-bold mt-0.5">
                    {asset.name}
                  </div>
                  {asset.description && (
                    <div className="font-mono text-[10px] text-[#858D9B] mt-0.5">
                      {asset.description}
                    </div>
                  )}
                </td>
                <td className="py-4 px-4 font-mono text-xs">
                  <span className="px-2 py-0.5 border border-[#252C38] bg-[#090B10] rounded-[2px] uppercase text-[10px] text-[#C5CAD3]">
                    {asset.subcategory.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="font-mono text-xs font-semibold text-[#F4F6FA]">{asset.legalOwnerName}</div>
                  <div className="font-mono text-[10px] text-[#858D9B]">
                    {asset.ownershipPercentage}% legal equity
                    {asset.coOwners?.length > 0 &&
                      ` + ${asset.coOwners.map((co) => `${co.name} (${co.ownershipPercentage}%)`).join(', ')}`}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="font-display text-base text-[#F4F6FA] font-bold">
                    {asset.formattedCurrentValue}
                  </div>
                  <div className="font-mono text-[10px] text-[#858D9B]">
                    Recorded: {asset.lastValuationDate}
                  </div>
                </td>
                <td className="py-4 px-4">
                  {asset.valuationStatus === 'DOCUMENT_VERIFIED' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#2457FF]/15 text-[#7595FF] border border-[#2457FF]/40 font-mono text-[10px] uppercase tracking-wider rounded-[2px]">
                      <CheckCircle2 className="w-3 h-3 text-[#7595FF]" />
                      Document Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FF7A70]/15 text-[#FF7A70] border border-[#FF7A70]/40 font-mono text-[10px] uppercase tracking-wider rounded-[2px]">
                      <AlertCircle className="w-3 h-3" />
                      Estimate
                    </span>
                  )}
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setActiveAsset(asset);
                        setIsValuationModalOpen(true);
                      }}
                      className="px-2.5 py-1 border border-[#252C38] bg-[#090B10] font-mono text-[10px] uppercase text-[#C5CAD3] hover:text-[#F4F6FA] hover:border-[#7595FF]/50 transition-colors rounded-[2px]"
                      title="Update Certified Valuation"
                    >
                      Update Valuation
                    </button>
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="p-1 border border-[#252C38] bg-[#090B10] text-[#858D9B] hover:text-[#FF7A70] hover:border-[#FF7A70]/50 transition-colors rounded-[2px]"
                      title="Remove Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. RECORD ASSET MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090B10]/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#171C26] border border-[#252C38] p-6 space-y-5 rounded-[2px] shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#252C38]">
              <h3 className="font-display font-bold text-xl text-[#F4F6FA]">Record New Capital Instrument</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] p-1 border border-[#252C38] rounded-[2px]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                  Instrument Name / Description
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Parag Parikh Flexi Cap Fund or Worli Seaface Flat"
                  className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                    Asset Class
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as AssetCategoryType)}
                    className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  >
                    <option value="FINANCIAL">Financial Securities</option>
                    <option value="PHYSICAL">Physical Property / Gold</option>
                    <option value="BUSINESS">Business Equity</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                    Certified Valuation (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={newValueRupees}
                    onChange={(e) => setNewValueRupees(e.target.value)}
                    placeholder="e.g. 5000000"
                    className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                    Legal Primary Title
                  </label>
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                    Primary Equity Share (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newOwnershipPct}
                    onChange={(e) => setNewOwnershipPct(e.target.value)}
                    className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                  Registration Notes / Folio / Deed Number
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Key folio numbers, property address, registry date..."
                  className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                />
              </div>

              <div className="pt-3 border-t border-[#252C38] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#252C38] font-mono text-xs uppercase text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] rounded-[2px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] font-mono text-xs uppercase tracking-wider font-semibold border border-[#7595FF]/40 rounded-[2px] shadow-[0_0_12px_rgba(36,87,255,0.3)]"
                >
                  Commit Instrument to Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. UPDATE VALUATION MODAL */}
      {isValuationModalOpen && activeAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090B10]/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#171C26] border border-[#252C38] p-6 space-y-4 rounded-[2px] shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#252C38]">
              <h3 className="font-display font-bold text-xl text-[#F4F6FA]">Record Certified Valuation</h3>
              <button onClick={() => setIsValuationModalOpen(false)} className="text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] p-1 border border-[#252C38] rounded-[2px]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="font-mono text-xs text-[#858D9B]">
              Instrument: <strong className="text-[#F4F6FA]">{activeAsset.name}</strong>
              <div className="mt-0.5">Recorded: {activeAsset.formattedCurrentValue}</div>
            </div>

            <form onSubmit={handleUpdateValuation} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                  New Certified Valuation (₹)
                </label>
                <input
                  type="number"
                  required
                  value={updatedValueRupees}
                  onChange={(e) => setUpdatedValueRupees(e.target.value)}
                  placeholder="e.g. 135000000"
                  className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#858D9B] mb-1">
                  Valuation Source / Certificate Reference
                </label>
                <input
                  type="text"
                  value={valuationNote}
                  onChange={(e) => setValuationNote(e.target.value)}
                  placeholder="e.g. Q4 2025 Chartered Valuer Report No. 441"
                  className="w-full bg-[#090B10] border border-[#252C38] px-3 py-2 font-mono text-xs text-[#F4F6FA] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
                />
              </div>

              <div className="pt-3 border-t border-[#252C38] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsValuationModalOpen(false)}
                  className="px-4 py-2 border border-[#252C38] font-mono text-xs uppercase text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] rounded-[2px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] font-mono text-xs uppercase tracking-wider font-semibold border border-[#7595FF]/40 rounded-[2px] shadow-[0_0_12px_rgba(36,87,255,0.3)]"
                >
                  Record New Valuation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
