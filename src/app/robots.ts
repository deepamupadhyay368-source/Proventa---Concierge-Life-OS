import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/membership',
          '/services',
          '/how-it-works',
          '/service-areas',
          '/societies',
          '/partners',
          '/join',
          '/about',
          '/faq',
          '/contact',
          '/terms',
          '/privacy',
          '/refund-policy',
        ],
        disallow: [
          '/admin/',
          '/customer/',
          '/partner/',
          '/concierge/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
