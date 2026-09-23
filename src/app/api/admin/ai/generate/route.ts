import { NextRequest } from 'next/server';
import { AiService } from '@/lib/ai/ai-service';
import { apiSuccess, apiError } from '@/lib/response';
import { AiTaskType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      taskType,
      title,
      prompt,
      targetLanguage,
      targetAudience,
      tone,
      provider,
      modelName,
      temperature,
      maxTokens,
      targetModule,
      targetEntityId,
    } = body;

    if (!taskType || !title || !prompt) {
      return apiError(new Error('Missing required fields: taskType, title, and prompt are required.'));
    }

    if (!Object.values(AiTaskType).includes(taskType)) {
      return apiError(new Error(`Invalid taskType: ${taskType}`));
    }

    const token = req.headers.get('authorization')?.replace('Bearer ', '') || null;
    let userId = 'system_admin';
    if (token) {
      try {
        const { verifySessionToken } = await import('@/lib/auth/session');
        const user = await verifySessionToken(token);
        userId = user.id;
      } catch {
        // Fallback to default
      }
    }

    const result = await AiService.generateDraft(
      {
        taskType,
        title,
        prompt,
        targetLanguage,
        targetAudience,
        tone,
        targetModule,
        targetEntityId,
        userId,
      },
      {
        provider,
        modelName,
        temperature,
        maxTokens,
      }
    );

    return apiSuccess(result, 'AI Draft generated successfully and queued for human review', 201);
  } catch (error) {
    return apiError(error);
  }
}
