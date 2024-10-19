import { type RssItem } from '@/components/rss-feeds/types/FeedTypes';

export interface IFeedFilter {
  filter(items: RssItem[], keywords: string[]): RssItem[];
}