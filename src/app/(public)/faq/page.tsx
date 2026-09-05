import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'FAQ', description: 'Frequently asked questions about Proventa.' };

const FAQS = [
  { q: 'What is Proventa?', a: 'Proventa is a Concierge Life OS — a service that combines intelligent technology with real human concierge support to research, arrange and manage things on your behalf. You describe what you need; Proventa figures out the rest.' },
  { q: 'Is Proventa only for wealthy individuals?', a: "No. Proventa is designed to be broadly accessible. We believe that the experience of having things taken care of shouldn't be exclusive. What makes Proventa premium is the quality of the experience — not the price of entry." },
  { q: 'How does the concierge work?', a: 'Every request is handled by a combination of technology and a real human concierge. The concierge reviews AI-prepared research, communicates with providers, handles negotiations, and is accountable for the outcome.' },
  { q: 'Is AI involved?', a: 'Yes. Proventa uses AI to understand your requests, research options, compare information, and prepare recommendations. But AI is a tool — not the decision-maker. Human concierges review, verify, and execute.' },
  { q: 'What can Proventa handle?', a: 'Dining, travel, shopping, experiences, appointments, home services, personal errands, business arrangements, and more. If it can reasonably be delegated, you can ask Proventa.' },
  { q: 'Do I have to choose a category?', a: 'No. Just describe what you need in plain language. Proventa handles the classification.' },
  { q: 'How does approval work?', a: 'Before any consequential action — a booking, a purchase, an arrangement — Proventa presents you with the details: provider, date, price, terms, and cancellation policy. You approve, request changes, or decline. Nothing happens without your confirmation.' },
  { q: 'How are bookings confirmed?', a: "A confirmed booking means a real confirmation from the actual provider. Proventa will never tell you something is confirmed when it isn't." },
  { q: 'Can Proventa handle unusual requests?', a: "Often, yes. If a request can reasonably be fulfilled by a concierge — even if it doesn't fit a standard category — we'll do our best. We will always be honest if something is outside our capability." },
  { q: 'How is my data protected?', a: 'Your data is stored securely and used only to serve your requests. You can view, edit, and delete your preferences at any time. We do not use your data for model training without explicit authorisation.' },
  { q: 'Where is Proventa currently available?', a: "Early Access Cohort 1 is now open for private membership application across India and select international destinations. We prioritize ground concierge depth wherever our members travel." },
  { q: 'What is Early Access · Cohort 1?', a: "Cohort 1 is our inaugural group of private members. It allows us to deliver a bespoke, high-touch personal concierge experience with dedicated team members before opening wider access." },
  { q: 'How do I join Cohort 1?', a: "Apply for membership using the Apply for Cohort 1 Access button. Our membership desk reviews applications and extends private invitations directly." },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-14">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 mb-4">Frequently asked questions</h1>
          <p className="text-neutral-500">If your question isn't here, <a href="/contact" className="text-brand-700 hover:underline">contact us</a>.</p>
        </div>
        <div className="space-y-8">
          {FAQS.map((faq) => (
            <div key={faq.q} className="border-b border-neutral-100 pb-8">
              <h2 className="text-base font-semibold text-neutral-900 mb-3">{faq.q}</h2>
              <p className="text-sm text-neutral-500 leading-relaxed">{faq.a}</p>
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
