import { prisma } from '@/lib/db';
import { FieldVisitStatus, Prisma } from '@prisma/client';
import { createAuditLog } from '@/lib/audit';

export interface ScheduleFieldVisitInput {
  projectId?: string;
  beneficiaryId?: string;
  officerOrVolunteerUserId: string;
  scheduledDate: Date | string;
  locationAddress?: string;
}

export interface SubmitFieldVisitInput {
  visitId: string;
  completedDate?: Date | string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  locationAddress?: string;
  geoPhotoUrls?: string[];
  fieldObservations: string;
  needsVerificationSummary?: string;
}

export interface ReviewFieldVisitInput {
  visitId: string;
  reviewedByUserId: string;
  isApproved: boolean;
  supervisorRating: number; // 1 to 5 Stars
  supervisorReviewNotes: string;
}

export interface OfflineSurveyItem {
  clientTempId?: string;
  fieldVisitId?: string;
  beneficiaryId?: string;
  surveyTemplateTitle: string;
  answersJson: Record<string, any>;
  clientCapturedAt: string;
  syncDeviceId?: string;
}

export interface OfflineSyncBatchInput {
  deviceId: string;
  syncedByUserId: string;
  surveys: OfflineSurveyItem[];
  visits?: Array<{
    visitId: string;
    completedDate: string;
    gpsLatitude?: number;
    gpsLongitude?: number;
    fieldObservations: string;
    needsVerificationSummary?: string;
    geoPhotoUrls?: string[];
  }>;
}

