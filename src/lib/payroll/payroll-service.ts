import { prisma } from '@/lib/db';
import {
  PayrollPeriod,
  Payslip,
  SalaryStructure,
  PayrollStatutoryRuleConfig,
  PayrollPeriodStatus,
  PayslipStatus,
  DisbursementMode,
  StatutoryRuleCategory,
  EmployeeStatus,
  LeaveType,
  LeaveApprovalStatus,
  AttendanceStatus,
  Prisma,
} from '@prisma/client';
import { encryptPII, decryptPII, generateHmacSignature, verifyHmacSignature } from '@/lib/crypto';
import { createAuditLog } from '@/lib/audit';
import { GeneralLedgerService } from '@/lib/finance/general-ledger-service';
import { PayrollCalculator, StatutoryRuleDefinition } from './payroll-calculator';

export interface AssignSalaryStructureParams {
  employeeId: string;
  baseSalaryMonthly: number;
  housingAllowanceMonthly?: number;
  transportAllowanceMonthly?: number;
  medicalAllowanceMonthly?: number;
  specialAllowanceMonthly?: number;
  customComponents?: Array<{ name: string; amount: number; isTaxable?: boolean }>;
  payGrade?: string | null;
  currency?: string;
  effectiveFrom?: Date | string;
  updatedByUserId?: string;
}

export interface ProcessPayrollOptions {
  bonusMap?: Record<string, number>;
  arrearsMap?: Record<string, number>;
  voluntaryDeductionsMap?: Record<string, number>;
}

export class PayrollService {
  /**
   * Generates sequential Payslip Serial Number (e.g. IMF-PSL-202609-00001)
   */
  public static async generateNextPayslipNumber(year: number, month: number): Promise<string> {
    const periodTag = `${year}${month.toString().padStart(2, '0')}`;
    const count = await prisma.payslip.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `IMF-PSL-${periodTag}-${sequence}`;
  }

  /**
   * Computes tamper-proof HMAC-SHA256 digital signature for a payslip
   */
  public static computePayslipHash(params: {
    payslipNumber: string;
    employeeNumber: string;
    periodCode: string;
    netPayableINR: number;
    issuedAt: Date;
  }): string {
    const payload = [
      params.payslipNumber,
      params.employeeNumber,
      params.periodCode,
      params.netPayableINR.toFixed(2),
      params.issuedAt.toISOString(),
    ].join('|');

    return generateHmacSignature(payload);
  }

