import { WealthAppShell } from '@/components/wealth/WealthAppShell';
import { WorkspaceProvider } from '@/lib/wealth/workspace-context';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <WealthAppShell>{children}</WealthAppShell>
    </WorkspaceProvider>
  );
}
