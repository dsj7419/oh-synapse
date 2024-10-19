import React, { useState, useEffect } from 'react';
import { api } from "@/trpc/react";
import { useThemeContext } from '@/context/ThemeContext';
import { Box, Text, Flex, Card, ScrollArea, Heading, Select, Grid } from '@radix-ui/themes';
import Image from 'next/image';
import { RssItem, type RssFeed } from '@/components/rss-feeds/types/FeedTypes';
import FeedBox from '@/components/rss-feeds/FeedBox';
import { useInView } from 'react-intersection-observer';

const RssPage: React.FC = () => {
  const { theme } = useThemeContext();
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [selectedFeedType, setSelectedFeedType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { ref, inView } = useInView();
  const feedsQuery = api.rssFeed.getAll.useInfiniteQuery(
    { limit: 10, type: selectedFeedType !== 'all' ? selectedFeedType as "youtube" | "twitter" | "generic" : undefined },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  useEffect(() => {
    if (feedsQuery.data) {
      const newFeeds = feedsQuery.data.pages.flatMap(page => page.items);
      setFeeds(newFeeds);
    }
  }, [feedsQuery.data]);

  useEffect(() => {
    if (inView) {
      feedsQuery.fetchNextPage();
    }
  }, [inView, feedsQuery]);

  const handleFeedTypeChange = (value: string) => {
    setSelectedFeedType(value);
    feedsQuery.refetch();
  };

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value as 'asc' | 'desc');
  };

  const sortedFeeds = [...feeds].sort((a, b) => {
    const dateA = new Date(a.lastFetched).getTime();
    const dateB = new Date(b.lastFetched).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return (
    <Box style={{ backgroundColor: 'var(--color-background)', padding: '1rem' }}>
      <Heading size="6" mb="4" style={{ color: 'var(--color-text)' }}>RSS Feeds</Heading>
      
      <Flex justify="between" align="center" mb="4">
        <Select.Root value={selectedFeedType} onValueChange={handleFeedTypeChange}>
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="all">All Feeds</Select.Item>
            <Select.Item value="youtube">YouTube</Select.Item>
            <Select.Item value="twitter">Twitter</Select.Item>
            <Select.Item value="generic">Generic RSS</Select.Item>
          </Select.Content>
        </Select.Root>
        
        <Select.Root value={sortOrder} onValueChange={handleSortOrderChange}>
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="desc">Newest First</Select.Item>
            <Select.Item value="asc">Oldest First</Select.Item>
          </Select.Content>
        </Select.Root>
      </Flex>

      <Grid columns={{ initial: '1', md: '2', lg: '3' }} gap="4">
        {sortedFeeds.map((feed) => (
          <FeedBox key={feed.id} feed={feed} />
        ))}
      </Grid>

      {feedsQuery.hasNextPage && (
        <Box ref={ref} style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Text>Loading more feeds...</Text>
        </Box>
      )}
    </Box>
  );
};

export default RssPage;