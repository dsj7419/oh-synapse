import { db } from "@/server/db";
import { createAuditLogger, type LogActionParams } from "@/utils/auditLogger";

export const auditLogger = createAuditLogger(db);

export async function logServerAction(params: Omit<LogActionParams, 'prisma'>): Promise<void> {
  await auditLogger(params);
}