import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { Donation, DonationCategory, TaxExemptionReceipt, ComplianceStatus } from '@prisma/client';
import { ComplianceConfig } from '@/lib/compliance/compliance-config';

const HMAC_RECEIPT_SECRET = process.env.RECEIPT_SIGNING_SECRET || 'imf_hmac_receipt_secret_key_2026';

export class ReceiptService {
  /**
   * Generates a sequential receipt number (e.g. IMF-REC-2026-00012)
   */
  public static async generateNextReceiptNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.donation.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-REC-${year}-${sequence}`;
  }

  /**
   * Generates a sequential 80G Tax Exemption Certificate number (ONLY WHEN 80G IS VERIFIED)
   */
  public static async generateNext80GCertificateNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.taxExemptionReceipt.count();
    const sequence = (count + 1).toString().padStart(4, '0');
    return `IMF-80G-${year}-${sequence}`;
  }

  /**
   * Computes a tamper-proof HMAC-SHA256 signature for a donation receipt
   */
  public static computeReceiptSignatureHash(donation: {
    receiptNumber: string;
    donorName: string;
    donorEmail: string;
    donorPanMasked?: string | null;
    amount: number | string;
    currency: string;
    fundType: string;
    completedAt?: Date | null;
  }): string {
    const payload = [
      donation.receiptNumber,
      donation.donorName.trim(),
      donation.donorEmail.toLowerCase().trim(),
      donation.donorPanMasked || 'NONE',
      donation.amount.toString(),
      donation.currency.toUpperCase(),
      donation.fundType,
      donation.completedAt ? donation.completedAt.toISOString() : new Date().toISOString(),
    ].join('|');

    return crypto
      .createHmac('sha256', HMAC_RECEIPT_SECRET)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verifies a receipt by its cryptographic hash
   */
  public static async verifyReceiptByHash(hash: string) {
    const donation = await prisma.donation.findUnique({
      where: { qrVerificationHash: hash },
      include: {
        category: true,
        campaign: true,
        taxExemptionReceipt: true,
      },
    });

    if (!donation) {
      return {
        isValid: false,
        message: 'Receipt signature hash not found in the Foundation verification registry.',
      };
    }

    // Check central compliance configuration FIRST: 80G must be verified at the organizational level
    const is80GOrgVerified = ComplianceConfig.is80GVerified();
    const isCategoryApproved = donation.category?.complianceStatus === ComplianceStatus.APPROVED;
    const is80GLegallyValid = is80GOrgVerified && isCategoryApproved && Boolean(donation.category?.is80GEligible);

    const receiptNotice = ComplianceConfig.getDonationReceiptDisclaimer();

    return {
      isValid: true,
      receiptNumber: donation.receiptNumber,
      donorName: donation.isAnonymous ? 'Anonymous Donor' : donation.donorName,
      donorPanMasked: donation.donorPanMasked,
      amount: Number(donation.amount),
      currency: donation.currency,
      fundType: donation.fundType,
      paymentMethod: donation.paymentMethod,
      paymentStatus: donation.paymentStatus,
      completedAt: donation.completedAt,
      is80GLegallyValid,
      taxDeductionPercent: is80GLegallyValid ? (donation.category?.taxDeductionPercent || 50) : 0,
      taxExemptionReceipt: is80GLegallyValid ? donation.taxExemptionReceipt : null,
      categoryTitle: donation.category?.name || donation.fundType,
      organizationName: 'Imam E Mahdi Foundation (Section 8 Non-Profit Organization)',
      registrationNumber: is80GLegallyValid
        ? receiptNotice.registrationReference
        : `CIN: U88900DC2026NPL474906 (Section 8 Not-for-Profit)`,
      receiptTitle: receiptNotice.title,
      statutoryDisclaimer: receiptNotice.noticeText,
    };
  }
}

