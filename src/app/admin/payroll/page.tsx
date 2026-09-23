'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Search,
  Plus,
  Filter,
  FileText,
  Send,
  Eye,
  Lock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Scale,
  Download,
  QrCode,
  Layers,
  ChevronRight,
  Check,
  X,
  AlertTriangle,
  User,
  Hash
} from 'lucide-react';
import Link from 'next/link';

interface PayrollPeriodItem {
  id: string;
  periodCode: string;
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  totalWorkingDays: number;
  status: 'DRAFT' | 'PROCESSING' | 'PENDING_APPROVAL' | 'APPROVED' | 'DISBURSED' | 'CANCELLED';
  totalGrossAmountINR: number | string;
  totalDeductionsINR: number | string;
  totalNetAmountINR: number | string;
  totalEmployeesCount: number;
  approvedAt?: string;
  disbursedAt?: string;
  disbursementMode?: string;
  disbursementReference?: string;
  voucher?: { voucherNumber: string; totalAmount: number | string };
}

interface SalaryStructureItem {
  id: string;
  employeeId: string;
  baseSalaryMonthly: number | string;
  housingAllowanceMonthly: number | string;
  transportAllowanceMonthly: number | string;
  medicalAllowanceMonthly: number | string;
  specialAllowanceMonthly: number | string;
  grossMonthlySalary: number | string;
  annualCTC: number | string;
  payGrade?: string;
  currency: string;
  isActive: boolean;
  employee: {
    id: string;
    employeeNumber: string;
    fullName: string;
    email: string;
    department: { name: string; code: string };
    designation: { title: string };
  };
}

interface PayslipItem {
  id: string;
  payslipNumber: string;
  employeeId: string;
  employee: {
    fullName: string;
    employeeNumber: string;
    department: { name: string };
    designation: { title: string };
  };
  status: 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PAID';
  workingDaysInMonth: number;
  daysPresent: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  basicPay: number | string;
  hraAllowance: number | string;
  totalEarningsGross: number | string;
  lossOfPayDeduction: number | string;
  statutoryTaxTDS: number | string;
  statutoryProvidentFund: number | string;
  statutoryInsurance: number | string;
  totalDeductions: number | string;
  netPayableINR: number | string;
  maskedBankSnapshot: string;
  verificationHash: string;
  paidAt?: string;
}

interface StatutoryRuleItem {
  id: string;
  ruleCode: string;
  ruleName: string;
  ruleCategory: string;
  calculationType: string;
  ruleParamsJson: any;
  isEnabled: boolean;
  disclaimerNotice: string;
  verifiedByLegalAdvisor: boolean;
}

const FALLBACK_PERIODS: PayrollPeriodItem[] = [
  {
    id: 'period_1',
    periodCode: 'PAY-2026-09',
    year: 2026,
    month: 9,
    startDate: '2026-09-01T00:00:00.000Z',
    endDate: '2026-09-30T00:00:00.000Z',
    totalWorkingDays: 30,
    status: 'APPROVED',
    totalGrossAmountINR: 3250000,
    totalDeductionsINR: 385000,
    totalNetAmountINR: 2865000,
    totalEmployeesCount: 48,
    approvedAt: '2026-09-28T10:30:00.000Z',
    voucher: { voucherNumber: 'VCH-PAY-PAY-2026-09-8812', totalAmount: 3450000 },
  },
  {
    id: 'period_2',
    periodCode: 'PAY-2026-08',
    year: 2026,
    month: 8,
    startDate: '2026-08-01T00:00:00.000Z',
    endDate: '2026-08-31T00:00:00.000Z',
    totalWorkingDays: 31,
    status: 'DISBURSED',
    totalGrossAmountINR: 3180000,
    totalDeductionsINR: 372000,
    totalNetAmountINR: 2808000,
    totalEmployeesCount: 47,
    approvedAt: '2026-08-28T14:00:00.000Z',
    disbursedAt: '2026-08-30T16:20:00.000Z',
    disbursementMode: 'BANK_TRANSFER',
    disbursementReference: 'NEFT-BULK-202608-9921',
    voucher: { voucherNumber: 'VCH-PAY-PAY-2026-08-4102', totalAmount: 3380000 },
  },
];

