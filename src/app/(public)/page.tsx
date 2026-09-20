import type { Metadata } from 'next';
import { HeroSection } from '@/components/marketing/hero';
import { LiveActivitySection } from '@/components/marketing/live-activity';
import { CoreMessageSection } from '@/components/marketing/core-message';
import { InteractiveServicesSection } from '@/components/marketing/interactive-services';
import { ConciergeRequestBox } from '@/components/marketing/concierge-request-box';
import { HowItWorksSection } from '@/components/marketing/how-it-works';
import { HumanConciergeSection } from '@/components/marketing/human-concierge';
import { LiveCitySection } from '@/components/marketing/live-city';
import { TrustSection } from '@/components/marketing/trust';
import { FinalCTASection } from '@/components/marketing/final-cta';

export const metadata: Metadata = {
  title: 'PROVENTA — Concierge Life OS | Life, Handled',
  description:
    'You ask. We handle it. Proventa is your sovereign human-first personal concierge for dining, travel, stays, mobility, and bespoke life operations.',
};

export default function HomePage() {
  return (
    <div className="bg-black text-white min-h-screen selection:bg-white selection:text-black">
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Live Activity Feed */}
      <LiveActivitySection />

      {/* 3. Core Message (You Ask. We Handle. You Live.) */}
      <CoreMessageSection />

      {/* 4. Interactive Editorial Services (Whatever Life Needs) */}
      <InteractiveServicesSection />

      {/* 5. Concierge Request Box (What Do You Need?) */}
      <ConciergeRequestBox />

      {/* 6. How It Works (01 Ask -> 02 We Handle -> 03 Done) */}
      <HowItWorksSection />

      {/* 7. Human Concierge (Not Just AI. A Human When It Matters) */}
      <HumanConciergeSection />

      {/* 8. Live City Experience (Ahmedabad — Live) */}
      <LiveCitySection />

      {/* 9. Trust & Sovereignty */}
      <TrustSection />

      {/* 10. Final Bold CTA (Live More. Plan Less.) */}
      <FinalCTASection />
    </div>
  );
}
