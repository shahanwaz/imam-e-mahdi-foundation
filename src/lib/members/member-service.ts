import { prisma } from '@/lib/db';
import { MembershipType, MembershipStatus, CertificateType, Prisma } from '@prisma/client';
import { generateHmacSignature } from '@/lib/crypto';
import { createAuditLog } from '@/lib/audit';
import { DocumentService } from '@/lib/documents/document-service';

export interface RegisterMemberInput {
  fullName: string;
  email: string;
  phone: string;
  gender?: string;
  dateOfBirth?: Date | string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  membershipType?: MembershipType;
  userId?: string;
  notes?: string;
}

export interface RenewMemberInput {
  memberId: string;
  yearsToExtend?: number;
  amountPaid?: number;
  currency?: string;
  paymentMethod?: any;
  paymentReference?: string;
  renewedBy?: string;
  notes?: string;
}

export class MemberService {
  /**
   * Generates sequential membership ID (e.g. IMF-MEM-2026-00015)
   */
  public static async generateNextMemberNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.memberProfile.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-MEM-${year}-${sequence}`;
  }

  /**
   * Computes tamper-proof HMAC-SHA256 signature hash for a member's digital ID card
   */
  public static computeMemberQrHash(params: {
    membershipNumber: string;
    fullName: string;
    email: string;
    membershipType: string;
    startDate: Date;
    endDate: Date;
  }): string {
    const payload = [
      params.membershipNumber,
      params.fullName.trim(),
      params.email.toLowerCase().trim(),
      params.membershipType,
      params.startDate.toISOString(),
      params.endDate.toISOString(),
    ].join('|');

    return generateHmacSignature(payload);
  }

  /**
   * Registers a new member, generates sequential ID, digital card QR hash, and initial certificate
   */
  public static async registerMember(input: RegisterMemberInput) {
    if (!input.fullName || input.fullName.trim().length < 2) {
      throw new Error('Full legal name is mandatory for membership registration.');
    }
    if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      throw new Error('A valid email address is mandatory.');
    }
    if (!input.phone || input.phone.trim().length < 8) {
      throw new Error('A valid contact phone number is mandatory.');
    }

    const cleanEmail = input.email.toLowerCase().trim();

    // Check duplicate
    const existing = await prisma.memberProfile.findFirst({
      where: { email: cleanEmail },
    });
    if (existing) {
      throw new Error(`A membership profile with email ${cleanEmail} already exists (#${existing.membershipNumber}).`);
    }

    const membershipNumber = await MemberService.generateNextMemberNumber();
    const membershipType = input.membershipType || MembershipType.ANNUAL;
    const startDate = new Date();

    // Compute validity end date
    const endDate = new Date(startDate);
    if (membershipType === MembershipType.LIFETIME || membershipType === MembershipType.HONORARY) {
      endDate.setFullYear(endDate.getFullYear() + 99);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year standard
    }

    const qrVerificationHash = MemberService.computeMemberQrHash({
      membershipNumber,
      fullName: input.fullName,
      email: cleanEmail,
      membershipType,
      startDate,
      endDate,
    });

    const digitalCardUrl = `http://localhost:3001/verify/member/${qrVerificationHash}`;

    // Create Member Record in DB
    const member = await prisma.memberProfile.create({
      data: {
        membershipNumber,
        userId: input.userId || null,
        fullName: input.fullName.trim(),
        email: cleanEmail,
        phone: input.phone.trim(),
        gender: input.gender || null,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        addressLine1: input.addressLine1 || null,
        addressLine2: input.addressLine2 || null,
        city: input.city.trim(),
        state: input.state || null,
        postalCode: input.postalCode || null,
        country: input.country || 'India',
        membershipType,
        status: MembershipStatus.ACTIVE,
        startDate,
        endDate,
        digitalCardUrl,
        qrVerificationHash,
        notes: input.notes || null,
      },
    });

    // Automatically issue Official Membership Certificate
    await DocumentService.issueCertificate({
      certificateType: CertificateType.MEMBERSHIP_CERTIFICATE,
      recipientName: member.fullName,
      recipientEmail: member.email,
      memberId: member.id,
      title: `Certificate of ${membershipType} Membership`,
      description: `In recognition of dedicated support and official enrollment as an esteemed ${membershipType} Member of the Imam E Mahdi Foundation.`,
      expiresAt: member.endDate,
    });

    // Audit log
    await createAuditLog({
      action: 'MEMBER_REGISTERED',
      entity: 'MemberProfile',
      entityId: member.id,
      newData: {
        membershipNumber,
        membershipType,
        email: cleanEmail,
        fullName: input.fullName,
      },
    });

