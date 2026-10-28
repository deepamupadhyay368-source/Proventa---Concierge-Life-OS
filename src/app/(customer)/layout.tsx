import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F0E5] text-[#181914]">
      <header className="sticky top-0 z-40 border-b border-[#4C4A40]/70 bg-[#171A14] text-[#F6F0E4]">
        <div className="container-wide flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <span className="font-sans text-lg font-semibold uppercase tracking-[0.26em] text-[#F6F0E4]">
                {BRAND_CONFIG.name}
              </span>
              <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-[0.16em] text-[#A98253] border-l border-[#4C4A40] pl-3">
                Customer Workspace
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 font-mono text-xs uppercase tracking-[0.12em]">
              <Link
                href="/dashboard"
                className="px-3.5 py-2 text-[#F6F0E4] hover:text-[#B94E2D] transition-colors"
              >
                My Enquiries
              </Link>
              <Link
                href="/businesses"
                className="px-3.5 py-2 text-[#A7A194] hover:text-[#F6F0E4] transition-colors"
              >
                Businesses
              </Link>
              <Link
                href="/listings"
                className="px-3.5 py-2 text-[#A7A194] hover:text-[#F6F0E4] transition-colors"
              >
                Products &amp; Services
              </Link>
              <Link
                href="/business/dashboard"
                className="px-3.5 py-2 text-[#A7A194] hover:text-[#F6F0E4] transition-colors"
              >
                Business Console
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/enquiries/new"
              className="inline-flex items-center gap-1.5 bg-[#B94E2D] text-[#F6F0E4] px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] hover:bg-[#9E3F22] transition-colors"
            >
              <span>Post Enquiry</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
