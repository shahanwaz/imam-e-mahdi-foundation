import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayrollService } from '@/lib/payroll/payroll-service';
import {
  PayrollPeriodStatus,
  PayslipStatus,
  DisbursementMode,
  EmployeeStatus,
} from '@prisma/client';

vi.mock('@/lib/db', async () => {
  const {
    Prisma,
    PayrollPeriodStatus: PPS,
    PayslipStatus: PSS,
    DisbursementMode: DM,
    EmployeeStatus: ES,
  } = await vi.importActual<typeof import('@prisma/client')>('@prisma/client');

  const defaultMockEmployee = {
    id: 'emp_test_1',
    employeeNumber: 'IMF-EMP-2026-00001',
    fullName: 'Syed Ali Reza',
    email: 'ali.reza@imame-mahdi.org',
    phone: '+919876543210',
    departmentId: 'dept_ops_1',
    designationId: 'desig_coord_1',
    status: ES.ACTIVE,
    maskedBankAccount: 'XXXX-XXXX-7766',
    maskedNationalId: 'XXXX-XXXX-1098',
    encryptedBankAccount: 'encrypted_bank_cipher',
    salaryStructure: {
      id: 'sal_test_1',
      employeeId: 'emp_test_1',
      baseSalaryMonthly: new Prisma.Decimal(40000),
      housingAllowanceMonthly: new Prisma.Decimal(15000),
      transportAllowanceMonthly: new Prisma.Decimal(5000),
      medicalAllowanceMonthly: new Prisma.Decimal(3000),
      specialAllowanceMonthly: new Prisma.Decimal(7000),
      grossMonthlySalary: new Prisma.Decimal(70000),
      annualCTC: new Prisma.Decimal(840000),
      customComponents: null,
      isActive: true,
    },
    department: { name: 'Field Relief & Operations', code: 'FIELD_OPS' },
    designation: { title: 'Senior Field Coordinator' },
  };

  const defaultMockPeriod = {
    id: 'period_test_1',
    periodCode: 'PAY-2026-09',
    year: 2026,
    month: 9,
    startDate: new Date('2026-09-01'),
    endDate: new Date('2026-09-30'),
    totalWorkingDays: 30,
    status: PPS.DRAFT,
    totalGrossAmountINR: new Prisma.Decimal(70000),
    totalDeductionsINR: new Prisma.Decimal(8800),
    totalNetAmountINR: new Prisma.Decimal(61200),
    totalEmployeesCount: 1,
    payslips: [],
  };

  const defaultMockPayslip = {
    id: 'payslip_test_1',
    payslipNumber: 'IMF-PSL-202609-00001',
    payrollPeriodId: 'period_test_1',
    employeeId: 'emp_test_1',
    status: PSS.CALCULATED,
    workingDaysInMonth: 30,
    daysPresent: new Prisma.Decimal(30),
    paidLeaveDays: new Prisma.Decimal(0),
    unpaidLeaveDays: new Prisma.Decimal(0),
    payableDays: new Prisma.Decimal(30),
    basicPay: new Prisma.Decimal(40000),
    hraAllowance: new Prisma.Decimal(15000),
    transportAllowance: new Prisma.Decimal(5000),
    medicalAllowance: new Prisma.Decimal(3000),
    specialAllowance: new Prisma.Decimal(7000),
    totalEarningsGross: new Prisma.Decimal(70000),
    statutoryTaxTDS: new Prisma.Decimal(7000),
    statutoryProvidentFund: new Prisma.Decimal(1800),
    statutoryInsurance: new Prisma.Decimal(0),
    totalDeductions: new Prisma.Decimal(8800),
    netPayableINR: new Prisma.Decimal(61200),
    employerProvidentFund: new Prisma.Decimal(1800),
    employerInsurance: new Prisma.Decimal(0),
    maskedBankSnapshot: 'XXXX-XXXX-7766',
    verificationHash: 'valid_mock_hmac_hash_123',
    createdAt: new Date('2026-09-30T00:00:00.000Z'),
    employee: defaultMockEmployee,
    payrollPeriod: defaultMockPeriod,
  };

  return {
    prisma: {
      payslip: {
        count: vi.fn().mockResolvedValue(1),
        findUnique: vi.fn().mockImplementation(({ where }: any) => {
          if (where.verificationHash === 'valid_mock_hmac_hash_123') {
            return Promise.resolve(defaultMockPayslip);
          }
          return Promise.resolve(null);
        }),
        findFirst: vi.fn().mockResolvedValue(defaultMockPayslip),
        create: vi.fn().mockImplementation(({ data }: any) => Promise.resolve({ id: 'psl_new', ...data })),
        update: vi.fn().mockImplementation(({ data }: any) => Promise.resolve({ ...defaultMockPayslip, ...data })),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      salaryStructure: {
        count: vi.fn().mockResolvedValue(5),
        findUnique: vi.fn().mockResolvedValue(defaultMockEmployee.salaryStructure),
        upsert: vi.fn().mockImplementation(({ create }: any) => Promise.resolve({ id: 'sal_upsert_1', ...create })),
      },
      payrollPeriod: {
        count: vi.fn().mockResolvedValue(2),
        findUniqueOrThrow: vi.fn().mockImplementation(({ where }: any) => {
          if (where.id === 'period_test_approved') {
            return Promise.resolve({
              ...defaultMockPeriod,
              id: 'period_test_approved',
              status: PPS.APPROVED,
              payslips: [defaultMockPayslip],
            });
          }
          if (where.id === 'period_test_pending') {
            return Promise.resolve({
              ...defaultMockPeriod,
              id: 'period_test_pending',
              status: PPS.PENDING_APPROVAL,
              payslips: [defaultMockPayslip],
            });
          }
          return Promise.resolve({
            ...defaultMockPeriod,
            payslips: [defaultMockPayslip],
          });
        }),
        upsert: vi.fn().mockImplementation(({ create }: any) => Promise.resolve({ ...defaultMockPeriod, ...create })),
        update: vi.fn().mockImplementation(({ data }: any) => Promise.resolve({ ...defaultMockPeriod, ...data })),
      },
      employeeProfile: {
        count: vi.fn().mockResolvedValue(48),
        findUnique: vi.fn().mockResolvedValue(defaultMockEmployee),
        findMany: vi.fn().mockResolvedValue([defaultMockEmployee]),
        update: vi.fn().mockResolvedValue(defaultMockEmployee),
      },
      employeeAttendance: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      employeeLeave: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      payrollStatutoryRuleConfig: {
        findMany: vi.fn().mockResolvedValue([]),
        upsert: vi.fn().mockImplementation(({ create }: any) => Promise.resolve({ id: 'rule_upsert_1', ...create })),
      },
      $transaction: vi.fn().mockImplementation((promises: any[]) => Promise.all(promises)),
    },
  };
});

vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn().mockResolvedValue({ id: 'audit_log_mock' }),
}));

