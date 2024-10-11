'use client';

import { useEffect } from 'react';

const RssUpdaterInitializer = () => {
  useEffect(() => {
    const initRssUpdater = async () => {
      try {
        const response = await fetch('/api/init-rss-updater', { method: 'POST' });
        const data = await response.json();
        console.log(data.message);
      } catch (error) {
        console.error('Failed to initialize RSS updater:', error);
      }
    };

    initRssUpdater();
  }, []);

  return null;
};

export default RssUpdaterInitializer;