// app/memetics/tables/[id]/page.tsx
import React from 'react';
import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import MemeticTableView from '@/components/memetics/MemeticTableView';
import { authOptions } from "@/server/auth";
import { ScrollArea } from '@radix-ui/themes';

export default async function MemeticTablePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const tableId = params.id;

  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <ScrollArea style={{ height: '100vh', width: '100%' }}>
    <div className="p-6">
      <MemeticTableView userId={session.user.id} tableId={tableId} />
    </div>
    </ScrollArea>
  );
}