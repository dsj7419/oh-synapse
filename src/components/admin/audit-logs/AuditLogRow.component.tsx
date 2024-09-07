import React from "react";
import LogDetailsDialog from "./LogDetailsDialog.component";

interface AuditLog {
  id: string;
  timestamp: Date;
  username: string;
  userRole: string;
  action: string;
  severity: string;
  details: any;
  resourceType: string | null;
  resourceId: string | null;
  ipAddress: string | null;
  status: string | null;
}

interface AuditLogRowProps {
  log: AuditLog;
}

const AuditLogRow: React.FC<AuditLogRowProps> = ({ log }) => {
  return (
    <tr className="text-left border">
      <td className="border px-2 py-1 text-center">{log.timestamp?.toLocaleString() || "Unknown"}</td>
      <td className="border px-2 py-1 text-center">{log.username}</td>
      <td className="border px-2 py-1 text-center">{log.action}</td>
      <td className={`border px-2 py-1 text-center ${
        log.severity === 'high' ? 'text-red-600' : 
        log.severity === 'medium' ? 'text-yellow-600' : 
        'text-green-600'
      }`}>
        {log.severity}
      </td>
      <td className="border px-2 py-1 text-center">
        <LogDetailsDialog log={log} />
      </td>
    </tr>
  );
};

export default AuditLogRow;
