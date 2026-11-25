'use client';

import { ShieldCheck, Activity } from 'lucide-react';

export default function AdminAuditPage() {
  const auditLogs = [
    { id: 'AUD-8801', timestamp: '24-Oct-2026 14:32:11', admin: 'system.analyst@proventa.in', action: 'VERIFY_TRANSACTION_BATCH', target: 'Garvi Sub-Registrar Batch Q3 (410 records)', status: 'SUCCESS' },
    { id: 'AUD-8802', timestamp: '20-Oct-2026 11:15:04', admin: 'editorial@proventa.in', action: 'PUBLISH_RESEARCH_REPORT', target: 'Ahmedabad Residential Q3 2026 Dossier', status: 'SUCCESS' },
    { id: 'AUD-8803', timestamp: '15-Oct-2026 09:44:28', admin: 'data.desk@proventa.in', action: 'RECALIBRATE_LOCALITY_MEDIAN', target: 'Shela Weighted Average updated to ₹4,950', status: 'SUCCESS' },
    { id: 'AUD-8804', timestamp: '10-Oct-2026 16:20:55', admin: 'system.analyst@proventa.in', action: 'AUDIT_RERA_FILING', target: 'Shilp Revanta QPR Compliance Verified', status: 'SUCCESS' },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[#C8C4BA] pb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
          System Integrity
        </span>
        <h1 className="font-display text-2xl font-bold text-[#202B3C]">
          System Audit & Verification Trail
        </h1>
        <p className="text-xs text-[#69717B] mt-1">
          Immutable audit record of all dataset ingestions, valuation calibrations, and administrative modifications.
        </p>
      </div>

      <div className="bg-white border border-[#C8C4BA] overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C]">
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Audit ID</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Timestamp</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Admin User</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Action Type</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Target Entity</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C8C4BA]/50 font-mono text-[11px]">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#F5F3ED]/40 transition-colors">
                <td className="p-3.5 font-bold text-[#202B3C]">{log.id}</td>
                <td className="p-3.5 text-[#69717B]">{log.timestamp}</td>
                <td className="p-3.5 font-sans font-medium text-[#202B3C]">{log.admin}</td>
                <td className="p-3.5 text-[#547568] font-bold">{log.action}</td>
                <td className="p-3.5 font-sans text-[#202B3C]">{log.target}</td>
                <td className="p-3.5 font-sans">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono font-bold text-[10px]">
                    {log.status}
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