  /**
   * Configures or updates an employee's salary structure with audit trail
   */
  public static async assignSalaryStructure(params: AssignSalaryStructureParams) {
    const employee = await prisma.employeeProfile.findUnique({
      where: { id: params.employeeId },
    });

    if (!employee) {
      throw new Error(`Employee ${params.employeeId} not found.`);
    }

    const baseSalary = params.baseSalaryMonthly;
    const hra = params.housingAllowanceMonthly ?? 0;
    const transport = params.transportAllowanceMonthly ?? 0;
    const medical = params.medicalAllowanceMonthly ?? 0;
    const special = params.specialAllowanceMonthly ?? 0;
    const customSum = (params.customComponents ?? []).reduce((acc, curr) => acc + curr.amount, 0);

    const grossMonthlySalary = baseSalary + hra + transport + medical + special + customSum;
    const annualCTC = grossMonthlySalary * 12;

    const structure = await prisma.salaryStructure.upsert({
      where: { employeeId: params.employeeId },
      create: {
        employeeId: params.employeeId,
        baseSalaryMonthly: new Prisma.Decimal(baseSalary),
        housingAllowanceMonthly: new Prisma.Decimal(hra),
        transportAllowanceMonthly: new Prisma.Decimal(transport),
        medicalAllowanceMonthly: new Prisma.Decimal(medical),
        specialAllowanceMonthly: new Prisma.Decimal(special),
        grossMonthlySalary: new Prisma.Decimal(grossMonthlySalary),
        annualCTC: new Prisma.Decimal(annualCTC),
        customComponents: params.customComponents ? (params.customComponents as any) : undefined,
        payGrade: params.payGrade || null,
        currency: params.currency || 'INR',
        effectiveFrom: params.effectiveFrom ? new Date(params.effectiveFrom) : new Date(),
        isActive: true,
      },
      update: {
        baseSalaryMonthly: new Prisma.Decimal(baseSalary),
        housingAllowanceMonthly: new Prisma.Decimal(hra),
        transportAllowanceMonthly: new Prisma.Decimal(transport),
        medicalAllowanceMonthly: new Prisma.Decimal(medical),
        specialAllowanceMonthly: new Prisma.Decimal(special),
        grossMonthlySalary: new Prisma.Decimal(grossMonthlySalary),
        annualCTC: new Prisma.Decimal(annualCTC),
        customComponents: params.customComponents ? (params.customComponents as any) : undefined,
        payGrade: params.payGrade || null,
        currency: params.currency || 'INR',
        effectiveFrom: params.effectiveFrom ? new Date(params.effectiveFrom) : undefined,
        isActive: true,
      },
    });

    // Encrypt updated monthly salary in EmployeeProfile for security
    const encryptedMonthlySalaryINR = encryptPII(grossMonthlySalary.toString());
    await prisma.employeeProfile.update({
      where: { id: params.employeeId },
      data: {
        encryptedMonthlySalaryINR,
        payBandGrade: params.payGrade || employee.payBandGrade,
      },
    });

    await createAuditLog({
      action: 'PAYROLL_SALARY_STRUCTURE_ASSIGNED',
      entity: 'SalaryStructure',
      entityId: structure.id,
      userId: params.updatedByUserId || undefined,
      newData: {
        employeeNumber: employee.employeeNumber,
        grossMonthlySalary,
        annualCTC,
        payGrade: params.payGrade,
      },
    });

    return structure;
  }

