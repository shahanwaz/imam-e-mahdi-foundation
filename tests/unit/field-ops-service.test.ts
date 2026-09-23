import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FieldOpsService } from '@/lib/field-ops/field-ops-service';
import { FieldVisitStatus } from '@prisma/client';

vi.mock('@/lib/db', async () => {
  const { Prisma, FieldVisitStatus: FVS } = 
    await vi.importActual<typeof import('@prisma/client')>('@prisma/client');

  const defaultMockVisit = {
    id: 'vis_test_1',
    visitNumber: 'IMF-VIS-2026-00088',
    projectId: 'prj_test_1',
    beneficiaryId: 'ben_test_1',
    officerOrVolunteerUserId: 'VOL-9921',
    scheduledDate: new Date(),
    completedDate: null,
    status: FVS.SCHEDULED,
    gpsLatitude: new Prisma.Decimal(19.0596),
    gpsLongitude: new Prisma.Decimal(72.8295),
    locationAddress: 'Govandi Slum Resettlement, Mumbai',
    geoPhotoUrls: [],
    fieldObservations: null,
    needsVerificationSummary: null,
    supervisorRating: null,
    supervisorReviewNotes: null,
    reviewedByUserId: null,
    reviewedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    surveyResponses: [],
  };

  return {
    prisma: {
      fieldVisit: {
        count: vi.fn().mockImplementation((args?: any) => {
          if (args?.where?.status === FVS.APPROVED) return Promise.resolve(18);
          if (args?.where?.status === FVS.SUBMITTED_FOR_REVIEW) return Promise.resolve(6);
          return Promise.resolve(32);
        }),
        findUnique: vi.fn().mockResolvedValue(defaultMockVisit),
        findUniqueOrThrow: vi.fn().mockImplementation(({ where }: any) => {
          if (where.id === 'vis_test_1') return Promise.resolve(defaultMockVisit);
          throw new Error('Field visit not found');
        }),
        findFirst: vi.fn().mockResolvedValue(defaultMockVisit),
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            ...defaultMockVisit,
            ...data,
            id: 'vis_test_new',
            visitNumber: 'IMF-VIS-2026-00088',
          });
        }),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          return Promise.resolve({
            ...defaultMockVisit,
            ...data,
          });
        }),
        findMany: vi.fn().mockResolvedValue([defaultMockVisit]),
      },
      fieldSurveyResponse: {
        count: vi.fn().mockImplementation((args?: any) => {
          if (args?.where?.isOfflineCaptured) return Promise.resolve(14);
          return Promise.resolve(53);
        }),
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            id: 'srv_test_1',
            surveyNumber: 'IMF-SRV-2026-00054',
            ...data,
          });
        }),
      },
      beneficiaryProfile: {
        update: vi.fn().mockResolvedValue({}),
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

describe('Field Operations & Offline Synchronization Engine Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should schedule a field visit with sequential identifier', async () => {
    const visit = await FieldOpsService.scheduleFieldVisit({
      projectId: 'prj_test_1',
      beneficiaryId: 'ben_test_1',
      officerOrVolunteerUserId: 'VOL-9921',
      scheduledDate: new Date(),
      locationAddress: 'Govandi Slum Resettlement, Mumbai',
    });

    expect(visit).toBeDefined();
    expect(visit.visitNumber).toMatch(/^IMF-VIS-\d{4}-\d{5}$/);
    expect(visit.status).toBe(FieldVisitStatus.SCHEDULED);
    expect(prisma.fieldVisit.create).toHaveBeenCalled();
  });

  it('should submit field observations with GPS coordinates and photo evidence', async () => {
    const submitted = await FieldOpsService.submitFieldVisitReport({
      visitId: 'vis_test_1',
      gpsLatitude: 19.0596,
      gpsLongitude: 72.8295,
      locationAddress: 'Govandi Slum Resettlement, Mumbai',
      geoPhotoUrls: ['/images/field/photo1.jpg', '/images/field/photo2.jpg'],
      fieldObservations: 'Beneficiary household verified. Severe nutritional vulnerability detected.',
      needsVerificationSummary: 'Emergency ration kit and child sponsorship recommended.',
    });

    expect(submitted).toBeDefined();
    expect(submitted.status).toBe(FieldVisitStatus.SUBMITTED_FOR_REVIEW);
    expect(submitted.fieldObservations).toContain('nutritional vulnerability');
    expect(prisma.fieldVisit.update).toHaveBeenCalled();
  });

  it('should review and approve field visit with supervisor rating and update beneficiary status', async () => {
    const reviewed = await FieldOpsService.reviewFieldVisit({
      visitId: 'vis_test_1',
      reviewedByUserId: 'SUPERVISOR_99',
      isApproved: true,
      supervisorRating: 5,
      supervisorReviewNotes: 'GPS geo-tag and photographic evidence verified.',
    });

    expect(reviewed).toBeDefined();
    expect(reviewed.status).toBe(FieldVisitStatus.APPROVED);
    expect(reviewed.supervisorRating).toBe(5);
    expect(prisma.beneficiaryProfile.update).toHaveBeenCalled();
  });

  it('should process a batch of offline-collected surveys and visits idempotently', async () => {
    const syncResult = await FieldOpsService.processOfflineSyncBatch({
      deviceId: 'TABLET-FIELD-004',
      syncedByUserId: 'VOL-9921',
      surveys: [
        {
          surveyTemplateTitle: 'Household Nutritional Assessment',
          answersJson: { mealsPerDay: 1, accessToWater: false },
          clientCapturedAt: new Date().toISOString(),
        },
      ],
      visits: [
        {
          visitId: 'vis_test_1',
          completedDate: new Date().toISOString(),
          gpsLatitude: 19.0596,
          gpsLongitude: 72.8295,
          fieldObservations: 'Offline visit report successfully transmitted.',
        },
      ],
    });

    expect(syncResult.success).toBe(true);
    expect(syncResult.surveysSyncedCount).toBe(1);
    expect(syncResult.visitsSyncedCount).toBe(1);
    expect(prisma.fieldSurveyResponse.create).toHaveBeenCalled();
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });

  it('should calculate field operations analytics', async () => {
    const analytics = await FieldOpsService.getFieldOpsAnalytics();
    expect(analytics).toBeDefined();
    expect(analytics.totalVisits).toBe(32);
    expect(analytics.approvedVisits).toBe(18);
    expect(analytics.offlineSurveysCount).toBe(14);
  });
});
