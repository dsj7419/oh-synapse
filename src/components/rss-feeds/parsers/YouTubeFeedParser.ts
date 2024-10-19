import { type IFeedParser } from './IFeedParser';
import { type RssFeed, type RssItem, type YouTubeItem } from '@/components/rss-feeds/types/FeedTypes';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXML = promisify(parseString);

export class YouTubeFeedParser implements IFeedParser {
  async parse(feedContent: string, feed: RssFeed): Promise<RssItem[]> {
    try {
      const result = await parseXML(feedContent) as { feed?: { entry?: any[] } };
      if (!result.feed?.entry) {
        throw new Error('Invalid YouTube feed format');
      }

      return result.feed.entry.map((entry: any): RssItem => {
        const mediaGroup = entry['media:group'][0];
        const mediaCommunity = mediaGroup['media:community'][0];

        const youtubeItem: YouTubeItem = {
          id: entry['yt:videoId'][0],
          rssItemId: '', // This will be set when the RssItem is created
          videoId: entry['yt:videoId'][0],
          channelId: entry['yt:channelId'][0],
          thumbnailUrl: mediaGroup['media:thumbnail'][0].$.url,
          viewCount: parseInt(mediaCommunity['media:statistics'][0].$.views, 10),
          likeCount: mediaCommunity['media:starRating']
            ? parseInt(mediaCommunity['media:starRating'][0].$.count, 10)
            : null,
          dislikeCount: null, // YouTube API no longer provides dislike counts
          commentCount: mediaCommunity['media:statistics'][0].$.comments
            ? parseInt(mediaCommunity['media:statistics'][0].$.comments, 10)
            : null,
          duration: mediaGroup['yt:duration']
            ? mediaGroup['yt:duration'][0].$.seconds
            : null,
          tags: mediaGroup['media:keywords']
            ? mediaGroup['media:keywords'][0].split(',').map((tag: string) => tag.trim())
            : [],
          categoryId: mediaGroup['media:category']
            ? mediaGroup['media:category'][0]._
            : null,
        };

        return {
          id: entry['yt:videoId'][0],
          title: entry.title[0],
          link: entry.link.find((link: any) => link.$.rel === 'alternate')?.$.href,
          pubDate: new Date(entry.published[0]),
          description: mediaGroup['media:description'][0],
          author: entry.author[0].name[0],
          feedId: feed.id,
          youtubeItem: youtubeItem,
        };
      });
    } catch (error) {
      console.error('Error parsing YouTube feed:', error);
      throw new Error(`Failed to parse YouTube feed: ${(error as Error).message}`);
    }
  }
}