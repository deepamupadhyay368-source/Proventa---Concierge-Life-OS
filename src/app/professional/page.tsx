'use client';

import Link from 'next/link';
import { Users, FileBarChart, TrendingUp, Building, ArrowUpRight, Plus } from 'lucide-react';

export default function ProfessionalOverviewPage() {
  const clients = [
    { id: 'cli-01', name: 'Dr. Vikram Patel & Family', propertiesCount: 4, aumLakhs: 412, city: 'Ahmedabad' },
    { id: 'cli-02', name: 'Aashna Shah Family Trust', propertiesCount: 7, aumLakhs: 840, city: 'Ahmedabad / GIFT City' },
    { id: 'cli-03', name: 'Kiran Desai (NRI Portfolio)', propertiesCount: 3, aumLakhs: 295, city: 'Ahmedabad' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C8C4BA] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
            Institutional Advisory Console
          </span>
          <h1 className="font-display text-2xl font-bold text-[#202B3C]">
            Professional Portfolio Dashboard
          </h1>
        </div>

        <Link
          href="/professional/clients?action=new"
          className="px-3.5 py-2 bg-[#202B3C] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#202B3C]/90 shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Onboard Client</span>
        </Link>
      </div>

      {/* Aggregate Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#C8C4BA] p-5 space-y-1">
          <span className="text-[11px] font-mono text-[#69717B] uppercase tracking-wider">
            Total Monitored AUM
          </span>
          <div className="font-mono text-2xl font-bold text-[#202B3C]">
            ₹15.47 Cr
          </div>
          <p className="text-[11px] text-[#547568] font-mono">14 Monitored Properties</p>
        </div>

        <div className="bg-white border border-[#C8C4BA] p-5 space-y-1">
          <span className="text-[11px] font-mono text-[#69717B] uppercase tracking-wider">
            Active Advisory Clients
          </span>
          <div className="font-mono text-2xl font-bold text-[#202B3C]">
            3 Accounts
          </div>
          <p className="text-[11px] text-[#69717B] font-mono">150 Unit Limit</p>
        </div>

        <div className="bg-white border border-[#C8C4BA] p-5 space-y-1">
          <span className="text-[11px] font-mono text-[#69717B] uppercase tracking-wider">
            Reports Dispatched
          </span>
          <div className="font-mono text-2xl font-bold text-[#202B3C]">
            12 / 50
          </div>
          <p className="text-[11px] text-[#547568] font-mono">Current Billing Month</p>
        </div>

        <div className="bg-white border border-[#C8C4BA] p-5 space-y-1">
          <span className="text-[11px] font-mono text-[#69717B] uppercase tracking-wider">
            Average Portfolio Yield
          </span>
          <div className="font-mono text-2xl font-bold text-[#547568]">
            3.6%
          </div>
          <p className="text-[11px] text-[#69717B] font-mono">Net of AUDA municipal taxes</p>
        </div>
      </div>

      {/* Client Portfolios Table */}
      <div className="bg-white border border-[#C8C4BA] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#C8C4BA]/50 pb-3">
          <h2 className="font-display text-base font-bold text-[#202B3C]">
            Segregated Client Portfolios
          </h2>
          <Link
            href="/professional/clients"
            className="text-xs font-semibold text-[#547568] hover:underline flex items-center gap-1"
          >
            <span>Manage All Clients</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="divide-y divide-[#C8C4BA]/50 text-xs">
          {clients.map((cli) => (
            <div key={cli.id} className="py-3 flex items-center justify-between hover:bg-[#F5F3ED]/40 px-2 transition-colors">
              <div>
                <p className="font-bold text-[#202B3C]">{cli.name}</p>
                <p className="text-[11px] text-[#69717B] font-mono">{cli.city} • {cli.propertiesCount} properties</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono font-bold text-[#202B3C]">₹{(cli.aumLakhs / 100).toFixed(2)} Cr</span>
                <Link
                  href={`/professional/clients?id=${cli.id}`}
                  className="px-2.5 py-1 bg-[#202B3C] text-white text-[11px] font-semibold"
                >
                  Portfolio
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
