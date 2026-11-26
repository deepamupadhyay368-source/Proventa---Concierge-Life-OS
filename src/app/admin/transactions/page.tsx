'use client';

import { useState } from 'react';
import { Database, Plus, AlertCircle, Filter } from 'lucide-react';

export default function AdminTransactionsPage() {
  const transactions = [
    { id: 'SMPL-AHM-9021', date: '24-Sep-2026', locality: 'Shela', project: 'Shilp Revanta', carpetSqFt: 1450, regAmountLakhs: 82.5, rateSqFt: 5689, classification: 'CALIBRATION_BENCHMARK', subRegistrar: 'Sanand SRO (Field Sample)' },
    { id: 'SMPL-AHM-9022', date: '21-Sep-2026', locality: 'Bodakdev', project: 'Takshashila Air', carpetSqFt: 2950, regAmountLakhs: 345.0, rateSqFt: 11694, classification: 'CALIBRATION_BENCHMARK', subRegistrar: 'Ahmedabad-City (West) (Field Sample)' },
    { id: 'SMPL-AHM-9023', date: '18-Sep-2026', locality: 'South Bopal', project: 'Aarohi Elegance', carpetSqFt: 880, regAmountLakhs: 48.0, rateSqFt: 5454, classification: 'CALIBRATION_BENCHMARK', subRegistrar: 'Sanand SRO (Field Sample)' },
    { id: 'SMPL-AHM-9024', date: '14-Sep-2026', locality: 'GIFT City', project: 'Sobha Dream Heights', carpetSqFt: 1120, regAmountLakhs: 89.0, rateSqFt: 7946, classification: 'CALIBRATION_BENCHMARK', subRegistrar: 'Gandhinagar Revenue (Field Sample)' },
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold uppercase tracking-wider font-mono text-[11px]">
            CALIBRATION BENCHMARK REPOSITORY &bull; STATUTORY INGESTION IN PROGRESS
          </p>
          <p className="text-amber-800 leading-relaxed">
            The records listed below are research calibration benchmarks used for hedonic engine testing across Ahmedabad western corridors. Direct automated integration with Gujarat revenue sub-registrar deed archives is currently being established; records must be treated as model test benchmarks rather than statutory deed certifications.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center border-b border-[#C8C4BA] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
            Evidence Records &bull; Calibration Staging
          </span>
          <h1 className="font-display text-2xl font-bold text-[#202B3C]">
            Model Calibration Benchmark Transactions
          </h1>
        </div>

        <button
          onClick={() => alert('Batch deed upload dialog.')}
          className="px-3.5 py-2 bg-[#202B3C] text-white text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Ingest Calibration Batch</span>
        </button>
      </div>

      <div className="bg-white border border-[#C8C4BA] overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C]">
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Sample ID</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Date</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Project & Locality</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Carpet Area</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Benchmark Amount</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Derived ₹/Sq Ft</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Source Context</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C8C4BA]/50 font-mono">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-[#F5F3ED]/40 transition-colors">
                <td className="p-3.5 font-bold text-[#202B3C]">{tx.id}</td>
                <td className="p-3.5 text-[#69717B]">{tx.date}</td>
                <td className="p-3.5 font-sans">
                  <div className="font-bold text-[#202B3C]">{tx.project}</div>
                  <div className="text-[11px] text-[#69717B]">{tx.locality}</div>
                </td>
                <td className="p-3.5 text-[#202B3C]">{tx.carpetSqFt} sq ft</td>
                <td className="p-3.5 font-bold text-[#202B3C]">₹{tx.regAmountLakhs} L</td>
                <td className="p-3.5 font-bold text-[#547568]">₹{tx.rateSqFt}</td>
                <td className="p-3.5 font-sans text-[#69717B]">{tx.subRegistrar}</td>
                <td className="p-3.5 font-sans">
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-mono font-bold">
                    {tx.classification}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
