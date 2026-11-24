import React from 'react';
import { HomeNav } from '@/components/home/HomeNav';
import { HomeFooter } from '@/components/home/HomeFooter';

export const metadata = {
  title: 'PROVENTA Home — Household Maintenance Membership & Property Care',
  description: 'Your Home. Always Taken Care Of. Technology-enabled household maintenance membership connecting Indian households with verified local technicians.',
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F2F0E9] text-[#171A17] selection:bg-[#53634A] selection:text-white font-sans antialiased">
      <HomeNav />
      <main className="flex-1">
        {children}
      </main>
      <HomeFooter />
    </div>
  );
}
