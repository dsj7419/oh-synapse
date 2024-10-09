export type FeedType = 'youtube' | 'twitter' | 'generic';

export interface RssFeed {
  id: string;
  title: string | null;
  url: string;
  lastFetched: Date;
  keywords: string[];
  showInTicker: boolean;
  iconUrl: string | null;
  type: FeedType;
  maxItemsOverall: number;
}

export interface RssItem {
  id: string;
  title: string;
  link: string;
  pubDate: Date;
  description: string;
  author: string;
  feedId: string;
  youtubeItem?: YouTubeItem;
  twitterItem?: TwitterItem;
}

export interface YouTubeItem {
  id: string;
  rssItemId: string;
  videoId: string;
  channelId: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number | null;
  dislikeCount: number | null;
  commentCount: number | null;
  duration: string | null;
  tags: string[];
  categoryId: string | null;
}

export interface TwitterItem {
  id: string;
  rssItemId: string;
  tweetId: string; 
  username: string;
  retweetCount: number;
  likeCount: number;
}

export interface RssItemWithFeed extends RssItem {
  feed: Pick<RssFeed, 'iconUrl' | 'url' | 'type'>;
}

export interface YouTubeRssItemWithFeed extends RssItemWithFeed {
  youtubeItem: YouTubeItem;
}

export interface TwitterRssItemWithFeed extends RssItemWithFeed {
  twitterItem: TwitterItem;
}

export interface PrismaRssItem extends Omit<RssItem, 'youtubeItem' | 'twitterItem'> {
  youtubeItem: YouTubeItem | null;
  twitterItem: TwitterItem | null;
}

export interface PrismaRssFeed extends Omit<RssFeed, 'items'> {
  items: PrismaRssItem[];
}
