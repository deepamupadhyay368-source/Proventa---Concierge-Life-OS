import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { SessionProvider } from '@/components/providers/session-provider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

// Font imports removed to avoid network dependency during build.
// Using system default fonts via CSS.

const sansFont = { variable: '--font-sans' };
const displayFont = { variable: '--font-display' };

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.proventa.in'),
  title: {
    default: 'PROVENTA — Real Estate Intelligence | Understand Property. See Beyond Location.',
    template: '%s | PROVENTA Real Estate Intelligence',
  },
  description:
    'Independent Indian real estate intelligence platform. Understand property prices, evaluate investments, compare locations and monitor property values using transparent, evidence-based data.',
  keywords: [
    'PROVENTA',
    'Real Estate Intelligence',
    'Ahmedabad property prices',
    'property valuation Ahmedabad',
    'RERA carpet area',
    'Shela property rates',
    'South Bopal real estate',
    'GIFT City property investment',
    'Bodakdev luxury apartments',
    'Gujarat Jantri vs market value',
    'Property Vault',
    'independent real estate data',
  ],
  alternates: {
    canonical: 'https://www.proventa.in',
  },
  authors: [{ name: 'PROVENTA Real Estate Intelligence' }],
  creator: 'PROVENTA Real Estate Intelligence',
  publisher: 'PROVENTA Real Estate Intelligence',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://proventa.in',
    siteName: 'PROVENTA Real Estate Intelligence',
    title: 'PROVENTA — Real Estate Intelligence | Know your property. Know its value.',
    description:
      'Independent Indian real estate intelligence platform. Understand property prices, evaluate investments, compare locations and monitor property values using transparent, evidence-based data.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PROVENTA — Real Estate Intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PROVENTA — Real Estate Intelligence',
    description:
      'Know your property. Know its value. Transparent, evidence-governed property valuation and market intelligence.',
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
  themeColor: '#FFFFFF',
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
      className={`${sansFont.variable} ${displayFont.variable}`}
    >
      <body className="min-h-screen bg-[#FFFFFF] text-[#202B38] antialiased selection:bg-[#29465F] selection:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SessionProvider>
            <QueryProvider>
              {children}
              <Toaster richColors closeButton position="top-right" />
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
