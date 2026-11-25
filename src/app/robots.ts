import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/property-intelligence',
          '/location-intelligence',
          '/project-intelligence',
          '/investment-intelligence',
          '/reports',
          '/pricing',
          '/methodology',
          '/about',
          '/privacy',
          '/terms',
          '/login',
          '/signup',
        ],
        disallow: [
          '/dashboard/',
          '/professional/',
          '/admin/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
