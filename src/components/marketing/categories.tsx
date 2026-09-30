import { UtensilsCrossed, Plane, ShoppingBag, Ticket, Calendar, Home, User, Briefcase, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  {
    icon: UtensilsCrossed,
    name: 'Fine Dining & Verified Tables',
    description: 'Prime dinner tables, private dining alcoves, and curated chef tasting menus at premier restaurants.',
    examples: ['Agashiye Heritage', 'Tinello Hyatt', 'Rooftop VIP Reservations'],
    href: '/wave1?intent=Fine+Dining',
  },
  {
    icon: Plane,
    name: 'Executive Travel & Curated Stays',
    description: 'Scheduled commercial and business flights, boutique heritage hotels, and executive chauffeur airport transfers.',
    examples: ['SVP Airport Chauffeur', 'Heritage Haveli Retreats', 'Flight Ticketing'],
    href: '/wave1?intent=Curated+Travel',
  },
  {
    icon: ShoppingBag,
    name: 'Luxury Sourcing & Gifting',
    description: 'Bespoke corporate gifting hampers, rare artisanal textiles, and hand-delivered luxury gifts.',
    examples: ['Executive Hampers', 'Ashavali Silk Dupattas', 'Artisanal Silver'],
    href: '/wave1?intent=Luxury+Gifting',
  },
  {
    icon: Home,
    name: 'Home Logistics & Appointments',
    description: 'Dispatch of vetted estate specialists, HVAC diagnostics, and priority appointments.',
    examples: ['Estate Diagnostics', 'Villa Maintenance', 'Wellness Bookings'],
    href: '/wave1?intent=Estate+Care',
  },
  {
    icon: Sparkles,
    name: 'Bespoke Lifestyle Operations',
    description: 'Confidential lifestyle research, VIP experience passes, event access, and complex personalized requests.',
    examples: ['VIP Passes', 'Bespoke Itineraries', 'Executive Errands'],
    href: '/wave1?intent=Life+Logistics',
  },
];

export function CategoriesSection() {
  return (
    <section className="py-24 bg-[#F7F8FA]/70 relative overflow-hidden border-t border-[#E1E5E8] live-bg-canvas">
      {/* Moving Ambient Lights */}
      <div className="absolute top-1/4 right-10 w-[500px] h-[500px] bg-gradient-to-bl from-[#E5E9ED]/50 to-transparent blur-[140px] pointer-events-none -z-10 live-orb-1" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-gradient-to-tr from-[#F1F3F5]/60 to-transparent blur-[120px] pointer-events-none -z-10 live-orb-2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#E1E5E8] text-[11px] font-semibold tracking-wider text-[#1F2933] uppercase mb-4 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1F2933]"></span>
            <span>Core Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1F2933] mb-4">
            Everything You Need Handled. <span className="live-flowing-text font-normal">Precisely.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#66717C] leading-relaxed">
            From verified dining reservations to executive travel and discreet lifestyle coordination. One request, completely handled.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            const isFeatured = idx === 0;
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#E1E5E8] hover:border-[#A7B0B8] flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-1 group ${
                  isFeatured ? 'md:col-span-2 lg:col-span-2' : ''
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] flex items-center justify-center text-[#1F2933] mb-5 group-hover:bg-[#1F2933] group-hover:text-white transition-all duration-300 shadow-2xs">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#1F2933] mb-2">{cat.name}</h3>
                  <p className="text-xs sm:text-sm text-[#66717C] leading-relaxed mb-5">{cat.description}</p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {cat.examples.map((ex, exIdx) => (
                      <span
                        key={exIdx}
                        className="inline-block px-2.5 py-1 rounded-lg text-[11px] bg-[#F1F3F5] text-[#1F2933] border border-[#E1E5E8] group-hover:border-[#A7B0B8]/40 transition-colors"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={cat.href}
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#1F2933] group-hover:text-[#111820] transition-colors"
                  >
                    <span>Request with Concierge</span>
                    <ArrowRight className="h-3 w-3 text-[#A7B0B8] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
