import { prisma } from '@/lib/db';
import {
  BeneficiaryCategory,
  VulnerabilityTier,
  BeneficiaryVerificationStatus,
  AssistanceType,
  Prisma,
} from '@prisma/client';
import { encryptPII, decryptPII, maskSensitiveId } from '@/lib/crypto';
import { createAuditLog } from '@/lib/audit';

export interface EnrollBeneficiaryInput {
  fullName: string;
  gender: string;
  dateOfBirth?: Date | string;
  phone?: string;
  city: string;
  district?: string;
  state?: string;
  country?: string;
  addressLine?: string;
  category: BeneficiaryCategory;
  
  // Sensitive PII
  nationalId?: string; // e.g. Aadhaar / Voter ID
  rationCardNumber?: string;
  bankAccountNumber?: string;
  ifscCode?: string;

  // Household & Socioeconomic Factors
  householdMemberCount: number;
  monthlyIncomeINR: number;
  primaryNeedSummary: string;
  estimatedAidRequiredINR: number;

  hasDisabledMember?: boolean;
  isOrphanOrWidow?: boolean;
  hasChronicIllness?: boolean;
  notes?: string;
}

export interface DisburseAssistanceInput {
  beneficiaryId: string;
  projectId?: string;
  assistanceType: AssistanceType;
  amountINR: number;
  itemDescription: string;
  disbursementDate?: Date | string;
  disbursedByUserId?: string;
  paymentReference?: string;
  receiptReference?: string;
  notes?: string;
}

export interface RecordFollowUpInput {
  beneficiaryId: string;
  officerUserId?: string;
  findingsNotes: string;
  socioeconomicOutcome: string;
  nextFollowUpDate?: Date | string;
}