    return member;
  }

  /**
   * Renews an existing membership and logs renewal history
   */
  public static async renewMembership(input: RenewMemberInput) {
    const member = await prisma.memberProfile.findUniqueOrThrow({
      where: { id: input.memberId },
    });

    const years = input.yearsToExtend || 1;
    const previousEndDate = new Date(member.endDate);
    const newEndDate = new Date(Math.max(previousEndDate.getTime(), Date.now()));
    newEndDate.setFullYear(newEndDate.getFullYear() + years);

    const updatedQrHash = MemberService.computeMemberQrHash({
      membershipNumber: member.membershipNumber,
      fullName: member.fullName,
      email: member.email,
      membershipType: member.membershipType,
      startDate: member.startDate,
      endDate: newEndDate,
    });

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Create Renewal Record
      await tx.membershipRenewalRecord.create({
        data: {
          memberId: member.id,
          previousEndDate,
          newEndDate,
          amountPaid: new Prisma.Decimal(input.amountPaid || 0),
          currency: input.currency || 'INR',
          paymentMethod: input.paymentMethod || 'UPI',
          paymentReference: input.paymentReference || null,
          renewedBy: input.renewedBy || 'ADMIN',
          notes: input.notes || null,
        },
      });

      // 2. Update Member Profile
      return tx.memberProfile.update({
        where: { id: member.id },
        data: {
          endDate: newEndDate,
          status: MembershipStatus.ACTIVE,
          renewedAt: new Date(),
          renewalCount: { increment: 1 },
          qrVerificationHash: updatedQrHash,
          digitalCardUrl: `http://localhost:3001/verify/member/${updatedQrHash}`,
        },
      });
    });

    await createAuditLog({
      action: 'MEMBER_RENEWED',
      entity: 'MemberProfile',
      entityId: member.id,
      newData: {
        membershipNumber: member.membershipNumber,
        previousEndDate,
        newEndDate,
        renewalCount: updated.renewalCount,
      },
    });

    return updated;
  }

  /**
   * Updates a member's status (ACTIVE, SUSPENDED, EXPIRED, LAPSED)
   */
  public static async updateMemberStatus(memberId: string, status: MembershipStatus, reason?: string) {
    const updated = await prisma.memberProfile.update({
      where: { id: memberId },
      data: { status },
    });

    await createAuditLog({
      action: 'MEMBER_STATUS_UPDATED',
      entity: 'MemberProfile',
      entityId: memberId,
      newData: { status, reason },
    });

    return updated;
  }

  /**
   * Retrieves single member profile with digital card, certificates, and renewal history
   */
  public static async getMemberProfile(idOrNumber: string) {
    return prisma.memberProfile.findFirst({
      where: {
        OR: [
          { id: idOrNumber },
          { membershipNumber: idOrNumber },
          { qrVerificationHash: idOrNumber },
        ],
      },
      include: {
        renewals: {
          orderBy: { createdAt: 'desc' },
        },
        certificates: {
          orderBy: { issuedAt: 'desc' },
        },
      },
    });
  }

  /**
   * Lists members with filtering and pagination
   */
  public static async listMembers(params: {
    page?: number;
    limit?: number;
    search?: string;
    membershipType?: string;
    status?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const search = params.search?.trim() || '';

    const where: any = {
      ...(params.membershipType ? { membershipType: params.membershipType as any } : {}),
      ...(params.status ? { status: params.status as any } : {}),
      ...(search
        ? {
            OR: [
              { membershipNumber: { contains: search, mode: 'insensitive' } },
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [totalRecords, members] = await Promise.all([
      prisma.memberProfile.count({ where }),
      prisma.memberProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          certificates: { take: 1, orderBy: { issuedAt: 'desc' } },
        },
      }),
    ]);

    return {
      members,
      meta: {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  /**
   * Retrieves high-level Member KPI statistics
   */
  public static async getMemberAnalytics() {
    const [totalCount, activeCount, expiredCount, lifetimeCount, renewalsCount] = await Promise.all([
      prisma.memberProfile.count(),
      prisma.memberProfile.count({ where: { status: MembershipStatus.ACTIVE } }),
      prisma.memberProfile.count({ where: { status: MembershipStatus.EXPIRED } }),
      prisma.memberProfile.count({ where: { membershipType: MembershipType.LIFETIME } }),
      prisma.membershipRenewalRecord.count(),
    ]);

    return {
      totalMembers: totalCount,
      activeMembers: activeCount,
      expiredMembers: expiredCount,
      lifetimePatrons: lifetimeCount,
      totalRenewalsProcessed: renewalsCount,
    };
  }
}
