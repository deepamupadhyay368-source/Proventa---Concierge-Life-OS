import Image from 'next/image';
import Link from 'next/link';
import { SectionWrapper } from '@/components/home/ui/SectionWrapper';
import { Card } from '@/components/home/ui/Card';

const SERVICES = [
  { icon: '⚡', title: 'Electrical', desc: 'Fan installation, switch repairs, DB box checks, light fittings.' },
  { icon: '🔧', title: 'Plumbing', desc: 'Tap repairs, drainage clearing, tank cleaning, pipe leaks.' },
  { icon: '❄️', title: 'Air Conditioning', desc: 'Service, gas refill, filter cleaning, installation.' },
  { icon: '🔨', title: 'Carpentry', desc: 'Door/window repairs, furniture assembly, cabinet work.' },
  { icon: '🎨', title: 'Painting', desc: 'Touch-ups, full-room painting, wall texture work.' },
  { icon: '🧹', title: 'Deep Cleaning', desc: 'Kitchen, bathroom, full-flat, post-renovation cleaning.' },
];

const PLAN_HIGHLIGHTS = [
  { tier: 'Essential', price: '₹999/mo', desc: 'Up to 4 service visits. Perfect for a compact home.' },
  { tier: 'Standard', price: '₹1,999/mo', desc: 'Up to 8 visits. Most popular for 2–3 BHK.' },
  { tier: 'Premium', price: '₹3,499/mo', desc: 'Unlimited visits + dedicated technician.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Subscribe', desc: 'Choose a plan. Subscribe in under 2 minutes.' },
  { step: '02', title: 'Book', desc: 'Request any service from your dashboard. Available 7 days a week.' },
  { step: '03', title: 'We Send a Pro', desc: 'A verified, background-checked technician arrives on time.' },
  { step: '04', title: 'Stay Informed', desc: 'Your Household Maintenance Passport logs every visit and repair.' },
];

