import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ | PROVENTA — Every Business. One Place.',
  description: 'Frequently asked questions about PROVENTA universal business discovery, digital storefronts, and customer enquiries.',
};

const FAQS = [
  {
    q: 'What is PROVENTA?',
    a: 'PROVENTA ("Every Business. One Place.") is a universal business discovery, digital storefront, and customer enquiry marketplace. Businesses create verified digital storefronts and showcase their products or services, while customers discover businesses, post structured requirements, and compare quotations.',
  },
  {
    q: 'Who can list a business on PROVENTA?',
    a: 'Any legitimate business, shop, clinic, restaurant, service provider, agency, consultant, freelancer, wholesaler, distributor, or manufacturer can register a digital storefront on PROVENTA across 18 industry categories.',
  },
  {
    q: 'How does the Customer Enquiry Marketplace work?',
    a: 'Customers can either send a direct enquiry to a specific business or post a requirement to a category/city marketplace. PROVENTA matches the enquiry with relevant published businesses based on category, subcategory, location, and catalog relevance, and matched businesses respond with structured quotations.',
  },
  {
    q: 'Is my contact information shared publicly when I post an enquiry?',
    a: 'No. By default, customer contact details (email and phone number) are kept private and are only shared with businesses whose quotations you explicitly shortlist or accept.',
  },
  {
    q: 'How does business verification work on PROVENTA?',
    a: 'PROVENTA uses transparent, honest verification badges: Self-Reported (newly registered), Contact Verified, Document Reviewed, and Verified Business (admin-reviewed business identity and documentation). We never fabricate verification badges or reviews.',
  },
  {
    q: 'Is it free for customers to search and post enquiries?',
    a: 'Yes. Searching the business directory, browsing product and service catalogs, posting customer enquiries, and comparing quotations are completely free for customers.',
  },
  {
    q: 'What plans are available for businesses?',
    a: 'Businesses can start on the Free Storefront plan (public storefront, up to 10 listings, and up to 5 quotation responses per month) or upgrade to Growth Pro or Enterprise Premium for higher listing capacity, priority enquiry matching, and multi-member team management.',
  },
  {
    q: 'Which cities and regions does PROVENTA support?',
    a: 'PROVENTA is launching across Gujarat (Ahmedabad, Surat, Vadodara, Rajkot, Gandhinagar, and surrounding industrial/commercial hubs) with pan-India and global expansion support built into every storefront.',
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-14">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-neutral-500">
            Have another question? <Link href="/contact" className="text-brand-700 hover:underline">Contact our team</Link>.
          </p>
        </div>
        <div className="space-y-8">
          {FAQS.map((faq) => (
            <div key={faq.q} className="border-b border-neutral-100 pb-8">
              <h2 className="text-base font-semibold text-neutral-900 mb-3">{faq.q}</h2>
              <p className="text-sm text-neutral-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
          <Link href="/businesses" className="inline-flex items-center px-6 py-3 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
            Explore Businesses
          </Link>
          <Link href="/business/register" className="inline-flex items-center px-6 py-3 border border-neutral-300 text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors">
            List Your Business
          </Link>
        </div>
      </div>
    </div>
  );
}
