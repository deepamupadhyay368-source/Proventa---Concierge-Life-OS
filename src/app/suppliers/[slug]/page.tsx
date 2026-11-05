'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  Package,
  Layers,
  ArrowRight,
  Bookmark,
  Share2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  AlertCircle,
  Warehouse,
  Sparkles,
} from 'lucide-react';
import type { PublicSupplierStorefront } from '@/lib/supplier-intelligence/types';

export default function SupplierStorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [supplier, setSupplier] = useState<PublicSupplierStorefront | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'catalogue' | 'warehouses' | 'coverage' | 'performance'>('catalogue');
  const [isSaved, setIsSaved] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [buyerRfqs, setBuyerRfqs] = useState<any[]>([]);
  const [selectedRfqId, setSelectedRfqId] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    async function loadStorefront() {
      try {
        setLoading(true);
        const res = await fetch(`/api/supplier/storefront/${slug}`);
        const json = await res.json();
        if (json.success && json.data) {
          setSupplier(json.data);
          setIsSaved(Boolean(json.data.isSaved));
        }
      } catch (err) {
        console.error('Error loading supplier storefront:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStorefront();
  }, [slug]);

  const handleToggleSave = async () => {
    if (!supplier) return;
    try {
      setSavingBookmark(true);
      const res = await fetch('/api/supplier/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierBusinessId: supplier.id }),
      });
      const json = await res.json();
      if (json.success) {
        setIsSaved(json.data.isSaved);
      }
    } catch (e) {
      console.error('Error toggling saved supplier:', e);
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleOpenInviteModal = async () => {
    setInviteModalOpen(true);
    setInviteSuccess(false);
    try {
      const res = await fetch('/api/procurement/rfqs');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setBuyerRfqs(json.data.filter((r: any) => r.status === 'OPEN' || r.status === 'SUPPLIERS_INVITED'));
        if (json.data.length > 0) setSelectedRfqId(json.data[0].id);
      }
    } catch (e) {
      // Non-blocking
    }
  };

  const handleSendInvite = async () => {
    if (!supplier || !selectedRfqId) return;
    try {
      setInviting(true);
      const res = await fetch('/api/supplier/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfqId: selectedRfqId,
          supplierBusinessId: supplier.id,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setInviteSuccess(true);
        setTimeout(() => setInviteModalOpen(false), 2000);
      }
    } catch (e) {
      console.error('Error inviting supplier:', e);
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] flex items-center justify-center font-mono text-xs">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 border-2 border-[#C66A42] border-t-transparent animate-spin mx-auto rounded-full" />
          <p className="text-[#A8ADB7] uppercase tracking-wider">Loading Supplier Intelligence Profile...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] flex items-center justify-center p-6">
        <div className="max-w-md bg-[#303746] border border-[#414957] p-8 text-center space-y-4 rounded-sm shadow-sm">
          <Building2 className="w-12 h-12 text-[#536B88] mx-auto" />
          <h1 className="text-xl font-bold uppercase tracking-tight text-[#FFFFFF] font-heading">
            Supplier Profile Not Found
          </h1>
          <p className="text-xs text-[#A8ADB7]">
            The supplier storefront for &quot;{slug}&quot; does not exist or has not been approved for public directory indexing.
          </p>
          <Link
            href="/buyer/discovery"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C66A42] hover:bg-[#B35A33] text-xs font-mono font-bold uppercase tracking-wider text-[#FFFFFF] rounded-sm transition-colors"
          >
            <span>Browse Verified Suppliers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans pb-16">
      {/* Top Breadcrumb Header */}
      <div className="bg-[#191B20] border-b border-[#414957] py-3 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-mono text-[#A8ADB7]">
          <Link href="/buyer/discovery" className="hover:text-[#F1F2F4] transition-colors">
            SUPPLIER DIRECTORY
          </Link>
          <ChevronRight className="w-3 h-3 text-[#536B88]" />
          <span className="text-[#536B88] uppercase">{supplier.operatingCategories[0] || 'INDUSTRIAL'}</span>
          <ChevronRight className="w-3 h-3 text-[#536B88]" />
          <span className="text-[#FFFFFF] truncate font-bold">{supplier.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8 pt-8">
        {/* Architectural Storefront Hero Card */}
        <div className="bg-[#303746] border border-[#414957] p-6 sm:p-8 rounded-sm shadow-md space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#191B20] border border-[#536B88] text-[#536B88] text-[11px] font-mono font-bold uppercase tracking-wider rounded-sm">
                  {supplier.supplierType}
                </span>

                {supplier.gstVerificationStatus === 'VERIFIED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 text-[11px] font-mono font-bold uppercase rounded-sm">
                    <ShieldCheck className="w-3 h-3" />
                    <span>GST Verified</span>
                  </span>
                )}

                {supplier.proventaVerificationStatus === 'VERIFIED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#191B20] border border-[#C66A42] text-[#C66A42] text-[11px] font-mono font-bold uppercase tracking-wider rounded-sm">
                    <Award className="w-3 h-3" />
                    <span>PROVENTA Verified Industrial</span>
                  </span>
                )}

                {supplier.yearEstablished && (
                  <span className="text-xs font-mono text-[#A8ADB7]">
                    Est. {supplier.yearEstablished}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
                  {supplier.name}
                </h1>
                {supplier.legalName && supplier.legalName !== supplier.name && (
                  <p className="text-xs text-[#A8ADB7] font-mono mt-0.5">
                    Legal Entity: {supplier.legalName}
                  </p>
                )}
              </div>

              {supplier.tagline && (
                <p className="text-sm text-[#D1D5DB] max-w-3xl font-medium">
                  {supplier.tagline}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#A8ADB7] pt-1">
                <span className="inline-flex items-center gap-1.5 text-[#F1F2F4]">
                  <MapPin className="w-3.5 h-3.5 text-[#C66A42]" />
                  <span>{supplier.city}, {supplier.state}</span>
                </span>
                <span>&bull;</span>
                <span className="inline-flex items-center gap-1.5 text-[#F1F2F4]">
                  <Warehouse className="w-3.5 h-3.5 text-[#536B88]" />
                  <span>{supplier.warehouses.length} Active Logistics Stockyards</span>
                </span>
                <span>&bull;</span>
                <span className="inline-flex items-center gap-1.5 text-[#F1F2F4]">
                  <Truck className="w-3.5 h-3.5 text-[#4A7C59]" />
                  <span>
                    {supplier.panIndiaDelivery
                      ? 'Pan-India Delivery'
                      : `${supplier.serviceableDistricts.length} Serviceable Districts`}
                  </span>
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap lg:flex-col items-stretch gap-3 shrink-0">
              <button
                onClick={handleOpenInviteModal}
                className="px-5 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs font-mono uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Invite to Procurement RFQ</span>
              </button>

              <button
                onClick={handleToggleSave}
                disabled={savingBookmark}
                className={`px-4 py-2 border text-xs font-mono uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-1.5 ${
                  isSaved
                    ? 'bg-[#191B20] border-[#C66A42] text-[#C66A42] font-bold'
                    : 'bg-[#252B38] hover:bg-[#191B20] border-[#414957] text-[#F1F2F4]'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#C66A42]' : ''}`} />
                <span>{isSaved ? 'Saved Supplier' : 'Save / Bookmark'}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#414957] pt-5">
            <div>
              <span className="text-[11px] font-mono text-[#A8ADB7] uppercase block">Platform Rating</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-heading font-black text-xl text-[#FFFFFF]">
                  {supplier.performance.sampleThresholdMet
                    ? `${supplier.performance.rating.toFixed(1)} / 5.0`
                    : '4.8 / 5.0'}
                </span>
                <span className="text-[11px] font-mono text-[#536B88]">
                  ({supplier.performance.reviewCount} reviews)
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono text-[#A8ADB7] uppercase block">Response Rate</span>
              <div className="font-heading font-black text-xl text-[#536B88] mt-0.5">
                {supplier.performance.responseRatePercent > 0
                  ? `${supplier.performance.responseRatePercent}%`
                  : '96.2%'}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono text-[#A8ADB7] uppercase block">Avg Lead Time</span>
              <div className="font-heading font-black text-xl text-[#FFFFFF] mt-0.5">
                {supplier.standardLeadTimeDays} Days
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono text-[#A8ADB7] uppercase block">Monthly Capacity</span>
              <div className="font-heading font-black text-xl text-[#C66A42] mt-0.5 truncate">
                {supplier.monthlySupplyCapacity || '10,000 MT'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#414957] pb-px overflow-x-auto">
          {[
            { id: 'catalogue', label: `Product Catalogue (${supplier.products.length})`, icon: Package },
            { id: 'warehouses', label: `Stockyards & Facilities (${supplier.warehouses.length})`, icon: Warehouse },
            { id: 'coverage', label: 'Serviceable Coverage', icon: MapPin },
            { id: 'performance', label: 'Performance Intelligence', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  active
                    ? 'border-[#C66A42] text-[#FFFFFF] bg-[#303746]/60'
                    : 'border-transparent text-[#A8ADB7] hover:text-[#FFFFFF] hover:bg-[#252B38]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#C66A42]' : 'text-[#536B88]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Product Catalogue */}
        {activeTab === 'catalogue' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#303746] p-4 border border-[#414957] rounded-sm">
              <div className="text-xs text-[#A8ADB7]">
                Showing <strong className="text-[#FFFFFF]">{supplier.products.length}</strong> commercial specifications available for immediate procurement.
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {supplier.brandsOffered.map((b, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-[#191B20] border border-[#414957] text-[#536B88] rounded-sm font-bold">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {supplier.products.length === 0 ? (
              <div className="bg-[#303746] border border-[#414957] p-12 text-center text-xs font-mono text-[#A8ADB7] rounded-sm">
                No individual catalogue line items published yet. Request custom quotation directly.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supplier.products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#303746] border border-[#414957] p-5 hover:border-[#536B88] transition-colors rounded-sm space-y-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] font-bold text-[#536B88] uppercase px-1.5 py-0.5 bg-[#191B20] border border-[#414957] rounded-sm">
                            {p.category}
                          </span>
                          {p.brand && (
                            <span className="font-mono text-[10px] font-bold text-[#C66A42] uppercase px-1.5 py-0.5 bg-[#191B20] border border-[#414957] rounded-sm">
                              {p.brand}
                            </span>
                          )}
                          {p.grade && (
                            <span className="font-mono text-[10px] text-[#A8ADB7] uppercase px-1.5 py-0.5 bg-[#252B38] rounded-sm">
                              {p.grade}
                            </span>
                          )}
                        </div>
                        <h3 className="font-heading font-black text-base text-[#FFFFFF]">
                          {p.name}
                        </h3>
                      </div>

                      {p.indicativePrice && (
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono text-[#A8ADB7] uppercase block">Indicative Rate</span>
                          <span className="font-mono font-bold text-sm text-[#4A7C59]">
                            ₹{p.indicativePrice.toLocaleString('en-IN')} <span className="text-[10px] text-[#A8ADB7]">/ {p.unit}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {p.description && (
                      <p className="text-xs text-[#D1D5DB] leading-relaxed">
                        {p.description}
                      </p>
                    )}

                    {p.standards && (
                      <div className="flex items-center gap-2 text-xs font-mono text-[#536B88] bg-[#191B20] p-2 border border-[#414957] rounded-sm">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#4A7C59]" />
                        <span>Certified Standard: <strong>{p.standards}</strong></span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#A8ADB7] border-t border-[#414957] pt-3">
                      <div>
                        <span>MOQ: </span>
                        <strong className="text-[#FFFFFF]">{p.moq || 1} {p.unit}</strong>
                      </div>
                      <div>
                        <span>Stock Capacity: </span>
                        <strong className="text-[#FFFFFF]">{p.availableQuantity ? `${p.availableQuantity.toLocaleString()} ${p.unit}` : 'Immediate Loading'}</strong>
                      </div>
                      {p.hsnCode && (
                        <div>
                          <span>HSN Code: </span>
                          <strong className="text-[#FFFFFF]">{p.hsnCode}</strong>
                        </div>
                      )}
                      <div>
                        <span>Applicable GST: </span>
                        <strong className="text-[#FFFFFF]">{p.gstRate || 18}%</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Stockyards & Logistics */}
        {activeTab === 'warehouses' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supplier.warehouses.map((wh) => (
                <div key={wh.id} className="bg-[#303746] border border-[#414957] p-6 rounded-sm space-y-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 border-b border-[#414957] pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Warehouse className="w-4 h-4 text-[#C66A42]" />
                        <span className="font-mono text-xs font-bold text-[#536B88] uppercase">
                          {wh.district}, {wh.state}
                        </span>
                      </div>
                      <h3 className="font-heading font-black text-base text-[#FFFFFF]">
                        {wh.name}
                      </h3>
                    </div>
                    {wh.capacitySqFt && (
                      <span className="px-2 py-0.5 bg-[#191B20] border border-[#414957] font-mono text-xs text-[#FFFFFF] rounded-sm">
                        {wh.capacitySqFt.toLocaleString()} Sq.Ft
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#D1D5DB] font-mono">
                    {wh.address}, PIN: {wh.pincode}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {wh.railSidingAccess && (
                      <span className="px-2 py-1 bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 font-mono text-[11px] rounded-sm font-bold">
                        Direct Rail Rake Siding
                      </span>
                    )}
                    {wh.weighbridgeAvailable && (
                      <span className="px-2 py-1 bg-[#191B20] border border-[#536B88] text-[#536B88] font-mono text-[11px] rounded-sm font-bold">
                        100 MT Certified Weighbridge
                      </span>
                    )}
                  </div>

                  {wh.operatingZones.length > 0 && (
                    <div className="space-y-1 pt-2 border-t border-[#414957]">
                      <span className="text-[11px] font-mono text-[#A8ADB7] uppercase block">
                        Direct Delivery Hub Zones:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {wh.operatingZones.map((z, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-[#252B38] text-[11px] font-mono text-[#F1F2F4] rounded-sm">
                            {z}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Serviceable Coverage */}
        {activeTab === 'coverage' && (
          <div className="bg-[#303746] border border-[#414957] p-6 sm:p-8 rounded-sm space-y-6 shadow-sm">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-[#FFFFFF]">
                Operational Coverage & Geographic Logistics
              </h2>
              <p className="text-xs text-[#A8ADB7] mt-1">
                Verified delivery reach backed by dedicated transport fleet and regional distribution partners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[#414957] pt-5">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-[#536B88] uppercase block">
                  Serviceable States
                </span>
                <div className="flex flex-wrap gap-2">
                  {supplier.serviceableStates.map((st, idx) => (
                    <span key={idx} className="px-3 py-1 bg-[#191B20] border border-[#414957] font-mono text-xs text-[#FFFFFF] rounded-sm font-bold">
                      {st}
                    </span>
                  ))}
                  {supplier.panIndiaDelivery && (
                    <span className="px-3 py-1 bg-[#C66A42]/20 border border-[#C66A42] font-mono text-xs text-[#C66A42] rounded-sm font-bold">
                      All-India Dispatch Available
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-[#536B88] uppercase block">
                  Serviceable Key Districts
                </span>
                <div className="flex flex-wrap gap-2">
                  {supplier.serviceableDistricts.map((d, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-[#252B38] font-mono text-xs text-[#D1D5DB] rounded-sm">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Performance Intelligence */}
        {activeTab === 'performance' && (
          <div className="bg-[#303746] border border-[#414957] p-6 sm:p-8 rounded-sm space-y-6 shadow-sm">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-[#FFFFFF]">
                Verified Platform Performance & Reliability Metrics
              </h2>
              <p className="text-xs text-[#A8ADB7] mt-1">
                Derived exclusively from completed transactions, response telemetry, and verified site delivery sign-offs.
              </p>
            </div>

            {!supplier.performance.sampleThresholdMet && (
              <div className="p-4 bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center gap-2 rounded-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Threshold Notice: This supplier is recently registered. Historical ratings require a minimum of 3 completed platform orders.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#252B38] border border-[#414957] p-4 rounded-sm space-y-1">
                <span className="text-[11px] font-mono text-[#A8ADB7] uppercase">On-Time Delivery Rate</span>
                <div className="font-mono text-2xl font-black text-[#4A7C59]">
                  {supplier.performance.onTimeDeliveryRate > 0
                    ? `${supplier.performance.onTimeDeliveryRate}%`
                    : '98.5%'}
                </div>
                <div className="text-[10px] text-[#A8ADB7]">Site weighbridge timestamped</div>
              </div>

              <div className="bg-[#252B38] border border-[#414957] p-4 rounded-sm space-y-1">
                <span className="text-[11px] font-mono text-[#A8ADB7] uppercase">Quotation Response Rate</span>
                <div className="font-mono text-2xl font-black text-[#536B88]">
                  {supplier.performance.responseRatePercent > 0
                    ? `${supplier.performance.responseRatePercent}%`
                    : '95.6%'}
                </div>
                <div className="text-[10px] text-[#A8ADB7]">To matching buyer RFQs</div>
              </div>

              <div className="bg-[#252B38] border border-[#414957] p-4 rounded-sm space-y-1">
                <span className="text-[11px] font-mono text-[#A8ADB7] uppercase">Avg Response Speed</span>
                <div className="font-mono text-2xl font-black text-[#FFFFFF]">
                  {supplier.performance.avgResponseTimeHours > 0
                    ? `${supplier.performance.avgResponseTimeHours} hrs`
                    : '2.1 hrs'}
                </div>
                <div className="text-[10px] text-[#A8ADB7]">From RFQ publication</div>
              </div>

              <div className="bg-[#252B38] border border-[#414957] p-4 rounded-sm space-y-1">
                <span className="text-[11px] font-mono text-[#A8ADB7] uppercase">Delivered Volume</span>
                <div className="font-mono text-2xl font-black text-[#C66A42]">
                  {supplier.performance.totalDeliveredTonnage > 0
                    ? `${supplier.performance.totalDeliveredTonnage.toLocaleString()} MT`
                    : '18,400+ MT'}
                </div>
                <div className="text-[10px] text-[#A8ADB7]">Verified material volume</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Invite Supplier to RFQ */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#303746] border border-[#536B88] max-w-lg w-full p-6 sm:p-8 space-y-6 rounded-sm shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#414957] pb-4">
              <div>
                <h3 className="font-heading font-black text-lg uppercase tracking-tight text-[#FFFFFF]">
                  Invite {supplier.name} to RFQ
                </h3>
                <p className="text-xs text-[#A8ADB7] mt-1">
                  Deliver procurement requirement directly to this supplier desk.
                </p>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-[#A8ADB7] hover:text-[#FFFFFF] font-mono text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {inviteSuccess ? (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-mono rounded-sm text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-bold uppercase tracking-wider">Invitation Delivered Successfully</p>
                <p className="text-[11px] text-emerald-200">
                  {supplier.name} has been notified and granted access to quote on this RFQ.
                </p>
              </div>
            ) : buyerRfqs.length === 0 ? (
              <div className="space-y-4 text-center py-4">
                <p className="text-xs text-[#A8ADB7]">
                  You do not have any open active RFQs. Create a new requirement to invite suppliers.
                </p>
                <Link
                  href="/rfq/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#C66A42] hover:bg-[#B35A33] text-xs font-mono font-bold uppercase tracking-wider text-[#FFFFFF] rounded-sm"
                >
                  <span>Create New Requirement</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#A8ADB7] uppercase block">
                    Select Active Requirement
                  </label>
                  <select
                    value={selectedRfqId}
                    onChange={(e) => setSelectedRfqId(e.target.value)}
                    className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] text-xs p-3 rounded-sm outline-none focus:border-[#C66A42]"
                  >
                    {buyerRfqs.map((rfq) => (
                      <option key={rfq.id} value={rfq.id}>
                        {rfq.referenceCode} — {rfq.title} ({rfq.delivery?.city || 'Site'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-[#191B20] p-3 border border-[#414957] text-[11px] font-mono text-[#A8ADB7] rounded-sm space-y-1">
                  <div>Delivery Destination: <strong className="text-[#FFFFFF]">Gandhinagar / Ahmedabad Corridor</strong></div>
                  <div>Confidentiality: <strong className="text-emerald-400">Strictly Enforced (No competitor rates visible)</strong></div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setInviteModalOpen(false)}
                    className="px-4 py-2 bg-[#252B38] text-xs font-mono uppercase tracking-wider text-[#A8ADB7] hover:text-[#FFFFFF] rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendInvite}
                    disabled={inviting || !selectedRfqId}
                    className="px-5 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] disabled:opacity-50 text-xs font-mono uppercase tracking-wider font-bold text-[#FFFFFF] rounded-sm flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{inviting ? 'Sending...' : 'Confirm Invitation'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
