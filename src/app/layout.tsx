import type { Metadata, Viewport } from 'next';
import { Inter, Instrument_Serif, IBM_Plex_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-display',
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in'),
  title: {
    default: 'PROVENTA — YOUR WEALTH. ONE LIVING SYSTEM. | The Wealth Institution',
    template: '%s | PROVENTA',
  },
  description:
    'PROVENTA — YOUR WEALTH. ONE LIVING SYSTEM. The independent family financial infrastructure and private wealth operating system. Consolidated net worth, asset registers, encrypted family vault, and private wealth intelligence.',
  keywords: [
    'PROVENTA',
    'Family Wealth OS',
    'The Wealth Institution',
    'Family Financial Infrastructure',
    'Consolidated Net Worth India',
    'Private Wealth Intelligence',
    'Family Office Software',
  ],
  authors: [{ name: 'PROVENTA' }],
  creator: 'PROVENTA',
  publisher: 'PROVENTA',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://proventa.in',
    siteName: 'PROVENTA',
    title: 'PROVENTA — YOUR WEALTH. ONE LIVING SYSTEM.',
    description:
      'PROVENTA — YOUR WEALTH. ONE LIVING SYSTEM. The independent family financial infrastructure and private wealth operating system.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PROVENTA — YOUR WEALTH. ONE LIVING SYSTEM.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PROVENTA — YOUR WEALTH. ONE LIVING SYSTEM.',
    description:
      'The independent family financial infrastructure and private wealth operating system.',
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
    { media: '(prefers-color-scheme: light)', color: '#171A14' },
    { media: '(prefers-color-scheme: dark)', color: '#171A14' },
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
      className={`${inter.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen bg-[#F5F0E5] text-[#181914] antialiased">
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
