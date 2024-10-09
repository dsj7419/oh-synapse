import { IFeedUpdater } from './IFeedUpdater';
import { PrismaClient } from '@prisma/client';
import { RssFeed, RssItem } from '@/components/rss-feeds/types/FeedTypes';

export class TwitterFeedUpdater implements IFeedUpdater {
  async update(ctx: { db: PrismaClient }, feed: RssFeed, items: RssItem[]): Promise<void> {
    if (items.length === 0) {
      console.log(`No items to update for Twitter feed: ${feed.title}`);
      return;
    }

    if (items.length > 1) {
      console.warn(`Received ${items.length} items for Twitter feed ${feed.title}, expected 1. Using only the first item.`);
    }

    const item = items[0];

    if (!item) {
      console.error(`First item is undefined for Twitter feed: ${feed.title}`);
      return;
    }

    if (!item.twitterItem) {
      console.error(`Twitter item is missing for RSS item in feed: ${feed.title}`);
      return;
    }

    try {
      await ctx.db.rssItem.upsert({
        where: { id: item.id },
        update: {
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          description: item.description,
          author: item.author,
          twitterItem: {
            upsert: {
              create: {
                tweetId: item.twitterItem.tweetId,
                username: item.twitterItem.username,
                retweetCount: item.twitterItem.retweetCount,
                likeCount: item.twitterItem.likeCount,
              },
              update: {
                tweetId: item.twitterItem.tweetId,
                username: item.twitterItem.username,
                retweetCount: item.twitterItem.retweetCount,
                likeCount: item.twitterItem.likeCount,
              },
            },
          },
        },
        create: {
          id: item.id,
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          description: item.description,
          author: item.author,
          feedId: feed.id,
          twitterItem: {
            create: {
              tweetId: item.twitterItem.tweetId,
              username: item.twitterItem.username,
              retweetCount: item.twitterItem.retweetCount,
              likeCount: item.twitterItem.likeCount,
            },
          },
        },
      });
      console.log(`Updated Twitter timeline item for ${item.twitterItem.username} in feed: ${feed.title}`);
    } catch (error) {
      console.error(`Error updating Twitter timeline item for feed ${feed.title}:`, error);
      throw error; 
    }
  }
}