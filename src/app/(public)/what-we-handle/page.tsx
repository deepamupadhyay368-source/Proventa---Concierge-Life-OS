import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'What We Handle', description: 'Discover what Proventa can take care of for you.' };

const CATEGORIES = [
  { name: 'Dining', description: 'Restaurant discovery, reservations for any occasion, special requests, dietary needs, private dining arrangements.', examples: ['Quiet dinner for four on Saturday', 'Anniversary restaurant recommendation', 'Last-minute table for tonight'] },
  { name: 'Travel', description: 'Flights, hotels, ground transport, transfers, multi-day itineraries, and travel coordination.', examples: ['Weekend luxury villa getaway', 'Hotel in Mumbai for three nights', 'Executive airport transfer with luggage'] },
  { name: 'Shopping', description: 'Gift sourcing, product research, price comparison, and coordination of delivery.', examples: ['Thoughtful gift under ₹5,000', 'Find the best price on this product', "Source something I can't find locally"] },
  { name: 'Experiences', description: 'Event tickets, cinema, sports, concerts, cultural events, and activity bookings.', examples: ["Tickets to tonight's show", 'IPL tickets for two', 'Something different to do this weekend'] },
  { name: 'Appointments', description: 'Salons, spas, wellness appointments, and coordination of bookings.', examples: ['Book a salon for Saturday morning', 'Find a premier luxury spa', 'Schedule a massage for two'] },
  { name: 'Home', description: 'Plumbers, electricians, cleaners, AC servicing, maintenance, and home service coordination.', examples: ['AC technician this week', 'Deep cleaning before guests arrive', 'Electrician for a small job'] },
  { name: 'Personal', description: 'Research, errands, planning, coordination, and anything that requires time or organisation.', examples: ['Research the best schools in the area', "Plan my parents' anniversary", 'Help me organise this'] },
  { name: 'Business', description: 'Business travel, corporate gifts, meeting arrangements, and professional coordination.', examples: ['Hotel for a client visit', 'Corporate gift for a team of 10', 'Meeting room booking'] },
  { name: 'Anything Else', description: "If it can reasonably be delegated, ask. We'll tell you honestly if it's something we can help with.", examples: ["I don't know where to start", "Something I can't quite describe", 'Figure this out for me'] },
];

export default function WhatWeHandlePage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="mb-14">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 mb-4">What Proventa handles</h1>
          <p className="text-lg text-neutral-500 leading-relaxed max-w-2xl">There's no exhaustive list — but here's a sense of what you can delegate. If you're unsure, just ask.</p>
        </div>
        <div className="space-y-10">
          {CATEGORIES.map((cat) => (
            <div key={cat.name} className="border-b border-neutral-100 pb-10">
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">{cat.name}</h2>
              <p className="text-neutral-500 mb-4 leading-relaxed">{cat.description}</p>
              <div className="flex flex-wrap gap-2">
                {cat.examples.map((ex) => (
                  <span key={ex} className="inline-flex px-3 py-1 bg-neutral-50 border border-neutral-100 rounded-full text-xs text-neutral-600 italic">&ldquo;{ex}&rdquo;</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Link href="/wave1" className="inline-flex items-center px-6 py-3 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">Join Wave 1</Link>
        </div>
      </div>
    </div>
  );
}
