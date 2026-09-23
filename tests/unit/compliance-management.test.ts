import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComplianceService } from '@/lib/compliance/compliance-service';
import {
  ComplianceCategory,
  CompliancePeriodicity,
  ComplianceFilingStatus,
  ProfessionalVerificationStatus,
} from '@prisma/client';
import { MANDATORY_STATUTORY_DISCLAIMER } from '@/lib/compliance/statutory-catalog';

// Mock Prisma
vi.mock('@/lib/db', async () => {
  const {
    ComplianceCategory: CC,
    CompliancePeriodicity: CP,
    ComplianceFilingStatus: CFS,
    ProfessionalVerificationStatus: PVS,
  } = await vi.importActual<typeof import('@prisma/client')>('@prisma/client');

  const vaultStore: Map<string, any> = new Map();
  const calendarStore: Map<string, any> = new Map();

  return {
    prisma: {
      statutoryDocument: {
        count: vi.fn().mockImplementation(({ where }: any) => {
          let c = 0;
          for (const doc of vaultStore.values()) {
            if (!where?.category || doc.category === where.category) c++;
          }
          return Promise.resolve(c);
        }),
        create: vi.fn().mockImplementation(({ data }: any) => {
          const doc = {
            id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            calendarEvents: [],
            ...data,
          };
          vaultStore.set(doc.id, doc);
          return Promise.resolve(doc);
        }),
        findMany: vi.fn().mockImplementation(({ where }: any) => {
          const docs = Array.from(vaultStore.values()).filter((d) => {
            if (where?.category && d.category !== where.category) return false;
            if (where?.verificationStatus && d.verificationStatus !== where.verificationStatus) return false;
            return true;
          });
          return Promise.resolve(docs);
        }),
        findUnique: vi.fn().mockImplementation(({ where }: any) => {
          return Promise.resolve(vaultStore.get(where.id) || null);
        }),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          const doc = vaultStore.get(where.id);
          if (!doc) throw new Error('Document not found');
          const updated = { ...doc, ...data, updatedAt: new Date() };
          vaultStore.set(where.id, updated);
          return Promise.resolve(updated);
        }),
        delete: vi.fn().mockImplementation(({ where }: any) => {
          vaultStore.delete(where.id);
          return Promise.resolve({ id: where.id });
        }),
      },
      complianceCalendarItem: {
        count: vi.fn().mockImplementation(() => Promise.resolve(calendarStore.size)),
        create: vi.fn().mockImplementation(({ data }: any) => {
          const item = {
            id: `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
          };
          calendarStore.set(item.id, item);
          return Promise.resolve(item);
        }),
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          if (where.itemCode) {
            for (const item of calendarStore.values()) {
              if (item.itemCode === where.itemCode) return Promise.resolve(item);
            }
          }
          return Promise.resolve(null);
        }),
        findMany: vi.fn().mockImplementation(({ where }: any) => {
          const items = Array.from(calendarStore.values()).filter((i) => {
            if (where?.fiscalYear && i.fiscalYear !== where.fiscalYear) return false;
            if (where?.status) {
              if (where.status.in && Array.isArray(where.status.in)) {
                if (!where.status.in.includes(i.status)) return false;
              } else if (i.status !== where.status) {
                return false;
              }
            }
            return true;
          });
          return Promise.resolve(items);
        }),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          const item = calendarStore.get(where.id);
          if (!item) throw new Error('Calendar item not found');
          const updated = { ...item, ...data, updatedAt: new Date() };
          calendarStore.set(where.id, updated);
          return Promise.resolve(updated);
        }),
        delete: vi.fn().mockImplementation(({ where }: any) => {
          calendarStore.delete(where.id);
          return Promise.resolve({ id: where.id });
        }),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit_1' }),
        findFirst: vi.fn().mockResolvedValue(null),
      },
      communicationLog: {
        create: vi.fn().mockResolvedValue({ id: 'comm_1' }),
      },
      inAppNotification: {
        create: vi.fn().mockResolvedValue({ id: 'notif_1' }),
      },
    },
  };
});

describe('Compliance Agent & Document Management Engine Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should archive statutory documents in vault across required categories', async () => {
    // 1. Incorporation & Section 8 License
    const moaDoc = await ComplianceService.createDocument({
      category: ComplianceCategory.INCORPORATION_GOVERNANCE,
      documentType: 'MOA',
      title: 'Certified True Copy of Memorandum of Association (MOA)',
      issuingAuthority: 'Ministry of Corporate Affairs (ROC)',
      registrationNumber: 'U85300DL2026NPL0001',
      isPerpetual: true,
    });

    expect(moaDoc).toBeDefined();
    expect(moaDoc.documentCode).toMatch(/^DOC-INC-\d{4}-\d{4}$/);
    expect(moaDoc.verificationStatus).toBe(ProfessionalVerificationStatus.REQUIRES_PROFESSIONAL_VERIFICATION);
    expect(moaDoc.disclaimerNotice).toContain(MANDATORY_STATUTORY_DISCLAIMER);

    // 2. 80G Tax Exemption Certificate
    const taxDoc = await ComplianceService.createDocument({
      category: ComplianceCategory.DIRECT_TAX_12A_80G,
      documentType: 'SECTION_80G_REGISTRATION',
      title: 'Section 80G Final Approval Order',
      issuingAuthority: 'Income Tax Department (CIT Exemption)',
      registrationNumber: 'AAACI2026F80G1',
      effectiveDate: new Date('2026-04-01'),
      expiryDate: new Date('2031-03-31'),
    });

    expect(taxDoc).toBeDefined();
    expect(taxDoc.documentCode).toMatch(/^DOC-DIR-\d{4}-\d{4}$/);

    // 3. CSR-1 Registration
    const csrDoc = await ComplianceService.createDocument({
      category: ComplianceCategory.CSR_CORPORATE_GRANTS,
      documentType: 'CSR_1_REGISTRATION',
      title: 'Form CSR-1 Registration Certificate',
      issuingAuthority: 'Ministry of Corporate Affairs',
      registrationNumber: 'CSR00049281',
      isPerpetual: true,
    });

    expect(csrDoc).toBeDefined();
    expect(csrDoc.category).toBe(ComplianceCategory.CSR_CORPORATE_GRANTS);
  });

  it('should record professional Chartered Accountant and Company Secretary verifications with registration numbers', async () => {
    const doc = await ComplianceService.createDocument({
      category: ComplianceCategory.STATUTORY_AUDIT_ACCOUNTS,
      documentType: 'STATUTORY_AUDIT_REPORT',
      title: 'Independent Auditor Statutory Report FY 2025-26',
      issuingAuthority: 'Chartered Accountants of India',
    });

    const verified = await ComplianceService.verifyDocument(doc.id, {
      verificationStatus: ProfessionalVerificationStatus.VERIFIED_BY_CHARTERED_ACCOUNTANT,
      verifiedByProfessionalName: 'CA S. A. Rizvi',
      professionalRegnNumber: 'FCA 089123',
      professionalFirmName: 'M/s S.A. Rizvi & Co., Chartered Accountants',
      verificationNotes: 'Audited balance sheet and Form 10B reconciliation verified against bank statements.',
    });

    expect(verified.verificationStatus).toBe(ProfessionalVerificationStatus.VERIFIED_BY_CHARTERED_ACCOUNTANT);
    expect(verified.verifiedByProfessionalName).toBe('CA S. A. Rizvi');
    expect(verified.professionalRegnNumber).toBe('FCA 089123');
    expect(verified.verifiedAt).toBeDefined();
  });

  it('should automatically seed standard Indian non-profit statutory calendar items for a fiscal year', async () => {
    const seeded = await ComplianceService.seedStandardFiscalCalendar('2025-26', {
      defaultEmail: 'compliance.lead@imf.org',
      defaultName: 'Br. Syed Murtaza (CFO)',
    });

    expect(seeded.length).toBeGreaterThanOrEqual(10);

    const form10BD = seeded.find((i) => i.itemCode === 'CMP-FORM-10BD-2025-26');
    expect(form10BD).toBeDefined();
    expect(form10BD?.requirementName).toContain('Form 10BD');
    expect(form10BD?.responsiblePersonEmail).toBe('compliance.lead@imf.org');
    expect(form10BD?.status).toBe(ComplianceFilingStatus.PENDING);
    expect(form10BD?.disclaimerNotice).toContain('REQUIRES ORGANIZATIONAL / CA / CS / LEGAL VERIFICATION');
  });

  it('should mark statutory compliance obligations as completed with acknowledgement numbers', async () => {
    const item = await ComplianceService.createCalendarItem({
      requirementName: 'Annual ITR-7 Tax Return Filing',
      category: ComplianceCategory.DIRECT_TAX_12A_80G,
      statutoryAuthority: 'Income Tax Department',
      applicableActOrRule: 'Section 139(4A) IT Act',
      fiscalYear: '2025-26',
      dueDate: new Date('2026-10-31'),
      responsiblePersonName: 'CA S. A. Rizvi',
      responsiblePersonRole: 'Tax Counsel',
      responsiblePersonEmail: 'tax@imf.org',
    });

    const completed = await ComplianceService.markFilingCompleted(item.id, {
      filingDate: new Date('2026-10-20'),
      acknowledgementNumber: 'ITR7-ACK-2026-99281726',
    });

    expect(completed.status).toBe(ComplianceFilingStatus.COMPLETED);
    expect(completed.acknowledgementNumber).toBe('ITR7-ACK-2026-99281726');
  });

  it('should scan and dispatch automated compliance reminder alerts for upcoming and overdue obligations', async () => {
    // Schedule an obligation due tomorrow (1 day before)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await ComplianceService.createCalendarItem({
      itemCode: 'CMP-TEST-URGENT-REMINDER',
      requirementName: 'Urgent Form 10BD Rectification Return',
      category: ComplianceCategory.DIRECT_TAX_12A_80G,
      statutoryAuthority: 'Income Tax Department',
      applicableActOrRule: 'Rule 18AB',
      fiscalYear: '2025-26',
      dueDate: tomorrow,
      responsiblePersonName: 'Compliance Officer',
      responsiblePersonRole: 'Lead',
      responsiblePersonEmail: 'officer@imf.org',
      reminderDaysBefore: [30, 15, 7, 1],
    });

    const reminderResults = await ComplianceService.checkAndDispatchReminders();
    expect(Array.isArray(reminderResults)).toBe(true);
    expect(reminderResults.length).toBeGreaterThanOrEqual(1);

    const match = reminderResults.find((r) => r.itemCode === 'CMP-TEST-URGENT-REMINDER');
    expect(match).toBeDefined();
    expect(match?.status).toBe('DISPATCHED');
  });
});
