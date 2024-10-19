import { type PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';

export interface LogActionParams {
  userId: string;
  username: string | null;
  userRole: string;
  action: string;
  status?: string;
  severity?: string;
  details?: Prisma.InputJsonValue;
  ipAddress?: string;
  resourceType?: string;
  resourceId?: string;
}

export function createAuditLogger(prisma: PrismaClient) {
  return async function logAction(params: LogActionParams): Promise<void> {
    const {
      userId,
      username,
      userRole,
      action,
      status = 'success',
      severity = 'normal',
      details,
      ipAddress = 'unknown',
      resourceType,
      resourceId,
    } = params;

    try {
      await prisma.auditLog.create({
        data: {
          userId,
          username: username ?? 'Unknown',
          userRole,
          action,
          status,
          severity,
          details: details ?? {},
          ipAddress,
          resourceType,
          resourceId,
        },
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Audit log:', params);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to log action:', {
          userId,
          username,
          userRole,
          action,
          error: error.message,
        });
      } else {
        console.error('An unknown error occurred:', error);
      }
    }
  };
}