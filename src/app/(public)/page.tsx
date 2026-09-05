import type { Metadata } from 'next';
import { HeroSection } from '@/components/marketing/hero';
import { UseCasesSection } from '@/components/marketing/use-cases';
import { CategoriesSection } from '@/components/marketing/categories';
import { AIHumanSection } from '@/components/marketing/ai-human';
import { HowItWorksSection } from '@/components/marketing/how-it-works';
import { TrustSection } from '@/components/marketing/trust';
import { FinalCTASection } from '@/components/marketing/final-cta';

export const metadata: Metadata = {
  title: 'Proventa — Concierge Life OS',
  description: 'Proventa combines intelligent technology with real human concierge support to research, arrange and manage the things that matter to you. Life, handled.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <UseCasesSection />
      <CategoriesSection />
      <AIHumanSection />
      <HowItWorksSection />
      <TrustSection />
      <FinalCTASection />
    </>
  );
}
