import { type PrismaClient } from '@prisma/client';
import { type RssFeed, type RssItem } from '@/components/rss-feeds/types/FeedTypes';

export interface IFeedUpdater {
  update(ctx: { db: PrismaClient }, feed: RssFeed, items: RssItem[]): Promise<void>;
}