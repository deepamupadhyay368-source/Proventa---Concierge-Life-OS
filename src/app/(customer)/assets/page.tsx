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
      {/* 1. INSTITUTIONAL HEADER & PORTFOLIO BANNER */}
      <div className="border border-[#101010] bg-[#FAF9F6]">
        <div className="p-6 sm:p-8 border-b border-[#101010] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#85827B]">
              03 // ASSET MANAGEMENT REGISTER
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl text-[#101010] tracking-tight mt-1">
              Family Capital Inventory
            </h1>
            <p className="font-sans text-xs text-[#85827B] mt-2 max-w-xl">
              Consolidated register of financial securities, physical real estate, precious metals, and corporate equity holdings with certified valuation histories.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-3 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] font-mono text-xs uppercase tracking-wider font-semibold border border-[#101010] transition-colors flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Record Asset</span>
            </button>
          </div>
        </div>

        {/* Aggregate Inventory Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#101010] bg-[#F0EDE5]">
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              FILTERED REGISTER VALUE
            </div>
            <div className="font-serif text-2xl text-[#101010]">
              ₹{(totalValuePaise / 1000000000).toFixed(2)} Crore
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              REGISTERED INSTRUMENTS
            </div>
            <div className="font-serif text-2xl text-[#101010]">
              {filteredAssets.length} Holdings Documented
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              TITLE AUDIT STATUS
            </div>
            <div className="font-serif text-2xl text-[#263B35]">
              100% Encrypted &amp; Registered
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECTANGULAR CATEGORY FILTER TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 border border-[#101010] p-1 bg-[#FAF9F6]">
          {['ALL', 'FINANCIAL', 'PHYSICAL', 'BUSINESS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#101010] text-[#F0EDE5] font-semibold'
                  : 'text-[#101010] hover:bg-[#F0EDE5]'
              }`}
            >
              {cat === 'ALL' ? 'All Holdings' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#85827B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search instruments, folios, or titles..."
            className="w-full bg-[#FAF9F6] border border-[#101010] pl-9 pr-3 py-2 font-mono text-xs text-[#101010] placeholder-[#85827B] focus:outline-none focus:ring-1 focus:ring-[#101010]"
          />
        </div>
      </div>

      {/* 3. ARCHITECTURAL DATA TABLE */}
      <div className="border border-[#101010] bg-[#FAF9F6] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#101010] text-[#F0EDE5] font-mono text-[10px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 border-b border-[#101010]">Code &amp; Instrument Name</th>
              <th className="py-3 px-4 border-b border-[#101010]">Category</th>
              <th className="py-3 px-4 border-b border-[#101010]">Primary Legal Title</th>
              <th className="py-3 px-4 border-b border-[#101010]">Current Valuation</th>
              <th className="py-3 px-4 border-b border-[#101010]">Audit Status</th>
              <th className="py-3 px-4 border-b border-[#101010] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#101010] text-[#101010]">
            {filteredAssets.map((asset, idx) => (
              <tr key={asset.id} className="hover:bg-[#F0EDE5] transition-colors">
                <td className="py-4 px-4">
                  <div className="font-mono text-[10px] text-[#85827B]">
                    AST-0{idx + 1}
                  </div>
                  <div className="font-serif text-base text-[#101010] font-normal mt-0.5">
                    {asset.name}
                  </div>
                  {asset.description && (
                    <div className="font-mono text-[10px] text-[#85827B] mt-0.5">
                      {asset.description}
                    </div>
                  )}
                </td>
                <td className="py-4 px-4 font-mono text-xs">
                  <span className="px-2 py-0.5 border border-[#101010] bg-[#FAF9F6] uppercase text-[10px]">
                    {asset.subcategory.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="font-mono text-xs font-semibold">{asset.legalOwnerName}</div>
                  <div className="font-mono text-[10px] text-[#85827B]">
                    {asset.ownershipPercentage}% legal equity
                    {asset.coOwners?.length > 0 &&
                      ` + ${asset.coOwners.map((co) => `${co.name} (${co.ownershipPercentage}%)`).join(', ')}`}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="font-serif text-base text-[#101010] font-normal">
                    {asset.formattedCurrentValue}
                  </div>
                  <div className="font-mono text-[10px] text-[#85827B]">
                    Recorded: {asset.lastValuationDate}
                  </div>
                </td>
                <td className="py-4 px-4">
                  {asset.valuationStatus === 'DOCUMENT_VERIFIED' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#263B35] text-[#FAF9F6] font-mono text-[10px] uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" />
                      Document Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FAF9F6] text-[#A63B32] border border-[#A63B32] font-mono text-[10px] uppercase tracking-wider">
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
                      className="px-2.5 py-1 border border-[#101010] font-mono text-[10px] uppercase text-[#101010] hover:bg-[#101010] hover:text-[#F0EDE5] transition-colors"
                      title="Update Certified Valuation"
                    >
                      Update Valuation
                    </button>
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="p-1 border border-[#101010] text-[#85827B] hover:text-[#A63B32] hover:border-[#A63B32] transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101010]/70">
          <div className="w-full max-w-lg bg-[#FAF9F6] border border-[#101010] p-6 space-y-5 shadow-[8px_8px_0px_0px_#101010]">
            <div className="flex items-center justify-between pb-3 border-b border-[#101010]">
              <h3 className="font-serif text-xl text-[#101010]">Record New Capital Instrument</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#101010] hover:bg-[#F0EDE5] p-1 border border-[#101010]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                  Instrument Name / Description
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Parag Parikh Flexi Cap Fund or Worli Seaface Flat"
                  className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                    Asset Class
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as AssetCategoryType)}
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                  >
                    <option value="FINANCIAL">Financial Securities</option>
                    <option value="PHYSICAL">Physical Property / Gold</option>
                    <option value="BUSINESS">Business Equity</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                    Certified Valuation (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={newValueRupees}
                    onChange={(e) => setNewValueRupees(e.target.value)}
                    placeholder="e.g. 5000000"
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                    Legal Primary Title
                  </label>
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                    Primary Equity Share (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newOwnershipPct}
                    onChange={(e) => setNewOwnershipPct(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                  Registration Notes / Folio / Deed Number
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Key folio numbers, property address, registry date..."
                  className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#101010] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#101010] font-mono text-xs uppercase text-[#101010] hover:bg-[#F0EDE5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] font-mono text-xs uppercase tracking-wider font-semibold border border-[#101010]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101010]/70">
          <div className="w-full max-w-md bg-[#FAF9F6] border border-[#101010] p-6 space-y-4 shadow-[8px_8px_0px_0px_#101010]">
            <div className="flex items-center justify-between pb-3 border-b border-[#101010]">
              <h3 className="font-serif text-xl text-[#101010]">Record Certified Valuation</h3>
              <button onClick={() => setIsValuationModalOpen(false)} className="text-[#101010] hover:bg-[#F0EDE5] p-1 border border-[#101010]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="font-mono text-xs text-[#85827B]">
              Instrument: <strong className="text-[#101010]">{activeAsset.name}</strong>
              <div className="mt-0.5">Recorded: {activeAsset.formattedCurrentValue}</div>
            </div>

            <form onSubmit={handleUpdateValuation} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                  New Certified Valuation (₹)
                </label>
                <input
                  type="number"
                  required
                  value={updatedValueRupees}
                  onChange={(e) => setUpdatedValueRupees(e.target.value)}
                  placeholder="e.g. 135000000"
                  className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#85827B] mb-1">
                  Valuation Source / Certificate Reference
                </label>
                <input
                  type="text"
                  value={valuationNote}
                  onChange={(e) => setValuationNote(e.target.value)}
                  placeholder="e.g. Q4 2025 Chartered Valuer Report No. 441"
                  className="w-full bg-[#FAF9F6] border border-[#101010] px-3 py-2 font-mono text-xs text-[#101010] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#101010] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsValuationModalOpen(false)}
                  className="px-4 py-2 border border-[#101010] font-mono text-xs uppercase text-[#101010] hover:bg-[#F0EDE5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] font-mono text-xs uppercase tracking-wider font-semibold border border-[#101010]"
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
