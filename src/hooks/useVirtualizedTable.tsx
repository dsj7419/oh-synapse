import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef } from 'react';

interface VirtualizedTableProps {
  logs: any[]; // Should be typed properly based on your log structure
  rowHeight: number;
  renderRow: (log: any, index: number) => JSX.Element;
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
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: `${virtualRow.start}px`,
              width: '100%',
            }}
          >
            {renderRow(logs[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualizedTable;
