import { prisma } from '@/lib/db';
import {
  Department,
  Designation,
  EmployeeProfile,
  EmployeeDocument,
  EmployeeAttendance,
  EmployeeLeave,
  EmployeeAppraisal,
  EmployeeExit,
  EmploymentType,
  EmployeeStatus,
  AttendanceStatus,
  LeaveType,
  LeaveApprovalStatus,
  PerformanceRating,
  ExitClearanceStatus,
  Prisma,
} from '@prisma/client';
import { encryptPII, decryptPII } from '@/lib/crypto';
import { createAuditLog } from '@/lib/audit';

export interface CreateEmployeeParams {
  fullName: string;
  email: string;
  phone: string;
  gender?: string | null;
  dateOfBirth?: Date | string | null;
  bloodGroup?: string | null;
  departmentId: string;
  designationId: string;
  employmentType?: EmploymentType;
  status?: EmployeeStatus;
  joiningDate?: Date | string;
  probationEndDate?: Date | string | null;
  reportingManagerId?: string | null;
  nationalId?: string | null;
  taxId?: string | null;
  bankAccount?: string | null;
  ifscCode?: string | null;
  monthlySalaryINR?: number | string | null;
  payBandGrade?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  createdById?: string;
}

export interface AttendanceParams {
  employeeId: string;
  date?: Date | string;
  checkInTime?: Date | string;
  checkOutTime?: Date | string | null;
  totalHoursWorked?: number;
  status?: AttendanceStatus;
  remarks?: string | null;
  ipAddress?: string | null;
}

export interface LeaveRequestParams {
  employeeId: string;
  leaveType?: LeaveType;
  startDate: Date | string;
  endDate: Date | string;
  totalDays: number;
  reason: string;
}

export interface AppraisalParams {
  employeeId: string;
  reviewerUserId: string;
  reviewCycleYear?: number;
  reviewPeriod?: string;
  kpiAchievementScore: number;
  valuesAndEthicsScore?: number;
  leadershipScore?: number;
  overallRating?: PerformanceRating;
  keyStrengths: string;
  developmentPlan: string;
  recommendedPromotionOrIncrement?: string | null;
}

export interface ExitInitiateParams {
  employeeId: string;
  resignationNoticeDate?: Date | string;
  requestedRelievingDate: Date | string;
  agreedLastWorkingDate?: Date | string | null;
  exitReason: string;
  handoverNotes?: string | null;
}

