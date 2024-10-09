import { IFeedUpdater } from './IFeedUpdater';
import { PrismaClient } from '@prisma/client';
import { RssFeed, RssItem } from '@/components/rss-feeds/types/FeedTypes';

export class GenericRssFeedUpdater implements IFeedUpdater {
  async update(ctx: { db: PrismaClient }, feed: RssFeed, items: RssItem[]): Promise<void> {
    const existingItems = await ctx.db.rssItem.findMany({
      where: { feedId: feed.id },
      select: { link: true }
    });
    const existingLinks = new Set(existingItems.map(item => item.link));
    const newItems = items.filter(item => !existingLinks.has(item.link));

    if (newItems.length > 0) {
      await ctx.db.rssItem.createMany({
        data: newItems,
        skipDuplicates: true,
      });
    }

    await ctx.db.rssFeed.update({
      where: { id: feed.id },
      data: {
        lastFetched: new Date(),
      },
    });
  }
}