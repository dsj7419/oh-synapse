import { type IFeedFilter } from './IFeedFilter';
import { type RssItem } from '@/components/rss-feeds/types/FeedTypes';

export class KeywordFeedFilter implements IFeedFilter {
  filter(items: RssItem[], keywords: string[]): RssItem[] {
    if (keywords.length === 0) return items;
    const lowercaseKeywords = keywords.map(k => k.toLowerCase());
    return items.filter(item =>
      lowercaseKeywords.some(keyword =>
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
      )
    );
  }
}