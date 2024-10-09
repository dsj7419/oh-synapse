import { PrismaClient } from '@prisma/client';
import { RssFeed, RssItem } from '@/components/rss-feeds/types/FeedTypes';

export interface IFeedUpdater {
  update(ctx: { db: PrismaClient }, feed: RssFeed, items: RssItem[]): Promise<void>;
}