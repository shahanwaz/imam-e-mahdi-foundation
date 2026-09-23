import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePermission } from '@/lib/auth/rbac';
import { apiSuccess, apiError } from '@/lib/response';

// GET /api/admin/audit-logs - View immutable audit ledger
export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'system:view_audit_logs');

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)));
    const entity = searchParams.get('entity')?.trim();
    const action = searchParams.get('action')?.trim();
    const userId = searchParams.get('userId')?.trim();

    const where: any = {
      ...(entity ? { entity } : {}),
      ...(action ? { action } : {}),
      ...(userId ? { userId } : {}),
    };

    const [totalRecords, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return apiSuccess(
      logs,
      'Audit logs retrieved successfully',
      200,
      {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        timestamp: new Date().toISOString(),
      }
    );
  } catch (error) {
    return apiError(error);
  }
}
