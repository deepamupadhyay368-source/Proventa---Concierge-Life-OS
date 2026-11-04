'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  FileSpreadsheet,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Upload,
  Clock,
  Building2,
  AlertCircle,
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

  // Initialize from searchParams if prompt or category passed
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
          if (json.data.delivery.pincode) setPincode(json.data.delivery.pincode);
        }
        setAiMessage(`✓ Successfully extracted ${json.data.items.length} line items with units and delivery specifications!`);
      }
    } catch (err) {
      console.error('AI parse error:', err);
    } finally {
      setAiParsing(false);
    }
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        categorySlug: 'building-materials',
        categoryName: 'Building Materials',
        materialName: '',
        gradeOrSpec: '',
        brandPreference: '',
        quantity: 100,
        unit: 'Pieces (Nos)',
        itemNotes: '',
      },
    ]);
  };

  const removeItemRow = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof MaterialItemInput, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      if (field === 'categorySlug') {
        const found = CATEGORY_OPTIONS.find((c) => c.slug === value);
        if (found) copy[idx].categoryName = found.name.split(' (')[0];
      }
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a descriptive requirement title');
      return;
    }
    if (!addressLine.trim() || !siteContactPhone.trim()) {
      setError('Site delivery address and contact phone are mandatory for supplier matching');
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
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans py-10">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#858D9B]">
          <Link href="/" className="hover:text-[#F4F6FA]">PROVENTA</Link>
          <span>/</span>
          <Link href="/buyer/dashboard" className="hover:text-[#F4F6FA]">Buyer Portal</Link>
          <span>/</span>
          <span className="text-[#F25C05]">New Requirement (RFQ)</span>
        </div>

        {/* Page Title & Tagline */}
        <div className="space-y-2 border-b border-[#252C38] pb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#171C26] border border-[#252C38] rounded-xs text-[11px] font-mono text-[#F25C05]">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>STEP 1 · CREATE REQUIREMENT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
            Post Material Requirement (RFQ)
          </h1>
          <p className="text-sm text-[#C5CAD3]">
            Specify multiple materials, standard units of measurement, delivery location in Gujarat, and receive competitive quotations from verified suppliers.
          </p>
        </div>

        {/* AI Natural Language Assistant Box */}
        <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F25C05]" />
              <span className="font-heading font-bold text-sm uppercase tracking-wider text-white">
                AI BOQ & Natural Language Extractor
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#858D9B]">Auto-Parses Quantities & Units</span>
          </div>
          <p className="text-xs text-[#C5CAD3]">
            Paste your site engineer&apos;s WhatsApp note, BOQ excerpt, or material schedule below. The assistant extracts items, quantities, standard units, and delivery location automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Need 40 MT Tata Tiscon Fe 550D TMT steel and 1000 bags UltraTech 53G cement delivered to South Bopal, Ahmedabad"
              className="flex-1 bg-[#090B10] border border-[#252C38] text-[#F4F6FA] px-4 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
            />
            <button
              type="button"
              disabled={aiParsing || !aiPrompt.trim()}
              onClick={() => handleAiParse()}
              className="px-5 py-2.5 bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors shrink-0 flex items-center justify-center gap-2"
            >
              {aiParsing ? 'Extracting...' : 'Auto-Fill Form'}
            </button>
          </div>
          {aiMessage && (
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{aiMessage}</span>
            </div>
          )}
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-950/40 border border-red-800 rounded-xs text-red-200 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 space-y-5">
            <h2 className="font-heading font-black text-lg uppercase tracking-tight text-white border-b border-[#252C38] pb-3">
              1. Project & Procurement Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Requirement Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 50 MT TMT Steel & 1,200 Bags 53 Grade Cement for High-Rise Scheme"
                  className="w-full bg-[#090B10] border border-[#252C38] text-[#F4F6FA] px-4 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  I am a *
                </label>
                <select
                  value={buyerRole}
                  onChange={(e: any) => setBuyerRole(e.target.value)}
                  className="w-full bg-[#090B10] border border-[#252C38] text-[#F4F6FA] px-3.5 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                >
                  <option value="CONTRACTOR">Contractor / Civil Contractor</option>
                  <option value="BUILDER">Builder / Real Estate Developer</option>
                  <option value="CONSTRUCTION_COMPANY">Construction & EPC Company</option>
                  <option value="INDIVIDUAL_BUYER">Individual Home Builder / Owner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Project Type
                </label>
                <select
                  value={projectType}
                  onChange={(e: any) => setProjectType(e.target.value)}
                  className="w-full bg-[#090B10] border border-[#252C38] text-[#F4F6FA] px-3.5 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                >
                  <option value="RESIDENTIAL">Residential Scheme / Villas</option>
                  <option value="COMMERCIAL">Commercial Office Tower / Retail</option>
                  <option value="INFRASTRUCTURE">Infrastructure / Roads / Bridges</option>
                  <option value="INDUSTRIAL">Industrial Shed / GIDC Factory</option>
                  <option value="RENOVATION">Interior Fit-out / Renovation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Required Site Delivery Date
                </label>
                <input
                  type="date"
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  className="w-full bg-[#090B10] border border-[#252C38] text-[#F4F6FA] px-4 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Procurement Urgency
                </label>
                <select
                  value={urgency}
                  onChange={(e: any) => setUrgency(e.target.value)}
                  className="w-full bg-[#090B10] border border-[#252C38] text-[#F4F6FA] px-3.5 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                >
                  <option value="STANDARD">Standard (Within 5-7 days)</option>
                  <option value="URGENT">Urgent Site Dispatch (Within 24-48 hrs)</option>
                  <option value="FLEXIBLE">Flexible / Advance Tendering</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Multi-Material Items Table */}
          <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#252C38] pb-3">
              <div>
                <h2 className="font-heading font-black text-lg uppercase tracking-tight text-white">
                  2. Material Line Items ({items.length})
                </h2>
                <p className="text-xs text-[#858D9B]">
                  Add multiple materials with required quantity and standard units.
                </p>
              </div>
              <button
                type="button"
                onClick={addItemRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#090B10] hover:bg-[#252C38] border border-[#252C38] text-xs font-bold uppercase tracking-wider rounded-xs text-[#F25C05] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#090B10] border border-[#252C38] p-4 rounded-xs space-y-4 relative"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#252C38]/60">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#F25C05] font-bold">
                      Item #{idx + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-[#858D9B] mb-1">
                        Category *
                      </label>
                      <select
                        value={item.categorySlug}
                        onChange={(e) => updateItem(idx, 'categorySlug', e.target.value)}
                        className="w-full bg-[#171C26] border border-[#252C38] text-[#F4F6FA] px-2.5 py-2 text-xs rounded-xs focus:outline-none focus:border-[#F25C05]"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-mono text-[#858D9B] mb-1">
                        Material Name & Description *
                      </label>
                      <input
                        type="text"
                        required
                        value={item.materialName}
                        onChange={(e) => updateItem(idx, 'materialName', e.target.value)}
                        placeholder="e.g. 53 Grade OPC Cement or TMT Fe 550D Rebars 12mm"
                        className="w-full bg-[#171C26] border border-[#252C38] text-[#F4F6FA] px-3 py-2 text-xs rounded-xs focus:outline-none focus:border-[#F25C05]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#858D9B] mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 1)}
                        className="w-full bg-[#171C26] border border-[#252C38] text-[#F4F6FA] px-3 py-2 text-xs rounded-xs focus:outline-none focus:border-[#F25C05]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#858D9B] mb-1">
                        Standard Unit of Measurement *
                      </label>
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(idx, 'unit', e.target.value as ConstructionUnit)}
                        className="w-full bg-[#171C26] border border-[#252C38] text-[#F4F6FA] px-2.5 py-2 text-xs rounded-xs focus:outline-none focus:border-[#F25C05]"
                      >
                        {CONSTRUCTION_UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#858D9B] mb-1">
                        Brand Preference (Optional)
                      </label>
                      <input
                        type="text"
                        value={item.brandPreference}
                        onChange={(e) => updateItem(idx, 'brandPreference', e.target.value)}
                        placeholder="e.g. UltraTech / Ambuja / Tata"
                        className="w-full bg-[#171C26] border border-[#252C38] text-[#F4F6FA] px-3 py-2 text-xs rounded-xs focus:outline-none focus:border-[#F25C05]"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-mono text-[#858D9B] mb-1">
                        Technical Grade / Specifications / Notes
                      </label>
                      <input
                        type="text"
                        value={item.gradeOrSpec}
                        onChange={(e) => updateItem(idx, 'gradeOrSpec', e.target.value)}
                        placeholder="e.g. Fe 550D primary steel with test cert, fresh stock within 15 days"
                        className="w-full bg-[#171C26] border border-[#252C38] text-[#F4F6FA] px-3 py-2 text-xs rounded-xs focus:outline-none focus:border-[#F25C05]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Site Delivery Details (Ahmedabad & Gujarat) */}
          <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 space-y-5">
            <div className="border-b border-[#252C38] pb-3">
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-white">
                3. Site Delivery Location (Gujarat)
              </h2>
              <p className="text-xs text-[#858D9B]">
                Suppliers use your site location to calculate accurate freight charges and vehicle clearance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Project / Site Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g. Grand Vista Commercial Project"
                  className="w-full bg-[#090B10] border border-[#252C38] text-[#F4F6FA] px-4 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Site Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. Off SG Highway, Near Sola Science City Circle"
                  className="w-full bg-[#090B10] border border-[#252C38] text-[#F4F6FA] px-4 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  City (Gujarat) *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#090B10] border border-[#252C38] text-[#F4F6FA] px-3.5 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                >
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Gandhinagar">Gandhinagar / GIFT City</option>
                  <option value="Sanand">Sanand GIDC</option>
                  <option value="Changodar">Changodar / Bavla</option>
                  <option value="Vadodara">Vadodara</option>
                  <option value="Surat">Surat</option>
                  <option value="Rajkot">Rajkot</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="380060"
                  className="w-full bg-[#090B10] border border-[#252C38] text-[#F4F6FA] px-4 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Site Contact Person / Engineer Name *
                </label>
                <input
                  type="text"
                  required
                  value={siteContactPerson}
                  onChange={(e) => setSiteContactPerson(e.target.value)}
                  placeholder="e.g. Pravinbhai Patel"
                  className="w-full bg-[#090B10] border border-[#252C38] text-[#F4F6FA] px-4 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Site Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={siteContactPhone}
                  onChange={(e) => setSiteContactPhone(e.target.value)}
                  placeholder="+91 98250 12345"
                  className="w-full bg-[#090B10] border border-[#252C38] text-[#F4F6FA] px-4 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Vehicle Access Clearance
                </label>
                <select
                  value={vehicleAccessibility}
                  onChange={(e: any) => setVehicleAccessibility(e.target.value)}
                  className="w-full bg-[#090B10] border border-[#252C38] text-[#F4F6FA] px-3.5 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                >
                  <option value="10-Wheeler Truck">10-Wheeler Heavy Truck Accessible</option>
                  <option value="Tata Ace / Small Truck">Tata Ace / Small Truck Only (Narrow Access)</option>
                  <option value="Transit Mixer (RMC)">Transit Mixer (RMC Concrete Accessible)</option>
                  <option value="Trailer Accessible">16-Wheeler Multi-Axle Trailer Accessible</option>
                  <option value="Standard Access">Standard Road Access</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Unloading & Site Instructions
                </label>
                <input
                  type="text"
                  value={siteAccessNotes}
                  onChange={(e) => setSiteAccessNotes(e.target.value)}
                  placeholder="e.g. Unloading labor available on site after 9 AM"
                  className="w-full bg-[#090B10] border border-[#252C38] text-[#F4F6FA] px-4 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: BOQ Attachment Simulator */}
          <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 space-y-4">
            <h2 className="font-heading font-black text-lg uppercase tracking-tight text-white border-b border-[#252C38] pb-3">
              4. Attach BOQ / Structural Drawings (Optional)
            </h2>
            <div className="border-2 border-dashed border-[#252C38] hover:border-[#F25C05] p-6 text-center rounded-xs transition-colors cursor-pointer bg-[#090B10]">
              <Upload className="w-8 h-8 text-[#858D9B] mx-auto mb-2" />
              <div className="text-sm font-semibold text-white">Upload BOQ Schedule (PDF / Excel)</div>
              <div className="text-xs text-[#858D9B] mt-1">Supports up to 25 MB • Auto-shared with matching suppliers</div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#252C38]">
            <div className="text-xs text-[#858D9B] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#F25C05]" />
              <span>Matching verified Ahmedabad suppliers. Buyer contact kept private until selection.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-4 bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-50 text-white font-bold text-sm uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xl shadow-[#F25C05]/20"
            >
              <span>{loading ? 'Posting RFQ...' : 'Submit RFQ & Invite Suppliers'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RfqNewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090B10] text-white p-12 text-center">Loading RFQ Form...</div>}>
      <RfqCreateForm />
    </Suspense>
  );
}
