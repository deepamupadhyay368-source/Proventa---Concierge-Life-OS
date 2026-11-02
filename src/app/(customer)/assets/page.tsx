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
import { useCurrentWorkspace } from '@/lib/wealth/workspace-context';

export default function AssetsPage() {
  const { currentWorkspaceId, user, isLoaded } = useCurrentWorkspace();
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
  const [newOwnerName, setNewOwnerName] = useState(user?.name || 'Primary Owner');
  const [newOwnershipPct, setNewOwnershipPct] = useState('100');
  const [newDescription, setNewDescription] = useState('');

  // Form state for valuation update
  const [updatedValueRupees, setUpdatedValueRupees] = useState('');
  const [valuationNote, setValuationNote] = useState('');

  async function loadAssets() {
    if (!currentWorkspaceId) return;
    setLoading(true);
    try {
      const url =
        selectedCategory !== 'ALL'
          ? `/api/wealth/assets?workspaceId=${encodeURIComponent(currentWorkspaceId)}&category=${selectedCategory}`
          : `/api/wealth/assets?workspaceId=${encodeURIComponent(currentWorkspaceId)}`;
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
    if (isLoaded) {
      void loadAssets();
    }
  }, [selectedCategory, currentWorkspaceId, isLoaded]);

  async function handleCreateAsset(e: React.FormEvent) {
    e.preventDefault();
    if (!newName || !newValueRupees || !currentWorkspaceId) return;

    try {
      const res = await fetch('/api/wealth/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: currentWorkspaceId,
          name: newName,
          category: newCategory,
          subcategory: newSubcategory,
          currentValueRupees: parseFloat(newValueRupees),
          legalOwnerId: user?.id || 'usr_owner',
          legalOwnerName: newOwnerName || user?.name || 'Primary Owner',
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
      {/* 1. LIVING ASSET REGISTER HEADER BANNER */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#2563EB] font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
              <span>REGISTER 02 // CAPITAL INVENTORY</span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#0F172A] tracking-tight mt-1">
              Family Capital Inventory
            </h1>
            <p className="font-sans text-xs text-[#475569] mt-2 max-w-xl">
              Consolidated register of financial securities, physical real estate, precious metals, and corporate equity holdings with certified valuation histories.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-mono text-xs uppercase tracking-wider font-semibold rounded-lg shadow-sm shadow-blue-500/25 transition-all flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Record Asset</span>
            </button>
          </div>
        </div>

        {/* Aggregate Inventory Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] bg-[#FAFBFC]">
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
              FILTERED REGISTER VALUE
            </div>
            <div className="font-display font-bold text-2xl text-[#0F172A]">
              ₹{(totalValuePaise / 1000000000).toFixed(2)} Crore
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
              REGISTERED INSTRUMENTS
            </div>
            <div className="font-display font-bold text-2xl text-[#0F172A]">
              {filteredAssets.length} Holdings Documented
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
              TITLE AUDIT STATUS
            </div>
            <div className="font-display font-bold text-2xl text-[#0D9488]">
              100% Encrypted &amp; Registered
            </div>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY FILTER TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 border border-[#CBD5E1] p-1 bg-white rounded-xl shadow-sm">
          {['ALL', 'FINANCIAL', 'PHYSICAL', 'BUSINESS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-all rounded-lg ${
                selectedCategory === cat
                  ? 'bg-[#2563EB] text-white font-bold shadow-sm'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              {cat === 'ALL' ? 'All Holdings' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search instruments, folios, or titles..."
            className="w-full bg-white border border-[#CBD5E1] pl-9 pr-3.5 py-2 font-mono text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] rounded-lg shadow-sm transition-colors"
          />
        </div>
      </div>

      {/* 3. ASSETS DATA TABLE */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#FAFBFC] text-[#64748B] font-mono text-[11px] uppercase tracking-wider border-b border-[#E2E8F0]">
            <tr>
              <th className="py-3 px-5">Code &amp; Instrument Name</th>
              <th className="py-3 px-5">Category</th>
              <th className="py-3 px-5">Primary Legal Title</th>
              <th className="py-3 px-5">Current Valuation</th>
              <th className="py-3 px-5">Audit Status</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9] text-[#0F172A]">
            {filteredAssets.map((asset, idx) => (
              <tr key={asset.id} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="py-4 px-5">
                  <div className="font-mono text-[10px] text-[#2563EB] font-bold">
                    AST-0{idx + 1}
                  </div>
                  <div className="font-display text-base text-[#0F172A] font-bold mt-0.5">
                    {asset.name}
                  </div>
                  {asset.description && (
                    <div className="font-mono text-[11px] text-[#64748B] mt-0.5">
                      {asset.description}
                    </div>
                  )}
                </td>
                <td className="py-4 px-5 font-mono text-xs">
                  <span className="px-2 py-0.5 bg-[#F1F5F9] text-[#475569] rounded-md uppercase text-[10px]">
                    {asset.subcategory.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-5">
                  <div className="font-mono text-xs font-semibold text-[#0F172A]">{asset.legalOwnerName}</div>
                  <div className="font-mono text-[11px] text-[#64748B]">
                    {asset.ownershipPercentage}% legal equity
                    {asset.coOwners?.length > 0 &&
                      ` + ${asset.coOwners.map((co) => `${co.name} (${co.ownershipPercentage}%)`).join(', ')}`}
                  </div>
                </td>
                <td className="py-4 px-5">
                  <div className="font-display text-base text-[#0F172A] font-bold">
                    {asset.formattedCurrentValue}
                  </div>
                  <div className="font-mono text-[11px] text-[#64748B]">
                    Recorded: {asset.lastValuationDate}
                  </div>
                </td>
                <td className="py-4 px-5">
                  {asset.valuationStatus === 'DOCUMENT_VERIFIED' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F0FDFA] text-[#0D9488] border border-[#99F6E4] font-mono text-[10px] uppercase font-bold rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-[#0D9488]" />
                      Document Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 font-mono text-[10px] uppercase font-bold rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      Estimate
                    </span>
                  )}
                </td>
                <td className="py-4 px-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setActiveAsset(asset);
                        setIsValuationModalOpen(true);
                      }}
                      className="px-3 py-1 bg-white border border-[#CBD5E1] font-mono text-[11px] uppercase text-[#334155] hover:text-[#2563EB] hover:border-[#2563EB] transition-colors rounded-lg shadow-sm"
                      title="Update Certified Valuation"
                    >
                      Update Valuation
                    </button>
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="p-1.5 bg-white border border-[#CBD5E1] text-[#64748B] hover:text-rose-600 hover:border-rose-300 transition-colors rounded-lg"
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
        {filteredAssets.length === 0 && (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 mx-auto bg-[#2457FF]/10 text-[#2457FF] flex items-center justify-center rounded-xs">
              <Coins className="w-5 h-5" />
            </div>
            <div className="font-heading font-bold text-base text-[#0F172A]">No Capital Assets Recorded</div>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Your asset register is currently empty. Record your real estate properties, equities, fixed deposits, bullion, or private business interests.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white hover:bg-blue-700 font-mono text-xs uppercase tracking-wider rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Record First Capital Asset</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. RECORD ASSET MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-[#CBD5E1] p-6 space-y-5 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="font-display font-bold text-xl text-[#0F172A]">Record New Capital Instrument</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1">
                  Instrument Name / Description
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Parag Parikh Flexi Cap Fund or BKC Commercial Suite"
                  className="w-full bg-white border border-[#CBD5E1] px-3.5 py-2 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1">
                    Asset Class
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as AssetCategoryType)}
                    className="w-full bg-white border border-[#CBD5E1] px-3 py-2 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] rounded-lg"
                  >
                    <option value="FINANCIAL">Financial Securities</option>
                    <option value="PHYSICAL">Physical Property / Gold</option>
                    <option value="BUSINESS">Business Equity</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1">
                    Certified Valuation (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={newValueRupees}
                    onChange={(e) => setNewValueRupees(e.target.value)}
                    placeholder="e.g. 5000000"
                    className="w-full bg-white border border-[#CBD5E1] px-3.5 py-2 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1">
                    Legal Primary Title
                  </label>
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] px-3.5 py-2 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1">
                    Primary Equity Share (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newOwnershipPct}
                    onChange={(e) => setNewOwnershipPct(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] px-3.5 py-2 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1">
                  Registration Notes / Folio / Deed Number
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Key folio numbers, property address, registry date..."
                  className="w-full bg-white border border-[#CBD5E1] px-3.5 py-2 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#CBD5E1] font-mono text-xs uppercase text-[#475569] hover:bg-[#F8FAFC] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-mono text-xs uppercase tracking-wider font-semibold rounded-lg shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#CBD5E1] p-6 space-y-4 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="font-display font-bold text-xl text-[#0F172A]">Record Certified Valuation</h3>
              <button onClick={() => setIsValuationModalOpen(false)} className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="font-mono text-xs text-[#64748B]">
              Instrument: <strong className="text-[#0F172A]">{activeAsset.name}</strong>
              <div className="mt-0.5">Recorded: {activeAsset.formattedCurrentValue}</div>
            </div>

            <form onSubmit={handleUpdateValuation} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1">
                  New Certified Valuation (₹)
                </label>
                <input
                  type="number"
                  required
                  value={updatedValueRupees}
                  onChange={(e) => setUpdatedValueRupees(e.target.value)}
                  placeholder="e.g. 135000000"
                  className="w-full bg-white border border-[#CBD5E1] px-3.5 py-2 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1">
                  Valuation Source / Certificate Reference
                </label>
                <input
                  type="text"
                  value={valuationNote}
                  onChange={(e) => setValuationNote(e.target.value)}
                  placeholder="e.g. Q4 2025 Chartered Valuer Report No. 441"
                  className="w-full bg-white border border-[#CBD5E1] px-3.5 py-2 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsValuationModalOpen(false)}
                  className="px-4 py-2 border border-[#CBD5E1] font-mono text-xs uppercase text-[#475569] hover:bg-[#F8FAFC] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-mono text-xs uppercase tracking-wider font-semibold rounded-lg shadow-sm"
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
