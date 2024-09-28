import { useState, useEffect } from 'react';
import { api } from '@/trpc/react';

export const useAuditLogs = (filter: string, severity: string) => {
  const [logs, setLogs] = useState([]);
  const { data, isLoading, fetchNextPage, hasNextPage } = api.auditLogs.getAll.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    }
  );

  useEffect(() => {
    if (!data) return;
  
    const filtered = data.pages
      .flatMap((page) => page.items)
      .filter((log) => {
        return (
          (severity === 'all' || log.severity === severity) &&
          (
            log.username.toLowerCase().includes(filter.toLowerCase()) ||
            log.action?.toLowerCase().includes(filter.toLowerCase()) || 
            log.ipAddress?.toLowerCase().includes(filter.toLowerCase())
          )
        );
      });
  
    setLogs(filtered as any);
  }, [data, filter, severity]);  

  const loadMoreItems = async (_startIndex: number, _stopIndex: number) => {
    if (hasNextPage) {
      await fetchNextPage();
    }
  };

  const isItemLoaded = (index: number) => !!logs[index];

  return { logs, isLoading, loadMoreItems, isItemLoaded };
};
