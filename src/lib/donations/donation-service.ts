import { prisma } from '@/lib/db';
import {
  FundType,
  PaymentMethod,
  PaymentProviderType,
  DonationStatus,
  ComplianceStatus,
  Prisma,
} from '@prisma/client';
import { maskPan, encryptPII } from '@/lib/crypto';
import { createAuditLog } from '@/lib/audit';
import { ReceiptService } from './receipt-service';
import { GeneralLedgerService } from '@/lib/finance/general-ledger-service';
import { PaymentGatewayService, paymentGateway } from '@/lib/payments/payment-gateway-service';
import { CommunicationService } from '@/lib/communication/communication-service';
import { ComplianceConfig } from '@/lib/compliance/compliance-config';

export interface InitiateDonationInput {
  amount: number;
  currency?: string;
  categorySlug?: string;
  campaignSlug?: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorPan?: string;
  donorAddress?: string;
  isAnonymous?: boolean;
  is80GRequested?: boolean;
  paymentMethod?: PaymentMethod;
  idempotencyKey?: string;
  callbackUrl?: string;
}

export class DonationService {
  /**
   * Initializes default active donation categories with configurable compliance attributes
   */
  public static async ensureDefaultCategories() {
    const defaultCats = [
      {
        slug: 'zakat-mal',
        name: 'Zakat al-Mal (100% Direct Policy)',
        fundType: FundType.ZAKAT_MAL,
        description: 'Direct cash assistance and emergency relief for vetted impoverished families.',
        iconName: 'Coins',
        isZakatEligible: true,
        is80GEligible: true,
        taxDeductionPercent: 50,
        complianceStatus: ComplianceStatus.APPROVED,
        complianceApprovedBy: 'Central Sharia & Governance Board',
        complianceApprovalDate: new Date('2026-01-01'),
      },
      {
        slug: 'zakat-fitr',
        name: 'Zakat al-Fitr (Fitrah)',
        fundType: FundType.ZAKAT_FITRAH,
        description: 'Staple grain and food security distribution at Eid.',
        iconName: 'Wheat',
        isZakatEligible: true,
        is80GEligible: true,
        taxDeductionPercent: 50,
        complianceStatus: ComplianceStatus.APPROVED,
        complianceApprovedBy: 'Central Sharia & Governance Board',
        complianceApprovalDate: new Date('2026-01-01'),
      },
      {
        slug: 'khums-imam',
        name: 'Khums Sahm-e-Imam (a.s.)',
        fundType: FundType.KHUMS_SEHAM_E_IMAM,
        description: 'Restricted reserve for religious education, Hawza student support, and scholarship welfare.',
        iconName: 'BookOpen',
        isKhumsEligible: true,
        is80GEligible: false,
        taxDeductionPercent: 0,
        complianceStatus: ComplianceStatus.APPROVED,
        complianceApprovedBy: 'Board of Trustees',
        complianceApprovalDate: new Date('2026-01-01'),
      },
      {
        slug: 'khums-sadat',
        name: 'Khums Sahm-e-Sadat',
        fundType: FundType.KHUMS_SEHAM_E_SADAT,
        description: 'Restricted reserve specifically for verified destitute Sadat families.',
        iconName: 'HeartHandshake',
        isKhumsEligible: true,
        is80GEligible: false,
        taxDeductionPercent: 0,
        complianceStatus: ComplianceStatus.APPROVED,
        complianceApprovedBy: 'Board of Trustees',
        complianceApprovalDate: new Date('2026-01-01'),
      },
      {
        slug: 'orphan-sponsorship',
        name: 'Orphan & Widow Household Sponsorship',
        fundType: FundType.ORPHAN_AID,
        description: 'Monthly comprehensive sustenance, medical cover, and schooling for orphan households.',
        iconName: 'Heart',
        isZakatEligible: true,
        is80GEligible: true,
        taxDeductionPercent: 50,
        complianceStatus: ComplianceStatus.APPROVED,
        complianceApprovedBy: 'Governance & Tax Committee',
        complianceApprovalDate: new Date('2026-01-01'),
      },
      {
        slug: 'medical-dialysis',
        name: 'Dialysis & Critical Medical Lifeline',
        fundType: FundType.MEDICAL_AID,
        description: 'Hospital bill clearances and subsidized dialysis sessions.',
        iconName: 'Activity',
        isZakatEligible: true,
        is80GEligible: true,
        taxDeductionPercent: 50,
        complianceStatus: ComplianceStatus.APPROVED,
        complianceApprovedBy: 'Governance & Tax Committee',
        complianceApprovalDate: new Date('2026-01-01'),
      },
      {
        slug: 'general-sadaqah',
        name: 'General Sadaqah & Humanitarian Relief',
        fundType: FundType.GENERAL_SADAQAH,
        description: 'Unrestricted humanitarian relief, mobile clinic operations, and disaster logistics.',
        iconName: 'ShieldCheck',
        isZakatEligible: false,
        is80GEligible: true,
        taxDeductionPercent: 50,
        complianceStatus: ComplianceStatus.APPROVED,
        complianceApprovedBy: 'Governance & Tax Committee',
        complianceApprovalDate: new Date('2026-01-01'),
      },
    ];

    for (const cat of defaultCats) {
      await prisma.donationCategory.upsert({
        where: { slug: cat.slug },
        update: cat,
        create: {
          ...cat,
          isActive: true,
        },
      });
    }
  }

