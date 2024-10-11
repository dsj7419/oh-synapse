import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { RssFeedUpdater } from '@/server/background/RssFeedUpdater';

const prisma = new PrismaClient();
let updater: RssFeedUpdater | null = null;

export async function POST() {
  if (!updater) {
    updater = new RssFeedUpdater(prisma);
    updater.start(30); // Start updating every 30 minutes
    return NextResponse.json({ message: 'RSS Feed Updater initialized and started' });
  } else {
    return NextResponse.json({ message: 'RSS Feed Updater already running' });
  }
}