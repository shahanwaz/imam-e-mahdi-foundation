import { PaymentProviderType, DonationStatus } from '@prisma/client';
import { 
  PaymentProvider, 
  CreatePaymentOrderRequest, 
  CreatePaymentOrderResponse, 
  VerifyPaymentSignatureRequest, 
  VerifyPaymentSignatureResponse, 
  WebhookVerificationRequest, 
  WebhookVerificationResponse 
} from '../types';

export class BankTransferProvider implements PaymentProvider {
  public readonly providerType = PaymentProviderType.BANK_TRANSFER;

  public async createOrder(req: CreatePaymentOrderRequest): Promise<CreatePaymentOrderResponse> {
    const referenceCode = `BANK-REF-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return {
      provider: this.providerType,
      gatewayOrderId: referenceCode,
      clientPayload: {
        referenceCode,
        accountName: 'IMAM E MAHDI FOUNDATION',
        bankName: 'HDFC Bank Ltd',
        accountNumber: '50200088991122',
        ifscCode: 'HDFC0000123',
        branch: 'Hazratganj, Lucknow',
        upiId: 'imammission@hdfcbank',
        instructions: 'Please include the reference code in your transfer narration. Once transferred, submit UTR or WhatsApp receipt to +91-522-2610110 for automated receipt reconciliation.',
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };
  }

  public async verifyPaymentSignature(req: VerifyPaymentSignatureRequest): Promise<VerifyPaymentSignatureResponse> {
    // For manual bank transfers, verification occurs when finance officer matches UTR
    const isUtrProvided = Boolean(req.gatewayPaymentId && req.gatewayPaymentId.length >= 6);

    return {
      isValid: isUtrProvided,
      gatewayOrderId: req.gatewayOrderId,
      gatewayPaymentId: req.gatewayPaymentId,
      status: isUtrProvided ? DonationStatus.SUCCESS : DonationStatus.PENDING,
      rawResponse: { utr: req.gatewayPaymentId, verifiedAt: new Date() },
    };
  }

  public async verifyWebhook(req: WebhookVerificationRequest): Promise<WebhookVerificationResponse> {
    return {
      isValid: true,
      eventType: 'bank_transfer.manual_reconciliation',
      status: DonationStatus.PENDING,
      rawPayload: {},
    };
  }
}
