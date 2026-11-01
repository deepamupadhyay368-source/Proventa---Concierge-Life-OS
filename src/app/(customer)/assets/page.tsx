'use client';

import { useEffect, useState } from 'react';
import {
  Coins,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  Trash2,
  Edit3,
  X,
  TrendingUp,
  AlertCircle,
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
          sourceNote: valuationNote || 'Updated certified valuation entry',
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
    if (!confirm('Are you sure you want to remove this asset from the family register?')) return;
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

  const totalValue = filteredAssets.reduce((sum, a) => sum + a.currentValuePaise, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A78BFA] mb-1">
            FAMILY WEALTH OS // ASSET REGISTRY
          </div>
          <h1 className="font-serif text-3xl text-white">Family Asset Management</h1>
          <p className="text-xs text-[#9D8BC9] font-light mt-1">
            Financial securities, physical real estate &amp; gold, and business equity holdings with valuation histories.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#7C3AED] hover:bg-[#8B5CF6] transition-all shadow-md shadow-[#7C3AED]/25"
        >
          <Plus className="w-4 h-4" />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0E1322] border border-[#1E293B]">
          {['ALL', 'FINANCIAL', 'PHYSICAL', 'BUSINESS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-[#1E1035] text-white border border-[#3E236E]'
                  : 'text-[#9D8BC9] hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'All Holdings' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets or owners..."
            className="w-full bg-[#0E1322] border border-[#1E293B] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED]"
          />
        </div>
      </div>

      {/* Assets Table */}
      <div className="rounded-2xl bg-[#0E1322] border border-[#1E293B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070A12] border-b border-[#1E293B] text-[10px] font-mono uppercase tracking-wider text-[#9D8BC9]">
              <tr>
                <th className="py-3 px-4">Asset Name &amp; Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Legal Owner &amp; Share</th>
                <th className="py-3 px-4">Current Valuation</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-white">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-[#1E1035]/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-semibold text-white">{asset.name}</div>
                    {asset.description && (
                      <div className="text-[11px] text-[#9D8BC9] font-light mt-0.5 line-clamp-1">
                        {asset.description}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1E1035] text-[#DDD0F7] border border-[#3E236E]">
                      {asset.subcategory.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-white font-medium">{asset.legalOwnerName}</div>
                    <div className="text-[10px] text-[#9D8BC9] font-mono">
                      {asset.ownershipPercentage}%
                      {asset.coOwners?.length > 0 &&
                        ` + ${asset.coOwners.map((co) => `${co.name} (${co.ownershipPercentage}%)`).join(', ')}`}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-serif text-base font-bold text-white">
                      {asset.formattedCurrentValue}
                    </div>
                    <div className="text-[10px] text-[#9D8BC9] font-mono">
                      As of {asset.lastValuationDate}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {asset.valuationStatus === 'DOCUMENT_VERIFIED' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#064E3B]/40 text-[#10B981] border border-[#10B981]/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#451A03]/40 text-[#F59E0B] border border-[#F59E0B]/30">
                        <AlertCircle className="w-3 h-3" />
                        Estimated
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
                        className="p-1.5 rounded-lg text-[#9D8BC9] hover:text-white hover:bg-[#1E1035] transition-colors"
                        title="Update Valuation"
                      >
                        <TrendingUp className="w-4 h-4 text-[#A78BFA]" />
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="p-1.5 rounded-lg text-[#9D8BC9] hover:text-[#F43F5E] hover:bg-[#1E1035] transition-colors"
                        title="Delete Asset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ASSET MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0E1322] border border-[#3E236E] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <h3 className="text-base font-semibold text-white">Record New Family Asset</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#9D8BC9] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Parag Parikh Flexi Cap Fund or Worli Flat"
                  className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as AssetCategoryType)}
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="FINANCIAL">Financial Securities</option>
                    <option value="PHYSICAL">Physical Property / Gold</option>
                    <option value="BUSINESS">Business Equity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Estimated Value (₹)</label>
                  <input
                    type="number"
                    required
                    value={newValueRupees}
                    onChange={(e) => setNewValueRupees(e.target.value)}
                    placeholder="e.g. 5000000 for 50 Lakh"
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Legal Owner</label>
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Ownership Share (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newOwnershipPct}
                    onChange={(e) => setNewOwnershipPct(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Description &amp; Notes</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Key folio numbers, property address, or co-investor details..."
                  className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="pt-3 border-t border-[#1E293B] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[#9D8BC9] hover:bg-[#1E1035]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#7C3AED] hover:bg-[#8B5CF6]"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE VALUATION MODAL */}
      {isValuationModalOpen && activeAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0E1322] border border-[#3E236E] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <h3 className="text-base font-semibold text-white">Update Valuation</h3>
              <button onClick={() => setIsValuationModalOpen(false)} className="text-[#9D8BC9] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#9D8BC9]">
              Asset: <strong className="text-white">{activeAsset.name}</strong>
              <div className="mt-0.5">Current Recorded: {activeAsset.formattedCurrentValue}</div>
            </div>

            <form onSubmit={handleUpdateValuation} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9D8BC9] mb-1">New Valuation (₹)</label>
                <input
                  type="number"
                  required
                  value={updatedValueRupees}
                  onChange={(e) => setUpdatedValueRupees(e.target.value)}
                  placeholder="e.g. 135000000 for 13.5 Cr"
                  className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9D8BC9] mb-1">Source / Valuer Note</label>
                <input
                  type="text"
                  value={valuationNote}
                  onChange={(e) => setValuationNote(e.target.value)}
                  placeholder="e.g. Q4 2025 Approved Chartered Valuer Report"
                  className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="pt-3 border-t border-[#1E293B] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsValuationModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[#9D8BC9] hover:bg-[#1E1035]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#7C3AED] hover:bg-[#8B5CF6]"
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
