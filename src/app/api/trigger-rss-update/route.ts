import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { RssFeedService } from '@/services/RssFeedService';

const prisma = new PrismaClient();

export async function POST() {
  try {
    await RssFeedService.updateAllFeeds({ db: prisma });
    return NextResponse.json({ message: 'All feeds updated successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update feeds', error: String(error) },
      { status: 500 }
    );
  }
}