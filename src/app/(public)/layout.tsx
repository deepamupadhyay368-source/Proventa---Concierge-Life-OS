import { RealEstateNav } from '@/components/real-estate/RealEstateNav';
import { RealEstateFooter } from '@/components/real-estate/RealEstateFooter';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F3ED] text-[#202B3C] selection:bg-[#547568] selection:text-white font-sans antialiased">
      <RealEstateNav />
      <main className="flex-1">{children}</main>
      <RealEstateFooter />
    </div>
  );
}
