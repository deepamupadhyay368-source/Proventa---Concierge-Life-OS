'use client';

import { useState, useEffect } from 'react';
import { BuyerWorkspaceShell } from '@/components/procurement/BuyerWorkspaceShell';
import { Receipt, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function BuyerInvoicesPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/procurement/invoices');
        const json = await res.json();
        if (json.success) setRecords(json.data || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <BuyerWorkspaceShell
      title="Invoices & Three-Way Reconciliation"
      subtitle="Automated integer-paise three-way matching across Purchase Order + Goods Receipt (GRN) + Supplier Invoice. Discrepancies automatically place payment on hold."
    >
      {loading ? (
        <div className="bg-white border border-[#D5DCE2] p-10 text-center text-xs text-[#4A5568]">
          Loading three-way match reconciliation ledger...
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white border border-[#D5DCE2] p-12 text-center space-y-2 rounded-xs">
          <Receipt className="w-8 h-8 text-[#9AA7B4] mx-auto" />
          <div className="text-sm font-bold text-[#172B3A]">No supplier invoices reconciled yet</div>
          <p className="text-xs text-[#4A5568]">
            Uploaded supplier invoices are automatically verified against PO quantities, approved unit rates, GST, and site GRN receipts.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#D5DCE2] rounded-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E9ECEF] border-b border-[#D5DCE2] font-mono text-[10px] uppercase text-[#292F3D]">
                <th className="p-3">Invoice / PO</th>
                <th className="p-3">Supplier GSTIN</th>
                <th className="p-3 text-right">PO Value</th>
                <th className="p-3 text-right">GRN Value</th>
                <th className="p-3 text-right">Invoice Total</th>
                <th className="p-3">3-Way Status</th>
                <th className="p-3">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF]">
              {records.map((r) => (
                <tr key={r.id} className={r.status !== 'MATCHED' ? 'bg-amber-50/60' : ''}>
                  <td className="p-3 font-mono">
                    <div className="font-bold text-[#172B3A]">{r.invoiceNumber}</div>
                    <div className="text-[11px] text-[#4A5568]">{r.purchaseOrderId}</div>
                  </td>
                  <td className="p-3 font-mono text-[11px]">{r.supplierGstin}</td>
                  <td className="p-3 text-right font-mono tabular-nums">{r.poTotalFormatted}</td>
                  <td className="p-3 text-right font-mono tabular-nums">{r.grnValueFormatted}</td>
                  <td className="p-3 text-right font-mono font-bold tabular-nums">{r.invoiceTotalFormatted}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-bold rounded-xs ${
                        r.status === 'MATCHED'
                          ? 'bg-[#0F6B50]/10 text-[#0F6B50]'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {r.status === 'MATCHED' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px]">{r.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </BuyerWorkspaceShell>
  );
}