  /**
   * Retrieves an employee's active salary structure
   */
  public static async getEmployeeSalaryStructure(employeeId: string) {
    return prisma.salaryStructure.findUnique({
      where: { employeeId },
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            fullName: true,
            email: true,
            department: true,
            designation: true,
          },
        },
      },
    });
  }

  /**
   * Initiates a monthly payroll cycle
   */
  public static async initiatePayrollPeriod(
    year: number,
    month: number,
    totalWorkingDays: number = 30,
    createdByUserId?: string
  ) {
    const periodCode = `PAY-${year}-${month.toString().padStart(2, '0')}`;
    
    // Calculate calendar start and end dates of the month
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0)); // last day of month

    const period = await prisma.payrollPeriod.upsert({
      where: { year_month: { year, month } },
      create: {
        periodCode,
        year,
        month,
        startDate,
        endDate,
        totalWorkingDays,
        status: PayrollPeriodStatus.DRAFT,
      },
      update: {
        totalWorkingDays,
      },
    });

    await createAuditLog({
      action: 'PAYROLL_PERIOD_INITIATED',
      entity: 'PayrollPeriod',
      entityId: period.id,
      userId: createdByUserId || undefined,
      newData: {
        periodCode,
        year,
        month,
        totalWorkingDays,
      },
    });

    return period;
  }

  /**
   * Processes all active employees for a monthly payroll cycle, computing attendance, LOP, and statutory deductions
   */
  public static async processPayrollPeriod(
    periodId: string,
    options?: ProcessPayrollOptions,
    processedByUserId?: string
  ) {
    const period = await prisma.payrollPeriod.findUniqueOrThrow({
      where: { id: periodId },
    });

    if (period.status === PayrollPeriodStatus.DISBURSED) {
      throw new Error(`Cannot re-process a disbursed payroll period (${period.periodCode}).`);
    }

    // 1. Fetch eligible staff (Active, Probation, Notice Period)
    const employees = await prisma.employeeProfile.findMany({
      where: {
        status: { in: [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION, EmployeeStatus.NOTICE_PERIOD] },
      },
      include: {
        salaryStructure: true,
        department: true,
        designation: true,
      },
    });

    // 2. Fetch active statutory rules
    const rawRules = await prisma.payrollStatutoryRuleConfig.findMany({
      where: { isEnabled: true },
    });

    const statutoryRules: StatutoryRuleDefinition[] = rawRules.map((r) => ({
      ruleCode: r.ruleCode,
      ruleCategory: r.ruleCategory as any,
      calculationType: r.calculationType as any,
      ruleParamsJson: r.ruleParamsJson as any,
      isEmployerContribution: r.isEmployerContribution,
      isEnabled: r.isEnabled,
    }));

    let totalPeriodGross = new Prisma.Decimal(0);
    let totalPeriodDeductions = new Prisma.Decimal(0);
    let totalPeriodNet = new Prisma.Decimal(0);
    const processedPayslips: Payslip[] = [];

    const issuedAt = new Date();

    for (const emp of employees) {
      // Base Salary config
      const salaryConfig = emp.salaryStructure || {
        baseSalaryMonthly: new Prisma.Decimal(0),
        housingAllowanceMonthly: new Prisma.Decimal(0),
        transportAllowanceMonthly: new Prisma.Decimal(0),
        medicalAllowanceMonthly: new Prisma.Decimal(0),
        specialAllowanceMonthly: new Prisma.Decimal(0),
        customComponents: null,
      };

      // Query Attendance for month
      const attendanceRecords = await prisma.employeeAttendance.findMany({
        where: {
          employeeId: emp.id,
          date: {
            gte: period.startDate,
            lte: period.endDate,
          },
        },
      });

      const daysPresentCount = attendanceRecords.filter((a) => a.status === AttendanceStatus.PRESENT).length;
      const halfDaysCount = attendanceRecords.filter((a) => a.status === AttendanceStatus.HALF_DAY).length;
      const totalDaysPresent = daysPresentCount + halfDaysCount * 0.5;

      // Query Leaves for month
      const leaves = await prisma.employeeLeave.findMany({
        where: {
          employeeId: emp.id,
          status: LeaveApprovalStatus.APPROVED,
          OR: [
            { startDate: { gte: period.startDate, lte: period.endDate } },
            { endDate: { gte: period.startDate, lte: period.endDate } },
          ],
        },
      });

      let paidLeaveDays = 0;
      let unpaidLeaveDays = 0;

      for (const l of leaves) {
        const days = Number(l.totalDays);
        if (l.leaveType === LeaveType.UNPAID_LOP) {
          unpaidLeaveDays += days;
        } else {
          paidLeaveDays += days;
        }
      }

      // If no attendance records logged yet in dev/demo mode, default to full month presence
      const effectiveDaysPresent = attendanceRecords.length === 0 ? period.totalWorkingDays - unpaidLeaveDays : totalDaysPresent;

      const calcResult = PayrollCalculator.calculatePayslip(
        {
          baseSalaryMonthly: Number(salaryConfig.baseSalaryMonthly),
          housingAllowanceMonthly: Number(salaryConfig.housingAllowanceMonthly),
          transportAllowanceMonthly: Number(salaryConfig.transportAllowanceMonthly),
          medicalAllowanceMonthly: Number(salaryConfig.medicalAllowanceMonthly),
          specialAllowanceMonthly: Number(salaryConfig.specialAllowanceMonthly),
          customAllowancesMonthly: (salaryConfig.customComponents as any) || [],
        },
        {
          totalWorkingDaysInMonth: period.totalWorkingDays,
          daysPresent: effectiveDaysPresent,
          paidLeaveDays,
          unpaidLeaveDays,
        },
        {
          statutoryRules,
          performanceBonus: options?.bonusMap?.[emp.id] ?? 0,
          overtimeOrArrears: options?.arrearsMap?.[emp.id] ?? 0,
          voluntaryDeductions: options?.voluntaryDeductionsMap?.[emp.id] ?? 0,
        }
      );

      const payslipNumber = await PayrollService.generateNextPayslipNumber(period.year, period.month);
      const verificationHash = PayrollService.computePayslipHash({
        payslipNumber,
        employeeNumber: emp.employeeNumber,
        periodCode: period.periodCode,
        netPayableINR: calcResult.netPayableINR,
        issuedAt,
      });

      // Upsert Payslip
      const existingPayslip = await prisma.payslip.findFirst({
        where: {
          payrollPeriodId: period.id,
          employeeId: emp.id,
        },
      });

      const payslipData = {
        payslipNumber: existingPayslip ? existingPayslip.payslipNumber : payslipNumber,
        payrollPeriodId: period.id,
        employeeId: emp.id,
        status: PayslipStatus.CALCULATED,
        workingDaysInMonth: calcResult.workingDaysInMonth,
        daysPresent: new Prisma.Decimal(calcResult.daysPresent),
        paidLeaveDays: new Prisma.Decimal(calcResult.paidLeaveDays),
        unpaidLeaveDays: new Prisma.Decimal(calcResult.unpaidLeaveDays),
        payableDays: new Prisma.Decimal(calcResult.payableDays),
        basicPay: new Prisma.Decimal(calcResult.basicPay),
        hraAllowance: new Prisma.Decimal(calcResult.hraAllowance),
        transportAllowance: new Prisma.Decimal(calcResult.transportAllowance),
        medicalAllowance: new Prisma.Decimal(calcResult.medicalAllowance),
        specialAllowance: new Prisma.Decimal(calcResult.specialAllowance),
        performanceBonus: new Prisma.Decimal(calcResult.performanceBonus),
        overtimeOrArrears: new Prisma.Decimal(calcResult.overtimeOrArrears),
        totalEarningsGross: new Prisma.Decimal(calcResult.totalEarningsGross),
        lossOfPayDeduction: new Prisma.Decimal(calcResult.lossOfPayDeduction),
        statutoryTaxTDS: new Prisma.Decimal(calcResult.statutoryTaxTDS),
        statutoryProvidentFund: new Prisma.Decimal(calcResult.statutoryProvidentFund),
        statutoryInsurance: new Prisma.Decimal(calcResult.statutoryInsurance),
        voluntaryDeductions: new Prisma.Decimal(calcResult.voluntaryDeductions),
        totalDeductions: new Prisma.Decimal(calcResult.totalDeductions),
        netPayableINR: new Prisma.Decimal(calcResult.netPayableINR),
        employerProvidentFund: new Prisma.Decimal(calcResult.employerProvidentFund),
        employerInsurance: new Prisma.Decimal(calcResult.employerInsurance),
        maskedBankSnapshot: emp.maskedBankAccount || 'XXXX-XXXX-BANK',
        maskedPanSnapshot: emp.maskedNationalId || 'XXXX-XXXX-ID',
        encryptedBankSnapshot: emp.encryptedBankAccount,
        verificationHash,
        digitalQrUrl: `/verify/payslip/${verificationHash}`,
        payslipPdfUrl: `/api/admin/payroll/payslips/${payslipNumber}/pdf`,
      };

      const savedPayslip = existingPayslip
        ? await prisma.payslip.update({ where: { id: existingPayslip.id }, data: payslipData })
        : await prisma.payslip.create({ data: payslipData });

      processedPayslips.push(savedPayslip);
      totalPeriodGross = totalPeriodGross.plus(calcResult.totalEarningsGross);
      totalPeriodDeductions = totalPeriodDeductions.plus(calcResult.totalDeductions);
      totalPeriodNet = totalPeriodNet.plus(calcResult.netPayableINR);
    }

    // Update Period Aggregates
    const updatedPeriod = await prisma.payrollPeriod.update({
      where: { id: period.id },
      data: {
        status: PayrollPeriodStatus.PENDING_APPROVAL,
        totalGrossAmountINR: totalPeriodGross,
        totalDeductionsINR: totalPeriodDeductions,
        totalNetAmountINR: totalPeriodNet,
        totalEmployeesCount: processedPayslips.length,
      },
      include: {
        payslips: {
          include: {
            employee: {
              include: { department: true, designation: true },
            },
          },
        },
      },
    });

    await createAuditLog({
      action: 'PAYROLL_PERIOD_PROCESSED',
      entity: 'PayrollPeriod',
      entityId: period.id,
      userId: processedByUserId || undefined,
      newData: {
        periodCode: period.periodCode,
        totalEmployeesCount: processedPayslips.length,
        totalGrossAmountINR: Number(totalPeriodGross),
        totalNetAmountINR: Number(totalPeriodNet),
      },
    });

    return updatedPeriod;
  }

  /**
   * Multi-stage review approval of a processed payroll period
   */
  public static async approvePayrollPeriod(
    periodId: string,
    approverUserId: string,
    remarks?: string
  ) {
    const period = await prisma.payrollPeriod.findUniqueOrThrow({
      where: { id: periodId },
      include: { payslips: true },
    });

    if (period.status === PayrollPeriodStatus.APPROVED || period.status === PayrollPeriodStatus.DISBURSED) {
      throw new Error(`Payroll period ${period.periodCode} is already approved or disbursed.`);
    }

    const [updatedPeriod] = await prisma.$transaction([
      prisma.payrollPeriod.update({
        where: { id: period.id },
        data: {
          status: PayrollPeriodStatus.APPROVED,
          approvedByUserId: approverUserId,
          approvedAt: new Date(),
          approvalRemarks: remarks || 'Approved after financial and attendance audit verification.',
        },
      }),
      prisma.payslip.updateMany({
        where: { payrollPeriodId: period.id },
        data: { status: PayslipStatus.APPROVED },
      }),
    ]);

    await createAuditLog({
      action: 'PAYROLL_PERIOD_APPROVED',
      entity: 'PayrollPeriod',
      entityId: period.id,
      userId: approverUserId,
      newData: {
        periodCode: period.periodCode,
        approvedAt: new Date().toISOString(),
        totalNetAmountINR: Number(period.totalNetAmountINR),
      },
    });

    return updatedPeriod;
  }

  /**
   * Executes disbursement and generates balanced double-entry General Ledger journal vouchers
   */
  public static async disbursePayrollPeriod(
    periodId: string,
    disburserUserId: string,
    disbursementMode: DisbursementMode = DisbursementMode.BANK_TRANSFER,
    reference?: string
  ) {
    const period = await prisma.payrollPeriod.findUniqueOrThrow({
      where: { id: periodId },
      include: {
        payslips: {
          include: {
            employee: true,
          },
        },
      },
    });

    if (period.status !== PayrollPeriodStatus.APPROVED) {
      throw new Error(
        `Cannot disburse payroll period in ${period.status} status. It must be APPROVED by authorized leadership first.`
      );
    }

    const disbursedAt = new Date();
    const transactionReference = reference || `NEFT-BULK-${period.periodCode}-${Date.now().toString().slice(-6)}`;

    // 1. Update Payroll Period & Payslips status to DISBURSED / PAID
    await prisma.$transaction([
      prisma.payrollPeriod.update({
        where: { id: period.id },
        data: {
          status: PayrollPeriodStatus.DISBURSED,
          disbursedByUserId: disburserUserId,
          disbursedAt,
          disbursementMode,
          disbursementReference: transactionReference,
        },
      }),
      prisma.payslip.updateMany({
        where: { payrollPeriodId: period.id },
        data: {
          status: PayslipStatus.PAID,
          disbursedVia: disbursementMode,
          transactionReference,
          paidAt: disbursedAt,
        },
      }),
    ]);

    // 2. Post balanced General Ledger Journal Entry
    const voucherNumber = await GeneralLedgerService.recordPayrollJournalEntry(
      period,
      period.payslips,
      disburserUserId
    );

    await createAuditLog({
      action: 'PAYROLL_PERIOD_DISBURSED',
      entity: 'PayrollPeriod',
      entityId: period.id,
      userId: disburserUserId,
      newData: {
        periodCode: period.periodCode,
        disbursementMode,
        transactionReference,
        voucherNumber,
        totalNetAmountINR: Number(period.totalNetAmountINR),
      },
    });

    return {
      periodId: period.id,
      periodCode: period.periodCode,
      status: PayrollPeriodStatus.DISBURSED,
      voucherNumber,
      transactionReference,
      disbursedAt,
    };
  }

  /**
   * Cryptographic verification lookup for public/auditor digital payslips
   */
  public static async getPayslipByHash(verificationHash: string) {
    const payslip = await prisma.payslip.findUnique({
      where: { verificationHash },
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            fullName: true,
            department: { select: { name: true, code: true } },
            designation: { select: { title: true } },
          },
        },
        payrollPeriod: {
          select: {
            periodCode: true,
            year: true,
            month: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    });

    if (!payslip) return null;

    // Verify hash integrity
    const expectedHash = PayrollService.computePayslipHash({
      payslipNumber: payslip.payslipNumber,
      employeeNumber: payslip.employee.employeeNumber,
      periodCode: payslip.payrollPeriod.periodCode,
      netPayableINR: Number(payslip.netPayableINR),
      issuedAt: payslip.createdAt,
    });

    const isCryptographicallyValid = expectedHash === payslip.verificationHash;

    return {
      payslip,
      isCryptographicallyValid,
      verifiedAt: new Date(),
    };
  }

  /**
   * Retrieves dynamic statutory configuration rules
   */
  public static async getPayrollStatutoryRules() {
    return prisma.payrollStatutoryRuleConfig.findMany({
      orderBy: { ruleCode: 'asc' },
    });
  }

  /**
   * Upserts dynamic statutory rule configuration
   */
  public static async updatePayrollStatutoryRule(params: {
    ruleCode: string;
    ruleName: string;
    ruleCategory: StatutoryRuleCategory;
    calculationType: string;
    ruleParamsJson: any;
    isEmployerContribution?: boolean;
    isEnabled?: boolean;
    verifiedByAdvisor?: boolean;
    notes?: string;
    updatedByUserId?: string;
  }) {
    const rule = await prisma.payrollStatutoryRuleConfig.upsert({
      where: { ruleCode: params.ruleCode },
      create: {
        ruleCode: params.ruleCode,
        ruleName: params.ruleName,
        ruleCategory: params.ruleCategory,
        calculationType: params.calculationType,
        ruleParamsJson: params.ruleParamsJson,
        isEmployerContribution: params.isEmployerContribution ?? false,
        isEnabled: params.isEnabled ?? true,
        verifiedByLegalAdvisor: params.verifiedByAdvisor ?? false,
        lastVerifiedAt: params.verifiedByAdvisor ? new Date() : null,
        notes: params.notes || null,
        disclaimerNotice: 'REQUIRES_PROFESSIONAL_VERIFICATION',
      },
      update: {
        ruleName: params.ruleName,
        ruleCategory: params.ruleCategory,
        calculationType: params.calculationType,
        ruleParamsJson: params.ruleParamsJson,
        isEmployerContribution: params.isEmployerContribution ?? undefined,
        isEnabled: params.isEnabled ?? undefined,
        verifiedByLegalAdvisor: params.verifiedByAdvisor ?? undefined,
        lastVerifiedAt: params.verifiedByAdvisor ? new Date() : undefined,
        notes: params.notes || undefined,
      },
    });

    await createAuditLog({
      action: 'PAYROLL_STATUTORY_RULE_UPDATED',
      entity: 'PayrollStatutoryRuleConfig',
      entityId: rule.id,
      userId: params.updatedByUserId || undefined,
      newData: {
        ruleCode: rule.ruleCode,
        ruleCategory: rule.ruleCategory,
        isEnabled: rule.isEnabled,
      },
    });

    return rule;
  }

  /**
   * Aggregates high-level Payroll & Compensation analytics for the command center
   */
  public static async getPayrollAnalytics() {
    const totalPeriods = await prisma.payrollPeriod.count();
    const disbursedPeriods = await prisma.payrollPeriod.count({
      where: { status: PayrollPeriodStatus.DISBURSED },
    });

    const activeStructuresCount = await prisma.salaryStructure.count({
      where: { isActive: true },
    });

    const latestPeriod = await prisma.payrollPeriod.findFirst({
      orderBy: { year: 'desc', month: 'desc' as any },
      include: {
        payslips: {
          take: 5,
          include: {
            employee: { select: { fullName: true, employeeNumber: true, department: true } },
          },
        },
      },
    });

    return {
      totalPeriods,
      disbursedPeriods,
      activeStructuresCount,
      latestPeriod,
      statutoryAdvisory: 'REQUIRES PROFESSIONAL VERIFICATION',
    };
  }
}
