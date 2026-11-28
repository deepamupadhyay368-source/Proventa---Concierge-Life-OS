import { RealEstateTerminalNav } from '@/components/real-estate/RealEstateTerminalNav';
import { RealEstateTerminalFooter } from '@/components/real-estate/RealEstateTerminalFooter';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#080E18] text-[#F5F7FA] selection:bg-[#4D9FFF] selection:text-[#080E18] font-sans antialiased">
      <RealEstateTerminalNav />
      <main className="flex-1">{children}</main>
      <RealEstateTerminalFooter />
    </div>
  );
}
