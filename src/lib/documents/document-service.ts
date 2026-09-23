import { prisma } from '@/lib/db';
import { DocumentType, DocumentStatus, CertificateType } from '@prisma/client';
import { QrService } from '@/lib/qr/qr-service';
import { renderDocumentHtml, DocumentRenderContext } from './document-templates';
import { createAuditLog } from '@/lib/audit';

export interface SignatoryInfo {
  name: string;
  title: string;
  role?: string;
  signatureDate?: string;
}

export interface GenerateDocumentInput {
  documentType: DocumentType;
  title?: string;
  templateVersion?: string;
  recipientName: string;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
  metadata?: Record<string, any>;
  signatories?: SignatoryInfo[];
  expiresAt?: Date | null;
  createdById?: string;
  
  // Cross-link references
  donationId?: string;
  memberProfileId?: string;
  volunteerProfileId?: string;
  employeeProfileId?: string;
  payslipId?: string;
  projectId?: string;
}

export interface CreateCertificateParams {
  certificateType: CertificateType;
  recipientName: string;
  recipientEmail: string;
  memberId?: string;
  volunteerId?: string;
  title: string;
  description: string;
  signatoryName?: string;
  signatoryTitle?: string;
  expiresAt?: Date | null;
}

/**
 * ONE Centralized Document Engine
 * Central orchestrator for all 12 document categories, cryptographic signatures, QR synthesis, and universal verification.
 */
