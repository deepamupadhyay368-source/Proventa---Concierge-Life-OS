'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle2, XCircle, RefreshCw, Star, ShieldCheck } from 'lucide-react';

export default function RequestDetailPage() {
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Approval decision state
  const [approvalNote, setApprovalNote] = useState('');
  const [deciding, setDeciding] = useState(false);

  // Feedback state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      const [reqRes, msgRes] = await Promise.all([
        fetch(`/api/requests`),
        fetch(`/api/requests/${requestId}/messages`),
      ]);
      const reqData = await reqRes.json();
      const msgData = await msgRes.json();

      if (reqData.requests) {
        const found = reqData.requests.find((r: any) => r.id === requestId);
        setRequest(found);
      }
      if (msgData.messages) {
        setMessages(msgData.messages);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Polling for updates
    return () => clearInterval(interval);
  }, [requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });
      if (res.ok) {
        setNewMessage('');
        loadData();
      }
    } finally {
      setSending(false);
    }
  };

  const handleApprovalAction = async (approvalId: string, response: 'APPROVED' | 'DECLINED' | 'CHANGED') => {
    setDeciding(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalId,
          response,
          note: approvalNote || undefined,
        }),
      });
      if (res.ok) {
        setApprovalNote('');
        loadData();
      }
    } finally {
      setDeciding(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/requests/${requestId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });
      if (res.ok) {
        setFeedbackSubmitted(true);
      }
    } catch {}
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-neutral-400">Loading conversation...</div>;
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-neutral-600">Request not found.</p>
        <Link href="/requests" className="text-xs text-brand-700 underline mt-2 inline-block">Back to requests</Link>
      </div>
    );
  }

  const pendingApproval = request.approvals?.find((a: any) => a.status === 'PENDING');
  const booking = request.bookings?.[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/requests" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-medium">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All requests</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 number-mono">ID: {request.publicId}</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 bg-neutral-900 text-white rounded-full">
            {request.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Request Header Summary */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-neutral-900 mb-1">{request.aiSummary || request.rawInput}</h1>
        <p className="text-xs text-neutral-500 leading-relaxed">{request.rawInput}</p>

        <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap gap-4 text-xs text-neutral-500">
          <div><strong className="text-neutral-700">Urgency:</strong> {request.urgency}</div>
          <div><strong className="text-neutral-700">Location:</strong> {request.city?.name || 'Global'}</div>
          <div><strong className="text-neutral-700">Submitted:</strong> {new Date(request.createdAt).toLocaleString()}</div>
        </div>
      </div>

      {/* Pending Approval Card */}
      {pendingApproval && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 uppercase tracking-wider mb-2">
            <ShieldCheck className="h-4 w-4 text-amber-700" />
            <span>Proposal Awaiting Your Approval</span>
          </div>

          <h2 className="text-base font-semibold text-neutral-900 mb-2">{pendingApproval.title}</h2>
          <div className="bg-white border border-amber-200 rounded-xl p-4 text-xs text-neutral-700 mb-4 space-y-1">
            {Object.entries(pendingApproval.details || {}).map(([k, v]) => (
              <div key={k} className="flex justify-between py-1 border-b border-neutral-50 last:border-0">
                <span className="font-medium text-neutral-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                <span className="font-semibold text-neutral-900">{String(v)}</span>
              </div>
            ))}
          </div>

          <input
            type="text"
            placeholder="Optional change request note or preferences..."
            value={approvalNote}
            onChange={(e) => setApprovalNote(e.target.value)}
            className="w-full px-3 py-2 border border-amber-300 rounded-lg text-xs bg-white mb-3 focus:outline-none"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleApprovalAction(pendingApproval.id, 'APPROVED')}
              disabled={deciding}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-700 text-white text-xs font-medium rounded-lg hover:bg-green-800 disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Approve & Proceed</span>
            </button>

            <button
              onClick={() => handleApprovalAction(pendingApproval.id, 'CHANGED')}
              disabled={deciding}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-neutral-300 bg-white text-neutral-700 text-xs font-medium rounded-lg hover:bg-neutral-50 disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Request Changes</span>
            </button>

            <button
              onClick={() => handleApprovalAction(pendingApproval.id, 'DECLINED')}
              disabled={deciding}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-neutral-500 hover:text-red-700 disabled:opacity-50 ml-auto"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Decline</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmed Booking Card */}
      {booking && booking.status === 'CONFIRMED' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-green-900 uppercase tracking-wider mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-700" />
            <span>Booking Confirmed</span>
          </div>
          <p className="text-sm font-semibold text-neutral-900">
            Reference: <span className="number-mono font-bold text-green-800">{booking.confirmationRef || 'Confirmed'}</span>
          </p>
          <div className="text-xs text-neutral-600 mt-2 space-y-1">
            {Object.entries(booking.details || {}).map(([k, v]) => (
              <p key={k}><strong className="capitalize">{k}:</strong> {String(v)}</p>
            ))}
          </div>
        </div>
      )}

      {/* Message Thread */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 min-h-[300px] flex flex-col justify-between">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isMe = msg.senderRole === 'CUSTOMER';
            const isSystem = msg.senderRole === 'SYSTEM';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center my-4">
                  <span className="inline-block px-3 py-1 bg-neutral-100 rounded-full text-[11px] text-neutral-500">
                    {msg.content}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-neutral-400 mb-1 px-1">
                  {isMe ? 'You' : 'Proventa Concierge'} · {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div
                  className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-neutral-900 text-white rounded-br-xs'
                      : 'bg-neutral-100 text-neutral-900 rounded-bl-xs'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="pt-4 border-t border-neutral-100 flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Reply to your concierge..."
            className="flex-1 px-3 py-2.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="p-2.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Post-Completion Feedback Module */}
      {request.status === 'COMPLETED' && !feedbackSubmitted && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 text-center">
          <h2 className="text-sm font-semibold text-neutral-900 mb-1">How did we do?</h2>
          <p className="text-xs text-neutral-500 mb-4">Your feedback directly shapes how your concierge handles future requests.</p>

          <form onSubmit={handleFeedbackSubmit} className="max-w-md mx-auto space-y-3">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 text-lg ${star <= rating ? 'text-amber-500' : 'text-neutral-300'}`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional comment about your experience..."
              className="w-full p-2.5 border border-neutral-200 rounded-lg text-xs bg-white focus:outline-none resize-none"
            />

            <button
              type="submit"
              className="px-5 py-2 bg-neutral-900 text-white text-xs font-medium rounded-lg hover:bg-neutral-800"
            >
              Submit Feedback
            </button>
          </form>
        </div>
      )}

      {feedbackSubmitted && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 text-center">
          Thank you for your feedback! It has been recorded.
        </div>
      )}
    </div>
  );
}
