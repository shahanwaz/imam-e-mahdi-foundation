import { PaymentProviderType, DonationStatus } from '@prisma/client';
import { 
  PaymentProvider, 
  CreatePaymentOrderRequest, 
  CreatePaymentOrderResponse, 
  VerifyPaymentSignatureRequest, 
  VerifyPaymentSignatureResponse, 
  WebhookVerificationRequest, 
  WebhookVerificationResponse, 
  ProcessRefundRequest, 
  ProcessRefundResponse 
} from '../types';

export class MockPaymentProvider implements PaymentProvider {
  public readonly providerType = PaymentProviderType.MOCK;

  private assertMockAllowed(): void {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_MOCK_IN_PRODUCTION !== 'true') {
      throw new Error(
        '[PAYMENT_SECURITY_VIOLATION] MockPaymentProvider is strictly disabled in production. Live payment gateways must be configured.'
      );
    }
  }

  public async createOrder(req: CreatePaymentOrderRequest): Promise<CreatePaymentOrderResponse> {
    this.assertMockAllowed();
    const orderId = `mock_order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      provider: this.providerType,
      gatewayOrderId: orderId,
      gatewayPaymentUrl: `http://localhost:3001/checkout/mock?order=${orderId}`,
      clientPayload: {
        orderId,
        mockKey: 'mock_sandbox_key_2026',
        amount: req.amountFormatted,
        currency: req.currency,
        isSandbox: true,
      },
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    };
  }

  public async verifyPaymentSignature(req: VerifyPaymentSignatureRequest): Promise<VerifyPaymentSignatureResponse> {
    this.assertMockAllowed();
    const paymentId = req.gatewayPaymentId || `mock_pay_${Date.now()}`;
    const orderId = req.gatewayOrderId || `mock_ord_${Date.now()}`;

    // If paymentId starts with 'fail_', simulate failed payment
    if (paymentId.startsWith('fail_')) {
      return {
        isValid: false,
        gatewayOrderId: orderId,
        gatewayPaymentId: paymentId,
        status: DonationStatus.FAILED,
        errorMessage: 'Simulated sandbox card decline error.',
      };
    }

    return {
      isValid: true,
      gatewayOrderId: orderId,
      gatewayPaymentId: paymentId,
      status: DonationStatus.SUCCESS,
      feeAmount: 0.0,
      rawResponse: { sandbox: true, timestamp: new Date() },
    };
  }

  public async verifyWebhook(req: WebhookVerificationRequest): Promise<WebhookVerificationResponse> {
    this.assertMockAllowed();
    let payload: Record<string, any> = {};
    try {
      payload = JSON.parse(req.rawBody);
    } catch {
      payload = {};
    }

    const orderId = payload.orderId || `mock_order_${Date.now()}`;
    const paymentId = payload.paymentId || `mock_pay_${Date.now()}`;
    const isSuccess = payload.status !== 'FAILED';

    return {
      isValid: true,
      eventType: isSuccess ? 'payment.mock_success' : 'payment.mock_failed',
      gatewayOrderId: orderId,
      gatewayPaymentId: paymentId,
      status: isSuccess ? DonationStatus.SUCCESS : DonationStatus.FAILED,
      amount: payload.amount,
      currency: payload.currency || 'INR',
      rawPayload: payload,
    };
  }

  public async processRefund(req: ProcessRefundRequest): Promise<ProcessRefundResponse> {
    this.assertMockAllowed();
    const refundId = `mock_rfnd_${Date.now()}`;
    return {
      success: true,
      gatewayRefundId: refundId,
      status: 'PROCESSED',
      rawResponse: { mockRefundId: refundId, amount: req.amount },
    };
  }
}
