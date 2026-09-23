import { NextRequest } from 'next/server';
import { FieldOpsService } from '@/lib/field-ops/field-ops-service';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.deviceId) {
      return apiError(new Error('Sync device identifier (deviceId) is mandatory.'));
    }

    const syncResult = await FieldOpsService.processOfflineSyncBatch({
      deviceId: body.deviceId,
      syncedByUserId: body.syncedByUserId || 'FIELD_OFFICER',
      surveys: body.surveys || [],
      visits: body.visits || [],
    });

    return apiSuccess(
      syncResult,
      `Offline sync batch completed: ${syncResult.surveysSyncedCount} survey(s) and ${syncResult.visitsSyncedCount} visit(s) ingested.`,
      200
    );
  } catch (error) {
    return apiError(error);
  }
}
