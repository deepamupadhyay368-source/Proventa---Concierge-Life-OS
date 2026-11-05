'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  FileText,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
  Edit3,
  Save,
  Truck,
  ShoppingCart,
  Layers,
  ArrowRight,
  Upload,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { PublicNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

export default function BusinessProfileSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tax' | 'contacts' | 'locations' | 'documents' | 'audit'>('overview');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit states for overview
  const [editName, setEditName] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPostalCode, setEditPostalCode] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/business/profile');
        if (res.status === 401) {
          router.push('/sign-in?callbackUrl=/settings/business-profile');
          return;
        }
        const json = await res.json();
        if (json.success && json.data?.business) {
          const b = json.data.business;
          setBusiness(b);
          setEditName(b.name || '');
          setEditTagline(b.tagline || '');
          setEditDescription(b.description || '');
          setEditWebsite(b.website || '');
          setEditAddress(b.addressLine1 || '');
          setEditCity(b.city || '');
          setEditPostalCode(b.postalCode || '');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  const handleSaveOverview = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/business/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          tagline: editTagline,
          description: editDescription,
          website: editWebsite,
          addressLine1: editAddress,
          city: editCity,
          postalCode: editPostalCode,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to update');
      setBusiness(json.data);
      setStatusMsg({ type: 'success', text: 'Business details updated successfully.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleWorkspaceSwitch = async (target: 'BUYER' | 'SUPPLIER') => {
    try {
      const res = await fetch('/api/business/workspace-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace: target }),
      });
      const json = await res.json();
      if (json.success && json.redirectUrl) {
        router.push(json.redirectUrl);
      }
    } catch (err) {
      console.error('Failed to switch workspace:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#C66A42] border-t-transparent animate-spin rounded-full" />
          <span className="font-mono text-xs uppercase tracking-wider text-[#A8ADB7]">
            Loading Business Profile...
          </span>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans flex flex-col">
        <PublicNav />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-[#303746] border border-[#414957] p-8 max-w-md w-full text-center space-y-4 rounded-sm">
            <Building2 className="w-12 h-12 text-[#C66A42] mx-auto" />
            <h2 className="text-lg font-bold uppercase tracking-wider text-[#FFFFFF]">No Business Entity Found</h2>
            <p className="text-xs text-[#A8ADB7]">
              You have not registered a certified business profile on PROVENTA yet.
            </p>
            <Link
              href="/onboarding/business"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-sm"
            >
              <span>Start Business Onboarding</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <MarketingFooter />
      </div>
    );
  }

  const status = business.verificationStatus || 'DRAFT';
  const role = business.platformRole || 'BUYER';

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans flex flex-col">
      <PublicNav />

      {/* Enterprise Header Bar */}
      <div className="border-b border-[#414957] bg-[#191B20] py-6 sm:py-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#536B88] font-bold uppercase tracking-wider">
                PROVENTA CERTIFIED BUSINESS PROFILE
              </span>
              <span className="text-[#414957]">|</span>
              <span className="font-mono text-xs text-[#A8ADB7]">ID: {business.id.substring(0, 12)}...</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-[#FFFFFF] font-heading">
                {business.name}
              </h1>
              {/* Verification badge */}
              {status === 'VERIFIED' ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 text-xs font-mono font-bold uppercase rounded-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>PROVENTA Verified</span>
                </div>
              ) : status === 'UNDER_REVIEW' || status === 'SUBMITTED' ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/80 border border-amber-500/60 text-amber-400 text-xs font-mono font-bold uppercase rounded-sm">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Verification Under Review</span>
                </div>
              ) : status === 'REJECTED' ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/80 border border-red-500/60 text-red-400 text-xs font-mono font-bold uppercase rounded-sm">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Verification Rejected</span>
                </div>
              ) : (
                <Link
                  href="/onboarding/business"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#252B38] border border-[#C66A42] text-[#C66A42] hover:bg-[#C66A42] hover:text-[#FFFFFF] text-xs font-mono font-bold uppercase rounded-sm transition-colors"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Complete Onboarding</span>
                </Link>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#A8ADB7]">
              Legal Name: <strong className="text-[#F1F2F4]">{business.legalName || business.name}</strong> &bull; GSTIN:{' '}
              <span className="font-mono text-[#F1F2F4]">{business.gstNumber || 'Not configured'}</span> &bull; PAN:{' '}
              <span className="font-mono text-[#F1F2F4]">{business.pan || 'Not configured'}</span>
            </p>
          </div>

          {/* Quick Workspace Switcher Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {role === 'BOTH' && (
              <div className="bg-[#252B38] border border-[#414957] p-2 rounded-sm flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#A8ADB7] uppercase px-1">Workspace:</span>
                <button
                  type="button"
                  onClick={() => handleWorkspaceSwitch('BUYER')}
                  className="px-3 py-1.5 bg-[#191B20] hover:bg-[#303746] border border-[#414957] hover:border-[#536B88] text-xs font-mono uppercase text-[#FFFFFF] rounded-sm transition-colors flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-[#C66A42]" />
                  <span>Buyer Desk</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleWorkspaceSwitch('SUPPLIER')}
                  className="px-3 py-1.5 bg-[#191B20] hover:bg-[#303746] border border-[#414957] hover:border-[#536B88] text-xs font-mono uppercase text-[#FFFFFF] rounded-sm transition-colors flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5 text-[#536B88]" />
                  <span>Supplier Portal</span>
                </button>
              </div>
            )}
            {role === 'BUYER' && (
              <Link
                href="/buyer/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-sm"
              >
                <span>Open Buyer Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            {role === 'SUPPLIER' && (
              <Link
                href="/supplier/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#536B88] hover:bg-[#435770] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-sm"
              >
                <span>Open Supplier Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-8 py-8">
        {statusMsg && (
          <div
            className={`mb-6 p-4 rounded-sm border text-xs sm:text-sm flex items-center gap-3 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                : 'bg-red-950/40 border-red-500/60 text-red-200'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-[#414957] mb-8 overflow-x-auto gap-2">
          {[
            { id: 'overview', label: 'Identity & Overview', icon: Building2 },
            { id: 'tax', label: 'Tax & Compliance', icon: FileText },
            { id: 'contacts', label: 'Authorized Signatories', icon: Users },
            { id: 'locations', label: 'Yards & Sites', icon: MapPin },
            { id: 'documents', label: 'Attached Documents', icon: ShieldCheck },
            { id: 'audit', label: 'Audit Trail', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider font-bold border-b-2 font-mono whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#C66A42] text-[#FFFFFF] bg-[#303746]/50'
                    : 'border-transparent text-[#A8ADB7] hover:text-[#FFFFFF]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C66A42]' : 'text-[#536B88]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & IDENTITY */}
        {activeTab === 'overview' && (
          <div className="bg-[#303746] border border-[#414957] p-6 sm:p-8 rounded-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#414957] pb-4">
              <div>
                <h2 className="text-base font-bold uppercase tracking-wider text-[#FFFFFF]">Business Identity Details</h2>
                <p className="text-xs text-[#A8ADB7]">Update visible company branding, description, and registered address.</p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveOverview}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase font-mono rounded-sm transition-colors shadow-sm disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">Trade Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#252B38] border border-[#414957] px-3.5 py-2 text-sm text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">Company Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Reliable Infrastructure Supplies Across Gujarat"
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  className="w-full bg-[#252B38] border border-[#414957] px-3.5 py-2 text-sm text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">Company Profile & Description</label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-[#252B38] border border-[#414957] p-3 text-sm text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">Registered Office Address</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full bg-[#252B38] border border-[#414957] px-3.5 py-2 text-sm text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">City</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full bg-[#252B38] border border-[#414957] px-3.5 py-2 text-sm text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">Postal Code</label>
                <input
                  type="text"
                  value={editPostalCode}
                  onChange={(e) => setEditPostalCode(e.target.value)}
                  className="w-full bg-[#252B38] border border-[#414957] px-3.5 py-2 text-sm text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42] font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TAX & COMPLIANCE */}
        {activeTab === 'tax' && (
          <div className="bg-[#303746] border border-[#414957] p-6 sm:p-8 rounded-sm space-y-6">
            <div className="border-b border-[#414957] pb-4">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#FFFFFF]">Verified Tax & Corporate Identifiers</h2>
              <p className="text-xs text-[#A8ADB7]">These credentials are bound to your verified legal entity and cannot be edited without compliance re-verification.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#252B38] p-4 rounded-sm border border-[#414957]">
                <span className="block text-[11px] font-mono uppercase text-[#536B88] font-bold">Goods & Services Tax (GSTIN)</span>
                <span className="block text-lg font-mono font-bold text-[#FFFFFF] mt-1">{business.gstNumber || 'Not Configured'}</span>
                <span className="inline-block mt-2 text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-sm border border-emerald-800">
                  Verified Format
                </span>
              </div>

              <div className="bg-[#252B38] p-4 rounded-sm border border-[#414957]">
                <span className="block text-[11px] font-mono uppercase text-[#536B88] font-bold">Permanent Account Number (PAN)</span>
                <span className="block text-lg font-mono font-bold text-[#FFFFFF] mt-1">{business.pan || 'Not Configured'}</span>
                <span className="inline-block mt-2 text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-sm border border-emerald-800">
                  Entity Verified
                </span>
              </div>

              {business.cin && (
                <div className="bg-[#252B38] p-4 rounded-sm border border-[#414957]">
                  <span className="block text-[11px] font-mono uppercase text-[#536B88] font-bold">Corporate ID Number (CIN)</span>
                  <span className="block text-base font-mono font-bold text-[#FFFFFF] mt-1">{business.cin}</span>
                  <span className="text-xs text-[#A8ADB7] mt-1 block">Ministry of Corporate Affairs, India</span>
                </div>
              )}

              {business.udyamNumber && (
                <div className="bg-[#252B38] p-4 rounded-sm border border-[#414957]">
                  <span className="block text-[11px] font-mono uppercase text-[#536B88] font-bold">Udyam Registration (MSME)</span>
                  <span className="block text-base font-mono font-bold text-[#FFFFFF] mt-1">{business.udyamNumber}</span>
                  <span className="text-xs text-[#A8ADB7] mt-1 block">Ministry of Micro, Small & Medium Enterprises</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: AUTHORIZED CONTACTS */}
        {activeTab === 'contacts' && (
          <div className="bg-[#303746] border border-[#414957] p-6 sm:p-8 rounded-sm space-y-6">
            <div className="border-b border-[#414957] pb-4">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#FFFFFF]">Authorized Business Personnel</h2>
              <p className="text-xs text-[#A8ADB7]">Authorized contacts empowered to issue RFQs, accept quotes, and sign delivery receipts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.isArray(business.authorizedContacts) && business.authorizedContacts.length > 0 ? (
                business.authorizedContacts.map((c: any, i: number) => (
                  <div key={i} className="bg-[#252B38] p-4 rounded-sm border border-[#414957] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#FFFFFF]">{c.name}</span>
                      {c.isPrimary && (
                        <span className="text-[10px] font-mono uppercase bg-[#C66A42]/20 text-[#C66A42] px-2 py-0.5 rounded-sm border border-[#C66A42]/40 font-bold">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-[#536B88] font-bold uppercase">{c.designation}</div>
                    <div className="text-xs text-[#A8ADB7] flex items-center gap-2 pt-2 border-t border-[#414957]/50">
                      <Mail className="w-3.5 h-3.5 text-[#536B88]" />
                      <span>{c.email}</span>
                    </div>
                    <div className="text-xs text-[#A8ADB7] flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#536B88]" />
                      <span>{c.phone}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-[#252B38] border border-[#414957] rounded-sm text-xs text-[#A8ADB7]">
                  No additional contacts recorded. Primary account holder is designated contact.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: YARDS & SITES */}
        {activeTab === 'locations' && (
          <div className="bg-[#303746] border border-[#414957] p-6 sm:p-8 rounded-sm space-y-6">
            <div className="border-b border-[#414957] pb-4">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#FFFFFF]">Operational Yards & Delivery Points</h2>
              <p className="text-xs text-[#A8ADB7]">Direct delivery locations, site engineer contacts, and stockyard warehouses.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#252B38] p-5 rounded-sm border border-[#414957] space-y-2">
                <span className="text-xs font-mono uppercase text-[#C66A42] font-bold">Registered Office</span>
                <p className="text-sm font-bold text-[#FFFFFF]">{business.addressLine1 || 'Main Office'}</p>
                <p className="text-xs text-[#A8ADB7]">
                  {business.city}, {business.state} — {business.postalCode}
                </p>
              </div>

              {business.buyerProfile?.projectLocations && (
                <div className="bg-[#252B38] p-5 rounded-sm border border-[#414957] space-y-2">
                  <span className="text-xs font-mono uppercase text-[#536B88] font-bold">Active Project Site</span>
                  <p className="text-sm font-bold text-[#FFFFFF]">GIFT City Commercial Tower Phase 2</p>
                  <p className="text-xs text-[#A8ADB7]">Block 12, GIFT SEZ, Gandhinagar, Gujarat</p>
                </div>
              )}

              {business.supplierProfile?.warehouseLocations && (
                <div className="bg-[#252B38] p-5 rounded-sm border border-[#414957] space-y-2">
                  <span className="text-xs font-mono uppercase text-[#536B88] font-bold">Primary Yard / Warehouse</span>
                  <p className="text-sm font-bold text-[#FFFFFF]">Changodar Industrial Stockyard</p>
                  <p className="text-xs text-[#A8ADB7]">Survey 108, Sarkhej-Bavla Road, Changodar, Ahmedabad</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: ATTACHED DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="bg-[#303746] border border-[#414957] p-6 sm:p-8 rounded-sm space-y-6">
            <div className="border-b border-[#414957] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold uppercase tracking-wider text-[#FFFFFF]">Attached Compliance Documents</h2>
                <p className="text-xs text-[#A8ADB7]">Documents verified by PROVENTA compliance analysts.</p>
              </div>
              <Link
                href="/onboarding/business"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#252B38] border border-[#414957] hover:border-[#536B88] text-xs font-mono uppercase text-[#FFFFFF] rounded-sm transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-[#C66A42]" />
                <span>Upload Additional Document</span>
              </Link>
            </div>

            <div className="space-y-3">
              {Array.isArray(business.documents) && business.documents.length > 0 ? (
                business.documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#252B38] border border-[#414957] rounded-sm"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#536B88]" />
                      <div>
                        <span className="text-sm font-bold text-[#FFFFFF] block">{doc.fileName}</span>
                        <span className="text-[11px] font-mono text-[#A8ADB7] uppercase">
                          {doc.documentType} &bull; Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono uppercase px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-sm">
                        {doc.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-[#252B38] border border-[#414957] rounded-sm text-xs text-[#A8ADB7]">
                  No verification documents attached yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-[#303746] border border-[#414957] p-6 sm:p-8 rounded-sm space-y-6">
            <div className="border-b border-[#414957] pb-4">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#FFFFFF]">Enterprise Audit Log</h2>
              <p className="text-xs text-[#A8ADB7]">Tamper-evident record of all status changes, approvals, and profile updates.</p>
            </div>

            <div className="space-y-3">
              {Array.isArray(business.businessAuditLogs) && business.businessAuditLogs.length > 0 ? (
                business.businessAuditLogs.map((log: any) => (
                  <div key={log.id} className="p-3 bg-[#252B38] border border-[#414957] rounded-sm text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[#536B88] font-bold uppercase">{log.action}</span>
                      <span className="font-mono text-[11px] text-[#A8ADB7]">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[#F1F2F4]">{log.details}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-[#252B38] border border-[#414957] rounded-sm text-xs text-[#A8ADB7]">
                  No audit logs recorded yet.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <MarketingFooter />
    </div>
  );
}
