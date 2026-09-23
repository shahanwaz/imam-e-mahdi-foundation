import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecruitmentService } from '@/lib/recruitment/recruitment-service';
import {
  EmploymentType,
  JobPostingStatus,
  JobApplicationStatus,
  InterviewRound,
  InterviewRecommendation,
  JobOfferStatus,
  EmployeeStatus,
} from '@prisma/client';

vi.mock('@/lib/db', async () => {
  const {
    Prisma,
    EmploymentType: ET,
    JobPostingStatus: JPS,
    JobApplicationStatus: JAS,
    InterviewRound: IR,
    InterviewRecommendation: IRE,
    JobOfferStatus: JOS,
    EmployeeStatus: ES,
  } = await vi.importActual<typeof import('@prisma/client')>('@prisma/client');

  const defaultMockJob = {
    id: 'job_test_1',
    jobCode: 'IMF-JOB-2026-00001',
    title: 'Disaster Response Logistics Lead',
    slug: 'disaster-response-logistics-lead',
    departmentId: 'dept_ops_1',
    designationId: 'desig_coord_1',
    employmentType: ET.FULL_TIME,
    locationCity: 'Lucknow',
    isRemoteAllowed: false,
    vacanciesCount: 2,
    experienceMinYears: 3,
    qualification: 'Bachelor in Logistics / Humanitarian Aid',
    salaryRangeDisplay: '₹45,000 - ₹65,000 / mo',
    description: 'Coordinate emergency logistics, supply inventory, and volunteer convoys.',
    requirements: '3+ years field NGO logistics, driving license, emergency triage awareness.',
    benefits: 'Comprehensive health cover, hazard allowance, travel reimbursement.',
    status: JPS.PUBLISHED,
    publishedAt: new Date(),
    closingDate: new Date('2026-12-31'),
    createdAt: new Date(),
    updatedAt: new Date(),
    department: { id: 'dept_ops_1', name: 'Field Relief & Operations', code: 'FIELD_OPS' },
    designation: { id: 'desig_coord_1', title: 'Senior Field Coordinator', level: 3 },
    _count: { applications: 5 },
  };

  const defaultMockApplication = {
    id: 'app_test_1',
    applicationNumber: 'IMF-APP-2026-00001',
    jobPostingId: 'job_test_1',
    fullName: 'Salman Mirza',
    email: 'salman.mirza@example.com',
    phone: '+919876541122',
    city: 'Lucknow',
    currentOrganization: 'Red Crescent Volunteer Network',
    currentDesignation: 'Field Officer',
    totalExperienceYears: new Prisma.Decimal(4.5),
    resumeUrl: 'https://storage.imame-mahdi.org/resumes/salman_mirza.pdf',
    coverLetter: 'Passionate about humanitarian emergency logistics and community service.',
    status: JAS.SHORTLISTED,
    shortlistRating: 5,
    reviewNotes: 'Strong logistical experience in flood relief operations.',
    appliedAt: new Date(),
    jobPosting: defaultMockJob,
    interviews: [],
    offers: [
      {
        id: 'offer_test_1',
        offerNumber: 'IMF-OFF-2026-00001',
        applicationId: 'app_test_1',
        offeredDesignation: 'Senior Field Coordinator',
        offeredDepartment: 'Field Relief & Operations',
        annualCTC: new Prisma.Decimal(660000),
        monthlyGrossINR: new Prisma.Decimal(55000),
        joiningDate: new Date('2026-11-01'),
        offerExpiryDate: new Date('2026-10-15'),
        status: JOS.ACCEPTED,
        acceptedAt: new Date(),
        createdAt: new Date(),
      },
    ],
  };

  const defaultMockInterview = {
    id: 'int_test_1',
    interviewNumber: 'IMF-INT-2026-00001',
    applicationId: 'app_test_1',
    round: IR.TECHNICAL_ASSESSMENT,
    scheduledAt: new Date('2026-10-05T10:00:00Z'),
    interviewerNames: ['Director Imran', 'Lead Engineer Zeeshan'],
    evaluationScore: 5,
    technicalCompetencyNotes: 'Demonstrated exceptional knowledge of supply chain during emergencies.',
    culturalFitNotes: 'High empathy, align perfectly with foundation values.',
    recommendation: IRE.STRONG_HIRE,
    completedAt: new Date(),
    createdAt: new Date(),
  };

  return {
    prisma: {
      jobPosting: {
        count: vi.fn().mockResolvedValue(8),
        findUnique: vi.fn().mockResolvedValue(null),
        findFirst: vi.fn().mockResolvedValue(defaultMockJob),
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            id: 'job_new_1',
            ...data,
            department: { id: data.departmentId, name: 'Operations', code: 'OPS' },
            designation: { id: data.designationId, title: 'Lead', level: 3 },
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }),
        update: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({ ...defaultMockJob, ...data });
        }),
        findMany: vi.fn().mockResolvedValue([defaultMockJob]),
      },
      jobApplication: {
        count: vi.fn().mockResolvedValue(32),
        findUnique: vi.fn().mockImplementation(({ where }: any) => {
          if (where.id === 'app_test_1' || where.applicationNumber === 'IMF-APP-2026-00001') {
            return Promise.resolve(defaultMockApplication);
          }
          return Promise.resolve(null);
        }),
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            id: 'app_new_1',
            ...data,
            createdAt: new Date(),
          });
        }),
        update: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({ ...defaultMockApplication, ...data });
        }),
        findMany: vi.fn().mockResolvedValue([defaultMockApplication]),
      },
      jobInterview: {
        count: vi.fn().mockResolvedValue(15),
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            id: 'int_new_1',
            ...data,
            createdAt: new Date(),
          });
        }),
        findUnique: vi.fn().mockResolvedValue(defaultMockInterview),
        update: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({ ...defaultMockInterview, ...data });
        }),
        findMany: vi.fn().mockResolvedValue([defaultMockInterview]),
      },
      jobOffer: {
        count: vi.fn().mockResolvedValue(4),
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            id: 'off_new_1',
            ...data,
            createdAt: new Date(),
          });
        }),
        findUnique: vi.fn().mockResolvedValue(defaultMockApplication.offers[0]),
        update: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({ ...defaultMockApplication.offers[0], ...data });
        }),
        findMany: vi.fn().mockResolvedValue(defaultMockApplication.offers),
      },
      employeeProfile: {
        count: vi.fn().mockResolvedValue(54),
        create: vi.fn().mockResolvedValue({
          id: 'emp_hired_1',
          employeeNumber: 'IMF-EMP-2026-00055',
          fullName: 'Salman Mirza',
          email: 'salman.mirza@example.com',
          status: ES.PROBATION,
        }),
      },
      $transaction: vi.fn().mockImplementation((promises: any[]) => Promise.all(promises)),
    },
  };
});

vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn().mockResolvedValue({ id: 'audit_log_mock' }),
}));

vi.mock('@/lib/hr/hr-service', () => ({
  HrService: {
    createEmployee: vi.fn().mockResolvedValue({
      id: 'emp_hired_1',
      employeeNumber: 'IMF-EMP-2026-00055',
      fullName: 'Salman Mirza',
      email: 'salman.mirza@example.com',
      status: 'PROBATION',
      departmentId: 'dept_ops_1',
      designationId: 'desig_coord_1',
    }),
  },
}));

describe('Recruitment Agent & Talent Acquisition Pipeline Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Sequential Number Generators', () => {
    it('should generate properly formatted Job Requisition numbers (IMF-JOB-YYYY-XXXXX)', async () => {
      const jobNum = await RecruitmentService.generateNextJobNumber();
      const currentYear = new Date().getFullYear();
      expect(jobNum).toMatch(new RegExp(`^IMF-JOB-${currentYear}-\\d{5}$`));
    });

    it('should generate formatted Application numbers (IMF-APP-YYYY-XXXXX)', async () => {
      const appNum = await RecruitmentService.generateNextApplicationNumber();
      const currentYear = new Date().getFullYear();
      expect(appNum).toMatch(new RegExp(`^IMF-APP-${currentYear}-\\d{5}$`));
    });

    it('should generate formatted Interview numbers (IMF-INT-YYYY-XXXXX)', async () => {
      const intNum = await RecruitmentService.generateNextInterviewNumber();
      const currentYear = new Date().getFullYear();
      expect(intNum).toMatch(new RegExp(`^IMF-INT-${currentYear}-\\d{5}$`));
    });

    it('should generate formatted Job Offer numbers (IMF-OFF-YYYY-XXXXX)', async () => {
      const offNum = await RecruitmentService.generateNextOfferNumber();
      const currentYear = new Date().getFullYear();
      expect(offNum).toMatch(new RegExp(`^IMF-OFF-${currentYear}-\\d{5}$`));
    });
  });

  describe('Job Requisition Creation & Status Workflow', () => {
    it('should create a job posting with sequential job code and auto-generated slug', async () => {
      const job = await RecruitmentService.createJobPosting({
        title: 'Emergency Medical Coordinator',
        departmentId: 'dept_health_1',
        designationId: 'desig_med_1',
        employmentType: EmploymentType.FULL_TIME,
        locationCity: 'Delhi Hub',
        description: 'Coordinate disaster medical units and mobile camps.',
        requirements: 'MBBS or MD with public health experience.',
        status: JobPostingStatus.PUBLISHED,
      });

      expect(job).toBeDefined();
      expect(job.jobCode).toMatch(/^IMF-JOB-\d{4}-\d{5}$/);
      expect(job.slug).toBe('emergency-medical-coordinator');
    });

    it('should transition job posting lifecycle status and update published date', async () => {
      const updated = await RecruitmentService.updateJobPostingStatus('job_test_1', JobPostingStatus.CLOSED, 'user_hr_1');
      expect(updated).toBeDefined();
      expect(updated.status).toBe(JobPostingStatus.CLOSED);
    });

    it('should list public job postings', async () => {
      const publicJobs = await RecruitmentService.listPublicJobPostings();
      expect(publicJobs).toHaveLength(1);
      expect(publicJobs[0].title).toBe('Disaster Response Logistics Lead');
    });
  });

  describe('Candidate Application Intake & Screening', () => {
    it('should accept candidate application and assign sequential application tracking ID', async () => {
      const application = await RecruitmentService.submitApplication({
        jobPostingId: 'job_test_1',
        fullName: 'Amina Khatoon',
        email: 'amina.khatoon@example.com',
        phone: '+919876500334',
        city: 'Lucknow',
        currentOrganization: 'Health First NGO',
        currentDesignation: 'Senior Nurse / Field Medic',
        totalExperienceYears: 5.0,
        resumeUrl: 'https://storage.imame-mahdi.org/resumes/amina_khatoon.pdf',
        coverLetter: 'Dedicated to rural primary health mission.',
      });

      expect(application).toBeDefined();
      expect(application.applicationNumber).toMatch(/^IMF-APP-\d{4}-\d{5}$/);
      expect(application.fullName).toBe('Amina Khatoon');
    });

    it('should shortlist candidate with rating and review notes', async () => {
      const screened = await RecruitmentService.shortlistCandidate(
        'app_test_1',
        5,
        'Exceptional clinical credentials and emergency field record.'
      );

      expect(screened).toBeDefined();
      expect(screened.status).toBe(JobApplicationStatus.SHORTLISTED);
      expect(screened.shortlistRating).toBe(5);
    });
  });

  describe('Interview Scheduling & Structured Scoring', () => {
    it('should schedule interview round with sequential ID', async () => {
      const interview = await RecruitmentService.scheduleInterview({
        applicationId: 'app_test_1',
        round: InterviewRound.TECHNICAL_ASSESSMENT,
        scheduledAt: new Date('2026-10-10T14:00:00Z'),
        interviewerNames: ['Dr. Haider Ali', 'Director Fatima'],
      });

      expect(interview).toBeDefined();
      expect(interview.interviewNumber).toMatch(/^IMF-INT-\d{4}-\d{5}$/);
      expect(interview.round).toBe(InterviewRound.TECHNICAL_ASSESSMENT);
    });

    it('should record interview feedback and scoring recommendation', async () => {
      const feedback = await RecruitmentService.recordInterviewFeedback({
        interviewId: 'int_test_1',
        evaluationScore: 5,
        technicalCompetencyNotes: 'Impeccable crisis triage management skills.',
        culturalFitNotes: 'Exemplifies core humanitarian values.',
        recommendation: InterviewRecommendation.STRONG_HIRE,
      });

      expect(feedback).toBeDefined();
      expect(feedback.evaluationScore).toBe(5);
      expect(feedback.recommendation).toBe(InterviewRecommendation.STRONG_HIRE);
    });
  });

  describe('Job Offer Generation & 1-Click Appointment Onboarding', () => {
    it('should create formal job offer with CTC and expiry', async () => {
      const offer = await RecruitmentService.createJobOffer({
        applicationId: 'app_test_1',
        offeredDesignation: 'Senior Field Coordinator',
        offeredDepartment: 'Field Relief & Operations',
        annualCTC_INR: 720000,
        monthlyGrossINR: 60000,
        joiningDate: new Date('2026-11-15'),
        offerExpiryDate: new Date('2026-10-30'),
      });

      expect(offer).toBeDefined();
      expect(offer.offerNumber).toMatch(/^IMF-OFF-\d{4}-\d{5}$/);
    });

    it('should transition hired candidate into official EmployeeProfile record', async () => {
      const result = await RecruitmentService.appointCandidateToEmployee('app_test_1', 'user_lead_hr');

      expect(result).toBeDefined();
      expect(result.employee).toBeDefined();
      expect(result.employee.employeeNumber).toBe('IMF-EMP-2026-00055');
      expect(result.employee.fullName).toBe('Salman Mirza');
      expect(result.application).toBeDefined();
    });
  });
});
