import { prisma } from '@/lib/db';
import {
  JobPosting,
  JobApplication,
  JobInterview,
  JobOffer,
  EmploymentType,
  JobPostingStatus,
  JobApplicationStatus,
  InterviewRound,
  InterviewRecommendation,
  JobOfferStatus,
  EmployeeStatus,
  Prisma,
} from '@prisma/client';
import { createAuditLog } from '@/lib/audit';
import { HrService } from '@/lib/hr/hr-service';

export interface CreateJobPostingParams {
  title: string;
  slug?: string;
  departmentId: string;
  designationId: string;
  employmentType?: EmploymentType;
  locationCity?: string;
  isRemoteAllowed?: boolean;
  vacanciesCount?: number;
  experienceMinYears?: number;
  qualification?: string | null;
  salaryRangeDisplay?: string | null;
  description: string;
  requirements: string;
  benefits?: string | null;
  status?: JobPostingStatus;
  closingDate?: Date | string | null;
  createdById?: string;
}

export interface SubmitApplicationParams {
  jobPostingId: string;
  fullName: string;
  email: string;
  phone: string;
  city?: string | null;
  currentOrganization?: string | null;
  currentDesignation?: string | null;
  totalExperienceYears?: number | null;
  resumeUrl: string;
  coverLetter?: string | null;
  portfolioUrl?: string | null;
}

export interface ScheduleInterviewParams {
  applicationId: string;
  round?: InterviewRound;
  scheduledAt: Date | string;
  interviewerNames: string[];
}

export interface InterviewFeedbackParams {
  interviewId: string;
  evaluationScore: number;
  technicalCompetencyNotes?: string | null;
  culturalFitNotes?: string | null;
  recommendation: InterviewRecommendation;
}

export interface CreateJobOfferParams {
  applicationId: string;
  offeredDesignation: string;
  offeredDepartment: string;
  annualCTC_INR: number;
  monthlyGrossINR: number;
  joiningDate: Date | string;
  offerExpiryDate: Date | string;
  offerLetterUrl?: string | null;
  createdById?: string;
}

