'use client';

import { useState, useEffect } from 'react';
import { BuyerWorkspaceShell } from '@/components/procurement/BuyerWorkspaceShell';
import { Truck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BuyerDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function loadDeliveries() {
    setLoading(true);
    try {
      const res = await fetch('/api/procurement/deliveries');
      const json = await res.json();
      if (json.success) setDeliveries(json.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeliveries();
  }, []);

  async function recordGrn(deliveryId: string, orderedQty: number) {
    const receivedStr = window.prompt(`Enter quantity received at site (Ordered: ${orderedQty}):`, String(orderedQty));
    if (!receivedStr) return;
    const acceptedStr = window.prompt('Enter quantity accepted after quality inspection:', receivedStr);
    if (!acceptedStr) return;

    const res = await fetch('/api/procurement/deliveries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'RECORD_GRN',
        deliveryId,
        receivedQuantity: Number(receivedStr),
        acceptedQuantity: Number(acceptedStr),
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setFeedback({ type: 'error', text: json.error || 'Failed to record GRN.' });
    } else {
      setFeedback({ type: 'success', text: `GRN ${json.data.grn.grnNumber} recorded successfully.` });
      await loadDeliveries();
    }
  }

  return (
    <BuyerWorkspaceShell
      title="Deliveries & Goods Receipt (GRN)"
      subtitle="Track supplier dispatches, vehicle/e-way bill references, partial deliveries, and site-verified Goods Receipt Notes."
    >
      {feedback && (
        <div
          className={`p-3.5 border text-xs flex items-center gap-2 rounded-xs ${
            feedback.type === 'success'
              ? 'bg-[#0F6B50]/10 border-[#0F6B50] text-[#0F6B50]'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-[#D5DCE2] p-10 text-center text-xs text-[#4A5568]">
          Loading delivery schedules and GRNs...
        </div>
      ) : deliveries.length === 0 ? (
        <div className="bg-white border border-[#D5DCE2] p-12 text-center space-y-2 rounded-xs">
          <Truck className="w-8 h-8 text-[#9AA7B4] mx-auto" />
          <div className="text-sm font-bold text-[#172B3A]">No dispatches recorded yet</div>
          <p className="text-xs text-[#4A5568]">
            Once a Purchase Order is confirmed and dispatched by a supplier, live tracking and GRN confirmation appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#D5DCE2] rounded-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E9ECEF] border-b border-[#D5DCE2] font-mono text-[10px] uppercase text-[#292F3D]">
                <th className="p-3">Delivery / PO</th>
                <th className="p-3">Vehicle &amp; E-Way Bill</th>
                <th className="p-3 text-right">Ordered vs Received</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF]">
              {deliveries.map((d) => (
                <tr key={d.id}>
                  <td className="p-3 font-mono">
                    <div className="font-bold text-[#172B3A]">{d.deliveryCode}</div>
                    <div className="text-[11px] text-[#4A5568]">PO: {d.purchaseOrderId}</div>
                  </td>
                  <td className="p-3">
                    <div>{d.vehicleNumber || 'Pending vehicle assignment'}</div>
                    <div className="text-[11px] text-[#4A5568]">EWB: {d.ewayBillRef || '—'}</div>
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums">
                    {d.receivedQuantity} / {d.orderedQuantity} {d.unit}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-[#E9ECEF] font-mono text-[10px] font-bold rounded-xs">
                      {d.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {d.status !== 'DELIVERED' && d.status !== 'CANCELLED' && (
                      <button
                        type="button"
                        onClick={() => recordGrn(d.id, d.orderedQuantity)}
                        className="px-3 py-1.5 bg-[#0F6B50] text-white text-[11px] font-semibold rounded-xs"
                      >
                        Record GRN
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </BuyerWorkspaceShell>
  );
}
