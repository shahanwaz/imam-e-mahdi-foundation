import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac';
import { revokeSession } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // 1. Revoke DB session
    await revokeSession(user.sessionToken);

    // 2. Audit Log
    await createAuditLog({
      userId: user.id,
      action: 'LOGOUT',
      entity: 'Session',
      entityId: user.sessionToken,
      ipAddress,
      userAgent,
    });

    const response = apiSuccess(null, 'Signed out successfully');

    // Clear session cookie
    response.cookies.delete(process.env.SESSION_COOKIE_NAME || 'imf_dos_session');

    return response;
  } catch (error) {
    return apiError(error);
  }
}
