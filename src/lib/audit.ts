import crypto from 'crypto';
import { prisma } from './db';

export interface CreateAuditLogParams {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  previousData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Calculates rolling SHA-256 hash chaining for tamper-evident audit logging
 */
export function calculateRollingHash(
  previousHash: string | null,
  entry: {
    userId?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    timestamp: string;
  }
): string {
  const payload = `${previousHash || 'GENESIS'}::${entry.userId || 'ANON'}::${entry.action}::${entry.entity}::${entry.entityId || 'NONE'}::${entry.timestamp}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Records an immutable entry in the system audit ledger with rolling hash chain
 */
export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    // Get the latest audit log entry to chain the rolling hash
    const lastLog = await prisma.auditLog.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { rollingHash: true },
    });

    const timestamp = new Date().toISOString();
    const rollingHash = calculateRollingHash(lastLog?.rollingHash || null, {
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      timestamp,
    });

    const auditEntry = await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        previousData: params.previousData ? (params.previousData as any) : undefined,
        newData: params.newData ? (params.newData as any) : undefined,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        rollingHash,
      },
    });

    return auditEntry;
  } catch (error) {
    // We log but do not crash the primary transaction unless required
    console.error('[AUDIT_LOG_WRITE_ERROR]', error);
    return null;
  }
}
