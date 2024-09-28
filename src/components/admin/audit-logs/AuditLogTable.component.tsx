import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import LogDetailsDialog from './LogDetailsDialog.component';

interface AuditLogTableProps {
  logs: any[];            // Filtered logs from the parent
  isLoading: boolean;
  loadMoreItems: (_startIndex: number, _stopIndex: number) => Promise<void>;
  isItemLoaded: (index: number) => boolean;
}

const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs, isLoading, loadMoreItems, isItemLoaded }) => {
  const [columnDefs] = React.useState<ColDef[]>([
    {
      headerName: "Timestamp",
      field: "timestamp",
      valueGetter: (params) => new Date(params.data?.timestamp).toLocaleString(),
      flex: 2,
      sortable: true,
    },
    {
      headerName: "Username",
      field: "username",
      flex: 1,
      sortable: true,
    },
    {
      headerName: "Action",
      field: "action",
      flex: 1,
      sortable: true,
    },
    {
      headerName: "Severity",
      field: "severity",
      cellClass: (params) => {
        switch (params.value) {
          case 'high': return 'text-red-600';
          case 'medium': return 'text-yellow-600';
          case 'normal': return 'text-green-600';
          default: return '';
        }
      },
      flex: 1,
      sortable: true,
    },
    {
      headerName: "Details",
      field: "details",
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.data) return null;

        let details;
        try {
          details = typeof params.data.details === 'string'
            ? JSON.parse(params.data.details)
            : params.data.details;
        } catch (error) {
          console.error('Failed to parse details:', error);
          details = {};
        }

        return <LogDetailsDialog log={{ ...params.data, details }} />;
      },
      flex: 1,
    },
  ]);

  return (
    <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <AgGridReact
          rowData={logs}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
          rowHeight={50}
          onPaginationChanged={async (params) => {
            const currentPage = params.api.paginationGetCurrentPage();
            const totalPages = params.api.paginationGetTotalPages();
            if (currentPage + 1 === totalPages) {
              await loadMoreItems(logs.length, logs.length + 10);
            }
          }}
        />
      )}
    </div>
  );
};

export default AuditLogTable;
