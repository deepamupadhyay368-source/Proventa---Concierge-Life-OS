import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in';
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/how-it-works`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/what-we-handle`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/wave1`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/concierge/ahmedabad`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/services/dining`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/services/travel`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];
}
