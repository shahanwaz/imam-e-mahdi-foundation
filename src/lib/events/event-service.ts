import { prisma } from '@/lib/db';
import {
  Event,
  EventSpeaker,
  EventRegistration,
  EventFeedback,
  EventReport,
  EventType,
  EventCategory,
  EventStatus,
  EventRegistrationStatus,
  TicketType,
  AttendanceMethod,
  Prisma,
} from '@prisma/client';
import { generateHmacSignature, verifyHmacSignature } from '@/lib/crypto';
import { createAuditLog } from '@/lib/audit';

export interface CreateEventParams {
  title: string;
  slug?: string;
  summary: string;
  description: string;
  eventType?: EventType;
  category?: EventCategory;
  startDate: Date | string;
  endDate: Date | string;
  registrationDeadline?: Date | string | null;
  capacityMax?: number;
  isFree?: boolean;
  ticketFeeINR?: number;
  allowWaitlist?: boolean;
  requiresApproval?: boolean;
  venueName?: string | null;
  venueAddress?: string | null;
  venueCity?: string | null;
  venueMapUrl?: string | null;
  venueGpsLat?: number | null;
  venueGpsLng?: number | null;
  isVirtual?: boolean;
  meetingPlatform?: string | null;
  meetingJoinUrl?: string | null;
  meetingStreamKeyMasked?: string | null;
  meetingRecordingUrl?: string | null;
  streamEmbedCode?: string | null;
  coverImageUrl?: string | null;
  bannerImageUrl?: string | null;
  galleryUrls?: string[];
  organizerName?: string;
  organizerEmail?: string;
  organizerPhone?: string | null;
  speakers?: Array<{
    name: string;
    titleRole: string;
    organization?: string;
    bio?: string;
    photoUrl?: string;
    topicTitle?: string;
    presentationTime?: string;
    displayOrder?: number;
  }>;
  createdById?: string;
}

export interface RegisterEventParams {
  eventId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  organization?: string | null;
  ticketType?: TicketType;
  notes?: string | null;
  userId?: string | null;
}

export interface GateCheckInParams {
  passSignatureHash: string;
  checkedInByUserId?: string;
  method?: AttendanceMethod;
}

export interface SubmitFeedbackParams {
  eventId: string;
  registrationId?: string | null;
  participantName?: string | null;
  ratingOverall: number;
  ratingContent?: number;
  ratingVenueOrPlatform?: number;
  comments?: string | null;
  suggestions?: string | null;
  isAnonymous?: boolean;
}

export interface PostEventReportParams {
  eventId: string;
  totalVolunteersEngaged?: number;
  totalCostINR?: number;
  keyOutcomes: string;
  shariaComplianceCertified?: boolean;
  submittedByUserId?: string;
}

