'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export interface WorkspaceOption {
  id: string;
  name: string;
  type: 'INDIVIDUAL' | 'FAMILY';
  role?: string;
  membersCount?: number;
  code?: string;
}

interface WorkspaceContextType {
  currentWorkspaceId: string;
  currentWorkspace: WorkspaceOption;
  workspaces: WorkspaceOption[];
  setCurrentWorkspaceId: (id: string) => void;
  refreshWorkspaces: () => Promise<void>;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  } | null;
  isLoaded: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const userId = session?.user?.id || '';
  const userName = session?.user?.name || 'Personal Account';
  const userEmail = session?.user?.email || '';

  const defaultIndividualWorkspace: WorkspaceOption = {
    id: userId ? `ind_${userId}` : 'pending_workspace',
    name: `${userName} (Personal)`,
    type: 'INDIVIDUAL',
    role: 'PRIMARY OWNER',
    membersCount: 1,
    code: 'IND-001',
  };

  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([defaultIndividualWorkspace]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>(userId ? `ind_${userId}` : '');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // If new user needs registration, redirect to /register-details
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const needsReg = (session.user as unknown as { needsRegistration?: boolean }).needsRegistration;
      if (needsReg && pathname !== '/register-details') {
        router.replace('/register-details');
      }
    }
  }, [status, session, pathname, router]);

  // Update current workspace when userId becomes available
  useEffect(() => {
    if (userId) {
      setCurrentWorkspaceId((prev) => {
        if (!prev || prev === 'pending_workspace') {
          return `ind_${userId}`;
        }
        return prev;
      });
      setWorkspaces([
        {
          id: `ind_${userId}`,
          name: `${userName} (Personal)`,
          type: 'INDIVIDUAL',
          role: 'PRIMARY OWNER',
          membersCount: 1,
          code: 'IND-001',
        },
      ]);
    }
  }, [userId, userName]);

  const fetchWorkspaces = useCallback(async () => {
    if (status === 'loading' || !userId) {
      if (status !== 'loading') setIsLoaded(true);
      return;
    }
    try {
      const res = await fetch(`/api/wealth/workspaces?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const list: WorkspaceOption[] = [];
          
          if (json.data.individual) {
            list.push({
              id: json.data.individual.id,
              name: `${userName} (Personal)`,
              type: 'INDIVIDUAL',
              role: 'PRIMARY OWNER',
              membersCount: 1,
              code: 'IND-001',
            });
          }

          if (Array.isArray(json.data.families)) {
            for (const fam of json.data.families) {
              const member = fam.members?.find((m: { userId: string }) => m.userId === userId);
              list.push({
                id: fam.id,
                name: fam.name,
                type: 'FAMILY',
                role: member?.role || 'MEMBER',
                membersCount: fam.members?.length || 1,
                code: fam.id.substring(0, 7).toUpperCase(),
              });
            }
          }

          if (list.length > 0) {
            setWorkspaces(list);
            setCurrentWorkspaceId((prev) => {
              const exists = list.some((w) => w.id === prev);
              return exists ? prev : list[0].id;
            });
          }
        }
      }
    } catch {
      // Fallback stays as default individual workspace
    } finally {
      setIsLoaded(true);
    }
  }, [userId, userName, status]);

  useEffect(() => {
    void fetchWorkspaces();
  }, [fetchWorkspaces]);

  const currentWorkspace =
    workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0] || defaultIndividualWorkspace;

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspaceId: currentWorkspaceId || defaultIndividualWorkspace.id,
        currentWorkspace,
        workspaces,
        setCurrentWorkspaceId,
        refreshWorkspaces: fetchWorkspaces,
        user: session?.user ? {
          id: userId,
          name: userName,
          email: userEmail,
          image: session.user.image,
        } : null,
        isLoaded,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useCurrentWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useCurrentWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
