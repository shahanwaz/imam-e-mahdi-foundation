import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePermission } from '@/lib/auth/rbac';
import { CreateUserSchema } from '@/lib/validations/user';
import { hashPassword } from '@/lib/crypto';
import { createAuditLog } from '@/lib/audit';
import { apiSuccess, apiError } from '@/lib/response';
import { ConflictError } from '@/lib/errors';

// GET /api/admin/users - List users with pagination and filters
export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'users:read');

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status');

    const where: any = {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [totalRecords, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
          roles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const formattedUsers = users.map((u) => ({
      ...u,
      roles: u.roles.map((r) => r.role.name),
    }));

    return apiSuccess(
      formattedUsers,
      'Users retrieved successfully',
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

// POST /api/admin/users - Create a new user with assigned roles
export async function POST(req: NextRequest) {
  try {
    const actor = await requirePermission(req, 'users:create');
    const body = await req.json();
    const validated = CreateUserSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    const passwordHash = await hashPassword(validated.password);

    // Fetch role IDs
    const roles = await prisma.role.findMany({
      where: { name: { in: validated.roles } },
    });

    const newUser = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase(),
        passwordHash,
        phone: validated.phone || null,
        status: validated.status,
        preferredLanguage: validated.preferredLanguage,
        countryCode: validated.countryCode,
        roles: {
          create: roles.map((r) => ({
            roleId: r.id,
          })),
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        preferredLanguage: true,
        createdAt: true,
      },
    });

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    await createAuditLog({
      userId: actor.id,
      action: 'ADMIN_CREATE_USER',
      entity: 'User',
      entityId: newUser.id,
      newData: {
        email: newUser.email,
        name: newUser.name,
        roles: validated.roles,
      },
      ipAddress,
      userAgent,
    });

    return apiSuccess(
      { ...newUser, roles: validated.roles },
      'User created successfully',
      201
    );
  } catch (error) {
    return apiError(error);
  }
}