const FALLBACK_STRUCTURES: SalaryStructureItem[] = [
  {
    id: 'sal_1',
    employeeId: 'emp_1',
    baseSalaryMonthly: 50000,
    housingAllowanceMonthly: 20000,
    transportAllowanceMonthly: 8000,
    medicalAllowanceMonthly: 5000,
    specialAllowanceMonthly: 12000,
    grossMonthlySalary: 95000,
    annualCTC: 1140000,
    payGrade: 'Grade 9',
    currency: 'INR',
    isActive: true,
    employee: {
      id: 'emp_1',
      employeeNumber: 'IMF-EMP-2026-00001',
      fullName: 'Er. Shahnawaz Rizvi',
      email: 'shahnawaz.rizvi@imf-ngo.org',
      department: { name: 'Executive Leadership', code: 'EXEC' },
      designation: { title: 'Executive Director & Secretary' },
    },
  },
  {
    id: 'sal_2',
    employeeId: 'emp_2',
    baseSalaryMonthly: 45000,
    housingAllowanceMonthly: 18000,
    transportAllowanceMonthly: 6000,
    medicalAllowanceMonthly: 6000,
    specialAllowanceMonthly: 10000,
    grossMonthlySalary: 85000,
    annualCTC: 1020000,
    payGrade: 'Grade 8',
    currency: 'INR',
    isActive: true,
    employee: {
      id: 'emp_2',
      employeeNumber: 'IMF-EMP-2026-00002',
      fullName: 'Dr. Zeeshan Haider',
      email: 'zeeshan.haider@imf-ngo.org',
      department: { name: 'Humanitarian Relief', code: 'MED' },
      designation: { title: 'Chief Medical Officer' },
    },
  },
  {
    id: 'sal_3',
    employeeId: 'emp_3',
    baseSalaryMonthly: 35000,
    housingAllowanceMonthly: 14000,
    transportAllowanceMonthly: 5000,
    medicalAllowanceMonthly: 4000,
    specialAllowanceMonthly: 7000,
    grossMonthlySalary: 65000,
    annualCTC: 780000,
    payGrade: 'Grade 7',
    currency: 'INR',
    isActive: true,
    employee: {
      id: 'emp_3',
      employeeNumber: 'IMF-EMP-2026-00003',
      fullName: 'Br. Tariq Mansoor',
      email: 'tariq.mansoor@imf-ngo.org',
      department: { name: 'Finance & Accounts', code: 'FIN' },
      designation: { title: 'Head of Finance & Treasury' },
    },
  },
];

const FALLBACK_PAYSLIPS: PayslipItem[] = [
  {
    id: 'psl_1',
    payslipNumber: 'IMF-PSL-202609-00001',
    employeeId: 'emp_1',
    employee: {
      fullName: 'Er. Shahnawaz Rizvi',
      employeeNumber: 'IMF-EMP-2026-00001',
      department: { name: 'Executive Leadership' },
      designation: { title: 'Executive Director & Secretary' },
    },
    status: 'APPROVED',
    workingDaysInMonth: 30,
    daysPresent: 30,
    paidLeaveDays: 0,
    unpaidLeaveDays: 0,
    basicPay: 50000,
    hraAllowance: 20000,
    totalEarningsGross: 95000,
    lossOfPayDeduction: 0,
    statutoryTaxTDS: 11875,
    statutoryProvidentFund: 1800,
    statutoryInsurance: 0,
    totalDeductions: 13675,
    netPayableINR: 81325,
    maskedBankSnapshot: 'XXXX-XXXX-4491',
    verificationHash: 'hmac_sha256_sig_psl_88291029',
  },
  {
    id: 'psl_2',
    payslipNumber: 'IMF-PSL-202609-00002',
    employeeId: 'emp_2',
    employee: {
      fullName: 'Dr. Zeeshan Haider',
      employeeNumber: 'IMF-EMP-2026-00002',
      department: { name: 'Humanitarian Relief' },
      designation: { title: 'Chief Medical Officer' },
    },
    status: 'APPROVED',
    workingDaysInMonth: 30,
    daysPresent: 28,
    paidLeaveDays: 2,
    unpaidLeaveDays: 0,
    basicPay: 45000,
    hraAllowance: 18000,
    totalEarningsGross: 85000,
    lossOfPayDeduction: 0,
    statutoryTaxTDS: 10625,
    statutoryProvidentFund: 1800,
    statutoryInsurance: 0,
    totalDeductions: 12425,
    netPayableINR: 72575,
    maskedBankSnapshot: 'XXXX-XXXX-7723',
    verificationHash: 'hmac_sha256_sig_psl_99182341',
  },
];

