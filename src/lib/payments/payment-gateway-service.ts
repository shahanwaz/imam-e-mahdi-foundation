import { PaymentProviderType, PaymentMethod } from '@prisma/client';
import { 
  PaymentProvider, 
  CreatePaymentOrderRequest, 
  CreatePaymentOrderResponse, 
  VerifyPaymentSignatureRequest, 
  VerifyPaymentSignatureResponse, 
  WebhookVerificationRequest, 
  WebhookVerificationResponse 
} from './types';
import { RazorpayProvider } from './providers/razorpay-provider';
import { StripeProvider } from './providers/stripe-provider';
import { BankTransferProvider } from './providers/bank-transfer-provider';
import { MockPaymentProvider } from './providers/mock-provider';

export class PaymentGatewayService {
  private static instance: PaymentGatewayService;
  private providers: Map<PaymentProviderType, PaymentProvider> = new Map();

  private constructor() {
    this.registerProvider(new RazorpayProvider());
    this.registerProvider(new StripeProvider());
    this.registerProvider(new BankTransferProvider());
    this.registerProvider(new MockPaymentProvider());
  }

  public static getInstance(): PaymentGatewayService {
    if (!PaymentGatewayService.instance) {
      PaymentGatewayService.instance = new PaymentGatewayService();
    }
    return PaymentGatewayService.instance;
  }

  public registerProvider(provider: PaymentProvider): void {
    this.providers.set(provider.providerType, provider);
  }

  public getProvider(type: PaymentProviderType): PaymentProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`[PAYMENT_SPI] Unsupported or unconfigured payment provider: ${type}`);
    }
    return provider;
  }

  /**
   * Resolves the optimal payment provider based on currency, payment method, and environment
   */
  public resolveProvider(currency: string, method?: PaymentMethod): PaymentProviderType {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_MOCK_IN_PRODUCTION !== 'true') {
      if (method === PaymentMethod.BANK_TRANSFER_NEFT) {
        return PaymentProviderType.BANK_TRANSFER;
      }
      if (currency.toUpperCase() !== 'INR') {
        return PaymentProviderType.STRIPE;
      }
      return PaymentProviderType.RAZORPAY;
    }

    // If mock sandbox mode is enabled explicitly
    if (process.env.USE_MOCK_PAYMENTS === 'true' || process.env.NODE_ENV === 'test') {
      return PaymentProviderType.MOCK;
    }

    if (method === PaymentMethod.BANK_TRANSFER_NEFT) {
      return PaymentProviderType.BANK_TRANSFER;
    }

    // International foreign currency donations route to Stripe
    if (currency.toUpperCase() !== 'INR') {
      return PaymentProviderType.STRIPE;
    }

    // Domestic INR giving routes to Razorpay (supporting UPI, Cards, NetBanking)
    return PaymentProviderType.RAZORPAY;
  }

  public async createOrder(
    providerType: PaymentProviderType,
    req: CreatePaymentOrderRequest
  ): Promise<CreatePaymentOrderResponse> {
    const provider = this.getProvider(providerType);
    return provider.createOrder(req);
  }

  public async verifySignature(
    providerType: PaymentProviderType,
    req: VerifyPaymentSignatureRequest
  ): Promise<VerifyPaymentSignatureResponse> {
    const provider = this.getProvider(providerType);
    return provider.verifyPaymentSignature(req);
  }

  public async verifyWebhook(
    providerType: PaymentProviderType,
    req: WebhookVerificationRequest
  ): Promise<WebhookVerificationResponse> {
    const provider = this.getProvider(providerType);
    return provider.verifyWebhook(req);
  }
}

export const paymentGateway = PaymentGatewayService.getInstance();
