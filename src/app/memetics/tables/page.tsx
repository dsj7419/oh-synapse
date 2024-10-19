// app/memetics/tables/page.tsx
import React from 'react';
import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import MemeticTableList from '@/components/memetics/MemeticTableList';
import { authOptions } from "@/server/auth";

export default async function MemeticTables() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="p-6">
      <MemeticTableList userId={session.user.id} />
    </div>
  );
}
