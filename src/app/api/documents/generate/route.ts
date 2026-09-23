import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { requireAuth } from '@/lib/auth/rbac';
import { DocumentService } from '@/lib/documents/document-service';
import { DocumentType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    if (!body.documentType || !body.recipientName) {
      throw new Error('documentType and recipientName are required fields.');
    }

    const doc = await DocumentService.generateDocument({
      documentType: body.documentType as DocumentType,
      title: body.title,
      templateVersion: body.templateVersion,
      recipientName: body.recipientName,
      recipientEmail: body.recipientEmail,
      recipientPhone: body.recipientPhone,
      metadata: body.metadata || {},
      signatories: body.signatories,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      createdById: user.id,
      donationId: body.donationId,
      memberProfileId: body.memberProfileId,
      volunteerProfileId: body.volunteerProfileId,
      employeeProfileId: body.employeeProfileId,
      payslipId: body.payslipId,
      projectId: body.projectId,
    });

    return apiSuccess(doc, `Official document ${doc.documentNumber} generated successfully`, 201);
  } catch (error) {
    return apiError(error);
  }
}
