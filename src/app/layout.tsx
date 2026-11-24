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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in'),
  title: {
    default: 'PROVENTA HOME — Household Maintenance Membership | Your Home. Always Taken Care Of.',
    template: '%s | PROVENTA HOME',
  },
  description:
    'PROVENTA Home is a household maintenance membership platform that helps individuals and families manage routine home repairs, maintenance, and upkeep through a verified local technician network and digital Household Maintenance Passport.',
  keywords: [
    'PROVENTA HOME',
    'household maintenance membership',
    'home repair subscription Ahmedabad',
    'verified electrician Ahmedabad',
    'verified plumber Bopal',
    'AC maintenance Ahmedabad',
    'preventive home care',
    'Household Maintenance Passport',
    'apartment society maintenance India',
  ],
  alternates: {
    canonical: 'https://proventa.in',
  },
  authors: [{ name: 'PROVENTA Technologies' }],
  creator: 'PROVENTA Technologies',
  publisher: 'PROVENTA Technologies',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://proventa.in',
    siteName: 'PROVENTA HOME',
    title: 'PROVENTA HOME — Household Maintenance Membership | Your Home. Always Taken Care Of.',
    description:
      'A technology-enabled household maintenance membership connecting Indian homes with verified local technicians for plumbing, electrical, carpentry, and appliance maintenance.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PROVENTA HOME — Your Home. Always Taken Care Of.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PROVENTA HOME — Household Maintenance Membership',
    description:
      'Your Home. Always Taken Care Of. Routine home repairs and preventive maintenance with verified local professionals.',
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
  themeColor: '#F2F0E9',
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
      <body className="min-h-screen bg-[#F2F0E9] text-[#171A17] antialiased selection:bg-[#53634A] selection:text-white">
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
