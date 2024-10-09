import { IFeedParser } from '@/components/rss-feeds/parsers/IFeedParser';
import { YouTubeFeedParser } from '@/components/rss-feeds/parsers/YouTubeFeedParser';
import { TwitterFeedParser } from '@/components/rss-feeds/parsers/TwitterFeedParser';
import { FeedType } from '@/components/rss-feeds/types/FeedTypes';

export class FeedParserFactory {
  static createParser(feedType: FeedType): IFeedParser {
    switch (feedType) {
      case 'youtube':
        return new YouTubeFeedParser();
      case 'twitter':
        return new TwitterFeedParser();
      case 'generic':
        throw new Error('Generic parser not implemented yet');
      default:
        throw new Error(`Unsupported feed type: ${feedType}`);
    }
  }
}