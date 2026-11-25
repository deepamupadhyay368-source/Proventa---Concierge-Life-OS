'use client';

import Link from 'next/link';
import {
  Building,
  TrendingUp,
  ShieldCheck,
  FileText,
  Plus,
  ArrowUpRight,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const trackedProperties = [
    {
      id: 'prop-01',
      title: '3 BHK High-Floor Apartment',
      locality: 'Shela, Ahmedabad',
      project: 'Shilp Revanta',
      carpetAreaSqFt: 1450,
      estimatedValueLakhs: 98.5,
      purchasePriceLakhs: 82.0,
      purchaseYear: '2023',
      unrealizedGainLakhs: 16.5,
      gainPercent: 20.1,
      lastValuationDate: '15-Oct-2026',
      vaultDocumentsCount: 4,
    },
    {
      id: 'prop-02',
      title: '2 BHK Resale Unit',
      locality: 'South Bopal, Ahmedabad',
      project: 'Aarohi Elegance',
      carpetAreaSqFt: 880,
      estimatedValueLakhs: 64.2,
      purchasePriceLakhs: 56.5,
      purchaseYear: '2024',
      unrealizedGainLakhs: 7.7,
      gainPercent: 13.6,
      lastValuationDate: '10-Oct-2026',
      vaultDocumentsCount: 3,
    },
  ];

  const totalPortfolioValueLakhs = trackedProperties.reduce((acc, p) => acc + p.estimatedValueLakhs, 0);
  const totalCostLakhs = trackedProperties.reduce((acc, p) => acc + p.purchasePriceLakhs, 0);
  const totalGainLakhs = totalPortfolioValueLakhs - totalCostLakhs;

  return (
    <div className="space-y-8">
      {/* Page Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C8C4BA] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
            Account Dashboard
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#202B3C]">
            Portfolio Intelligence Overview
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/property-vault?action=new"
            className="px-3.5 py-2 bg-[#202B3C] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#202B3C]/90 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Property to Vault</span>
          </Link>
          <Link
            href="/property-intelligence"
            className="px-3.5 py-2 bg-white border border-[#C8C4BA] text-[#202B3C] text-xs font-semibold hover:bg-[#F5F3ED]"
          >
            Instant Valuation
          </Link>
        </div>
      </div>

      {/* Aggregate Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#C8C4BA] p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono text-[#69717B] uppercase tracking-wider">
            Total Monitored Portfolio
          </span>
          <div className="font-mono text-2xl font-bold text-[#202B3C]">
            ₹{(totalPortfolioValueLakhs / 100).toFixed(2)} Cr
          </div>
          <p className="text-[11px] text-[#547568] font-mono">
            {trackedProperties.length} active residential assets
          </p>
        </div>

        <div className="bg-white border border-[#C8C4BA] p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono text-[#69717B] uppercase tracking-wider">
            Aggregate Unrealized Gain
          </span>
          <div className="font-mono text-2xl font-bold text-[#547568]">
            +₹{totalGainLakhs.toFixed(1)} L
          </div>
          <p className="text-[11px] text-[#547568] font-mono">
            +{((totalGainLakhs / totalCostLakhs) * 100).toFixed(1)}% total holding gain
          </p>
        </div>

        <div className="bg-white border border-[#C8C4BA] p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono text-[#69717B] uppercase tracking-wider">
            Average Gross Rental Yield
          </span>
          <div className="font-mono text-2xl font-bold text-[#202B3C]">
            3.4%
          </div>
          <p className="text-[11px] text-[#69717B] font-mono">
            Benchmark: West Ahmedabad
          </p>
        </div>

        <div className="bg-white border border-[#C8C4BA] p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono text-[#69717B] uppercase tracking-wider">
            Vault Documents Stored
          </span>
          <div className="font-mono text-2xl font-bold text-[#202B3C]">
            7 Deeds & Receipts
          </div>
          <p className="text-[11px] text-[#547568] font-mono">
            100% Encrypted & Private
          </p>
        </div>
      </div>

      {/* Properties Table & Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-[#202B3C]">
            Tracked Assets in Personal Vault
          </h2>
          <Link
            href="/dashboard/properties"
            className="text-xs text-[#547568] hover:underline font-semibold flex items-center gap-1"
          >
            <span>View All Properties</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trackedProperties.map((prop) => (
            <div
              key={prop.id}
              className="bg-white border border-[#C8C4BA] p-5 space-y-4 hover:shadow-xs transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display text-base font-bold text-[#202B3C]">
                    {prop.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#69717B] mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-[#547568]" />
                    <span>{prop.project}, {prop.locality}</span>
                  </div>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 bg-[#547568]/10 text-[#547568] font-bold">
                  {prop.carpetAreaSqFt} sq ft carpet
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-[#F5F3ED] border border-[#C8C4BA]/40 font-mono text-xs">
                <div>
                  <span className="text-[#69717B] block text-[10px]">Estimated Value</span>
                  <span className="font-bold text-[#202B3C]">₹{prop.estimatedValueLakhs} Lakhs</span>
                </div>
                <div>
                  <span className="text-[#69717B] block text-[10px]">Acquisition Cost</span>
                  <span className="text-[#202B3C]">₹{prop.purchasePriceLakhs} Lakhs ({prop.purchaseYear})</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-1.5 text-[#547568] font-mono text-[11px]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{prop.vaultDocumentsCount} Deeds & Receipts</span>
                </div>
                <Link
                  href={`/dashboard/property-vault?id=${prop.id}`}
                  className="font-semibold text-[#202B3C] hover:text-[#547568] flex items-center gap-1"
                >
                  <span>Open Vault</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ahmedabad Market Intelligence Dispatch */}
      <div className="bg-white border border-[#C8C4BA] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#C8C4BA]/50 pb-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono font-bold text-[#547568] uppercase">
              Quarterly Market Digest
            </span>
            <h3 className="font-display text-base font-bold text-[#202B3C]">
              Ahmedabad & Gandhinagar Macro Trends (Q3 2026)
            </h3>
          </div>
          <Link
            href="/reports"
            className="text-xs font-semibold text-[#202B3C] hover:underline flex items-center gap-1"
          >
            <span>All Reports</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA]/40 space-y-1">
            <span className="font-semibold text-[#202B3C] block">Western Arc Acceleration</span>
            <p className="text-[#69717B] leading-relaxed">
              Shela and South Bopal capital values demonstrated +8.4% YoY appreciation driven by new AUDA commercial arterial road widening.
            </p>
          </div>
          <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA]/40 space-y-1">
            <span className="font-semibold text-[#202B3C] block">GIFT City IFSC Leasing</span>
            <p className="text-[#69717B] leading-relaxed">
              Rental yields stabilized at 4.4% as international fintech and banking tenants increased employee housing absorption.
            </p>
          </div>
          <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA]/40 space-y-1">
            <span className="font-semibold text-[#202B3C] block">Sub-Registrar Observations</span>
            <p className="text-[#69717B] leading-relaxed">
              Observed secondary resale negotiation discount held narrow at -6.8% below initial seller asking quotations in Bodakdev.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
