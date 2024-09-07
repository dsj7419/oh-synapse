import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

interface Log {
  id: string;
  name: string;
}

interface VirtualizedTableProps {
  logs: Log[];
  rowHeight: number;
  renderRow: (log: Log, index: number) => JSX.Element;
}

const VirtualizedTable: React.FC<VirtualizedTableProps> = ({ logs, rowHeight, renderRow }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflowY: 'auto' }}>
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const log = logs[virtualRow.index];
          if (!log) return null;

          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: `${virtualRow.start}px`,
                width: '100%',
              }}
            >
              {renderRow(log, virtualRow.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtualizedTable;
