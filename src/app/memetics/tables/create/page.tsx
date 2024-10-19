// app/memetics/tables/create/page.tsx
import React from 'react';
import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import MemeticTableCreate from '@/components/memetics/MemeticTableCreate';
import { authOptions } from "@/server/auth";

export default async function CreateMemeticTable() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="p-6">
      <MemeticTableCreate userId={session.user.id} />
    </div>
  );
}
