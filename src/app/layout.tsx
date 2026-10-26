import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from '@/components/ui/sonner';
import { BRAND_CONFIG } from '@/lib/brand';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || BRAND_CONFIG.domain),
  title: {
    default: `${BRAND_CONFIG.name} — ${BRAND_CONFIG.tagline}`,
    template: `%s | ${BRAND_CONFIG.name}`,
  },
  description: `${BRAND_CONFIG.supportingStatement} ${BRAND_CONFIG.centralValueProposition} Built for businesses and customers across Gujarat and India.`,
  keywords: [
    'PROVENTA',
    'Every Business. One Place.',
    'business directory India',
    'Gujarat business marketplace',
    'digital storefront India',
    'customer enquiries marketplace',
    'products and services directory',
    'B2B and B2C business discovery',
    'Ahmedabad businesses',
    'Surat businesses',
    'Vadodara businesses',
    'Rajkot businesses',
  ],
  authors: [{ name: BRAND_CONFIG.name }],
  creator: BRAND_CONFIG.name,
  publisher: BRAND_CONFIG.name,
  category: BRAND_CONFIG.category,
  classification: BRAND_CONFIG.category,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BRAND_CONFIG.domain,
    siteName: BRAND_CONFIG.name,
    title: `${BRAND_CONFIG.name} — ${BRAND_CONFIG.tagline}`,
    description: `${BRAND_CONFIG.supportingStatement} ${BRAND_CONFIG.centralValueProposition}`,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${BRAND_CONFIG.name} — ${BRAND_CONFIG.tagline}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND_CONFIG.name} — ${BRAND_CONFIG.tagline}`,
    description: BRAND_CONFIG.supportingStatement,
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
    { media: '(prefers-color-scheme: dark)', color: '#141312' },
  ],
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://proventa.in/#organization',
      name: BRAND_CONFIG.name,
      slogan: BRAND_CONFIG.tagline,
      url: BRAND_CONFIG.domain,
      logo: 'https://proventa.in/og-image.jpg',
      description: `${BRAND_CONFIG.supportingStatement} ${BRAND_CONFIG.centralValueProposition}`,
      email: BRAND_CONFIG.supportEmail,
    },
    {
      '@type': 'WebSite',
      '@id': 'https://proventa.in/#website',
      url: BRAND_CONFIG.domain,
      name: BRAND_CONFIG.name,
      description: BRAND_CONFIG.supportingStatement,
      publisher: {
        '@id': 'https://proventa.in/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://proventa.in/businesses?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster richColors closeButton position="top-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
