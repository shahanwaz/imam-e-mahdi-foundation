import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentService } from '@/lib/documents/document-service';
import { CertificateType, MembershipType, MembershipStatus, VolunteerStatus } from '@prisma/client';
import { generateHmacSignature, verifyHmacSignature } from '@/lib/crypto';

vi.mock('@/lib/db', async () => {
  const { Prisma, CertificateType: CT, MembershipType: MT, MembershipStatus: MS, VolunteerStatus: VS } = 
    await vi.importActual<typeof import('@prisma/client')>('@prisma/client');

  const mockCertificate = {
    id: 'cert_univ_1',
    certificateNumber: 'IMF-CERT-2026-00099',
    certificateType: CT.VOLUNTEER_APPRECIATION,
    recipientName: 'Sister Fatema Zahra',
    recipientEmail: 'fatema.zahra@example.com',
    memberId: null,
    volunteerId: 'vol_test_1',
    title: 'Certificate of Distinguished Humanitarian Service',
    description: 'In recognition of 50 verified hours of relief work',
    issuedAt: new Date(),
    expiresAt: null,
    signatoryName: 'Board of Trustees',
    signatoryTitle: 'Executive Secretary',
    signatureHash: 'mock_cert_hash_verified_123',
    qrVerificationUrl: 'http://localhost:3001/verify/doc/mock_cert_hash_verified_123',
    createdAt: new Date(),
    member: null,
    volunteer: { volunteerNumber: 'IMF-VOL-2026-00028' },
  };

  const mockMember = {
    id: 'mem_univ_1',
    membershipNumber: 'IMF-MEM-2026-00015',
    fullName: 'Br. Ali Raza',
    email: 'ali.raza@example.com',
    phone: '+919876500001',
    membershipType: MT.ANNUAL,
    status: MS.ACTIVE,
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    qrVerificationHash: 'mock_member_hash_verified_456',
    createdAt: new Date(),
    certificates: [],
  };

  const mockVolunteer = {
    id: 'vol_univ_1',
    volunteerNumber: 'IMF-VOL-2026-00028',
    fullName: 'Sister Fatema Zahra',
    email: 'fatema.zahra@example.com',
    city: 'Mumbai',
    status: VS.ACTIVE,
    skills: ['Logistics', 'First Aid'],
    totalHoursLogged: new Prisma.Decimal(50),
    performanceRating: new Prisma.Decimal(5.0),
    qrVerificationHash: 'mock_vol_hash_verified_789',
    createdAt: new Date(),
    assignments: [],
    certificates: [],
  };

  const mockDonation = {
    id: 'don_univ_1',
    receiptNumber: 'IMF-REC-2026-00043',
    donorName: 'Br. Zainul Abideen',
    donorEmail: 'zain@example.com',
    isAnonymous: false,
    amount: new Prisma.Decimal(5000),
    currency: 'INR',
    fundType: 'ZAKAT_MAL',
    paymentStatus: 'SUCCESS',
    qrVerificationHash: 'mock_don_hash_verified_321',
    completedAt: new Date(),
    createdAt: new Date(),
    category: { name: 'Zakat al-Mal' },
    taxExemptionReceipt: { certificateNumber: 'IMF-80G-2026-0001' },
  };

  return {
    prisma: {
      officialCertificate: {
        count: vi.fn().mockResolvedValue(98),
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            ...mockCertificate,
            ...data,
            id: 'cert_univ_new',
          });
        }),
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          if (where.OR?.some((cond: any) => cond.signatureHash === 'mock_cert_hash_verified_123' || cond.certificateNumber === 'IMF-CERT-2026-00099')) {
            return Promise.resolve(mockCertificate);
          }
          return Promise.resolve(null);
        }),
      },
      memberProfile: {
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          if (where.OR?.some((cond: any) => cond.qrVerificationHash === 'mock_member_hash_verified_456' || cond.membershipNumber === 'IMF-MEM-2026-00015')) {
            return Promise.resolve(mockMember);
          }
          return Promise.resolve(null);
        }),
      },
      volunteerProfile: {
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          if (where.OR?.some((cond: any) => cond.qrVerificationHash === 'mock_vol_hash_verified_789' || cond.volunteerNumber === 'IMF-VOL-2026-00028')) {
            return Promise.resolve(mockVolunteer);
          }
          return Promise.resolve(null);
        }),
      },
      donation: {
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          if (where.OR?.some((cond: any) => cond.qrVerificationHash === 'mock_don_hash_verified_321' || cond.receiptNumber === 'IMF-REC-2026-00043')) {
            return Promise.resolve(mockDonation);
          }
          return Promise.resolve(null);
        }),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit_1' }),
        findFirst: vi.fn().mockResolvedValue(null),
      },
    },
  };
});

