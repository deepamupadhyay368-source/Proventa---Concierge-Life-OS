'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  MapPin,
  BadgePercent,
  Key,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

function ConciergeSignUpForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    role: 'CONCIERGE',
    department: 'National Concierge Desk',
    city: 'Ahmedabad',
    inviteCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/concierge/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Registration failed. Please check your inputs.');
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message);
      if (data.status === 'ACTIVE') {
        setTimeout(() => {
          router.push('/concierge/sign-in');
        }, 2000);
      }
    } catch (err: any) {
      setError('Network error during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl space-y-6">
      {/* Brand & Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-neutral-950 font-bold text-xl shadow-lg shadow-amber-500/20 mb-1">
          P
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl font-bold tracking-wider text-neutral-100">PROVENTA</span>
          <span className="text-[11px] uppercase tracking-widest font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
            Concierge Desk
          </span>
        </div>
        <h1 className="text-lg font-medium text-neutral-200">
          Employee First-Time Registration
        </h1>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Create your verified Concierge employee credentials for the Proventa execution workstation.
        </p>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-800/60 rounded-xl flex items-start gap-3 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-emerald-200">Registration Received</div>
            <div className="leading-relaxed">{successMessage}</div>
            <div className="pt-2">
              <Link
                href="/concierge/sign-in"
                className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 underline"
              >
                Proceed to Sign In <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-800/50 rounded-xl flex items-start gap-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{error}</div>
        </div>
      )}

      {/* Form */}
      {!successMessage && (
        <div className="bg-neutral-900/80 border border-neutral-800 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Full Legal / Display Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Deepam Upadhyay"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Work Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="operator@proventa.in"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 font-mono"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 font-mono"
                  />
                </div>
              </div>

              {/* Employee ID / Staff Code */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Staff ID / Employee Code
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="PV-CON-001"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 font-mono"
                  />
                </div>
              </div>

              {/* Operational Role */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Requested Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-amber-500/60"
                >
                  <option value="CONCIERGE">Concierge Operator (General & Dining)</option>
                  <option value="SENIOR_CONCIERGE">Senior Concierge (Aviation & Hospitality)</option>
                </select>
              </div>

              {/* Operational City */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  City / Operations Hub *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Ahmedabad"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Password (min 8 characters) *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="password"
                    required
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
              </div>
            </div>

            {/* Invitation / Authorization Code (Optional) */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Staff Invitation Code (Optional for Instant Activation)
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  name="inviteCode"
                  value={formData.inviteCode}
                  onChange={handleChange}
                  placeholder="Enter staff invitation token if provided by manager"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-semibold text-xs rounded-xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Registering Employee Account...</span>
                </>
              ) : (
                <>
                  <span>Create Concierge Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Already have account */}
          <div className="pt-4 border-t border-neutral-800 text-center text-xs text-neutral-400">
            Already registered as a Concierge employee?{' '}
            <Link
              href="/concierge/sign-in"
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              Sign In to Concierge Desk
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConciergeSignUpPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center px-4 py-12 selection:bg-amber-500/30 selection:text-amber-200">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading Employee Registration...</span>
          </div>
        }
      >
        <ConciergeSignUpForm />
      </Suspense>
    </div>
  );
}
