"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import AuditLogTable from "@/components/admin/audit-logs/AuditLogTable.component";
import AuditLogFilter from "@/components/admin/audit-logs/AuditLogFilter.component";
import type { Prisma } from "@prisma/client";

interface AuditLog {
  id: string;
  timestamp: Date;
  username: string;
  userRole: string;
  action: string;
  severity: string;
  details: Prisma.JsonValue | null; 
  resourceType: string | null;
  resourceId: string | null;
  ipAddress: string | null;
  status: string | null;
}

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


  const filteredLogs: AuditLog[] = data?.pages
    .flatMap((page) => page.items)
    .filter(
      (log) =>
        (severity === "all" || log.severity === severity) &&
        log.username.toLowerCase().includes(filter.toLowerCase())
    ) ?? [];


  const loadMoreItems = async (_startIndex: number, _stopIndex: number) => {
    if (hasNextPage) {
      await fetchNextPage();
    }
  };


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
