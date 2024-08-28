'use client';

import { SessionProvider } from "next-auth/react";
import { Navigation } from "./Navigation";

export function ClientSessionProvider({ children, session }) {
  return (
    <SessionProvider session={session}>
      <Navigation />
      {children}
    </SessionProvider>
  );
}