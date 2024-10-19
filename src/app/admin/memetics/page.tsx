// app/admin/memetics/page.tsx
import React from 'react';
import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import MemeticsManagement from '@/components/admin/memetics/MemeticsManagement';
import { authOptions } from "@/server/auth";

export default async function AdminMemetics() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin');
  }

  if (!session.user.roles.some(role => ['admin', 'editor'].includes(role))) {
    redirect('/');
  }

  return (
    <div className="p-6">
      <MemeticsManagement />
    </div>
  );
}
