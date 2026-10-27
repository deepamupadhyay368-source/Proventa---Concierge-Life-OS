import Link from 'next/link';
import { auth, signOut } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import {
  Building2,
  FileText,
  Store,
  User,
  LogOut,
  Plus,
} from 'lucide-react';

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/sign-in');

  const navItems = [
    { href: '/dashboard', label: 'My Enquiries', icon: FileText },
    { href: '/businesses', label: 'Explore Businesses', icon: Building2 },
    { href: '/business/dashboard', label: 'Business Portal', icon: Store },
    { href: '/profile', label: 'Account', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#15171B] flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 h-16 border-b border-[#E8E9ED] bg-[#FFFFFF]/95 backdrop-blur-md">
        <div className="container-wide h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#15171B] text-[13px] font-bold text-white">
                P
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-[16px] font-bold tracking-[-0.03em] text-[#15171B]">
                  PROVENTA
                </span>
                <span className="hidden lg:inline-block text-[11px] font-medium text-[#696D76] border-l border-[#E8E9ED] pl-2">
                  Customer Workspace
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1" aria-label="Customer Workspace Navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-[8px] text-[13px] font-medium text-[#696D76] hover:text-[#15171B] hover:bg-[#F2F3F6] transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/enquiries/new"
              className="inline-flex items-center gap-1.5 rounded-[9px] bg-[#304FFE] hover:bg-[#243FE0] px-3.5 py-2 text-[13px] font-semibold text-white transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Post Enquiry</span>
            </Link>
            <span className="text-[13px] font-medium text-[#696D76] hidden sm:block">
              {session.user.name ?? session.user.email}
            </span>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <button
                type="submit"
                aria-label="Sign out"
                title="Sign out"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-[8px] border border-[#E8E9ED] bg-[#FFFFFF] text-[12px] font-medium text-[#696D76] hover:text-[#15171B] hover:bg-[#F2F3F6] transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 container-wide py-8 md:py-10 w-full">
        {children}
      </main>
    </div>
  );
}
