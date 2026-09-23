import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { requireAuth } from '@/lib/auth/rbac';
import { CommunicationService } from '@/lib/communication/communication-service';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const isReadParam = searchParams.get('isRead');
    const isUrgentParam = searchParams.get('isUrgent');

    const isRead = isReadParam !== null ? isReadParam === 'true' : undefined;
    const isUrgent = isUrgentParam !== null ? isUrgentParam === 'true' : undefined;

    const notifications = await CommunicationService.getInAppNotifications({
      userId: user.id,
      isRead,
      isUrgent,
      limit: 50,
    });

    return apiSuccess(notifications, 'Notifications retrieved successfully');
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    if (body.all) {
      await CommunicationService.markAllNotificationsAsRead(user.id);
      return apiSuccess(null, 'All notifications marked as read');
    }

    if (body.id) {
      const updated = await CommunicationService.markNotificationAsRead(body.id);
      return apiSuccess(updated, 'Notification marked as read');
    }

    throw new Error('Please specify an id or all: true');
  } catch (error) {
    return apiError(error);
  }
}
