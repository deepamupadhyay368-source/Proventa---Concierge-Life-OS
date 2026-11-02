import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in'),
  title: {
    default: 'PROVENTA — YOUR WEALTH. ONE LIVING SYSTEM. | Living Financial Universe',
    template: '%s | PROVENTA',
  },
  description:
    'PROVENTA — YOUR WEALTH. ONE LIVING SYSTEM. An intelligent, connected financial universe for high-net-worth Indian families to organize, understand, monitor, and preserve their complete financial universe.',
  keywords: [
    'PROVENTA',
    'Family Wealth OS',
    'Living Financial Universe',
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
      'PROVENTA — YOUR WEALTH. ONE LIVING SYSTEM. Next-generation family financial infrastructure built with titanium precision and digital cobalt intelligence.',
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
      'Next-generation family financial infrastructure built with titanium precision and digital cobalt intelligence.',
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
    { media: '(prefers-color-scheme: light)', color: '#FAFBFC' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0E17' },
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
      className={`${geist.variable} ${spaceGrotesk.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-[#FAFBFC] text-[#0F172A] antialiased">
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