export class FieldOpsService {
  /**
   * Generates sequential field visit serial number (e.g. IMF-VIS-2026-00088)
   */
  public static async generateNextVisitNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.fieldVisit.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-VIS-${year}-${sequence}`;
  }

  /**
   * Generates sequential field survey serial number (e.g. IMF-SRV-2026-00054)
   */
  public static async generateNextSurveyNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.fieldSurveyResponse.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-SRV-${year}-${sequence}`;
  }

  /**
   * Schedules a new field mission / beneficiary verification visit
   */
  public static async scheduleFieldVisit(input: ScheduleFieldVisitInput) {
    const visitNumber = await FieldOpsService.generateNextVisitNumber();

    const visit = await prisma.fieldVisit.create({
      data: {
        visitNumber,
        projectId: input.projectId || null,
        beneficiaryId: input.beneficiaryId || null,
        officerOrVolunteerUserId: input.officerOrVolunteerUserId,
        scheduledDate: new Date(input.scheduledDate),
        locationAddress: input.locationAddress || null,
        status: FieldVisitStatus.SCHEDULED,
      },
    });

    await createAuditLog({
      action: 'FIELD_VISIT_SCHEDULED',
      entity: 'FieldVisit',
      entityId: visit.id,
      newData: {
        visitNumber,
        scheduledDate: input.scheduledDate,
        officerId: input.officerOrVolunteerUserId,
      },
    });

    return visit;
  }

  /**
   * Submits completed field visit report with GPS location and photo evidence
   */
  public static async submitFieldVisitReport(input: SubmitFieldVisitInput) {
    if (!input.fieldObservations || input.fieldObservations.trim().length < 5) {
      throw new Error('Detailed field observations are mandatory for visit submission.');
    }

    const visit = await prisma.fieldVisit.findUniqueOrThrow({
      where: { id: input.visitId },
    });

    const updated = await prisma.fieldVisit.update({
      where: { id: visit.id },
      data: {
        completedDate: input.completedDate ? new Date(input.completedDate) : new Date(),
        gpsLatitude: input.gpsLatitude !== undefined ? new Prisma.Decimal(input.gpsLatitude) : visit.gpsLatitude,
        gpsLongitude: input.gpsLongitude !== undefined ? new Prisma.Decimal(input.gpsLongitude) : visit.gpsLongitude,
        locationAddress: input.locationAddress || visit.locationAddress,
        geoPhotoUrls: input.geoPhotoUrls || visit.geoPhotoUrls,
        fieldObservations: input.fieldObservations.trim(),
        needsVerificationSummary: input.needsVerificationSummary || null,
        status: FieldVisitStatus.SUBMITTED_FOR_REVIEW,
      },
    });

    await createAuditLog({
      action: 'FIELD_VISIT_SUBMITTED',
      entity: 'FieldVisit',
      entityId: visit.id,
      newData: {
        visitNumber: visit.visitNumber,
        status: FieldVisitStatus.SUBMITTED_FOR_REVIEW,
        lat: input.gpsLatitude,
        lng: input.gpsLongitude,
      },
    });

    return updated;
  }

  /**
   * Supervisor reviews and approves/rejects field visit report
   */
  public static async reviewFieldVisit(input: ReviewFieldVisitInput) {
    const visit = await prisma.fieldVisit.findUniqueOrThrow({
      where: { id: input.visitId },
    });

    const rating = Math.min(5, Math.max(1, input.supervisorRating || 5));
    const newStatus = input.isApproved ? FieldVisitStatus.APPROVED : FieldVisitStatus.REJECTED;

    const updated = await prisma.fieldVisit.update({
      where: { id: visit.id },
      data: {
        status: newStatus,
        supervisorRating: rating,
        supervisorReviewNotes: input.supervisorReviewNotes.trim(),
        reviewedByUserId: input.reviewedByUserId,
        reviewedAt: new Date(),
      },
    });

    // If approved and linked to beneficiary, mark beneficiary as FIELD_VERIFIED
    if (input.isApproved && visit.beneficiaryId) {
      await prisma.beneficiaryProfile.update({
        where: { id: visit.beneficiaryId },
        data: {
          verificationStatus: 'FIELD_VERIFIED',
          verifiedByUserId: input.reviewedByUserId,
          verifiedAt: new Date(),
        },
      });
    }

    await createAuditLog({
      action: 'FIELD_VISIT_REVIEWED',
      entity: 'FieldVisit',
      entityId: visit.id,
      userId: input.reviewedByUserId,
      newData: {
        visitNumber: visit.visitNumber,
        status: newStatus,
        rating,
      },
    });

    return updated;
  }

  /**
   * Processes a batch of offline-collected surveys and field reports
   */
  public static async processOfflineSyncBatch(batch: OfflineSyncBatchInput) {
    const syncedSurveys: any[] = [];
    const syncedVisits: any[] = [];

    // 1. Process Offline Surveys
    for (const item of batch.surveys) {
      const surveyNumber = await FieldOpsService.generateNextSurveyNumber();
      const surveyRecord = await prisma.fieldSurveyResponse.create({
        data: {
          surveyNumber,
          fieldVisitId: item.fieldVisitId || null,
          beneficiaryId: item.beneficiaryId || null,
          surveyTemplateTitle: item.surveyTemplateTitle,
          answersJson: item.answersJson,
          isOfflineCaptured: true,
          clientCapturedAt: new Date(item.clientCapturedAt),
          syncedAt: new Date(),
          syncDeviceId: batch.deviceId,
        },
      });
      syncedSurveys.push(surveyRecord);
    }

    // 2. Process Offline Visits
    if (batch.visits && batch.visits.length > 0) {
      for (const v of batch.visits) {
        const updated = await prisma.fieldVisit.update({
          where: { id: v.visitId },
          data: {
            completedDate: new Date(v.completedDate),
            gpsLatitude: v.gpsLatitude !== undefined ? new Prisma.Decimal(v.gpsLatitude) : undefined,
            gpsLongitude: v.gpsLongitude !== undefined ? new Prisma.Decimal(v.gpsLongitude) : undefined,
            fieldObservations: v.fieldObservations,
            needsVerificationSummary: v.needsVerificationSummary || null,
            geoPhotoUrls: v.geoPhotoUrls || [],
            status: FieldVisitStatus.SUBMITTED_FOR_REVIEW,
          },
        });
        syncedVisits.push(updated);
      }
    }

    await createAuditLog({
      action: 'OFFLINE_FIELD_OPS_SYNCED',
      entity: 'FieldOpsSync',
      entityId: batch.deviceId,
      userId: batch.syncedByUserId,
      newData: {
        deviceId: batch.deviceId,
        surveysSyncedCount: syncedSurveys.length,
        visitsSyncedCount: syncedVisits.length,
      },
    });

    return {
      success: true,
      deviceId: batch.deviceId,
      surveysSyncedCount: syncedSurveys.length,
      visitsSyncedCount: syncedVisits.length,
      syncedSurveys,
      syncedVisits,
    };
  }

  /**
   * Lists field visits with filtering
   */
  public static async listFieldVisits(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    projectId?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const search = params.search?.trim() || '';

    const where: any = {
      ...(params.status ? { status: params.status as FieldVisitStatus } : {}),
      ...(params.projectId ? { projectId: params.projectId } : {}),
      ...(search
        ? {
            OR: [
              { visitNumber: { contains: search, mode: 'insensitive' } },
              { locationAddress: { contains: search, mode: 'insensitive' } },
              { fieldObservations: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [totalRecords, visits] = await Promise.all([
      prisma.fieldVisit.count({ where }),
      prisma.fieldVisit.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { scheduledDate: 'desc' },
        include: {
          project: { select: { projectNumber: true, title: true } },
          beneficiary: { select: { beneficiaryNumber: true, fullName: true, city: true } },
          surveyResponses: true,
        },
      }),
    ]);

    return {
      visits,
      meta: {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  /**
   * Aggregates field operations metrics
   */
  public static async getFieldOpsAnalytics() {
    const [
      totalVisits,
      approvedVisits,
      pendingReviewVisits,
      offlineSurveysCount,
    ] = await Promise.all([
      prisma.fieldVisit.count(),
      prisma.fieldVisit.count({ where: { status: FieldVisitStatus.APPROVED } }),
      prisma.fieldVisit.count({ where: { status: FieldVisitStatus.SUBMITTED_FOR_REVIEW } }),
      prisma.fieldSurveyResponse.count({ where: { isOfflineCaptured: true } }),
    ]);

    return {
      totalVisits,
      approvedVisits,
      pendingReviewVisits,
      offlineSurveysCount,
    };
  }
}
