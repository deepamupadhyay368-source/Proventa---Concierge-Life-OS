'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  Clock,
  Database,
  Layers,
  Building2,
  MapPin,
  ArrowRight,
  HelpCircle,
  RefreshCw,
  Award,
  Scale,
} from 'lucide-react';

interface PreviewData {
  requestId: string;
  referenceNo: string;
  isPaid: boolean;
  status: string;
  propertySummary: {
    address: string;
    localityName: string;
    projectName?: string;
    city: string;
    state: string;
    pincode: string;
    propertyType: string;
    bhk: number;
    carpetAreaSqFt: number;
    builtUpAreaSqFt?: number;
    floor?: number;
    totalFloors?: number;
    propertyAgeYears?: number;
    condition?: string;
    furnishingStatus?: string;
    parkingSpaces: number;
    transactionContext: string;
    createdAt: string;
  };
  coverage: {
    localityName: string;
    coverageLevel: string;
    valuationReady: boolean;
    registeredDeedsCount: number;
    activeListingsCount: number;
    microMarketTotalTransactions: number;
    dataSources: string[];
  };
  pricing: {
    reportType: string;
    name: string;
    priceRupees: number;
    discountedPriceRupees: number;
    currency: string;
    gstPercent: number;
    totalAmountPaise: number;
  };
  deliveryExpectations: {
    deliveryMethod: string;
    deliveryTime: string;
    guarantee: string;
    cancellationPolicy: string;
  };
}


