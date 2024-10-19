import React, { useState, useEffect } from 'react';
import { api } from "@/trpc/react";
import { useThemeContext } from '@/context/ThemeContext';
import { Box, TextField, Button, Flex, Text, Switch, Slider } from '@radix-ui/themes';
import { useSession } from "next-auth/react";

interface RssTickerSettingsProps {
  onSettingsChange?: () => void;
}

const RssTickerSettings: React.FC<RssTickerSettingsProps> = ({ onSettingsChange }) => {
  const { theme } = useThemeContext();
  const { data: session } = useSession();
  const [tickerSpeed, setTickerSpeed] = useState(30);
  const [tickerPause, setTickerPause] = useState(true);
  const [tickerSpacing, setTickerSpacing] = useState(0);
  const [maxItemsPerFeed, setMaxItemsPerFeed] = useState(5);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const logActionMutation = api.auditLogs.logAction.useMutation();

  const updateSettingsMutation = api.rssFeed.updateTickerSettings.useMutation();
  const { data: currentSettings, refetch } = api.rssFeed.getTickerSettings.useQuery();

  useEffect(() => {
    if (currentSettings) {
      setTickerSpeed(currentSettings.speed);
      setTickerPause(currentSettings.pauseOnHover);
      setTickerSpacing(currentSettings.spacing);
      setMaxItemsPerFeed(currentSettings.maxItemsPerFeed);
    }
  }, [currentSettings]);

  const handleSaveSettings = async () => {
    try {
      await updateSettingsMutation.mutateAsync({
        speed: tickerSpeed,
        pauseOnHover: tickerPause,
        spacing: tickerSpacing,
        maxItemsPerFeed: maxItemsPerFeed,
      });
      await refetch();
     
      try {
        await logActionMutation.mutateAsync({
          action: 'Update RSS Ticker Settings',
          resourceType: 'TickerSettings',
          resourceId: 'singleton',
          severity: 'low',
          details: { speed: tickerSpeed, pauseOnHover: tickerPause, spacing: tickerSpacing, maxItemsPerFeed },
        });
      } catch (error) {
        console.error('Failed to log RSS Ticker Settings update:', error);
      }
     
      setToast({ message: 'Settings saved successfully!', type: 'success' });
      if (onSettingsChange) {
        onSettingsChange();
      }
      
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error('Failed to update settings:', error);
      setToast({ message: 'Failed to save settings. Please try again.', type: 'error' });
      
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <Box>
      <Flex direction="column" gap="4">
        <Box>
          <Text as="label" size="2" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            Ticker Speed (pixels per minute)
          </Text>
          <Slider
            value={[tickerSpeed]}
            onValueChange={(value) => setTickerSpeed(value[0] ?? tickerSpeed)}
            min={100}
            max={10000}
            step={100}
            aria-label="Ticker Speed"
          />
          <Text size="1" style={{ marginTop: '0.5rem', color: 'var(--color-text-light)' }}>
            Current speed: {tickerSpeed} pixels per minute
          </Text>
        </Box>
        <Box>
          <Text as="label" size="2" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            Spacing between feeds
          </Text>
          <TextField.Root
            size="3"
            variant="surface"
            radius={theme.radius}
            value={tickerSpacing.toString()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTickerSpacing(Number(e.target.value))}
            placeholder="Enter spacing between feeds"
          />
        </Box>
        <Box>
          <Text as="label" size="2" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            Max items per feed
          </Text>
          <TextField.Root
            size="3"
            variant="surface"
            radius={theme.radius}
            value={maxItemsPerFeed.toString()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxItemsPerFeed(Number(e.target.value))}
            placeholder="Enter max items per feed"
          />
        </Box>
        <Flex align="center" gap="2">
          <Button
            onClick={handleSaveSettings}
            style={{
              backgroundColor: `var(--${theme.accentColor}-9)`,
              color: 'var(--color-background)',
            }}
          >
            Save Settings
          </Button>
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

export default RssTickerSettings;
