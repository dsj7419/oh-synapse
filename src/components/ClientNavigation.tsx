'use client';

import Link from 'next/link';
import { useSession } from "next-auth/react";

export function Navigation() {
  const { data: session, status } = useSession();

//  console.log("Navigation - Session status:", status);
//  console.log("Navigation - Session data:", session);

  return (
    <nav>
      <Link href="/">Home</Link>
      {session?.user.role === 'admin' && (
        <>
          <Link href="/admin/dashboard">
            Admin Dashboard
          </Link>
          <span>(Role: {session.user.role})</span>
        </>
      )}
      {/* Add a sign-in/sign-out button */}
      {status === 'authenticated' ? (
        <button onClick={() => signOut()}>Sign out</button>
      ) : (
        <button onClick={() => signIn()}>Sign in</button>
      )}
    </nav>
  );
}