vi.mock('@/lib/finance/general-ledger-service', () => ({
  GeneralLedgerService: {
    recordPayrollJournalEntry: vi.fn().mockResolvedValue('VCH-PAY-PAY-2026-09-9912'),
  },
}));

describe('Payroll Agent & Financial Directorate Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Sequential Numbering & HMAC Signatures', () => {
    it('should generate formatted sequential payslip numbers (IMF-PSL-YYYYMM-XXXXX)', async () => {
      const payslipNum = await PayrollService.generateNextPayslipNumber(2026, 9);
      expect(payslipNum).toBe('IMF-PSL-202609-00002');
    });

    it('should compute deterministic HMAC-SHA256 signature for digital payslips', () => {
      const issuedAt = new Date('2026-09-30T10:00:00Z');
      const hash1 = PayrollService.computePayslipHash({
        payslipNumber: 'IMF-PSL-202609-00001',
        employeeNumber: 'IMF-EMP-2026-00001',
        periodCode: 'PAY-2026-09',
        netPayableINR: 61200,
        issuedAt,
      });

      const hash2 = PayrollService.computePayslipHash({
        payslipNumber: 'IMF-PSL-202609-00001',
        employeeNumber: 'IMF-EMP-2026-00001',
        periodCode: 'PAY-2026-09',
        netPayableINR: 61200,
        issuedAt,
      });

      expect(hash1).toBeDefined();
      expect(hash1).toBe(hash2);
    });
  });

  describe('Salary Structure Configuration & Encryption', () => {
    it('should assign salary structure and encrypt compensation details in EmployeeProfile', async () => {
      const structure = await PayrollService.assignSalaryStructure({
        employeeId: 'emp_test_1',
        baseSalaryMonthly: 50000,
        housingAllowanceMonthly: 20000,
        transportAllowanceMonthly: 5000,
        medicalAllowanceMonthly: 3000,
        specialAllowanceMonthly: 7000,
        payGrade: 'Grade 8',
      });

      expect(structure).toBeDefined();
      expect(Number(structure.grossMonthlySalary)).toBe(85000);
      expect(Number(structure.annualCTC)).toBe(1020000);
    });
  });

  describe('Monthly Payroll Batch Calculation & Lifecycle', () => {
    it('should initiate monthly payroll period in DRAFT state', async () => {
      const period = await PayrollService.initiatePayrollPeriod(2026, 10, 30, 'user_hr_lead');
      expect(period).toBeDefined();
      expect(period.periodCode).toBe('PAY-2026-10');
      expect(period.status).toBe(PayrollPeriodStatus.DRAFT);
    });

    it('should process batch payroll calculations and transition to PENDING_APPROVAL', async () => {
      const processed = await PayrollService.processPayrollPeriod('period_test_1', {}, 'user_hr_lead');
      expect(processed).toBeDefined();
      expect(processed.status).toBe(PayrollPeriodStatus.PENDING_APPROVAL);
      expect(Number(processed.totalNetAmountINR)).toBeGreaterThan(0);
    });

    it('should approve payroll period and transition payslips to APPROVED state', async () => {
      const approved = await PayrollService.approvePayrollPeriod('period_test_pending', 'user_lead_director', 'Verified by audit');
      expect(approved).toBeDefined();
      expect(approved.status).toBe(PayrollPeriodStatus.APPROVED);
    });

    it('should disburse payroll, update payslips to PAID, and post balanced General Ledger Voucher', async () => {
      const result = await PayrollService.disbursePayrollPeriod(
        'period_test_approved',
        'user_treasury_officer',
        DisbursementMode.BANK_TRANSFER,
        'NEFT-BULK-202609-8812'
      );

      expect(result).toBeDefined();
      expect(result.status).toBe(PayrollPeriodStatus.DISBURSED);
      expect(result.voucherNumber).toBe('VCH-PAY-PAY-2026-09-9912');
    });
  });

  describe('Cryptographic Payslip Verification', () => {
    it('should verify digital payslip authenticity using cryptographic lookup', async () => {
      const lookup = await PayrollService.getPayslipByHash('valid_mock_hmac_hash_123');
      expect(lookup).toBeDefined();
      expect(lookup?.payslip).toBeDefined();
      expect(lookup?.payslip.payslipNumber).toBe('IMF-PSL-202609-00001');
    });
  });
});
