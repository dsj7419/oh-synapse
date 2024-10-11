import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { RssFeed, RssItem, FeedType, RssItemWithFeed, YouTubeRssItemWithFeed, TwitterRssItemWithFeed } from '@/components/rss-feeds/types/FeedTypes';
import { FeedParserFactory } from '@/components/rss-feeds/utils/FeedParserFactory';
import { GenericRssFeedUpdater } from '@/components/rss-feeds/updaters/GenericRssFeedUpdater';
import { YouTubeFeedUpdater } from '@/components/rss-feeds/updaters/YouTubeFeedUpdater';
import { TwitterFeedUpdater } from '@/components/rss-feeds/updaters/TwitterFeedUpdater';
import { KeywordFeedFilter } from '@/components/rss-feeds/filters/KeywordFeedFilter';

export class RssFeedService {
  static async fetchAndUpdateFeed(ctx: { db: PrismaClient }, feed: RssFeed): Promise<void> {
    try {
      const parser = FeedParserFactory.createParser(feed.type);
      let feedContent: string;

      if (feed.type === 'youtube') {
        const response = await axios.get(feed.url);
        feedContent = response.data;
      } else {
        feedContent = feed.url;
      }

      const items = await parser.parse(feedContent, feed);
      const filter = new KeywordFeedFilter();
      const filteredItems = filter.filter(items, feed.keywords);
      
      let updater: GenericRssFeedUpdater | YouTubeFeedUpdater | TwitterFeedUpdater;
      switch (feed.type) {
        case 'youtube':
          updater = new YouTubeFeedUpdater();
          break;
        case 'twitter':
          updater = new TwitterFeedUpdater();
          break;
        default:
          updater = new GenericRssFeedUpdater();
      }
      
      await updater.update(ctx, feed, filteredItems);
      await ctx.db.rssFeed.update({
        where: { id: feed.id },
        data: { lastFetched: new Date() },
      });
    } catch (error) {
      console.error(`Error fetching RSS feed (${feed.type}):`, error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch and update ${feed.type} feed: ${error.message}`);
      } else {
        throw new Error(`Failed to fetch and update ${feed.type} feed: Unknown error`);
      }
    }
  }

  static async getTickerItems(ctx: { db: PrismaClient }, limit: number): Promise<(RssItemWithFeed | null)[]> {
    const tickerSettings = await ctx.db.tickerSettings.findUnique({ where: { id: 'singleton' } });
    const feeds = await ctx.db.rssFeed.findMany({
      where: { showInTicker: true },
      include: {
        items: {
          orderBy: { pubDate: 'desc' },
          take: tickerSettings?.maxItemsPerFeed ?? 5,
          include: {
            youtubeItem: true,
            twitterItem: true,
          },
        },
      },
    });

    const mixedItems: (RssItemWithFeed | null)[] = [];
    let allFeedsExhausted = false;
    let itemIndex = 0;

    while (mixedItems.length < limit && !allFeedsExhausted) {
      allFeedsExhausted = true;
      for (const feed of feeds) {
        if (itemIndex < feed.items.length) {
          const item = feed.items[itemIndex];
          if (item) {
            const baseItem: Omit<RssItemWithFeed, 'youtubeItem' | 'twitterItem'> = {
              id: item.id,
              title: item.title,
              link: item.link,
              pubDate: item.pubDate,
              description: item.description,
              author: item.author,
              feedId: item.feedId,
              feed: {
                iconUrl: feed.iconUrl,
                url: feed.url,
                type: feed.type,
              },
            };

            let rssItemWithFeed: RssItemWithFeed;

            if (item.youtubeItem) {
              rssItemWithFeed = {
                ...baseItem,
                youtubeItem: item.youtubeItem,
              };
            } else if (item.twitterItem) {
              rssItemWithFeed = {
                ...baseItem,
                twitterItem: {
                  ...item.twitterItem,
                  username: item.twitterItem.username || item.author, 
                },
              };
            } else {
              rssItemWithFeed = baseItem as RssItemWithFeed;
            }

            mixedItems.push(rssItemWithFeed);
            allFeedsExhausted = false;

            for (let i = 0; i < (tickerSettings?.spacing ?? 0) && mixedItems.length < limit; i++) {
              mixedItems.push(null);
            }

            if (mixedItems.length >= limit) break;
          }
        }
      }
      itemIndex++;
    }

    return mixedItems;
  }

  static async getFullFeedItems(ctx: { db: PrismaClient }, page: number, pageSize: number): Promise<RssItem[]> {
    return ctx.db.rssItem.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { pubDate: 'desc' },
      include: { feed: true },
    });
  }

  static async updateFeedKeywords(ctx: { db: PrismaClient }, feedId: string, keywords: string[]): Promise<void> {
    await ctx.db.rssFeed.update({
      where: { id: feedId },
      data: { keywords },
    });
    const feed = await ctx.db.rssFeed.findUnique({ where: { id: feedId } });
    if (feed) {
      await this.fetchAndUpdateFeed(ctx, feed);
    }
  }

  static async updateAllFeeds(ctx: { db: PrismaClient }): Promise<void> {
    const feeds = await ctx.db.rssFeed.findMany();
    for (const feed of feeds) {
      try {
        await this.fetchAndUpdateFeed(ctx, feed);
        console.log(`Updated feed: ${feed.title}`);
      } catch (error) {
        console.error(`Error updating feed ${feed.title}:`, error);
      }
    }
  }
}