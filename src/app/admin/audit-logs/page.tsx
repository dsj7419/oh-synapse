"use client";
import React, { useState } from "react";
import AuditLogTable from "@/components/admin/audit-logs/AuditLogTable.component";
import AuditLogFilter from "@/components/admin/audit-logs/AuditLogFilter.component";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { Box, Flex, Heading, Card } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

const AdminAuditLogsPage: React.FC = () => {
  const [filter, setFilter] = useState("");
  const [severity, setSeverity] = useState("all");
  const { logs, isLoading, loadMoreItems, isItemLoaded } = useAuditLogs(filter, severity);
  const { theme } = useThemeContext();

  return (
    <Card size="3">
      <Box p="6">
        <Heading size="6" mb="6">Audit Logs</Heading>
        <Flex direction="column" gap="4">
          <AuditLogFilter
            onFilterChange={setFilter}
            onSeverityChange={setSeverity}
          />
          <AuditLogTable
            logs={logs}
            isLoading={isLoading}
            loadMoreItems={loadMoreItems}
            isItemLoaded={isItemLoaded}
          />
        </Flex>
      </Box>
    </Card>
  );
};

export default AdminAuditLogsPage;