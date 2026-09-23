import { NextRequest } from 'next/server';
import { AiProviderRegistry } from '@/lib/ai/providers/registry';
import { AI_TASK_DEFINITIONS } from '@/lib/ai/types';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(_req: NextRequest) {
  try {
    const providers = AiProviderRegistry.listProviders();
    const tasks = Object.values(AI_TASK_DEFINITIONS);

    return apiSuccess(
      {
        providers,
        tasks,
      },
      'AI Providers and task configurations retrieved successfully'
    );
  } catch (error) {
    return apiError(error);
  }
}
