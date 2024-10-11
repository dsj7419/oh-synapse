'use client';

import React, { useState } from 'react';
import { useThemeContext } from '@/context/ThemeContext';
import { Box, Heading, Flex, Tabs, Button, Text } from '@radix-ui/themes';
import AddRssFeedForm from './AddRssFeedForm';
import RssFeedList from './RssFeedList';
import RssTickerSettings from './RssTickerSettings';
import { RssFeedProvider } from './RssFeedContext';
import { api } from '@/trpc/react';

const RssSettingsContent: React.FC = () => {
  const { theme } = useThemeContext();
  const [loading, setLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const manualUpdateMutation = api.rssFeed.manualUpdateAll.useMutation();

  const handleUpdateAllFeeds = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trigger-rss-update', { method: 'POST' });
      const data = await response.json();
      setUpdateStatus({ message: data.message, type: 'success' });
    } catch (error) {
      setUpdateStatus({ message: 'Failed to update all feeds. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setUpdateStatus(null), 3000);
    }
  };

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
                <Button 
                  onClick={handleUpdateAllFeeds} 
                  disabled={loading}
                  style={{
                    backgroundColor: `var(--${theme.accentColor}-9)`,
                    color: 'var(--color-background)',
                    borderRadius: `var(--radius-${theme.radius})`,
                  }}
                >
                  {loading ? 'Updating Feeds...' : 'Update RSS Feeds'}
                </Button>
                {updateStatus && (
                  <Text
                    size="2"
                    style={{
                      color: updateStatus.type === 'success' ? `var(--${theme.accentColor}-11)` : 'var(--color-error)',
                    }}
                  >
                    {updateStatus.message}
                  </Text>
                )}
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
