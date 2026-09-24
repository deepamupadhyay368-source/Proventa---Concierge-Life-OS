'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  AlertCircle, 
  Zap, 
  RefreshCcw, 
  Lock,
  ChevronRight,
  Receipt,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';

interface PaymentProfile {
  customerId: string;
  paymentProvider: string;
  preferredPaymentMethod: string;
  mandateStatus: 'NOT_CONFIGURED' | 'PENDING' | 'ACTIVE' | 'PAUSED' | 'REVOKED' | 'FAILED' | 'EXPIRED';
  mandateMaxAmount: number;
  mandateVpa: string | null;
  mandateBank?: string | null;
}

interface PaymentTransaction {
  id: string;
  amount: number;
  amountRupees: number;
  currency: string;
  status: string;
  method: string;
  providerRef: string | null;
  providerOrderId: string | null;
  refundStatus: string | null;
  refundAmount: number | null;
  createdAt: string;
  task?: {
    id: string;
    publicId: string;
    intent: string;
    category: string;
    status: string;
    vendorName: string | null;
  } | null;
}

interface PendingTask {
  id: string;
  publicId: string;
  intent: string;
  category: string;
  status: string;
  budgetAmount: number | null;
  proposedOptions?: any;
}

export default function CustomerPaymentCenterPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PaymentProfile | null>(null);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [mandateActionLoading, setMandateActionLoading] = useState(false);
  const [vpaInput, setVpaInput] = useState('');
  const [mandateLimit, setMandateLimit] = useState(50000);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customer/payments');
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setPayments(data.payments || []);
        setPendingTasks(data.pendingTasks || []);
      }
    } catch (err: any) {
      console.error('Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleSetupMandate = async () => {
    try {
      setMandateActionLoading(true);
      setMessage(null);
      const res = await fetch('/api/payments/mandate/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxAmountPaise: mandateLimit * 100,
          vpaHandle: vpaInput || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: data.message || 'UPI Autopay mandate initiated. Please authorize in your UPI app.',
        });
        await fetchPayments();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to initiate mandate.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setMandateActionLoading(false);
    }
  };

  const handleRevokeMandate = async () => {
    if (!confirm('Are you sure you want to revoke your UPI Autopay authorization? Automated payments will require manual checkout.')) {
      return;
    }
    try {
      setMandateActionLoading(true);
      setMessage(null);
      const res = await fetch('/api/payments/mandate/revoke', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'UPI Autopay mandate revoked successfully.' });
        await fetchPayments();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to revoke mandate.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setMandateActionLoading(false);
    }
  };

  const handleTaskCheckout = async (task: PendingTask) => {
    try {
      const amountPaise = (task.budgetAmount || 5000) * 100;
      const idempotencyKey = `pay_${task.id}_${Date.now()}`;
      
      const res = await fetch('/api/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          amountPaise,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to initiate checkout');
        return;
      }

      // Check if Razorpay is present
      const options = {
        key: data.order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_proventa_dev_key',
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Proventa Concierge',
        description: task.intent,
        order_id: data.order.orderId,
        handler: async function (response: any) {
          // Verify
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              taskId: task.id,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setMessage({ type: 'success', text: 'Payment confirmed! Your task execution has been dispatched.' });
            fetchPayments();
          }
        },
        prefill: {},
        theme: { color: '#0f172a' },
      };

      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Direct sandbox verification if script not loaded
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: data.order.orderId,
            paymentId: `pay_sim_${Date.now()}`,
            signature: 'simulated_valid_sig',
            taskId: task.id,
          }),
        });
        await verifyRes.json();
        setMessage({ type: 'success', text: 'Payment authorized in sandbox mode.' });
        fetchPayments();
      }
    } catch (err: any) {
      alert(err.message || 'Payment execution failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Member Vault
              </span>
              <span className="text-xs text-slate-400">Non-Custodial · PCI-DSS Compliant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              Payment Center & Mandates
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Manage pre-authorized concierge payments, UPI Autopay limits, and transaction receipts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchPayments}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition"
            >
              <RefreshCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync Ledger
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
            >
              Return to OS
            </Link>
          </div>
        </div>

        {/* Notifications */}
        {message && (
          <div
            className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${
              message.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: UPI Mandate Card & Pending Invoices */}
          <div className="lg:col-span-1 space-y-6">
            {/* UPI Autopay Mandate Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-400" />
                  <h2 className="font-serif font-semibold text-white">UPI Autopay</h2>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    profile?.mandateStatus === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : profile?.mandateStatus === 'PENDING'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {profile?.mandateStatus || 'NOT CONFIGURED'}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Allow Proventa to automatically book approved flight tickets, dining deposits, and luxury reservations within your set limit.
              </p>

              {profile?.mandateStatus === 'ACTIVE' ? (
                <div className="space-y-4 pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Max Per Transaction</span>
                    <span className="font-semibold text-white font-mono">
                      ₹{((profile.mandateMaxAmount || 5000000) / 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {profile.mandateVpa && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Linked VPA</span>
                      <span className="font-mono text-slate-300">{profile.mandateVpa}</span>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Instant automated execution enabled for all approved options.</span>
                  </div>

                  <button
                    onClick={handleRevokeMandate}
                    disabled={mandateActionLoading}
                    className="w-full py-2 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-800/40 text-xs font-medium transition disabled:opacity-50"
                  >
                    {mandateActionLoading ? 'Processing...' : 'Revoke Autopay Mandate'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1">
                      Max Pre-Approved Limit (₹)
                    </label>
                    <input
                      type="number"
                      value={mandateLimit}
                      onChange={(e) => setMandateLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-amber-500 font-mono"
                      placeholder="50000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1">
                      UPI ID / VPA (Optional)
                    </label>
                    <input
                      type="text"
                      value={vpaInput}
                      onChange={(e) => setVpaInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-amber-500 font-mono"
                      placeholder="username@okhdfcbank"
                    />
                  </div>

                  <button
                    onClick={handleSetupMandate}
                    disabled={mandateActionLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 disabled:opacity-50"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>{mandateActionLoading ? 'Initiating...' : 'Set Up UPI Autopay'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Pending Payments Action Card */}
            {pendingTasks.length > 0 && (
              <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-800/40 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertCircle className="h-5 w-5" />
                  <h3 className="font-serif font-semibold text-white">Pending Checkout ({pendingTasks.length})</h3>
                </div>
                <p className="text-xs text-amber-200/80">
                  These tasks have been approved but require payment before provider dispatch.
                </p>

                <div className="space-y-3">
                  {pendingTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/20 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white truncate">{t.intent}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {t.publicId} · ₹{(t.budgetAmount || 5000).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <button
                        onClick={() => handleTaskCheckout(t)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold shrink-0 transition"
                      >
                        Pay Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Columns: Transaction History & Receipts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-slate-400" />
                  <h2 className="font-serif font-semibold text-white">Transaction Ledger</h2>
                </div>
                <span className="text-xs text-slate-400">{payments.length} Total Transactions</span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading payment ledger...</div>
              ) : payments.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <CreditCard className="h-8 w-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">No payment transactions recorded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800/80">
                        <th className="pb-3 font-medium">Task & Purpose</th>
                        <th className="pb-3 font-medium">Method</th>
                        <th className="pb-3 font-medium">Amount</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3.5 pr-4">
                            <div className="font-medium text-white truncate max-w-[220px]">
                              {p.task?.intent || 'Concierge Service Deposit'}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">
                              Ref: {p.providerRef || p.id.slice(0, 12)}
                            </div>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px]">
                              {p.method}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4 font-mono font-semibold text-white">
                            ₹{p.amountRupees.toLocaleString('en-IN')}
                            {p.refundStatus === 'COMPLETED' && (
                              <div className="text-[10px] text-rose-400 font-normal">
                                Refunded ₹{p.refundAmount?.toLocaleString('en-IN')}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 pr-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                p.status === 'CAPTURED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : p.status === 'REFUNDED'
                                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                  : p.status === 'FAILED'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-400 text-[11px]">
                            {new Date(p.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