export class BeneficiaryService {
  /**
   * Generates sequential beneficiary ID (e.g. IMF-BEN-2026-00045)
   */
  public static async generateNextBeneficiaryNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.beneficiaryProfile.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-BEN-${year}-${sequence}`;
  }

  /**
   * Generates sequential assistance record ID (e.g. IMF-AID-2026-00120)
   */
  public static async generateNextAssistanceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.beneficiaryAssistance.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-AID-${year}-${sequence}`;
  }

  /**
   * Computes Vulnerability Index Score (1-100) and assigns tier
   */
  public static calculateVulnerabilityIndex(params: {
    monthlyIncomeINR: number;
    householdMemberCount: number;
    category: BeneficiaryCategory;
    hasDisabledMember?: boolean;
    isOrphanOrWidow?: boolean;
    hasChronicIllness?: boolean;
  }): { score: number; tier: VulnerabilityTier } {
    let score = 20; // Base score

    // Income per capita factor (Max 35 pts)
    const perCapitaIncome = params.monthlyIncomeINR / Math.max(1, params.householdMemberCount);
    if (perCapitaIncome <= 1500) {
      score += 35;
    } else if (perCapitaIncome <= 3000) {
      score += 25;
    } else if (perCapitaIncome <= 6000) {
      score += 15;
    } else {
      score += 5;
    }

    // High vulnerability categories (Max 25 pts)
    if (
      params.category === BeneficiaryCategory.ORPHAN_SUPPORT ||
      params.category === BeneficiaryCategory.WIDOW_ASSISTANCE ||
      params.isOrphanOrWidow
    ) {
      score += 20;
    }
    if (
      params.category === BeneficiaryCategory.MEDICAL_EMERGENCY ||
      params.hasChronicIllness
    ) {
      score += 15;
    }
    if (
      params.category === BeneficiaryCategory.DISABILITY_SUPPORT ||
      params.hasDisabledMember
    ) {
      score += 15;
    }

    // Household burden (Max 15 pts)
    if (params.householdMemberCount >= 6) {
      score += 15;
    } else if (params.householdMemberCount >= 4) {
      score += 10;
    }

    // Clamp score to 1-100
    const finalScore = Math.min(100, Math.max(1, score));

    let tier: VulnerabilityTier = VulnerabilityTier.MODERATE;
    if (finalScore >= 80) {
      tier = VulnerabilityTier.CRITICAL_URGENT;
    } else if (finalScore >= 60) {
      tier = VulnerabilityTier.HIGH_PRIORITY;
    } else if (finalScore >= 40) {
      tier = VulnerabilityTier.MODERATE;
    } else {
      tier = VulnerabilityTier.STABLE_MONITORING;
    }

    return { score: finalScore, tier };
  }

  /**
   * Enrolls a new beneficiary with encrypted AES-256 PII storage
   */
  public static async enrollBeneficiary(input: EnrollBeneficiaryInput) {
    if (!input.fullName || input.fullName.trim().length < 2) {
      throw new Error('Beneficiary full name is mandatory.');
    }
    if (!input.city || input.city.trim().length < 2) {
      throw new Error('City / District location is mandatory.');
    }

    const beneficiaryNumber = await BeneficiaryService.generateNextBeneficiaryNumber();

    const { score: vulnerabilityScore, tier: vulnerabilityTier } =
      BeneficiaryService.calculateVulnerabilityIndex({
        monthlyIncomeINR: input.monthlyIncomeINR || 0,
        householdMemberCount: input.householdMemberCount || 1,
        category: input.category,
        hasDisabledMember: input.hasDisabledMember,
        isOrphanOrWidow: input.isOrphanOrWidow,
        hasChronicIllness: input.hasChronicIllness,
      });

    // Encrypt sensitive PII with AES-256-GCM
    const encryptedNationalId = input.nationalId ? encryptPII(input.nationalId.trim()) : null;
    const nationalIdMasked = input.nationalId ? maskSensitiveId(input.nationalId.trim()) : null;

    const encryptedRationCard = input.rationCardNumber ? encryptPII(input.rationCardNumber.trim()) : null;
    const rationCardMasked = input.rationCardNumber ? maskSensitiveId(input.rationCardNumber.trim()) : null;

    const encryptedBankAccount = input.bankAccountNumber ? encryptPII(input.bankAccountNumber.trim()) : null;
    const bankAccountMasked = input.bankAccountNumber ? maskSensitiveId(input.bankAccountNumber.trim()) : null;

    const encryptedIfscCode = input.ifscCode ? encryptPII(input.ifscCode.trim()) : null;

    const beneficiary = await prisma.beneficiaryProfile.create({
      data: {
        beneficiaryNumber,
        fullName: input.fullName.trim(),
        gender: input.gender,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        phone: input.phone ? input.phone.trim() : null,
        city: input.city.trim(),
        district: input.district || null,
        state: input.state || null,
        country: input.country || 'India',
        addressLine: input.addressLine || null,
        category: input.category,
        vulnerabilityTier,
        vulnerabilityScore,
        verificationStatus: BeneficiaryVerificationStatus.PENDING_VERIFICATION,
        encryptedNationalId,
        nationalIdMasked,
        encryptedRationCard,
        rationCardMasked,
        encryptedBankAccount,
        bankAccountMasked,
        encryptedIfscCode,
        householdMemberCount: input.householdMemberCount || 1,
        monthlyIncomeINR: new Prisma.Decimal(input.monthlyIncomeINR || 0),
        primaryNeedSummary: input.primaryNeedSummary.trim(),
        estimatedAidRequiredINR: new Prisma.Decimal(input.estimatedAidRequiredINR || 0),
        notes: input.notes || null,
      },
    });

    await createAuditLog({
      action: 'BENEFICIARY_ENROLLED',
      entity: 'BeneficiaryProfile',
      entityId: beneficiary.id,
      newData: {
        beneficiaryNumber,
        fullName: input.fullName,
        category: input.category,
        vulnerabilityScore,
        vulnerabilityTier,
      },
    });

    return beneficiary;
  }

  /**
   * Disburses aid/grant assistance and logs sequential assistance voucher
   */
  public static async disburseAssistance(input: DisburseAssistanceInput) {
    if (!input.amountINR || input.amountINR <= 0) {
      throw new Error('Assistance disbursement amount must be positive.');
    }
    if (!input.itemDescription || input.itemDescription.trim().length < 3) {
      throw new Error('Description of aid distributed is required.');
    }

    const beneficiary = await prisma.beneficiaryProfile.findUniqueOrThrow({
      where: { id: input.beneficiaryId },
    });

    const assistanceNumber = await BeneficiaryService.generateNextAssistanceNumber();

    const record = await prisma.$transaction(async (tx) => {
      // 1. Create Assistance Record
      const aid = await tx.beneficiaryAssistance.create({
        data: {
          assistanceNumber,
          beneficiaryId: beneficiary.id,
          projectId: input.projectId || null,
          assistanceType: input.assistanceType,
          amountINR: new Prisma.Decimal(input.amountINR),
          itemDescription: input.itemDescription.trim(),
          disbursementDate: input.disbursementDate ? new Date(input.disbursementDate) : new Date(),
          disbursedByUserId: input.disbursedByUserId || null,
          paymentReference: input.paymentReference || null,
          receiptReference: input.receiptReference || null,
          status: 'DISBURSED',
          notes: input.notes || null,
        },
      });

      // 2. Increment project disbursed amount if linked
      if (input.projectId) {
        await tx.project.update({
          where: { id: input.projectId },
          data: {
            disbursedAmountINR: { increment: new Prisma.Decimal(input.amountINR) },
            actualBeneficiariesCount: { increment: 1 },
          },
        });
      }

      return aid;
    });

    await createAuditLog({
      action: 'ASSISTANCE_DISBURSED',
      entity: 'BeneficiaryAssistance',
      entityId: record.id,
      newData: {
        assistanceNumber,
        beneficiaryNumber: beneficiary.beneficiaryNumber,
        amount: input.amountINR,
        type: input.assistanceType,
      },
    });

    return record;
  }

  /**
   * Records a follow-up visit note and socioeconomic outcome evaluation
   */
  public static async recordFollowUp(input: RecordFollowUpInput) {
    const followUp = await prisma.beneficiaryFollowUp.create({
      data: {
        beneficiaryId: input.beneficiaryId,
        officerUserId: input.officerUserId || null,
        findingsNotes: input.findingsNotes.trim(),
        socioeconomicOutcome: input.socioeconomicOutcome.trim(),
        nextFollowUpDate: input.nextFollowUpDate ? new Date(input.nextFollowUpDate) : null,
      },
    });

    return followUp;
  }

  /**
   * Retrieves single beneficiary profile with selective PII decryption based on user permissions
   */
  public static async getBeneficiary(
    idOrNumber: string,
    options: { canReadSensitivePII?: boolean; actorUserId?: string } = {}
  ) {
    const beneficiary = await prisma.beneficiaryProfile.findFirst({
      where: {
        OR: [{ id: idOrNumber }, { beneficiaryNumber: idOrNumber }],
      },
      include: {
        familyMembers: true,
        documents: true,
        assistanceRecords: { orderBy: { disbursementDate: 'desc' } },
        followUps: { orderBy: { followUpDate: 'desc' } },
        fieldVisits: { orderBy: { scheduledDate: 'desc' } },
      },
    });

    if (!beneficiary) return null;

    // Log PII decryption access if authorized
    if (options.canReadSensitivePII) {
      await createAuditLog({
        action: 'SENSITIVE_PII_ACCESSED',
        entity: 'BeneficiaryProfile',
        entityId: beneficiary.id,
        userId: options.actorUserId || 'SYSTEM',
        newData: {
          beneficiaryNumber: beneficiary.beneficiaryNumber,
          accessedFields: ['nationalId', 'rationCard', 'bankAccount', 'ifscCode'],
        },
      });

      return {
        ...beneficiary,
        decryptedNationalId: beneficiary.encryptedNationalId ? decryptPII(beneficiary.encryptedNationalId) : null,
        decryptedRationCard: beneficiary.encryptedRationCard ? decryptPII(beneficiary.encryptedRationCard) : null,
        decryptedBankAccount: beneficiary.encryptedBankAccount ? decryptPII(beneficiary.encryptedBankAccount) : null,
        decryptedIfscCode: beneficiary.encryptedIfscCode ? decryptPII(beneficiary.encryptedIfscCode) : null,
      };
    }

    // Return masked PII version
    return {
      ...beneficiary,
      encryptedNationalId: undefined,
      encryptedRationCard: undefined,
      encryptedBankAccount: undefined,
      encryptedIfscCode: undefined,
    };
  }

  /**
   * Lists beneficiaries with filtering and masked PII
   */
  public static async listBeneficiaries(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    vulnerabilityTier?: string;
    verificationStatus?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const search = params.search?.trim() || '';

    const where: any = {
      ...(params.category ? { category: params.category as BeneficiaryCategory } : {}),
      ...(params.vulnerabilityTier ? { vulnerabilityTier: params.vulnerabilityTier as VulnerabilityTier } : {}),
      ...(params.verificationStatus
        ? { verificationStatus: params.verificationStatus as BeneficiaryVerificationStatus }
        : {}),
      ...(search
        ? {
            OR: [
              { beneficiaryNumber: { contains: search, mode: 'insensitive' } },
              { fullName: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
              { nationalIdMasked: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [totalRecords, beneficiaries] = await Promise.all([
      prisma.beneficiaryProfile.count({ where }),
      prisma.beneficiaryProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { vulnerabilityScore: 'desc' },
        include: {
          assistanceRecords: { select: { amountINR: true } },
          _count: { select: { familyMembers: true, assistanceRecords: true } },
        },
      }),
    ]);

    // Strip raw cipherText from list output
    const safeBeneficiaries = beneficiaries.map((b) => ({
      ...b,
      encryptedNationalId: undefined,
      encryptedRationCard: undefined,
      encryptedBankAccount: undefined,
      encryptedIfscCode: undefined,
    }));

    return {
      beneficiaries: safeBeneficiaries,
      meta: {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  /**
   * Aggregates executive beneficiary metrics
   */
  public static async getBeneficiaryAnalytics() {
    const [
      totalBeneficiaries,
      criticalCount,
      verifiedCount,
      aidAggregates,
    ] = await Promise.all([
      prisma.beneficiaryProfile.count(),
      prisma.beneficiaryProfile.count({ where: { vulnerabilityTier: VulnerabilityTier.CRITICAL_URGENT } }),
      prisma.beneficiaryProfile.count({ where: { verificationStatus: BeneficiaryVerificationStatus.APPROVED } }),
      prisma.beneficiaryAssistance.aggregate({
        _sum: { amountINR: true },
        _count: { id: true },
      }),
    ]);

    return {
      totalBeneficiaries,
      criticalUrgentBeneficiaries: criticalCount,
      approvedVerifiedBeneficiaries: verifiedCount,
      totalAssistanceDisbursedINR: Number(aidAggregates._sum.amountINR || 0),
      totalAssistanceTransactions: aidAggregates._count.id,
    };
  }
}
