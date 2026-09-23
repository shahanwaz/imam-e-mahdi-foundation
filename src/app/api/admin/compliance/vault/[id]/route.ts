import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { requireAuth } from '@/lib/auth/rbac';
import { ComplianceService } from '@/lib/compliance/compliance-service';
import { prisma } from '@/lib/db';
import { ProfessionalVerificationStatus } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(req);
    const { id } = await params;

    const doc = await prisma.statutoryDocument.findUnique({
      where: { id },
      include: { calendarEvents: true },
    });

    if (!doc) {
      throw new Error('Statutory document not found.');
    }

    return apiSuccess(doc, 'Statutory document retrieved');
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(req);
    const { id } = await params;
    const body = await req.json();

    if (body.verificationAction) {
      const updated = await ComplianceService.verifyDocument(id, {
        verificationStatus: body.verificationStatus as ProfessionalVerificationStatus,
        verifiedByProfessionalName: body.verifiedByProfessionalName,
        professionalRegnNumber: body.professionalRegnNumber,
        professionalFirmName: body.professionalFirmName,
        verificationNotes: body.verificationNotes,
      });
      return apiSuccess(updated, 'Professional verification recorded successfully');
    }

    const updated = await prisma.statutoryDocument.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        registrationNumber: body.registrationNumber,
        effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : undefined,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
        isPerpetual: body.isPerpetual !== undefined ? Boolean(body.isPerpetual) : undefined,
        fileUrl: body.fileUrl,
      },
    });

    return apiSuccess(updated, 'Statutory document updated');
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

    await prisma.statutoryDocument.delete({
      where: { id },
    });

    return apiSuccess(null, 'Statutory document removed from vault');
  } catch (error) {
    return apiError(error);
  }
}
