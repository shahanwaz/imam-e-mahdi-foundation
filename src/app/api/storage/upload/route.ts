import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac';
import { UploadFileMetadataSchema } from '@/lib/validations/storage';
import { uploadFile } from '@/lib/storage';
import { createAuditLog } from '@/lib/audit';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const actor = await requireAuth(req);
    const body = await req.json();
    const validated = UploadFileMetadataSchema.parse(body);

    const buffer = Buffer.from(validated.fileBase64, 'base64');

    const result = await uploadFile({
      bucket: validated.bucket,
      fileName: validated.fileName,
      mimeType: validated.mimeType,
      buffer,
      uploadedById: actor.id,
    });

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    await createAuditLog({
      userId: actor.id,
      action: 'FILE_UPLOAD',
      entity: 'StorageObject',
      entityId: result.storageId,
      newData: {
        fileKey: result.fileKey,
        bucket: validated.bucket,
        fileName: validated.fileName,
        fileSize: buffer.length,
      },
      ipAddress,
      userAgent,
    });

    return apiSuccess(
      {
        fileKey: result.fileKey,
        storageId: result.storageId,
        fileName: validated.fileName,
        bucket: validated.bucket,
      },
      'File uploaded successfully',
      201
    );
  } catch (error) {
    return apiError(error);
  }
}
