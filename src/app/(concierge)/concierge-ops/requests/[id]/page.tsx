'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Sparkles, ShieldCheck, CheckCircle2, AlertCircle, FileText, Lock } from 'lucide-react';

export default function ConciergeWorkspacePage() {
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [outMessage, setOutMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Proposal builder state
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalPrice, setProposalPrice] = useState('');
  const [proposalTerms, setProposalTerms] = useState('');

  // Booking recorder state
  const [bookingRef, setBookingRef] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  const loadData = async () => {
    try {
      const [queueRes, msgRes, noteRes] = await Promise.all([
        fetch('/api/concierge/queue'),
        fetch(`/api/requests/${requestId}/messages`),
        fetch(`/api/concierge/requests/${requestId}/notes`),
      ]);
      const q = await queueRes.json();
      const m = await msgRes.json();
      const n = await noteRes.json();

      if (q.requests) {
        const found = q.requests.find((r: any) => r.id === requestId);
        setRequest(found);
      }
      if (m.messages) setMessages(m.messages);
      if (n.notes) setNotes(n.notes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [requestId]);

  const sendCustomerMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outMessage.trim()) return;

    await fetch(`/api/requests/${requestId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: outMessage.trim() }),
    });
    setOutMessage('');
    loadData();
  };

  const addInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    await fetch(`/api/concierge/requests/${requestId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newNote.trim() }),
    });
    setNewNote('');
    loadData();
  };

  const sendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalTitle.trim()) return;

    await fetch(`/api/concierge/requests/${requestId}/approval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: proposalTitle.trim(),
        details: {
          price: proposalPrice || 'Standard pricing',
          cancellation: proposalTerms || 'Cancellation allowed up to 4 hours prior',
        },
      }),
    });
    setProposalTitle('');
    setProposalPrice('');
    setProposalTerms('');
    loadData();
  };

  const recordBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRef.trim()) return;

    await fetch(`/api/concierge/requests/${requestId}/booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        confirmationRef: bookingRef.trim(),
        details: { scheduledTime: bookingTime || 'Confirmed' },
      }),
    });
    setBookingRef('');
    setBookingTime('');
    loadData();
  };

  const updateStatus = async (status: string) => {
    await fetch(`/api/concierge/requests/${requestId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadData();
  };

  if (loading || !request) {
    return <div className="p-12 text-center text-xs text-neutral-400">Loading workspace...</div>;
  }

  const customer = request.customer;
  const preferences = customer?.preferences || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-neutral-200 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/concierge-ops/queue" className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-neutral-900">{customer?.user?.name || 'Customer'}</h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-neutral-100 rounded-full">
                {request.status.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-neutral-400 number-mono">ID: {request.publicId}</span>
            </div>
            <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">{request.rawInput}</p>
          </div>
        </div>

        {/* State Transition Controls */}
        <div className="flex items-center gap-2">
          {request.status !== 'COMPLETED' && (
            <button
              onClick={() => updateStatus('COMPLETED')}
              className="px-3 py-1.5 bg-green-800 text-white rounded-lg text-xs font-medium hover:bg-green-900 transition-colors"
            >
              Mark Completed
            </button>
          )}
          {request.status !== 'CANCELLED' && (
            <button
              onClick={() => updateStatus('CANCELLED')}
              className="px-3 py-1.5 border border-neutral-200 text-neutral-600 rounded-lg text-xs hover:bg-neutral-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Three Column Operating Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (3 cols): Customer Profile, Preferences & AI Brief */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Customer Profile & Taste</h2>
            <div className="text-xs space-y-1">
              <p><strong className="text-neutral-700">Email:</strong> {customer?.user?.email}</p>
              <p><strong className="text-neutral-700">Location:</strong> {customer?.city || 'Cohort 1 Member'}</p>
              <p><strong className="text-neutral-700">Preferred Channel:</strong> {customer?.preferredComm || 'In-App'}</p>
            </div>

            <div className="pt-3 border-t border-neutral-100">
              <span className="text-[11px] font-semibold text-neutral-500 block mb-2">Explicit Preferences ({preferences.length})</span>
              {preferences.length === 0 ? (
                <p className="text-[11px] text-neutral-400">No explicit preferences recorded yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {preferences.map((p: any) => (
                    <div key={p.id} className="p-2 bg-neutral-50 rounded text-[11px] border border-neutral-100">
                      <span className="font-semibold text-neutral-800 capitalize">{p.key}:</span>{' '}
                      <span className="text-neutral-600">{typeof p.value === 'object' ? JSON.stringify(p.value) : p.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Request Extraction */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-800">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Intelligence Brief</span>
            </div>
            <div className="text-xs text-neutral-600 space-y-1">
              <p><strong className="text-neutral-700">Category:</strong> {request.category?.name || 'General'}</p>
              <p><strong className="text-neutral-700">Urgency:</strong> {request.urgency}</p>
              <p><strong className="text-neutral-700">Summary:</strong> {request.aiSummary}</p>
            </div>
          </div>
        </div>

        {/* Middle Column (5 cols): Live Conversation & Message Composer */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[550px]">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">Customer Conversation Thread</h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {messages.map((m) => {
                const isConcierge = m.senderRole === 'CONCIERGE';
                const isSystem = m.senderRole === 'SYSTEM';

                if (isSystem) {
                  return (
                    <div key={m.id} className="text-center my-2">
                      <span className="text-[10px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                        {m.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={m.id} className={`flex flex-col ${isConcierge ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-neutral-400 mb-0.5 px-1">
                      {isConcierge ? 'You (Concierge)' : customer?.user?.name || 'Customer'} · {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className={`p-3 rounded-xl text-xs max-w-sm ${isConcierge ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-800'}`}>
                      {m.content}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outbound Message Composer */}
          <form onSubmit={sendCustomerMessage} className="pt-4 border-t border-neutral-100 flex gap-2">
            <input
              type="text"
              value={outMessage}
              onChange={(e) => setOutMessage(e.target.value)}
              placeholder="Type message to customer..."
              className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <button type="submit" className="p-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800">
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Right Column (3 cols): Approval Builder, Booking Recorder & Private Notes */}
        <div className="lg:col-span-3 space-y-4">
          {/* Send Proposal (Approval Card) */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 uppercase">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
              <span>Send Approval Card</span>
            </div>
            <form onSubmit={sendProposal} className="space-y-2 text-xs">
              <input
                type="text"
                required
                placeholder="Proposal title (e.g. Agashiye Heritage Dinner)"
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-neutral-200 rounded text-xs"
              />
              <input
                type="text"
                placeholder="Price info (e.g. ₹1,500/person)"
                value={proposalPrice}
                onChange={(e) => setProposalPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-neutral-200 rounded text-xs"
              />
              <button
                type="submit"
                className="w-full py-1.5 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-neutral-800"
              >
                Send to Customer for Approval
              </button>
            </form>
          </div>

          {/* Record Booking Confirmation */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 uppercase">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              <span>Record Booking</span>
            </div>
            <form onSubmit={recordBooking} className="space-y-2 text-xs">
              <input
                type="text"
                required
                placeholder="Genuine Confirmation Ref / PNR"
                value={bookingRef}
                onChange={(e) => setBookingRef(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-neutral-200 rounded text-xs number-mono"
              />
              <input
                type="text"
                placeholder="Scheduled Time / Notes"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-neutral-200 rounded text-xs"
              />
              <button
                type="submit"
                className="w-full py-1.5 bg-green-800 text-white rounded text-xs font-medium hover:bg-green-900"
              >
                Confirm & Notify Customer
              </button>
            </form>
          </div>

          {/* Internal Private Notes (NEVER customer-visible) */}
          <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase">
              <Lock className="h-3.5 w-3.5 text-amber-700" />
              <span>Internal Concierge Notes</span>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {notes.map((n) => (
                <div key={n.id} className="p-2 bg-white rounded border border-amber-200/60 text-[11px] text-neutral-700">
                  <p>{n.content}</p>
                  <span className="text-[9px] text-neutral-400 block mt-1">
                    {n.author?.name} · {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={addInternalNote} className="flex gap-1.5">
              <input
                type="text"
                placeholder="Add private note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 px-2.5 py-1.5 border border-amber-300 rounded text-xs bg-white focus:outline-none"
              />
              <button type="submit" className="px-3 py-1.5 bg-amber-800 text-white rounded text-xs font-medium">
                Save
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
