'use client';

import { useSession } from "next-auth/react";

export default function AdminDashboardContent() {
  const { data: session } = useSession();

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session?.user.name ?? session?.user.email}</p>
    </div>
  );
}