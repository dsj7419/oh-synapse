import { type IFeedParser } from './IFeedParser';
import { type RssFeed, type RssItem } from '@/components/rss-feeds/types/FeedTypes';
import axios from 'axios';

interface TwitterOEmbedResponse {
  url: string;
  author_name: string;
  author_url: string;
  html: string;
  width: number;
  height: number | null;
}

export class TwitterFeedParser implements IFeedParser {
  private extractUsername(url: string): string {
    console.log(`Extracting username from URL: ${url}`);
    const twitterRegex = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/(?:#!\/)?@?([^/?#]+)/i;
    const match = twitterRegex.exec(url);
    const result = match ? match[1] : url;
    console.log(`Extracted username: ${result}`);
    return result || '';
  }

  async parse(feedContent: string, feed: RssFeed): Promise<RssItem[]> {
    try {
      console.log(`Parsing Twitter feed for URL: ${feed.url}`);
      const username = this.extractUsername(feed.url);
      const oembedUrl = `https://publish.twitter.com/oembed`;
      console.log(`Constructed oEmbed URL: ${oembedUrl}`);

      console.log('Sending request to Twitter oEmbed API');
      const response = await axios.get<TwitterOEmbedResponse>(oembedUrl, {
        params: {
          url: `https://twitter.com/${username}`,
          limit: 5,
          omit_script: true
        }
      });
      console.log('Received response from Twitter oEmbed API');

      const twitterData = response.data;
      console.log('Twitter oEmbed data:', JSON.stringify(twitterData, null, 2));

      const rssItem: RssItem = {
        id: `twitter-timeline-${username}`,
        title: `Twitter Timeline: ${twitterData.author_name || username}`,
        link: twitterData.url,
        pubDate: new Date(),
        description: twitterData.html,
        author: twitterData.author_name || username,
        feedId: feed.id,
        twitterItem: {
          id: `twitter-timeline-${username}`,
          rssItemId: `twitter-timeline-${username}`,
          tweetId: username,
          username: username,
          retweetCount: 0,
          likeCount: 0,
        }
      };

      console.log('Created RSS item:', JSON.stringify(rssItem, null, 2));
      return [rssItem];
    } catch (error) {
      console.error('Error parsing Twitter feed:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
        });
      }
      throw error;
    }
  }
}