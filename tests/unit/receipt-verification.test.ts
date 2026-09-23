import { describe, it, expect, vi } from 'vitest';
import { ReceiptService } from '@/lib/donations/receipt-service';
import { FundType } from '@prisma/client';

// Mock Prisma for deterministic unit testing
vi.mock('@/lib/db', () => ({
  prisma: {
    donation: {
      count: vi.fn().mockResolvedValue(12),
    },
    taxExemptionReceipt: {
      count: vi.fn().mockResolvedValue(5),
    },
  },
}));

describe('Receipt Service & Cryptographic QR Verification Tests', () => {
  it('should compute deterministic tamper-proof HMAC-SHA256 signature hash', () => {
    const params = {
      receiptNumber: 'IMF-REC-2026-00001',
      donorName: 'Syed Ali',
      donorEmail: 'ali@example.com',
      donorPanMasked: 'ABCDE****F',
      amount: '5000',
      currency: 'INR',
      fundType: FundType.ZAKAT_MAL,
      completedAt: new Date('2026-09-15T12:00:00Z'),
    };

    const hash1 = ReceiptService.computeReceiptSignatureHash(params);
    const hash2 = ReceiptService.computeReceiptSignatureHash(params);

    expect(hash1).toBeDefined();
    expect(hash1).toHaveLength(64); // SHA-256 hex
    expect(hash1).toBe(hash2);
  });

  it('should detect tampering in any field of the receipt payload', () => {
    const baseParams = {
      receiptNumber: 'IMF-REC-2026-00001',
      donorName: 'Syed Ali',
      donorEmail: 'ali@example.com',
      donorPanMasked: 'ABCDE****F',
      amount: '5000',
      currency: 'INR',
      fundType: FundType.ZAKAT_MAL,
      completedAt: new Date('2026-09-15T12:00:00Z'),
    };

    const validHash = ReceiptService.computeReceiptSignatureHash(baseParams);

    // Tampered amount (5000 -> 50000)
    const tamperedAmountHash = ReceiptService.computeReceiptSignatureHash({
      ...baseParams,
      amount: '50000',
    });
    expect(tamperedAmountHash).not.toBe(validHash);

    // Tampered Fund Type (ZAKAT_MAL -> GENERAL_SADAQAH)
    const tamperedFundHash = ReceiptService.computeReceiptSignatureHash({
      ...baseParams,
      fundType: FundType.GENERAL_SADAQAH,
    });
    expect(tamperedFundHash).not.toBe(validHash);

    // Tampered Donor Name
    const tamperedNameHash = ReceiptService.computeReceiptSignatureHash({
      ...baseParams,
      donorName: 'Fake Donor',
    });
    expect(tamperedNameHash).not.toBe(validHash);
  });

  it('should correctly format sequential receipt numbers and 80G certificate numbers', async () => {
    const nextRec = await ReceiptService.generateNextReceiptNumber();
    expect(nextRec).toMatch(/^IMF-REC-\d{4}-00013$/);

    const next80G = await ReceiptService.generateNext80GCertificateNumber();
    expect(next80G).toMatch(/^IMF-80G-\d{4}-0006$/);
  });
});
