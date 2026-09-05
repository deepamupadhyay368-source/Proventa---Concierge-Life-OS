import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from '@/components/ui/sonner';
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in'),
  title: {
    default: 'Proventa — Concierge Life OS | Ahmedabad · Wave 1',
    template: '%s | Proventa — Concierge Life OS',
  },
  description:
    'Proventa is Ahmedabad’s premier Concierge Life OS. Intelligent AI combined with verified human concierges to research, arrange, and manage dining, travel, appointments, and daily lifestyle logistics. Life, handled.',
  keywords: [
    'Proventa',
    'Concierge Life OS',
    'Ahmedabad concierge',
    'luxury concierge Ahmedabad',
    'personal assistant Ahmedabad',
    'lifestyle management',
    'restaurant reservations Ahmedabad',
    'travel concierge Ahmedabad',
    'life handled',
    'Wave 1 Ahmedabad',
  ],
  authors: [{ name: 'Proventa' }],
  creator: 'Proventa',
  publisher: 'Proventa',
  category: 'Lifestyle & Personal Concierge',
  classification: 'Concierge Life OS',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://proventa.in',
    siteName: 'Proventa Concierge Life OS',
    title: 'Proventa — Concierge Life OS | Ahmedabad · Wave 1',
    description: 'Life, handled. Intelligent AI meets verified human concierge support in Ahmedabad.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Proventa — Concierge Life OS',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Proventa — Concierge Life OS | Ahmedabad · Wave 1',
    description: 'Life, handled. Intelligent technology meets real human concierge support.',
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
      name: 'Proventa',
      alternateName: 'Proventa Concierge Life OS',
      url: 'https://proventa.in',
      logo: 'https://proventa.in/og-image.jpg',
      description:
        'Proventa is a Concierge Life OS combining intelligent technology with verified human concierges in Ahmedabad, Gujarat, India.',
      email: 'proventa.in@gmail.com',
      areaServed: {
        '@type': 'City',
        name: 'Ahmedabad',
      },
    },
    {
      '@type': 'Service',
      '@id': 'https://proventa.in/#service',
      name: 'Proventa Concierge Life OS',
      provider: {
        '@id': 'https://proventa.in/#organization',
      },
      serviceType: 'Personal Concierge & Lifestyle Management',
      areaServed: 'Ahmedabad, Gujarat, India',
      description:
        'Personal concierge operations for dining reservations, travel itineraries, wellness appointments, and delegated lifestyle logistics.',
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
