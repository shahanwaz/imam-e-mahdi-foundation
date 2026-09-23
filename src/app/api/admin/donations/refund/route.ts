import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { DonationService } from '@/lib/donations/donation-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { donationId, reason, approvedByUserId } = body;

    if (!donationId) {
      return apiError(new Error('Donation ID is required for refund processing.'));
    }

    if (!reason || reason.trim().length < 5) {
      return apiError(new Error('A formal justification reason of at least 5 characters is required.'));
    }

    const token = req.headers.get('authorization')?.replace('Bearer ', '') || null;
    let finalApproverId = approvedByUserId || 'finance_officer';
    if (token) {
      try {
        const { verifySessionToken } = await import('@/lib/auth/session');
        const user = await verifySessionToken(token);
        finalApproverId = user.id;
      } catch {
        // Fallback
      }
    }

    const result = await DonationService.processRefund({
      donationId,
      reason: reason.trim(),
      approvedByUserId: finalApproverId,
    });

    return apiSuccess(result, 'Donation refund processed and journal entries reversed', 200);
  } catch (error) {
    return apiError(error);
  }
}
