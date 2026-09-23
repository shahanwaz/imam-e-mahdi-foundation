import { NextRequest, NextResponse } from 'next/server';
import { DonationService } from '@/lib/donations/donation-service';
import { paymentGateway } from '@/lib/payments/payment-gateway-service';
import { PaymentProviderType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      provider = PaymentProviderType.RAZORPAY,
      donationId,
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature,
    } = body;

    if (!gatewayPaymentId && !gatewayOrderId) {
      return NextResponse.json(
        { success: false, error: 'Missing gateway reference identifiers.' },
        { status: 400 }
      );
    }

    // 1. Verify Payment Signature using provider SPI
    const verification = await paymentGateway.verifySignature(provider as PaymentProviderType, {
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature,
    });

    if (!verification.isValid) {
      // Record failure if invalid signature
      if (gatewayOrderId) {
        await DonationService.processFailedPayment(
          gatewayOrderId,
          verification.errorMessage || 'Signature verification failed'
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: verification.errorMessage || 'Payment signature verification failed.',
        },
        { status: 400 }
      );
    }

    // 2. Process Successful Payment (Atomically updates DB, CRM, 80G, GL ledger, audit)
    const result = await DonationService.processSuccessfulPayment({
      donationId,
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature,
      rawPayload: verification.rawResponse,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API_DONATION_VERIFY_ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
