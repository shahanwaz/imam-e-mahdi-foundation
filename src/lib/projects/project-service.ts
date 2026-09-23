import { prisma } from '@/lib/db';
import { ProjectStage, ProjectCategory, Prisma } from '@prisma/client';
import { createAuditLog } from '@/lib/audit';

export interface CreateProjectInput {
  title: string;
  slug?: string;
  category: ProjectCategory;
  description: string;
  locationCountry?: string;
  locationState?: string;
  locationDistrict?: string;
  targetBeneficiariesCount?: number;
  allocatedBudgetINR: number;
  startDate?: Date | string;
  targetCompletionDate?: Date | string;
  projectManagerUserId?: string;
  isPublicFeatured?: boolean;
}

export interface CreateMilestoneInput {
  projectId: string;
  title: string;
  description: string;
  targetDate: Date | string;
  budgetAllocationINR?: number;
}

export interface CreateMetricInput {
  projectId: string;
  indicatorName: string;
  unitOfMeasure: string;
  targetValue: number;
}

export class ProjectService {
  /**
   * Generates sequential project serial number (e.g. IMF-PRJ-2026-00012)
   */
  public static async generateNextProjectNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.project.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-PRJ-${year}-${sequence}`;
  }

  /**
   * Helper to slugify title
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
   * Creates a new project in the initial IDEA / PROPOSAL stage
   */
  public static async createProject(input: CreateProjectInput) {
    if (!input.title || input.title.trim().length < 3) {
      throw new Error('Project title must be at least 3 characters.');
    }
    if (!input.description || input.description.trim().length < 10) {
      throw new Error('Project description must be comprehensive (min 10 chars).');
    }

    const projectNumber = await ProjectService.generateNextProjectNumber();
    const slug = input.slug ? ProjectService.slugify(input.slug) : `${ProjectService.slugify(input.title)}-${Date.now().toString().slice(-4)}`;

    const project = await prisma.project.create({
      data: {
        projectNumber,
        slug,
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category || ProjectCategory.EMERGENCY_DISASTER_RELIEF,
        stage: ProjectStage.IDEA,
        locationCountry: input.locationCountry || 'India',
        locationState: input.locationState || null,
        locationDistrict: input.locationDistrict || null,
        targetBeneficiariesCount: input.targetBeneficiariesCount || 0,
        allocatedBudgetINR: new Prisma.Decimal(input.allocatedBudgetINR || 0),
        startDate: input.startDate ? new Date(input.startDate) : null,
        targetCompletionDate: input.targetCompletionDate ? new Date(input.targetCompletionDate) : null,
        projectManagerUserId: input.projectManagerUserId || null,
        isPublicFeatured: input.isPublicFeatured || false,
      },
    });

    await createAuditLog({
      action: 'PROJECT_CREATED',
      entity: 'Project',
      entityId: project.id,
      newData: {
        projectNumber,
        title: input.title,
        category: input.category,
        budget: input.allocatedBudgetINR,
      },
    });

    return project;
  }

  /**
   * Advances or updates the 10-stage lifecycle of a project
   * IDEA -> PROPOSAL -> APPROVED -> FUNDRAISING -> EXECUTION -> FIELD_OPERATIONS -> MONITORING -> IMPACT_EVALUATION -> CLOSURE -> FINAL_REPORT_SUBMITTED
   */
  public static async updateProjectStage(params: {
    projectId: string;
    newStage: ProjectStage;
    closureReportSummary?: string;
    actualCompletionDate?: Date | string;
    actorUserId?: string;
  }) {
    const project = await prisma.project.findUniqueOrThrow({
      where: { id: params.projectId },
    });

    const isClosure = params.newStage === ProjectStage.CLOSURE || params.newStage === ProjectStage.FINAL_REPORT_SUBMITTED;

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: {
        stage: params.newStage,
        closureReportSummary: params.closureReportSummary || project.closureReportSummary,
        closureAuditedAt: isClosure ? new Date() : project.closureAuditedAt,
        actualCompletionDate: params.actualCompletionDate ? new Date(params.actualCompletionDate) : (isClosure && !project.actualCompletionDate ? new Date() : project.actualCompletionDate),
      },
    });

    await createAuditLog({
      action: 'PROJECT_STAGE_TRANSITION',
      entity: 'Project',
      entityId: project.id,
      userId: params.actorUserId || 'SYSTEM',
      newData: {
        projectNumber: project.projectNumber,
        previousStage: project.stage,
        newStage: params.newStage,
      },
    });

    return updated;
  }

  /**
   * Adds milestone to project
   */
  public static async addMilestone(input: CreateMilestoneInput) {
    const milestone = await prisma.projectMilestone.create({
      data: {
        projectId: input.projectId,
        title: input.title.trim(),
        description: input.description.trim(),
        targetDate: new Date(input.targetDate),
        budgetAllocationINR: new Prisma.Decimal(input.budgetAllocationINR || 0),
      },
    });

    return milestone;
  }

  /**
   * Marks milestone as completed with verification remarks
   */
  public static async completeMilestone(milestoneId: string, verificationNotes?: string) {
    const updated = await prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        isCompleted: true,
        completionDate: new Date(),
        verificationNotes: verificationNotes || null,
      },
    });

    return updated;
  }

  /**
   * Adds an M&E quantitative metric indicator to a project
   */
  public static async addMetric(input: CreateMetricInput) {
    const metric = await prisma.projectMetric.create({
      data: {
        projectId: input.projectId,
        indicatorName: input.indicatorName.trim(),
        unitOfMeasure: input.unitOfMeasure.trim(),
        targetValue: new Prisma.Decimal(input.targetValue),
        currentValue: new Prisma.Decimal(0),
      },
    });

    return metric;
  }

  /**
   * Updates metric progress with evaluation notes
   */
  public static async updateMetricProgress(metricId: string, currentValue: number, notes?: string) {
    const updated = await prisma.projectMetric.update({
      where: { id: metricId },
      data: {
        currentValue: new Prisma.Decimal(currentValue),
        lastEvaluatedAt: new Date(),
        evaluationNotes: notes || null,
      },
    });

    return updated;
  }

  /**
   * Retrieves single project with milestones, metrics, field visits, and assistance records
   */
  public static async getProject(idOrNumberOrSlug: string) {
    return prisma.project.findFirst({
      where: {
        OR: [
          { id: idOrNumberOrSlug },
          { projectNumber: idOrNumberOrSlug },
          { slug: idOrNumberOrSlug },
        ],
      },
      include: {
        milestones: { orderBy: { targetDate: 'asc' } },
        metrics: { orderBy: { createdAt: 'asc' } },
        fieldVisits: { take: 5, orderBy: { scheduledDate: 'desc' } },
        assistanceRecords: { take: 10, orderBy: { disbursementDate: 'desc' } },
        projectManager: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Lists projects with filtering by stage, category, and keyword search
   */
  public static async listProjects(params: {
    page?: number;
    limit?: number;
    search?: string;
    stage?: ProjectStage | string;
    category?: ProjectCategory | string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const search = params.search?.trim() || '';

    const where: any = {
      ...(params.stage ? { stage: params.stage as ProjectStage } : {}),
      ...(params.category ? { category: params.category as ProjectCategory } : {}),
      ...(search
        ? {
            OR: [
              { projectNumber: { contains: search, mode: 'insensitive' } },
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { locationDistrict: { contains: search, mode: 'insensitive' } },
              { locationState: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [totalRecords, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          milestones: true,
          metrics: true,
          projectManager: { select: { name: true, email: true } },
        },
      }),
    ]);

    return {
      projects,
      meta: {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  /**
   * Aggregates executive project portfolio metrics
   */
  public static async getProjectAnalytics() {
    const [totalProjects, activeProjects, completedProjects, aggregates] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({
        where: {
          stage: {
            in: [
              ProjectStage.APPROVED,
              ProjectStage.FUNDRAISING,
              ProjectStage.EXECUTION,
              ProjectStage.FIELD_OPERATIONS,
              ProjectStage.MONITORING,
            ],
          },
        },
      }),
      prisma.project.count({
        where: {
          stage: {
            in: [ProjectStage.CLOSURE, ProjectStage.FINAL_REPORT_SUBMITTED],
          },
        },
      }),
      prisma.project.aggregate({
        _sum: {
          allocatedBudgetINR: true,
          disbursedAmountINR: true,
          targetBeneficiariesCount: true,
          actualBeneficiariesCount: true,
        },
      }),
    ]);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalAllocatedBudgetINR: Number(aggregates._sum.allocatedBudgetINR || 0),
      totalDisbursedAmountINR: Number(aggregates._sum.disbursedAmountINR || 0),
      totalTargetBeneficiaries: Number(aggregates._sum.targetBeneficiariesCount || 0),
      totalActualBeneficiariesServed: Number(aggregates._sum.actualBeneficiariesCount || 0),
    };
  }
}
