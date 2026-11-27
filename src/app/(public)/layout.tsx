import { ProcurementNav } from '@/components/procurement/ProcurementNav';
import { ProcurementFooter } from '@/components/procurement/ProcurementFooter';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F3F5F7] text-[#172B3A] selection:bg-[#172B3A] selection:text-white font-sans antialiased">
      <ProcurementNav />
      <main className="flex-1">{children}</main>
      <ProcurementFooter />
    </div>
  );
}