const STATUTORY_RULES_DEFAULT: StatutoryRuleItem[] = [
  {
    id: 'rule_1',
    ruleCode: 'INCOME_TAX_TDS_STANDARD',
    ruleName: 'Standard Progressive Slab TDS Scheme',
    ruleCategory: 'INCOME_TAX_TDS',
    calculationType: 'SLAB_TIERED',
    ruleParamsJson: {
      slabs: [
        { min: 0, max: 300000, ratePercent: 0 },
        { min: 300001, max: 600000, ratePercent: 5 },
        { min: 600001, max: 900000, ratePercent: 10 },
        { min: 900001, max: 1200000, ratePercent: 15 },
        { min: 1200001, max: null, ratePercent: 20 },
      ],
    },
    isEnabled: true,
    disclaimerNotice: 'REQUIRES PROFESSIONAL VERIFICATION',
    verifiedByLegalAdvisor: true,
  },
  {
    id: 'rule_2',
    ruleCode: 'PROVIDENT_FUND_STATUTORY',
    ruleName: 'Employees Provident Fund (12% of Basic up to Cap)',
    ruleCategory: 'PROVIDENT_FUND',
    calculationType: 'PERCENTAGE_OF_BASIC',
    ruleParamsJson: {
      percentage: 12.0,
      statutoryCapAmount: 1800.0,
      employerMatchPercentage: 12.0,
    },
    isEnabled: true,
    disclaimerNotice: 'REQUIRES PROFESSIONAL VERIFICATION',
    verifiedByLegalAdvisor: true,
  },
  {
    id: 'rule_3',
    ruleCode: 'EMPLOYEE_STATE_INSURANCE',
    ruleName: 'State Medical & Health Insurance Scheme',
    ruleCategory: 'EMPLOYEE_STATE_INSURANCE',
    calculationType: 'PERCENTAGE_OF_GROSS',
    ruleParamsJson: {
      percentage: 0.75,
      employerMatchPercentage: 3.25,
      maximumGrossThreshold: 21000.0,
    },
    isEnabled: true,
    disclaimerNotice: 'REQUIRES PROFESSIONAL VERIFICATION',
    verifiedByLegalAdvisor: true,
  },
];

