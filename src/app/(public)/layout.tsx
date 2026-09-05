import { PublicNav } from '@/components/marketing/nav';
import { PublicFooter } from '@/components/marketing/footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNav />
      <main>{children}</main>
      <PublicFooter />
    </>
  );
}
