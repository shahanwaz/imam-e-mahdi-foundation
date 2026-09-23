import { PaymentProviderType, PaymentMethod, DonationStatus } from '@prisma/client';

export interface CreatePaymentOrderRequest {
  donationId: string;
  receiptNumber: string;
  amount: number; // in minor currency unit (e.g. paisa/cents) or standard unit
  amountFormatted: number; // in standard unit (e.g. 5000 INR)
  currency: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string | null;
  description: string;
  idempotencyKey: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentOrderResponse {
  provider: PaymentProviderType;
  gatewayOrderId: string;
  gatewayPaymentUrl?: string;
  clientPayload: Record<string, any>; // Provider-specific payload (e.g., razorpay order_id / stripe client_secret)
  expiresAt?: Date;
}

export interface VerifyPaymentSignatureRequest {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewaySignature?: string;
  rawPayload?: string;
}

export interface VerifyPaymentSignatureResponse {
  isValid: boolean;
  gatewayPaymentId: string;
  gatewayOrderId: string;
  status: DonationStatus;
  feeAmount?: number;
  rawResponse?: Record<string, any>;
  errorMessage?: string;
}

export interface WebhookVerificationRequest {
  headers: Record<string, string | string[] | undefined>;
  rawBody: string;
  secretKey?: string;
}

export interface WebhookVerificationResponse {
  isValid: boolean;
  eventType: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  status: DonationStatus;
  amount?: number;
  currency?: string;
  rawPayload: Record<string, any>;
  errorMessage?: string;
}

export interface ProcessRefundRequest {
  gatewayPaymentId: string;
  amount: number;
  currency: string;
  reason: string;
  idempotencyKey: string;
}

export interface ProcessRefundResponse {
  success: boolean;
  gatewayRefundId: string;
  status: string;
  rawResponse?: Record<string, any>;
  errorMessage?: string;
}

/**
 * Payment SPI (Service Provider Interface)
 * Decouples the NGO application from any specific payment gateway.
 */
export interface PaymentProvider {
  readonly providerType: PaymentProviderType;
  
  createOrder(req: CreatePaymentOrderRequest): Promise<CreatePaymentOrderResponse>;
  
  verifyPaymentSignature(req: VerifyPaymentSignatureRequest): Promise<VerifyPaymentSignatureResponse>;
  
  verifyWebhook(req: WebhookVerificationRequest): Promise<WebhookVerificationResponse>;
  
  processRefund?(req: ProcessRefundRequest): Promise<ProcessRefundResponse>;
}
