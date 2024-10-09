'use client';
import React from 'react';
import { useThemeContext } from '@/context/ThemeContext';
import { Box, Heading, Flex, Tabs } from '@radix-ui/themes';
import AddRssFeedForm from './AddRssFeedForm';
import RssFeedList from './RssFeedList';
import RssTickerSettings from './RssTickerSettings';
import { RssFeedProvider } from './RssFeedContext';

const RssSettingsContent: React.FC = () => {
  const { theme } = useThemeContext();

  return (
    <RssFeedProvider>
      <Box style={{ backgroundColor: 'var(--color-background)', padding: '1rem' }}>
        <Heading size="6" mb="4" style={{ color: 'var(--color-text)' }}>RSS Feed Management</Heading>
        <Tabs.Root defaultValue="feeds">
          <Tabs.List>
            <Tabs.Trigger value="feeds">Feeds</Tabs.Trigger>
            <Tabs.Trigger value="ticker">Ticker Settings</Tabs.Trigger>
          </Tabs.List>
          <Box mt="4">
            <Tabs.Content value="feeds">
              <Flex direction="column" gap="4">
                <AddRssFeedForm />
                <RssFeedList />
              </Flex>
            </Tabs.Content>
            <Tabs.Content value="ticker">
              <RssTickerSettings />
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Box>
    </RssFeedProvider>
  );
};

export default RssSettingsContent;