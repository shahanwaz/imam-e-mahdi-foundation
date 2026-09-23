import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/response';
import { DonationService } from '@/lib/donations/donation-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status');
    const fundType = searchParams.get('fundType');
    const is80G = searchParams.get('is80G');

    const where: any = {
      ...(status ? { paymentStatus: status } : {}),
      ...(fundType ? { fundType } : {}),
      ...(is80G === 'true' ? { is80GIssued: true } : {}),
      ...(search
        ? {
            OR: [
              { receiptNumber: { contains: search, mode: 'insensitive' } },
              { donorName: { contains: search, mode: 'insensitive' } },
              { donorEmail: { contains: search, mode: 'insensitive' } },
              { gatewayPaymentId: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [totalRecords, donations, analytics] = await Promise.all([
      prisma.donation.count({ where }),
      prisma.donation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: { name: true, complianceStatus: true, is80GEligible: true },
          },
          campaign: {
            select: { title: true, slug: true },
          },
          taxExemptionReceipt: {
            select: { certificateNumber: true, financialYear: true },
          },
          refunds: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      DonationService.getAnalytics(),
    ]);

    return apiSuccess(
      {
        donations,
        analytics,
      },
      'Donations retrieved successfully',
      200,
      {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        timestamp: new Date().toISOString(),
      }
    );
  } catch (error) {
    return apiError(error);
  }
}
