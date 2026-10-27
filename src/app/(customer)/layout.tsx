import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F1EA] text-[#0D0E11]">
      <header className="sticky top-0 z-40 border-b-2 border-[#0D0E11] bg-[#FAF8F3]">
        <div className="container-wide flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center bg-[#0D0E11] text-[#C8F904] font-mono text-xs font-bold">
                PV/I
              </span>
              <div>
                <span className="font-display text-base font-bold tracking-tight text-[#0D0E11] block leading-none">
                  {BRAND_CONFIG.name}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#52514E]">
                  BUYER LEDGER
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 border-l border-[#CFCAC0] pl-6 font-mono text-xs uppercase tracking-[0.1em]">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 font-bold text-[#0D0E11] hover:bg-[#EAE5DA]"
              >
                01 // MY ENQUIRIES
              </Link>
              <Link
                href="/businesses"
                className="px-3 py-1.5 text-[#52514E] hover:text-[#0D0E11] hover:bg-[#EAE5DA]"
              >
                02 // DIRECTORY
              </Link>
              <Link
                href="/listings"
                className="px-3 py-1.5 text-[#52514E] hover:text-[#0D0E11] hover:bg-[#EAE5DA]"
              >
                03 // CATALOG
              </Link>
              <Link
                href="/business/dashboard"
                className="px-3 py-1.5 text-[#52514E] hover:text-[#0D0E11] hover:bg-[#EAE5DA]"
              >
                04 // VENDOR CONSOLE
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/enquiries/new"
              className="inline-flex items-center gap-1.5 bg-[#C8F904] text-[#0D0E11] border border-[#0D0E11] px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-[#0D0E11] hover:text-[#C8F904] transition-colors"
            >
              <span>NEW ENQUIRY</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
