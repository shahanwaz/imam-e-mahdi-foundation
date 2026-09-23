import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    return apiSuccess(user, 'User profile fetched successfully');
  } catch (error) {
    return apiError(error);
  }
}
