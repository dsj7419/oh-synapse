'use client';
import React from 'react';
import MemeticTableLiveView from '@/components/memetics/MemetricTableLiveView';
import { useParams } from 'next/navigation';
import { ScrollArea } from '@radix-ui/themes';

export default function LiveMemeticTablePage() {
  const params = useParams();
  const publicLink = params?.publiclink as string;

  console.log('LiveMemeticTablePage rendered with params:', params);
  console.log('Extracted publicLink:', publicLink);

  if (!publicLink) {
    return <div>Invalid Link</div>;
  }

  return (
    <ScrollArea style={{ height: '100vh', width: '100%' }}>
      <div className="p-6">
        <MemeticTableLiveView publicLink={publicLink} />
      </div>
    </ScrollArea>
  );
}