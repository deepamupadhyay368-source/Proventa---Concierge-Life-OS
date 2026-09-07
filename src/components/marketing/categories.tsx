import { UtensilsCrossed, Plane, ShoppingBag, Ticket, Calendar, Home, User, Briefcase, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  {
    icon: UtensilsCrossed,
    name: 'Fine Dining & VIP Tables',
    description: 'Prime dinner tables, private dining alcoves, and curated chef tasting menus at top restaurants.',
    examples: ['Agashiye Heritage', 'Tinello Hyatt', 'Rooftop Reservations'],
    href: '/wave1?intent=Fine+Dining',
  },
  {
    icon: Plane,
    name: 'Bespoke Travel & Getaways',
    description: 'Handpicked heritage stays, luxury wildlife safari permits, and seamless executive airport transfers.',
    examples: ['SVP Airport Chauffeur', 'Gir Forest Safaris', 'Haveli Retreats'],
    href: '/wave1?intent=Curated+Travel',
  },
  {
    icon: ShoppingBag,
    name: 'Luxury Sourcing & Gifting',
    description: 'Curated corporate gifting, rare heritage handloom textiles, and bespoke doorstep deliveries.',
    examples: ['Executive Hampers', 'Ashavali Silk Dupattas', 'Handcrafted Silver'],
    href: '/wave1?intent=Luxury+Gifting',
  },
  {
    icon: Home,
    name: 'Estate & Home Concierge',
    description: 'Rapid dispatch of verified technicians for HVAC, electrical, villa maintenance, and estate logistics.',
    examples: ['Urgent HVAC Diagnostics', 'Estate Care', 'Villa Maintenance'],
    href: '/wave1?intent=Estate+Care',
  },
  {
    icon: Sparkles,
    name: 'Private Life Logistics',
    description: 'Wellness appointments, VIP experience passes, confidential errands, and custom requests.',
    examples: ['Kaya Kalp Spa Sessions', 'Heritage Twilight Walks', 'Executive Errands'],
    href: '/wave1?intent=Life+Logistics',
  },
];

export function CategoriesSection() {
  return (
    <section className="py-28 bg-[#faf8f5] border-t border-[#e8e2d8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full luxury-pill text-[11px] font-medium text-[#6d5941] mb-4">
            <span>DISCREET CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#141312] mb-4">
            Everything You Need Handled. <span className="italic font-normal text-[#8a7053]">Flawlessly.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#5a4937] leading-relaxed font-sans">
            From the hardest restaurant reservations to private getaways, luxury sourcing, and estate errands. One message to your concierge, and the matter is resolved.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            const isFeatured = idx === 0;
            return (
              <div
                key={idx}
                className={`luxury-card p-8 rounded-2xl flex flex-col justify-between group hover:border-[#b09a78]/50 transition-all duration-300 ${
                  isFeatured ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white to-[#fbf9f6]' : ''
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#f5f3ef] border border-[#e8e2d8] flex items-center justify-center text-[#6d5941] group-hover:bg-[#1f1b16] group-hover:text-[#ddc8a9] transition-colors duration-300 mb-6">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-serif font-medium text-[#141312] mb-2">{cat.name}</h3>
                  <p className="text-sm text-[#6e6b65] leading-relaxed mb-6 font-sans">{cat.description}</p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {cat.examples.map((ex, exIdx) => (
                      <span
                        key={exIdx}
                        className="inline-block px-3 py-1 rounded-full text-xs bg-[#f5f3ef] text-[#6d5941] font-sans"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={cat.href}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#141312] group-hover:text-[#8a7053] transition-colors"
                  >
                    <span>Request through Concierge</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
