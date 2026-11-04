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
        if (json.data.title) setTitle(json.data.title);
        if (json.data.projectType) setProjectType(json.data.projectType);
        if (json.data.urgency) setUrgency(json.data.urgency);
        if (json.data.items && json.data.items.length > 0) {
          setItems(json.data.items);
        }
        if (json.data.delivery) {
          if (json.data.delivery.siteName) setSiteName(json.data.delivery.siteName);
          if (json.data.delivery.addressLine) setAddressLine(json.data.delivery.addressLine);
          if (json.data.delivery.city) setCity(json.data.delivery.city);
        }
        setAiMessage('Requirement details extracted successfully.');
      }
    } catch (err: any) {
      setAiMessage('Could not parse natural language text automatically.');
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
        unit: 'Bags',
        itemNotes: '',
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateItem = (index: number, field: keyof MaterialItemInput, val: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      if (field === 'categorySlug') {
        const found = CATEGORY_OPTIONS.find((c) => c.slug === val);
        if (found) copy[index].categoryName = found.name.split(' (')[0];
      }
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Project requirement title is required.');
      return;
    }

    if (items.some((it) => !it.materialName.trim() || it.quantity <= 0)) {
      setError('All items must have a valid name and quantity greater than zero.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        buyerId: 'user-buyer-active',
        buyerName: siteContactPerson || 'Apex Infrastructure & Builders',
        buyerEmail: 'procurement@apexinfra.in',
        buyerPhone: siteContactPhone,
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
    <div className="min-h-screen bg-[#F2F0E9] text-[#171A17] font-sans py-10">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#777970]">
          <Link href="/" className="hover:text-[#171A17]">PROVENTA</Link>
          <span>/</span>
          <Link href="/buyer/dashboard" className="hover:text-[#171A17]">Buyer Portal</Link>
          <span>/</span>
          <span className="text-[#53634A] font-bold">New Requirement (RFQ)</span>
        </div>

        {/* Page Title & Tagline */}
        <div className="space-y-2 border-b border-[#D9D8CF] pb-6 bg-[#FFFFFF] p-6 sm:p-8 border shadow-sm">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#E7E5DC] border border-[#D9D8CF] text-[11px] font-mono text-[#53634A] font-bold">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>STEP 1 · CREATE REQUIREMENT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#171A17] font-heading">
            Post Material Requirement (RFQ)
          </h1>
          <p className="text-sm text-[#777970]">
            Specify multiple materials, standard units of measurement, delivery location in Gujarat, and receive competitive quotations from verified suppliers.
          </p>
        </div>

        {/* AI Assistant Extraction Box */}
        <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#53634A]" />
              <span className="font-heading font-bold text-sm uppercase tracking-wider text-[#171A17]">
                Natural Language BOQ Extractor
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#777970]">Auto-Parses Quantities & Units</span>
          </div>
          <p className="text-xs text-[#777970]">
            Paste your site engineer&apos;s note or material schedule below. The assistant extracts items, quantities, standard units, and delivery location automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Need 40 MT Tata Tiscon Fe 550D TMT steel and 1000 bags UltraTech 53G cement delivered to South Bopal, Ahmedabad"
              className="flex-1 bg-[#F2F0E9] border border-[#D9D8CF] text-[#171A17] px-4 py-2.5 text-xs focus:outline-none focus:border-[#53634A]"
            />
            <button
              type="button"
              onClick={() => handleAiParse()}
              disabled={aiParsing || !aiPrompt.trim()}
              className="px-5 py-2.5 bg-[#53634A] hover:bg-[#43503B] disabled:opacity-50 text-[#FFFFFF] text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
            >
              {aiParsing ? 'Extracting...' : 'Parse Items'}
            </button>
          </div>
          {aiMessage && (
            <div className="text-xs font-mono text-[#53634A]">{aiMessage}</div>
          )}
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-[#F7EFE9] border border-[#B87948] text-[#A9433B] text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Project Details */}
          <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-6 space-y-5 shadow-sm">
            <h2 className="font-heading font-bold text-base uppercase text-[#171A17] border-b border-[#D9D8CF] pb-3">
              1. Project Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase text-[#777970] mb-1 font-bold">
                  Requirement Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Foundation Structural Steel & Cement Supply - Phase 1"
                  className="w-full bg-[#F2F0E9] border border-[#D9D8CF] text-[#171A17] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#53634A]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#777970] mb-1 font-bold">
                  Buyer Profile
                </label>
                <select
                  value={buyerRole}
                  onChange={(e: any) => setBuyerRole(e.target.value)}
                  className="w-full bg-[#F2F0E9] border border-[#D9D8CF] text-[#171A17] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#53634A]"
                >
                  <option value="CONTRACTOR">Civil Contractor</option>
                  <option value="BUILDER">Builder / Developer</option>
                  <option value="CONSTRUCTION_COMPANY">Construction Company</option>
                  <option value="INDIVIDUAL_BUYER">Individual Home Builder</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#777970] mb-1 font-bold">
                  Project Type
                </label>
                <select
                  value={projectType}
                  onChange={(e: any) => setProjectType(e.target.value)}
                  className="w-full bg-[#F2F0E9] border border-[#D9D8CF] text-[#171A17] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#53634A]"
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
          <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#D9D8CF] pb-3">
              <h2 className="font-heading font-bold text-base uppercase text-[#171A17]">
                2. Material Items ({items.length})
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E7E5DC] hover:bg-[#D9D8CF] text-[#171A17] text-xs font-mono font-bold uppercase transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-4">
              {items.map((it, idx) => (
                <div key={idx} className="p-4 bg-[#F2F0E9] border border-[#D9D8CF] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#777970]">
                    <span className="font-bold text-[#53634A]">ITEM #{idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-[#A9433B] hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#777970] mb-1">
                        Category
                      </label>
                      <select
                        value={it.categorySlug}
                        onChange={(e) => updateItem(idx, 'categorySlug', e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#D9D8CF] text-[#171A17] px-2.5 py-2 text-xs focus:outline-none focus:border-[#53634A]"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c.slug} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-mono uppercase text-[#777970] mb-1">
                        Material Name & Diameter/Grade *
                      </label>
                      <input
                        type="text"
                        required
                        value={it.materialName}
                        onChange={(e) => updateItem(idx, 'materialName', e.target.value)}
                        placeholder="e.g. TMT Steel Rebars 16mm Fe 550D"
                        className="w-full bg-[#FFFFFF] border border-[#D9D8CF] text-[#171A17] px-2.5 py-2 text-xs focus:outline-none focus:border-[#53634A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#777970] mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={it.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                        className="w-full bg-[#FFFFFF] border border-[#D9D8CF] text-[#171A17] px-2.5 py-2 text-xs focus:outline-none focus:border-[#53634A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#777970] mb-1">
                        Procurement Unit *
                      </label>
                      <select
                        value={it.unit}
                        onChange={(e: any) => updateItem(idx, 'unit', e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#D9D8CF] text-[#171A17] px-2.5 py-2 text-xs focus:outline-none focus:border-[#53634A]"
                      >
                        {CONSTRUCTION_UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#777970] mb-1">
                        Preferred Brand
                      </label>
                      <input
                        type="text"
                        value={it.brandPreference}
                        onChange={(e) => updateItem(idx, 'brandPreference', e.target.value)}
                        placeholder="e.g. Tata Tiscon / UltraTech"
                        className="w-full bg-[#FFFFFF] border border-[#D9D8CF] text-[#171A17] px-2.5 py-2 text-xs focus:outline-none focus:border-[#53634A]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Site Address */}
          <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-6 space-y-5 shadow-sm">
            <h2 className="font-heading font-bold text-base uppercase text-[#171A17] border-b border-[#D9D8CF] pb-3">
              3. Delivery & Site Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase text-[#777970] mb-1 font-bold">
                  Site Name & Project *
                </label>
                <input
                  type="text"
                  required
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g. Skylark Heights Phase 2"
                  className="w-full bg-[#F2F0E9] border border-[#D9D8CF] text-[#171A17] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#53634A]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#777970] mb-1 font-bold">
                  City (Gujarat)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#F2F0E9] border border-[#D9D8CF] text-[#171A17] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#53634A]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase text-[#777970] mb-1 font-bold">
                  Street Address Line
                </label>
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. Near SP Ring Road, South Bopal"
                  className="w-full bg-[#F2F0E9] border border-[#D9D8CF] text-[#171A17] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#53634A]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#777970] mb-1 font-bold">
                  Pincode
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full bg-[#F2F0E9] border border-[#D9D8CF] text-[#171A17] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#53634A]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#777970] mb-1 font-bold">
                  Site Contact Person
                </label>
                <input
                  type="text"
                  value={siteContactPerson}
                  onChange={(e) => setSiteContactPerson(e.target.value)}
                  placeholder="e.g. Ramesh Patel (Site Engineer)"
                  className="w-full bg-[#F2F0E9] border border-[#D9D8CF] text-[#171A17] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#53634A]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#777970] mb-1 font-bold">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={siteContactPhone}
                  onChange={(e) => setSiteContactPhone(e.target.value)}
                  placeholder="+91 98250 12345"
                  className="w-full bg-[#F2F0E9] border border-[#D9D8CF] text-[#171A17] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#53634A]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#777970] mb-1 font-bold">
                  Vehicle Accessibility
                </label>
                <select
                  value={vehicleAccessibility}
                  onChange={(e: any) => setVehicleAccessibility(e.target.value)}
                  className="w-full bg-[#F2F0E9] border border-[#D9D8CF] text-[#171A17] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#53634A]"
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
              className="px-6 py-3 bg-[#FFFFFF] border border-[#D9D8CF] hover:bg-[#E7E5DC] text-[#171A17] font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#53634A] hover:bg-[#43503B] disabled:opacity-50 text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm"
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
    <Suspense fallback={<div className="p-12 text-center text-xs font-mono text-[#777970]">Loading RFQ Composer...</div>}>
      <RfqCreateForm />
    </Suspense>
  );
}
