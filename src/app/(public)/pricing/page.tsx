import ForBusinessesPage from '../for-businesses/page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Plans & Freemium Pricing | PROVENTA',
  description:
    'Start with a free PROVENTA digital storefront or upgrade to Pro and Premium business plans for expanded product/service listings and monthly quotation responses.',
};

export default function PricingPage() {
  return <ForBusinessesPage />;
}
