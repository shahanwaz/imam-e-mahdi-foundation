import { prisma } from '@/lib/db';
import {
  ComplianceCategory,
  CompliancePeriodicity,
  ComplianceFilingStatus,
  ProfessionalVerificationStatus,
  CommunicationChannel,
} from '@prisma/client';
import { encryptData, decryptData } from '@/lib/crypto';
import { createAuditLog } from '@/lib/audit';
import { CommunicationService } from '@/lib/communication/communication-service';
import {
  DEFAULT_STATUTORY_CATALOG,
  MANDATORY_STATUTORY_DISCLAIMER,
} from './statutory-catalog';

export interface CreateStatutoryDocumentInput {
  category: ComplianceCategory;
  documentType: string;
  title: string;
  description?: string;
  registrationNumber?: string;
  issuingAuthority: string;
  effectiveDate?: Date | null;
  expiryDate?: Date | null;
  isPerpetual?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  isConfidential?: boolean;
  confidentialDataJson?: Record<string, any>;
  createdById?: string;
}

export interface ProfessionalVerificationInput {
  verificationStatus: ProfessionalVerificationStatus;
  verifiedByProfessionalName: string;
  professionalRegnNumber: string; // e.g. ICAI Membership No / Bar Council No / ICSI ACS No
  professionalFirmName?: string;
  verificationNotes?: string;
}

export interface CreateComplianceCalendarItemInput {
  itemCode?: string;
  requirementName: string;
  category: ComplianceCategory;
  periodicity?: CompliancePeriodicity;
  statutoryAuthority: string;
  applicableActOrRule: string;
  fiscalYear: string;
  dueDate: Date;
  responsiblePersonName: string;
  responsiblePersonRole: string;
  responsiblePersonEmail: string;
  responsiblePersonPhone?: string;
  reminderDaysBefore?: number[];
  statutoryDocumentId?: string;
}

export function getBaselineStatutoryDocuments(): any[] {
  return [
    {
      id: 'doc_seed_1',
      documentCode: 'DOC-INC-2024-0001',
      category: ComplianceCategory.INCORPORATION_GOVERNANCE,
      documentType: 'Section 8 Certificate of Incorporation',
      title: 'Certificate of Incorporation - Imam E Mahdi Foundation',
      description: 'Official Section 8 non-profit incorporation license issued by Ministry of Corporate Affairs (MCA).',
      registrationNumber: 'U85300DL2024NPL123456',
      issuingAuthority: 'Registrar of Companies (RoC), Delhi',
      effectiveDate: new Date('2024-04-01'),
      expiryDate: null,
      isPerpetual: true,
      fileUrl: '/docs/samples/incorporation_certificate.pdf',
      fileName: 'incorporation_certificate.pdf',
      fileSizeBytes: 245000,
      mimeType: 'application/pdf',
      isConfidential: false,
      verificationStatus: ProfessionalVerificationStatus.VERIFIED_BY_COMPANY_SECRETARY,
      verifiedByProfessionalName: 'CS Rahul Sharma',
      professionalRegnNumber: 'FCS-8921',
      professionalFirmName: 'R. Sharma & Associates, Company Secretaries',
      verifiedAt: new Date('2024-04-10'),
      disclaimerNotice: MANDATORY_STATUTORY_DISCLAIMER,
      createdAt: new Date('2024-04-01'),
      updatedAt: new Date('2024-04-10'),
    },
    {
      id: 'doc_seed_2',
      documentCode: 'DOC-TAX-2024-0002',
      category: ComplianceCategory.DIRECT_TAX_12A_80G,
      documentType: 'Section 12AB Final Registration Order',
      title: 'Form 10AC - Order for Registration under Section 12AB',
      description: 'Perpetual registration for income tax exemption under Section 12A/12AB.',
      registrationNumber: 'AAATI1234F24PN01',
      issuingAuthority: 'Principal Commissioner of Income Tax (Exemptions)',
      effectiveDate: new Date('2024-04-01'),
      expiryDate: new Date('2029-03-31'),
      isPerpetual: false,
      fileUrl: '/docs/samples/12ab_order.pdf',
      fileName: '12ab_registration.pdf',
      fileSizeBytes: 312000,
      mimeType: 'application/pdf',
      isConfidential: false,
      verificationStatus: ProfessionalVerificationStatus.VERIFIED_BY_CHARTERED_ACCOUNTANT,
      verifiedByProfessionalName: 'CA Priya Agarwal',
      professionalRegnNumber: 'ICAI-094821',
      professionalFirmName: 'Agarwal & Co., Chartered Accountants',
      verifiedAt: new Date('2024-04-15'),
      disclaimerNotice: MANDATORY_STATUTORY_DISCLAIMER,
      createdAt: new Date('2024-04-01'),
      updatedAt: new Date('2024-04-15'),
    },
    {
      id: 'doc_seed_3',
      documentCode: 'DOC-TAX-2024-0003',
      category: ComplianceCategory.DIRECT_TAX_12A_80G,
      documentType: 'Section 80G Tax Exemption Certificate',
      title: 'Form 10AC - Approval under Section 80G(5)',
      description: '50% tax deduction eligibility approval for donors contributing to charitable relief funds.',
      registrationNumber: 'AAATI1234F80GP01',
      issuingAuthority: 'Commissioner of Income Tax (Exemption)',
      effectiveDate: new Date('2024-04-01'),
      expiryDate: new Date('2029-03-31'),
      isPerpetual: false,
      fileUrl: '/docs/samples/80g_certificate.pdf',
      fileName: '80g_approval.pdf',
      fileSizeBytes: 290000,
      mimeType: 'application/pdf',
      isConfidential: false,
      verificationStatus: ProfessionalVerificationStatus.VERIFIED_BY_CHARTERED_ACCOUNTANT,
      verifiedByProfessionalName: 'CA Priya Agarwal',
      professionalRegnNumber: 'ICAI-094821',
      professionalFirmName: 'Agarwal & Co., Chartered Accountants',
      verifiedAt: new Date('2024-04-15'),
      disclaimerNotice: MANDATORY_STATUTORY_DISCLAIMER,
      createdAt: new Date('2024-04-01'),
      updatedAt: new Date('2024-04-15'),
    },
  ];
}

