import { IFeedUpdater } from './IFeedUpdater';
import { PrismaClient } from '@prisma/client';
import { RssFeed, RssItem } from '@/components/rss-feeds/types/FeedTypes';

export class YouTubeFeedUpdater implements IFeedUpdater {
  async update(ctx: { db: PrismaClient }, feed: RssFeed, items: RssItem[]): Promise<void> {
    for (const item of items) {
      if (item.youtubeItem) {
        await ctx.db.rssItem.upsert({
          where: { link: item.link },
          update: {
            title: item.title,
            pubDate: item.pubDate,
            description: item.description,
            author: item.author,
            youtubeItem: {
              update: {
                videoId: item.youtubeItem.videoId,
                channelId: item.youtubeItem.channelId,
                thumbnailUrl: item.youtubeItem.thumbnailUrl,
                viewCount: item.youtubeItem.viewCount,
                likeCount: item.youtubeItem.likeCount,
                dislikeCount: item.youtubeItem.dislikeCount,
                commentCount: item.youtubeItem.commentCount,
                duration: item.youtubeItem.duration,
                tags: item.youtubeItem.tags,
                categoryId: item.youtubeItem.categoryId,
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
            youtubeItem: {
              create: {
                videoId: item.youtubeItem.videoId,
                channelId: item.youtubeItem.channelId,
                thumbnailUrl: item.youtubeItem.thumbnailUrl,
                viewCount: item.youtubeItem.viewCount,
                likeCount: item.youtubeItem.likeCount,
                dislikeCount: item.youtubeItem.dislikeCount,
                commentCount: item.youtubeItem.commentCount,
                duration: item.youtubeItem.duration,
                tags: item.youtubeItem.tags,
                categoryId: item.youtubeItem.categoryId,
              },
            },
          },
        });
      }
    }
  }
}