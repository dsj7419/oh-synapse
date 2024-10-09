import { RssFeed, RssItem } from '@/components/rss-feeds/types/FeedTypes';

export interface IFeedParser {
  parse(feedContent: string, feed: RssFeed): Promise<RssItem[]>;
}