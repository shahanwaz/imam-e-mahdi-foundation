import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { requireAuth } from '@/lib/auth/rbac';
import { ComplianceService } from '@/lib/compliance/compliance-service';
import { ComplianceCategory, ProfessionalVerificationStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const category = (searchParams.get('category') as ComplianceCategory) || undefined;
    const documentType = searchParams.get('documentType') || undefined;
    const verificationStatus = (searchParams.get('verificationStatus') as ProfessionalVerificationStatus) || undefined;
    const search = searchParams.get('search') || undefined;

    const documents = await ComplianceService.listDocuments({
      category,
      documentType,
      verificationStatus,
      search,
    });

    return apiSuccess(documents, 'Statutory documents retrieved from vault');
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    if (!body.category || !body.documentType || !body.title || !body.issuingAuthority) {
      throw new Error('category, documentType, title, and issuingAuthority are required.');
    }

    const doc = await ComplianceService.createDocument({
      category: body.category as ComplianceCategory,
      documentType: body.documentType,
      title: body.title,
      description: body.description,
      registrationNumber: body.registrationNumber,
      issuingAuthority: body.issuingAuthority,
      effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : null,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      isPerpetual: Boolean(body.isPerpetual),
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileSizeBytes: body.fileSizeBytes,
      mimeType: body.mimeType,
      isConfidential: Boolean(body.isConfidential),
      confidentialDataJson: body.confidentialDataJson,
      createdById: user.id,
    });

    return apiSuccess(doc, `Statutory document ${doc.documentCode} archived successfully in vault`, 201);
  } catch (error) {
    return apiError(error);
  }
}
