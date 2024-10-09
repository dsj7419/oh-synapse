import React, { useState, useEffect } from 'react';
import { api } from "@/trpc/react";
import { useThemeContext } from '@/context/ThemeContext';
import { Box, TextField, Button, Flex, Text, Switch, Select } from '@radix-ui/themes';
import ThemedUploadButton from '@/components/common/ThemeUploadButton';
import { useSession } from "next-auth/react";
import { logAction } from "@/utils/auditLogger";
import { useRssFeedContext } from './RssFeedContext';

const AddRssFeedForm: React.FC = () => {
  const { theme } = useThemeContext();
  const { data: session } = useSession();
  const { editingFeed, setEditingFeed, refreshFeeds } = useRssFeedContext();
  const [title, setTitle] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [showInTicker, setShowInTicker] = useState(true);
  const [iconUrl, setIconUrl] = useState('');
  const [feedType, setFeedType] = useState<'youtube' | 'twitter' | 'generic'>('generic');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const addFeedMutation = api.rssFeed.fetchAndStore.useMutation();
  const updateFeedMutation = api.rssFeed.updateFeed.useMutation();

  useEffect(() => {
    if (editingFeed) {
      setTitle(editingFeed.title ?? '');
      setFeedUrl(editingFeed.url);
      setKeywords(editingFeed.keywords.join(', '));
      setShowInTicker(editingFeed.showInTicker);
      setIconUrl(editingFeed.iconUrl || '');
      setFeedType(editingFeed.type);
    }
  }, [editingFeed]);

  const handleAddOrUpdateFeed = async () => {
    try {
      const feedData = {
        title,
        url: feedUrl,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k !== ''),
        showInTicker,
        iconUrl,
        type: feedType,
      };

      if (editingFeed) {
        await updateFeedMutation.mutateAsync({ id: editingFeed.id, ...feedData });
      } else {
        await addFeedMutation.mutateAsync(feedData);
      }

      if (session?.user) {
        await logAction({
          userId: session.user.id,
          username: session.user.name ?? 'unknown',
          userRole: session.user.roles?.join(', ') ?? 'unknown',
          action: editingFeed ? 'Update RSS Feed' : 'Add RSS Feed',
          resourceType: 'RSSFeed',
          resourceId: editingFeed ? editingFeed.id : feedUrl,
          severity: 'low',
          details: feedData,
        });
      }

      setToast({ message: `RSS Feed ${editingFeed ? 'updated' : 'added'} successfully!`, type: 'success' });
      resetForm();
      refreshFeeds();
      
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error('Failed to add/update feed:', error);
      let errorMessage = `Failed to ${editingFeed ? 'update' : 'add'} RSS Feed.`;
      if (error instanceof Error) {
        errorMessage += ` ${error.message}`;
      }
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const resetForm = () => {
    setTitle('');
    setFeedUrl('');
    setKeywords('');
    setShowInTicker(true);
    setIconUrl('');
    setFeedType('generic');
    setEditingFeed(null);
  };

  return (
    <Box>
      <Text as="label" size="2" weight="bold" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
        {editingFeed ? 'Edit RSS Feed' : 'Add New RSS Feed'}
      </Text>
      <Flex direction="column" gap="2">
        <TextField.Root
          size="3"
          variant="surface"
          radius={theme.radius}
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          placeholder="Enter feed title"
        />
        <Select.Root value={feedType} onValueChange={(value: 'youtube' | 'twitter' | 'generic') => setFeedType(value)}>
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="youtube">YouTube</Select.Item>
            <Select.Item value="twitter">Twitter</Select.Item>
            <Select.Item value="generic">Generic RSS</Select.Item>
          </Select.Content>
        </Select.Root>
        <TextField.Root
          size="3"
          variant="surface"
          radius={theme.radius}
          value={feedUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeedUrl(e.target.value)}
          placeholder={feedType === 'twitter' ? "Enter Twitter username or list URL" : "Enter RSS feed URL"}
        />
        <TextField.Root
          size="3"
          variant="surface"
          radius={theme.radius}
          value={keywords}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeywords(e.target.value)}
          placeholder="Enter keywords (comma-separated)"
        />
        <Flex align="center" gap="2">
          <Switch checked={showInTicker} onCheckedChange={setShowInTicker} />
          <Text>Show in ticker</Text>
        </Flex>
        <Box>
          <Text as="label" size="2" weight="bold">Feed Icon</Text>
          <Flex align="center" gap="2" mt="1">
            <ThemedUploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                const uploadedFile = res?.[0];
                if (uploadedFile) {
                  setIconUrl(uploadedFile.url);
                }
              }}
              onUploadBegin={(fileName) => {
                console.log(`Upload started for file: ${fileName}`);
              }}
              onUploadError={(error: Error) => {
                console.error('Error uploading file:', error);
                setToast({ message: `Error uploading file: ${error.message}`, type: 'error' });
              }}
            />
            {iconUrl && <img src={iconUrl} alt="Feed icon" width={32} height={32} />}
          </Flex>
        </Box>
        <Flex align="center" gap="2">
          <Button
            onClick={handleAddOrUpdateFeed}
            disabled={addFeedMutation.isPending || updateFeedMutation.isPending}
            style={{
              backgroundColor: `var(--${theme.accentColor}-9)`,
              color: 'var(--color-background)',
              borderRadius: `var(--radius-${theme.radius})`,
            }}
          >
            {addFeedMutation.isPending || updateFeedMutation.isPending
              ? 'Processing...'
              : editingFeed ? 'Update Feed' : 'Add Feed'}
          </Button>
          {editingFeed && (
            <Button variant="soft" onClick={resetForm}>
              Cancel Edit
            </Button>
          )}
          {toast && (
            <Text
              size="2"
              style={{
                color: toast.type === 'success' ? `var(--${theme.accentColor}-11)` : 'var(--color-error)',
              }}
            >
              {toast.message}
            </Text>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default AddRssFeedForm;