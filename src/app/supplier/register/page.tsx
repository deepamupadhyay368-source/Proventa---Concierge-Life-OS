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
    <div className="min-h-screen bg-[#F2F0E9] text-[#171A17] font-sans py-10">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#777970]">
          <Link href="/" className="hover:text-[#171A17]">PROVENTA</Link>
          <span>/</span>
          <Link href="/supplier/dashboard" className="hover:text-[#171A17]">Supplier Portal</Link>
          <span>/</span>
          <span className="text-[#53634A] font-bold">Supplier Onboarding</span>
        </div>

        {/* Title Header */}
        <div className="space-y-2 border-b border-[#D9D8CF] pb-6 bg-[#FFFFFF] p-6 sm:p-8 border shadow-sm">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#E7E5DC] border border-[#D9D8CF] text-[11px] font-mono text-[#53634A] font-bold">
            <Store className="w-3.5 h-3.5" />
            <span>VERIFIED SUPPLIER ENROLMENT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#171A17] font-heading">
            Supplier & Stockist Registration
          </h1>
          <p className="text-sm text-[#777970]">
            Join the verified Gujarat construction supply network. Receive active contractor RFQs and quote wholesale rates directly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-[#F7EFE9] border border-[#B87948] text-[#A9433B] text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Business & Tax Verification */}
          <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-6 sm:p-8 space-y-5 shadow-sm">
            <h2 className="font-heading font-bold text-base uppercase text-[#171A17] border-b border-[#D9D8CF] pb-3">
              1. Business Profile & GSTIN Verification
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase text-[#777970] mb-1 font-bold">
                  Registered Firm / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Gujarat Building Materials Syndicate"
                  className="w-full bg-[#F2F0E9] border border-[#D9D8CF] text-[#171A17] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#53634A]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#777970] mb-1 font-bold">
                  GSTIN (15 Digits) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="24AAAAA0000A1Z5"
                  className="w-full bg-[#F2F0E9] border border-[#D9D8CF] text-[#171A17] px-3.5 py-2.5 text-xs font-mono uppercase focus:outline-none focus:border-[#53634A]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#777970] mb-1 font-bold">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Mukeshbhai Patel"
                  className="w-full bg-[#F2F0E9] border border-[#D9D8CF] text-[#171A17] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#53634A]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#777970] mb-1 font-bold">
                  Business Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sales@gujaratmaterials.in"
                  className="w-full bg-[#F2F0E9] border border-[#D9D8CF] text-[#171A17] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#53634A]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#777970] mb-1 font-bold">
                  Dispatch Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98251 23456"
                  className="w-full bg-[#F2F0E9] border border-[#D9D8CF] text-[#171A17] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#53634A]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase text-[#777970] mb-1 font-bold">
                  Stockyard / Depot Street Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot 42, GIDC Phase 2, Sanand-Bavla Road"
                  className="w-full bg-[#F2F0E9] border border-[#D9D8CF] text-[#171A17] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#53634A]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Material Categories Offered */}
          <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-6 sm:p-8 space-y-5 shadow-sm">
            <h2 className="font-heading font-bold text-base uppercase text-[#171A17] border-b border-[#D9D8CF] pb-3">
              2. Material Categories & Dealerships
            </h2>

            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase text-[#777970] font-bold">
                Select Supplied Categories *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORY_LIST.map((c) => {
                  const isChecked = selectedCategories.includes(c.slug);
                  return (
                    <button
                      type="button"
                      key={c.slug}
                      onClick={() => toggleCategory(c.slug)}
                      className={`p-3 text-left border text-xs transition-colors flex items-center justify-between ${
                        isChecked
                          ? 'bg-[#EEF1EC] border-[#53634A] text-[#171A17]'
                          : 'bg-[#F2F0E9] border-[#D9D8CF] text-[#777970] hover:text-[#171A17]'
                      }`}
                    >
                      <span className="font-bold">{c.name}</span>
                      {isChecked && <CheckCircle2 className="w-4 h-4 text-[#53634A] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-mono uppercase text-[#777970] mb-1 font-bold">
                Authorized Brands & Dealerships Held
              </label>
              <input
                type="text"
                value={brands}
                onChange={(e) => setBrands(e.target.value)}
                placeholder="UltraTech, Ambuja, Tata Tiscon, Jindal Panther, Astral, Polycab"
                className="w-full bg-[#F2F0E9] border border-[#D9D8CF] text-[#171A17] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#53634A]"
              />
            </div>
          </div>

          {/* Section 3: Operating Zones in Gujarat */}
          <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-6 sm:p-8 space-y-5 shadow-sm">
            <h2 className="font-heading font-bold text-base uppercase text-[#171A17] border-b border-[#D9D8CF] pb-3">
              3. Delivery Reach & Operating Zones
            </h2>

            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase text-[#777970] font-bold">
                Zones you can service with guaranteed dispatch:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {AHMEDABAD_ZONES.map((zone) => {
                  const isChecked = selectedZones.includes(zone);
                  return (
                    <button
                      type="button"
                      key={zone}
                      onClick={() => toggleZone(zone)}
                      className={`p-2.5 text-left border text-[11px] font-mono transition-colors ${
                        isChecked
                          ? 'bg-[#EEF1EC] border-[#53634A] text-[#171A17] font-bold'
                          : 'bg-[#F2F0E9] border-[#D9D8CF] text-[#777970]'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '} {zone}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link
              href="/"
              className="px-6 py-3 bg-[#FFFFFF] border border-[#D9D8CF] hover:bg-[#E7E5DC] text-[#171A17] font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#53634A] hover:bg-[#43503B] disabled:opacity-50 text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm"
            >
              <span>{loading ? 'Submitting Application...' : 'Complete Supplier Onboarding'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
