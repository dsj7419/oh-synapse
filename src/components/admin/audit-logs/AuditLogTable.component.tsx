import React from 'react';
import { Table, Box, Text, ScrollArea } from '@radix-ui/themes';
import LogDetailsDialog from './LogDetailsDialog.component';
import { useThemeContext } from '@/context/ThemeContext';

interface AuditLogTableProps {
  logs: any[];
  isLoading: boolean;
  loadMoreItems: (startIndex: number, stopIndex: number) => Promise<void>;
  isItemLoaded: (index: number) => boolean;
}

const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs, isLoading, loadMoreItems, isItemLoaded }) => {
  const { theme } = useThemeContext();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'var(--red-9)';
      case 'medium': return 'var(--yellow-9)';
      default: return 'var(--green-9)';
    }
  };

  return (
    <Box style={{ height: '600px', width: '100%' }}>
      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        <ScrollArea style={{ height: '100%' }}>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Timestamp</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Username</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Action</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Severity</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Details</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {logs.map((log, index) => (
                <Table.Row key={log.id}>
                  <Table.Cell>{new Date(log.timestamp).toLocaleString()}</Table.Cell>
                  <Table.Cell>{log.username}</Table.Cell>
                  <Table.Cell>{log.action}</Table.Cell>
                  <Table.Cell>
                    <Text style={{ color: getSeverityColor(log.severity) }}>{log.severity}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <LogDetailsDialog log={{ ...log, details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details }} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </ScrollArea>
      )}
    </Box>
  );
};

export default AuditLogTable;