export class RecruitmentService {
  /**
   * Generates sequential Job Requisition Code (e.g. IMF-JOB-2026-00001)
   */
  public static async generateNextJobNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.jobPosting.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-JOB-${year}-${sequence}`;
  }

  /**
   * Generates sequential Candidate Application Number (e.g. IMF-APP-2026-00001)
   */
  public static async generateNextApplicationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.jobApplication.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-APP-${year}-${sequence}`;
  }

  /**
   * Generates sequential Interview Identifier (e.g. IMF-INT-2026-00001)
   */
  public static async generateNextInterviewNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.jobInterview.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-INT-${year}-${sequence}`;
  }

  /**
   * Generates sequential Job Offer Reference (e.g. IMF-OFF-2026-00001)
   */
  public static async generateNextOfferNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.jobOffer.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-OFF-${year}-${sequence}`;
  }

  /**
   * Generates URL slug from job title
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
   * Creates a new Job Requisition Posting
   */
  public static async createJobPosting(params: CreateJobPostingParams) {
    const jobCode = await RecruitmentService.generateNextJobNumber();
    const baseSlug = params.slug || RecruitmentService.slugify(params.title);
    const existing = await prisma.jobPosting.findUnique({ where: { slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

    const job = await prisma.jobPosting.create({
      data: {
        jobCode,
        title: params.title.trim(),
        slug,
        departmentId: params.departmentId,
        designationId: params.designationId,
        employmentType: params.employmentType || EmploymentType.FULL_TIME,
        locationCity: params.locationCity || 'New Delhi',
        isRemoteAllowed: params.isRemoteAllowed ?? false,
        vacanciesCount: params.vacanciesCount ?? 1,
        experienceMinYears: params.experienceMinYears ?? 0,
        qualification: params.qualification || null,
        salaryRangeDisplay: params.salaryRangeDisplay || null,
        description: params.description.trim(),
        requirements: params.requirements.trim(),
        benefits: params.benefits || null,
        status: params.status || JobPostingStatus.DRAFT,
        publishedAt: params.status === JobPostingStatus.PUBLISHED ? new Date() : null,
        closingDate: params.closingDate ? new Date(params.closingDate) : null,
      },
      include: {
        department: true,
        designation: true,
      },
    });

    await createAuditLog({
      action: 'RECRUITMENT_JOB_POSTING_CREATED',
      entity: 'JobPosting',
      entityId: job.id,
      userId: params.createdById || undefined,
      newData: {
        jobCode,
        title: job.title,
        departmentId: job.departmentId,
        status: job.status,
      },
    });

    return job;
  }

  /**
   * Transitions Job Posting lifecycle status (Draft -> Published -> On Hold -> Closed)
   */
  public static async updateJobPostingStatus(idOrCode: string, status: JobPostingStatus, userId?: string) {
    const job = await prisma.jobPosting.findFirst({
      where: { OR: [{ id: idOrCode }, { jobCode: idOrCode }, { slug: idOrCode }] },
    });

    if (!job) throw new Error(`Job posting ${idOrCode} not found.`);

    const isPublishing = status === JobPostingStatus.PUBLISHED && !job.publishedAt;

    const updated = await prisma.jobPosting.update({
      where: { id: job.id },
      data: {
        status,
        publishedAt: isPublishing ? new Date() : job.publishedAt,
      },
    });

    await createAuditLog({
      action: 'RECRUITMENT_JOB_STATUS_UPDATED',
      entity: 'JobPosting',
      entityId: job.id,
      userId: userId || undefined,
      newData: { status },
      previousData: { status: job.status },
    });

    return updated;
  }

  /**
   * Candidate Application Intake
   */
  public static async submitApplication(params: SubmitApplicationParams) {
    const job = await prisma.jobPosting.findFirst({
      where: { OR: [{ id: params.jobPostingId }, { jobCode: params.jobPostingId }, { slug: params.jobPostingId }] },
    });

    if (!job) throw new Error('Job posting not found.');

    const applicationNumber = await RecruitmentService.generateNextApplicationNumber();

    const application = await prisma.jobApplication.create({
      data: {
        applicationNumber,
        jobPostingId: job.id,
        fullName: params.fullName.trim(),
        email: params.email.toLowerCase().trim(),
        phone: params.phone.trim(),
        city: params.city || null,
        currentOrganization: params.currentOrganization || null,
        currentDesignation: params.currentDesignation || null,
        totalExperienceYears: params.totalExperienceYears ? new Prisma.Decimal(params.totalExperienceYears) : null,
        resumeUrl: params.resumeUrl.trim(),
        coverLetter: params.coverLetter || null,
        portfolioUrl: params.portfolioUrl || null,
        status: JobApplicationStatus.APPLIED,
      },
      include: {
        jobPosting: {
          include: { department: true, designation: true },
        },
      },
    });

    await createAuditLog({
      action: 'RECRUITMENT_APPLICATION_SUBMITTED',
      entity: 'JobApplication',
      entityId: application.id,
      newData: {
        applicationNumber,
        jobCode: job.jobCode,
        fullName: application.fullName,
        email: application.email,
      },
    });

    return application;
  }

  /**
   * Shortlists candidate and records initial evaluation notes
   */
  public static async shortlistCandidate(applicationId: string, shortlistRating: number, reviewNotes?: string) {
    const application = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: JobApplicationStatus.SHORTLISTED,
        shortlistRating: Math.min(5, Math.max(1, shortlistRating)),
        reviewNotes: reviewNotes || null,
      },
    });

    return application;
  }

  /**
   * Schedules an Interview Round for a candidate
   */
  public static async scheduleInterview(params: ScheduleInterviewParams) {
    const interviewNumber = await RecruitmentService.generateNextInterviewNumber();

    const [interview] = await prisma.$transaction([
      prisma.jobInterview.create({
        data: {
          interviewNumber,
          applicationId: params.applicationId,
          round: params.round || InterviewRound.HR_SCREENING,
          scheduledAt: new Date(params.scheduledAt),
          interviewerNames: params.interviewerNames,
        },
      }),
      prisma.jobApplication.update({
        where: { id: params.applicationId },
        data: { status: JobApplicationStatus.INTERVIEW_SCHEDULED },
      }),
    ]);

    await createAuditLog({
      action: 'RECRUITMENT_INTERVIEW_SCHEDULED',
      entity: 'JobInterview',
      entityId: interview.id,
      newData: {
        interviewNumber,
        applicationId: params.applicationId,
        round: interview.round,
        scheduledAt: interview.scheduledAt,
      },
    });

    return interview;
  }

  /**
   * Records interview scores, notes, and recommendation
   */
  public static async recordInterviewFeedback(params: InterviewFeedbackParams) {
    const interview = await prisma.jobInterview.update({
      where: { id: params.interviewId },
      data: {
        evaluationScore: Math.min(5, Math.max(1, params.evaluationScore)),
        technicalCompetencyNotes: params.technicalCompetencyNotes || null,
        culturalFitNotes: params.culturalFitNotes || null,
        recommendation: params.recommendation,
        completedAt: new Date(),
      },
      include: {
        application: true,
      },
    });

    await prisma.jobApplication.update({
      where: { id: interview.applicationId },
      data: { status: JobApplicationStatus.INTERVIEWED },
    });

    return interview;
  }

  /**
   * Generates a formal Job Offer
   */
  public static async createJobOffer(params: CreateJobOfferParams) {
    const offerNumber = await RecruitmentService.generateNextOfferNumber();

    const [offer] = await prisma.$transaction([
      prisma.jobOffer.create({
        data: {
          offerNumber,
          applicationId: params.applicationId,
          offeredDesignation: params.offeredDesignation.trim(),
          offeredDepartment: params.offeredDepartment.trim(),
          annualCTC_INR: new Prisma.Decimal(params.annualCTC_INR),
          monthlyGrossINR: new Prisma.Decimal(params.monthlyGrossINR),
          joiningDate: new Date(params.joiningDate),
          offerExpiryDate: new Date(params.offerExpiryDate),
          offerLetterUrl: params.offerLetterUrl || null,
          status: JobOfferStatus.EXTENDED_PENDING,
        },
      }),
      prisma.jobApplication.update({
        where: { id: params.applicationId },
        data: { status: JobApplicationStatus.OFFER_EXTENDED },
      }),
    ]);

    await createAuditLog({
      action: 'RECRUITMENT_OFFER_EXTENDED',
      entity: 'JobOffer',
      entityId: offer.id,
      userId: params.createdById || undefined,
      newData: {
        offerNumber,
        applicationId: params.applicationId,
        annualCTC: params.annualCTC_INR,
      },
    });

    return offer;
  }

  /**
   * Appoints an accepted candidate into the official Employee Profile registry
   */
  public static async appointCandidateToEmployee(applicationId: string, appointedByUserId?: string) {
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        jobPosting: true,
        offers: { where: { status: JobOfferStatus.ACCEPTED } },
      },
    });

    if (!application) throw new Error('Application not found.');

    const offer = application.offers[0];

    // Create Employee Profile
    const employee = await HrService.createEmployee({
      fullName: application.fullName,
      email: application.email,
      phone: application.phone,
      departmentId: application.jobPosting.departmentId,
      designationId: application.jobPosting.designationId,
      employmentType: application.jobPosting.employmentType,
      status: EmployeeStatus.PROBATION,
      joiningDate: offer?.joiningDate || new Date(),
      monthlySalaryINR: offer?.monthlyGrossINR ? Number(offer.monthlyGrossINR) : 0,
      createdById: appointedByUserId,
    });

    // Update application and offer status
    await prisma.$transaction([
      prisma.jobApplication.update({
        where: { id: applicationId },
        data: { status: JobApplicationStatus.HIRED_APPOINTED },
      }),
      ...(offer
        ? [
            prisma.jobOffer.update({
              where: { id: offer.id },
              data: { employeeProfileId: employee.id },
            }),
          ]
        : []),
    ]);

    await createAuditLog({
      action: 'RECRUITMENT_CANDIDATE_HIRED_AND_APPOINTED',
      entity: 'EmployeeProfile',
      entityId: employee.id,
      userId: appointedByUserId || undefined,
      newData: {
        applicationNumber: application.applicationNumber,
        employeeNumber: employee.employeeNumber,
        fullName: employee.fullName,
      },
    });

    return { employee, application };
  }

  /**
   * Lists public job postings
   */
  public static async listPublicJobPostings(departmentCode?: string) {
    const where: Prisma.JobPostingWhereInput = {
      status: JobPostingStatus.PUBLISHED,
    };

    if (departmentCode) {
      where.department = { code: departmentCode };
    }

    return prisma.jobPosting.findMany({
      where,
      include: {
        department: true,
        designation: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Lists all applications for Admin Recruitment Hub
   */
  public static async listApplications(options: {
    jobPostingId?: string;
    status?: JobApplicationStatus;
    search?: string;
  }) {
    const where: Prisma.JobApplicationWhereInput = {};

    if (options.jobPostingId) where.jobPostingId = options.jobPostingId;
    if (options.status) where.status = options.status;
    if (options.search) {
      where.OR = [
        { fullName: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
        { applicationNumber: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    return prisma.jobApplication.findMany({
      where,
      include: {
        jobPosting: { include: { department: true, designation: true } },
        interviews: { orderBy: { scheduledAt: 'desc' } },
        offers: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }
}
