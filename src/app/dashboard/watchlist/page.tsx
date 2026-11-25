'use client';

import Link from 'next/link';
import { Bookmark, Building, ArrowUpRight, Plus, MapPin } from 'lucide-react';

export default function WatchlistPage() {
  const watchlist = [
    {
      id: 'watch-01',
      name: 'Takshashila Air',
      locality: 'Bodakdev, Ahmedabad',
      typology: '4 BHK Luxury Penthouse',
      askingRangeSqFt: '₹11,000 – ₹13,500',
      observedStatus: 'READY_TO_MOVE',
      priceTrendQuarter: '+2.4%',
    },
    {
      id: 'watch-02',
      name: 'Sobha Dream Heights',
      locality: 'GIFT City, Gandhinagar',
      typology: '2 BHK IFSC Residence',
      askingRangeSqFt: '₹7,800 – ₹9,200',
      observedStatus: 'READY_TO_MOVE',
      priceTrendQuarter: '+3.8%',
    },
    {
      id: 'watch-03',
      name: 'Silver Radiance',
      locality: 'Science City, Ahmedabad',
      typology: '3 & 4 BHK High-Rise',
      askingRangeSqFt: '₹5,600 – ₹6,800',
      observedStatus: 'READY_TO_MOVE',
      priceTrendQuarter: '+1.9%',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C8C4BA] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
            Asset Tracking
          </span>
          <h1 className="font-editorial text-2xl font-normal text-[#202B3C]">
            Project & Locality Watchlist
          </h1>
        </div>

        <Link
          href="/project-intelligence"
          className="h-10 px-4 bg-[#202B3C] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 hover:bg-[#202B3C]/90"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Track New Project</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {watchlist.map((item) => (
          <div key={item.id} className="bg-white border border-[#C8C4BA] p-5 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-editorial text-lg font-normal text-[#202B3C]">{item.name}</h3>
                <p className="text-xs text-[#69717B] flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-[#547568]" />
                  <span>{item.locality}</span>
                </p>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#547568]/10 text-[#547568] font-bold tabular-nums">
                {item.priceTrendQuarter}
              </span>
            </div>

            <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA]/40 space-y-1 font-mono text-xs">
              <div className="flex justify-between text-[#69717B]">
                <span>Typology:</span>
                <span className="text-[#202B3C] font-semibold">{item.typology}</span>
              </div>
              <div className="flex justify-between text-[#69717B]">
                <span>Price / Sq Ft:</span>
                <span className="text-[#202B3C] font-semibold tabular-nums">{item.askingRangeSqFt}</span>
              </div>
            </div>

            <Link
              href="/project-intelligence"
              className="text-xs font-semibold text-[#202B3C] hover:text-[#547568] flex items-center justify-between pt-1"
            >
              <span>Explore Project Dossier</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
