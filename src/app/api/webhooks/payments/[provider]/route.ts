import { NextRequest, NextResponse } from 'next/server';
import { DonationService } from '@/lib/donations/donation-service';
import { paymentGateway } from '@/lib/payments/payment-gateway-service';
import { PaymentProviderType, DonationStatus } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider: providerParam } = await params;
    const providerUpper = providerParam.toUpperCase();

    let providerType: PaymentProviderType;
    if (providerUpper === 'RAZORPAY') {
      providerType = PaymentProviderType.RAZORPAY;
    } else if (providerUpper === 'STRIPE') {
      providerType = PaymentProviderType.STRIPE;
    } else if (providerUpper === 'MOCK') {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Forbidden: Mock webhook is strictly disabled in production' },
          { status: 403 }
        );
      }
      providerType = PaymentProviderType.MOCK;
    } else {
      return NextResponse.json({ error: `Unknown provider: ${providerParam}` }, { status: 400 });
    }

    // Read raw body for signature verification
    const rawBody = await request.text();
    const headersRecord: Record<string, string | string[] | undefined> = {};
    request.headers.forEach((val, key) => {
      headersRecord[key.toLowerCase()] = val;
    });

    const webhookResult = await paymentGateway.verifyWebhook(providerType, {
      rawBody,
      headers: headersRecord,
    });

    if (!webhookResult.isValid) {
      console.warn(`[WEBHOOK_INVALID_SIG] Provider: ${providerType}`);
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    if (webhookResult.status === DonationStatus.SUCCESS && webhookResult.gatewayPaymentId) {
      await DonationService.processSuccessfulPayment({
        gatewayOrderId: webhookResult.gatewayOrderId,
        gatewayPaymentId: webhookResult.gatewayPaymentId,
        rawPayload: webhookResult.rawPayload,
      });
    } else if (webhookResult.status === DonationStatus.FAILED && webhookResult.gatewayOrderId) {
      await DonationService.processFailedPayment(
        webhookResult.gatewayOrderId,
        `Webhook event: ${webhookResult.eventType}`
      );
    }

    return NextResponse.json({ received: true, event: webhookResult.eventType });
  } catch (error: any) {
    console.error('[API_WEBHOOK_PAYMENTS_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
