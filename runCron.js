import { PrismaClient } from '@prisma/client';
import { RssFeedService } from './src/services/RssFeedService';

const prisma = new PrismaClient();

async function runCronJob() {
  console.log('Starting RSS feed update cron job');
  try {
    const feeds = await prisma.rssFeed.findMany();
    for (const feed of feeds) {
      await RssFeedService.fetchAndUpdateFeed({ db: prisma }, feed);
    }
    console.log('RSS feed update completed');
  } catch (error) {
    console.error('Error during RSS feed update:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

runCronJob();
