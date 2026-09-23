import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HrService } from '@/lib/hr/hr-service';
import {
  EmploymentType,
  EmployeeStatus,
  AttendanceStatus,
  LeaveType,
  LeaveApprovalStatus,
  PerformanceRating,
  ExitClearanceStatus,
} from '@prisma/client';
import { encryptPII } from '@/lib/crypto';

vi.mock('@/lib/db', async () => {
  const {
    Prisma,
    EmploymentType: ET,
    EmployeeStatus: ES,
    AttendanceStatus: AS,
    LeaveType: LT,
    LeaveApprovalStatus: LAS,
    PerformanceRating: PR,
    ExitClearanceStatus: ECS,
  } = await vi.importActual<typeof import('@prisma/client')>('@prisma/client');
  const { encryptPII: enc } = await vi.importActual<typeof import('@/lib/crypto')>('@/lib/crypto');

  const defaultMockEmployee = {
    id: 'emp_test_1',
    employeeNumber: 'IMF-EMP-2026-00001',
    userId: 'user_emp_1',
    fullName: 'Syed Ali Reza',
    email: 'ali.reza@imame-mahdi.org',
    phone: '+919876543210',
    departmentId: 'dept_ops_1',
    designationId: 'desig_coord_1',
    employmentType: ET.FULL_TIME,
    status: ES.ACTIVE,
    joiningDate: new Date('2024-01-15'),
    probationEndDate: new Date('2024-07-15'),
    emergencyContactName: 'Fatima Reza',
    emergencyContactPhone: '+919876543211',
    emergencyContactRelation: 'Spouse',
    payBandGrade: 'L3-SENIOR',
    encryptedNationalId: enc('987654321098'),
    maskedNationalId: 'XXXX-XXXX-1098',
    encryptedTaxId: enc('ABCDE1234F'),
    encryptedBankAccount: enc('5010099887766'),
    maskedBankAccount: 'XXXX-XXXX-7766',
    encryptedIfscCode: enc('HDFC0001234'),
    encryptedMonthlySalaryINR: enc('65000'),
    createdAt: new Date(),
    updatedAt: new Date(),
    department: { id: 'dept_ops_1', name: 'Field Relief & Operations', code: 'FIELD_OPS' },
    designation: { id: 'desig_coord_1', title: 'Senior Field Coordinator', level: 3 },
    reportingManager: null,
    documents: [],
    leaveRequests: [],
    appraisals: [],
    exitRecord: null,
  };

  const defaultMockLeave = {
    id: 'leave_test_1',
    leaveNumber: 'IMF-LEV-2026-00001',
    employeeId: 'emp_test_1',
    leaveType: LT.ANNUAL_CASUAL,
    startDate: new Date('2026-10-01'),
    endDate: new Date('2026-10-05'),
    totalDays: new Prisma.Decimal(5),
    reason: 'Family pilgrimage and relief outreach',
    status: LAS.PENDING,
    approvedByUserId: null,
    approvedAt: null,
    createdAt: new Date(),
    employee: defaultMockEmployee,
  };

  const defaultMockAppraisal = {
    id: 'appraisal_test_1',
    reviewNumber: 'IMF-REV-2026-00001',
    employeeId: 'emp_test_1',
    reviewerUserId: 'user_lead_1',
    reviewCycleYear: 2026,
    reviewPeriod: 'ANNUAL_2026',
    kpiAchievementScore: 5,
    valuesAndEthicsScore: 5,
    leadershipScore: 4,
    overallRating: PR.EXCEEDS_EXPECTATIONS,
    keyStrengths: 'Spearheaded 12 rural flood distribution camps',
    developmentPlan: 'Advanced disaster GIS mapping',
    recommendedPromotionOrIncrement: 'Senior Coordinator Grade 2',
    status: 'FINALIZED',
    submittedAt: new Date(),
    createdAt: new Date(),
  };

  const defaultMockExit = {
    id: 'exit_test_1',
    exitNumber: 'IMF-EXT-2026-00001',
    employeeId: 'emp_test_1',
    resignationNoticeDate: new Date('2026-09-01'),
    requestedRelievingDate: new Date('2026-09-30'),
    agreedLastWorkingDate: new Date('2026-09-30'),
    exitReason: 'Higher education in Disaster Management',
    handoverNotes: 'Knowledge transfer complete with team leads',
    itClearanceStatus: ECS.CLEARED,
    financeClearanceStatus: ECS.CLEARED,
    hrClearanceStatus: ECS.CLEARED,
    governanceClearanceStatus: ECS.PENDING,
    assetReturnCompleted: true,
    exitInterviewFeedback: 'Very positive experience with the foundation',
    createdAt: new Date(),
  };

  return {
    prisma: {
      employeeProfile: {
        count: vi.fn().mockImplementation((args?: any) => {
          if (args?.where?.status?.in) return Promise.resolve(48);
          return Promise.resolve(54);
        }),
        findUnique: vi.fn().mockImplementation(({ where }: any) => {
          if (where.email === 'ali.reza@imame-mahdi.org' || where.id === 'emp_test_1' || where.employeeNumber === 'IMF-EMP-2026-00001') {
            return Promise.resolve(defaultMockEmployee);
          }
          return Promise.resolve(null);
        }),
        findFirst: vi.fn().mockImplementation(() => Promise.resolve(defaultMockEmployee)),
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            id: 'emp_new_99',
            ...data,
            department: { name: 'Field Operations', code: 'OPS' },
            designation: { title: 'Coordinator', level: 1 },
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }),
        update: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({ ...defaultMockEmployee, ...data });
        }),
        findMany: vi.fn().mockResolvedValue([defaultMockEmployee]),
      },
      employeeAttendance: {
        count: vi.fn().mockResolvedValue(45),
        upsert: vi.fn().mockImplementation(({ create, update }: any) => {
          return Promise.resolve({
            id: 'att_test_1',
            ...create,
            createdAt: new Date(),
          });
        }),
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'att_test_1',
            employeeId: 'emp_test_1',
            date: new Date(),
            checkInTime: new Date(),
            checkOutTime: new Date(Date.now() + 8.5 * 3600000),
            totalHoursWorked: new Prisma.Decimal(8.5),
            status: AS.PRESENT,
          },
        ]),
      },
      employeeLeave: {
        count: vi.fn().mockImplementation((args?: any) => {
          if (args?.where?.status === LAS.PENDING) return Promise.resolve(3);
          return Promise.resolve(14);
        }),
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            id: 'leave_new_1',
            ...data,
            createdAt: new Date(),
          });
        }),
        findFirst: vi.fn().mockResolvedValue(defaultMockLeave),
        findUnique: vi.fn().mockImplementation(({ where }: any) => {
          if (where.id === 'leave_test_1' || where.leaveNumber === 'IMF-LEV-2026-00001') {
            return Promise.resolve(defaultMockLeave);
          }
          return Promise.resolve(null);
        }),
        update: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({ ...defaultMockLeave, ...data });
        }),
        findMany: vi.fn().mockResolvedValue([defaultMockLeave]),
      },
      employeeAppraisal: {
        count: vi.fn().mockResolvedValue(12),
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            id: 'appraisal_new_1',
            ...data,
            createdAt: new Date(),
          });
        }),
        findMany: vi.fn().mockResolvedValue([defaultMockAppraisal]),
      },
      employeeExit: {
        count: vi.fn().mockResolvedValue(2),
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            id: 'exit_new_1',
            ...data,
            createdAt: new Date(),
          });
        }),
        findUnique: vi.fn().mockResolvedValue(defaultMockExit),
        update: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({ ...defaultMockExit, ...data });
        }),
        findMany: vi.fn().mockResolvedValue([defaultMockExit]),
      },
      department: {
        count: vi.fn().mockResolvedValue(6),
        findMany: vi.fn().mockResolvedValue([
          { id: 'dept_ops_1', name: 'Field Relief & Operations', code: 'FIELD_OPS' },
          { id: 'dept_tech_1', name: 'Technology & Systems', code: 'TECH_OPS' },
        ]),
      },
      designation: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'desig_coord_1', title: 'Senior Field Coordinator', level: 3 },
          { id: 'desig_eng_1', title: 'Systems Architect', level: 4 },
        ]),
      },
      $transaction: vi.fn().mockImplementation((promises: any[]) => Promise.all(promises)),
    },
  };
});

vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn().mockResolvedValue({ id: 'audit_log_mock' }),
}));

describe('HR Agent & HRMS Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Sequential Identifier Generators', () => {
    it('should generate properly formatted Employee numbers (IMF-EMP-YYYY-XXXXX)', async () => {
      const empNum = await HrService.generateNextEmployeeNumber();
      const currentYear = new Date().getFullYear();
      expect(empNum).toMatch(new RegExp(`^IMF-EMP-${currentYear}-\\d{5}$`));
    });

    it('should generate formatted Leave numbers (IMF-LEV-YYYY-XXXXX)', async () => {
      const leaveNum = await HrService.generateNextLeaveNumber();
      const currentYear = new Date().getFullYear();
      expect(leaveNum).toMatch(new RegExp(`^IMF-LEV-${currentYear}-\\d{5}$`));
    });

    it('should generate formatted Appraisal numbers (IMF-REV-YYYY-XXXXX)', async () => {
      const revNum = await HrService.generateNextAppraisalNumber();
      const currentYear = new Date().getFullYear();
      expect(revNum).toMatch(new RegExp(`^IMF-REV-${currentYear}-\\d{5}$`));
    });

    it('should generate formatted Exit Clearance numbers (IMF-EXT-YYYY-XXXXX)', async () => {
      const extNum = await HrService.generateNextExitNumber();
      const currentYear = new Date().getFullYear();
      expect(extNum).toMatch(new RegExp(`^IMF-EXT-${currentYear}-\\d{5}$`));
    });
  });

  describe('Employee Profile Management & Sensitive PII Vault', () => {
    it('should create employee profile with AES-256 encrypted PII and masked presentations', async () => {
      const newEmp = await HrService.createEmployee({
        fullName: 'Dr. Fatima Rizvi',
        email: 'fatima.rizvi@imame-mahdi.org',
        phone: '+919876599887',
        departmentId: 'dept_health_1',
        designationId: 'desig_doc_1',
        employmentType: EmploymentType.FULL_TIME,
        nationalId: '123456789012',
        taxId: 'ABCDE9999Z',
        bankAccount: '998877665544',
        ifscCode: 'SBIN0004321',
        monthlySalaryINR: 85000,
      });

      expect(newEmp).toBeDefined();
      expect(newEmp.employeeNumber).toMatch(/^IMF-EMP-\d{4}-\d{5}$/);
      expect(newEmp.encryptedNationalId).toBeDefined();
      expect(newEmp.maskedNationalId).toBe('XXXX-XXXX-9012');
      expect(newEmp.encryptedTaxId).toBeDefined();
      expect(newEmp.encryptedBankAccount).toBeDefined();
      expect(newEmp.maskedBankAccount).toBe('XXXX-XXXX-5544');
    });

    it('should decrypt sensitive PII on authorized request and write audit trail', async () => {
      const sensitive = (await HrService.getEmployeeById('emp_test_1', true, 'hr_admin_user_42')) as any;

      expect(sensitive).toBeDefined();
      expect(sensitive?.employeeNumber).toBe('IMF-EMP-2026-00001');
      expect(sensitive?.decryptedNationalId).toBe('987654321098');
      expect(sensitive?.decryptedTaxId).toBe('ABCDE1234F');
      expect(sensitive?.decryptedBankAccount).toBe('5010099887766');
      expect(sensitive?.decryptedIfscCode).toBe('HDFC0001234');
      expect(sensitive?.decryptedMonthlySalaryINR).toBe('65000');
    });
  });

  describe('Attendance Logging & Work Hours Calculation', () => {
    it('should log employee daily check-in / check-out and compute total work hours', async () => {
      const today = new Date();
      const checkInTime = new Date(today.setHours(9, 0, 0, 0));
      const checkOutTime = new Date(today.setHours(17, 30, 0, 0));

      const log = await HrService.recordAttendance({
        employeeId: 'emp_test_1',
        date: today,
        checkInTime,
        checkOutTime,
        status: AttendanceStatus.PRESENT,
      });

      expect(log).toBeDefined();
      expect(log.employeeId).toBe('emp_test_1');
      expect(Number(log.totalHoursWorked)).toBe(8.5);
    });
  });

  describe('Leave Request & Approval Lifecycle', () => {
    it('should submit leave request with sequential leave number', async () => {
      const leave = await HrService.applyLeave({
        employeeId: 'emp_test_1',
        leaveType: LeaveType.ANNUAL_CASUAL,
        startDate: new Date('2026-11-01'),
        endDate: new Date('2026-11-03'),
        totalDays: 3,
        reason: 'Medical mission preparation',
      });

      expect(leave).toBeDefined();
      expect(leave.leaveNumber).toMatch(/^IMF-LEV-\d{4}-\d{5}$/);
      expect(leave.status).toBe(LeaveApprovalStatus.PENDING);
    });

    it('should process leave approval and update status', async () => {
      const approved = await HrService.processLeaveApproval(
        'leave_test_1',
        LeaveApprovalStatus.APPROVED,
        'hr_director_1'
      );

      expect(approved).toBeDefined();
      expect(approved.status).toBe(LeaveApprovalStatus.APPROVED);
      expect(approved.approvedByUserId).toBe('hr_director_1');
    });
  });

  describe('Appraisal Reviews & KPI Scoring', () => {
    it('should create annual performance appraisal review', async () => {
      const appraisal = await HrService.createAppraisal({
        employeeId: 'emp_test_1',
        reviewerUserId: 'user_lead_1',
        kpiAchievementScore: 5,
        valuesAndEthicsScore: 5,
        leadershipScore: 4,
        overallRating: PerformanceRating.EXCEEDS_EXPECTATIONS,
        keyStrengths: 'Engineered disaster logistics network across 5 states',
        developmentPlan: 'Mentorship of junior field coordinators',
        recommendedPromotionOrIncrement: 'Senior Coordinator Grade 2',
      });

      expect(appraisal).toBeDefined();
      expect(appraisal.reviewNumber).toMatch(/^IMF-REV-\d{4}-\d{5}$/);
      expect(appraisal.overallRating).toBe(PerformanceRating.EXCEEDS_EXPECTATIONS);
      expect(appraisal.status).toBe('FINALIZED');
    });
  });

  describe('4-Way Exit Separation Clearances', () => {
    it('should initiate exit offboarding record', async () => {
      const exitRecord = await HrService.initiateExit({
        employeeId: 'emp_test_1',
        resignationNoticeDate: new Date('2026-09-01'),
        requestedRelievingDate: new Date('2026-10-01'),
        exitReason: 'Relocating for international humanitarian fellowship',
      });

      expect(exitRecord).toBeDefined();
      expect(exitRecord.exitNumber).toMatch(/^IMF-EXT-\d{4}-\d{5}$/);
      expect(exitRecord.itClearanceStatus).toBe(ExitClearanceStatus.PENDING);
    });

    it('should update department clearance checklists', async () => {
      const updatedExit = await HrService.updateExitClearance('emp_test_1', {
        governanceClearanceStatus: ExitClearanceStatus.CLEARED,
        assetReturnCompleted: true,
        exitInterviewFeedback: 'Positive handover feedback',
      });

      expect(updatedExit).toBeDefined();
      expect(updatedExit.governanceClearanceStatus).toBe(ExitClearanceStatus.CLEARED);
    });
  });

  describe('HR Command Dashboard Analytics', () => {
    it('should aggregate key workforce metrics', async () => {
      const metrics = await HrService.getHrAnalytics();
      expect(metrics).toBeDefined();
      expect(metrics.totalHeadcount).toBe(54);
      expect(metrics.activeStaff).toBe(48);
      expect(metrics.pendingLeaves).toBe(3);
      expect(metrics.todayAttendanceRate).toBe('94.2%');
    });
  });
});
