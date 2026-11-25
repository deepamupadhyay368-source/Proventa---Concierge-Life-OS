'use client';

import { useState } from 'react';
import { Users, Search, Shield, CheckCircle2 } from 'lucide-react';

export default function AdminUsersPage() {
  const [users] = useState([
    { id: 'usr-01', name: 'Rajiv Mehta', email: 'rajiv.mehta@example.com', role: 'PERSONAL_MEMBER', registered: '12-Aug-2026', propertiesTracked: 2, status: 'ACTIVE' },
    { id: 'usr-02', name: 'Aashna Shah', email: 'aashna@shahfamilytrust.com', role: 'INVESTOR_MEMBER', registered: '01-Jul-2026', propertiesTracked: 7, status: 'ACTIVE' },
    { id: 'usr-03', name: 'Vikram Patel', email: 'dr.vikram.patel@gmail.com', role: 'PROFESSIONAL_MEMBER', registered: '15-May-2026', propertiesTracked: 14, status: 'ACTIVE' },
    { id: 'usr-04', name: 'Sanjay Rawal', email: 'sanjay.rawal@outlook.com', role: 'FREE_USER', registered: '22-Oct-2026', propertiesTracked: 1, status: 'ACTIVE' },
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-[#C8C4BA] pb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
          Directory Management
        </span>
        <h1 className="font-display text-2xl font-bold text-[#202B3C]">
          Registered Users & Subscriptions
        </h1>
      </div>

      <div className="bg-white border border-[#C8C4BA] overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C]">
              <th className="p-3.5 font-bold uppercase tracking-wider">User</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Assigned Role</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Properties Tracked</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Registration Date</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C8C4BA]/50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#F5F3ED]/40 transition-colors">
                <td className="p-3.5">
                  <div className="font-bold text-[#202B3C]">{u.name}</div>
                  <div className="text-[11px] text-[#69717B] font-mono">{u.email}</div>
                </td>
                <td className="p-3.5 font-mono text-[11px] font-bold text-[#547568]">{u.role}</td>
                <td className="p-3.5 font-mono text-[#202B3C]">{u.propertiesTracked} Units</td>
                <td className="p-3.5 font-mono text-[#69717B]">{u.registered}</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                    {u.status}
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
