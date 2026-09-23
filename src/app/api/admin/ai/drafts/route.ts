import { NextRequest } from 'next/server';
import { AiService } from '@/lib/ai/ai-service';
import { apiSuccess, apiError } from '@/lib/response';
import { AiDraftStatus, AiSafetyDomain, AiTaskType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as AiDraftStatus | null;
    const taskType = searchParams.get('taskType') as AiTaskType | null;
    const safetyDomain = searchParams.get('safetyDomain') as AiSafetyDomain | null;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!, 10) : 0;

    const result = await AiService.getDrafts({
      status: status || undefined,
      taskType: taskType || undefined,
      safetyDomain: safetyDomain || undefined,
      search,
      limit,
      skip,
    });

    return apiSuccess(result, 'AI Drafts retrieved successfully');
  } catch (error) {
    return apiError(error);
  }
}
