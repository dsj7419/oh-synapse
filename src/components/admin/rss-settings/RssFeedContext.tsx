import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from "@/trpc/react";
import { type RssFeed, FeedType } from '@/components/rss-feeds/types/FeedTypes';

interface RssFeedContextType {
  feeds: RssFeed[];
  editingFeed: RssFeed | null;
  setEditingFeed: (feed: RssFeed | null) => void;
  refreshFeeds: () => void;
  isLoading: boolean;
  error: Error | null;
}

const RssFeedContext = createContext<RssFeedContextType | undefined>(undefined);

export const RssFeedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [editingFeed, setEditingFeed] = useState<RssFeed | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const { data, isLoading: queryLoading, error: queryError, refetch } = api.rssFeed.getAll.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  useEffect(() => {
    if (data) {
      const allFeeds = data.pages.flatMap((page) => page.items);
      setFeeds(allFeeds as RssFeed[]);
    }
    setIsLoading(queryLoading);
    setError(queryError as Error | null);
  }, [data, queryLoading, queryError]);

  const refreshFeeds = () => {
    refetch();
  };

  return (
    <RssFeedContext.Provider value={{ feeds, editingFeed, setEditingFeed, refreshFeeds, isLoading, error }}>
      {children}
    </RssFeedContext.Provider>
  );
};

export const useRssFeedContext = () => {
  const context = useContext(RssFeedContext);
  if (context === undefined) {
    throw new Error('useRssFeedContext must be used within a RssFeedProvider');
  }
  return context;
};