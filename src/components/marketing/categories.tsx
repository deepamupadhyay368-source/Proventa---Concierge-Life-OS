import { UtensilsCrossed, Plane, ShoppingBag, Ticket, Calendar, Home, User, Briefcase, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  {
    icon: UtensilsCrossed,
    name: 'Dining & Tables',
    description: 'Prime dinner tables, private rooms, and tasting menus at Ahmedabad’s best restaurants.',
    examples: ['Agashiye', 'Mocha Bodakdev', 'Under The Neem Tree'],
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
    <section className="py-24 bg-white border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Our Capabilities</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-900 mb-4">
            Everything You Need Handled.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
            From the hardest restaurant tables in Ahmedabad to seamless travel, gifting, and daily errands. You ask once, and our local team takes care of the rest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-white border border-neutral-200 hover:border-neutral-900 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-6">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">{cat.name}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-4">{cat.description}</p>
                </div>

                <div className="pt-4 border-t border-neutral-100">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {cat.examples.map((ex, i) => (
                      <span key={i} className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                        {ex}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={cat.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-900 hover:text-neutral-600 transition-colors"
                  >
                    <span>Learn more</span>
                    <ArrowRight className="h-3.5 w-3.5" />
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