export class DocumentService {
  /**
   * Generates sequential certificate serial number (e.g. IMF-CERT-2026-00012)
   */
  public static async generateNextCertificateNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = prisma.officialCertificate?.count ? await prisma.officialCertificate.count() : 0;
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-CERT-${year}-${sequence}`;
  }

  /**
   * Computes tamper-proof HMAC-SHA256 signature hash for an official certificate
   */
  public static computeCertificateHash(params: {
    certificateNumber: string;
    certificateType: string;
    recipientName: string;
    recipientEmail: string;
    title: string;
    issuedAt: Date;
  }): string {
    const payload = [
      params.certificateNumber,
      params.certificateType,
      params.recipientName.trim(),
      params.recipientEmail.toLowerCase().trim(),
      params.title.trim(),
      params.issuedAt.toISOString(),
    ].join('|');

    return QrService.computeDocumentHash({
      documentNumber: params.certificateNumber,
      documentType: params.certificateType as any,
      recipientName: params.recipientName,
      templateVersion: '1.0.0',
      issuedAt: params.issuedAt,
    });
  }

  /**
   * Generates sequential, domain-specific document numbers
   */
  public static async generateNextDocumentNumber(type: DocumentType): Promise<string> {
    const year = new Date().getFullYear();
    const count = prisma.generatedDocument?.count
      ? await prisma.generatedDocument.count({ where: { documentType: type } })
      : 0;
    const sequence = (count + 1).toString().padStart(5, '0');

    switch (type) {
      case DocumentType.DONATION_RECEIPT:
        return `IMF-REC-${year}-${sequence}`;
      case DocumentType.MEMBER_ID:
        return `IMF-MEM-${year}-${sequence}`;
      case DocumentType.EMPLOYEE_ID:
        return `IMF-EMP-${year}-${sequence}`;
      case DocumentType.MEMBERSHIP_CERTIFICATE:
        return `IMF-CERT-${year}-${sequence}`;
      case DocumentType.VOLUNTEER_CERTIFICATE:
        return `IMF-CERT-${year}-${sequence}`;
      case DocumentType.APPRECIATION_CERTIFICATE:
        return `IMF-CERT-${year}-${sequence}`;
      case DocumentType.APPOINTMENT_LETTER:
        return `IMF-APT-${year}-${sequence}`;
      case DocumentType.OFFER_LETTER:
        return `IMF-OFF-${year}-${sequence}`;
      case DocumentType.PAYSLIP:
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        return `IMF-PSL-${year}${month}-${sequence}`;
      case DocumentType.DONATION_STATEMENT:
        return `IMF-STM-${year}-${sequence}`;
      case DocumentType.PROJECT_REPORT:
        return `IMF-RPT-${year}-${sequence}`;
      case DocumentType.IMPACT_REPORT:
        return `IMF-IMP-${year}-${sequence}`;
      default:
        return `IMF-DOC-${year}-${sequence}`;
    }
  }

  /**
   * Generates, cryptographically signs, renders, and stores any document across all 12 categories
   */
  public static async generateDocument(input: GenerateDocumentInput) {
    const templateVersion = input.templateVersion || '1.0.0';
    const documentNumber = await this.generateNextDocumentNumber(input.documentType);
    const issuedAt = new Date();
    const formattedDate = issuedAt.toISOString().split('T')[0];

    // Compute cryptographic signature
    const signatureHash = QrService.computeDocumentHash({
      documentNumber,
      documentType: input.documentType,
      recipientName: input.recipientName,
      templateVersion,
      issuedAt,
      metadataSummary: JSON.stringify(input.metadata || {}),
    });

    const qrVerificationUrl = QrService.getVerificationUrl(signatureHash);
    const qrCodeSvg = QrService.generateQrSvg(qrVerificationUrl, {
      title: `${input.documentType} Verification - ${documentNumber}`,
      size: 150,
    });

    const defaultTitle = input.title || input.documentType.replace(/_/g, ' ');
    const signatories: SignatoryInfo[] = input.signatories && input.signatories.length > 0
      ? input.signatories
      : [
          {
            name: 'Central Governance & Sharia Board',
            title: 'Executive Director & General Secretary',
            role: 'Board of Trustees',
            signatureDate: formattedDate,
          },
        ];

    // Render HTML view
    const renderContext: DocumentRenderContext = {
      documentNumber,
      documentType: input.documentType,
      title: defaultTitle,
      templateVersion,
      recipientName: input.recipientName,
      recipientEmail: input.recipientEmail,
      recipientPhone: input.recipientPhone,
      generatedDate: formattedDate,
      expiresDate: input.expiresAt ? input.expiresAt.toISOString().split('T')[0] : null,
      signatureHash,
      qrCodeSvg,
      qrVerificationUrl,
      signatories,
      metadata: input.metadata || {},
    };

    const htmlContent = renderDocumentHtml(renderContext);

    const dataPayload = {
      documentNumber,
      documentType: input.documentType,
      title: defaultTitle,
      templateVersion,
      status: DocumentStatus.VALID,
      recipientName: input.recipientName,
      recipientEmail: input.recipientEmail ? input.recipientEmail.toLowerCase().trim() : null,
      recipientPhone: input.recipientPhone || null,
      metadataJson: input.metadata || {},
      signatoriesJson: signatories as any,
      signatureHash,
      qrCodeSvg,
      qrVerificationUrl,
      htmlContent,
      generatedAt: issuedAt,
      expiresAt: input.expiresAt || null,
      createdById: input.createdById || 'SYSTEM',
      donationId: input.donationId || null,
      memberProfileId: input.memberProfileId || null,
      volunteerProfileId: input.volunteerProfileId || null,
      employeeProfileId: input.employeeProfileId || null,
      payslipId: input.payslipId || null,
      projectId: input.projectId || null,
    };

    const doc = prisma.generatedDocument?.create
      ? await prisma.generatedDocument.create({ data: dataPayload })
      : { id: `doc_gen_${Date.now()}`, ...dataPayload, createdAt: new Date(), updatedAt: new Date() };

    await createAuditLog({
      action: 'DOCUMENT_GENERATED',
      entity: 'GeneratedDocument',
      entityId: doc.id,
      newData: {
        documentNumber,
        documentType: input.documentType,
        recipientName: input.recipientName,
        signatureHash,
      },
    });

    return doc;
  }

  /**
   * Universal Cryptographic Verification Resolver
   * Resolves any verification hash or document number across all 12 document categories + legacy entities
   */
  public static async verifyUniversalDocument(hashOrCode: string) {
    if (!hashOrCode || !hashOrCode.trim()) {
      return { isValid: false, message: 'Invalid or missing document signature.' };
    }

    const clean = hashOrCode.trim();

    // 1. Centralized GeneratedDocument Registry (Primary Authority)
    const genDoc = prisma.generatedDocument?.findFirst
      ? await prisma.generatedDocument.findFirst({
          where: {
            OR: [
              { signatureHash: clean },
              { documentNumber: clean },
            ],
          },
        })
      : null;

    if (genDoc) {
      const isExpired = genDoc.expiresAt ? new Date() > new Date(genDoc.expiresAt) : false;
      const effectiveStatus = genDoc.status === DocumentStatus.VALID && isExpired
        ? DocumentStatus.EXPIRED
        : genDoc.status;

      return {
        isValid: effectiveStatus === DocumentStatus.VALID,
        status: effectiveStatus,
        documentType: genDoc.documentType,
        documentNumber: genDoc.documentNumber,
        title: genDoc.title,
        templateVersion: genDoc.templateVersion,
        recipientName: genDoc.recipientName,
        recipientEmail: genDoc.recipientEmail,
        recipientPhone: genDoc.recipientPhone,
        issuedAt: genDoc.generatedAt,
        expiresAt: genDoc.expiresAt,
        signatureHash: genDoc.signatureHash,
        qrVerificationUrl: genDoc.qrVerificationUrl,
        qrCodeSvg: genDoc.qrCodeSvg,
        htmlContent: genDoc.htmlContent,
        metadata: genDoc.metadataJson,
        signatories: genDoc.signatoriesJson,
        organization: 'Imam E Mahdi Foundation (DOS)',
        verificationNote: effectiveStatus === DocumentStatus.VALID
          ? 'Cryptographically authenticated against the IMF-DOS Centralized Document Registry.'
          : `Document record found but status is ${effectiveStatus}.`,
      };
    }

    // 2. Fallback: Official Certificate Registry
    const cert = prisma.officialCertificate?.findFirst
      ? await prisma.officialCertificate.findFirst({
          where: {
            OR: [
              { signatureHash: clean },
              { certificateNumber: clean },
            ],
          },
          include: {
            member: true,
            volunteer: true,
          },
        })
      : null;

    if (cert) {
      return {
        isValid: true,
        status: DocumentStatus.VALID,
        documentType: 'OFFICIAL_CERTIFICATE',
        category: cert.certificateType,
        documentNumber: cert.certificateNumber,
        title: cert.title,
        description: cert.description,
        recipientName: cert.recipientName,
        recipientEmail: cert.recipientEmail,
        issuedAt: cert.issuedAt,
        expiresAt: cert.expiresAt,
        signatoryName: cert.signatoryName,
        signatoryTitle: cert.signatoryTitle,
        signatureHash: cert.signatureHash,
        linkedMemberNumber: cert.member?.membershipNumber || null,
        linkedVolunteerNumber: cert.volunteer?.volunteerNumber || null,
        organization: 'Imam E Mahdi Foundation',
      };
    }

    // 3. Fallback: Member Profile & Digital ID
    const member = prisma.memberProfile?.findFirst
      ? await prisma.memberProfile.findFirst({
          where: {
            OR: [
              { qrVerificationHash: clean },
              { membershipNumber: clean },
            ],
          },
        })
      : null;

    if (member) {
      return {
        isValid: true,
        status: DocumentStatus.VALID,
        documentType: 'MEMBER_DIGITAL_ID',
        category: member.membershipType,
        documentNumber: member.membershipNumber,
        title: `Official Digital ID - ${member.membershipType} Member`,
        recipientName: member.fullName,
        recipientEmail: member.email,
        phone: member.phone,
        issuedAt: member.startDate,
        expiresAt: member.endDate,
        signatureHash: member.qrVerificationHash,
        organization: 'Imam E Mahdi Foundation',
      };
    }

    // 4. Fallback: Volunteer Profile & Badge
    const volunteer = prisma.volunteerProfile?.findFirst
      ? await prisma.volunteerProfile.findFirst({
          where: {
            OR: [
              { qrVerificationHash: clean },
              { volunteerNumber: clean },
            ],
          },
        })
      : null;

    if (volunteer) {
      return {
        isValid: true,
        status: DocumentStatus.VALID,
        documentType: 'VOLUNTEER_DIGITAL_BADGE',
        category: volunteer.status,
        documentNumber: volunteer.volunteerNumber,
        title: 'Official Certified Field Volunteer Badge',
        recipientName: volunteer.fullName,
        recipientEmail: volunteer.email,
        city: volunteer.city,
        skills: volunteer.skills,
        totalHoursLogged: Number(volunteer.totalHoursLogged),
        issuedAt: volunteer.createdAt,
        signatureHash: volunteer.qrVerificationHash,
        organization: 'Imam E Mahdi Foundation',
      };
    }

    // 5. Fallback: Donation Receipt
    const donation = prisma.donation?.findFirst
      ? await prisma.donation.findFirst({
          where: {
            OR: [
              { qrVerificationHash: clean },
              { receiptNumber: clean },
            ],
          },
          include: {
            taxExemptionReceipt: true,
          },
        })
      : null;

    if (donation) {
      return {
        isValid: true,
        status: DocumentStatus.VALID,
        documentType: 'DONATION_RECEIPT',
        category: donation.fundType,
        documentNumber: donation.receiptNumber,
        title: `Official Donation Receipt (#${donation.receiptNumber})`,
        recipientName: donation.isAnonymous ? 'Anonymous Donor' : donation.donorName,
        recipientEmail: donation.donorEmail,
        amount: Number(donation.amount),
        currency: donation.currency,
        paymentStatus: donation.paymentStatus,
        issuedAt: donation.completedAt || donation.createdAt,
        signatureHash: donation.qrVerificationHash,
        taxCertificateNumber: donation.taxExemptionReceipt?.certificateNumber || null,
        organization: 'Imam E Mahdi Foundation',
      };
    }

    // 6. Fallback: Employee Payslip
    const payslip = prisma.payslip?.findFirst
      ? await prisma.payslip.findFirst({
          where: {
            OR: [
              { payslipNumber: clean },
              { id: clean },
              { verificationHash: clean },
            ],
          },
          include: {
            employee: true,
          },
        })
      : null;

    if (payslip) {
      return {
        isValid: true,
        status: DocumentStatus.VALID,
        documentType: DocumentType.PAYSLIP,
        documentNumber: payslip.payslipNumber,
        title: `Official Salary Payslip - ${payslip.payslipNumber}`,
        recipientName: payslip.employee ? payslip.employee.fullName : 'Staff Employee',
        recipientEmail: payslip.employee?.email || null,
        netPay: Number(payslip.netPayableINR),
        issuedAt: payslip.paidAt || payslip.createdAt,
        signatureHash: payslip.verificationHash || clean,
        organization: 'Imam E Mahdi Foundation',
      };
    }

    return {
      isValid: false,
      message: 'Cryptographic signature or document serial number was not found in the official registry.',
    };
  }

  /**
   * Backward-compatible legacy certificate issuer (delegates to centralized registry & officialCertificate table)
   */
  public static async issueCertificate(params: CreateCertificateParams) {
    const documentType = params.certificateType === CertificateType.VOLUNTEER_APPRECIATION
      ? DocumentType.VOLUNTEER_CERTIFICATE
      : params.certificateType === CertificateType.MEMBERSHIP_CERTIFICATE
      ? DocumentType.MEMBERSHIP_CERTIFICATE
      : DocumentType.APPRECIATION_CERTIFICATE;

    const certificateNumber = await this.generateNextCertificateNumber();
    const issuedAt = new Date();
    const signatureHash = QrService.computeDocumentHash({
      documentNumber: certificateNumber,
      documentType,
      recipientName: params.recipientName,
      templateVersion: '1.0.0',
      issuedAt,
    });
    const qrVerificationUrl = QrService.getVerificationUrl(signatureHash);

    // Issue via Centralized Document Engine
    await this.generateDocument({
      documentType,
      title: params.title,
      recipientName: params.recipientName,
      recipientEmail: params.recipientEmail,
      metadata: { description: params.description },
      signatories: [
        {
          name: params.signatoryName || 'Central Governance & Sharia Board',
          title: params.signatoryTitle || 'Executive Director & Secretary',
        },
      ],
      expiresAt: params.expiresAt,
    });

    // Also populate legacy officialCertificate table for backward compatibility
    const cert = prisma.officialCertificate?.create
      ? await prisma.officialCertificate.create({
          data: {
            certificateNumber,
            certificateType: params.certificateType,
            recipientName: params.recipientName,
            recipientEmail: params.recipientEmail.toLowerCase().trim(),
            memberId: params.memberId || null,
            volunteerId: params.volunteerId || null,
            title: params.title,
            description: params.description,
            issuedAt,
            expiresAt: params.expiresAt || null,
            signatureHash,
            qrVerificationUrl,
            signatoryName: params.signatoryName || 'Central Governance & Sharia Board',
            signatoryTitle: params.signatoryTitle || 'Executive Director & Secretary',
          },
        })
      : {
          id: `cert_${Date.now()}`,
          certificateNumber,
          certificateType: params.certificateType,
          recipientName: params.recipientName,
          recipientEmail: params.recipientEmail.toLowerCase().trim(),
          title: params.title,
          description: params.description,
          issuedAt,
          expiresAt: params.expiresAt || null,
          signatureHash,
          qrVerificationUrl,
          signatoryName: params.signatoryName || 'Central Governance & Sharia Board',
          signatoryTitle: params.signatoryTitle || 'Executive Director & Secretary',
        };

    return cert;
  }
}
