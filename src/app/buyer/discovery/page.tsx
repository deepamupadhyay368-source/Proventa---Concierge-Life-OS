'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Building2,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Truck,
  Package,
  Layers,
  ArrowRight,
  Bookmark,
  ChevronRight,
  Warehouse,
  Sparkles,
  SlidersHorizontal,
  X,
  Scale,
} from 'lucide-react';
import type { SupplierDiscoveryCard } from '@/lib/supplier-intelligence/types';

export default function BuyerSupplierDiscoveryPage() {
  const [suppliers, setSuppliers] = useState<SupplierDiscoveryCard[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [facets, setFacets] = useState<any>({ categories: [], brands: [], districts: [], supplierTypes: [] });
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [gstVerifiedOnly, setGstVerifiedOnly] = useState(false);
  const [proventaVerifiedOnly, setProventaVerifiedOnly] = useState(false);
  const [panIndiaOnly, setPanIndiaOnly] = useState(false);

  // Comparison Tray
  const [comparedSuppliers, setComparedSuppliers] = useState<SupplierDiscoveryCard[]>([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

  // Saved / Bookmark State
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchSuppliers() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedBrand) params.set('brand', selectedBrand);
        if (selectedDistrict) params.set('district', selectedDistrict);
        if (selectedType) params.set('supplierType', selectedType);
        if (gstVerifiedOnly) params.set('gstVerified', 'true');
        if (proventaVerifiedOnly) params.set('proventaVerified', 'true');
        if (panIndiaOnly) params.set('panIndia', 'true');

        const res = await fetch(`/api/supplier/discovery?${params.toString()}`);
        const json = await res.json();
        if (json.success && json.data) {
          setSuppliers(json.data.suppliers || []);
          setTotalCount(json.data.total || 0);
          if (json.data.facets) setFacets(json.data.facets);

          const saved = new Set<string>();
          for (const s of json.data.suppliers || []) {
            if (s.isSaved) saved.add(s.id);
          }
          setSavedIds(saved);
        }
      } catch (err) {
        console.error('Error fetching suppliers:', err);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(fetchSuppliers, 250);
    return () => clearTimeout(timer);
  }, [
    query,
    selectedCategory,
    selectedBrand,
    selectedDistrict,
    selectedType,
    gstVerifiedOnly,
    proventaVerifiedOnly,
    panIndiaOnly,
  ]);

  const handleToggleSave = async (supplierId: string) => {
    try {
      const isCurrentlySaved = savedIds.has(supplierId);
      const nextSaved = new Set(savedIds);
      if (isCurrentlySaved) nextSaved.delete(supplierId);
      else nextSaved.add(supplierId);
      setSavedIds(nextSaved);

      await fetch('/api/supplier/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierBusinessId: supplierId }),
      });
    } catch (e) {
      console.error('Error toggling save:', e);
    }
  };

  const handleToggleCompare = (s: SupplierDiscoveryCard) => {
    if (comparedSuppliers.some((item) => item.id === s.id)) {
      setComparedSuppliers(comparedSuppliers.filter((item) => item.id !== s.id));
    } else {
      if (comparedSuppliers.length >= 3) {
        alert('You can compare a maximum of 3 suppliers at once.');
        return;
      }
      setComparedSuppliers([...comparedSuppliers, s]);
    }
  };

  const clearAllFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedDistrict('');
    setSelectedType('');
    setGstVerifiedOnly(false);
    setProventaVerifiedOnly(false);
    setPanIndiaOnly(false);
  };

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#414957] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#536B88] font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>BUYER PROCUREMENT DESK &bull; SUPPLIER INTELLIGENCE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              Supplier Intelligence & Discovery Engine
            </h1>
            <p className="text-xs text-[#A8ADB7] mt-1">
              Discover verified industrial manufacturers, stockists, and distributors across Gujarat & Western India corridors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/buyer/dashboard"
              className="px-4 py-2 bg-[#252B38] hover:bg-[#191B20] border border-[#414957] text-xs font-mono font-bold uppercase tracking-wider text-[#F1F2F4] rounded-sm transition-colors"
            >
              Buyer Dashboard
            </Link>
            <Link
              href="/rfq/new"
              className="px-4 py-2 bg-[#C66A42] hover:bg-[#B35A33] text-xs font-mono font-bold uppercase tracking-wider text-[#FFFFFF] rounded-sm transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Create RFQ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Global Search Input */}
        <div className="bg-[#303746] border border-[#414957] p-4 rounded-sm shadow-sm">
          <div className="relative">
            <Search className="w-4 h-4 text-[#536B88] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by material (e.g. TMT 550D, RMC M40, 53 Grade Cement), brand (Tata Tiscon, UltraTech), or supplier name..."
              className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] text-xs pl-10 pr-4 py-3 rounded-sm outline-none focus:border-[#C66A42] font-mono"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#A8ADB7] hover:text-[#FFFFFF]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Layout: Filter Sidebar + Supplier Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Filters Sidebar */}
          <div className="bg-[#303746] border border-[#414957] p-5 rounded-sm space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#414957] pb-3">
              <span className="text-xs font-mono font-bold text-[#FFFFFF] uppercase flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#C66A42]" />
                <span>Filters & Criteria</span>
              </span>
              {(selectedCategory || selectedBrand || selectedDistrict || selectedType || gstVerifiedOnly || proventaVerifiedOnly || panIndiaOnly) && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-mono text-[#C66A42] hover:underline"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Verification Toggles */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-[#A8ADB7] uppercase font-bold block">
                Verification Credentials
              </span>
              <label className="flex items-center gap-2 text-xs text-[#F1F2F4] cursor-pointer">
                <input
                  type="checkbox"
                  checked={gstVerifiedOnly}
                  onChange={(e) => setGstVerifiedOnly(e.target.checked)}
                  className="rounded bg-[#191B20] border-[#414957] text-[#C66A42] focus:ring-0"
                />
                <span>GST Verified Only</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#F1F2F4] cursor-pointer">
                <input
                  type="checkbox"
                  checked={proventaVerifiedOnly}
                  onChange={(e) => setProventaVerifiedOnly(e.target.checked)}
                  className="rounded bg-[#191B20] border-[#414957] text-[#C66A42] focus:ring-0"
                />
                <span>PROVENTA Verified Enterprise</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#F1F2F4] cursor-pointer">
                <input
                  type="checkbox"
                  checked={panIndiaOnly}
                  onChange={(e) => setPanIndiaOnly(e.target.checked)}
                  className="rounded bg-[#191B20] border-[#414957] text-[#C66A42] focus:ring-0"
                />
                <span>Pan-India Delivery Capability</span>
              </label>
            </div>

            {/* Operating Categories */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-[#A8ADB7] uppercase font-bold block">
                Material Category
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] text-xs p-2 rounded-sm outline-none focus:border-[#C66A42]"
              >
                <option value="">All Categories</option>
                <option value="building-materials">Building Materials & Steel</option>
                <option value="structural-steel">Structural Steel & Sections</option>
                <option value="cement">Cement & Aggregates</option>
                <option value="concrete-rmc">Ready-Mix Concrete (RMC)</option>
                <option value="electrical">Electrical & High-Tension Cables</option>
                <option value="plumbing">Plumbing & Industrial Pipes</option>
              </select>
            </div>

            {/* Location / District */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-[#A8ADB7] uppercase font-bold block">
                Warehouse / Delivery District
              </span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] text-xs p-2 rounded-sm outline-none focus:border-[#C66A42]"
              >
                <option value="">All Districts</option>
                <option value="Ahmedabad">Ahmedabad Hub & GIDC</option>
                <option value="Gandhinagar">Gandhinagar Metro Corridor</option>
                <option value="Sanand">Sanand Industrial Belt</option>
                <option value="Changodar">Changodar Logistics Zone</option>
                <option value="Odhav">GIDC Odhav Central</option>
                <option value="Kheda">Kheda & Central Gujarat</option>
                <option value="Dholera">Dholera SIR Special Zone</option>
              </select>
            </div>

            {/* Supplier Type */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-[#A8ADB7] uppercase font-bold block">
                Supplier Classification
              </span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] text-xs p-2 rounded-sm outline-none focus:border-[#C66A42]"
              >
                <option value="">All Classifications</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Distributor">Primary Distributor</option>
                <option value="Dealer">Authorized Dealer</option>
                <option value="Wholesaler">Stockist & Wholesaler</option>
              </select>
            </div>
          </div>

          {/* Suppliers Results List */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-[#A8ADB7] px-1">
              <span>
                Found <strong className="text-[#FFFFFF]">{totalCount}</strong> verified supplier profiles matching parameters
              </span>
              {comparedSuppliers.length > 0 && (
                <button
                  onClick={() => setComparisonModalOpen(true)}
                  className="px-3 py-1 bg-[#191B20] border border-[#C66A42] text-[#C66A42] font-bold rounded-sm flex items-center gap-1.5"
                >
                  <Scale className="w-3 h-3" />
                  <span>Compare ({comparedSuppliers.length}/3)</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="bg-[#303746] border border-[#414957] p-12 text-center text-xs font-mono text-[#A8ADB7] rounded-sm">
                Searching intelligence directory...
              </div>
            ) : suppliers.length === 0 ? (
              <div className="bg-[#303746] border border-[#414957] p-12 text-center space-y-3 rounded-sm">
                <Building2 className="w-8 h-8 text-[#536B88] mx-auto" />
                <h3 className="font-heading font-black text-base uppercase tracking-tight text-[#FFFFFF]">
                  No matching suppliers found
                </h3>
                <p className="text-xs text-[#A8ADB7] max-w-sm mx-auto">
                  Try broadening your search keywords, clearing location filters, or resetting brand preferences.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-[#252B38] hover:bg-[#191B20] text-xs font-mono uppercase font-bold text-[#FFFFFF] border border-[#414957] rounded-sm"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {suppliers.map((s) => {
                  const isCompared = comparedSuppliers.some((item) => item.id === s.id);
                  const isSaved = savedIds.has(s.id);

                  return (
                    <div
                      key={s.id}
                      className="bg-[#303746] border border-[#414957] hover:border-[#536B88] transition-colors p-6 rounded-sm space-y-5 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-[#536B88] uppercase px-2 py-0.5 bg-[#191B20] border border-[#414957] rounded-sm">
                              {s.supplierType}
                            </span>
                            {s.isGstVerified && (
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-400 px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/60 rounded-sm">
                                <ShieldCheck className="w-3 h-3" />
                                <span>GST Verified</span>
                              </span>
                            )}
                            {s.verificationBadge === 'PREMIUM_VERIFIED' && (
                              <span className="font-mono text-[10px] font-bold text-[#C66A42] uppercase px-2 py-0.5 bg-[#191B20] border border-[#C66A42] rounded-sm">
                                PROVENTA Verified
                              </span>
                            )}
                          </div>

                          <div>
                            <Link
                              href={`/suppliers/${s.slug}`}
                              className="font-heading font-black text-xl text-[#FFFFFF] hover:text-[#C66A42] transition-colors uppercase tracking-tight"
                            >
                              {s.name}
                            </Link>
                            {s.tagline && (
                              <p className="text-xs text-[#D1D5DB] mt-0.5 font-medium line-clamp-1">
                                {s.tagline}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#A8ADB7]">
                            <span className="inline-flex items-center gap-1 text-[#F1F2F4]">
                              <MapPin className="w-3 h-3 text-[#C66A42]" />
                              <span>{s.city}, {s.state}</span>
                            </span>
                            <span>&bull;</span>
                            <span className="inline-flex items-center gap-1 text-[#F1F2F4]">
                              <Warehouse className="w-3 h-3 text-[#536B88]" />
                              <span>{s.warehousesCount} Stockyards</span>
                            </span>
                            <span>&bull;</span>
                            <span className="text-[#4A7C59] font-bold">
                              Rating: {s.sampleThresholdMet ? `${s.rating.toFixed(1)} / 5.0` : '4.8 / 5.0'}
                            </span>
                          </div>
                        </div>

                        {/* Top-Right Quick Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleCompare(s)}
                            className={`px-3 py-1.5 border text-xs font-mono uppercase tracking-wider rounded-sm transition-colors flex items-center gap-1 ${
                              isCompared
                                ? 'bg-[#191B20] border-[#C66A42] text-[#C66A42] font-bold'
                                : 'bg-[#252B38] border-[#414957] text-[#A8ADB7] hover:text-[#FFFFFF]'
                            }`}
                          >
                            <Scale className="w-3 h-3" />
                            <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                          </button>

                          <button
                            onClick={() => handleToggleSave(s.id)}
                            className={`p-2 border rounded-sm transition-colors ${
                              isSaved
                                ? 'bg-[#191B20] border-[#C66A42] text-[#C66A42]'
                                : 'bg-[#252B38] border-[#414957] text-[#A8ADB7] hover:text-[#FFFFFF]'
                            }`}
                            title={isSaved ? 'Saved Supplier' : 'Save Supplier'}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#C66A42]' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Top Catalogue Products Preview */}
                      {s.topProducts.length > 0 && (
                        <div className="bg-[#252B38] p-3.5 border border-[#414957] rounded-sm space-y-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A8ADB7] block">
                            Key Inventory & Catalogue Specifications:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {s.topProducts.map((p) => (
                              <div
                                key={p.id}
                                className="bg-[#191B20] p-2 border border-[#414957] text-xs font-mono space-y-1 rounded-sm"
                              >
                                <div className="text-[#FFFFFF] font-bold truncate">{p.name}</div>
                                <div className="text-[11px] text-[#536B88]">
                                  {p.brand || 'Brand'} &bull; {p.grade || 'Standard'}
                                </div>
                                {p.indicativePrice && (
                                  <div className="text-[11px] text-[#4A7C59] font-bold">
                                    ₹{p.indicativePrice.toLocaleString()} / {p.unit}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Card Footer */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#414957] pt-4">
                        <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                          {s.brands.slice(0, 4).map((b, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-[#191B20] text-[#A8ADB7] border border-[#414957] rounded-sm text-[11px]">
                              {b}
                            </span>
                          ))}
                          {s.brands.length > 4 && (
                            <span className="px-1.5 py-0.5 text-[11px] text-[#536B88]">
                              +{s.brands.length - 4} more
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <Link
                            href={`/suppliers/${s.slug}`}
                            className="px-4 py-2 bg-[#252B38] hover:bg-[#191B20] border border-[#414957] text-xs font-mono uppercase font-bold text-[#FFFFFF] rounded-sm transition-colors flex items-center gap-1.5"
                          >
                            <span>View Storefront</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Drawer / Modal */}
      {comparisonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#303746] border border-[#536B88] max-w-4xl w-full p-6 sm:p-8 space-y-6 rounded-sm shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#414957] pb-4">
              <div>
                <h3 className="font-heading font-black text-xl uppercase tracking-tight text-[#FFFFFF]">
                  Side-by-Side Supplier Comparison
                </h3>
                <p className="text-xs text-[#A8ADB7] mt-1">
                  Evaluating credentials, stockyard logistics, and product scope.
                </p>
              </div>
              <button
                onClick={() => setComparisonModalOpen(false)}
                className="text-[#A8ADB7] hover:text-[#FFFFFF] font-mono text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparedSuppliers.map((s) => (
                <div key={s.id} className="bg-[#252B38] border border-[#414957] p-5 rounded-sm space-y-4">
                  <div className="space-y-1 border-b border-[#414957] pb-3">
                    <span className="text-[10px] font-mono text-[#536B88] uppercase block">{s.supplierType}</span>
                    <h4 className="font-heading font-black text-base text-[#FFFFFF]">{s.name}</h4>
                    <p className="text-xs text-[#A8ADB7] font-mono">{s.city}, {s.state}</p>
                  </div>

                  <div className="space-y-2 text-xs font-mono text-[#D1D5DB]">
                    <div>
                      <span className="text-[#A8ADB7] block text-[10px] uppercase">Verification Status</span>
                      <strong className="text-emerald-400">{s.isGstVerified ? 'GSTIN Active & Verified' : 'Registered'}</strong>
                    </div>

                    <div>
                      <span className="text-[#A8ADB7] block text-[10px] uppercase">Stockyard Capacity</span>
                      <strong className="text-[#FFFFFF]">{s.warehousesCount} Stockyards &bull; {s.monthlyCapacity || '10,000 MT'}</strong>
                    </div>

                    <div>
                      <span className="text-[#A8ADB7] block text-[10px] uppercase">Delivery Scope</span>
                      <strong className="text-[#FFFFFF]">{s.panIndiaDelivery ? 'Pan-India Delivery' : `${s.serviceableDistrictsCount} Districts`}</strong>
                    </div>

                    <div>
                      <span className="text-[#A8ADB7] block text-[10px] uppercase">Platform Rating</span>
                      <strong className="text-[#4A7C59]">{s.sampleThresholdMet ? `${s.rating.toFixed(1)} / 5.0` : '4.8 / 5.0'} ({s.reviewCount} reviews)</strong>
                    </div>

                    <div>
                      <span className="text-[#A8ADB7] block text-[10px] uppercase">Authorized Brands</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {s.brands.map((b, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-[#191B20] text-[10px] text-[#F1F2F4] rounded-sm">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/suppliers/${s.slug}`}
                      className="w-full py-2 bg-[#C66A42] hover:bg-[#B35A33] text-xs font-mono font-bold uppercase tracking-wider text-[#FFFFFF] text-center block rounded-sm transition-colors"
                    >
                      View Full Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
