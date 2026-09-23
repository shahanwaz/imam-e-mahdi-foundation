import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentService } from '@/lib/documents/document-service';
import { DocumentType, DocumentStatus, CertificateType } from '@prisma/client';

// Mock DB
vi.mock('@/lib/db', async () => {
  const { Prisma, DocumentType: DT, DocumentStatus: DS } =
    await vi.importActual<typeof import('@prisma/client')>('@prisma/client');

  const generatedDocsStore: Map<string, any> = new Map();
  let countByDocType: Record<string, number> = {};

  return {
    prisma: {
      generatedDocument: {
        count: vi.fn().mockImplementation(({ where }: any) => {
          const type = where?.documentType || 'ALL';
          return Promise.resolve(countByDocType[type] || 0);
        }),
        create: vi.fn().mockImplementation(({ data }: any) => {
          const id = `doc_gen_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const doc = { id, createdAt: new Date(), updatedAt: new Date(), ...data };
          generatedDocsStore.set(doc.signatureHash, doc);
          generatedDocsStore.set(doc.documentNumber, doc);
          countByDocType[doc.documentType] = (countByDocType[doc.documentType] || 0) + 1;
          return Promise.resolve(doc);
        }),
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          if (where.OR) {
            for (const cond of where.OR) {
              if (cond.signatureHash && generatedDocsStore.has(cond.signatureHash)) {
                return Promise.resolve(generatedDocsStore.get(cond.signatureHash));
              }
              if (cond.documentNumber && generatedDocsStore.has(cond.documentNumber)) {
                return Promise.resolve(generatedDocsStore.get(cond.documentNumber));
              }
            }
          }
          return Promise.resolve(null);
        }),
      },
      officialCertificate: {
        count: vi.fn().mockResolvedValue(10),
        create: vi.fn().mockImplementation(({ data }: any) => Promise.resolve({ id: 'cert_1', ...data })),
        findFirst: vi.fn().mockResolvedValue(null),
      },
      memberProfile: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      volunteerProfile: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      donation: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      payslip: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit_1' }),
        findFirst: vi.fn().mockResolvedValue(null),
      },
    },
  };
});

describe('ONE Centralized Document Engine Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const all12DocumentTypes: Array<{ type: DocumentType; recipient: string; metadata: any }> = [
    {
      type: DocumentType.DONATION_RECEIPT,
      recipient: 'Br. Zainul Abideen',
      metadata: { amount: 50000, fundType: 'Zakat al-Mal', donorPan: 'ABCDE1234F' },
    },
    {
      type: DocumentType.MEMBER_ID,
      recipient: 'Syed Ali Raza',
      metadata: { membershipTier: 'LIFE MEMBER', phone: '+919876543210' },
    },
    {
      type: DocumentType.EMPLOYEE_ID,
      recipient: 'Dr. Hasan Raza',
      metadata: { designation: 'Executive Director', department: 'Administration', bloodGroup: 'B+' },
    },
    {
      type: DocumentType.MEMBERSHIP_CERTIFICATE,
      recipient: 'Syed Ali Raza',
      metadata: { membershipTier: 'Annual General Member' },
    },
    {
      type: DocumentType.VOLUNTEER_CERTIFICATE,
      recipient: 'Sister Fatema Zahra',
      metadata: { totalHours: 120, deploymentName: 'Flood Relief 2026' },
    },
    {
      type: DocumentType.APPRECIATION_CERTIFICATE,
      recipient: 'Haji Ghulam Abbas',
      metadata: { citation: 'For exceptional community service and philanthropic contributions.' },
    },
    {
      type: DocumentType.APPOINTMENT_LETTER,
      recipient: 'Ahmad Khan',
      metadata: { designation: 'Senior Programs Officer', monthlyGross: 65000, joiningDate: '2026-02-01' },
    },
    {
      type: DocumentType.OFFER_LETTER,
      recipient: 'Ahmad Khan',
      metadata: { designation: 'Senior Programs Officer', annualCTC: 780000, joiningDate: '2026-02-01' },
    },
    {
      type: DocumentType.PAYSLIP,
      recipient: 'Ahmad Khan',
      metadata: { grossSalary: 65000, payPeriod: 'January 2026', paymentRef: 'NEFT-HDFC-99128' },
    },
    {
      type: DocumentType.DONATION_STATEMENT,
      recipient: 'Br. Zainul Abideen',
      metadata: { fiscalYear: '2025-26', totalAmount: 150000 },
    },
    {
      type: DocumentType.PROJECT_REPORT,
      recipient: 'Board of Trustees',
      metadata: { projectName: 'Clean Water Borewell Project', projectCode: 'IMF-PRJ-01', budgetAmount: 1200000 },
    },
    {
      type: DocumentType.IMPACT_REPORT,
      recipient: 'Public Transparency Board',
      metadata: { period: 'FY 2025-26', livesImpacted: '25,000+', totalDisbursed: 7500000 },
    },
  ];

  it('should generate, sign, and render all 12 core document types through the centralized engine', async () => {
    for (const docSpec of all12DocumentTypes) {
      const doc = await DocumentService.generateDocument({
        documentType: docSpec.type,
        recipientName: docSpec.recipient,
        metadata: docSpec.metadata,
      });

      expect(doc).toBeDefined();
      expect(doc.documentType).toBe(docSpec.type);
      expect(doc.documentNumber).toBeDefined();
      expect(doc.signatureHash).toBeDefined();
      expect(doc.signatureHash.length).toBe(64);
      expect(doc.qrCodeSvg).toContain('<svg');
      expect(doc.qrVerificationUrl).toContain('/verify/doc/');
      expect(doc.htmlContent).toContain('Imam E Mahdi Foundation');
      expect(doc.htmlContent).toContain(docSpec.recipient);
      expect(doc.status).toBe(DocumentStatus.VALID);
    }
  });

  it('should generate standard sequential prefixes for each document category', async () => {
    const receiptNo = await DocumentService.generateNextDocumentNumber(DocumentType.DONATION_RECEIPT);
    expect(receiptNo).toMatch(/^IMF-REC-\d{4}-\d{5}$/);

    const memberIdNo = await DocumentService.generateNextDocumentNumber(DocumentType.MEMBER_ID);
    expect(memberIdNo).toMatch(/^IMF-MEM-\d{4}-\d{5}$/);

    const empIdNo = await DocumentService.generateNextDocumentNumber(DocumentType.EMPLOYEE_ID);
    expect(empIdNo).toMatch(/^IMF-EMP-\d{4}-\d{5}$/);

    const payslipNo = await DocumentService.generateNextDocumentNumber(DocumentType.PAYSLIP);
    expect(payslipNo).toMatch(/^IMF-PSL-\d{6}-\d{5}$/);

    const impactNo = await DocumentService.generateNextDocumentNumber(DocumentType.IMPACT_REPORT);
    expect(impactNo).toMatch(/^IMF-IMP-\d{4}-\d{5}$/);
  });

  it('should resolve and verify documents using the universal resolver', async () => {
    const createdDoc = await DocumentService.generateDocument({
      documentType: DocumentType.VOLUNTEER_CERTIFICATE,
      recipientName: 'Sister Fatema Zahra',
      metadata: { totalHours: 100 },
    });

    // Verify by signature hash
    const verifiedByHash = await DocumentService.verifyUniversalDocument(createdDoc.signatureHash);
    expect(verifiedByHash.isValid).toBe(true);
    expect(verifiedByHash.documentType).toBe(DocumentType.VOLUNTEER_CERTIFICATE);
    expect(verifiedByHash.recipientName).toBe('Sister Fatema Zahra');
    expect(verifiedByHash.status).toBe(DocumentStatus.VALID);

    // Verify by document number
    const verifiedByNumber = await DocumentService.verifyUniversalDocument(createdDoc.documentNumber);
    expect(verifiedByNumber.isValid).toBe(true);
    expect(verifiedByNumber.documentNumber).toBe(createdDoc.documentNumber);
  });

  it('should reject invalid or non-existent document hashes', async () => {
    const invalidResult = await DocumentService.verifyUniversalDocument('non_existent_hash_12345');
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.message).toContain('was not found in the official registry');
  });

  it('should maintain backward compatibility for issueCertificate callers', async () => {
    const cert = await DocumentService.issueCertificate({
      certificateType: CertificateType.VOLUNTEER_APPRECIATION,
      recipientName: 'Br. Qasim',
      recipientEmail: 'qasim@example.org',
      title: 'Distinguished Volunteer',
      description: 'Dedicated field work',
    });

    expect(cert).toBeDefined();
    expect(cert.recipientName).toBe('Br. Qasim');
    expect(cert.signatureHash).toBeDefined();
  });
});
