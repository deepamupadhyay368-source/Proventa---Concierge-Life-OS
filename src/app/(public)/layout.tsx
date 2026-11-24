import { HomeNav } from '@/components/home/HomeNav';
import { HomeFooter } from '@/components/home/HomeFooter';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F2F0E9] text-[#171A17] selection:bg-[#53634A] selection:text-white font-sans antialiased">
      <HomeNav />
      <main className="flex-1">{children}</main>
      <HomeFooter />
    </div>
  );
}