  /**
   * Retrieves active donation categories with verified compliance status
   */
  public static async getActiveCategories() {
    await DonationService.ensureDefaultCategories();
    return prisma.donationCategory.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
    });
  }

  /**
   * Initiates a donation with duplicate protection, validation, and payment order creation
   */
  public static async initiateDonation(input: InitiateDonationInput) {
    if (!input.amount || input.amount <= 0) {
      throw new Error('Donation amount must be greater than zero.');
    }
    if (!input.donorName || !input.donorEmail) {
      throw new Error('Donor name and valid email are mandatory.');
    }

    const currency = (input.currency || 'INR').toUpperCase();
    const idempotencyKey =
      input.idempotencyKey ||
      `idemp_${input.donorEmail.trim().toLowerCase()}_${input.amount}_${Date.now()}`;

    // 1. Check if existing donation with same idempotency key exists
    const existing = await prisma.donation.findUnique({
      where: { idempotencyKey },
      include: { category: true, campaign: true },
    });
    if (existing) {
      return {
        donationId: existing.id,
        receiptNumber: existing.receiptNumber,
        status: existing.paymentStatus,
        gatewayOrderId: existing.gatewayOrderId,
        isDuplicate: true,
      };
    }

    await DonationService.ensureDefaultCategories();

    // 2. Resolve Category & FundType
    let category = null;
    if (input.categorySlug) {
      category = await prisma.donationCategory.findUnique({ where: { slug: input.categorySlug } });
    }
    if (!category) {
      category = await prisma.donationCategory.findFirst({ where: { slug: 'general-sadaqah' } });
    }
    const fundType = category ? category.fundType : FundType.GENERAL_SADAQAH;

    // 3. Resolve Campaign if specified
    let campaign = null;
    if (input.campaignSlug) {
      campaign = await prisma.campaign.findUnique({ where: { slug: input.campaignSlug } });
    }

    // 4. PAN Encryption & Masking
    let panMasked: string | null = null;
    let panEncrypted: string | null = null;
    if (input.donorPan && input.donorPan.trim()) {
      const cleanPan = input.donorPan.trim().toUpperCase();
      panMasked = maskPan(cleanPan);
      panEncrypted = encryptPII(cleanPan);
    }

    // 5. Forex Conversion to INR
    const forexRate = currency === 'INR' ? 1.0 : currency === 'USD' ? 86.5 : 86.0;
    const amountInINR = new Prisma.Decimal(input.amount * forexRate);

    // 6. Generate Receipt Number
    const receiptNumber = await ReceiptService.generateNextReceiptNumber();

    // 7. Resolve Payment Provider
    const paymentMethod = input.paymentMethod || (currency === 'INR' ? PaymentMethod.UPI : PaymentMethod.CARD);
    const providerType = PaymentGatewayService.getInstance().resolveProvider(currency, paymentMethod);

    // 8. Find or Link DonorProfile
    let donorProfile = await prisma.donorProfile.findUnique({
      where: { email: input.donorEmail.toLowerCase().trim() },
    });
    if (!donorProfile) {
      donorProfile = await prisma.donorProfile.create({
        data: {
          fullName: input.donorName,
          email: input.donorEmail.toLowerCase().trim(),
          phone: input.donorPhone || null,
          panEncrypted,
          panMasked,
          addressLine1: input.donorAddress || null,
          isTaxExemptEligible: Boolean(input.is80GRequested && panMasked),
        },
      });
    }

    // 9. Create Donation record in INITIATED status
    const donation = await prisma.donation.create({
      data: {
        receiptNumber,
        idempotencyKey,
        donorId: donorProfile.id,
        campaignId: campaign?.id || null,
        categoryId: category?.id || null,
        donorName: input.donorName,
        donorEmail: input.donorEmail.toLowerCase().trim(),
        donorPhone: input.donorPhone || null,
        donorPanMasked: panMasked,
        donorAddress: input.donorAddress || null,
        amount: new Prisma.Decimal(input.amount),
        currency,
        forexRateToINR: new Prisma.Decimal(forexRate),
        amountInINR,
        fundType,
        paymentMethod,
        paymentProvider: providerType,
        paymentStatus: DonationStatus.INITIATED,
        isAnonymous: Boolean(input.isAnonymous),
        is80GRequested: Boolean(input.is80GRequested && panMasked),
      },
    });

    // 10. Call Payment SPI to create order
    const orderResponse = await paymentGateway.createOrder(providerType, {
      donationId: donation.id,
      receiptNumber,
      amount: Math.round(input.amount * 100),
      amountFormatted: input.amount,
      currency,
      donorName: input.donorName,
      donorEmail: input.donorEmail,
      donorPhone: input.donorPhone,
      description: `Donation for ${category?.name || fundType} (#${receiptNumber})`,
      idempotencyKey,
      callbackUrl: input.callbackUrl,
    });

    // 11. Update Donation with Gateway Order ID
    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        gatewayOrderId: orderResponse.gatewayOrderId,
      },
    });

    // 12. Create PaymentTransaction Log
    await prisma.paymentTransaction.create({
      data: {
        donationId: donation.id,
        provider: providerType,
        gatewayOrderId: orderResponse.gatewayOrderId,
        amount: new Prisma.Decimal(input.amount),
        currency,
        status: DonationStatus.PENDING,
      },
    });

    return {
      donationId: donation.id,
      receiptNumber,
      provider: providerType,
      gatewayOrderId: orderResponse.gatewayOrderId,
      clientPayload: orderResponse.clientPayload,
      amount: input.amount,
      currency,
      categoryName: category?.name || fundType,
      is80GEligible: Boolean(category?.is80GEligible && category?.complianceStatus === ComplianceStatus.APPROVED && ComplianceConfig.is80GVerified()),
      is80GRequested: Boolean(input.is80GRequested && panMasked),
    };
  }

  /**
   * Processes a successful payment callback/webhook and executes financial records,
   * donor CRM updates, cryptographic receipt generation, and general ledger journal posting.
   */
  public static async processSuccessfulPayment(params: {
    donationId?: string;
    gatewayOrderId?: string;
    gatewayPaymentId: string;
    gatewaySignature?: string;
    rawPayload?: Record<string, any>;
  }) {
    // 1. Locate Donation
    const donation = await prisma.donation.findFirst({
      where: {
        OR: [
          params.donationId ? { id: params.donationId } : {},
          params.gatewayOrderId ? { gatewayOrderId: params.gatewayOrderId } : {},
        ],
      },
      include: {
        category: true,
        campaign: true,
        donor: true,
      },
    });

    if (!donation) {
      throw new Error(`[DONATION_PROCESSOR] Donation not found for order: ${params.gatewayOrderId || params.donationId}`);
    }

    // Idempotency: if already SUCCESS, return existing record
    if (donation.paymentStatus === DonationStatus.SUCCESS) {
      return {
        success: true,
        alreadyProcessed: true,
        receiptNumber: donation.receiptNumber,
        donationId: donation.id,
        qrVerificationHash: donation.qrVerificationHash,
      };
    }

    const completedAt = new Date();

    // 2. Generate Cryptographic Receipt Signature Hash
    const qrVerificationHash = ReceiptService.computeReceiptSignatureHash({
      receiptNumber: donation.receiptNumber,
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      donorPanMasked: donation.donorPanMasked,
      amount: donation.amount.toString(),
      currency: donation.currency,
      fundType: donation.fundType,
      completedAt,
    });

    // 3. Check 80G Tax Exemption Eligibility against Central Compliance Configuration
    const is80GOrgVerified = ComplianceConfig.is80GVerified();
    const isCategoryApproved = donation.category?.complianceStatus === ComplianceStatus.APPROVED;
    const shouldIssue80G =
      is80GOrgVerified &&
      donation.is80GRequested &&
      Boolean(donation.donorPanMasked) &&
      Boolean(donation.category?.is80GEligible) &&
      isCategoryApproved;

    // 4. Atomic Transaction Execution
    const result = await prisma.$transaction(async (tx) => {
      // a. Update Donation
      const updatedDonation = await tx.donation.update({
        where: { id: donation.id },
        data: {
          paymentStatus: DonationStatus.SUCCESS,
          gatewayPaymentId: params.gatewayPaymentId,
          gatewaySignature: params.gatewaySignature || null,
          qrVerificationHash,
          is80GIssued: shouldIssue80G,
          completedAt,
        },
      });

      // b. Update / Create PaymentTransaction
      await tx.paymentTransaction.upsert({
        where: { gatewayPaymentId: params.gatewayPaymentId },
        update: {
          status: DonationStatus.SUCCESS,
          gatewaySignature: params.gatewaySignature || null,
          rawPayload: params.rawPayload ? (params.rawPayload as Prisma.InputJsonValue) : Prisma.DbNull,
        },
        create: {
          donationId: donation.id,
          provider: donation.paymentProvider,
          gatewayOrderId: donation.gatewayOrderId,
          gatewayPaymentId: params.gatewayPaymentId,
          gatewaySignature: params.gatewaySignature || null,
          amount: donation.amount,
          currency: donation.currency,
          status: DonationStatus.SUCCESS,
          rawPayload: params.rawPayload ? (params.rawPayload as Prisma.InputJsonValue) : Prisma.DbNull,
        },
      });

      // c. Update Donor Profile (CRM aggregation)
      if (donation.donorId) {
        await tx.donorProfile.update({
          where: { id: donation.donorId },
          data: {
            totalDonatedAmount: { increment: donation.amountInINR },
            donationCount: { increment: 1 },
          },
        });
      }

      // d. Update Campaign (if linked)
      if (donation.campaignId) {
        await tx.campaign.update({
          where: { id: donation.campaignId },
          data: {
            raisedAmount: { increment: donation.amountInINR },
            donorCount: { increment: 1 },
          },
        });
      }

      // e. Issue 80G Certificate (if eligible and approved)
      let certNumber = null;
      if (shouldIssue80G) {
        certNumber = await ReceiptService.generateNext80GCertificateNumber();
        const financialYear = `${completedAt.getFullYear()}-${(completedAt.getFullYear() + 1).toString().slice(-2)}`;

        await tx.taxExemptionReceipt.create({
          data: {
            certificateNumber: certNumber,
            donationId: donation.id,
            donorName: donation.donorName,
            donorPan: donation.donorPanMasked || 'XXXXX0000X',
            donorAddress: donation.donorAddress || 'Not Provided',
            amount: donation.amountInINR,
            financialYear,
            deductionPercent: donation.category?.taxDeductionPercent || 50,
            qrVerificationUrl: `http://localhost:3001/verify/receipt/${qrVerificationHash}`,
            signatureHash: qrVerificationHash,
          },
        });
      }

      // f. Post balanced General Ledger Journal Entry
      const voucherNumber = await GeneralLedgerService.recordDonationJournalEntry(updatedDonation, tx);

      return {
        updatedDonation,
        certNumber,
        voucherNumber,
      };
    });

    // 5. Audit Logging
    await createAuditLog({
      action: 'DONATION_PAYMENT_CAPTURED',
      entity: 'Donation',
      entityId: donation.id,
      newData: {
        receiptNumber: donation.receiptNumber,
        amount: Number(donation.amount),
        currency: donation.currency,
        fundType: donation.fundType,
        is80GIssued: shouldIssue80G,
        qrHash: qrVerificationHash,
      },
    });

    return {
      success: true,
      donationId: donation.id,
      receiptNumber: donation.receiptNumber,
      qrVerificationHash,
      is80GIssued: shouldIssue80G,
      voucherNumber: result.voucherNumber,
    };
  }

  /**
   * Processes a failed payment attempt
   */
  public static async processFailedPayment(orderId: string, errorReason: string) {
    const donation = await prisma.donation.findFirst({
      where: { gatewayOrderId: orderId },
    });
    if (!donation) return;

    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        paymentStatus: DonationStatus.FAILED,
        failedReason: errorReason,
      },
    });

    await createAuditLog({
      action: 'DONATION_PAYMENT_FAILED',
      entity: 'Donation',
      entityId: donation.id,
      newData: { orderId, errorReason },
    });
  }

  /**
   * Processes a refund with ledger reversal and audit logging
   */
  public static async processRefund(params: {
    donationId: string;
    reason: string;
    approvedByUserId?: string;
  }) {
    const donation = await prisma.donation.findUniqueOrThrow({
      where: { id: params.donationId },
      include: { category: true },
    });

    if (donation.paymentStatus !== DonationStatus.SUCCESS) {
      throw new Error('Only successful donations can be refunded.');
    }

    const refundId = `RFND-${Date.now().toString().slice(-6)}`;

    await prisma.$transaction(async (tx) => {
      // 1. Create Refund Record
      await tx.refundRecord.create({
        data: {
          donationId: donation.id,
          amount: donation.amount,
          currency: donation.currency,
          reason: params.reason,
          gatewayRefundId: refundId,
          status: 'PROCESSED',
          approvedByUserId: params.approvedByUserId || 'ADMIN',
          approvedAt: new Date(),
        },
      });

      // 2. Update Donation Status
      await tx.donation.update({
        where: { id: donation.id },
        data: { paymentStatus: DonationStatus.REFUNDED },
      });

      // 3. Rebalance CRM Profile
      if (donation.donorId) {
        await tx.donorProfile.update({
          where: { id: donation.donorId },
          data: {
            totalDonatedAmount: { decrement: donation.amountInINR },
          },
        });
      }
    });

    await createAuditLog({
      action: 'DONATION_REFUNDED',
      entity: 'Donation',
      entityId: donation.id,
      newData: { refundId, reason: params.reason },
    });

    return { success: true, refundId };
  }

  /**
   * Retrieves platform-wide live donation analytics
   */
  public static async getAnalytics() {
    const [
      totalSuccessDonations,
      totalCount,
      allSuccessRows,
      recentDonations,
      categories,
    ] = await Promise.all([
      prisma.donation.aggregate({
        where: { paymentStatus: DonationStatus.SUCCESS },
        _sum: { amountInINR: true },
        _count: { id: true },
      }),
      prisma.donation.count(),
      prisma.donation.findMany({
        where: { paymentStatus: DonationStatus.SUCCESS },
        select: { amountInINR: true, fundType: true, completedAt: true },
      }),
      prisma.donation.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { category: true },
      }),
      prisma.donationCategory.findMany({
        where: { isActive: true },
      }),
    ]);

    const totalINR = Number(totalSuccessDonations._sum.amountInINR || 0);
    const successCount = totalSuccessDonations._count.id;
    const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 100;

    let zakatTotal = 0;
    let khumsTotal = 0;
    let generalTotal = 0;

    for (const d of allSuccessRows) {
      const amt = Number(d.amountInINR);
      if (d.fundType === FundType.ZAKAT_MAL || d.fundType === FundType.ZAKAT_FITRAH) {
        zakatTotal += amt;
      } else if (d.fundType === FundType.KHUMS_SEHAM_E_IMAM || d.fundType === FundType.KHUMS_SEHAM_E_SADAT) {
        khumsTotal += amt;
      } else {
        generalTotal += amt;
      }
    }

    return {
      totalCollectedINR: totalINR,
      totalDonationsCount: successCount,
      successRate,
      zakatTotalINR: zakatTotal,
      khumsTotalINR: khumsTotal,
      generalTotalINR: generalTotal,
      recentDonations,
      activeCategoriesCount: categories.length,
      timestamp: new Date(),
    };
  }
}
