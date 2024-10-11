import { PrismaClient } from '@prisma/client';
import { RssFeedService } from "@/services/RssFeedService";
import { RssFeed } from "@/components/rss-feeds/types/FeedTypes";

const prisma = new PrismaClient();

export async function executeCronJob() {
  console.log('Running RSS feed cron job');
  try {
    const feeds = await prisma.rssFeed.findMany();
    for (const feed of feeds) {
      await RssFeedService.fetchAndUpdateFeed({ db: prisma }, feed as RssFeed);
    }
    console.log('RSS feed cron job completed successfully');
  } catch (error) {
    console.error('Error in RSS feed cron job:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Only execute the job if this file is run directly (not imported)
if (require.main === module) {
  executeCronJob();
}