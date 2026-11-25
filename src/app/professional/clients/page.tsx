'use client';

import { useState } from 'react';
import { Users, Plus, Building, FileText, ArrowUpRight } from 'lucide-react';

export default function ProfessionalClientsPage() {
  const [clients, setClients] = useState([
    { id: 'cli-01', name: 'Dr. Vikram Patel & Family', aum: '₹4.12 Cr', units: 4, primaryLocality: 'Bodakdev & Satellite', lastReview: '14-Oct-2026' },
    { id: 'cli-02', name: 'Aashna Shah Family Trust', aum: '₹8.40 Cr', units: 7, primaryLocality: 'Shela & GIFT City', lastReview: '08-Oct-2026' },
    { id: 'cli-03', name: 'Kiran Desai (NRI Portfolio)', aum: '₹2.95 Cr', units: 3, primaryLocality: 'Science City & Thaltej', lastReview: '20-Sep-2026' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [locality, setLocality] = useState('Bodakdev, Ahmedabad');

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    setClients([
      {
        id: `cli-${Date.now()}`,
        name: clientName,
        aum: '₹0.00 Cr',
        units: 0,
        primaryLocality: locality,
        lastReview: 'Just Onboarded',
      },
      ...clients,
    ]);
    setClientName('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C8C4BA] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
            Client Segregation
          </span>
          <h1 className="font-display text-2xl font-bold text-[#202B3C]">
            Client Portfolio Records
          </h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 bg-[#202B3C] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#202B3C]/90 shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Client Entity</span>
        </button>
      </div>

      <div className="bg-white border border-[#C8C4BA] overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C]">
              <th className="p-3.5 font-bold uppercase tracking-wider">Client / Entity Name</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Portfolio AUM</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Assets</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Core Localities</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Last Review</th>
              <th className="p-3.5 font-bold uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C8C4BA]/50">
            {clients.map((c) => (
              <tr key={c.id} className="hover:bg-[#F5F3ED]/40 transition-colors">
                <td className="p-3.5 font-bold text-[#202B3C]">{c.name}</td>
                <td className="p-3.5 font-mono text-[#547568] font-bold">{c.aum}</td>
                <td className="p-3.5 font-mono text-[#202B3C]">{c.units} units</td>
                <td className="p-3.5 text-[#69717B]">{c.primaryLocality}</td>
                <td className="p-3.5 text-[#69717B] font-mono">{c.lastReview}</td>
                <td className="p-3.5 text-right">
                  <button
                    onClick={() => alert(`Opening client dossier for: ${c.name}`)}
                    className="px-2.5 py-1 bg-[#202B3C] text-white text-[11px] font-semibold"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#202B3C] max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#C8C4BA] pb-3">
              <h3 className="font-display text-lg font-bold text-[#202B3C]">
                Onboard New Client Entity
              </h3>
              <button onClick={() => setShowModal(false)} className="text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddClient} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Client / Trust / Entity Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Chandra Family Office"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="w-full p-2 border border-[#C8C4BA] bg-white text-[#202B3C] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Primary Market Focus</label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  required
                  className="w-full p-2 border border-[#C8C4BA] bg-white text-[#202B3C] focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#202B3C] text-white font-semibold text-xs hover:bg-[#202B3C]/90"
                >
                  Create Client Portfolio
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-white border border-[#C8C4BA] text-[#202B3C] font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
