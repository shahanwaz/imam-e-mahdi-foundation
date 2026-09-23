import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/rbac';
import { getFile } from '@/lib/storage';
import { apiError } from '@/lib/response';
import { ForbiddenError, NotFoundError } from '@/lib/errors';
import { StorageBucket } from '@prisma/client';

interface RouteContext {
  params: Promise<{ key: string[] }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { key } = await context.params;
    const fileKey = key.join('/');

    // 1. Fetch DB metadata to check privacy level
    const storageRecord = await prisma.storageObject.findUnique({
      where: { fileKey },
    });

    if (!storageRecord || storageRecord.deletedAt) {
      throw new NotFoundError(`File [${fileKey}] not found`);
    }

    // 2. Private KYC access control check
    if (storageRecord.bucket === StorageBucket.PRIVATE_KYC || storageRecord.bucket === StorageBucket.LEGAL_VAULT) {
      const user = await requireAuth(req);
      const isUploader = storageRecord.uploadedById === user.id;
      const hasPrivilege = user.roles.includes('SUPER_ADMIN') || user.permissions.includes('storage:read_private');

      if (!isUploader && !hasPrivilege) {
        throw new ForbiddenError('Access Denied: You do not have permission to view this confidential file');
      }
    }

    // 3. Retrieve and decrypt file
    const fileData = await getFile(fileKey);

    return new NextResponse(new Uint8Array(fileData.buffer), {
      status: 200,
      headers: {
        'Content-Type': fileData.mimeType,
        'Content-Disposition': `inline; filename="${fileData.fileName}"`,
        'Cache-Control': storageRecord.bucket === StorageBucket.PUBLIC_ASSETS ? 'public, max-age=86400' : 'private, no-cache',
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
