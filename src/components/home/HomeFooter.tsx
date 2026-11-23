import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { AHMEDABAD_LOCALITIES } from '@/lib/home/constants';

export default function HomeFooter() {
  return (
    <footer className="bg-[#171A17] text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand & Positioning */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#53634A] text-white flex items-center justify-center font-bold text-base">
                P
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-xl text-white">PROVENTA</span>
                <span className="text-xs uppercase font-semibold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  HOME
                </span>
              </div>
            </div>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Household maintenance membership platform. We connect families with verified independent local technicians through managed subscriptions, routine inspections, and a digital Home Maintenance Passport.
            </p>
            <div className="flex items-center gap-3 text-xs text-stone-400 pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Police Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>30-Day Workmanship Warranty</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-white uppercase">Platform</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li><Link href="/home/membership" className="hover:text-white transition">Membership Plans</Link></li>
              <li><Link href="/home/services" className="hover:text-white transition">Service Catalogue</Link></li>
              <li><Link href="/home/how-it-works" className="hover:text-white transition">How It Works</Link></li>
              <li><Link href="/home/societies" className="hover:text-white transition">Apartment Societies</Link></li>
              <li><Link href="/home/partners" className="hover:text-white transition">Join as a Technician</Link></li>
              <li><Link href="/home/customer/dashboard" className="hover:text-white transition">Member Portal</Link></li>
            </ul>
          </div>

          {/* Ahmedabad Coverage */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-white uppercase">Ahmedabad Service Hubs</h4>
            <ul className="grid grid-cols-2 gap-1.5 text-xs text-stone-400">
              {AHMEDABAD_LOCALITIES.slice(0, 10).map((loc) => (
                <li key={loc.id} className="flex items-center gap-1 hover:text-stone-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#53634A]"></span>
                  <span>{loc.name}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <Link href="/home/service-areas" className="text-xs text-[#89947F] hover:text-white underline underline-offset-2">
                Check Pincode Coverage →
              </Link>
            </div>
          </div>

          {/* Support & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-white uppercase">Support & Dispatch</h4>
            <div className="space-y-2.5 text-sm text-stone-400">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-white font-medium">+91 79 4900 8800</div>
                  <div className="text-xs text-stone-500">24/7 Breakdown Helpdesk</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-white font-medium">home@proventa.in</div>
                  <div className="text-xs text-stone-500">Member Concierge</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
                <div className="text-xs text-stone-400">
                  PROVENTA Technologies Pvt Ltd<br />
                  Sindhu Bhavan Road, Bodakdev, Ahmedabad 380054
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} PROVENTA Technologies Pvt Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/home/terms" className="hover:text-stone-300 transition">Terms of Service</Link>
            <Link href="/home/privacy" className="hover:text-stone-300 transition">Privacy Policy</Link>
            <Link href="/home/refund-policy" className="hover:text-stone-300 transition">Refund & Cancellation</Link>
            <Link href="/" className="text-stone-400 hover:text-white transition">Parent Vertical: Proventa Industrial</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