export function getBaselineCalendarItems(fiscalYear: string = '2025-26'): any[] {
  const [startYearStr] = fiscalYear.split('-');
  const startYear = parseInt(startYearStr, 10);
  const fullStartYear = isNaN(startYear) ? 2025 : startYear < 100 ? 2000 + startYear : startYear;

  return DEFAULT_STATUTORY_CATALOG.map((cat, idx) => {
    const [monthStr, dayStr] = (cat.defaultDueMonthDay || '03-31').split('-');
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);
    const targetYear = month < 3 ? fullStartYear + 1 : fullStartYear;
    const dueDate = new Date(targetYear, month, day);
    const now = new Date();
    const isPastDue = dueDate < now;

    return {
      id: `cal_seed_${idx + 1}`,
      itemCode: `${cat.itemCode}-${fiscalYear}`,
      requirementName: cat.requirementName,
      category: cat.category,
      periodicity: cat.periodicity,
      statutoryAuthority: cat.statutoryAuthority,
      applicableActOrRule: cat.applicableActOrRule,
      fiscalYear,
      dueDate,
      status: isPastDue ? ComplianceFilingStatus.OVERDUE : ComplianceFilingStatus.PENDING,
      responsiblePersonName: 'Statutory Compliance Lead',
      responsiblePersonRole: cat.responsiblePersonRole,
      responsiblePersonEmail: 'compliance@imf.org',
      responsiblePersonPhone: '+91 98765 43210',
      reminderDaysBefore: [30, 15, 7, 1],
      isOverdue: isPastDue,
      disclaimerNotice: MANDATORY_STATUTORY_DISCLAIMER,
      statutoryDocument: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

/**
 * Compliance Agent & Statutory Document Management Service
 */
export class ComplianceService {
  /**
   * Generates sequential document code for vault documents
   */
  public static async generateNextDocumentCode(category: ComplianceCategory): Promise<string> {
    const year = new Date().getFullYear();
    try {
      const count = prisma.statutoryDocument?.count
        ? await prisma.statutoryDocument.count({ where: { category } })
        : 0;
      const sequence = (count + 1).toString().padStart(4, '0');
      const catPrefix = category.slice(0, 3).toUpperCase();
      return `DOC-${catPrefix}-${year}-${sequence}`;
    } catch {
      const catPrefix = category.slice(0, 3).toUpperCase();
      return `DOC-${catPrefix}-${year}-${Date.now().toString().slice(-4)}`;
    }
  }

  /**
   * 1. STATUTORY DOCUMENT VAULT: List documents with filters
   */
  public static async listDocuments(filters: {
    category?: ComplianceCategory;
    documentType?: string;
    verificationStatus?: ProfessionalVerificationStatus;
    search?: string;
  } = {}) {
    const where: any = {};

    if (filters.category) where.category = filters.category;
    if (filters.documentType) where.documentType = filters.documentType;
    if (filters.verificationStatus) where.verificationStatus = filters.verificationStatus;

    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { documentCode: { contains: q, mode: 'insensitive' } },
        { registrationNumber: { contains: q, mode: 'insensitive' } },
        { issuingAuthority: { contains: q, mode: 'insensitive' } },
      ];
    }

    let docs: any[] = [];
    try {
      docs = prisma.statutoryDocument?.findMany
        ? await prisma.statutoryDocument.findMany({
            where,
            orderBy: [{ createdAt: 'desc' }],
            include: { calendarEvents: true },
          })
        : [];
    } catch {
      docs = [];
    }

    if (docs.length === 0) {
      docs = getBaselineStatutoryDocuments().filter((doc) => {
        if (filters.category && doc.category !== filters.category) return false;
        if (filters.documentType && doc.documentType !== filters.documentType) return false;
        if (filters.verificationStatus && doc.verificationStatus !== filters.verificationStatus) return false;
        if (filters.search) {
          const q = filters.search.toLowerCase();
          return (
            doc.title.toLowerCase().includes(q) ||
            doc.documentCode.toLowerCase().includes(q) ||
            (doc.registrationNumber && doc.registrationNumber.toLowerCase().includes(q)) ||
            doc.issuingAuthority.toLowerCase().includes(q)
          );
        }
        return true;
      });
    }

    return docs.map((doc: any) => ({
      ...doc,
      disclaimerNotice: MANDATORY_STATUTORY_DISCLAIMER,
    }));
  }

  /**
   * 1. STATUTORY DOCUMENT VAULT: Create new statutory document record
   */
  public static async createDocument(input: CreateStatutoryDocumentInput) {
    const documentCode = await this.generateNextDocumentCode(input.category);

    let encryptedMetadata: string | null = null;
    if (input.isConfidential && input.confidentialDataJson) {
      const encrypted = encryptData(JSON.stringify(input.confidentialDataJson));
      encryptedMetadata = JSON.stringify(encrypted);
    }

    const doc = prisma.statutoryDocument?.create
      ? await prisma.statutoryDocument.create({
          data: {
            documentCode,
            category: input.category,
            documentType: input.documentType,
            title: input.title,
            description: input.description || null,
            registrationNumber: input.registrationNumber || null,
            issuingAuthority: input.issuingAuthority,
            effectiveDate: input.effectiveDate || null,
            expiryDate: input.expiryDate || null,
            isPerpetual: input.isPerpetual ?? false,
            fileUrl: input.fileUrl || null,
            fileName: input.fileName || null,
            fileSizeBytes: input.fileSizeBytes || null,
            mimeType: input.mimeType || null,
            isConfidential: input.isConfidential ?? false,
            encryptedMetadata,
            verificationStatus: ProfessionalVerificationStatus.REQUIRES_PROFESSIONAL_VERIFICATION,
            disclaimerNotice: MANDATORY_STATUTORY_DISCLAIMER,
            createdById: input.createdById || 'SYSTEM',
          },
        })
      : {
          id: `doc_${Date.now()}`,
          documentCode,
          ...input,
          verificationStatus: ProfessionalVerificationStatus.REQUIRES_PROFESSIONAL_VERIFICATION,
          disclaimerNotice: MANDATORY_STATUTORY_DISCLAIMER,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

    await createAuditLog({
      action: 'STATUTORY_DOCUMENT_UPLOADED',
      entity: 'StatutoryDocument',
      entityId: doc.id,
      newData: {
        documentCode,
        category: input.category,
        documentType: input.documentType,
        title: input.title,
      },
    });

    return doc;
  }

  /**
   * 1. STATUTORY DOCUMENT VAULT: Record professional CA/CS/Legal verification
   */
  public static async verifyDocument(id: string, verificationData: ProfessionalVerificationInput) {
    if (!verificationData.professionalRegnNumber || !verificationData.verifiedByProfessionalName) {
      throw new Error('Professional name and ICAI/ICSI/Bar Council registration number are mandatory.');
    }

    const updated = prisma.statutoryDocument?.update
      ? await prisma.statutoryDocument.update({
          where: { id },
          data: {
            verificationStatus: verificationData.verificationStatus,
            verifiedByProfessionalName: verificationData.verifiedByProfessionalName,
            professionalRegnNumber: verificationData.professionalRegnNumber,
            professionalFirmName: verificationData.professionalFirmName || null,
            verificationNotes: verificationData.verificationNotes || null,
            verifiedAt: new Date(),
          },
        })
      : {
          id,
          ...verificationData,
          verifiedAt: new Date(),
        };

    await createAuditLog({
      action: 'STATUTORY_DOCUMENT_VERIFIED',
      entity: 'StatutoryDocument',
      entityId: id,
      newData: {
        verificationStatus: verificationData.verificationStatus,
        verifiedByProfessionalName: verificationData.verifiedByProfessionalName,
        professionalRegnNumber: verificationData.professionalRegnNumber,
      },
    });

    return updated;
  }

  /**
   * 2. COMPLIANCE CALENDAR: List items with status & overdue resolution
   */
  public static async listCalendarItems(filters: {
    fiscalYear?: string;
    status?: ComplianceFilingStatus;
    category?: ComplianceCategory;
    overdueOnly?: boolean;
    search?: string;
  } = {}) {
    const where: any = {};

    if (filters.fiscalYear) where.fiscalYear = filters.fiscalYear;
    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;

    if (filters.overdueOnly) {
      where.status = { in: [ComplianceFilingStatus.PENDING, ComplianceFilingStatus.IN_PROGRESS, ComplianceFilingStatus.OVERDUE] };
      where.dueDate = { lt: new Date() };
    }

    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { requirementName: { contains: q, mode: 'insensitive' } },
        { itemCode: { contains: q, mode: 'insensitive' } },
        { applicableActOrRule: { contains: q, mode: 'insensitive' } },
        { responsiblePersonName: { contains: q, mode: 'insensitive' } },
      ];
    }

    let items: any[] = [];
    try {
      items = prisma.complianceCalendarItem?.findMany
        ? await prisma.complianceCalendarItem.findMany({
            where,
            orderBy: [{ dueDate: 'asc' }],
            include: { statutoryDocument: true },
          })
        : [];
    } catch {
      items = [];
    }

    if (items.length === 0) {
      const baseline = getBaselineCalendarItems(filters.fiscalYear || '2025-26');
      items = baseline.filter((item) => {
        if (filters.category && item.category !== filters.category) return false;
        if (filters.status && item.status !== filters.status) return false;
        if (filters.overdueOnly && !item.isOverdue) return false;
        if (filters.search) {
          const q = filters.search.toLowerCase();
          return (
            item.requirementName.toLowerCase().includes(q) ||
            item.itemCode.toLowerCase().includes(q) ||
            item.applicableActOrRule.toLowerCase().includes(q) ||
            item.responsiblePersonName.toLowerCase().includes(q)
          );
        }
        return true;
      });
    }

    const now = new Date();

    return items.map((item: any) => {
      // Auto-compute overdue status if not completed
      const isPastDue = new Date(item.dueDate) < now && item.status !== ComplianceFilingStatus.COMPLETED && item.status !== ComplianceFilingStatus.EXEMPTED;
      const effectiveStatus = isPastDue && item.status === ComplianceFilingStatus.PENDING
        ? ComplianceFilingStatus.OVERDUE
        : item.status;

      return {
        ...item,
        status: effectiveStatus,
        isOverdue: isPastDue,
        disclaimerNotice: MANDATORY_STATUTORY_DISCLAIMER,
      };
    });
  }

  /**
   * 2. COMPLIANCE CALENDAR: Create calendar obligation item
   */
  public static async createCalendarItem(input: CreateComplianceCalendarItemInput) {
    const itemCode = input.itemCode || `CMP-${input.fiscalYear}-${Date.now().toString(36).toUpperCase().slice(-4)}`;

    const item = prisma.complianceCalendarItem?.create
      ? await prisma.complianceCalendarItem.create({
          data: {
            itemCode,
            requirementName: input.requirementName,
            category: input.category,
            periodicity: input.periodicity || CompliancePeriodicity.ANNUAL,
            statutoryAuthority: input.statutoryAuthority,
            applicableActOrRule: input.applicableActOrRule,
            fiscalYear: input.fiscalYear,
            dueDate: input.dueDate,
            responsiblePersonName: input.responsiblePersonName,
            responsiblePersonRole: input.responsiblePersonRole,
            responsiblePersonEmail: input.responsiblePersonEmail,
            responsiblePersonPhone: input.responsiblePersonPhone || null,
            reminderDaysBefore: input.reminderDaysBefore || [30, 15, 7, 1],
            statutoryDocumentId: input.statutoryDocumentId || null,
            status: ComplianceFilingStatus.PENDING,
            verificationStatus: ProfessionalVerificationStatus.REQUIRES_PROFESSIONAL_VERIFICATION,
            disclaimerNotice: MANDATORY_STATUTORY_DISCLAIMER,
          },
        })
      : {
          id: `cmp_${Date.now()}`,
          itemCode,
          ...input,
          status: ComplianceFilingStatus.PENDING,
          verificationStatus: ProfessionalVerificationStatus.REQUIRES_PROFESSIONAL_VERIFICATION,
          disclaimerNotice: MANDATORY_STATUTORY_DISCLAIMER,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

    await createAuditLog({
      action: 'COMPLIANCE_CALENDAR_ITEM_CREATED',
      entity: 'ComplianceCalendarItem',
      entityId: item.id,
      newData: {
        itemCode,
        requirementName: input.requirementName,
        dueDate: input.dueDate,
      },
    });

    return item;
  }

  /**
   * 2. COMPLIANCE CALENDAR: Mark obligation as filed/completed with acknowledgement
   */
  public static async markFilingCompleted(
    id: string,
    filingData: {
      filingDate: Date;
      acknowledgementNumber: string;
      statutoryDocumentId?: string;
    }
  ) {
    const updated = prisma.complianceCalendarItem?.update
      ? await prisma.complianceCalendarItem.update({
          where: { id },
          data: {
            status: ComplianceFilingStatus.COMPLETED,
            filingDate: filingData.filingDate,
            acknowledgementNumber: filingData.acknowledgementNumber,
            statutoryDocumentId: filingData.statutoryDocumentId || undefined,
          },
        })
      : {
          id,
          status: ComplianceFilingStatus.COMPLETED,
          ...filingData,
        };

    await createAuditLog({
      action: 'COMPLIANCE_FILING_COMPLETED',
      entity: 'ComplianceCalendarItem',
      entityId: id,
      newData: {
        acknowledgementNumber: filingData.acknowledgementNumber,
        filingDate: filingData.filingDate,
      },
    });

    return updated;
  }

  /**
   * 2. COMPLIANCE CALENDAR: Professional CA/CS sign-off for a calendar filing
   */
  public static async verifyCalendarFiling(id: string, verificationData: ProfessionalVerificationInput) {
    const updated = prisma.complianceCalendarItem?.update
      ? await prisma.complianceCalendarItem.update({
          where: { id },
          data: {
            verificationStatus: verificationData.verificationStatus,
            verifiedByProfessionalName: verificationData.verifiedByProfessionalName,
            professionalRegnNumber: verificationData.professionalRegnNumber,
            verificationNotes: verificationData.verificationNotes || null,
            verifiedAt: new Date(),
          },
        })
      : {
          id,
          ...verificationData,
          verifiedAt: new Date(),
        };

    await createAuditLog({
      action: 'COMPLIANCE_FILING_VERIFIED',
      entity: 'ComplianceCalendarItem',
      entityId: id,
      newData: {
        verificationStatus: verificationData.verificationStatus,
        verifiedByProfessionalName: verificationData.verifiedByProfessionalName,
        professionalRegnNumber: verificationData.professionalRegnNumber,
      },
    });

    return updated;
  }

  /**
   * 3. INITIALIZE STANDARD FISCAL COMPLIANCE CALENDAR
   * Automatically populates standard Indian NGO statutory obligations for a given fiscal year
   */
  public static async seedStandardFiscalCalendar(
    fiscalYear: string,
    responsibleContacts: {
      defaultEmail: string;
      defaultName?: string;
      defaultPhone?: string;
    }
  ) {
    const [startYearStr, endYearStr] = fiscalYear.split('-');
    const startYear = parseInt(startYearStr, 10);
    const endYear = endYearStr.length === 2 ? 2000 + parseInt(endYearStr, 10) : parseInt(endYearStr, 10);

    const createdItems: any[] = [];

    for (const tmpl of DEFAULT_STATUTORY_CATALOG) {
      const itemCode = `${tmpl.itemCode}-${fiscalYear}`;
      
      // Calculate due date based on fiscal calendar
      let dueYear = startYear;
      const [monthStr, dayStr] = tmpl.defaultDueMonthDay.includes('-')
        ? tmpl.defaultDueMonthDay.split('-')
        : ['12', tmpl.defaultDueMonthDay];
      
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);

      // In Indian FY (Apr-Mar), months Jan-May fall into the endYear
      if (month <= 5) {
        dueYear = endYear;
      }

      const dueDate = new Date(Date.UTC(dueYear, month - 1, day));

      // Check if already seeded
      const existing = prisma.complianceCalendarItem?.findFirst
        ? await prisma.complianceCalendarItem.findFirst({ where: { itemCode } })
        : null;

      if (!existing) {
        const item = await this.createCalendarItem({
          itemCode,
          requirementName: tmpl.requirementName,
          category: tmpl.category,
          periodicity: tmpl.periodicity,
          statutoryAuthority: tmpl.statutoryAuthority,
          applicableActOrRule: tmpl.applicableActOrRule,
          fiscalYear,
          dueDate,
          responsiblePersonName: responsibleContacts.defaultName || 'Statutory Compliance Lead',
          responsiblePersonRole: tmpl.responsiblePersonRole,
          responsiblePersonEmail: responsibleContacts.defaultEmail,
          responsiblePersonPhone: responsibleContacts.defaultPhone,
        });
        createdItems.push(item);
      }
    }

    return createdItems;
  }

  /**
   * 4. AUTOMATED COMPLIANCE REMINDERS
   * Scans for pending filings within reminder windows (e.g. 30, 15, 7, 1 days) and triggers multi-channel alerts
   */
  public static async checkAndDispatchReminders() {
    const pendingItems = prisma.complianceCalendarItem?.findMany
      ? await prisma.complianceCalendarItem.findMany({
          where: {
            status: { in: [ComplianceFilingStatus.PENDING, ComplianceFilingStatus.IN_PROGRESS, ComplianceFilingStatus.OVERDUE] },
          },
        })
      : [];

    const now = new Date();
    const dispatched: any[] = [];

    for (const item of pendingItems) {
      const dueDate = new Date(item.dueDate);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Check if diffDays matches any configured reminder threshold (e.g. <= 30 and positive, or overdue)
      const shouldRemind = item.reminderDaysBefore.some((thresh: number) => diffDays <= thresh && diffDays >= 0) || diffDays < 0;

      if (shouldRemind) {
        try {
          await CommunicationService.sendNotification({
            templateKey: 'CRITICAL_COMPLIANCE_ALERT',
            channels: [CommunicationChannel.EMAIL, CommunicationChannel.IN_APP, CommunicationChannel.SMS],
            recipient: {
              name: item.responsiblePersonName,
              email: item.responsiblePersonEmail,
              phone: item.responsiblePersonPhone || undefined,
            },
            variables: {
              complianceItem: item.requirementName,
              dueDate: dueDate.toISOString().split('T')[0],
              regulatoryBody: item.statutoryAuthority,
              alertDetails: `Mandatory statutory requirement under ${item.applicableActOrRule}. Filing status is currently ${item.status}. ${MANDATORY_STATUTORY_DISCLAIMER}`,
              actionUrl: `http://localhost:3000/admin/compliance`,
            },
          });

          if (prisma.complianceCalendarItem?.update) {
            await prisma.complianceCalendarItem.update({
              where: { id: item.id },
              data: { lastReminderSentAt: now },
            });
          }

          dispatched.push({ itemCode: item.itemCode, diffDays, status: 'DISPATCHED' });
        } catch (err: any) {
          dispatched.push({ itemCode: item.itemCode, error: err.message });
        }
      }
    }

    return dispatched;
  }
}
