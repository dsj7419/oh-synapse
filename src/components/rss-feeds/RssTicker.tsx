import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from "@/trpc/react";
import { useThemeContext } from '@/context/ThemeContext';
import { Box, Text, Flex } from '@radix-ui/themes';
import Image from 'next/image';
import { type RssItemWithFeed } from '@/components/rss-feeds/types/FeedTypes';

const RssTicker: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const { theme } = useThemeContext();
  const [items, setItems] = useState<RssItemWithFeed[]>([]);
  const tickerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const offsetRef = useRef(0);

  const { data: tickerSettings } = api.rssFeed.getTickerSettings.useQuery();
  const { data: fetchedItems, refetch } = api.rssFeed.getTickerItems.useQuery(
    { limit: 50 },
    { refetchInterval: 60000 } // Refetch every minute
  );

  const updateItems = useCallback((newItems: RssItemWithFeed[]) => {
    setItems(prevItems => {
      const updatedItems = [...prevItems, ...newItems];
      const uniqueItems = updatedItems.filter((item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
      );
      return uniqueItems;
    });
  }, []);

  useEffect(() => {
    if (fetchedItems) {
      updateItems(fetchedItems.filter((item): item is RssItemWithFeed => item !== null));
    }
  }, [fetchedItems, updateItems]);

  const animate = useCallback(() => {
    if (tickerRef.current) {
      const speed = tickerSettings?.speed ?? 30;
      const pixelsPerFrame = speed / 3600; // Convert pixels per minute to pixels per frame (60 fps)
      offsetRef.current += pixelsPerFrame;
      
      const tickerWidth = tickerRef.current.scrollWidth / 2;
      
      if (offsetRef.current >= tickerWidth) {
        offsetRef.current = 0;
      }
      
      tickerRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
    }
    animationRef.current = requestAnimationFrame(animate);
  }, [tickerSettings?.speed]);

  useEffect(() => {
    if (!isPaused) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationRef.current!);
    }
    return () => cancelAnimationFrame(animationRef.current!);
  }, [isPaused, animate]);

  const pauseOnHover = tickerSettings?.pauseOnHover ?? true;

  const renderItems = () => {
    return items.map((item: RssItemWithFeed, index: number) => (
      <Flex key={item.id} className="ticker__item" align="center" gap="2" style={{ marginRight: `${tickerSettings?.spacing ?? 0}px` }}>
        {item.feed.iconUrl && (
          <Image src={item.feed.iconUrl} alt="Feed icon" width={16} height={16} />
        )}
        <Text size={theme.typographyScale as any} style={{ whiteSpace: 'nowrap' }}>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {item.title}
          </a>
        </Text>
        {item.feed.type === 'youtube' && item.youtubeItem && (
          <Text size="1" style={{ marginLeft: '0.5rem', color: `var(--${theme.accentColor}-11)` }}>
            ({item.youtubeItem.viewCount.toLocaleString()} views)
          </Text>
        )}
      </Flex>
    ));
  };

  return (
    <Box
      className="ticker-wrap"
      style={{
        backgroundColor: `var(--${theme.accentColor}-3)`,
        borderRadius: `var(--radius-${theme.radius})`,
        height: '32px',
        overflow: 'hidden',
      }}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <Flex
        ref={tickerRef}
        className="ticker"
        style={{
          color: `var(--${theme.accentColor}-11)`,
          fontFamily: theme.font,
          height: '100%',
          willChange: 'transform',
          display: 'inline-flex',
        }}
      >
        {renderItems()}
        {renderItems()} {/* Duplicate items for seamless looping */}
      </Flex>
    </Box>
  );
};

export default RssTicker;