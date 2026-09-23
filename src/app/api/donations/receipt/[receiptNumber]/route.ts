import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ReceiptService } from '@/lib/donations/receipt-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ receiptNumber: string }> }
) {
  try {
    const { receiptNumber } = await params;

    const donation = await prisma.donation.findFirst({
      where: {
        OR: [
          { receiptNumber },
          { qrVerificationHash: receiptNumber },
          { id: receiptNumber },
        ],
      },
      include: {
        category: true,
        campaign: true,
        taxExemptionReceipt: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!donation) {
      return NextResponse.json(
        { success: false, error: 'Donation receipt not found.' },
        { status: 404 }
      );
    }

    // Verify cryptographic integrity
    let isCryptographicallyValid = false;
    if (donation.qrVerificationHash && donation.completedAt) {
      const expectedHash = ReceiptService.computeReceiptSignatureHash({
        receiptNumber: donation.receiptNumber,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        donorPanMasked: donation.donorPanMasked,
        amount: donation.amount.toString(),
        currency: donation.currency,
        fundType: donation.fundType,
        completedAt: donation.completedAt,
      });
      isCryptographicallyValid = expectedHash === donation.qrVerificationHash;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: donation.id,
        receiptNumber: donation.receiptNumber,
        donorName: donation.isAnonymous ? 'Anonymous Donor' : donation.donorName,
        donorEmail: donation.donorEmail,
        donorPanMasked: donation.donorPanMasked,
        amount: Number(donation.amount),
        currency: donation.currency,
        amountInINR: Number(donation.amountInINR),
        fundType: donation.fundType,
        categoryName: donation.category?.name || donation.fundType,
        campaignTitle: donation.campaign?.title || null,
        paymentStatus: donation.paymentStatus,
        paymentMethod: donation.paymentMethod,
        paymentProvider: donation.paymentProvider,
        gatewayPaymentId: donation.gatewayPaymentId,
        completedAt: donation.completedAt,
        createdAt: donation.createdAt,
        qrVerificationHash: donation.qrVerificationHash,
        isCryptographicallyValid,
        taxReceipt: donation.taxExemptionReceipt
          ? {
              certificateNumber: donation.taxExemptionReceipt.certificateNumber,
              financialYear: donation.taxExemptionReceipt.financialYear,
              deductionPercent: donation.taxExemptionReceipt.deductionPercent,
              issuedAt: donation.taxExemptionReceipt.issuedAt,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('[API_RECEIPT_FETCH_ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve donation receipt' },
      { status: 500 }
    );
  }
}
