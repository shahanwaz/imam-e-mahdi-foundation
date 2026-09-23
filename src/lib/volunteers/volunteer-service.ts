import { prisma } from '@/lib/db';
import { VolunteerStatus, AssignmentStatus, CertificateType, Prisma } from '@prisma/client';
import { generateHmacSignature } from '@/lib/crypto';
import { createAuditLog } from '@/lib/audit';
import { DocumentService } from '@/lib/documents/document-service';

export interface ApplyVolunteerInput {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state?: string;
  country?: string;
  skills: string[];
  languages?: string[];
  availability: string;
  interests?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  userId?: string;
}

export interface CreateAssignmentInput {
  volunteerId: string;
  title: string;
  description: string;
  location: string;
  programOrProject?: string;
  requiredSkills?: string[];
  startDate: Date | string;
  endDate?: Date | string;
  coordinatorName?: string;
  coordinatorContact?: string;
  notes?: string;
}

export interface LogAttendanceInput {
  volunteerId: string;
  assignmentId?: string;
  date?: Date | string;
  hoursLogged: number;
  tasksCompleted: string;
  supervisorRating?: number; // 1 to 5
  supervisorNotes?: string;
  verifiedBy?: string;
}

export class VolunteerService {
  /**
   * Generates sequential volunteer ID (e.g. IMF-VOL-2026-00018)
   */
  public static async generateNextVolunteerNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.volunteerProfile.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-VOL-${year}-${sequence}`;
  }

  /**
   * Generates sequential assignment ID (e.g. IMF-ASN-2026-00042)
   */
  public static async generateNextAssignmentNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.volunteerAssignment.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-ASN-${year}-${sequence}`;
  }

  /**
   * Computes tamper-proof HMAC-SHA256 signature hash for volunteer digital badge
   */
  public static computeVolunteerQrHash(params: {
    volunteerNumber: string;
    fullName: string;
    email: string;
    city: string;
    createdAt: Date;
  }): string {
    const payload = [
      params.volunteerNumber,
      params.fullName.trim(),
      params.email.toLowerCase().trim(),
      params.city.trim(),
      params.createdAt.toISOString(),
    ].join('|');

    return generateHmacSignature(payload);
  }

  /**
   * Submits a public volunteer application
   */
  public static async submitApplication(input: ApplyVolunteerInput) {
    if (!input.fullName || input.fullName.trim().length < 2) {
      throw new Error('Full legal name is mandatory.');
    }
    if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      throw new Error('A valid email address is mandatory.');
    }
    if (!input.phone || input.phone.trim().length < 8) {
      throw new Error('A valid contact phone number is mandatory.');
    }
    if (!input.city || input.city.trim().length < 2) {
      throw new Error('City / Primary location is mandatory.');
    }

    const cleanEmail = input.email.toLowerCase().trim();

    // Check duplicate
    const existing = await prisma.volunteerProfile.findFirst({
      where: { email: cleanEmail },
    });
    if (existing) {
      throw new Error(`A volunteer profile with email ${cleanEmail} already exists (#${existing.volunteerNumber}).`);
    }

    const volunteerNumber = await VolunteerService.generateNextVolunteerNumber();
    const createdAt = new Date();

    const qrVerificationHash = VolunteerService.computeVolunteerQrHash({
      volunteerNumber,
      fullName: input.fullName,
      email: cleanEmail,
      city: input.city,
      createdAt,
    });

    const digitalBadgeUrl = `http://localhost:3001/verify/volunteer/${qrVerificationHash}`;

    const volunteer = await prisma.volunteerProfile.create({
      data: {
        volunteerNumber,
        userId: input.userId || null,
        fullName: input.fullName.trim(),
        email: cleanEmail,
        phone: input.phone.trim(),
        city: input.city.trim(),
        state: input.state || null,
        country: input.country || 'India',
        status: VolunteerStatus.APPLIED,
        skills: input.skills || ['General Assistance'],
        languages: input.languages || ['English', 'Hindi'],
        availability: input.availability || 'WEEKENDS',
        interests: input.interests || ['Disaster Relief', 'Healthcare'],
        emergencyContactName: input.emergencyContactName || null,
        emergencyContactPhone: input.emergencyContactPhone || null,
        digitalBadgeUrl,
        qrVerificationHash,
        notes: input.notes || null,
        createdAt,
      },
    });

    await createAuditLog({
      action: 'VOLUNTEER_APPLIED',
      entity: 'VolunteerProfile',
      entityId: volunteer.id,
      newData: {
        volunteerNumber,
        fullName: input.fullName,
        email: cleanEmail,
        city: input.city,
      },
    });

    return volunteer;
  }

  /**
   * Verifies & approves volunteer candidate and activates official digital badge
   */
  public static async verifyAndApproveVolunteer(volunteerId: string, verifierUserId: string = 'ADMIN_SUPERVISOR') {
    const volunteer = await prisma.volunteerProfile.findUniqueOrThrow({
      where: { id: volunteerId },
    });

    const verifiedAt = new Date();

    const updated = await prisma.volunteerProfile.update({
      where: { id: volunteer.id },
      data: {
        status: VolunteerStatus.APPROVED,
        verifiedByUserId: verifierUserId,
        verifiedAt,
      },
    });

    // Automatically issue Volunteer Welcome Certificate
    await DocumentService.issueCertificate({
      certificateType: CertificateType.VOLUNTEER_APPRECIATION,
      recipientName: volunteer.fullName,
      recipientEmail: volunteer.email,
      volunteerId: volunteer.id,
      title: 'Official Certification of Volunteer Enrollment',
      description: `In recognition of verified humanitarian skills, commitment to non-profit service, and official enrollment into the Disaster Response & Relief Volunteer Corps of Imam E Mahdi Foundation.`,
    });

    await createAuditLog({
      action: 'VOLUNTEER_APPROVED',
      entity: 'VolunteerProfile',
      entityId: volunteer.id,
      newData: {
        volunteerNumber: volunteer.volunteerNumber,
        status: VolunteerStatus.APPROVED,
        verifiedByUserId: verifierUserId,
      },
    });

    return updated;
  }

  /**
   * Creates and dispatches a field assignment to a volunteer
   */
  public static async createAssignment(input: CreateAssignmentInput) {
    const volunteer = await prisma.volunteerProfile.findUniqueOrThrow({
      where: { id: input.volunteerId },
    });

    const assignmentNumber = await VolunteerService.generateNextAssignmentNumber();

    const assignment = await prisma.volunteerAssignment.create({
      data: {
        assignmentNumber,
        volunteerId: volunteer.id,
        title: input.title.trim(),
        description: input.description.trim(),
        location: input.location.trim(),
        programOrProject: input.programOrProject || null,
        requiredSkills: input.requiredSkills || [],
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : null,
        status: AssignmentStatus.ASSIGNED,
        coordinatorName: input.coordinatorName || null,
        coordinatorContact: input.coordinatorContact || null,
        notes: input.notes || null,
      },
    });

    await prisma.volunteerProfile.update({
      where: { id: volunteer.id },
      data: {
        totalAssignmentsCount: { increment: 1 },
        status: VolunteerStatus.ACTIVE,
      },
    });

    await createAuditLog({
      action: 'VOLUNTEER_ASSIGNMENT_CREATED',
      entity: 'VolunteerAssignment',
      entityId: assignment.id,
      newData: {
        assignmentNumber,
        volunteerNumber: volunteer.volunteerNumber,
        title: input.title,
      },
    });

    return assignment;
  }

  /**
   * Logs attendance and hours worked, updating volunteer's lifetime statistics
   */
  public static async logAttendanceAndHours(input: LogAttendanceInput) {
    if (!input.hoursLogged || input.hoursLogged <= 0) {
      throw new Error('Hours logged must be greater than 0.');
    }
    if (!input.tasksCompleted || input.tasksCompleted.trim().length < 3) {
      throw new Error('A summary of tasks completed is mandatory.');
    }

    const volunteer = await prisma.volunteerProfile.findUniqueOrThrow({
      where: { id: input.volunteerId },
      include: { hoursLogs: true },
    });

    const rating = Math.min(5, Math.max(1, input.supervisorRating || 5));

    const logRecord = await prisma.$transaction(async (tx) => {
      // 1. Create Hours Log
      const log = await tx.volunteerHoursLog.create({
        data: {
          volunteerId: volunteer.id,
          assignmentId: input.assignmentId || null,
          date: input.date ? new Date(input.date) : new Date(),
          hoursLogged: new Prisma.Decimal(input.hoursLogged),
          tasksCompleted: input.tasksCompleted.trim(),
          supervisorRating: rating,
          supervisorNotes: input.supervisorNotes || null,
          verifiedBy: input.verifiedBy || 'FIELD_COORDINATOR',
          isVerified: true,
        },
      });

      // 2. Compute new lifetime rating
      const existingRatings = volunteer.hoursLogs.map((h) => h.supervisorRating);
      const allRatings = [...existingRatings, rating];
      const avgRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;

      // 3. Update Volunteer Profile
      await tx.volunteerProfile.update({
        where: { id: volunteer.id },
        data: {
          totalHoursLogged: { increment: new Prisma.Decimal(input.hoursLogged) },
          performanceRating: new Prisma.Decimal(Number(avgRating.toFixed(2))),
        },
      });

      // 4. Update Assignment status if linked
      if (input.assignmentId) {
        await tx.volunteerAssignment.update({
          where: { id: input.assignmentId },
          data: { status: AssignmentStatus.COMPLETED },
        });
      }

      return log;
    });

    await createAuditLog({
      action: 'VOLUNTEER_HOURS_LOGGED',
      entity: 'VolunteerHoursLog',
      entityId: logRecord.id,
      newData: {
        volunteerNumber: volunteer.volunteerNumber,
        hoursLogged: input.hoursLogged,
        rating,
      },
    });

    return logRecord;
  }

  /**
   * Issues an Official Volunteer Service / Excellence Certificate
   */
  public static async issueVolunteerCertificate(
    volunteerId: string,
    certType: CertificateType = CertificateType.VOLUNTEER_EXCELLENCE,
    title?: string,
    description?: string
  ) {
    const volunteer = await prisma.volunteerProfile.findUniqueOrThrow({
      where: { id: volunteerId },
    });

    const certTitle = title || `Award of ${certType === CertificateType.VOLUNTEER_EXCELLENCE ? 'Excellence' : 'Distinction'} in Humanitarian Service`;
    const certDesc =
      description ||
      `In recognition of outstanding dedication, having completed ${Number(volunteer.totalHoursLogged)} hours of direct humanitarian field operations with a distinguished rating of ${Number(volunteer.performanceRating)}/5.00.`;

    return DocumentService.issueCertificate({
      certificateType: certType,
      recipientName: volunteer.fullName,
      recipientEmail: volunteer.email,
      volunteerId: volunteer.id,
      title: certTitle,
      description: certDesc,
    });
  }

  /**
   * Retrieves volunteer profile by ID, Number, or QR Hash
   */
  public static async getVolunteerProfile(idOrNumber: string) {
    return prisma.volunteerProfile.findFirst({
      where: {
        OR: [
          { id: idOrNumber },
          { volunteerNumber: idOrNumber },
          { qrVerificationHash: idOrNumber },
        ],
      },
      include: {
        assignments: {
          orderBy: { createdAt: 'desc' },
        },
        hoursLogs: {
          orderBy: { date: 'desc' },
          include: { assignment: { select: { title: true, assignmentNumber: true } } },
        },
        certificates: {
          orderBy: { issuedAt: 'desc' },
        },
      },
    });
  }

  /**
   * Lists volunteers with filtering by status, skills, availability, and search
   */
  public static async listVolunteers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    skill?: string;
    availability?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const search = params.search?.trim() || '';

    const where: any = {
      ...(params.status ? { status: params.status as any } : {}),
      ...(params.availability ? { availability: params.availability } : {}),
      ...(params.skill ? { skills: { has: params.skill } } : {}),
      ...(search
        ? {
            OR: [
              { volunteerNumber: { contains: search, mode: 'insensitive' } },
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [totalRecords, volunteers] = await Promise.all([
      prisma.volunteerProfile.count({ where }),
      prisma.volunteerProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignments: { take: 2, orderBy: { createdAt: 'desc' } },
          certificates: { take: 1, orderBy: { issuedAt: 'desc' } },
        },
      }),
    ]);

    return {
      volunteers,
      meta: {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  /**
   * Retrieves high-level Volunteer KPI statistics
   */
  public static async getVolunteerAnalytics() {
    const [totalVolunteers, activeVolunteers, underReviewCount, totalHours] = await Promise.all([
      prisma.volunteerProfile.count(),
      prisma.volunteerProfile.count({ where: { status: VolunteerStatus.ACTIVE } }),
      prisma.volunteerProfile.count({ where: { status: VolunteerStatus.APPLIED } }),
      prisma.volunteerProfile.aggregate({
        _sum: { totalHoursLogged: true },
      }),
    ]);

    return {
      totalVolunteers,
      activeVolunteers,
      pendingApplications: underReviewCount,
      totalHoursLogged: Number(totalHours._sum.totalHoursLogged || 0),
    };
  }
}
