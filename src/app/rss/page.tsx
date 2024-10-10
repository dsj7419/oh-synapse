"use client";

import RssPage from '@/components/rss-feeds/RssPage';
import { ScrollArea } from '@radix-ui/themes';

export default function Page() {
  return (
    <ScrollArea style={{ height: '100vh', width: '100%' }}>
      <div style={{ minHeight: '100%', padding: '1rem' }}>
        <RssPage />
      </div>
    </ScrollArea>
  );
}