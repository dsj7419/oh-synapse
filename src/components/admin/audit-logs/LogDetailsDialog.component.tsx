import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { motion } from 'framer-motion';

interface AuditLog {
  id: string;
  timestamp: Date;
  username: string;
  action: string;
  severity: string;
  ipAddress: string | null;
  details: Record<string, unknown> | null;  
}

interface LogDetailsDialogProps {
  log: AuditLog;
}


const formatDetails = (details: Record<string, unknown> | null, depth = 0): JSX.Element[] => {
  if (!details) return [];

  const elements: JSX.Element[] = [];
  Object.entries(details).forEach(([key, value]) => {
    const isHighlighted = depth === 0 && (key === "name" || key === "id");
    const displayKey = key === "id" ? "Resource ID" : key;

    if (typeof value === "object" && value !== null) {
      elements.push(
        <div key={key} className={`ml-${depth * 2} mb-1`}>
          <strong className="text-gray-700">{displayKey}:</strong>
          {formatDetails(value as Record<string, unknown>, depth + 1)} {/* Recursive call */}
        </div>
      );
    } else {
      elements.push(
        <div key={key} className={`ml-${depth * 2} mb-1`}>
          <strong
            className={isHighlighted ? "text-blue-600 font-semibold" : "text-gray-700"}
          >
            {displayKey}:
          </strong>{" "}
          <span className="text-gray-800">{String(value)}</span>
        </div>
      );
    }
  });

  return elements;
};

const LogDetailsDialog: React.FC<LogDetailsDialogProps> = ({ log }) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="bg-blue-500 text-white py-2 px-3 rounded hover:bg-blue-600 text-sm">
          View Details
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-white p-6 rounded-lg shadow-lg max-w-sm z-50"
          sideOffset={5}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div>
              <h2 className="text-lg font-bold mb-4">Log Details</h2>
              <div className="space-y-2">
                <p>
                  <strong className="text-gray-700">Log ID:</strong>{" "}
                  <span className="text-gray-800">{log.id}</span>
                </p>
                <p>
                  <strong className="text-gray-700">Timestamp:</strong>{" "}
                  <span className="text-gray-800">{log.timestamp.toLocaleString()}</span>
                </p>
                <p>
                  <strong className="text-gray-700">Username:</strong>{" "}
                  <span className="text-gray-800">{log.username}</span>
                </p>
                <p>
                  <strong className="text-gray-700">Action:</strong>{" "}
                  <span className="text-gray-800">{log.action}</span>
                </p>
                <p>
                  <strong className="text-gray-700">Severity:</strong>{" "}
                  <span className="text-gray-800">{log.severity}</span>
                </p>
                <p>
                  <strong className="text-gray-700">IP Address:</strong>{" "}
                  <span className="text-gray-800">{log.ipAddress ?? "Not available"}</span>
                </p>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2 text-blue-600">Action Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-200 max-h-48 overflow-y-auto">
                  {log.details ? formatDetails(log.details) : <p>No details available</p>}
                </div>
              </div>
            </div>
          </motion.div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default LogDetailsDialog;
