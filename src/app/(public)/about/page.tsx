import Link from 'next/link';
import { Shield, Target, Compass, Award, Building, Mail, MapPin, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Header */}
      <section className="border-b border-[#C8C4BA] pb-12 pt-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#547568]/10 text-[#547568] text-xs font-semibold uppercase tracking-wider border border-[#547568]/20">
            About PROVENTA
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-[#202B3C] leading-tight">
            Know your property. Know its value.
          </h1>
          <p className="text-base md:text-lg text-[#69717B] leading-relaxed">
            PROVENTA is an independent Indian real estate intelligence company. We build evidence-based software, valuation benchmarks, and property records so buyers, homeowners, and investors never have to guess property prices.
          </p>
        </div>
      </section>

      {/* The Core Mission */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <span className="text-xs font-mono font-bold text-[#547568] uppercase tracking-wider">
            Why PROVENTA Exists
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[#202B3C]">
            Indian real estate has operated in opacity for decades. We are changing that.
          </h2>
          <p className="text-xs md:text-sm text-[#69717B] leading-relaxed">
            Traditional real estate portals are broker advertising directories. Their incentives align with developers and intermediaries paying for top placement, often presenting inflated asking prices or fabricated discounts.
          </p>
          <p className="text-xs md:text-sm text-[#69717B] leading-relaxed">
            PROVENTA was founded on a simple principle: <strong>real estate intelligence must be independent.</strong> We do not sell leads, we do not take brokerage cuts, and we do not accept sponsored rankings. Our customer is the property buyer, owner, and investor who demands institutional-grade data transparency.
          </p>
        </div>

        <div className="bg-white border border-[#C8C4BA] p-8 space-y-6 shadow-xs">
          <h3 className="font-display text-lg font-bold text-[#202B3C] border-b border-[#C8C4BA] pb-3">
            Our Three Founding Commitments
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-xs text-[#202B3C]">
              <Shield className="h-4 w-4 text-[#547568] shrink-0 mt-0.5" />
              <div>
                <strong>Zero Transaction Conflict:</strong> We never act as a broker or receive transaction commission on any deal.
              </div>
            </li>
            <li className="flex items-start gap-3 text-xs text-[#202B3C]">
              <Target className="h-4 w-4 text-[#547568] shrink-0 mt-0.5" />
              <div>
                <strong>Carpet Area Standard:</strong> We normalize all prices to statutory RERA carpet square footage, eliminating deceptive super built-up loading.
              </div>
            </li>
            <li className="flex items-start gap-3 text-xs text-[#202B3C]">
              <Award className="h-4 w-4 text-[#547568] shrink-0 mt-0.5" />
              <div>
                <strong>Evidence-Governed Analysis:</strong> We only cite recorded sub-registrar deeds and official RERA filings. We never invent comps.
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Ahmedabad Launch & Expansion */}
      <section className="bg-white border border-[#C8C4BA] p-8 space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-mono font-bold text-[#547568] uppercase tracking-wider">
            Geographic Focus
          </span>
          <h2 className="font-display text-2xl font-bold text-[#202B3C]">
            Ahmedabad & Gandhinagar: Our Launch Ground
          </h2>
          <p className="text-xs md:text-sm text-[#69717B] leading-relaxed">
            Gujarat’s twin cities represent India’s most disciplined and rapidly modernizing urban corridor. From the international financial capital of GIFT City to prime western residential hubs like Bodakdev, Shela, and Science City, Ahmedabad combines high absorption velocity with progressive town planning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#C8C4BA]/50">
          <div className="space-y-1">
            <span className="font-mono text-2xl font-bold text-[#202B3C]">11</span>
            <p className="text-xs font-semibold text-[#202B3C]">Prime Ahmedabad Localities</p>
            <p className="text-[11px] text-[#69717B]">Deep granular tracking across South Bopal, Shela, Bodakdev, Thaltej, Gota, and GIFT City.</p>
          </div>
          <div className="space-y-1">
            <span className="font-mono text-2xl font-bold text-[#202B3C]">1,400+</span>
            <p className="text-xs font-semibold text-[#202B3C]">Observed Registered Deeds</p>
            <p className="text-[11px] text-[#69717B]">Sub-registrar transaction data cross-verified quarterly with Gujarat stamp records.</p>
          </div>
          <div className="space-y-1">
            <span className="font-mono text-2xl font-bold text-[#547568]">Q1 2027</span>
            <p className="text-xs font-semibold text-[#202B3C]">Gujarat Expansion</p>
            <p className="text-[11px] text-[#69717B]">Expanding coverage to Surat, Vadodara, and Rajkot urban development authorities.</p>
          </div>
        </div>
      </section>

      {/* Contact & Corporate Office */}
      <section id="contact" className="border-t border-[#C8C4BA] pt-12 space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-display text-2xl font-bold text-[#202B3C]">
            Connect with the PROVENTA Research Desk
          </h2>
          <p className="text-xs text-[#69717B]">
            For institutional data subscriptions, enterprise API licensing, or data correction inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#C8C4BA] p-5 space-y-2">
            <Mail className="h-4 w-4 text-[#547568]" />
            <h3 className="text-xs font-bold text-[#202B3C]">Research & Editorial</h3>
            <p className="text-xs text-[#69717B]">research@proventa.in</p>
            <p className="text-[11px] text-[#69717B]">Submissions of verified RERA filings and methodology inquiries.</p>
          </div>

          <div className="bg-white border border-[#C8C4BA] p-5 space-y-2">
            <Building className="h-4 w-4 text-[#547568]" />
            <h3 className="text-xs font-bold text-[#202B3C]">Institutional & Enterprise</h3>
            <p className="text-xs text-[#69717B]">institutional@proventa.in</p>
            <p className="text-[11px] text-[#69717B]">Bespoke datasets for banks, funds, and developers.</p>
          </div>

          <div className="bg-white border border-[#C8C4BA] p-5 space-y-2">
            <MapPin className="h-4 w-4 text-[#547568]" />
            <h3 className="text-xs font-bold text-[#202B3C]">Ahmedabad Presence</h3>
            <p className="text-xs text-[#69717B]">SG Highway Corridor</p>
            <p className="text-[11px] text-[#69717B]">Ahmedabad, Gujarat 380054, India.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
