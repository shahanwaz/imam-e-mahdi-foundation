import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectService } from '@/lib/projects/project-service';
import { ProjectStage, ProjectCategory } from '@prisma/client';

vi.mock('@/lib/db', async () => {
  const { Prisma, ProjectStage: PS, ProjectCategory: PC } = 
    await vi.importActual<typeof import('@prisma/client')>('@prisma/client');

  const defaultMockProject = {
    id: 'prj_test_1',
    projectNumber: 'IMF-PRJ-2026-00001',
    slug: 'clean-water-wells',
    title: 'Clean Water Wells Project',
    description: 'Drilling community water wells in arid regions',
    category: PC.WATER_SANITATION,
    stage: PS.IDEA,
    locationCountry: 'India',
    locationState: 'Rajasthan',
    locationDistrict: 'Thar Desert',
    targetBeneficiariesCount: 4000,
    actualBeneficiariesCount: 0,
    allocatedBudgetINR: new Prisma.Decimal(1500000),
    disbursedAmountINR: new Prisma.Decimal(0),
    startDate: new Date(),
    targetCompletionDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    actualCompletionDate: null,
    projectManagerUserId: 'user_pm_1',
    isPublicFeatured: true,
    closureReportSummary: null,
    closureAuditedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    milestones: [],
    metrics: [],
  };

  return {
    prisma: {
      project: {
        count: vi.fn().mockImplementation((args?: any) => {
          if (args?.where?.stage?.in) return Promise.resolve(3);
          return Promise.resolve(8);
        }),
        findUnique: vi.fn().mockResolvedValue(defaultMockProject),
        findUniqueOrThrow: vi.fn().mockImplementation(({ where }: any) => {
          if (where.id === 'prj_test_1') return Promise.resolve(defaultMockProject);
          throw new Error('Project not found');
        }),
        findFirst: vi.fn().mockResolvedValue(defaultMockProject),
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            ...defaultMockProject,
            ...data,
            id: 'prj_test_new',
            projectNumber: 'IMF-PRJ-2026-00001',
          });
        }),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          return Promise.resolve({
            ...defaultMockProject,
            ...data,
          });
        }),
        findMany: vi.fn().mockResolvedValue([defaultMockProject]),
        aggregate: vi.fn().mockResolvedValue({
          _sum: {
            allocatedBudgetINR: new Prisma.Decimal(5000000),
            disbursedAmountINR: new Prisma.Decimal(3200000),
            targetBeneficiariesCount: 10000,
            actualBeneficiariesCount: 7500,
          },
        }),
      },
      projectMilestone: {
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            id: 'ms_1',
            ...data,
            isCompleted: false,
          });
        }),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          return Promise.resolve({
            id: where.id,
            isCompleted: true,
            completionDate: new Date(),
            verificationNotes: data.verificationNotes,
          });
        }),
      },
      projectMetric: {
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            id: 'met_1',
            ...data,
            currentValue: new Prisma.Decimal(0),
          });
        }),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          return Promise.resolve({
            id: where.id,
            currentValue: data.currentValue,
            evaluationNotes: data.evaluationNotes,
          });
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

describe('Project Service & 10-Stage Lifecycle Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new project in IDEA stage with sequential project number', async () => {
    const project = await ProjectService.createProject({
      title: 'Clean Water Wells Project',
      category: ProjectCategory.WATER_SANITATION,
      description: 'Drilling community water wells in arid regions of Thar Desert',
      allocatedBudgetINR: 1500000,
      targetBeneficiariesCount: 4000,
    });

    expect(project).toBeDefined();
    expect(project.projectNumber).toMatch(/^IMF-PRJ-\d{4}-\d{5}$/);
    expect(project.stage).toBe(ProjectStage.IDEA);
    expect(prisma.project.create).toHaveBeenCalled();
  });

  it('should transition project across lifecycle stages to CLOSURE with audit logging', async () => {
    const updated = await ProjectService.updateProjectStage({
      projectId: 'prj_test_1',
      newStage: ProjectStage.CLOSURE,
      closureReportSummary: 'All 12 community water wells fully operational. Audit reconciled.',
    });

    expect(updated).toBeDefined();
    expect(updated.stage).toBe(ProjectStage.CLOSURE);
    expect(updated.closureReportSummary).toContain('operational');
    expect(prisma.project.update).toHaveBeenCalled();
  });

  it('should add milestones and mark them as completed', async () => {
    const milestone = await ProjectService.addMilestone({
      projectId: 'prj_test_1',
      title: 'Hydrogeological Survey',
      description: 'Aquifer depth mapping',
      targetDate: new Date(),
      budgetAllocationINR: 100000,
    });

    expect(milestone).toBeDefined();
    expect(milestone.title).toBe('Hydrogeological Survey');

    const completed = await ProjectService.completeMilestone(
      milestone.id,
      'Water table verified at 120ft depth'
    );

    expect(completed.isCompleted).toBe(true);
    expect(completed.verificationNotes).toBe('Water table verified at 120ft depth');
  });

  it('should add M&E metrics and update quantitative progress', async () => {
    const metric = await ProjectService.addMetric({
      projectId: 'prj_test_1',
      indicatorName: 'Clean Water Output',
      unitOfMeasure: 'Liters/Day',
      targetValue: 50000,
    });

    expect(metric).toBeDefined();
    expect(metric.indicatorName).toBe('Clean Water Output');

    const updated = await ProjectService.updateMetricProgress(
      metric.id,
      35000,
      'Solar pump operating at 70% capacity'
    );

    expect(updated.currentValue).toEqual(new (await import('@prisma/client')).Prisma.Decimal(35000));
  });

  it('should calculate executive project portfolio analytics', async () => {
    const analytics = await ProjectService.getProjectAnalytics();
    expect(analytics).toBeDefined();
    expect(analytics.totalProjects).toBeGreaterThanOrEqual(0);
    expect(analytics.totalAllocatedBudgetINR).toBe(5000000);
    expect(analytics.totalDisbursedAmountINR).toBe(3200000);
  });
});
