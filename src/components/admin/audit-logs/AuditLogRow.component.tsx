import React from "react";
import LogDetailsDialog from "./LogDetailsDialog.component";
import type { Prisma } from "@prisma/client";
import { Flex, Text, Button } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

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
  return details as Record<string, unknown> | null;
};

interface AuditLogRowProps {
  log: AuditLog;
}

const AuditLogRow: React.FC<AuditLogRowProps> = ({ log }) => {
  const { theme } = useThemeContext();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'var(--red-9)';
      case 'medium': return 'var(--yellow-9)';
      default: return 'var(--green-9)';
    }
  };

  return (
    <Flex align="center" justify="between" py="2" style={{ borderBottom: '1px solid var(--gray-5)' }}>
      <Text size="2" style={{ flex: 2 }}>{log.timestamp?.toLocaleString() || "Unknown"}</Text>
      <Text size="2" style={{ flex: 1 }}>{log.username}</Text>
      <Text size="2" style={{ flex: 1 }}>{log.action}</Text>
      <Text size="2" style={{ flex: 1, color: getSeverityColor(log.severity) }}>{log.severity}</Text>
      <Flex justify="center" style={{ flex: 1 }}>
        <LogDetailsDialog log={{ ...log, details: parseDetails(log.details) }} />
      </Flex>
    </Flex>
  );
};

export default AuditLogRow;