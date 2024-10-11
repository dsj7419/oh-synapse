const { PrismaClient } = require('@prisma/client');
const { RssFeedService } = require('@/services/RssFeedService');
const { RssFeed } = require('@/components/rss-feeds/types/FeedTypes');

const prisma = new PrismaClient();

async function executeCronJob() {
  console.log('Running RSS feed cron job');
  try {
    const feeds = await prisma.rssFeed.findMany();
    for (const feed of feeds) {
      await RssFeedService.fetchAndUpdateFeed({ db: prisma }, feed);
    }
    console.log('RSS feed cron job completed successfully');
  } catch (error) {
    console.error('Error in RSS feed cron job:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);  // Ensure the process exits after execution
  }
}

// Only execute the job if this file is run directly
if (require.main === module) {
  executeCronJob();
}
