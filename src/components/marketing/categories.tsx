import { UtensilsCrossed, Plane, ShoppingBag, Ticket, Calendar, Home, User, Briefcase, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  {
    icon: UtensilsCrossed,
    name: 'Dining & Tables',
    description: 'Prime dinner tables, private dining alcoves, and tasting menus at the city’s premier restaurants.',
    examples: ['Fine Dining Tables', 'Private Chef Rooms', 'Weekend Bookings'],
    href: '/services/dining',
  },
  {
    icon: Plane,
    name: 'Travel & Getaways',
    description: 'Flight itineraries, boutique hotel stays, airport pickups, and weekend road trips.',
    examples: ['SVP Airport Transfers', 'Gir Forest Safaris', 'Udaipur Retreats'],
    href: '/services/travel',
  },
  {
    icon: ShoppingBag,
    name: 'Shopping & Gifting',
    description: 'Corporate client gifts, rare heritage handlooms, luxury sourcing, and doorstep deliveries.',
    examples: ['Client Hampers', 'Festive Gifting', 'Luxury Watches'],
    href: '/services/shopping',
  },
  {
    icon: Calendar,
    name: 'Wellness & Salons',
    description: 'Appointments at premier salons, restorative spas, and top health specialists.',
    examples: ['BBlunt Sindhu Bhavan', 'Ayurvedic Spas', 'Dermatology'],
    href: '/what-we-handle',
  },
  {
    icon: Home,
    name: 'Home & Living',
    description: 'Vetted electricians, air conditioning maintenance, deep cleaning, and household tasks.',
    examples: ['Emergency Repairs', 'HVAC Servicing', 'Property Checks'],
    href: '/services/home',
  },
  {
    icon: Ticket,
    name: 'Events & Experiences',
    description: 'VIP access to cricket matches, sold-out musical concerts, art exhibitions, and screenings.',
    examples: ['Motera Stadium Passes', 'Film Festivals', 'Private Gatherings'],
    href: '/services/experiences',
  },
  {
    icon: Briefcase,
    name: 'Executive & Business',
    description: 'Boardroom lunch catering, secretarial errands, conference reservations, and client hospitality.',
    examples: ['Corporate Dinners', 'Offsite Logistics', 'VIP Guest Hosting'],
    href: '/what-we-handle',
  },
  {
    icon: User,
    name: 'Daily Errands & Logistics',
    description: 'Document pickups, urgent couriers, dry cleaning, and everyday errands taken off your plate.',
    examples: ['Legal Attestations', 'Urgent Deliveries', 'Passport Coordination'],
    href: '/what-we-handle',
  },
  {
    icon: Sparkles,
    name: 'Custom Requests',
    description: 'If it can reasonably and ethically be done, your concierge will figure out how to make it happen.',
    examples: ['Last-Minute Surprises', 'Special Requests', 'Family Logistics'],
    href: '/wave1',
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
            return (
              <div
                key={idx}
                className="luxury-card p-8 rounded-2xl flex flex-col justify-between group hover:border-[#b09a78]/50 transition-all duration-300"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#f5f3ef] border border-[#e8e2d8] flex items-center justify-center text-[#6d5941] group-hover:bg-[#1f1b16] group-hover:text-[#ddc8a9] transition-colors duration-300 mb-6">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-serif font-medium text-[#141312] mb-2">{cat.name}</h3>
                  <p className="text-xs sm:text-sm text-[#6e6b65] leading-relaxed mb-6 font-sans">{cat.description}</p>
                </div>

                <div className="pt-4 border-t border-[#ede8df]">
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {cat.examples.map((ex, i) => (
                      <span key={i} className="text-[11px] font-sans px-2.5 py-1 rounded-md bg-[#f5f3ef] text-[#5a4937] border border-[#e8e2d8]/60">
                        {ex}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={cat.href}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#141312] group-hover:text-[#8a7053] transition-colors"
                  >
                    <span>Explore service</span>
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
