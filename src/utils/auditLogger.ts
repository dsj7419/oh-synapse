import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';

// Declare prisma on the global object
declare global {
  var prisma: PrismaClient | undefined;
}

// Use a type guard to check if global.prisma exists and create a new instance if it doesn't
const prisma = global.prisma || new PrismaClient();

// Assign prisma to global object in non-production environments
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

interface LogActionParams {
  userId: string;
  username: string;
  userRole: string;
  action: string;
  status?: string;
  severity?: string;
  details?: Prisma.InputJsonValue;
  ipAddress?: string;
  resourceType?: string;
  resourceId?: string;
}

export async function logAction({
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
}: LogActionParams): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'test') {
      // In test environment, just log to console
      console.log('Audit log:', { userId, username, userRole, action, status, severity, details, ipAddress, resourceType, resourceId });
      return;
    }

    await prisma.auditLog.create({
      data: {
        userId,
        username,
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
}