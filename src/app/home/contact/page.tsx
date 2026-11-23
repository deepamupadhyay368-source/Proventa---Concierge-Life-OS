'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    locality: 'Bopal',
    subject: 'Membership Enquiry',
    message: ''
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#53634A] bg-[#53634A]/10 px-3 py-1 rounded-full border border-[#53634A]/20">
          Support & Concierge
        </span>
        <h1 className="text-4xl font-bold text-[#171A17]">Contact PROVENTA Home</h1>
        <p className="text-stone-600 text-sm">
          We are on standby across Ahmedabad to support your home maintenance needs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact info cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#171A17]">24/7 Emergency Helpdesk</h3>
            <p className="text-xs text-stone-500">For urgent pipe bursts, major short circuits & leaks</p>
            <div className="text-xl font-mono font-bold text-[#171A17] pt-1">+91 79 4900 8800</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#53634A]/10 text-[#53634A] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#171A17]">Member Concierge</h3>
            <p className="text-xs text-stone-500">For plan upgrades, billing, and society queries</p>
            <div className="text-sm font-semibold text-stone-900 pt-1">home@proventa.in</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#171A17]">Ahmedabad Operations Hub</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              PROVENTA Technologies Pvt Ltd<br />
              4th Floor, Titanium Heights, Sindhu Bhavan Road, Bodakdev, Ahmedabad 380054
            </p>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DFD5] shadow-xs">
          {sent ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#171A17]">Message Received</h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Thank you for reaching out. A PROVENTA customer support executive will call or email you within 2 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h3 className="font-bold text-lg text-[#171A17] pb-2 border-b border-stone-100">
                Send Us a Message
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priyansh Shah"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98250 XXXXX"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Locality (Ahmedabad) *</label>
                  <input
                    type="text"
                    required
                    value={formData.locality}
                    onChange={e => setFormData({ ...formData, locality: e.target.value })}
                    className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
                >
                  <option value="Membership Enquiry">Membership Enquiry</option>
                  <option value="Service Booking Support">Service Booking Support</option>
                  <option value="Society Partnership">Society Partnership</option>
                  <option value="Technician Onboarding">Technician Onboarding</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">How can we assist you? *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your requirement, issue, or query..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] p-3.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Send Enquiry to Concierge</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