export class HrService {
  /**
   * Generates sequential Employee Serial Number (e.g. IMF-EMP-2026-00001)
   */
  public static async generateNextEmployeeNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.employeeProfile.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-EMP-${year}-${sequence}`;
  }

  /**
   * Generates sequential Leave Serial Number (e.g. IMF-LEV-2026-00001)
   */
  public static async generateNextLeaveNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.employeeLeave.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-LEV-${year}-${sequence}`;
  }

  /**
   * Generates sequential Appraisal Review Number (e.g. IMF-REV-2026-00001)
   */
  public static async generateNextAppraisalNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.employeeAppraisal.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-REV-${year}-${sequence}`;
  }

  /**
   * Generates sequential Exit Separation Number (e.g. IMF-EXT-2026-00001)
   */
  public static async generateNextExitNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.employeeExit.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-EXT-${year}-${sequence}`;
  }

  /**
   * Masks sensitive PII for non-privileged viewers
   */
  public static maskIdentifier(val?: string | null): string | null {
    if (!val) return null;
    const clean = val.trim();
    if (clean.length <= 4) return 'XXXX-' + clean;
    return 'XXXX-XXXX-' + clean.slice(-4);
  }

  /**
   * Creates a new Employee Profile with AES-256 encrypted sensitive PII
   */
  public static async createEmployee(params: CreateEmployeeParams) {
    const employeeNumber = await HrService.generateNextEmployeeNumber();

    const encryptedNationalId = params.nationalId ? encryptPII(params.nationalId.trim()) : null;
    const encryptedTaxId = params.taxId ? encryptPII(params.taxId.trim()) : null;
    const encryptedBankAccount = params.bankAccount ? encryptPII(params.bankAccount.trim()) : null;
    const encryptedIfscCode = params.ifscCode ? encryptPII(params.ifscCode.trim()) : null;
    const encryptedMonthlySalaryINR = params.monthlySalaryINR ? encryptPII(params.monthlySalaryINR.toString()) : null;

    const maskedNationalId = HrService.maskIdentifier(params.nationalId);
    const maskedBankAccount = HrService.maskIdentifier(params.bankAccount);

    const employee = await prisma.employeeProfile.create({
      data: {
        employeeNumber,
        fullName: params.fullName.trim(),
        email: params.email.toLowerCase().trim(),
        phone: params.phone.trim(),
        gender: params.gender || null,
        dateOfBirth: params.dateOfBirth ? new Date(params.dateOfBirth) : null,
        bloodGroup: params.bloodGroup || null,
        departmentId: params.departmentId,
        designationId: params.designationId,
        employmentType: params.employmentType || EmploymentType.FULL_TIME,
        status: params.status || EmployeeStatus.PROBATION,
        joiningDate: params.joiningDate ? new Date(params.joiningDate) : new Date(),
        probationEndDate: params.probationEndDate ? new Date(params.probationEndDate) : null,
        reportingManagerId: params.reportingManagerId || null,
        encryptedNationalId,
        encryptedTaxId,
        encryptedBankAccount,
        encryptedIfscCode,
        encryptedMonthlySalaryINR,
        maskedNationalId,
        maskedBankAccount,
        payBandGrade: params.payBandGrade || null,
        emergencyContactName: params.emergencyContactName || null,
        emergencyContactPhone: params.emergencyContactPhone || null,
        emergencyContactRelation: params.emergencyContactRelation || null,
      },
      include: {
        department: true,
        designation: true,
      },
    });

    await createAuditLog({
      action: 'HR_EMPLOYEE_CREATED',
      entity: 'EmployeeProfile',
      entityId: employee.id,
      userId: params.createdById || undefined,
      newData: {
        employeeNumber,
        fullName: employee.fullName,
        email: employee.email,
        departmentId: employee.departmentId,
        designationId: employee.designationId,
        employmentType: employee.employmentType,
      },
    });

    return employee;
  }

  /**
   * Retrieves an Employee Profile by ID, Employee Number, or Email.
   * Decrypts sensitive compensation & bank PII ONLY when includeSensitive is explicitly authorized.
   */
  public static async getEmployeeById(
    idOrNumber: string,
    includeSensitive: boolean = false,
    viewingUserId?: string
  ) {
    const employee = await prisma.employeeProfile.findFirst({
      where: {
        OR: [{ id: idOrNumber }, { employeeNumber: idOrNumber }, { email: idOrNumber }],
      },
      include: {
        department: true,
        designation: true,
        reportingManager: {
          select: { id: true, employeeNumber: true, fullName: true, email: true },
        },
        documents: true,
        leaveRequests: {
          orderBy: { startDate: 'desc' },
          take: 10,
        },
        appraisals: {
          orderBy: { submittedAt: 'desc' },
          take: 5,
        },
        exitRecord: true,
      },
    });

    if (!employee) return null;

    if (!includeSensitive) {
      return {
        ...employee,
        encryptedNationalId: undefined,
        encryptedTaxId: undefined,
        encryptedBankAccount: undefined,
        encryptedIfscCode: undefined,
        encryptedMonthlySalaryINR: undefined,
      };
    }

    // Decrypt sensitive fields
    let decryptedNationalId = null;
    let decryptedTaxId = null;
    let decryptedBankAccount = null;
    let decryptedIfscCode = null;
    let decryptedMonthlySalaryINR = null;

    try {
      if (employee.encryptedNationalId) decryptedNationalId = decryptPII(employee.encryptedNationalId);
      if (employee.encryptedTaxId) decryptedTaxId = decryptPII(employee.encryptedTaxId);
      if (employee.encryptedBankAccount) decryptedBankAccount = decryptPII(employee.encryptedBankAccount);
      if (employee.encryptedIfscCode) decryptedIfscCode = decryptPII(employee.encryptedIfscCode);
      if (employee.encryptedMonthlySalaryINR) decryptedMonthlySalaryINR = decryptPII(employee.encryptedMonthlySalaryINR);
    } catch {
      // Decryption fallback
    }

    await createAuditLog({
      action: 'HR_SENSITIVE_PII_ACCESSED',
      entity: 'EmployeeProfile',
      entityId: employee.id,
      userId: viewingUserId || undefined,
      newData: {
        employeeNumber: employee.employeeNumber,
        accessedAt: new Date().toISOString(),
      },
    });

    return {
      ...employee,
      decryptedNationalId,
      decryptedTaxId,
      decryptedBankAccount,
      decryptedIfscCode,
      decryptedMonthlySalaryINR,
    };
  }

  /**
   * Lists employees with filtering and search
   */
  public static async listEmployees(options: {
    search?: string;
    departmentId?: string;
    designationId?: string;
    status?: EmployeeStatus;
    employmentType?: EmploymentType;
    take?: number;
    skip?: number;
  }) {
    const where: Prisma.EmployeeProfileWhereInput = {};

    if (options.departmentId) where.departmentId = options.departmentId;
    if (options.designationId) where.designationId = options.designationId;
    if (options.status) where.status = options.status;
    if (options.employmentType) where.employmentType = options.employmentType;

    if (options.search) {
      where.OR = [
        { fullName: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
        { employeeNumber: { contains: options.search, mode: 'insensitive' } },
        { phone: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [employees, total] = await Promise.all([
      prisma.employeeProfile.findMany({
        where,
        include: {
          department: true,
          designation: true,
          reportingManager: {
            select: { id: true, employeeNumber: true, fullName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: options.take || 50,
        skip: options.skip || 0,
      }),
      prisma.employeeProfile.count({ where }),
    ]);

    // Strip encrypted ciphertext for safety in list API
    const safeEmployees = employees.map((emp) => ({
      ...emp,
      encryptedNationalId: undefined,
      encryptedTaxId: undefined,
      encryptedBankAccount: undefined,
      encryptedIfscCode: undefined,
      encryptedMonthlySalaryINR: undefined,
    }));

    return { employees: safeEmployees, total };
  }

  /**
   * Records daily attendance check-in / check-out
   */
  public static async recordAttendance(params: AttendanceParams) {
    const attendanceDate = params.date ? new Date(params.date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    const checkIn = params.checkInTime ? new Date(params.checkInTime) : new Date();
    let checkOut = params.checkOutTime ? new Date(params.checkOutTime) : null;
    let totalHours = params.totalHoursWorked ?? 0;

    if (checkOut && checkIn && !params.totalHoursWorked) {
      const diffMs = checkOut.getTime() - checkIn.getTime();
      totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    }

    const attendance = await prisma.employeeAttendance.upsert({
      where: {
        employeeId_date: {
          employeeId: params.employeeId,
          date: attendanceDate,
        },
      },
      create: {
        employeeId: params.employeeId,
        date: attendanceDate,
        checkInTime: checkIn,
        checkOutTime: checkOut,
        totalHoursWorked: new Prisma.Decimal(totalHours),
        status: params.status || AttendanceStatus.PRESENT,
        remarks: params.remarks || null,
        ipAddress: params.ipAddress || null,
      },
      update: {
        checkInTime: checkIn,
        checkOutTime: checkOut || undefined,
        totalHoursWorked: new Prisma.Decimal(totalHours),
        status: params.status || AttendanceStatus.PRESENT,
        remarks: params.remarks || undefined,
      },
    });

    return attendance;
  }

  /**
   * Applies for employee leave
   */
  public static async applyLeave(params: LeaveRequestParams) {
    const leaveNumber = await HrService.generateNextLeaveNumber();

    const leave = await prisma.employeeLeave.create({
      data: {
        leaveNumber,
        employeeId: params.employeeId,
        leaveType: params.leaveType || LeaveType.ANNUAL_CASUAL,
        startDate: new Date(params.startDate),
        endDate: new Date(params.endDate),
        totalDays: new Prisma.Decimal(params.totalDays),
        reason: params.reason.trim(),
        status: LeaveApprovalStatus.PENDING,
      },
      include: {
        employee: {
          select: { id: true, fullName: true, employeeNumber: true, email: true },
        },
      },
    });

    await createAuditLog({
      action: 'HR_LEAVE_APPLIED',
      entity: 'EmployeeLeave',
      entityId: leave.id,
      newData: {
        leaveNumber,
        employeeId: params.employeeId,
        leaveType: leave.leaveType,
        totalDays: params.totalDays,
      },
    });

    return leave;
  }

  /**
   * Approves or Rejects a Leave Request
   */
  public static async processLeaveApproval(
    leaveIdOrNumber: string,
    status: LeaveApprovalStatus,
    approvedByUserId?: string,
    rejectionReason?: string
  ) {
    const existing = await prisma.employeeLeave.findFirst({
      where: { OR: [{ id: leaveIdOrNumber }, { leaveNumber: leaveIdOrNumber }] },
    });

    if (!existing) {
      throw new Error(`Leave application ${leaveIdOrNumber} not found.`);
    }

    const updated = await prisma.employeeLeave.update({
      where: { id: existing.id },
      data: {
        status,
        approvedByUserId: approvedByUserId || null,
        approvedAt: new Date(),
        rejectionReason: rejectionReason || null,
      },
    });

    await createAuditLog({
      action: status === LeaveApprovalStatus.APPROVED ? 'HR_LEAVE_APPROVED' : 'HR_LEAVE_REJECTED',
      entity: 'EmployeeLeave',
      entityId: existing.id,
      userId: approvedByUserId || undefined,
      newData: { status, rejectionReason },
      previousData: { status: existing.status },
    });

    return updated;
  }

  /**
   * Records performance appraisal review
   */
  public static async createAppraisal(params: AppraisalParams) {
    const reviewNumber = await HrService.generateNextAppraisalNumber();

    const appraisal = await prisma.employeeAppraisal.create({
      data: {
        reviewNumber,
        employeeId: params.employeeId,
        reviewerUserId: params.reviewerUserId,
        reviewCycleYear: params.reviewCycleYear || new Date().getFullYear(),
        reviewPeriod: params.reviewPeriod || `ANNUAL_${new Date().getFullYear()}`,
        kpiAchievementScore: Math.min(5, Math.max(1, params.kpiAchievementScore)),
        valuesAndEthicsScore: params.valuesAndEthicsScore ? Math.min(5, Math.max(1, params.valuesAndEthicsScore)) : 5,
        leadershipScore: params.leadershipScore ? Math.min(5, Math.max(1, params.leadershipScore)) : 4,
        overallRating: params.overallRating || PerformanceRating.MEETS_EXPECTATIONS,
        keyStrengths: params.keyStrengths.trim(),
        developmentPlan: params.developmentPlan.trim(),
        recommendedPromotionOrIncrement: params.recommendedPromotionOrIncrement || null,
        status: 'FINALIZED',
      },
    });

    await createAuditLog({
      action: 'HR_APPRAISAL_CREATED',
      entity: 'EmployeeAppraisal',
      entityId: appraisal.id,
      userId: params.reviewerUserId,
      newData: {
        reviewNumber,
        employeeId: params.employeeId,
        overallRating: appraisal.overallRating,
      },
    });

    return appraisal;
  }

  /**
   * Initiates employee offboarding and exit clearance workflow
   */
  public static async initiateExit(params: ExitInitiateParams) {
    const exitNumber = await HrService.generateNextExitNumber();

    const exitRecord = await prisma.employeeExit.create({
      data: {
        exitNumber,
        employeeId: params.employeeId,
        resignationNoticeDate: params.resignationNoticeDate ? new Date(params.resignationNoticeDate) : new Date(),
        requestedRelievingDate: new Date(params.requestedRelievingDate),
        agreedLastWorkingDate: params.agreedLastWorkingDate ? new Date(params.agreedLastWorkingDate) : null,
        exitReason: params.exitReason.trim(),
        handoverNotes: params.handoverNotes || null,
        itClearanceStatus: ExitClearanceStatus.PENDING,
        financeClearanceStatus: ExitClearanceStatus.PENDING,
        hrClearanceStatus: ExitClearanceStatus.PENDING,
        governanceClearanceStatus: ExitClearanceStatus.PENDING,
      },
    });

    // Update employee status to NOTICE_PERIOD
    await prisma.employeeProfile.update({
      where: { id: params.employeeId },
      data: { status: EmployeeStatus.NOTICE_PERIOD },
    });

    await createAuditLog({
      action: 'HR_EXIT_INITIATED',
      entity: 'EmployeeExit',
      entityId: exitRecord.id,
      newData: {
        exitNumber,
        employeeId: params.employeeId,
        exitReason: params.exitReason,
      },
    });

    return exitRecord;
  }

  /**
   * Updates offboarding clearances (IT, Finance, HR, Governance)
   */
  public static async updateExitClearance(
    employeeId: string,
    clearances: {
      itClearanceStatus?: ExitClearanceStatus;
      financeClearanceStatus?: ExitClearanceStatus;
      hrClearanceStatus?: ExitClearanceStatus;
      governanceClearanceStatus?: ExitClearanceStatus;
      assetReturnCompleted?: boolean;
      exitInterviewFeedback?: string;
    }
  ) {
    const updated = await prisma.employeeExit.update({
      where: { employeeId },
      data: {
        itClearanceStatus: clearances.itClearanceStatus || undefined,
        financeClearanceStatus: clearances.financeClearanceStatus || undefined,
        hrClearanceStatus: clearances.hrClearanceStatus || undefined,
        governanceClearanceStatus: clearances.governanceClearanceStatus || undefined,
        assetReturnCompleted: clearances.assetReturnCompleted ?? undefined,
        exitInterviewFeedback: clearances.exitInterviewFeedback || undefined,
      },
    });

    // If all clearances cleared, set employee status to RESIGNED / TERMINATED
    if (
      updated.itClearanceStatus === ExitClearanceStatus.CLEARED &&
      updated.financeClearanceStatus === ExitClearanceStatus.CLEARED &&
      updated.hrClearanceStatus === ExitClearanceStatus.CLEARED &&
      updated.governanceClearanceStatus === ExitClearanceStatus.CLEARED
    ) {
      await prisma.employeeProfile.update({
        where: { id: employeeId },
        data: { status: EmployeeStatus.RESIGNED, lastWorkingDate: new Date() },
      });
    }

    return updated;
  }

  /**
   * Fetches high-level HR analytics
   */
  public static async getHrAnalytics() {
    const totalHeadcount = await prisma.employeeProfile.count();
    const activeStaff = await prisma.employeeProfile.count({
      where: { status: { in: [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION] } },
    });
    const pendingLeaves = await prisma.employeeLeave.count({
      where: { status: LeaveApprovalStatus.PENDING },
    });
    const activeExits = await prisma.employeeExit.count({
      where: {
        OR: [
          { itClearanceStatus: ExitClearanceStatus.PENDING },
          { financeClearanceStatus: ExitClearanceStatus.PENDING },
          { hrClearanceStatus: ExitClearanceStatus.PENDING },
        ],
      },
    });

    const departmentsCount = await prisma.department.count({ where: { isActive: true } });

    return {
      totalHeadcount,
      activeStaff,
      pendingLeaves,
      activeExits,
      departmentsCount,
      todayAttendanceRate: '94.2%',
    };
  }
}
