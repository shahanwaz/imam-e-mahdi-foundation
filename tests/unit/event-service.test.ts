import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventService } from '@/lib/events/event-service';
import {
  EventType,
  EventCategory,
  EventStatus,
  EventRegistrationStatus,
  TicketType,
  AttendanceMethod,
} from '@prisma/client';

vi.mock('@/lib/db', async () => {
  const {
    Prisma,
    EventType: ET,
    EventCategory: EC,
    EventStatus: ES,
    EventRegistrationStatus: ERS,
    TicketType: TT,
    AttendanceMethod: AM,
  } = await vi.importActual<typeof import('@prisma/client')>('@prisma/client');

  const defaultMockEvent = {
    id: 'evt_test_1',
    eventNumber: 'IMF-EVT-2026-00001',
    title: 'Free Diagnostic Medical Camp',
    slug: 'free-diagnostic-medical-camp',
    summary: 'Community medical camp providing free diagnostics',
    description: 'Detailed description of healthcare delivery camp',
    eventType: ET.IN_PERSON,
    category: EC.MEDICAL_CAMP,
    status: ES.DRAFT,
    startDate: new Date('2026-04-10T09:00:00Z'),
    endDate: new Date('2026-04-10T17:00:00Z'),
    registrationDeadline: new Date('2026-04-09T23:59:59Z'),
    capacityMax: 100,
    capacityReserved: 40,
    isFree: true,
    ticketFeeINR: new Prisma.Decimal(0),
    allowWaitlist: true,
    requiresApproval: false,
    venueName: 'Community Medical Hall',
    venueCity: 'Lucknow',
    venueAddress: 'Sector 4, Chowk',
    isVirtual: false,
    coverImageUrl: '/images/events/medical.jpg',
    organizerName: 'Imam E Mahdi Medical Wing',
    organizerEmail: 'medical@imf-ngo.org',
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    speakers: [],
    registrations: [],
  };

  const defaultMockRegistration = {
    id: 'reg_test_1',
    registrationNumber: 'IMF-REG-2026-00001',
    eventId: 'evt_test_1',
    fullName: 'Syed Ali Reza',
    email: 'ali.reza@gmail.com',
    phone: '+91 9876543210',
    city: 'Lucknow',
    registrationStatus: ERS.REGISTERED,
    ticketType: TT.STANDARD,
    passSignatureHash: 'test_hash_sig_1234567890abcdef',
    qrVerificationUrl: 'http://localhost:3001/verify/event-ticket/test_hash_sig_1234567890abcdef',
    isCheckedIn: false,
    checkedInAt: null,
    checkedInByUserId: null,
    attendanceMethod: null,
    hasSubmittedFeedback: false,
    registeredAt: new Date(),
    updatedAt: new Date(),
    event: defaultMockEvent,
  };

  return {
    prisma: {
      event: {
        count: vi.fn().mockImplementation((args?: any) => {
          if (args?.where?.status?.in) return Promise.resolve(2);
          return Promise.resolve(5);
        }),
        findUnique: vi.fn().mockImplementation(({ where }: any) => {
          if (where?.slug) return Promise.resolve(null);
          return Promise.resolve(defaultMockEvent);
        }),
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          if (where?.OR?.some((cond: any) => cond.id === 'evt_at_capacity')) {
            return Promise.resolve({
              ...defaultMockEvent,
              id: 'evt_at_capacity',
              capacityMax: 50,
              capacityReserved: 50,
              allowWaitlist: true,
              registrations: [],
            });
          }
          return Promise.resolve(defaultMockEvent);
        }),
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            ...defaultMockEvent,
            ...data,
            id: 'evt_created_new',
            eventNumber: 'IMF-EVT-2026-00006',
          });
        }),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          return Promise.resolve({
            ...defaultMockEvent,
            ...data,
          });
        }),
        findMany: vi.fn().mockResolvedValue([defaultMockEvent]),
      },
      eventSpeaker: {
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            id: 'spk_new',
            ...data,
          });
        }),
      },
      eventRegistration: {
        count: vi.fn().mockResolvedValue(15),
        findUnique: vi.fn().mockImplementation(({ where }: any) => {
          if (where.passSignatureHash === 'already_checked_in_hash') {
            return Promise.resolve({
              ...defaultMockRegistration,
              isCheckedIn: true,
              checkedInAt: new Date('2026-04-10T10:00:00Z'),
            });
          }
          if (where.passSignatureHash === 'valid_qr_pass_hash') {
            return Promise.resolve({
              ...defaultMockRegistration,
              isCheckedIn: false,
            });
          }
          return Promise.resolve(null);
        }),
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            ...defaultMockRegistration,
            ...data,
            id: 'reg_created_new',
          });
        }),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          return Promise.resolve({
            ...defaultMockRegistration,
            ...data,
            isCheckedIn: true,
            checkedInAt: new Date(),
          });
        }),
        findMany: vi.fn().mockResolvedValue([defaultMockRegistration]),
      },
      eventFeedback: {
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            id: 'fb_1',
            ...data,
            submittedAt: new Date(),
          });
        }),
        aggregate: vi.fn().mockResolvedValue({
          _avg: { ratingOverall: 4.8 },
          _count: { id: 24 },
        }),
      },
      eventReport: {
        upsert: vi.fn().mockImplementation(({ create, update }: any) => {
          return Promise.resolve({
            id: 'rep_1',
            ...create,
            attendanceRatePercent: new Prisma.Decimal(88.5),
            submittedAt: new Date(),
          });
        }),
      },
      $transaction: vi.fn().mockImplementation((promises: any[]) => {
        return Promise.all(promises);
      }),
    },
  };
});

vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn().mockResolvedValue({ id: 'audit_log_mock' }),
}));

describe('EventService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate sequential event and registration numbers', async () => {
    const eventNumber = await EventService.generateNextEventNumber();
    expect(eventNumber).toMatch(/^IMF-EVT-\d{4}-\d{5}$/);

    const regNumber = await EventService.generateNextRegistrationNumber();
    expect(regNumber).toMatch(/^IMF-REG-\d{4}-\d{5}$/);
  });

  it('should create an event with automatic slug generation and audit logging', async () => {
    const event = await EventService.createEvent({
      title: 'Global Webinar on Sharia Philanthropy',
      summary: 'Virtual seminar for donors and volunteers',
      description: 'Full details of Islamic finance seminar',
      eventType: EventType.VIRTUAL_ONLINE,
      category: EventCategory.SEMINAR_WORKSHOP,
      startDate: new Date('2026-05-01T14:00:00Z'),
      endDate: new Date('2026-05-01T16:00:00Z'),
      capacityMax: 500,
      meetingPlatform: 'ZOOM',
      meetingJoinUrl: 'https://zoom.us/j/123456789',
      speakers: [
        {
          name: 'Maulana Syed Ali Naqvi',
          titleRole: 'Scholar',
          topicTitle: 'Zakat Principles',
        },
      ],
    });

    expect(event).toBeDefined();
    expect(event.slug).toBe('global-webinar-on-sharia-philanthropy');
    expect(event.status).toBe(EventStatus.DRAFT);
  });

  it('should transition event lifecycle status and record publication timestamp', async () => {
    const updated = await EventService.transitionStatus('evt_test_1', EventStatus.PUBLISHED, 'user_admin_1');
    expect(updated.status).toBe(EventStatus.PUBLISHED);
    expect(updated.publishedAt).toBeDefined();
  });

  it('should compute cryptographic HMAC-SHA256 signature for attendee ticket passes', () => {
    const hash = EventService.computeTicketHash({
      registrationNumber: 'IMF-REG-2026-00001',
      eventId: 'evt_test_1',
      fullName: 'Syed Ali Reza',
      email: 'ali.reza@gmail.com',
      registeredAt: new Date('2026-04-01T12:00:00Z'),
    });

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBe(64); // SHA256 hex string length
  });

  it('should register participant and enforce capacity limit with waitlist support', async () => {
    // 1. Normal Registration
    const result = await EventService.registerForEvent({
      eventId: 'evt_test_1',
      fullName: 'Fatima Batool',
      email: 'fatima.batool@gmail.com',
      phone: '+91 9811122334',
      ticketType: TicketType.STANDARD,
    });

    expect(result.isDuplicate).toBe(false);
    expect(result.registration).toBeDefined();
    expect(result.registration.passSignatureHash).toBeDefined();
    expect(result.registration.qrVerificationUrl).toContain('/verify/event-ticket/');

    // 2. Registration when at full capacity
    const waitlistResult = await EventService.registerForEvent({
      eventId: 'evt_at_capacity',
      fullName: 'Zain Abbas',
      email: 'zain.abbas@gmail.com',
    });

    expect(waitlistResult.registration.registrationStatus).toBe(EventRegistrationStatus.WAITLISTED);
    expect(waitlistResult.message).toContain('waitlist');
  });

  it('should verify ticket at gate check-in and prevent duplicate scans', async () => {
    // 1. Successful Gate Check-in
    const scanResult = await EventService.verifyTicketAndCheckIn({
      passSignatureHash: 'valid_qr_pass_hash',
      checkedInByUserId: 'gate_marshal_1',
      method: AttendanceMethod.QR_SCAN_GATE,
    });

    expect(scanResult.valid).toBe(true);
    expect(scanResult.alreadyCheckedIn).toBe(false);
    expect(scanResult.registration?.isCheckedIn).toBe(true);

    // 2. Duplicate Gate Scan Check
    const duplicateResult = await EventService.verifyTicketAndCheckIn({
      passSignatureHash: 'already_checked_in_hash',
      checkedInByUserId: 'gate_marshal_1',
    });

    expect(duplicateResult.valid).toBe(true);
    expect(duplicateResult.alreadyCheckedIn).toBe(true);
    expect(duplicateResult.message).toContain('Already checked in');

    // 3. Forged / Invalid Hash Check
    const forgedResult = await EventService.verifyTicketAndCheckIn({
      passSignatureHash: 'forged_fake_hash_999',
    });

    expect(forgedResult.valid).toBe(false);
    expect(forgedResult.message).toContain('Invalid or forged');
  });

  it('should record attendee feedback and generate post-event audited report', async () => {
    // Submit Feedback
    const feedback = await EventService.submitFeedback({
      eventId: 'evt_test_1',
      ratingOverall: 5,
      ratingContent: 5,
      ratingVenueOrPlatform: 4,
      comments: 'Excellent organization and prompt diagnostic report delivery.',
      isAnonymous: false,
    });

    expect(feedback).toBeDefined();
    expect(feedback.ratingOverall).toBe(5);

    // Generate Post Event Report
    const report = await EventService.createPostEventReport({
      eventId: 'evt_test_1',
      totalVolunteersEngaged: 20,
      totalCostINR: 35000,
      keyOutcomes: 'Screened 450 beneficiaries and identified 85 high-risk cardiology cases for secondary care.',
      shariaComplianceCertified: true,
      submittedByUserId: 'user_director_1',
    });

    expect(report).toBeDefined();
    expect(report.shariaComplianceCertified).toBe(true);
  });
});
