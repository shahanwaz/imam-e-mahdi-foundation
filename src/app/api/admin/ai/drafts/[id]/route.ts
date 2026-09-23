import { NextRequest } from 'next/server';
import { AiService } from '@/lib/ai/ai-service';
import { apiSuccess, apiError } from '@/lib/response';
import { AiDraftStatus } from '@prisma/client';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const draft = await AiService.getDraftById(id);

    if (!draft) {
      return apiError(new Error('Draft not found'), 'Draft not found');
    }

    return apiSuccess(draft, 'Draft retrieved successfully');
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { editedOutput, status, approvalNotes, reviewerUserId } = body;

    if (!status || !Object.values(AiDraftStatus).includes(status)) {
      return apiError(new Error('Invalid status provided for review'));
    }

    const token = req.headers.get('authorization')?.replace('Bearer ', '') || null;
    let fallbackUserId = 'admin_reviewer';
    if (token) {
      try {
        const { verifySessionToken } = await import('@/lib/auth/session');
        const user = await verifySessionToken(token);
        fallbackUserId = user.id;
      } catch {
        // Fallback
      }
    }

    const updated = await AiService.reviewDraft(id, {
      editedOutput,
      status,
      reviewerUserId: reviewerUserId || fallbackUserId,
      approvalNotes,
    });

    return apiSuccess(updated, 'Draft reviewed and updated successfully');
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    const token = req.headers.get('authorization')?.replace('Bearer ', '') || null;
    let publisherUserId = 'admin_publisher';
    if (token) {
      try {
        const { verifySessionToken } = await import('@/lib/auth/session');
        const user = await verifySessionToken(token);
        publisherUserId = user.id;
      } catch {
        // Fallback
      }
    }

    if (action === 'publish') {
      const result = await AiService.publishDraft(id, publisherUserId);
      return apiSuccess(result, 'Approved draft published successfully to target module');
    }

    return apiError(new Error(`Unknown action: ${action}`));
  } catch (error) {
    return apiError(error);
  }
}
