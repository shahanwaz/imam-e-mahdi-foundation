import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { requireAuth } from '@/lib/auth/rbac';
import { ComplianceService } from '@/lib/compliance/compliance-service';
import { ComplianceCategory, ComplianceFilingStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const fiscalYear = searchParams.get('fiscalYear') || undefined;
    const status = (searchParams.get('status') as ComplianceFilingStatus) || undefined;
    const category = (searchParams.get('category') as ComplianceCategory) || undefined;
    const overdueOnly = searchParams.get('overdueOnly') === 'true';
    const search = searchParams.get('search') || undefined;

    const items = await ComplianceService.listCalendarItems({
      fiscalYear,
      status,
      category,
      overdueOnly,
      search,
    });

    return apiSuccess(items, 'Compliance calendar obligations retrieved');
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);
    const body = await req.json();

    // Auto-seed standard calendar for FY
    if (body.seedFiscalYear) {
      const seeded = await ComplianceService.seedStandardFiscalCalendar(body.seedFiscalYear, {
        defaultEmail: body.defaultEmail || 'compliance@imf.org',
        defaultName: body.defaultName || 'Statutory Compliance Lead',
        defaultPhone: body.defaultPhone,
      });
      return apiSuccess(seeded, `Standard compliance calendar seeded for FY ${body.seedFiscalYear}`, 201);
    }

    if (!body.requirementName || !body.category || !body.statutoryAuthority || !body.dueDate || !body.responsiblePersonEmail) {
      throw new Error('requirementName, category, statutoryAuthority, dueDate, and responsiblePersonEmail are required.');
    }

    const item = await ComplianceService.createCalendarItem({
      itemCode: body.itemCode,
      requirementName: body.requirementName,
      category: body.category as ComplianceCategory,
      periodicity: body.periodicity,
      statutoryAuthority: body.statutoryAuthority,
      applicableActOrRule: body.applicableActOrRule || 'Applicable Non-Profit Governance Bylaws',
      fiscalYear: body.fiscalYear || '2025-26',
      dueDate: new Date(body.dueDate),
      responsiblePersonName: body.responsiblePersonName || 'Compliance Officer',
      responsiblePersonRole: body.responsiblePersonRole || 'Statutory Lead',
      responsiblePersonEmail: body.responsiblePersonEmail,
      responsiblePersonPhone: body.responsiblePersonPhone,
      reminderDaysBefore: body.reminderDaysBefore,
      statutoryDocumentId: body.statutoryDocumentId,
    });

    return apiSuccess(item, 'Compliance calendar obligation scheduled successfully', 201);
  } catch (error) {
    return apiError(error);
  }
}
