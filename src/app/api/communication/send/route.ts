import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { requireAuth } from '@/lib/auth/rbac';
import { CommunicationService } from '@/lib/communication/communication-service';
import { CommunicationChannel } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);
    const body = await req.json();

    if (!body.templateKey || !body.channels || !body.recipient) {
      throw new Error('templateKey, channels (array), and recipient are required.');
    }

    const result = await CommunicationService.sendNotification({
      templateKey: body.templateKey,
      channels: body.channels as CommunicationChannel[],
      recipient: body.recipient,
      variables: body.variables || {},
      documentId: body.documentId,
    });

    return apiSuccess(result, 'Communication dispatched successfully', 200);
  } catch (error) {
    return apiError(error);
  }
}
