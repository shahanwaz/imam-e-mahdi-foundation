import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePermission } from '@/lib/auth/rbac';
import { UpdateUserSchema } from '@/lib/validations/user';
import { createAuditLog } from '@/lib/audit';
import { apiSuccess, apiError } from '@/lib/response';
import { NotFoundError, ForbiddenError } from '@/lib/errors';
import { UserStatus } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/users/[id]
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    await requirePermission(req, 'users:read');
    const { id } = await context.params;

    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        preferredLanguage: true,
        countryCode: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                displayName: true,
                permissions: {
                  select: {
                    permission: {
                      select: {
                        code: true,
                        module: true,
                        description: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError(`User with ID [${id}] not found`);
    }

    const roles = user.roles.map((r) => r.role.name);
    const permissions = Array.from(
      new Set(user.roles.flatMap((r) => r.role.permissions.map((p) => p.permission.code)))
    );

    return apiSuccess(
      {
        ...user,
        roles,
        permissions,
      },
      'User details retrieved successfully'
    );
  } catch (error) {
    return apiError(error);
  }
}

// PUT /api/admin/users/[id]
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requirePermission(req, 'users:update');
    const { id } = await context.params;
    const body = await req.json();
    const validated = UpdateUserSchema.parse(body);

    const existingUser = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (!existingUser) {
      throw new NotFoundError(`User with ID [${id}] not found`);
    }

    // Protect Super Admin from being altered by non-super admin
    const isTargetSuperAdmin = existingUser.roles.some((r) => r.role.name === 'SUPER_ADMIN');
    if (isTargetSuperAdmin && !actor.roles.includes('SUPER_ADMIN')) {
      throw new ForbiddenError('Only a Super Administrator can modify another Super Administrator');
    }

    // Role updates if specified
    if (validated.roles) {
      const targetRoles = await prisma.role.findMany({
        where: { name: { in: validated.roles } },
      });

      // Clear existing roles and assign new
      await prisma.userRole.deleteMany({ where: { userId: id } });
      await prisma.userRole.createMany({
        data: targetRoles.map((r) => ({
          userId: id,
          roleId: r.id,
        })),
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: validated.name !== undefined ? validated.name : undefined,
        phone: validated.phone !== undefined ? validated.phone : undefined,
        status: validated.status !== undefined ? validated.status : undefined,
        preferredLanguage: validated.preferredLanguage !== undefined ? validated.preferredLanguage : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        preferredLanguage: true,
        updatedAt: true,
      },
    });

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    await createAuditLog({
      userId: actor.id,
      action: 'ADMIN_UPDATE_USER',
      entity: 'User',
      entityId: id,
      previousData: {
        name: existingUser.name,
        status: existingUser.status,
        roles: existingUser.roles.map((r) => r.role.name),
      },
      newData: {
        name: updatedUser.name,
        status: updatedUser.status,
        roles: validated.roles,
      },
      ipAddress,
      userAgent,
    });

    return apiSuccess(updatedUser, 'User updated successfully');
  } catch (error) {
    return apiError(error);
  }
}

// DELETE /api/admin/users/[id] (Soft Delete)
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requirePermission(req, 'users:delete');
    const { id } = await context.params;

    if (actor.id === id) {
      throw new ForbiddenError('You cannot delete your own account');
    }

    const targetUser = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { roles: { include: { role: true } } },
    });

    if (!targetUser) {
      throw new NotFoundError(`User with ID [${id}] not found`);
    }

    // Soft delete user & revoke active sessions
    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: UserStatus.INACTIVE,
        },
      }),
      prisma.session.deleteMany({
        where: { userId: id },
      }),
    ]);

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    await createAuditLog({
      userId: actor.id,
      action: 'ADMIN_DELETE_USER',
      entity: 'User',
      entityId: id,
      ipAddress,
      userAgent,
    });

    return apiSuccess(null, 'User account soft-deleted and sessions revoked');
  } catch (error) {
    return apiError(error);
  }
}
