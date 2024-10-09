import React, { useEffect, useRef } from 'react';
import { Card, Box, Text, Avatar, Flex } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';
import { RssFeed } from '@/components/rss-feeds/types/FeedTypes';
import { api } from "@/trpc/react";
import { useInView } from 'react-intersection-observer';

interface FeedBoxProps {
  feed: RssFeed;
}

const FeedBox: React.FC<FeedBoxProps> = ({ feed }) => {
  const { theme } = useThemeContext();
  const { ref, inView } = useInView();
  const twitterScriptLoaded = useRef(false);

  const itemsQuery = api.rssFeed.getFeedItems.useInfiniteQuery(
    { feedId: feed.id, limit: 5 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  useEffect(() => {
    if (inView && itemsQuery.hasNextPage) {
      itemsQuery.fetchNextPage();
    }
  }, [inView, itemsQuery]);

  useEffect(() => {
    if (feed.type === 'twitter' && !twitterScriptLoaded.current) {
      const script = document.createElement('script');
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.charset = "utf-8";
      document.body.appendChild(script);
      twitterScriptLoaded.current = true;

      return () => {
        document.body.removeChild(script);
        twitterScriptLoaded.current = false;
      };
    }
  }, [feed.type]);

  const renderTwitterTimeline = (item: any) => {
    if (item.description && item.description.includes('twitter-timeline')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(item.description, 'text/html');
      const timeline = doc.querySelector('.twitter-timeline');
      if (timeline) {
        timeline.setAttribute('data-theme', theme.appearance === 'dark' ? 'dark' : 'light');
      }
      const updatedHtml = doc.body.innerHTML;

      return (
        <Box key={item.id} mb="3">
          <div dangerouslySetInnerHTML={{ __html: updatedHtml }} />
        </Box>
      );
    }
    return null;
  };

  const renderYouTubeItem = (item: any) => {
    return (
      <Box key={item.id} mb="3">
        <Text weight="bold">
          <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
            {item.title}
          </a>
        </Text>
        <Text size="1" color="gray">{new Date(item.pubDate).toLocaleString()}</Text>
        <Text size="2" style={{ marginTop: '0.5rem' }}>{item.description.slice(0, 100)}...</Text>
        {item.youtubeItem && (
          <Box mt="2">
            <img src={item.youtubeItem.thumbnailUrl} alt={item.title} style={{ width: '100%', height: 'auto' }} />
            <Text size="1" mt="1">Views: {item.youtubeItem.viewCount.toLocaleString()}</Text>
          </Box>
        )}
      </Box>
    );
  };

  const renderGenericItem = (item: any) => {
    return (
      <Box key={item.id} mb="3">
        <Text weight="bold">
          <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
            {item.title}
          </a>
        </Text>
        <Text size="1" color="gray">{new Date(item.pubDate).toLocaleString()}</Text>
        <Text size="2" style={{ marginTop: '0.5rem' }}>{item.description.slice(0, 100)}...</Text>
      </Box>
    );
  };

  const renderItem = (item: any) => {
    switch (feed.type) {
      case 'twitter':
        return renderTwitterTimeline(item);
      case 'youtube':
        return renderYouTubeItem(item);
      default:
        return renderGenericItem(item);
    }
  };

  return (
    <Card style={{ backgroundColor: 'var(--color-surface)' }}>
      <Flex align="center" gap="2" mb="2">
        <Avatar
          size="3"
          src={feed.iconUrl ?? undefined}
          fallback={feed.title?.[0]?.toUpperCase() ?? ''}
          radius={theme.radius}
        />
        <Text weight="bold">{feed.title}</Text>
      </Flex>
      
      <Box>
        {itemsQuery.data?.pages.flatMap(page => page.items).map(renderItem)}
      </Box>
      
      {itemsQuery.hasNextPage && (
        <Box ref={ref} style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Text size="2">Loading more items...</Text>
        </Box>
      )}
    </Card>
  );
};

export default FeedBox;
