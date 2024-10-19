import React, { useState } from 'react';
import { api } from "@/trpc/react";
import { useThemeContext } from '@/context/ThemeContext';
import { Box, Text, Button, Flex, Card, ScrollArea, Avatar } from '@radix-ui/themes';
import { TrashIcon, ArrowPathIcon, PencilIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '@/components/common/ConfirmationModal.component';
import { useSession } from "next-auth/react";
import { useRssFeedContext } from './RssFeedContext';

const RssFeedList: React.FC = () => {
  const { theme } = useThemeContext();
  const { data: session } = useSession();
  const { feeds, setEditingFeed, refreshFeeds, isLoading, error } = useRssFeedContext();
  const [feedToDelete, setFeedToDelete] = useState<{ id: string; title: string } | null>(null);
  const logActionMutation = api.auditLogs.logAction.useMutation();

  const deleteFeedMutation = api.rssFeed.delete.useMutation();
  const refreshFeedMutation = api.rssFeed.refresh.useMutation();

  const handleDelete = async () => {
    if (feedToDelete) {
      try {
        await deleteFeedMutation.mutateAsync(feedToDelete.id);
        await logActionMutation.mutateAsync({
          action: 'Delete RSS Feed',
          resourceType: 'RSSFeed',
          resourceId: feedToDelete.id,
          severity: 'medium',
          details: { deletedFeedTitle: feedToDelete.title },
        });
        setFeedToDelete(null);
        refreshFeeds();
      } catch (error) {
        console.error('Failed to delete feed:', error);
        await logActionMutation.mutateAsync({
          action: 'Delete RSS Feed Failed',
          resourceType: 'RSSFeed',
          resourceId: feedToDelete.id,
          severity: 'high',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        });
      }
    }
  };
  
  const handleRefresh = async (id: string) => {
    try {
      await refreshFeedMutation.mutateAsync(id);
      await logActionMutation.mutateAsync({
        action: 'Refresh RSS Feed',
        resourceType: 'RSSFeed',
        resourceId: id,
        severity: 'low',
      });
      refreshFeeds();
    } catch (error) {
      console.error('Failed to refresh feed:', error);
      await logActionMutation.mutateAsync({
        action: 'Refresh RSS Feed Failed',
        resourceType: 'RSSFeed',
        resourceId: id,
        severity: 'medium',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  };

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text color="red">Error: {error.message}</Text>;

  return (
    <Box>
      <Text size="3" weight="bold" mb="2">RSS Feeds</Text>
      <ScrollArea style={{ height: '400px' }}>
        <Flex direction="column" gap="2">
          {feeds.map((feed) => (
            <Card key={feed.id} style={{ backgroundColor: 'var(--color-surface)' }}>
              <Flex align="center" justify="between">
                <Flex align="center" gap="2">
                  <Avatar
                    size="3"
                    src={feed.iconUrl ?? undefined}
                    fallback={feed.title?.[0]?.toUpperCase() ?? ''}
                    radius={theme.radius}
                  />
                  <Box>
                    <Text weight="bold">{feed.title}</Text>
                    <Text size="1" style={{ color: 'var(--gray-11)' }}>{feed.url}</Text>
                  </Box>
                </Flex>
                <Flex gap="2">
                  <Button size="1" variant="soft" onClick={() => handleRefresh(feed.id)}>
                    <ArrowPathIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="1"
                    variant="soft"
                    onClick={() => setEditingFeed(feed)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="1"
                    variant="soft"
                    color="red"
                    onClick={() => setFeedToDelete({ id: feed.id, title: feed.title ?? '' })}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </Flex>
              </Flex>
              <Box mt="2">
                <Text size="1">Type: {feed.type}</Text>
                <Text size="1">Keywords: {feed.keywords.join(', ')}</Text>
                <Text size="1">Show in ticker: {feed.showInTicker ? 'Yes' : 'No'}</Text>
              </Box>
            </Card>
          ))}
        </Flex>
      </ScrollArea>
      <ConfirmationModal
        isOpen={!!feedToDelete}
        onClose={() => setFeedToDelete(null)}
        onConfirm={handleDelete}
        title="Delete RSS Feed"
        message={`Are you sure you want to delete the RSS feed: ${feedToDelete?.title}?`}
        confirmText="Delete"
        confirmColor="red"
      />
    </Box>
  );
};

export default RssFeedList;