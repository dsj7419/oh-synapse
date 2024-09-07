"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import AuditLogTable from "@/components/admin/audit-logs/AuditLogTable.component";
import AuditLogFilter from "@/components/admin/audit-logs/AuditLogFilter.component";

const AdminAuditLogsPage: React.FC = () => {
  const [filter, setFilter] = useState("");
  const [severity, setSeverity] = useState("all");

  const { data, isLoading, fetchNextPage, hasNextPage } = api.auditLogs.getAll.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    }
  );

  if (isLoading) return <p>Loading...</p>;

  // Apply filtering based on severity and filter text
  const filteredLogs = data?.pages
    .flatMap((page) => page.items)
    .filter(
      (log) =>
        (severity === "all" || log.severity === severity) &&
        log.username.toLowerCase().includes(filter.toLowerCase())
    ) || [];

  // Function to handle pagination (fetching more logs when needed)
  const loadMoreItems = async (startIndex: number, stopIndex: number) => {
    if (hasNextPage) {
      await fetchNextPage();
    }
  };

  // Function to check if a particular item is already loaded
  const isItemLoaded = (index: number) => !!filteredLogs[index];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Audit Logs</h1>
      <AuditLogFilter
        onFilterChange={setFilter}
        onSeverityChange={setSeverity}
      />
      <AuditLogTable
        logs={filteredLogs}
        loadMoreItems={loadMoreItems}
        isItemLoaded={isItemLoaded}
      />
    </div>
  );
};

export default AdminAuditLogsPage;
