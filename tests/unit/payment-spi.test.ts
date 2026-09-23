import { describe, it, expect } from 'vitest';
import { PaymentGatewayService } from '@/lib/payments/payment-gateway-service';
import { RazorpayProvider } from '@/lib/payments/providers/razorpay-provider';
import { StripeProvider } from '@/lib/payments/providers/stripe-provider';
import { BankTransferProvider } from '@/lib/payments/providers/bank-transfer-provider';
import { MockPaymentProvider } from '@/lib/payments/providers/mock-provider';
import { PaymentProviderType, PaymentMethod, DonationStatus } from '@prisma/client';
import crypto from 'crypto';

describe('Payment Gateway SPI Abstraction Layer', () => {
  const gateway = PaymentGatewayService.getInstance();

  it('should register and retrieve all standard payment providers', () => {
    expect(gateway.getProvider(PaymentProviderType.RAZORPAY)).toBeInstanceOf(RazorpayProvider);
    expect(gateway.getProvider(PaymentProviderType.STRIPE)).toBeInstanceOf(StripeProvider);
    expect(gateway.getProvider(PaymentProviderType.BANK_TRANSFER)).toBeInstanceOf(BankTransferProvider);
    expect(gateway.getProvider(PaymentProviderType.MOCK)).toBeInstanceOf(MockPaymentProvider);
  });

  it('should resolve the correct provider based on currency and payment method', () => {
    const origEnv = process.env.NODE_ENV;
    const origMock = process.env.USE_MOCK_PAYMENTS;
    
    delete process.env.USE_MOCK_PAYMENTS;
    (process.env as any).NODE_ENV = 'production';

    // Bank transfer should always resolve to BANK_TRANSFER
    expect(gateway.resolveProvider('INR', PaymentMethod.BANK_TRANSFER_NEFT)).toBe(PaymentProviderType.BANK_TRANSFER);
    expect(gateway.resolveProvider('USD', PaymentMethod.BANK_TRANSFER_NEFT)).toBe(PaymentProviderType.BANK_TRANSFER);

    // Foreign currency donations resolve to Stripe
    expect(gateway.resolveProvider('USD', PaymentMethod.CARD)).toBe(PaymentProviderType.STRIPE);
    expect(gateway.resolveProvider('EUR', PaymentMethod.CARD)).toBe(PaymentProviderType.STRIPE);
    expect(gateway.resolveProvider('GBP', PaymentMethod.CARD)).toBe(PaymentProviderType.STRIPE);

    // Domestic INR giving resolves to Razorpay
    expect(gateway.resolveProvider('INR', PaymentMethod.UPI)).toBe(PaymentProviderType.RAZORPAY);
    expect(gateway.resolveProvider('INR', PaymentMethod.CARD)).toBe(PaymentProviderType.RAZORPAY);

    (process.env as any).NODE_ENV = origEnv;
    if (origMock) process.env.USE_MOCK_PAYMENTS = origMock;
  });

  describe('MockPaymentProvider', () => {
    const mockProvider = new MockPaymentProvider();

    it('should create orders with sandbox identifiers and valid expiry', async () => {
      const order = await mockProvider.createOrder({
        donationId: 'test-donation-123',
        receiptNumber: 'IMF-REC-2026-00001',
        amount: 500000,
        amountFormatted: 5000,
        currency: 'INR',
        donorName: 'Dr. Ali Raza',
        donorEmail: 'ali@example.com',
        description: 'Zakat al-Mal Donation',
        idempotencyKey: 'idemp_mock_test_1',
      });

      expect(order.provider).toBe(PaymentProviderType.MOCK);
      expect(order.gatewayOrderId).toMatch(/^mock_order_/);
      expect(order.clientPayload.isSandbox).toBe(true);
      expect(order.expiresAt && order.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should verify sandbox payment signature and simulate success', async () => {
      const res = await mockProvider.verifyPaymentSignature({
        gatewayOrderId: 'mock_order_12345',
        gatewayPaymentId: 'mock_pay_998877',
      });

      expect(res.isValid).toBe(true);
      expect(res.status).toBe(DonationStatus.SUCCESS);
    });

    it('should simulate failure when paymentId begins with fail_', async () => {
      const res = await mockProvider.verifyPaymentSignature({
        gatewayOrderId: 'mock_order_12345',
        gatewayPaymentId: 'fail_card_declined_123',
      });

      expect(res.isValid).toBe(false);
      expect(res.status).toBe(DonationStatus.FAILED);
      expect(res.errorMessage).toContain('Simulated sandbox card decline');
    });

    it('should verify mock webhooks correctly', async () => {
      const webhookPayload = JSON.stringify({
        orderId: 'mock_ord_555',
        paymentId: 'mock_pay_777',
        status: 'SUCCESS',
        amount: 5000,
      });

      const res = await mockProvider.verifyWebhook({
        rawBody: webhookPayload,
        headers: {},
      });

      expect(res.isValid).toBe(true);
      expect(res.gatewayOrderId).toBe('mock_ord_555');
      expect(res.status).toBe(DonationStatus.SUCCESS);
    });
  });

  describe('RazorpayProvider HMAC Signature & Webhook Verification', () => {
    const razorpay = new RazorpayProvider();

    it('should create Razorpay order with formatted payload and prefill data', async () => {
      const order = await razorpay.createOrder({
        donationId: 'don-001',
        receiptNumber: 'IMF-REC-2026-10001',
        amount: 250000,
        amountFormatted: 2500,
        currency: 'INR',
        donorName: 'Syeda Fatima',
        donorEmail: 'fatima@example.com',
        donorPhone: '+919876543210',
        description: 'Orphan Aid Contribution',
        idempotencyKey: 'idemp_rzp_test_1',
      });

      expect(order.provider).toBe(PaymentProviderType.RAZORPAY);
      expect(order.clientPayload.amount).toBe(250000);
      expect(order.clientPayload.currency).toBe('INR');
      expect(order.clientPayload.prefill.name).toBe('Syeda Fatima');
      expect(order.clientPayload.prefill.contact).toBe('+919876543210');
    });

    it('should verify HMAC-SHA256 signature against key secret', async () => {
      const orderId = 'order_rzp_test_12345';
      const paymentId = 'pay_rzp_test_67890';
      const secret = 'rzp_test_imf_dummy_secret';

      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const verification = await razorpay.verifyPaymentSignature({
        gatewayOrderId: orderId,
        gatewayPaymentId: paymentId,
        gatewaySignature: validSignature,
      });

      expect(verification.isValid).toBe(true);
      expect(verification.status).toBe(DonationStatus.SUCCESS);
    });
  });

  describe('BankTransferProvider Manual UTR Reconciliation', () => {
    const bank = new BankTransferProvider();

    it('should create bank reference instructions with unique virtual ref', async () => {
      const order = await bank.createOrder({
        donationId: 'don-bank-01',
        receiptNumber: 'IMF-REC-2026-20001',
        amount: 1000000,
        amountFormatted: 10000,
        currency: 'INR',
        donorName: 'Hasan Raza',
        donorEmail: 'hasan@example.com',
        description: 'General Sadaqah Bank Transfer',
        idempotencyKey: 'idemp_bank_test_1',
      });

      expect(order.provider).toBe(PaymentProviderType.BANK_TRANSFER);
      expect(order.clientPayload.bankName).toBe('HDFC Bank Ltd');
      expect(order.clientPayload.accountNumber).toBe('50200088991122');
      expect(order.clientPayload.ifscCode).toBe('HDFC0000123');
      expect(order.clientPayload.referenceCode).toContain('BANK-REF-');
    });

    it('should verify valid 6+ character Indian bank UTR reference numbers', async () => {
      const validUtr = await bank.verifyPaymentSignature({
        gatewayOrderId: 'bank_ord_123',
        gatewayPaymentId: 'HDFC260915998877',
      });
      expect(validUtr.isValid).toBe(true);
      expect(validUtr.status).toBe(DonationStatus.SUCCESS);

      const emptyUtr = await bank.verifyPaymentSignature({
        gatewayOrderId: 'bank_ord_123',
        gatewayPaymentId: '',
      });
      expect(emptyUtr.isValid).toBe(false);
      expect(emptyUtr.status).toBe(DonationStatus.PENDING);
    });
  });
});
