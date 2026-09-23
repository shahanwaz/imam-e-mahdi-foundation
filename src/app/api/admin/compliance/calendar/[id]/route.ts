import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { requireAuth } from '@/lib/auth/rbac';
import { ComplianceService } from '@/lib/compliance/compliance-service';
import { prisma } from '@/lib/db';
import { ProfessionalVerificationStatus, ComplianceFilingStatus } from '@prisma/client';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(req);
    const { id } = await params;
    const body = await req.json();

    // 1. Mark as completed / filed
    if (body.markCompleted) {
      if (!body.acknowledgementNumber || !body.filingDate) {
        throw new Error('acknowledgementNumber and filingDate are required to mark filing as completed.');
      }
      const updated = await ComplianceService.markFilingCompleted(id, {
        filingDate: new Date(body.filingDate),
        acknowledgementNumber: body.acknowledgementNumber,
        statutoryDocumentId: body.statutoryDocumentId,
      });
      return apiSuccess(updated, 'Compliance filing marked as completed');
    }

    // 2. Record professional verification
    if (body.verificationAction) {
      const updated = await ComplianceService.verifyCalendarFiling(id, {
        verificationStatus: body.verificationStatus as ProfessionalVerificationStatus,
        verifiedByProfessionalName: body.verifiedByProfessionalName,
        professionalRegnNumber: body.professionalRegnNumber,
        professionalFirmName: body.professionalFirmName,
        verificationNotes: body.verificationNotes,
      });
      return apiSuccess(updated, 'Professional compliance verification recorded');
    }

    // 3. General update
    const updated = await prisma.complianceCalendarItem.update({
      where: { id },
      data: {
        status: body.status as ComplianceFilingStatus,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        extendedDueDate: body.extendedDueDate ? new Date(body.extendedDueDate) : undefined,
        responsiblePersonName: body.responsiblePersonName,
        responsiblePersonEmail: body.responsiblePersonEmail,
        responsiblePersonPhone: body.responsiblePersonPhone,
        statutoryDocumentId: body.statutoryDocumentId,
      },
    });

    return apiSuccess(updated, 'Compliance calendar obligation updated');
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(req);
    const { id } = await params;

    await prisma.complianceCalendarItem.delete({
      where: { id },
    });

    return apiSuccess(null, 'Compliance calendar item removed');
  } catch (error) {
    return apiError(error);
  }
}