import { prisma } from '@/lib/db';

describe('Unified Document & QR Verification Engine Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate official certificates with sequential numbering and HMAC-SHA256 signature', async () => {
    const cert = await DocumentService.issueCertificate({
      certificateType: CertificateType.VOLUNTEER_APPRECIATION,
      recipientName: 'Sister Fatema Zahra',
      recipientEmail: 'fatema.zahra@example.com',
      volunteerId: 'vol_test_1',
      title: 'Certificate of Distinguished Humanitarian Service',
      description: 'In recognition of 50 verified hours of relief work',
      signatoryName: 'Board of Trustees',
      signatoryTitle: 'Executive Secretary',
    });

    expect(cert).toBeDefined();
    expect(cert.certificateNumber).toMatch(/^IMF-CERT-\d{4}-\d{5}$/);
    expect(cert.signatureHash).toBeDefined();
    expect(cert.signatureHash.length).toBeGreaterThan(10);
    expect(prisma.officialCertificate.create).toHaveBeenCalled();
  });

  it('should cryptographically verify an official certificate via universal resolver', async () => {
    const result = await DocumentService.verifyUniversalDocument('mock_cert_hash_verified_123');

    expect(result.isValid).toBe(true);
    expect(result.documentType).toBe('OFFICIAL_CERTIFICATE');
    expect(result.title).toBe('Certificate of Distinguished Humanitarian Service');
    expect(result.recipientName).toBe('Sister Fatema Zahra');
  });

  it('should resolve and verify a member digital ID via universal resolver', async () => {
    const result = await DocumentService.verifyUniversalDocument('mock_member_hash_verified_456');

    expect(result.isValid).toBe(true);
    expect(result.documentType).toBe('MEMBER_DIGITAL_ID');
    expect(result.documentNumber).toBe('IMF-MEM-2026-00015');
    expect(result.recipientName).toBe('Br. Ali Raza');
  });

  it('should resolve and verify a volunteer credential badge via universal resolver', async () => {
    const result = await DocumentService.verifyUniversalDocument('mock_vol_hash_verified_789');

    expect(result.isValid).toBe(true);
    expect(result.documentType).toBe('VOLUNTEER_DIGITAL_BADGE');
    expect(result.documentNumber).toBe('IMF-VOL-2026-00028');
    expect(result.totalHoursLogged).toBe(50);
  });

  it('should resolve and verify a donation receipt via universal resolver', async () => {
    const result = await DocumentService.verifyUniversalDocument('mock_don_hash_verified_321');

    expect(result.isValid).toBe(true);
    expect(result.documentType).toBe('DONATION_RECEIPT');
    expect(result.documentNumber).toBe('IMF-REC-2026-00043');
    expect(result.recipientName).toBe('Br. Zainul Abideen');
  });

  it('should reject invalid or tampered document verification tokens', async () => {
    const result = await DocumentService.verifyUniversalDocument('non_existent_or_tampered_token_999');

    expect(result.isValid).toBe(false);
    expect(result.message).toContain('not found in the official registry');
  });

  it('should verify HMAC signature correctness directly', () => {
    const payload = 'IMF-CERT-2026-00099|Sister Fatema Zahra|VOLUNTEER_SERVICE';
    const sig = generateHmacSignature(payload);
    expect(sig).toBeDefined();

    const isMatch = verifyHmacSignature(payload, sig);
    expect(isMatch).toBe(true);

    const isTamperedMatch = verifyHmacSignature(payload + '_tampered', sig);
    expect(isTamperedMatch).toBe(false);
  });
});
