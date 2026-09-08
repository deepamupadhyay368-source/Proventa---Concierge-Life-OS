'use client';

import { useState, useEffect } from 'react';
import { Store, CheckCircle2, Plus, Phone, Globe, MapPin, Cpu, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminProvidersPage() {
  const [activeTab, setActiveTab] = useState<'LOCAL_NETWORK' | 'GATEWAY_INTEGRATIONS' | 'TRANSACTIONS'>('GATEWAY_INTEGRATIONS');
  const [providers, setProviders] = useState<any[]>([]);
  const [gatewayData, setGatewayData] = useState<{
    gatewayProviders?: any[];
    transactions?: any[];
    webhookLogs?: any[];
  }>({});
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [bookingMethod, setBookingMethod] = useState('PHONE');
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [provRes, gwRes] = await Promise.all([
        fetch('/api/admin/providers'),
        fetch('/api/admin/gateway-integrations'),
      ]);
      const provData = await provRes.json();
      const gwData = await gwRes.json();
      if (provData.providers) setProviders(provData.providers);
      setGatewayData(gwData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          categoryId: categoryId || 'cat_dining',
          address,
          phone,
          bookingMethod,
          notes,
        }),
      });
      if (res.ok) {
        setName('');
        setAddress('');
        setPhone('');
        setNotes('');
        loadData();
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Provider Gateway & Partner Operations</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Configure live external connectors, inspect multi-provider routing, and audit transactions.</p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveTab('GATEWAY_INTEGRATIONS')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'GATEWAY_INTEGRATIONS'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          Standard Gateway Connectors
        </button>
        <button
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'TRANSACTIONS'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          Live Transaction Ledger ({gatewayData.transactions?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('LOCAL_NETWORK')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'LOCAL_NETWORK'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          Local Verified Network ({providers.length})
        </button>
      </div>

      {/* GATEWAY INTEGRATIONS TAB */}
      {activeTab === 'GATEWAY_INTEGRATIONS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(gatewayData.gatewayProviders || []).map((gw: any) => (
              <div key={gw.providerKey} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-900 border border-brand-200/60">
                    {gw.category}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    gw.status === 'PRODUCTION_ACTIVE' ? 'bg-emerald-50 text-emerald-700' :
                    gw.status === 'SANDBOX' ? 'bg-amber-50 text-amber-800 border border-amber-200/60' :
                    'bg-neutral-100 text-neutral-600'
                  }`}>
                    {gw.status === 'SANDBOX' && <Cpu className="h-3 w-3 text-amber-600" />}
                    {gw.status === 'PRODUCTION_ACTIVE' && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                    {gw.status === 'NOT_CONNECTED' && <AlertCircle className="h-3 w-3 text-neutral-400" />}
                    <span>{gw.status}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-neutral-900">{gw.name}</h3>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">{gw.providerKey}</p>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                  <span>Routing Priority: #{gw.priority}</span>
                  <span className="font-semibold text-neutral-700">{gw.isSandbox ? 'Test Sandbox Active' : 'Live Gateway'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TRANSACTIONS TAB */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Txn ID</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Reference / PNR</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {(gatewayData.transactions || []).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">No external transactions recorded yet.</td>
                  </tr>
                ) : (
                  (gatewayData.transactions || []).map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-neutral-50/50">
                      <td className="px-4 py-3 font-mono font-medium text-neutral-900">{tx.transactionId}</td>
                      <td className="px-4 py-3 uppercase text-[10px] font-bold text-brand-800">{tx.service}</td>
                      <td className="px-4 py-3 text-neutral-700 font-medium">{tx.providerName}</td>
                      <td className="px-4 py-3 font-semibold text-neutral-900">₹{(tx.amount / 100).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 font-mono text-neutral-600">{tx.providerReference || 'Pending'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' :
                          tx.status === 'FAILED' ? 'bg-rose-50 text-rose-700' :
                          tx.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-400">{new Date(tx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LOCAL NETWORK TAB */}
      {activeTab === 'LOCAL_NETWORK' && (
        <div className="space-y-6">

      {/* Add Provider Form */}
      <form onSubmit={handleAddProvider} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Add & Verify New Provider</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-neutral-600 font-medium mb-1">Provider Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. The Oberoi, Private Dining Desk"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-neutral-600 font-medium mb-1">Direct Phone</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-neutral-600 font-medium mb-1">Booking Method</label>
            <select
              value={bookingMethod}
              onChange={(e) => setBookingMethod(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none"
            >
              <option value="PHONE">Phone Reservation</option>
              <option value="WHATSAPP">WhatsApp Business</option>
              <option value="EMAIL">Email Confirmation</option>
              <option value="API">API Integration</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-neutral-600 font-medium mb-1">Address / Venue</label>
            <input
              type="text"
              placeholder="e.g. Dr. Zakir Hussain Marg, New Delhi"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-neutral-600 font-medium mb-1">Concierge Notes</label>
            <input
              type="text"
              placeholder="e.g. 24h notice needed for weekend dinner"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={adding}
          className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 disabled:opacity-50"
        >
          {adding ? 'Saving...' : 'Add Verified Provider'}
        </button>
      </form>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-xs text-neutral-400 col-span-3">Loading network...</p>
        ) : (
          providers.map((p) => (
            <div key={p.id} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded">
                  {p.category?.name || 'Category'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" /> Score {p.reliabilityScore}%
                </span>
              </div>

              <h3 className="text-sm font-bold text-neutral-900">{p.name}</h3>
              {p.description && <p className="text-xs text-neutral-500 line-clamp-2">{p.description}</p>}

              <div className="text-xs text-neutral-600 space-y-1 pt-2 border-t border-neutral-100">
                {p.address && (
                  <p className="flex items-center gap-1.5 line-clamp-1">
                    <MapPin className="h-3 w-3 text-neutral-400 flex-shrink-0" />
                    <span>{p.address}</span>
                  </p>
                )}
                {p.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-neutral-400 flex-shrink-0" />
                    <span>{p.phone}</span>
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
        </div>
      )}
    </div>
  );
}
