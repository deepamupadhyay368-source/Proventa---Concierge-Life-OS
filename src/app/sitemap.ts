import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in';
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/wave1`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/how-it-works`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/what-we-handle`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/trust`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/concierge/ahmedabad`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/services/dining`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/services/travel`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/services/shopping`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/services/experiences`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/services/home`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/cookie-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];
}
