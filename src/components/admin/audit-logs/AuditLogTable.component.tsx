import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import type { Prisma } from "@prisma/client"; 
import { type ColDef, type CellClassParams, type ICellRendererParams } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import LogDetailsDialog from "./LogDetailsDialog.component";

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


const parseDetails = (
  details: Prisma.JsonValue | null
): Record<string, unknown> | null => {
  if (typeof details === "string") {
    try {
      return JSON.parse(details) as Record<string, unknown>; 
    } catch {
      return null; 
    }
  }
  return typeof details === "object" && !Array.isArray(details)
    ? (details as Record<string, unknown>)
    : null; 
};

interface AuditLogTableProps {
  logs: AuditLog[];
  loadMoreItems: (startIndex: number, stopIndex: number) => Promise<void>;
  isItemLoaded: (index: number) => boolean;
}

const AuditLogTable: React.FC<AuditLogTableProps> = ({
  logs,
  loadMoreItems,
}) => {
  const [rowData, setRowData] = useState<AuditLog[]>([]);

  useEffect(() => {
    setRowData(logs);
  }, [logs]);

  const [columnDefs] = useState<ColDef<AuditLog>[]>([
    {
      headerName: "Timestamp",
      field: "timestamp",
      valueGetter: (params) =>
        params.data ? new Date(params.data.timestamp).toLocaleString() : "",
      flex: 2,
      sortable: true,
    },
    { headerName: "Username", field: "username", flex: 1, sortable: true },
    { headerName: "Action", field: "action", flex: 1, sortable: true },
    {
      headerName: "Severity",
      field: "severity",
      cellClass: (params: CellClassParams<AuditLog>) => {
        switch (params.value) {
          case "high":
            return "text-red-600";
          case "medium":
            return "text-yellow-600";
          case "normal":
            return "text-green-600";
          default:
            return "";
        }
      },
      flex: 1,
      sortable: true,
    },
    {
      headerName: "Details",
      field: "details",
      cellRenderer: (params: ICellRendererParams<AuditLog, unknown>) => {
        if (!params.data) return null;

        return <LogDetailsDialog log={{ ...params.data, details: parseDetails(params.data.details) }} />;
      },
      flex: 1,
    },
  ]);

  return (
    <div className="ag-theme-alpine" style={{ height: "600px", width: "100%" }}>
      <AgGridReact<AuditLog>
        rowData={rowData}
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={10}
        rowHeight={50}
        onPaginationChanged={async (params) => {
          const currentPage = params.api.paginationGetCurrentPage();
          const totalPages = params.api.paginationGetTotalPages();
          if (currentPage + 1 === totalPages) {
            await loadMoreItems(rowData.length, rowData.length + 10);
          }
        }}
      />
    </div>
  );
};

export default AuditLogTable;
