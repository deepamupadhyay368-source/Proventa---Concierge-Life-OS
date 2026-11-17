'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Send,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: 'BUYER',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans">
      {/* Banner */}
      <section className="bg-[#191B20] border-b border-[#414957] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#303746] border border-[#414957] text-xs font-mono text-[#C66A42] uppercase tracking-wider font-semibold rounded-sm">
            <span>GET IN TOUCH</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
            Contact PROVENTA Operations
          </h1>
          <p className="text-sm sm:text-base text-[#A8ADB7] max-w-2xl leading-relaxed">
            Reach our procurement desk for platform onboarding, supplier verification, enterprise contractor accounts, and commercial assistance.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Details & Portals */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="font-heading font-black text-2xl uppercase tracking-tight text-[#FFFFFF]">
                  Commercial Operations Desk
                </h2>
                <p className="text-xs sm:text-sm text-[#A8ADB7] leading-relaxed">
                  PROVENTA connects builders, developers, contractors and infrastructure companies with verified construction material suppliers through a single digital platform.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#303746] border border-[#414957] p-5 rounded-sm flex items-start gap-4">
                  <Mail className="w-5 h-5 text-[#C66A42] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-xs font-mono uppercase text-[#A8ADB7]">Procurement Desk Email</div>
                    <div className="text-sm font-semibold text-[#FFFFFF]">procurement@proventa.in</div>
                    <div className="text-[11px] text-[#A8ADB7]">Response within 4 business hours</div>
                  </div>
                </div>

                <div className="bg-[#303746] border border-[#414957] p-5 rounded-sm flex items-start gap-4">
                  <ShieldCheck className="w-5 h-5 text-[#536B88] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-xs font-mono uppercase text-[#A8ADB7]">Supplier Compliance Desk</div>
                    <div className="text-sm font-semibold text-[#FFFFFF]">compliance@proventa.in</div>
                    <div className="text-[11px] text-[#A8ADB7]">GSTIN verification &amp; yard audits</div>
                  </div>
                </div>

                <div className="bg-[#303746] border border-[#414957] p-5 rounded-sm flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-[#4A7C59] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-xs font-mono uppercase text-[#A8ADB7]">Registered Location</div>
                    <div className="text-sm font-semibold text-[#FFFFFF]">Ahmedabad &bull; Gujarat, India</div>
                    <div className="text-[11px] text-[#A8ADB7]">Serving Gujarat and Western India Infrastructure Corridors</div>
                  </div>
                </div>
              </div>

              {/* Direct Portal Links */}
              <div className="p-6 bg-[#252B38] border border-[#414957] rounded-sm space-y-4">
                <div className="text-xs font-mono uppercase text-[#C66A42] font-bold">Direct Access Portals</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    href="/sign-up?role=buyer"
                    className="p-3 bg-[#303746] hover:bg-[#191B20] border border-[#414957] rounded-sm transition-colors block text-xs"
                  >
                    <div className="font-bold text-[#FFFFFF]">Buyer Account</div>
                    <div className="text-[#A8ADB7] text-[11px]">Contractors &amp; Developers</div>
                  </Link>
                  <Link
                    href="/sign-up?role=supplier"
                    className="p-3 bg-[#303746] hover:bg-[#191B20] border border-[#414957] rounded-sm transition-colors block text-xs"
                  >
                    <div className="font-bold text-[#FFFFFF]">Supplier Account</div>
                    <div className="text-[#A8ADB7] text-[11px]">Stockists &amp; Producers</div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Interactive Form */}
            <div className="bg-[#303746] border border-[#414957] p-8 rounded-sm shadow-xl">
              {submitted ? (
                <div className="py-16 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-[#4A7C59] mx-auto" />
                  <h3 className="font-heading font-black text-xl uppercase text-[#FFFFFF]">
                    Message Transmitted
                  </h3>
                  <p className="text-xs text-[#A8ADB7] max-w-sm mx-auto">
                    Thank you. Your message has been routed to the relevant procurement operations officer. We will be in touch shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-4 py-2 bg-[#252B38] hover:bg-[#191B20] border border-[#414957] text-xs font-mono uppercase text-[#FFFFFF] rounded-sm transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-heading font-black text-lg uppercase text-[#FFFFFF] border-b border-[#414957] pb-3">
                    Submit Platform Enquiry
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-[#A8ADB7] uppercase">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm"
                        placeholder="e.g. Vikram Shah"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-[#A8ADB7] uppercase">Company</label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm"
                        placeholder="e.g. Gujarat Infracon Ltd"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-[#A8ADB7] uppercase">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm"
                        placeholder="procurement@company.in"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-[#A8ADB7] uppercase">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm font-mono"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-[#A8ADB7] uppercase">Organization Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm"
                    >
                      <option value="BUYER">Buyer (Builder, Contractor, Infrastructure Developer)</option>
                      <option value="SUPPLIER">Supplier (Manufacturer, Stockist, Distributor)</option>
                      <option value="BOTH">Dual Role (Both Buyer &amp; Supplier)</option>
                      <option value="OTHER">Other / Technology Partner</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-[#A8ADB7] uppercase">Requirement / Message</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm resize-none"
                      placeholder="Specify materials, project locations, or details about your enquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Transmit Message</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
