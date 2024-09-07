import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface LogActionParams {
  userId: string;
  username: string;
  userRole: string;
  action: string;
  status?: string;
  severity?: string;
  details?: Prisma.InputJsonValue;
  ipAddress?: string;
  resourceType?: string;  // Add resourceType here
  resourceId?: string;    // Add resourceId here
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
        resourceType,  // Log resourceType
        resourceId,    // Log resourceId
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
