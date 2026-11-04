import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { SessionProvider } from '@/components/providers/session-provider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const sansFont = { variable: '--font-sans' };
const displayFont = { variable: '--font-display' };
const monoFont = { variable: '--font-mono' };

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in'),
  title: {
    default: 'PROVENTA — Industrial Procurement Platform | Require. Compare. Select. Deliver.',
    template: '%s | PROVENTA',
  },
  description:
    'PROVENTA — Industrial Procurement Platform. Require. Compare. Select. Deliver. Digital procurement network connecting industrial and construction buyers with verified suppliers across India.',
  keywords: [
    'PROVENTA',
    'construction procurement platform',
    'building materials Gujarat',
    'TMT steel wholesale',
    'cement procurement',
    'supplier quotation comparison',
    'contractor purchasing network',
    'Ahmedabad construction supplies',
  ],
  authors: [{ name: 'PROVENTA' }],
  creator: 'PROVENTA',
  publisher: 'PROVENTA',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://proventa.in',
    siteName: 'PROVENTA',
    title: 'PROVENTA — Industrial Procurement Platform',
    description:
      'A smarter way to source construction materials, compare supplier quotations and coordinate deliveries.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PROVENTA — Industrial Procurement Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PROVENTA — Industrial Procurement Platform',
    description:
      'A smarter way to source construction materials, compare supplier quotations and coordinate deliveries.',
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
  themeColor: '#191B20',
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
      className={`${sansFont.variable} ${displayFont.variable} ${monoFont.variable}`}
    >
      <body className="min-h-screen bg-[#292F3D] text-[#F1F2F4] antialiased selection:bg-[#536B88] selection:text-[#FFFFFF]">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
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
