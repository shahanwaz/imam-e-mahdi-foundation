import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VolunteerService } from '@/lib/volunteers/volunteer-service';
import { VolunteerStatus, AssignmentStatus } from '@prisma/client';

vi.mock('@/lib/db', async () => {
  const { Prisma, VolunteerStatus: VS, AssignmentStatus: AS } = 
    await vi.importActual<typeof import('@prisma/client')>('@prisma/client');

  const defaultMockVolunteer = {
    id: 'vol_test_1',
    volunteerNumber: 'IMF-VOL-2026-00028',
    userId: 'user_vol_1',
    fullName: 'Sister Fatema Zahra',
    email: 'existing.vol@example.com',
    phone: '+919876500002',
    city: 'Mumbai',
    country: 'India',
    skills: ['Logistics', 'First Aid', 'Translation'],
    languages: ['English', 'Urdu', 'Hindi'],
    availability: 'WEEKENDS',
    interests: ['Disaster Relief', 'Medical Camps'],
    status: VS.APPLIED,
    totalHoursLogged: new Prisma.Decimal(25),
    performanceRating: new Prisma.Decimal(4.8),
    totalAssignmentsCount: 1,
    verifiedAt: null,
    verifiedByUserId: null,
    qrVerificationHash: 'mock_vol_qr_hash_7788',
    digitalBadgeUrl: 'http://localhost:3001/verify/volunteer/mock_vol_qr_hash_7788',
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignments: [],
    hoursLogs: [
      {
        id: 'log_1',
        hoursLogged: new Prisma.Decimal(5),
        tasksCompleted: 'Disaster supply distribution',
        date: new Date(),
        supervisorRating: 5,
      },
    ],
  };

  return {
    prisma: {
      volunteerProfile: {
        count: vi.fn().mockImplementation((args?: any) => {
          if (args?.where?.status === VS.ACTIVE) return Promise.resolve(15);
          if (args?.where?.status === VS.APPLIED) return Promise.resolve(5);
          return Promise.resolve(27);
        }),
        findUnique: vi.fn().mockImplementation(({ where }: any) => {
          if (where.email === 'existing.vol@example.com' || where.id === 'vol_test_1' || where.volunteerNumber === 'IMF-VOL-2026-00028') {
            return Promise.resolve(defaultMockVolunteer);
          }
          return Promise.resolve(null);
        }),
        findUniqueOrThrow: vi.fn().mockImplementation(({ where }: any) => {
          if (where.id === 'vol_test_1' || where.volunteerNumber === 'IMF-VOL-2026-00028') {
            return Promise.resolve(defaultMockVolunteer);
          }
          throw new Error('Volunteer not found');
        }),
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          if (where?.email === 'existing.vol@example.com' || where?.id === 'vol_test_1' || where?.volunteerNumber === 'IMF-VOL-2026-00028') {
            return Promise.resolve(defaultMockVolunteer);
          }
          return Promise.resolve(null);
        }),
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            ...defaultMockVolunteer,
            ...data,
            id: 'vol_test_new',
            volunteerNumber: 'IMF-VOL-2026-00028',
          });
        }),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          return Promise.resolve({
            ...defaultMockVolunteer,
            ...data,
          });
        }),
        findMany: vi.fn().mockResolvedValue([defaultMockVolunteer]),
        aggregate: vi.fn().mockResolvedValue({
          _sum: { totalHoursLogged: new Prisma.Decimal(450) },
        }),
      },
      volunteerAssignment: {
        count: vi.fn().mockResolvedValue(12),
        create: vi.fn().mockResolvedValue({
          id: 'asn_1',
          assignmentNumber: 'IMF-ASN-2026-00013',
          volunteerId: 'vol_test_1',
          title: 'Winter Blanket Distribution Drive',
          description: 'Distribute emergency supplies to flood-affected families',
          location: 'Mumbai Central',
          status: AS.ASSIGNED,
          startDate: new Date(),
        }),
        update: vi.fn().mockResolvedValue({}),
      },
      volunteerHoursLog: {
        create: vi.fn().mockResolvedValue({
          id: 'log_new_1',
          volunteerId: 'vol_test_1',
          hoursLogged: new Prisma.Decimal(6),
          tasksCompleted: 'On-site registration and triage support',
          date: new Date(),
          supervisorRating: 5,
        }),
        findMany: vi.fn().mockResolvedValue([
          { hoursLogged: new Prisma.Decimal(10), supervisorRating: 5 },
          { hoursLogged: new Prisma.Decimal(6), supervisorRating: 4 },
        ]),
      },
      officialCertificate: {
        count: vi.fn().mockResolvedValue(10),
        create: vi.fn().mockResolvedValue({
          id: 'cert_vol_1',
          certificateNumber: 'IMF-CERT-2026-00002',
          signatureHash: 'mock_cert_hash_vol_9988',
        }),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit_1' }),
        findFirst: vi.fn().mockResolvedValue(null),
      },
      $transaction: vi.fn().mockImplementation(async (callback) => {
        const { prisma } = await import('@/lib/db');
        return callback(prisma);
      }),
    },
  };
});