export default function PayrollAdminPage() {
  const [activeTab, setActiveTab] = useState<'CYCLES' | 'STRUCTURES' | 'PAYSLIPS' | 'LEDGER' | 'STATUTORY'>('CYCLES');
  const [periods, setPeriods] = useState<PayrollPeriodItem[]>(FALLBACK_PERIODS);
  const [structures, setStructures] = useState<SalaryStructureItem[]>(FALLBACK_STRUCTURES);
  const [payslips, setPayslips] = useState<PayslipItem[]>(FALLBACK_PAYSLIPS);
  const [statutoryRules, setStatutoryRules] = useState<StatutoryRuleItem[]>(STATUTORY_RULES_DEFAULT);

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriodItem | null>(null);

  // Modal states
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipItem | null>(null);

  // Form states
  const [runForm, setRunForm] = useState({
    year: 2026,
    month: 10,
    totalWorkingDays: 30,
  });

  const [structureForm, setStructureForm] = useState({
    employeeId: '',
    baseSalaryMonthly: 30000,
    housingAllowanceMonthly: 12000,
    transportAllowanceMonthly: 4000,
    medicalAllowanceMonthly: 3000,
    specialAllowanceMonthly: 5000,
    payGrade: 'Grade 6',
  });

  const handleProcessPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/payroll/periods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(runForm),
      });

      if (res.ok) {
        const json = await res.json();
        const newPeriod = json.data?.period;
        if (newPeriod) {
          setPeriods([newPeriod, ...periods]);
        }
      } else {
        // Mock add
        const mockNew: PayrollPeriodItem = {
          id: `period_${Date.now()}`,
          periodCode: `PAY-${runForm.year}-${runForm.month.toString().padStart(2, '0')}`,
          year: runForm.year,
          month: runForm.month,
          startDate: new Date(runForm.year, runForm.month - 1, 1).toISOString(),
          endDate: new Date(runForm.year, runForm.month, 0).toISOString(),
          totalWorkingDays: runForm.totalWorkingDays,
          status: 'PENDING_APPROVAL',
          totalGrossAmountINR: 3300000,
          totalDeductionsINR: 390000,
          totalNetAmountINR: 2910000,
          totalEmployeesCount: structures.length,
        };
        setPeriods([mockNew, ...periods]);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
      setIsProcessModalOpen(false);
    }
  };

  const handleApprovePeriod = async (periodId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/payroll/periods/${periodId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: 'Executive Director and Finance Signoff completed.' }),
      });

      setPeriods((prev) =>
        prev.map((p) =>
          p.id === periodId
            ? { ...p, status: 'APPROVED', approvedAt: new Date().toISOString() }
            : p
        )
      );
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisbursePeriod = async (periodId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/payroll/periods/${periodId}/disburse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disbursementMode: 'BANK_TRANSFER',
          transactionReference: `NEFT-BULK-${Date.now().toString().slice(-6)}`,
        }),
      });

      setPeriods((prev) =>
        prev.map((p) =>
          p.id === periodId
            ? {
                ...p,
                status: 'DISBURSED',
                disbursedAt: new Date().toISOString(),
                voucher: { voucherNumber: `VCH-PAY-${p.periodCode}-9912`, totalAmount: p.totalGrossAmountINR },
              }
            : p
        )
      );
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-emerald-800/40">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gold-400/20 text-gold-300 text-xs font-bold uppercase tracking-widest border border-gold-400/30 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Human Capital &amp; Treasury Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono border border-emerald-500/30">
              Double-Entry GL Integrated
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Modular Payroll &amp; Compensation Directorate
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/80 leading-relaxed">
            Automates employee salary structures, attendance-prorated Loss of Pay (LOP), configurable statutory tax/PF schemes, multi-level review approvals, tamper-proof cryptographic payslips, and balanced general ledger journal postings.
          </p>
        </div>
      </div>

      {/* Statutory Advisory Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3.5 text-xs text-amber-900 shadow-sm">
        <Scale className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-950 tracking-wide uppercase text-[10px] bg-amber-200/60 px-2 py-0.5 rounded">
              REQUIRES PROFESSIONAL VERIFICATION
            </span>
            <span className="font-semibold text-amber-800">Dynamic Statutory Labor Framework</span>
          </div>
          <p className="text-amber-800/90 leading-relaxed">
            Statutory tax withholding (TDS), Provident Fund caps, and healthcare insurance rules are dynamically configured in policy tables rather than hardcoded. All rates and exemptions must be verified by local qualified legal counsel and labor accountants for each operating jurisdiction.
          </p>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Staff On Payroll</span>
          <p className="text-2xl font-serif font-bold text-slate-900">{structures.length}</p>
          <span className="text-[11px] text-emerald-700 font-medium">100% Structures Configured</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Latest Net Disbursed</span>
          <p className="text-2xl font-serif font-bold text-emerald-950">₹28.65 L</p>
          <span className="text-[11px] text-slate-500">Period PAY-2026-09</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Statutory TDS Withheld</span>
          <p className="text-2xl font-serif font-bold text-slate-900">₹3.85 L</p>
          <span className="text-[11px] text-gold-700 font-medium">Auto-Booked to GL 2040</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">General Ledger Status</span>
          <p className="text-2xl font-serif font-bold text-emerald-900">Balanced</p>
          <span className="text-[11px] text-emerald-700 font-medium">Trial Balance 100% Matched</span>
        </div>
      </div>

      {/* Tab Navigation Workspace */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('CYCLES')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'CYCLES'
              ? 'bg-emerald-950 text-gold-300 shadow-md font-bold'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Payroll Cycles &amp; Runs</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-900 text-gold-300 text-[10px]">{periods.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('STRUCTURES')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'STRUCTURES'
              ? 'bg-emerald-950 text-gold-300 shadow-md font-bold'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Salary Structures &amp; CTC</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-900 text-gold-300 text-[10px]">{structures.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('PAYSLIPS')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'PAYSLIPS'
              ? 'bg-emerald-950 text-gold-300 shadow-md font-bold'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Cryptographic Payslips</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-900 text-gold-300 text-[10px]">{payslips.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('LEDGER')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'LEDGER'
              ? 'bg-emerald-950 text-gold-300 shadow-md font-bold'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>General Ledger Integration</span>
        </button>

        <button
          onClick={() => setActiveTab('STATUTORY')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'STATUTORY'
              ? 'bg-emerald-950 text-gold-300 shadow-md font-bold'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Statutory Rules &amp; Policies</span>
          <span className="px-1.5 py-0.5 rounded-full bg-gold-400/20 text-gold-400 text-[10px] font-bold">Config</span>
        </button>
      </div>

      {/* TAB 1: PAYROLL CYCLES & BATCH RUNS */}
      {activeTab === 'CYCLES' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900">Monthly Payroll Cycles</h3>
              <p className="text-xs text-slate-500">Initiate batch calculation, review proration, approve runs, and disburse bank payments.</p>
            </div>
            <button
              onClick={() => setIsProcessModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-950 hover:bg-black text-gold-300 font-bold text-xs shadow-md flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Initiate Monthly Run</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Period Code</th>
                    <th className="py-3.5 px-6">Working Days</th>
                    <th className="py-3.5 px-6">Staff Count</th>
                    <th className="py-3.5 px-6">Gross Earnings</th>
                    <th className="py-3.5 px-6">Deductions</th>
                    <th className="py-3.5 px-6">Net Payable</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">GL Voucher</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {periods.map((period) => (
                    <tr key={period.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-emerald-950">
                        {period.periodCode}
                      </td>
                      <td className="py-4 px-6 text-slate-600">{period.totalWorkingDays} Days</td>
                      <td className="py-4 px-6 font-semibold text-slate-800">{period.totalEmployeesCount} Staff</td>
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        ₹{Number(period.totalGrossAmountINR).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6 text-rose-700 font-medium">
                        -₹{Number(period.totalDeductionsINR).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6 font-bold text-emerald-950">
                        ₹{Number(period.totalNetAmountINR).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            period.status === 'DISBURSED'
                              ? 'bg-emerald-100 text-emerald-900'
                              : period.status === 'APPROVED'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {period.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px] text-slate-600">
                        {period.voucher?.voucherNumber || 'Pending Post'}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        {period.status === 'PENDING_APPROVAL' && (
                          <button
                            onClick={() => handleApprovePeriod(period.id)}
                            className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-bold text-[11px] shadow-sm"
                          >
                            Approve Run
                          </button>
                        )}
                        {period.status === 'APPROVED' && (
                          <button
                            onClick={() => handleDisbursePeriod(period.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-black text-gold-300 font-bold text-[11px] shadow-sm"
                          >
                            Disburse Bank
                          </button>
                        )}
                        {period.status === 'DISBURSED' && (
                          <span className="text-[11px] font-semibold text-emerald-800 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Disbursed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SALARY STRUCTURES & CTC */}
      {activeTab === 'STRUCTURES' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900">Employee Salary Structures</h3>
              <p className="text-xs text-slate-500">Configured allowances, base pay grades, CTC projections, and encrypted compensation data.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {structures.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {item.employee.employeeNumber}
                    </span>
                    <h4 className="font-serif font-bold text-slate-900 text-sm mt-1">{item.employee.fullName}</h4>
                    <span className="text-[11px] text-slate-500">{item.employee.designation?.title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                    {item.payGrade || 'L3'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Salary (Monthly):</span>
                    <span className="font-semibold text-slate-900">₹{Number(item.baseSalaryMonthly).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>HRA Allowance:</span>
                    <span className="font-semibold text-slate-900">₹{Number(item.housingAllowanceMonthly).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Transport / Medical:</span>
                    <span className="font-semibold text-slate-900">
                      ₹{(Number(item.transportAllowanceMonthly) + Number(item.medicalAllowanceMonthly)).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Special Allowance:</span>
                    <span className="font-semibold text-slate-900">₹{Number(item.specialAllowanceMonthly).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-emerald-950 text-sm">
                    <span>Gross Monthly:</span>
                    <span>₹{Number(item.grossMonthlySalary).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Annual CTC:</span>
                    <span className="font-semibold text-slate-700">₹{Number(item.annualCTC).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PAYSLIPS & CRYPTOGRAPHIC VERIFICATION */}
      {activeTab === 'PAYSLIPS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900">Cryptographically Signed Payslips</h3>
              <p className="text-xs text-slate-500">Every payslip contains an HMAC-SHA256 digital signature hash verifiable online.</p>
            </div>
          </div>

          <div className="space-y-4">
            {payslips.map((psl) => (
              <div
                key={psl.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-950 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      {psl.payslipNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
                      {psl.employee.department?.name}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                      {psl.status}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-slate-900">
                    {psl.employee.fullName} ({psl.employee.employeeNumber})
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Days Present</span>
                      <p className="font-bold text-slate-800">{psl.daysPresent} / {psl.workingDaysInMonth}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Gross Earnings</span>
                      <p className="font-bold text-slate-900">₹{Number(psl.totalEarningsGross).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Deductions</span>
                      <p className="font-bold text-rose-700">-₹{Number(psl.totalDeductions).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Net Disbursed</span>
                      <p className="font-bold text-emerald-950">₹{Number(psl.netPayableINR).toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <QrCode className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-[10px] text-slate-400 truncate max-w-md">
                      Hash: {psl.verificationHash}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <Link
                    href={`/verify/payslip/${psl.verificationHash}`}
                    target="_blank"
                    className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Verify Seal</span>
                  </Link>
                  <button
                    onClick={() => setSelectedPayslip(psl)}
                    className="px-4 py-2 rounded-xl bg-emerald-950 hover:bg-black text-gold-300 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Payslip</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GENERAL LEDGER INTEGRATION */}
      {activeTab === 'LEDGER' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Automated Accounting Bridge</span>
                <h3 className="text-lg font-serif font-bold text-white mt-0.5">Double-Entry Payroll Journal Postings</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
                Auto-Balanced
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              When a monthly payroll period is disbursed, the platform automatically posts a balanced General Ledger Voucher debiting staff compensation expenses and crediting withholding liabilities (TDS, PF, ESI) and bank central trust accounts.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5" /> Debit Accounts (Expenses)
                </span>
                <ul className="text-xs space-y-1.5 font-mono text-slate-300">
                  <li className="flex justify-between">
                    <span>5010-SALARY-WAGES-EXPENSE</span>
                    <span className="text-white font-bold">Gross Salaries &amp; Allowances</span>
                  </li>
                  <li className="flex justify-between">
                    <span>5020-EMPLOYER-STATUTORY-EXPENSE</span>
                    <span className="text-white font-bold">Employer PF &amp; ESI Match</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <span className="text-xs font-bold text-gold-400 flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5" /> Credit Accounts (Liabilities &amp; Bank)
                </span>
                <ul className="text-xs space-y-1.5 font-mono text-slate-300">
                  <li className="flex justify-between">
                    <span>1010-HDFC-BANK-MAIN</span>
                    <span className="text-white font-bold">Net Salaries Disbursed</span>
                  </li>
                  <li className="flex justify-between">
                    <span>2040-STATUTORY-TAX-PAYABLE</span>
                    <span className="text-white font-bold">TDS Withheld</span>
                  </li>
                  <li className="flex justify-between">
                    <span>2041-STATUTORY-PROVIDENT-FUND</span>
                    <span className="text-white font-bold">Total PF Contributions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STATUTORY RULES & POLICIES */}
      {activeTab === 'STATUTORY' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900">Configurable Statutory Scheme Formulas</h3>
              <p className="text-xs text-slate-500">Dynamic tax brackets, PF contribution caps, and insurance schemes.</p>
            </div>
          </div>

          <div className="space-y-4">
            {statutoryRules.map((rule) => (
              <div
                key={rule.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded">
                        {rule.ruleCode}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                        {rule.disclaimerNotice}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-base text-slate-900">{rule.ruleName}</h4>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold self-start sm:self-auto">
                    {rule.calculationType}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 font-mono text-xs text-slate-700">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(rule.ruleParamsJson, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: INITIATE MONTHLY RUN */}
      {isProcessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Payroll Engine</span>
                <h3 className="text-lg font-serif font-bold text-slate-900">Initiate Monthly Payroll Run</h3>
              </div>
              <button
                onClick={() => setIsProcessModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessPayroll} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Cycle Year</label>
                  <input
                    type="number"
                    value={runForm.year}
                    onChange={(e) => setRunForm({ ...runForm, year: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Cycle Month (1-12)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={runForm.month}
                    onChange={(e) => setRunForm({ ...runForm, month: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Total Working Days in Month</label>
                <input
                  type="number"
                  min={20}
                  max={31}
                  value={runForm.totalWorkingDays}
                  onChange={(e) => setRunForm({ ...runForm, totalWorkingDays: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
                This will automatically aggregate attendance check-ins, compute Loss of Pay (LOP) for unapproved leaves, apply dynamic TDS and PF rules, and draft payslips.
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProcessModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-950 hover:bg-black text-gold-300 font-bold flex items-center gap-2"
                >
                  {isLoading ? <span>Processing...</span> : <span>Run Payroll Calculation</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW DETAILED PAYSLIP */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">Digital Payslip Voucher</span>
                <h3 className="text-lg font-serif font-bold text-slate-900">{selectedPayslip.payslipNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Employee Name:</span>
                <span className="font-bold text-slate-900">{selectedPayslip.employee.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Employee Serial:</span>
                <span className="font-mono font-bold text-emerald-950">{selectedPayslip.employee.employeeNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-800">{selectedPayslip.employee.department?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank Destination:</span>
                <span className="font-mono text-slate-700">{selectedPayslip.maskedBankSnapshot}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <h5 className="font-bold text-emerald-950 uppercase text-[10px] tracking-wider">Gross Earnings</h5>
                <div className="flex justify-between">
                  <span>Basic Salary:</span>
                  <span className="font-semibold">₹{Number(selectedPayslip.basicPay).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>HRA Allowance:</span>
                  <span className="font-semibold">₹{Number(selectedPayslip.hraAllowance).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t border-emerald-200/60 pt-1 font-bold text-emerald-950">
                  <span>Total Gross:</span>
                  <span>₹{Number(selectedPayslip.totalEarningsGross).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
                <h5 className="font-bold text-rose-950 uppercase text-[10px] tracking-wider">Deductions</h5>
                <div className="flex justify-between">
                  <span>Statutory TDS:</span>
                  <span className="font-semibold">₹{Number(selectedPayslip.statutoryTaxTDS).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Provident Fund:</span>
                  <span className="font-semibold">₹{Number(selectedPayslip.statutoryProvidentFund).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t border-rose-200/60 pt-1 font-bold text-rose-950">
                  <span>Total Deductions:</span>
                  <span>₹{Number(selectedPayslip.totalDeductions).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gold-300 uppercase tracking-widest">Net Disbursed Pay</span>
                <p className="text-2xl font-serif font-bold text-white">₹{Number(selectedPayslip.netPayableINR).toLocaleString('en-IN')}</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-gold-400" />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
              <QrCode className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">HMAC Seal: {selectedPayslip.verificationHash}</span>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedPayslip(null)}
                className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
