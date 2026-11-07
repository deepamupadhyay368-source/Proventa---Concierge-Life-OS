'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { CONSTRUCTION_CATEGORIES } from '@/lib/procurement/categories';

export default function CategoriesCataloguePage() {
  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans">
      {/* Header Banner */}
      <section className="border-b border-[#414957] bg-[#252B38] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#191B20] border border-[#414957] text-xs font-mono text-[#C66A42] uppercase tracking-wider font-semibold rounded-sm">
            <span>CONSTRUCTION & INFRASTRUCTURE TAXONOMY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#FFFFFF] max-w-4xl font-heading leading-tight">
            COMMERCIAL MATERIAL CATALOGUE
          </h1>
          <p className="text-sm sm:text-base text-[#A8ADB7] max-w-3xl leading-relaxed">
            10 core & extended construction and infrastructure categories available for wholesale procurement, competitive quotation bidding, and coordinated site delivery across Gujarat and India.
          </p>
        </div>
      </section>

      {/* Catalogue Sections */}
      <section className="py-20 bg-[#292F3D]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          {CONSTRUCTION_CATEGORIES.map((cat, idx) => (
            <div
              key={cat.slug}
              id={cat.slug}
              className="bg-[#303746] border border-[#414957] shadow-sm scroll-mt-24 overflow-hidden rounded-sm"
            >
              {/* Category Top Banner */}
              <div className="p-8 lg:p-10 space-y-4 border-b border-[#414957] bg-[#252B38]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-mono text-xs uppercase tracking-widest text-[#536B88] font-bold">
                    DIVISION {String(idx + 1).padStart(2, '0')} · {cat.division} CATEGORY
                  </div>
                  <span className="font-mono text-xs px-2.5 py-0.5 bg-[#191B20] border border-[#414957] text-[#C66A42] rounded-sm font-semibold">
                    {cat.standards}
                  </span>
                </div>
                <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF]">
                  {cat.name}
                </h2>
                <p className="text-xs sm:text-sm text-[#A8ADB7] leading-relaxed max-w-3xl">
                  {cat.description}
                </p>
              </div>

              {/* Items Table */}
              <div className="p-6 lg:p-8">
                <div className="font-mono text-xs uppercase tracking-wider text-[#FFFFFF] font-bold pb-3 mb-4 border-b border-[#414957] flex justify-between items-center">
                  <span>Standard Specifications & Procurement Units</span>
                  <span className="text-[#A8ADB7] text-[11px] font-normal">Default: {cat.defaultUnit}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-[#414957] font-mono uppercase text-[#A8ADB7]">
                        <th className="py-2.5 pr-4">Subcategory Classification</th>
                        <th className="py-2.5 px-4">Standard Procurement Units</th>
                        <th className="py-2.5 pl-4">Engineering Specs & Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#414957]">
                      {cat.subcategories.map((sub, sIdx) => (
                        <tr key={sIdx} className="hover:bg-[#252B38] transition-colors">
                          <td className="py-3 pr-4 font-bold text-[#F1F2F4]">{sub.name}</td>
                          <td className="py-3 px-4 font-mono text-[#536B88] font-bold">
                            {sub.standardUnits.join(', ')}
                          </td>
                          <td className="py-3 pl-4 text-[#A8ADB7] font-mono text-[11px]">
                            {sub.commonSpecs?.join(' · ') || sub.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-6 mt-6 border-t border-[#414957] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-[#A8ADB7]">
                    Supported Order Units: {cat.supportedUnits.join(', ')}
                  </div>
                  <Link
                    href={`/rfq/new?category=${cat.slug}`}
                    className="px-6 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 rounded-sm shadow-sm"
                  >
                    <span>Request Quotation for {cat.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
