import { NextRequest, NextResponse } from 'next/server';
import { DonationService } from '@/lib/donations/donation-service';
import { PaymentMethod } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      amount,
      currency = 'INR',
      categorySlug,
      campaignSlug,
      donorName,
      donorEmail,
      donorPhone,
      donorPan,
      donorAddress,
      isAnonymous = false,
      is80GRequested = false,
      paymentMethod = PaymentMethod.UPI,
      idempotencyKey,
      callbackUrl,
    } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'A valid donation amount greater than 0 is required.' },
        { status: 400 }
      );
    }

    if (!donorName || typeof donorName !== 'string' || donorName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Full legal name is required for regulatory receipting.' },
        { status: 400 }
      );
    }

    if (!donorEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    // If 80G / Tax exemption is requested, validate PAN format (ABCDE1234F) for statutory compliance
    if (is80GRequested) {
      if (!donorPan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(donorPan.trim())) {
        return NextResponse.json(
          {
            success: false,
            error: 'A valid 10-digit PAN (e.g. ABCDE1234F) is mandatory when providing PAN for statutory KYC compliance.',
          },
          { status: 400 }
        );
      }
    }

    const donationResult = await DonationService.initiateDonation({
      amount,
      currency,
      categorySlug,
      campaignSlug,
      donorName: donorName.trim(),
      donorEmail: donorEmail.trim().toLowerCase(),
      donorPhone: donorPhone ? donorPhone.trim() : undefined,
      donorPan: donorPan ? donorPan.trim().toUpperCase() : undefined,
      donorAddress: donorAddress ? donorAddress.trim() : undefined,
      isAnonymous: Boolean(isAnonymous),
      is80GRequested: Boolean(is80GRequested),
      paymentMethod,
      idempotencyKey,
      callbackUrl,
    });

    return NextResponse.json({
      success: true,
      data: donationResult,
    });
  } catch (error: any) {
    console.error('[API_DONATION_INITIATE_ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initiate donation transaction' },
      { status: 500 }
    );
  }
}