import { prisma } from '@/lib/db';

describe('Volunteer Service & Operations Lifecycle Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should accept volunteer public application with skills, availability, and sequential ID', async () => {
    const vol = await VolunteerService.submitApplication({
      fullName: 'Sister Fatema Zahra',
      email: 'fatema.zahra@example.com',
      phone: '+919876500002',
      city: 'Mumbai',
      country: 'India',
      skills: ['Logistics', 'First Aid', 'Translation'],
      languages: ['English', 'Urdu', 'Hindi'],
      availability: 'WEEKENDS',
      interests: ['Disaster Relief', 'Medical Camps'],
    });

    expect(vol).toBeDefined();
    expect(vol.volunteerNumber).toMatch(/^IMF-VOL-\d{4}-\d{5}$/);
    expect(vol.qrVerificationHash).toBeDefined();
    expect(vol.status).toBe(VolunteerStatus.APPLIED);
    expect(prisma.volunteerProfile.create).toHaveBeenCalled();
  });

  it('should verify and approve a volunteer application and activate badge', async () => {
    const verified = await VolunteerService.verifyAndApproveVolunteer(
      'vol_test_1',
      'ADMIN_SUPERVISOR'
    );

    expect(verified).toBeDefined();
    expect(verified.status).toBe(VolunteerStatus.APPROVED);
    expect(prisma.volunteerProfile.update).toHaveBeenCalled();
  });

  it('should dispatch shift assignment with sequential assignment code', async () => {
    const assignment = await VolunteerService.createAssignment({
      volunteerId: 'vol_test_1',
      title: 'Winter Blanket Distribution Drive',
      description: 'Distribute emergency supplies to flood-affected families',
      location: 'Mumbai Central',
      startDate: new Date(),
    });

    expect(assignment).toBeDefined();
    expect(assignment.assignmentNumber).toMatch(/^IMF-ASN-\d{4}-\d{5}$/);
    expect(assignment.volunteerId).toBe('vol_test_1');
    expect(prisma.volunteerAssignment.create).toHaveBeenCalled();
  });

  it('should log shift attendance hours and recalculate supervisor ratings', async () => {
    const logResult = await VolunteerService.logAttendanceAndHours({
      volunteerId: 'vol_test_1',
      hoursLogged: 6,
      tasksCompleted: 'On-site registration and triage support',
      date: new Date(),
      supervisorRating: 5,
      supervisorNotes: 'Outstanding punctuality and empathy with beneficiaries',
    });

    expect(logResult).toBeDefined();
    expect(logResult.volunteerId).toBe('vol_test_1');
    expect(prisma.volunteerHoursLog.create).toHaveBeenCalled();
    expect(prisma.volunteerProfile.update).toHaveBeenCalled();
  });

  it('should issue official service certificate for verified volunteers', async () => {
    const cert = await VolunteerService.issueVolunteerCertificate(
      'vol_test_1'
    );

    expect(cert).toBeDefined();
    expect(cert.certificateNumber).toMatch(/^IMF-CERT-\d{4}-\d{5}$/);
    expect(cert.signatureHash).toBeDefined();
    expect(prisma.officialCertificate.create).toHaveBeenCalled();
  });

  it('should calculate volunteer corps analytics', async () => {
    const analytics = await VolunteerService.getVolunteerAnalytics();
    expect(analytics).toBeDefined();
    expect(analytics.totalVolunteers).toBeGreaterThanOrEqual(0);
    expect(analytics.activeVolunteers).toBeGreaterThanOrEqual(0);
    expect(analytics.pendingApplications).toBeGreaterThanOrEqual(0);
    expect(analytics.totalHoursLogged).toBeGreaterThanOrEqual(0);
  });
});
