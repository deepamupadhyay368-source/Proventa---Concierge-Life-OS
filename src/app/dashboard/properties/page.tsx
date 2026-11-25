'use client';

import Link from 'next/link';
import { Building, MapPin, ArrowUpRight, Plus, ExternalLink } from 'lucide-react';

export default function MyPropertiesPage() {
  const properties = [
    {
      id: 'prop-01',
      title: '3 BHK High-Floor Apartment',
      locality: 'Shela, Ahmedabad',
      project: 'Shilp Revanta',
      carpetAreaSqFt: 1450,
      estimatedValueLakhs: 98.5,
      purchasePriceLakhs: 82.0,
      status: 'MONITORED_IN_VAULT',
      yield: 3.4,
    },
    {
      id: 'prop-02',
      title: '2 BHK Resale Unit',
      locality: 'South Bopal, Ahmedabad',
      project: 'Aarohi Elegance',
      carpetAreaSqFt: 880,
      estimatedValueLakhs: 64.2,
      purchasePriceLakhs: 56.5,
      status: 'MONITORED_IN_VAULT',
      yield: 4.1,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C8C4BA] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
            Asset Registry
          </span>
          <h1 className="font-editorial text-2xl font-normal text-[#202B3C]">
            My Tracked Real Estate Portfolio
          </h1>
        </div>

        <Link
          href="/dashboard/property-vault?action=new"
          className="h-10 px-4 bg-[#202B3C] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 hover:bg-[#202B3C]/90"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Property</span>
        </Link>
      </div>

      <div className="bg-white border border-[#C8C4BA] overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C]">
              <th className="p-3.5 font-bold uppercase tracking-wider">Property & Project</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Locality</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Carpet Area</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Est. Value</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Acquisition</th>
              <th className="p-3.5 font-bold uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C8C4BA]/50">
            {properties.map((p) => (
              <tr key={p.id} className="hover:bg-[#F5F3ED]/40 transition-colors">
                <td className="p-3.5">
                  <div className="font-bold text-[#202B3C]">{p.title}</div>
                  <div className="text-[11px] text-[#69717B]">{p.project}</div>
                </td>
                <td className="p-3.5 text-[#69717B]">{p.locality}</td>
                <td className="p-3.5 font-mono text-[#202B3C] tabular-nums">{p.carpetAreaSqFt} sq ft</td>
                <td className="p-3.5 font-mono font-bold text-[#547568] tabular-nums">₹{p.estimatedValueLakhs} L</td>
                <td className="p-3.5 font-mono text-[#202B3C] tabular-nums">₹{p.purchasePriceLakhs} L</td>
                <td className="p-3.5 text-right space-x-2">
                  <Link
                    href={`/dashboard/property-vault?id=${p.id}`}
                    className="inline-flex items-center gap-1 h-8 px-3 bg-[#202B3C] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#202B3C]/90"
                  >
                    <span>Vault</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
