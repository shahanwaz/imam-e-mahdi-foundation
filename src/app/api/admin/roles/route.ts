import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePermission } from '@/lib/auth/rbac';
import { createAuditLog } from '@/lib/audit';
import { apiSuccess, apiError } from '@/lib/response';
import { NotFoundError, ForbiddenError } from '@/lib/errors';
import { z } from 'zod';

const UpdateRolePermissionsSchema = z.object({
  roleId: z.string(),
  permissionCodes: z.array(z.string()),
});

// GET /api/admin/roles - List all roles and atomic permissions
export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'roles:read');

    const [roles, permissions] = await Promise.all([
      prisma.role.findMany({
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.permission.findMany({
        orderBy: [{ module: 'asc' }, { code: 'asc' }],
      }),
    ]);

    const formattedRoles = roles.map((r) => ({
      id: r.id,
      name: r.name,
      displayName: r.displayName,
      description: r.description,
      isSystem: r.isSystem,
      permissions: r.permissions.map((rp) => rp.permission.code),
    }));

    return apiSuccess(
      {
        roles: formattedRoles,
        permissions,
      },
      'Roles and permissions retrieved successfully'
    );
  } catch (error) {
    return apiError(error);
  }
}

// POST /api/admin/roles - Modify permissions attached to a role
export async function POST(req: NextRequest) {
  try {
    const actor = await requirePermission(req, 'roles:manage_permissions');
    const body = await req.json();
    const validated = UpdateRolePermissionsSchema.parse(body);

    const role = await prisma.role.findUnique({
      where: { id: validated.roleId },
    });

    if (!role) {
      throw new NotFoundError(`Role with ID [${validated.roleId}] not found`);
    }

    if (role.name === 'SUPER_ADMIN') {
      throw new ForbiddenError('Super Administrator permissions cannot be restricted');
    }

    // Fetch valid permissions
    const permissions = await prisma.permission.findMany({
      where: { code: { in: validated.permissionCodes } },
    });

    // Replace role permissions atomically
    await prisma.$transaction([
      prisma.rolePermission.deleteMany({
        where: { roleId: role.id },
      }),
      prisma.rolePermission.createMany({
        data: permissions.map((p) => ({
          roleId: role.id,
          permissionId: p.id,
        })),
      }),
    ]);

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    await createAuditLog({
      userId: actor.id,
      action: 'UPDATE_ROLE_PERMISSIONS',
      entity: 'Role',
      entityId: role.id,
      newData: {
        roleName: role.name,
        assignedPermissions: validated.permissionCodes,
      },
      ipAddress,
      userAgent,
    });

    return apiSuccess(
      {
        roleId: role.id,
        roleName: role.name,
        permissions: validated.permissionCodes,
      },
      'Role permissions updated successfully'
    );
  } catch (error) {
    return apiError(error);
  }
}