export default function ValuationPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PreviewData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Load preview data
  useEffect(() => {
    async function loadPreview() {
      try {
        const res = await fetch(`/api/price/preview/${requestId}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to retrieve valuation preview.');
        }

        // If already paid, automatically redirect to completed report
        if (json.isPaid) {
          router.replace(`/price/report/${requestId}`);
          return;
        }

        setData(json);
      } catch (err: any) {
        setErrorMsg(err.message || 'Unable to load valuation preview.');
      } finally {
        setLoading(false);
      }
    }
    loadPreview();
  }, [requestId, router]);

  // Load Razorpay SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleInitiatePayment = async () => {
    if (!data) return;
    setPaying(true);
    setPaymentError(null);

    try {
      // 1. Create Order via server
      const orderRes = await fetch('/api/price/pay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: data.requestId }),
      });

      const orderJson = await orderRes.json();
      if (!orderRes.ok || !orderJson.success) {
        throw new Error(orderJson.error || 'Failed to initiate payment.');
      }

      if (orderJson.alreadyPaid) {
        router.push(orderJson.reportUrl);
        return;
      }

      // Check if simulation mode (no live Razorpay API keys or test keys)
      if (orderJson.isSimulation || !(window as any).Razorpay) {
        // Direct sandbox verification simulation
        const verifyRes = await fetch('/api/price/pay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: data.requestId,
            razorpay_order_id: orderJson.orderId,
            razorpay_payment_id: `pay_sim_${Date.now()}`,
            razorpay_signature: `sig_sim_${Date.now()}`,
            isSimulation: true,
          }),
        });

        const verifyJson = await verifyRes.json();
        if (!verifyRes.ok || !verifyJson.success) {
          throw new Error(verifyJson.error || 'Payment verification failed.');
        }

        router.push(verifyJson.reportUrl);
        return;
      }

      // Open Razorpay Checkout modal
      const options = {
        key: orderJson.keyId,
        amount: orderJson.amountPaise,
        currency: orderJson.currency,
        name: 'PROVENTA Intelligence',
        description: `Valuation Report — ${data.propertySummary.localityName}`,
        order_id: orderJson.orderId,
        prefill: {
          name: orderJson.customer?.name || '',
          email: orderJson.customer?.email || '',
          contact: orderJson.customer?.phone || '',
        },
        theme: {
          color: '#202B3C',
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/price/pay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                requestId: data.requestId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyJson = await verifyRes.json();
            if (!verifyRes.ok || !verifyJson.success) {
              throw new Error(verifyJson.error || 'Payment verification failed on server.');
            }

            router.push(verifyJson.reportUrl);
          } catch (err: any) {
            setPaymentError(err.message || 'Payment verification failed.');
            setPaying(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setPaymentError(resp.error?.description || 'Payment was declined by your bank.');
        setPaying(false);
      });
      rzp.open();
    } catch (err: any) {
      setPaymentError(err.message || 'Payment could not be started.');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3ED] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#547568] mx-auto" />
          <p className="font-mono text-xs text-[#69717B] uppercase tracking-wider">
            Loading Evidence Coverage Preview...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="min-h-screen bg-[#F5F3ED] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#C8C4BA] p-6 text-center space-y-4 shadow-xs">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="font-editorial text-xl font-bold text-[#202B3C]">Preview Unavailable</h2>
          <p className="text-xs text-[#69717B]">{errorMsg || 'The requested valuation request was not found.'}</p>
          <button
            onClick={() => router.push('/price')}
            className="w-full h-10 bg-[#202B3C] text-white font-mono text-xs uppercase tracking-wider"
          >
            Submit New Property
          </button>
        </div>
      </div>
    );
  }

  const { propertySummary, coverage, pricing, deliveryExpectations } = data;

  return (
    <div className="min-h-screen bg-[#F5F3ED] text-[#202B3C] font-sans antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Breadcrumb & Status */}
        <div className="border-b border-[#C8C4BA] pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block w-2.5 h-2.5 bg-[#547568]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#547568]">
                REPORT PREVIEW &bull; COVERAGE VERIFIED
              </span>
            </div>
            <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-[#202B3C] tracking-tight">
              Evidence Coverage Dossier
            </h1>
            <p className="text-xs font-mono text-[#69717B] mt-1">
              Reference: <strong className="text-[#202B3C]">{data.referenceNo}</strong> &bull; Micro-Market: {coverage.localityName}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="px-3 py-1 bg-[#202B3C] text-white text-[10px] font-mono uppercase tracking-wider">
              Payment Pending
            </span>
            <span className="px-3 py-1 bg-[#547568]/10 text-[#547568] border border-[#547568]/30 text-[10px] font-mono font-bold uppercase tracking-wider">
              Coverage: {coverage.coverageLevel}
            </span>
          </div>
        </div>

        {paymentError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{paymentError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols): Property Summary & Evidence Coverage */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Property Parameters Card */}
            <div className="bg-white border border-[#C8C4BA] p-6 shadow-xs space-y-4">
              <div className="border-b border-[#E2DFD8] pb-3 flex items-center justify-between">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#202B3C] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#547568]" />
                  <span>Submitted Property Parameters</span>
                </h2>
                <span className="text-[10px] font-mono text-[#69717B]">Verified Snapshot</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[#69717B] text-[10px] uppercase block">Locality</span>
                  <span className="font-bold text-[#202B3C]">{propertySummary.localityName}</span>
                </div>
                <div>
                  <span className="text-[#69717B] text-[10px] uppercase block">Typology</span>
                  <span className="font-bold text-[#202B3C]">{propertySummary.propertyType}</span>
                </div>
                <div>
                  <span className="text-[#69717B] text-[10px] uppercase block">Configuration</span>
                  <span className="font-bold text-[#202B3C]">{propertySummary.bhk} BHK</span>
                </div>
                <div>
                  <span className="text-[#69717B] text-[10px] uppercase block">Carpet Area</span>
                  <span className="font-bold text-[#547568]">{propertySummary.carpetAreaSqFt} Sq.Ft</span>
                </div>
                <div>
                  <span className="text-[#69717B] text-[10px] uppercase block">Floor Level</span>
                  <span className="text-[#202B3C]">{propertySummary.floor || 'N/A'} of {propertySummary.totalFloors || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#69717B] text-[10px] uppercase block">Dedicated Parking</span>
                  <span className="text-[#202B3C]">{propertySummary.parkingSpaces} Covered</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2DFD8] text-xs">
                <span className="text-[#69717B] text-[10px] font-mono uppercase block">Address</span>
                <p className="font-sans text-[#202B3C] font-medium mt-0.5">{propertySummary.address}</p>
              </div>
            </div>

            {/* Evidence Coverage Card */}
            <div className="bg-white border border-[#C8C4BA] p-6 shadow-xs space-y-4">
              <div className="border-b border-[#E2DFD8] pb-3 flex items-center justify-between">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#202B3C] flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#547568]" />
                  <span>Available Evidence Coverage in {coverage.localityName}</span>
                </h2>
                <span className="text-[10px] font-mono text-[#547568] font-bold">100% Real Records</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#F5F3ED] border border-[#C8C4BA]">
                  <span className="text-[10px] font-mono uppercase text-[#69717B] block">
                    Registered Sale Deeds (Garvi SRO)
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-editorial text-2xl sm:text-3xl font-bold text-[#202B3C]">
                      {coverage.registeredDeedsCount}
                    </span>
                    <span className="text-[10px] font-mono text-[#547568]">Verified Deeds</span>
                  </div>
                  <p className="text-[11px] text-[#69717B] mt-1">
                    Executed instruments indexed within ±30% carpet area tolerance in this micro-market.
                  </p>
                </div>

                <div className="p-4 bg-[#F5F3ED] border border-[#C8C4BA]">
                  <span className="text-[10px] font-mono uppercase text-[#69717B] block">
                    Active Advertised Listings
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-editorial text-2xl sm:text-3xl font-bold text-[#202B3C]">
                      {coverage.activeListingsCount}
                    </span>
                    <span className="text-[10px] font-mono text-[#69717B]">Asking Comps</span>
                  </div>
                  <p className="text-[11px] text-[#69717B] mt-1">
                    Observed portal listings subjected to statutory empirical negotiation haircuts.
                  </p>
                </div>
              </div>

              <div className="pt-2 text-xs space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#69717B] block font-bold">
                  Data Sources Indexed for this Valuation:
                </span>
                <ul className="space-y-1.5 text-[#202B3C]">
                  {coverage.dataSources.map((ds, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#547568] shrink-0 mt-0.5" />
                      <span>{ds}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Methodology & Strict Paywall Notice */}
            <div className="bg-[#202B3C]/5 border border-[#202B3C]/20 p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-[#202B3C]">
                <Scale className="w-4 h-4 text-[#547568]" />
                <span>Deterministic Valuation Methodology (v1.0.0)</span>
              </div>
              <p className="text-[#69717B] leading-relaxed">
                PROVENTA does not utilize generative AI or speculative pricing heuristics. The valuation engine normalises all transactions onto RERA Carpet Area rates, applies hedonic regression adjustments for floor elevation (+0.35%/floor) and age depreciation (-0.5%/year), and determines defensible statistical confidence bands.
              </p>
              <div className="flex items-center gap-2 text-[#202B3C] font-semibold text-[11px]">
                <Lock className="w-3.5 h-3.5 text-[#547568]" />
                <span>Final valuation range and comparable prices are unlocked exclusively after payment confirmation.</span>
              </div>
            </div>

          </div>

          {/* Right Column (5 cols): Commercial Paywall & Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white border-2 border-[#202B3C] p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="border-b border-[#C8C4BA] pb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#547568] block">
                  Official Service Pricing
                </span>
                <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#202B3C] mt-1">
                  Valuation Report Dossier
                </h3>
                <p className="text-xs text-[#69717B] mt-1">
                  Single property full analytical dossier with PDF download.
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 font-mono text-xs border-b border-[#E2DFD8] pb-4">
                <div className="flex items-center justify-between text-[#69717B]">
                  <span>Standard Report Fee</span>
                  <span className="line-through">₹{pricing.discountedPriceRupees}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-[#202B3C]">
                  <span>Introductory Micro-Market Rate</span>
                  <span>₹{pricing.priceRupees}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#547568]">
                  <span>Applicable GST (18%)</span>
                  <span>Included</span>
                </div>
                <div className="pt-2 border-t border-[#E2DFD8] flex items-baseline justify-between text-base font-bold text-[#202B3C]">
                  <span>Total Payable</span>
                  <span className="font-editorial text-2xl text-[#202B3C]">₹{pricing.priceRupees}</span>
                </div>
              </div>

              {/* Inclusions Checklist */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-mono uppercase font-bold text-[#69717B] block">
                  Report Inclusions:
                </span>
                <ul className="space-y-1.5 text-xs text-[#202B3C]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#547568] shrink-0" />
                    <span>Estimated Market Value Range (Min, Mid, Max)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#547568] shrink-0" />
                    <span>Carpet Area Unit Rate Calculation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#547568] shrink-0" />
                    <span>Full Registered Deeds Evidence Ledger</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#547568] shrink-0" />
                    <span>Active Asking Listings Contrast</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#547568] shrink-0" />
                    <span>Government Jantri Benchmark Analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#547568] shrink-0" />
                    <span>Institutional PDF Download with Reference ID</span>
                  </li>
                </ul>
              </div>

              {/* Payment CTA */}
              <button
                type="button"
                onClick={handleInitiatePayment}
                disabled={paying}
                className="w-full h-12 bg-[#202B3C] text-white font-mono text-xs uppercase tracking-wider font-bold hover:bg-[#202B3C]/90 transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {paying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Securing Payment Gateway...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#547568]" />
                    <span>Pay ₹{pricing.priceRupees} & Unlock Report</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-3 text-[11px] text-[#69717B] font-mono">
                <ShieldCheck className="w-4 h-4 text-[#547568]" />
                <span>Server-verified 256-bit SSL encrypted checkout</span>
              </div>

              {/* Delivery & Cancellation Guarantee */}
              <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA] text-[11px] text-[#69717B] space-y-1 leading-relaxed">
                <span className="font-bold text-[#202B3C] block font-mono uppercase text-[10px]">
                  Quality & Refund Commitment
                </span>
                <p>
                  {deliveryExpectations.cancellationPolicy}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
