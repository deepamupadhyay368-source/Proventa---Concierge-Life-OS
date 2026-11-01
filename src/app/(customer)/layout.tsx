import { WealthAppShell } from '@/components/wealth/WealthAppShell';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WealthAppShell>{children}</WealthAppShell>;
}
