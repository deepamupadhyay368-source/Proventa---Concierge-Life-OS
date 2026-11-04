'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Store,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Building2,
  MapPin,
} from 'lucide-react';

const CATEGORY_LIST = [
  { slug: 'building-materials', name: 'Building Materials (Cement, TMT Steel, Sand, Blocks)' },
  { slug: 'electrical', name: 'Electrical Supplies (Wires, Cables, Switches, Lighting)' },
  { slug: 'plumbing', name: 'Plumbing & Water Systems (Pipes, Pumps, Tanks, Sanitary)' },
  { slug: 'tiles-flooring', name: 'Tiles & Flooring (Vitrified, Marble, Granite, Pavers)' },
  { slug: 'finishing-materials', name: 'Finishing & Chemicals (Paint, Waterproofing, Putty)' },
  { slug: 'doors-windows', name: 'Doors, Windows & Hardware (Aluminium, UPVC, Locks)' },
];

const AHMEDABAD_ZONES = [
  'SG Highway & Sola',
  'Sanand GIDC Industrial',
  'Changodar & Sarkhej-Bavla',
  'Odhav & Naroda GIDC',
  'South Bopal & Shela',
  'Science City & Gota',
  'GIFT City & Gandhinagar',
  'Vatva & Narol',
  'All Ahmedabad City',
];

export default function SupplierRegisterPage() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [pincode, setPincode] = useState('382415');

  const [selectedCategories, setSelectedCategories] = useState<string[]>(['building-materials']);
  const [selectedZones, setSelectedZones] = useState<string[]>(['SG Highway & Sola', 'Sanand GIDC Industrial', 'All Ahmedabad City']);
  const [brands, setBrands] = useState('UltraTech, Ambuja, Tata Tiscon, Jindal Panther');

  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [upiId, setUpiId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const toggleZone = (zone: string) => {
    setSelectedZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!businessName.trim() || !gstin.trim() || !phone.trim()) {
      setError('Business Name, GSTIN, and Contact Phone are required.');
      return;
    }

    if (selectedCategories.length === 0) {
      setError('Please select at least one primary material category.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        businessName,
        gstin: gstin.toUpperCase(),
        contactPerson,
        email,
        phone,
        address,
        city,
        state: 'Gujarat',
        pincode,
        operatingZones: selectedZones,
        primaryCategories: selectedCategories,
        brandsOffered: brands.split(',').map((b) => b.trim()).filter(Boolean),
        bankDetails: bankAccount
          ? {
              accountNumber: bankAccount,
              ifscCode: bankIfsc,
              bankName,
              upiId,
            }
          : undefined,
      };

      const res = await fetch('/api/procurement/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to register supplier');
      }

      router.push('/supplier/dashboard?registered=true');
    } catch (err: any) {
      setError(err.message || 'Error completing registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans py-10">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#858D9B]">
          <Link href="/" className="hover:text-white">PROVENTA</Link>
          <span>/</span>
          <Link href="/supplier/dashboard" className="hover:text-white">Supplier Portal</Link>
          <span>/</span>
          <span className="text-[#F25C05]">Supplier Onboarding</span>
        </div>

        {/* Page Title */}
        <div className="space-y-2 border-b border-[#252C38] pb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#171C26] border border-[#252C38] rounded-xs text-[11px] font-mono text-[#F25C05]">
            <Store className="w-3.5 h-3.5" />
            <span>DEALERSHIP & STOCKIST ONBOARDING</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-heading">
            Register as Verified Material Supplier
          </h1>
          <p className="text-sm text-[#C5CAD3]">
            Connect your inventory and stockyards to builders, contractors, and developers across Ahmedabad & Gujarat.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-950/40 border border-red-800 rounded-xs text-red-200 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Business Identity & GST */}
          <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 space-y-5">
            <h2 className="font-heading font-black text-lg uppercase tracking-tight text-white border-b border-[#252C38] pb-3">
              1. Business Identity & GST Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Business / Firm Trading Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Gujarat Building Materials Syndicate"
                  className="w-full bg-[#090B10] border border-[#252C38] text-white px-4 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  15-Digit GSTIN Number *
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 24AAACG1928K1Z5"
                  className="w-full bg-[#090B10] border border-[#252C38] text-white px-4 py-2.5 text-sm font-mono rounded-xs focus:outline-none focus:border-[#F25C05]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Authorised Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Kiritbhai Patel"
                  className="w-full bg-[#090B10] border border-[#252C38] text-white px-4 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Direct Mobile / WhatsApp Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98250 14829"
                  className="w-full bg-[#090B10] border border-[#252C38] text-white px-4 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Official Orders Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sales@gujaratbuildingmaterials.in"
                  className="w-full bg-[#090B10] border border-[#252C38] text-white px-4 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Stockyard / Warehouse Physical Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Plot 42, GIDC Odhav Industrial Estate, Ahmedabad - 382415"
                  className="w-full bg-[#090B10] border border-[#252C38] text-white px-4 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Material Categories & Brands */}
          <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 space-y-5">
            <h2 className="font-heading font-black text-lg uppercase tracking-tight text-white border-b border-[#252C38] pb-3">
              2. Material Categories & Brands Distributed
            </h2>

            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B]">
                Primary Material Categories (Select All That Apply) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORY_LIST.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => toggleCategory(c.slug)}
                    className={`p-3 rounded-xs border text-xs text-left transition-colors flex items-center justify-between ${
                      selectedCategories.includes(c.slug)
                        ? 'bg-[#090B10] border-[#F25C05] text-white font-bold'
                        : 'bg-[#090B10] border-[#252C38] text-[#858D9B] hover:border-[#858D9B]'
                    }`}
                  >
                    <span>{c.name}</span>
                    {selectedCategories.includes(c.slug) && (
                      <CheckCircle2 className="w-4 h-4 text-[#F25C05] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                Authorized Brands Offered (Comma-separated)
              </label>
              <input
                type="text"
                value={brands}
                onChange={(e) => setBrands(e.target.value)}
                placeholder="UltraTech, Ambuja, Tata Tiscon, Jindal Panther, Astral, Polycab"
                className="w-full bg-[#090B10] border border-[#252C38] text-white px-4 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
              />
            </div>
          </div>

          {/* Section 3: Delivery Zones in Gujarat */}
          <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 space-y-5">
            <h2 className="font-heading font-black text-lg uppercase tracking-tight text-white border-b border-[#252C38] pb-3">
              3. Operating Delivery Coverage (Ahmedabad & Gujarat)
            </h2>

            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B]">
                Active Transit Zones (You will receive RFQs for these areas)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AHMEDABAD_ZONES.map((zone) => (
                  <button
                    key={zone}
                    type="button"
                    onClick={() => toggleZone(zone)}
                    className={`p-2.5 rounded-xs border text-xs text-left transition-colors font-mono ${
                      selectedZones.includes(zone)
                        ? 'bg-[#090B10] border-[#F25C05] text-[#F25C05] font-bold'
                        : 'bg-[#090B10] border-[#252C38] text-[#858D9B] hover:border-[#858D9B]'
                    }`}
                  >
                    <span>{selectedZones.includes(zone) ? '✓ ' : '+ '}{zone}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#252C38]">
            <div className="text-xs text-[#858D9B] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#F25C05]" />
              <span>Free registration • 100% verified leads directly to your dashboard</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-4 bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xl shadow-[#F25C05]/20"
            >
              <span>{loading ? 'Submitting Details...' : 'Complete Dealership Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
