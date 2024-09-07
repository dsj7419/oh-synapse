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
}

interface LogDetailsDialogProps {
  log: AuditLog;
}

const LogDetailsDialog: React.FC<LogDetailsDialogProps> = ({ log }) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="bg-blue-500 text-white py-2 px-3 rounded hover:bg-blue-600 text-sm">
          View Details
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="bg-white p-4 rounded shadow-lg z-50" sideOffset={5}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div>
              <h2 className="text-lg font-bold mb-2">Log Details</h2>
              <p><strong>ID:</strong> {log.id}</p>
              <p><strong>Timestamp:</strong> {log.timestamp.toLocaleString()}</p>
              <p><strong>Username:</strong> {log.username}</p>
              <p><strong>Action:</strong> {log.action}</p>
              <p><strong>Severity:</strong> {log.severity}</p>
              <p><strong>IP Address:</strong> {log.ipAddress || 'Not available'}</p>
            </div>
          </motion.div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default LogDetailsDialog;
