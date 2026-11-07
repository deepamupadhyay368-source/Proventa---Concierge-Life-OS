'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Building2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { CONSTRUCTION_UNITS, type ConstructionUnit } from '@/lib/brand';

interface MaterialItemInput {
  categorySlug: string;
  categoryName: string;
  materialName: string;
  gradeOrSpec: string;
  brandPreference: string;
  quantity: number;
  unit: ConstructionUnit;
  itemNotes: string;
}

const CATEGORY_OPTIONS = [
  { slug: 'building-materials', name: 'Building Materials (Cement, TMT Steel, Sand, Blocks)' },
  { slug: 'electrical', name: 'Electrical Supplies (Wires, Cables, Switches, Panels)' },
  { slug: 'plumbing', name: 'Plumbing & Water Systems (Pipes, Pumps, Tanks, Sanitary)' },
  { slug: 'tiles-flooring', name: 'Tiles & Flooring (Vitrified, Marble, Granite, Pavers)' },
  { slug: 'finishing-materials', name: 'Finishing & Chemicals (Paint, Waterproofing, Putty)' },
  { slug: 'doors-windows', name: 'Doors, Windows & Hardware (Aluminium, UPVC, Locks)' },
];

function RfqCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState('');
  const [buyerRole, setBuyerRole] = useState<'CONTRACTOR' | 'BUILDER' | 'INDIVIDUAL_BUYER' | 'CONSTRUCTION_COMPANY'>('CONTRACTOR');
  const [projectType, setProjectType] = useState<'RESIDENTIAL' | 'COMMERCIAL' | 'INFRASTRUCTURE' | 'INDUSTRIAL' | 'RENOVATION'>('RESIDENTIAL');
  const [urgency, setUrgency] = useState<'STANDARD' | 'URGENT' | 'FLEXIBLE'>('STANDARD');
  const [requiredDate, setRequiredDate] = useState('');

  // Delivery Details (Ahmedabad default)
  const [siteName, setSiteName] = useState('Construction Project Site');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [state, setState] = useState('Gujarat');
  const [pincode, setPincode] = useState('380060');
  const [siteContactPerson, setSiteContactPerson] = useState('');
  const [siteContactPhone, setSiteContactPhone] = useState('');
  const [buyerBusinessId, setBuyerBusinessId] = useState<string>('');
  const [vehicleAccessibility, setVehicleAccessibility] = useState<'10-Wheeler Truck' | 'Tata Ace / Small Truck' | 'Transit Mixer (RMC)' | 'Trailer Accessible' | 'Standard Access'>('10-Wheeler Truck');
  const [siteAccessNotes, setSiteAccessNotes] = useState('');

  // AI Prompt Helper
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  // Items List
  const [items, setItems] = useState<MaterialItemInput[]>([
    {
      categorySlug: 'building-materials',
      categoryName: 'Building Materials',
      materialName: 'TMT Steel Rebars Fe 550D (16mm)',
      gradeOrSpec: 'Fe 550D Primary Producer Grade',
      brandPreference: 'Tata Tiscon or Jindal Panther',
      quantity: 25,
      unit: 'Metric tonnes (MT)',
      itemNotes: 'Factory test certs required',
    },
    {
      categorySlug: 'building-materials',
      categoryName: 'Building Materials',
      materialName: '53 Grade Ordinary Portland Cement (OPC)',
      gradeOrSpec: 'IS 269:2015 Fresh 50kg Bags',
      brandPreference: 'UltraTech or Ambuja',
      quantity: 600,
      unit: 'Bags',
      itemNotes: 'Direct dispatch to site warehouse',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prompt = searchParams.get('prompt');
    const cat = searchParams.get('category');
    if (cat) {
      const match = CATEGORY_OPTIONS.find((c) => c.slug === cat);
      if (match) {
        setItems((prev) => [
          {
            ...prev[0],
            categorySlug: match.slug,
            categoryName: match.name.split(' (')[0],
          },
        ]);
      }
    }
    if (prompt) {
      setAiPrompt(decodeURIComponent(prompt));
      handleAiParse(decodeURIComponent(prompt));
    }

    // Dynamic buyer business profile hydration
    fetch('/api/business/profile')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          if (json.data.business?.id) {
            setBuyerBusinessId(json.data.business.id);
          }
          if (json.data.business?.city) {
            setCity((prev) => prev || json.data.business.city);
          }
          if (json.data.business?.addressLine1) {
            setAddressLine((prev) => prev || json.data.business.addressLine1);
          }
          if (json.data.business?.pincode) {
            setPincode((prev) => prev || json.data.business.pincode);
          }
          if (json.data.business?.contactPhone) {
            setSiteContactPhone((prev) => prev || json.data.business.contactPhone);
          }
          if (json.data.user?.name) {
            setSiteContactPerson((prev) => prev || json.data.user.name);
          }
        }
      })
      .catch(() => {});
  }, [searchParams]);

  const handleAiParse = async (customPrompt?: string) => {
    const textToParse = customPrompt || aiPrompt;
    if (!textToParse.trim()) return;

    setAiParsing(true);
    setAiMessage('');
    try {
      const res = await fetch('/api/procurement/ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToParse }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const parsed = json.data;
        if (parsed.items && parsed.items.length > 0) {
          setItems(parsed.items);
        }
        if (parsed.title) setTitle(parsed.title);
        if (parsed.location?.city) setCity(parsed.location.city);
        if (parsed.location?.siteName) setSiteName(parsed.location.siteName);
        if (parsed.location?.addressLine) setAddressLine(parsed.location.addressLine);
        setAiMessage(`✓ Parsed ${parsed.items?.length || 0} items successfully.`);
      }
    } catch (err: any) {
      setAiMessage('Could not auto-parse note. Please enter manually.');
    } finally {
      setAiParsing(false);
    }
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        categorySlug: 'building-materials',
        categoryName: 'Building Materials',
        materialName: '',
        gradeOrSpec: '',
        brandPreference: '',
        quantity: 10,
        unit: 'Metric tonnes (MT)',
        itemNotes: '',
      },
    ]);
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof MaterialItemInput, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      if (field === 'categorySlug') {
        const opt = CATEGORY_OPTIONS.find((c) => c.slug === value);
        if (opt) copy[idx].categoryName = opt.name.split(' (')[0];
      }
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Please add at least one material item.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        buyerBusinessId: buyerBusinessId || undefined,
        buyerRole,
        title,
        projectType,
        items,
        delivery: {
          siteName: siteName || 'Construction Project Site',
          addressLine,
          city,
          state,
          pincode,
          siteContactPerson: siteContactPerson || 'Site Engineer',
          siteContactPhone,
          siteAccessNotes,
          vehicleAccessibility,
        },
        requiredDeliveryDate: requiredDate || new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
        urgency,
        boqAttachments: [
          {
            fileName: 'Material_Schedule_BOQ.pdf',
            fileUrl: '/documents/boq/Material_Schedule_BOQ.pdf',
            fileSizeMb: 1.8,
          },
        ],
      };

      const res = await fetch('/api/procurement/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to create requirement');
      }

      const createdRfq = json.data;
      router.push(`/buyer/rfqs/${createdRfq.id}/compare`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating RFQ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-10">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#A8ADB7]">
          <Link href="/" className="hover:text-[#FFFFFF]">PROVENTA</Link>
          <span>/</span>
          <Link href="/buyer/dashboard" className="hover:text-[#FFFFFF]">Buyer Portal</Link>
          <span>/</span>
          <span className="text-[#536B88] font-bold">New Requirement (RFQ)</span>
        </div>

        {/* Page Title & Tagline */}
        <div className="space-y-2 border-b border-[#414957] pb-6 bg-[#303746] p-6 sm:p-8 border shadow-sm rounded-sm">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#191B20] border border-[#414957] text-[11px] font-mono text-[#536B88] font-bold rounded-sm">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>STEP 1 · CREATE REQUIREMENT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
            Post Material Requirement (RFQ)
          </h1>
          <p className="text-sm text-[#A8ADB7]">
            Specify multiple materials, standard units of measurement, delivery location in Gujarat, and receive competitive quotations from verified suppliers.
          </p>
        </div>

        {/* AI Assistant Extraction Box */}
        <div className="bg-[#303746] border border-[#414957] p-6 space-y-4 shadow-sm rounded-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#536B88]" />
              <span className="font-heading font-bold text-sm uppercase tracking-wider text-[#FFFFFF]">
                Natural Language BOQ Extractor
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#A8ADB7]">Auto-Parses Quantities & Units</span>
          </div>
          <p className="text-xs text-[#A8ADB7]">
            Paste your site engineer&apos;s note or material schedule below. The assistant extracts items, quantities, standard units, and delivery location automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Need 40 MT Tata Tiscon Fe 550D TMT steel and 1000 bags UltraTech 53G cement delivered to South Bopal, Ahmedabad"
              className="flex-1 bg-[#191B20] border border-[#414957] text-[#FFFFFF] px-4 py-2.5 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
            />
            <button
              type="button"
              onClick={() => handleAiParse()}
              disabled={aiParsing || !aiPrompt.trim()}
              className="px-5 py-2.5 bg-[#536B88] hover:bg-[#435770] disabled:opacity-50 text-[#FFFFFF] text-xs font-bold uppercase tracking-wider transition-colors shrink-0 rounded-sm"
            >
              {aiParsing ? 'Extracting...' : 'Parse Items'}
            </button>
          </div>
          {aiMessage && (
            <div className="text-xs font-mono text-[#536B88]">{aiMessage}</div>
          )}
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-[#252B38] border border-[#D9534F] text-[#D9534F] text-xs font-mono flex items-center gap-2 rounded-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Project Details */}
          <div className="bg-[#303746] border border-[#414957] p-6 space-y-5 shadow-sm rounded-sm">
            <h2 className="font-heading font-bold text-base uppercase text-[#FFFFFF] border-b border-[#414957] pb-3">
              1. Project Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                  Requirement Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Foundation Structural Steel & Cement Supply - Phase 1"
                  className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                  Buyer Profile
                </label>
                <select
                  value={buyerRole}
                  onChange={(e: any) => setBuyerRole(e.target.value)}
                  className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                >
                  <option value="CONTRACTOR">Civil Contractor</option>
                  <option value="BUILDER">Builder / Developer</option>
                  <option value="CONSTRUCTION_COMPANY">Construction Company</option>
                  <option value="INDIVIDUAL_BUYER">Individual Home Builder</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                  Project Type
                </label>
                <select
                  value={projectType}
                  onChange={(e: any) => setProjectType(e.target.value)}
                  className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                >
                  <option value="RESIDENTIAL">Residential Construction</option>
                  <option value="COMMERCIAL">Commercial Development</option>
                  <option value="INFRASTRUCTURE">Infrastructure & Roadworks</option>
                  <option value="INDUSTRIAL">Industrial Warehouse / Plant</option>
                  <option value="RENOVATION">Renovation / Retrofitting</option>
                </select>
              </div>
            </div>
          </div>

          {/* Material Items List */}
          <div className="bg-[#303746] border border-[#414957] p-6 space-y-5 shadow-sm rounded-sm">
            <div className="flex items-center justify-between border-b border-[#414957] pb-3">
              <h2 className="font-heading font-bold text-base uppercase text-[#FFFFFF]">
                2. Material Items ({items.length})
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#252B38] hover:bg-[#191B20] text-[#FFFFFF] border border-[#414957] text-xs font-mono font-bold uppercase transition-colors rounded-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-4">
              {items.map((it, idx) => (
                <div key={idx} className="p-4 bg-[#252B38] border border-[#414957] space-y-3 rounded-sm">
                  <div className="flex items-center justify-between text-xs font-mono text-[#A8ADB7]">
                    <span className="font-bold text-[#536B88]">ITEM #{idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-[#D9534F] hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1">
                        Category
                      </label>
                      <select
                        value={it.categorySlug}
                        onChange={(e) => updateItem(idx, 'categorySlug', e.target.value)}
                        className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] px-2.5 py-2 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c.slug} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1">
                        Material Name & Diameter/Grade *
                      </label>
                      <input
                        type="text"
                        required
                        value={it.materialName}
                        onChange={(e) => updateItem(idx, 'materialName', e.target.value)}
                        placeholder="e.g. TMT Steel Rebars 16mm Fe 550D"
                        className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] px-2.5 py-2 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={it.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                        className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] px-2.5 py-2 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1">
                        Procurement Unit *
                      </label>
                      <select
                        value={it.unit}
                        onChange={(e: any) => updateItem(idx, 'unit', e.target.value)}
                        className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] px-2.5 py-2 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                      >
                        {CONSTRUCTION_UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1">
                        Preferred Brand
                      </label>
                      <input
                        type="text"
                        value={it.brandPreference}
                        onChange={(e) => updateItem(idx, 'brandPreference', e.target.value)}
                        placeholder="e.g. Tata Tiscon / UltraTech"
                        className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] px-2.5 py-2 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Site Address */}
          <div className="bg-[#303746] border border-[#414957] p-6 space-y-5 shadow-sm rounded-sm">
            <h2 className="font-heading font-bold text-base uppercase text-[#FFFFFF] border-b border-[#414957] pb-3">
              3. Delivery & Site Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                  Site Name & Project *
                </label>
                <input
                  type="text"
                  required
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g. Skylark Heights Phase 2"
                  className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                  City (Gujarat)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                  Street Address Line
                </label>
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. Near SP Ring Road, South Bopal"
                  className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                  Pincode
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                  Site Contact Person
                </label>
                <input
                  type="text"
                  value={siteContactPerson}
                  onChange={(e) => setSiteContactPerson(e.target.value)}
                  placeholder="e.g. Ramesh Patel (Site Engineer)"
                  className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={siteContactPhone}
                  onChange={(e) => setSiteContactPhone(e.target.value)}
                  placeholder="+91 98250 12345"
                  className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                  Vehicle Accessibility
                </label>
                <select
                  value={vehicleAccessibility}
                  onChange={(e: any) => setVehicleAccessibility(e.target.value)}
                  className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                >
                  <option value="10-Wheeler Truck">10-Wheeler Heavy Truck</option>
                  <option value="Tata Ace / Small Truck">Tata Ace / Small Truck (Narrow Lane)</option>
                  <option value="Transit Mixer (RMC)">Transit Mixer (RMC)</option>
                  <option value="Trailer Accessible">Heavy 16/22-Wheeler Trailer</option>
                  <option value="Standard Access">Standard City Access</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link
              href="/buyer/dashboard"
              className="px-6 py-3 bg-[#252B38] border border-[#414957] hover:bg-[#191B20] text-[#F1F2F4] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#C66A42] hover:bg-[#B35A33] disabled:opacity-50 text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm rounded-sm"
            >
              <span>{loading ? 'Broadcasting RFQ...' : 'Submit Requirement & Invite Bids'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RfqCreatePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-mono text-[#A8ADB7]">Loading RFQ Composer...</div>}>
      <RfqCreateForm />
    </Suspense>
  );
}
