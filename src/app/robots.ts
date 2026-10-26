import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/businesses',
          '/business/',
          '/listings',
          '/for-businesses',
          '/enquiries/new',
          '/pricing',
          '/how-it-works',
          '/about',
          '/guidelines',
          '/faq',
          '/contact',
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/admin/',
          '/dashboard/',
          '/business/dashboard',
          '/business/register',
          '/concierge/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
