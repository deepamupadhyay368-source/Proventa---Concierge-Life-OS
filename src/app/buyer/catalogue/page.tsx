'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BuyerWorkspaceShell } from '@/components/procurement/BuyerWorkspaceShell';
import { Search, ShieldCheck, ArrowRight } from 'lucide-react';
import type { MaterialCategoryDefinition } from '@/lib/construction-procurement/taxonomy';

const DIVISIONS = [
  { key: 'ALL', label: 'All Divisions' },
  { key: 'CIVIL_STRUCTURAL', label: 'Civil & Structural' },
  { key: 'ELECTRICAL', label: 'Electrical' },
  { key: 'PLUMBING', label: 'Plumbing & MEP' },
  { key: 'FINISHING', label: 'Finishing' },
  { key: 'SITE_EQUIPMENT', label: 'Safety & Site Equipment' },
];

export default function MaterialCataloguePage() {
  const [categories, setCategories] = useState<MaterialCategoryDefinition[]>([]);
  const [division, setDivision] = useState('ALL');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (division !== 'ALL') params.set('division', division);
        if (query.trim()) params.set('q', query.trim());
        const res = await fetch(`/api/procurement/catalogue?${params.toString()}`);
        const json = await res.json();
        if (json.success) setCategories(json.data || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [division, query]);

  return (
    <BuyerWorkspaceShell
      title="Construction Material Catalogue"
      subtitle="Structured technical specification schemas enforcing like-for-like supplier quotation comparisons across Indian BIS standards."
      actions={
        <Link
          href="/rfq/new"
          className="px-4 py-2 bg-[#172B3A] hover:bg-[#292F3D] text-white text-xs font-semibold rounded-xs inline-flex items-center gap-1.5"
        >
          <span>Create Specification-Locked RFQ</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#C9A45B]" />
        </Link>
      }
    >
      <div className="bg-white border border-[#D5DCE2] p-4 rounded-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {DIVISIONS.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setDivision(d.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-colors ${
                division === d.key
                  ? 'bg-[#172B3A] text-white'
                  : 'bg-[#E9ECEF] text-[#292F3D] hover:bg-[#DCE2E8]'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#4A5568] absolute left-3 top-2.5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search material or IS standard..."
            className="w-full h-9 pl-9 pr-3 border border-[#D5DCE2] text-xs rounded-xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-[#D5DCE2] p-10 text-center text-xs text-[#4A5568]">
          Loading structured material taxonomy...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories.map((cat) => (
            <div key={cat.slug} className="bg-white border border-[#D5DCE2] p-5 rounded-xs space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-[#E9ECEF] pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#0F6B50] font-bold">
                    {cat.division.replace(/_/g, ' ')} &bull; {cat.standardReference}
                  </span>
                  <h2 className="text-base font-bold text-[#172B3A] mt-0.5">{cat.name}</h2>
                </div>
                <div className="text-right font-mono text-[10px] text-[#4A5568]">
                  <div>UNIT: <strong className="text-[#172B3A]">{cat.defaultUnit}</strong></div>
                  <div>GST: <strong className="text-[#172B3A]">{cat.gstRatePercent}%</strong></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-[#292F3D] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0F6B50]" />
                  <span>Required Technical Specification Attributes</span>
                </div>
                <div className="divide-y divide-[#E9ECEF] border border-[#E9ECEF] text-xs">
                  {cat.specAttributes.map((attr) => (
                    <div key={attr.key} className="p-2.5 flex items-center justify-between gap-2 bg-[#F3F5F7]/50">
                      <div>
                        <span className="font-semibold text-[#172B3A]">{attr.label}</span>
                        {attr.materiallyCritical && (
                          <span className="ml-2 text-[9px] font-mono uppercase px-1.5 py-0.5 bg-[#172B3A] text-[#C9A45B] rounded-xs">
                            Equivalence Lock
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#4A5568] truncate max-w-[180px]">
                        {attr.exampleValues.slice(0, 3).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </BuyerWorkspaceShell>
  );
}
