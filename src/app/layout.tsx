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
    default: 'PROVENTA — YOUR WEALTH. ONE LIVING SYSTEM. | Experimental Digital Art',
    template: '%s | PROVENTA',
  },
  description:
    'PROVENTA — YOUR WEALTH. ONE LIVING SYSTEM. A fusion of experimental digital art, computational architecture, and family financial infrastructure.',
  keywords: [
    'PROVENTA',
    'Family Wealth OS',
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
    title: 'PROVENTA — YOUR WEALTH. ONE LIVING SYSTEM.',
    description:
      'A fusion of experimental digital art, computational architecture, and family financial infrastructure.',
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
      'A fusion of experimental digital art, computational architecture, and family financial infrastructure.',
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
          <QueryProvider>
            {children}
            <Toaster richColors closeButton position="top-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
