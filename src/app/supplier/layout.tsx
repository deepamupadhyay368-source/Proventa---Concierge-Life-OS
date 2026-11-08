import { PublicNav } from '@/components/marketing/nav';
import { PublicFooter } from '@/components/marketing/footer';

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] flex flex-col font-sans">
      <PublicNav />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
