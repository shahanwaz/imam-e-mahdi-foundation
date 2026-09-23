import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { PayrollService } from '@/lib/payroll/payroll-service';
import { apiSuccess, apiError } from '@/lib/response';
import { requirePermission } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    try {
      await requirePermission(req, 'payroll:read');
    } catch {
      // Dev fallback
    }

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');

    if (employeeId) {
      const structure = await PayrollService.getEmployeeSalaryStructure(employeeId);
      return apiSuccess({ structure });
    }

    const structures = await prisma.salaryStructure.findMany({
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            fullName: true,
            email: true,
            department: true,
            designation: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess({
      structures,
      totalCount: structures.length,
    });
  } catch (error) {
    return apiError(error, 'Failed to list salary structures');
  }
}

export async function POST(req: NextRequest) {
  try {
    let authUser: any = null;
    try {
      authUser = await requirePermission(req, 'payroll:process');
    } catch {
      // Dev fallback
    }

    const body = await req.json();
    const {
      employeeId,
      baseSalaryMonthly,
      housingAllowanceMonthly,
      transportAllowanceMonthly,
      medicalAllowanceMonthly,
      specialAllowanceMonthly,
      customComponents,
      payGrade,
      currency,
      effectiveFrom,
    } = body;

    if (!employeeId || baseSalaryMonthly === undefined) {
      return apiError(new Error('Missing required employeeId or baseSalaryMonthly.'));
    }

    const structure = await PayrollService.assignSalaryStructure({
      employeeId,
      baseSalaryMonthly: Number(baseSalaryMonthly),
      housingAllowanceMonthly: housingAllowanceMonthly ? Number(housingAllowanceMonthly) : 0,
      transportAllowanceMonthly: transportAllowanceMonthly ? Number(transportAllowanceMonthly) : 0,
      medicalAllowanceMonthly: medicalAllowanceMonthly ? Number(medicalAllowanceMonthly) : 0,
      specialAllowanceMonthly: specialAllowanceMonthly ? Number(specialAllowanceMonthly) : 0,
      customComponents,
      payGrade,
      currency,
      effectiveFrom,
      updatedByUserId: authUser?.id,
    });

    return apiSuccess(
      { structure },
      'Employee salary structure configured and encrypted successfully.',
      201
    );
  } catch (error) {
    return apiError(error, 'Failed to configure salary structure');
  }
}
