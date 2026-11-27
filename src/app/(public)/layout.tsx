import { RealEstateTerminalNav } from '@/components/real-estate/RealEstateTerminalNav';
import { RealEstateTerminalFooter } from '@/components/real-estate/RealEstateTerminalFooter';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-[#0F172A] selection:text-white font-sans antialiased">
      <RealEstateTerminalNav />
      <main className="flex-1">{children}</main>
      <RealEstateTerminalFooter />
    </div>
  );
}
