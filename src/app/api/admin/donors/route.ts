import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search')?.trim() || '';

    const where: any = {
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { panMasked: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [totalRecords, donors, totalAggregates] = await Promise.all([
      prisma.donorProfile.count({ where }),
      prisma.donorProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { totalDonatedAmount: 'desc' },
        include: {
          donations: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              receiptNumber: true,
              amount: true,
              currency: true,
              fundType: true,
              paymentStatus: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.donorProfile.aggregate({
        _sum: { totalDonatedAmount: true },
        _count: { id: true },
      }),
    ]);

    return apiSuccess(
      {
        donors,
        totalDonors: totalAggregates._count.id,
        totalLifetimeGivingINR: Number(totalAggregates._sum.totalDonatedAmount || 0),
      },
      'Donors retrieved successfully',
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