export class EventService {
  /**
   * Generates sequential Event number (e.g. IMF-EVT-2026-00001)
   */
  public static async generateNextEventNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.event.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-EVT-${year}-${sequence}`;
  }

  /**
   * Generates sequential Registration number (e.g. IMF-REG-2026-00001)
   */
  public static async generateNextRegistrationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.eventRegistration.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-REG-${year}-${sequence}`;
  }

  /**
   * Generates a URL-friendly slug from title
   */
  public static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Computes tamper-proof HMAC-SHA256 signature hash for an event digital pass
   */
  public static computeTicketHash(params: {
    registrationNumber: string;
    eventId: string;
    fullName: string;
    email: string;
    registeredAt: Date;
  }): string {
    const payload = [
      params.registrationNumber,
      params.eventId,
      params.fullName.trim(),
      params.email.toLowerCase().trim(),
      params.registeredAt.toISOString(),
    ].join('|');

    return generateHmacSignature(payload);
  }

  /**
   * Creates a new event with optional speakers and configuration
   */
  public static async createEvent(params: CreateEventParams) {
    const eventNumber = await EventService.generateNextEventNumber();
    const baseSlug = params.slug || EventService.slugify(params.title);
    const existingSlug = await prisma.event.findUnique({ where: { slug: baseSlug } });
    const slug = existingSlug ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

    const event = await prisma.event.create({
      data: {
        eventNumber,
        title: params.title.trim(),
        slug,
        summary: params.summary.trim(),
        description: params.description.trim(),
        eventType: params.eventType || EventType.IN_PERSON,
        category: params.category || EventCategory.COMMUNITY_MAJLIS,
        status: EventStatus.DRAFT,
        startDate: new Date(params.startDate),
        endDate: new Date(params.endDate),
        registrationDeadline: params.registrationDeadline ? new Date(params.registrationDeadline) : null,
        capacityMax: params.capacityMax ?? 100,
        capacityReserved: 0,
        isFree: params.isFree ?? true,
        ticketFeeINR: params.ticketFeeINR ?? 0.0,
        allowWaitlist: params.allowWaitlist ?? true,
        requiresApproval: params.requiresApproval ?? false,
        venueName: params.venueName || null,
        venueAddress: params.venueAddress || null,
        venueCity: params.venueCity || null,
        venueMapUrl: params.venueMapUrl || null,
        venueGpsLat: params.venueGpsLat ? new Prisma.Decimal(params.venueGpsLat) : null,
        venueGpsLng: params.venueGpsLng ? new Prisma.Decimal(params.venueGpsLng) : null,
        isVirtual: params.isVirtual ?? (params.eventType === EventType.VIRTUAL_ONLINE || params.eventType === EventType.HYBRID),
        meetingPlatform: params.meetingPlatform || null,
        meetingJoinUrl: params.meetingJoinUrl || null,
        meetingStreamKeyMasked: params.meetingStreamKeyMasked || null,
        meetingRecordingUrl: params.meetingRecordingUrl || null,
        streamEmbedCode: params.streamEmbedCode || null,
        coverImageUrl: params.coverImageUrl || '/images/events/default-cover.jpg',
        bannerImageUrl: params.bannerImageUrl || null,
        galleryUrls: params.galleryUrls || [],
        organizerName: params.organizerName || 'Imam E Mahdi Foundation',
        organizerEmail: params.organizerEmail || 'events@imf-ngo.org',
        organizerPhone: params.organizerPhone || null,
        speakers: params.speakers && params.speakers.length > 0 ? {
          create: params.speakers.map((spk, idx) => ({
            name: spk.name,
            titleRole: spk.titleRole,
            organization: spk.organization || null,
            bio: spk.bio || null,
            photoUrl: spk.photoUrl || null,
            topicTitle: spk.topicTitle || null,
            presentationTime: spk.presentationTime || null,
            displayOrder: spk.displayOrder ?? idx,
          })),
        } : undefined,
      },
      include: {
        speakers: true,
      },
    });

    await createAuditLog({
      action: 'EVENT_CREATED',
      entity: 'Event',
      entityId: event.id,
      userId: params.createdById || undefined,
      newData: {
        eventNumber,
        title: event.title,
        eventType: event.eventType,
        category: event.category,
        capacityMax: event.capacityMax,
      },
    });

    return event;
  }

  /**
   * Updates an existing event
   */
  public static async updateEvent(
    idOrNumber: string,
    params: Partial<CreateEventParams>,
    updatedByUserId?: string
  ) {
    const existing = await prisma.event.findFirst({
      where: {
        OR: [{ id: idOrNumber }, { eventNumber: idOrNumber }, { slug: idOrNumber }],
      },
    });

    if (!existing) {
      throw new Error(`Event ${idOrNumber} not found.`);
    }

    const data: Prisma.EventUpdateInput = {};
    if (params.title !== undefined) data.title = params.title.trim();
    if (params.summary !== undefined) data.summary = params.summary.trim();
    if (params.description !== undefined) data.description = params.description.trim();
    if (params.eventType !== undefined) data.eventType = params.eventType;
    if (params.category !== undefined) data.category = params.category;
    if (params.startDate !== undefined) data.startDate = new Date(params.startDate);
    if (params.endDate !== undefined) data.endDate = new Date(params.endDate);
    if (params.registrationDeadline !== undefined) {
      data.registrationDeadline = params.registrationDeadline ? new Date(params.registrationDeadline) : null;
    }
    if (params.capacityMax !== undefined) data.capacityMax = params.capacityMax;
    if (params.isFree !== undefined) data.isFree = params.isFree;
    if (params.ticketFeeINR !== undefined) data.ticketFeeINR = params.ticketFeeINR;
    if (params.allowWaitlist !== undefined) data.allowWaitlist = params.allowWaitlist;
    if (params.requiresApproval !== undefined) data.requiresApproval = params.requiresApproval;
    if (params.venueName !== undefined) data.venueName = params.venueName;
    if (params.venueAddress !== undefined) data.venueAddress = params.venueAddress;
    if (params.venueCity !== undefined) data.venueCity = params.venueCity;
    if (params.venueMapUrl !== undefined) data.venueMapUrl = params.venueMapUrl;
    if (params.venueGpsLat !== undefined) {
      data.venueGpsLat = params.venueGpsLat ? new Prisma.Decimal(params.venueGpsLat) : null;
    }
    if (params.venueGpsLng !== undefined) {
      data.venueGpsLng = params.venueGpsLng ? new Prisma.Decimal(params.venueGpsLng) : null;
    }
    if (params.isVirtual !== undefined) data.isVirtual = params.isVirtual;
    if (params.meetingPlatform !== undefined) data.meetingPlatform = params.meetingPlatform;
    if (params.meetingJoinUrl !== undefined) data.meetingJoinUrl = params.meetingJoinUrl;
    if (params.meetingStreamKeyMasked !== undefined) data.meetingStreamKeyMasked = params.meetingStreamKeyMasked;
    if (params.meetingRecordingUrl !== undefined) data.meetingRecordingUrl = params.meetingRecordingUrl;
    if (params.streamEmbedCode !== undefined) data.streamEmbedCode = params.streamEmbedCode;
    if (params.coverImageUrl !== undefined) data.coverImageUrl = params.coverImageUrl;
    if (params.bannerImageUrl !== undefined) data.bannerImageUrl = params.bannerImageUrl;
    if (params.galleryUrls !== undefined) data.galleryUrls = params.galleryUrls;
    if (params.organizerName !== undefined) data.organizerName = params.organizerName;
    if (params.organizerEmail !== undefined) data.organizerEmail = params.organizerEmail;
    if (params.organizerPhone !== undefined) data.organizerPhone = params.organizerPhone;

    const updated = await prisma.event.update({
      where: { id: existing.id },
      data,
      include: {
        speakers: { orderBy: { displayOrder: 'asc' } },
        report: true,
      },
    });

    await createAuditLog({
      action: 'EVENT_UPDATED',
      entity: 'Event',
      entityId: existing.id,
      userId: updatedByUserId || undefined,
      newData: { ...params },
      previousData: { status: existing.status, title: existing.title },
    });

    return updated;
  }

  /**
   * Transitions event lifecycle status (Draft -> Published -> Registration Open -> Completed -> Archived)
   */
  public static async transitionStatus(
    idOrNumber: string,
    newStatus: EventStatus,
    userId?: string
  ) {
    const event = await prisma.event.findFirst({
      where: { OR: [{ id: idOrNumber }, { eventNumber: idOrNumber }, { slug: idOrNumber }] },
    });

    if (!event) {
      throw new Error(`Event ${idOrNumber} not found.`);
    }

    const isPublishing = (newStatus === EventStatus.PUBLISHED || newStatus === EventStatus.REGISTRATION_OPEN) && !event.publishedAt;

    const updated = await prisma.event.update({
      where: { id: event.id },
      data: {
        status: newStatus,
        publishedAt: isPublishing ? new Date() : event.publishedAt,
      },
    });

    await createAuditLog({
      action: 'EVENT_STATUS_TRANSITION',
      entity: 'Event',
      entityId: event.id,
      userId: userId || undefined,
      newData: { status: newStatus },
      previousData: { status: event.status },
    });

    return updated;
  }

  /**
   * Adds a speaker to an event
   */
  public static async addSpeaker(eventId: string, speaker: {
    name: string;
    titleRole: string;
    organization?: string;
    bio?: string;
    photoUrl?: string;
    topicTitle?: string;
    presentationTime?: string;
    displayOrder?: number;
  }) {
    return prisma.eventSpeaker.create({
      data: {
        eventId,
        name: speaker.name.trim(),
        titleRole: speaker.titleRole.trim(),
        organization: speaker.organization || null,
        bio: speaker.bio || null,
        photoUrl: speaker.photoUrl || null,
        topicTitle: speaker.topicTitle || null,
        presentationTime: speaker.presentationTime || null,
        displayOrder: speaker.displayOrder ?? 0,
      },
    });
  }

  /**
   * Registers a participant with concurrency & capacity enforcement and generates a signed QR digital pass
   */
  public static async registerForEvent(params: RegisterEventParams) {
    const event = await prisma.event.findFirst({
      where: {
        OR: [{ id: params.eventId }, { eventNumber: params.eventId }, { slug: params.eventId }],
      },
      include: {
        registrations: {
          where: { email: params.email.toLowerCase().trim() },
        },
      },
    });

    if (!event) {
      throw new Error(`Event not found.`);
    }

    // Duplicate registration check
    const existingRegistration = event.registrations[0];
    if (existingRegistration && existingRegistration.registrationStatus !== EventRegistrationStatus.CANCELLED) {
      return {
        isDuplicate: true,
        registration: existingRegistration,
        event,
        message: 'Attendee is already registered for this event.',
      };
    }

    // Capacity & Waitlist logic
    let registrationStatus: EventRegistrationStatus = EventRegistrationStatus.REGISTERED;
    const isAtCapacity = event.capacityReserved >= event.capacityMax;

    if (isAtCapacity) {
      if (event.allowWaitlist) {
        registrationStatus = EventRegistrationStatus.WAITLISTED;
      } else {
        throw new Error(`Event capacity of ${event.capacityMax} attendees reached. Registrations are closed.`);
      }
    }

    const registrationNumber = await EventService.generateNextRegistrationNumber();
    const registeredAt = new Date();

    const passSignatureHash = EventService.computeTicketHash({
      registrationNumber,
      eventId: event.id,
      fullName: params.fullName,
      email: params.email,
      registeredAt,
    });

    const qrVerificationUrl = `http://localhost:3001/verify/event-ticket/${passSignatureHash}`;

    // Atomic transaction to create registration and increment capacity if not waitlisted
    const [registration] = await prisma.$transaction([
      prisma.eventRegistration.create({
        data: {
          registrationNumber,
          eventId: event.id,
          userId: params.userId || null,
          fullName: params.fullName.trim(),
          email: params.email.toLowerCase().trim(),
          phone: params.phone || null,
          city: params.city || null,
          organization: params.organization || null,
          notes: params.notes || null,
          registrationStatus,
          ticketType: params.ticketType || TicketType.STANDARD,
          passSignatureHash,
          qrVerificationUrl,
          registeredAt,
        },
      }),
      ...(registrationStatus === EventRegistrationStatus.REGISTERED
        ? [
            prisma.event.update({
              where: { id: event.id },
              data: { capacityReserved: { increment: 1 } },
            }),
          ]
        : []),
    ]);

    await createAuditLog({
      action: 'EVENT_REGISTRATION_CREATED',
      entity: 'EventRegistration',
      entityId: registration.id,
      userId: params.userId || undefined,
      newData: {
        registrationNumber,
        eventId: event.id,
        fullName: params.fullName,
        email: params.email,
        registrationStatus,
        passSignatureHash,
      },
    });

    return {
      isDuplicate: false,
      registration,
      event,
      message: registrationStatus === EventRegistrationStatus.WAITLISTED
        ? 'Capacity reached. You have been placed on the priority waitlist.'
        : 'Registration confirmed successfully!',
    };
  }

  /**
   * Fast gate check-in verifying QR ticket pass with HMAC signature and duplicate detection
   */
  public static async verifyTicketAndCheckIn(params: GateCheckInParams) {
    const registration = await prisma.eventRegistration.findUnique({
      where: { passSignatureHash: params.passSignatureHash },
      include: { event: true },
    });

    if (!registration) {
      return {
        valid: false,
        alreadyCheckedIn: false,
        message: 'Invalid or forged event pass. Signature mismatch.',
        registration: null,
      };
    }

    if (registration.isCheckedIn) {
      return {
        valid: true,
        alreadyCheckedIn: true,
        message: `Already checked in on ${registration.checkedInAt?.toLocaleString() || 'earlier today'}.`,
        registration,
        event: registration.event,
      };
    }

    const checkedInAt = new Date();
    const updatedRegistration = await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: {
        isCheckedIn: true,
        checkedInAt,
        checkedInByUserId: params.checkedInByUserId || null,
        attendanceMethod: params.method || AttendanceMethod.QR_SCAN_GATE,
        registrationStatus: EventRegistrationStatus.CHECKED_IN,
      },
      include: { event: true },
    });

    await createAuditLog({
      action: 'EVENT_TICKET_CHECKED_IN',
      entity: 'EventRegistration',
      entityId: registration.id,
      userId: params.checkedInByUserId || undefined,
      newData: {
        registrationNumber: registration.registrationNumber,
        checkedInAt,
        method: params.method || 'QR_SCAN_GATE',
      },
    });

    return {
      valid: true,
      alreadyCheckedIn: false,
      message: 'Gate check-in verified successfully. Welcome to the event!',
      registration: updatedRegistration,
      event: updatedRegistration.event,
    };
  }

  /**
   * Submits feedback for an event
   */
  public static async submitFeedback(params: SubmitFeedbackParams) {
    const feedback = await prisma.eventFeedback.create({
      data: {
        eventId: params.eventId,
        registrationId: params.registrationId || null,
        participantName: params.isAnonymous ? 'Anonymous Attendee' : params.participantName || 'Anonymous Attendee',
        ratingOverall: Math.min(5, Math.max(1, params.ratingOverall)),
        ratingContent: params.ratingContent ? Math.min(5, Math.max(1, params.ratingContent)) : 5,
        ratingVenueOrPlatform: params.ratingVenueOrPlatform ? Math.min(5, Math.max(1, params.ratingVenueOrPlatform)) : 5,
        comments: params.comments || null,
        suggestions: params.suggestions || null,
        isAnonymous: params.isAnonymous ?? false,
      },
    });

    if (params.registrationId) {
      await prisma.eventRegistration.update({
        where: { id: params.registrationId },
        data: { hasSubmittedFeedback: true },
      }).catch(() => null);
    }

    return feedback;
  }

  /**
   * Generates or updates post-event impact report
   */
  public static async createPostEventReport(params: PostEventReportParams) {
    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      include: { registrations: true },
    });

    if (!event) {
      throw new Error(`Event ${params.eventId} not found.`);
    }

    const totalRegistered = event.registrations.length;
    const totalAttended = event.registrations.filter((r) => r.isCheckedIn).length;
    const attendanceRatePercent = totalRegistered > 0 ? (totalAttended / totalRegistered) * 100 : 0;

    const report = await prisma.eventReport.upsert({
      where: { eventId: event.id },
      create: {
        eventId: event.id,
        totalRegistered,
        totalAttended,
        totalVolunteersEngaged: params.totalVolunteersEngaged ?? 0,
        attendanceRatePercent: new Prisma.Decimal(attendanceRatePercent.toFixed(2)),
        totalCostINR: params.totalCostINR ? new Prisma.Decimal(params.totalCostINR) : new Prisma.Decimal(0),
        keyOutcomes: params.keyOutcomes.trim(),
        shariaComplianceCertified: params.shariaComplianceCertified ?? true,
        submittedByUserId: params.submittedByUserId || null,
      },
      update: {
        totalRegistered,
        totalAttended,
        totalVolunteersEngaged: params.totalVolunteersEngaged ?? undefined,
        attendanceRatePercent: new Prisma.Decimal(attendanceRatePercent.toFixed(2)),
        totalCostINR: params.totalCostINR !== undefined ? new Prisma.Decimal(params.totalCostINR) : undefined,
        keyOutcomes: params.keyOutcomes.trim(),
        shariaComplianceCertified: params.shariaComplianceCertified ?? undefined,
        submittedByUserId: params.submittedByUserId || undefined,
      },
    });

    await createAuditLog({
      action: 'EVENT_REPORT_SUBMITTED',
      entity: 'EventReport',
      entityId: report.id,
      userId: params.submittedByUserId || undefined,
      newData: {
        eventId: event.id,
        totalAttended,
        attendanceRatePercent,
      },
    });

    return report;
  }

  /**
   * Fetches event by ID, eventNumber, or slug
   */
  public static async getEventByIdOrSlug(idOrSlug: string) {
    return prisma.event.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { eventNumber: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        speakers: { orderBy: { displayOrder: 'asc' } },
        report: true,
        feedbackResponses: {
          orderBy: { submittedAt: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            registrations: true,
            feedbackResponses: true,
          },
        },
      },
    });
  }

  /**
   * Fetches aggregated analytics for events dashboard
   */
  public static async getEventAnalytics() {
    const totalEvents = await prisma.event.count();
    const upcomingEvents = await prisma.event.count({
      where: {
        status: { in: [EventStatus.PUBLISHED, EventStatus.REGISTRATION_OPEN] },
        startDate: { gte: new Date() },
      },
    });
    const totalRegistrations = await prisma.eventRegistration.count();
    const totalAttended = await prisma.eventRegistration.count({
      where: { isCheckedIn: true },
    });

    const avgAttendanceRate = totalRegistrations > 0 ? ((totalAttended / totalRegistrations) * 100).toFixed(1) : '0';

    const feedbackAggregate = await prisma.eventFeedback.aggregate({
      _avg: { ratingOverall: true },
      _count: { id: true },
    });

    return {
      totalEvents,
      upcomingEvents,
      totalRegistrations,
      totalAttended,
      avgAttendanceRate: `${avgAttendanceRate}%`,
      avgSatisfactionRating: feedbackAggregate._avg.ratingOverall ? feedbackAggregate._avg.ratingOverall.toFixed(1) : '5.0',
      totalFeedbackCount: feedbackAggregate._count.id,
    };
  }

  /**
   * Lists events with filtering
   */
  public static async listEvents(options: {
    category?: EventCategory;
    status?: EventStatus;
    eventType?: EventType;
    search?: string;
    isPublicOnly?: boolean;
    take?: number;
    skip?: number;
  }) {
    const where: Prisma.EventWhereInput = {};

    if (options.isPublicOnly) {
      where.status = {
        in: [EventStatus.PUBLISHED, EventStatus.REGISTRATION_OPEN, EventStatus.IN_PROGRESS, EventStatus.COMPLETED],
      };
    } else if (options.status) {
      where.status = options.status;
    }

    if (options.category) where.category = options.category;
    if (options.eventType) where.eventType = options.eventType;

    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { summary: { contains: options.search, mode: 'insensitive' } },
        { eventNumber: { contains: options.search, mode: 'insensitive' } },
        { venueCity: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          speakers: { orderBy: { displayOrder: 'asc' } },
          report: true,
          _count: {
            select: { registrations: true, feedbackResponses: true },
          },
        },
        orderBy: { startDate: 'desc' },
        take: options.take || 50,
        skip: options.skip || 0,
      }),
      prisma.event.count({ where }),
    ]);

    return { events, total };
  }
}