export default function HomePage() {
  return (
    <main>
      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center bg-[#F2F0E9]">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=85"
            alt="Premium Indian living room interior"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#F2F0E9]/60" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-24">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#53634A]">
            Household Maintenance Membership
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight text-[#171A17] max-w-3xl">
            Your Home.<br />Always Taken<br />Care Of.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-[#4B5563] leading-relaxed">
            One membership. Every household essential. Verified local technicians for plumbing, electrical, carpentry, AC and more — across Ahmedabad.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center h-12 px-8 text-base font-semibold rounded-md bg-[#53634A] text-white hover:bg-[#3d4a36] transition-all"
            >
              Join PROVENTA
            </Link>
            <Link
              href="/membership"
              className="inline-flex items-center justify-center h-12 px-8 text-base font-semibold rounded-md border border-[#171A17] text-[#171A17] hover:bg-[#171A17] hover:text-white transition-all"
            >
              View Plans
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="border-y border-[#E5E3DB] bg-white py-5">
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-sm text-[#6B7280]">
          <span className="flex items-center gap-2"><span className="text-[#53634A] font-semibold">✓</span> Background-verified technicians</span>
          <span className="flex items-center gap-2"><span className="text-[#53634A] font-semibold">✓</span> 7-day a week service</span>
          <span className="flex items-center gap-2"><span className="text-[#53634A] font-semibold">✓</span> Digital Maintenance Passport</span>
          <span className="flex items-center gap-2"><span className="text-[#53634A] font-semibold">✓</span> No surprise charges</span>
        </div>
      </div>

      {/* SERVICES GRID */}
      <SectionWrapper>
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-[#171A17]">Every Home Essential, Covered.</h2>
          <p className="mt-3 text-[#6B7280] max-w-xl mx-auto">From a dripping tap to a full AC overhaul — your membership covers it all.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SERVICES.map((s) => (
            <Card key={s.title} className="hover:border-[#53634A] transition-colors">
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="font-display text-lg font-semibold text-[#171A17] mb-1">{s.title}</h3>
              <p className="text-sm text-[#6B7280]">{s.desc}</p>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/services" className="text-sm font-medium text-[#53634A] hover:underline">
            View all services →
          </Link>
        </div>
      </SectionWrapper>

      {/* EDITORIAL IMAGE BREAK */}
      <div className="relative h-72 md:h-[480px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80"
          alt="A technician working professionally in a home"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#171A17]/40 flex items-center justify-center">
          <blockquote className="text-center text-white max-w-2xl px-6">
            <p className="font-display text-3xl md:text-5xl font-light italic leading-snug">
              &ldquo;A home that runs smoothly is a home at peace.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <SectionWrapper className="bg-white">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-[#171A17]">Simple. Reliable. Always On.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} className="text-center">
              <div className="font-display text-5xl font-bold text-[#E5E3DB] mb-3">{step.step}</div>
              <h3 className="font-display text-xl font-semibold text-[#171A17] mb-2">{step.title}</h3>
              <p className="text-sm text-[#6B7280]">{step.desc}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* MEMBERSHIP PLANS */}
      <SectionWrapper>
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-[#171A17]">One Membership. Full Peace of Mind.</h2>
          <p className="mt-3 text-[#6B7280] max-w-lg mx-auto">Transparent pricing. No hidden charges. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLAN_HIGHLIGHTS.map((plan, i) => (
            <Card key={plan.tier} className={i === 1 ? 'border-[#53634A] ring-1 ring-[#53634A]' : ''}>
              {i === 1 && (
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#53634A]">Most Popular</p>
              )}
              <h3 className="font-display text-2xl font-bold text-[#171A17]">{plan.tier}</h3>
              <p className="mt-1 text-3xl font-bold text-[#53634A]">{plan.price}</p>
              <p className="mt-3 text-sm text-[#6B7280]">{plan.desc}</p>
              <div className="mt-6">
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center h-10 px-5 text-sm font-semibold rounded-md bg-[#53634A] text-white hover:bg-[#3d4a36] transition-all"
                >
                  Get Started
                </Link>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/membership" className="text-sm font-medium text-[#53634A] hover:underline">
            Compare all plans →
          </Link>
        </div>
      </SectionWrapper>

      {/* HOUSEHOLD MAINTENANCE PASSPORT SECTION */}
      <SectionWrapper className="bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#53634A]">Exclusive Feature</p>
            <h2 className="font-display text-4xl font-bold text-[#171A17] leading-tight">
              Your Household<br />Maintenance Passport
            </h2>
            <p className="mt-4 text-[#6B7280] leading-relaxed">
              Every repair, every technician visit, every part replaced — permanently recorded in your Household Maintenance Passport. Know your home&apos;s history. Never repeat the same mistake twice.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {['Complete service history', 'Appliance records & warranties', 'Technician details & ratings', 'PDF export for property resale'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-[#4B5563]">
                  <span className="text-[#53634A]">✓</span> {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="/signup" className="inline-flex items-center justify-center h-10 px-6 text-sm font-semibold rounded-md bg-[#53634A] text-white hover:bg-[#3d4a36] transition-all">
                Start Your Passport
              </Link>
            </div>
          </div>
          <div className="relative h-80 md:h-96 rounded-xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
              alt="Household maintenance record keeping"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </SectionWrapper>

      {/* CTA BANNER */}
      <section className="bg-[#53634A] py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
            Your Home Deserves<br />Professional Care.
          </h2>
          <p className="mt-4 text-[#C8D5BC] max-w-xl mx-auto">
            Join hundreds of Ahmedabad families who trust PROVENTA to keep their homes running.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link href="/signup" className="inline-flex items-center justify-center h-12 px-8 text-base font-semibold rounded-md bg-white text-[#53634A] hover:bg-[#F2F0E9] transition-all">
              Join Today
            </Link>
            <Link href="/how-it-works" className="inline-flex items-center justify-center h-12 px-8 text-base font-semibold rounded-md border border-white text-white hover:bg-white/10 transition-all">
              Learn How It Works
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
