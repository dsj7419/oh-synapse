"use client";

import React, { useState } from "react";
import AuditLogTable from "@/components/admin/audit-logs/AuditLogTable.component";
import AuditLogFilter from "@/components/admin/audit-logs/AuditLogFilter.component";
import { useAuditLogs } from "@/hooks/useAuditLogs";
const AdminAuditLogsPage: React.FC = () => {
  const [filter, setFilter] = useState("");
  const [severity, setSeverity] = useState("all");

  const { logs, isLoading, loadMoreItems, isItemLoaded } = useAuditLogs(filter, severity);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Audit Logs</h1>
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
    </div>
  );
};

export default AdminAuditLogsPage;
