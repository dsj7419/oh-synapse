'use client';

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

interface ClientSessionProviderProps {
  children: React.ReactNode;
  session: Session | null;
}

export function ClientSessionProvider({ children, session }: ClientSessionProviderProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}