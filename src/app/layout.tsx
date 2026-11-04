import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { SessionProvider } from '@/components/providers/session-provider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

// Institutional Typographic System (offline-resilient system & web font variables)
const geist = { variable: '--font-sans' };
const spaceGrotesk = { variable: '--font-display' };
const geistMono = { variable: '--font-mono' };

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in'),
  title: {
    default: 'PROVENTA — Construction Procurement Platform | Require. Compare. Select. Deliver.',
    template: '%s | PROVENTA',
  },
  description:
    'PROVENTA — Construction Procurement Platform. Require. Compare. Select. Deliver. Digital procurement network connecting construction buyers with verified suppliers across India.',
  keywords: [
    'PROVENTA',
    'Financial Intelligence Platform',
    'Experimental Digital Art',
    'The Proventa Object',
    'Wealth Topology',
    'Family Financial Infrastructure',
    'Consolidated Net Worth India',
  ],
  authors: [{ name: 'PROVENTA' }],
  creator: 'PROVENTA',
  publisher: 'PROVENTA',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://proventa.in',
    siteName: 'PROVENTA',
    title: 'PROVENTA — Construction Procurement Platform',
    description:
      'Require. Compare. Select. Deliver. Digital procurement network connecting construction buyers with verified suppliers across India.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PROVENTA — Construction Procurement Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PROVENTA — Construction Procurement Platform',
    description:
      'Require. Compare. Select. Deliver. Digital procurement network connecting construction buyers with verified suppliers across India.',
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
    { media: '(prefers-color-scheme: light)', color: '#F4F2ED' },
    { media: '(prefers-color-scheme: dark)', color: '#080A0F' },
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
      className={`${geist.variable} ${spaceGrotesk.variable} ${geistMono.variable} dark`}
    >
      <body className="min-h-screen bg-[#080A0F] text-[#F4F2ED] antialiased selection:bg-[#2457E8] selection:text-[#F4F2ED]">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
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
