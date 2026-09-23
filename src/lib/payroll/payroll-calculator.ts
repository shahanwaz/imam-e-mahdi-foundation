export interface SalaryComponentsInput {
  baseSalaryMonthly: number;
  housingAllowanceMonthly?: number;
  transportAllowanceMonthly?: number;
  medicalAllowanceMonthly?: number;
  specialAllowanceMonthly?: number;
  customAllowancesMonthly?: Array<{ name: string; amount: number; isTaxable?: boolean }>;
}

export interface AttendanceMetricsInput {
  totalWorkingDaysInMonth?: number;
  daysPresent: number;
  paidLeaveDays?: number;
  unpaidLeaveDays?: number; // LOP
}

export interface StatutoryRuleDefinition {
  ruleCode: string;
  ruleCategory: 'INCOME_TAX_TDS' | 'PROVIDENT_FUND' | 'EMPLOYEE_STATE_INSURANCE' | 'PROFESSIONAL_TAX' | 'CUSTOM_ALLOWANCE' | 'CUSTOM_DEDUCTION';
  calculationType: 'PERCENTAGE_OF_BASIC' | 'PERCENTAGE_OF_GROSS' | 'SLAB_TIERED' | 'FLAT_AMOUNT';
  ruleParamsJson: {
    percentage?: number;
    flatAmount?: number;
    statutoryCapAmount?: number;
    minimumGrossThreshold?: number;
    maximumGrossThreshold?: number;
    employerMatchPercentage?: number;
    slabs?: Array<{ min: number; max: number | null; ratePercent: number }>;
  };
  isEmployerContribution?: boolean;
  isEnabled?: boolean;
}

export interface PayrollCalculationResult {
  // Proration & Working metrics
  workingDaysInMonth: number;
  daysPresent: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  payableDays: number;
  prorationFactor: number;

  // Earnings
  fullMonthlyGross: number;
  basicPay: number;
  hraAllowance: number;
  transportAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  customAllowancesTotal: number;
  performanceBonus: number;
  overtimeOrArrears: number;
  totalEarningsGross: number;

  // Deductions
  lossOfPayDeduction: number;
  statutoryTaxTDS: number;
  statutoryProvidentFund: number;
  statutoryInsurance: number;
  voluntaryDeductions: number;
  totalDeductions: number;

  // Net Pay
  netPayableINR: number;

  // Employer Contributions (Informational for CTC analysis)
  employerProvidentFund: number;
  employerInsurance: number;
  totalCostToOrganization: number;
}

export class PayrollCalculator {
  /**
   * Helper: Rounds monetary values cleanly to 2 decimal places
   */
  public static roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  /**
   * Calculates dynamic statutory tax (TDS / Income tax withholding)
   */
  public static calculateStatutoryTax(
    monthlyGross: number,
    annualGrossProjected: number,
    rule?: StatutoryRuleDefinition
  ): number {
    if (!rule || !rule.isEnabled) {
      // Default Configurable Slab System:
      // Annual <= 300,000: 0%
      // 300,001 - 600,000: 5%
      // 600,001 - 900,000: 10%
      // 900,001 - 1,200,000: 15%
      // > 1,200,000: 20%
      if (annualGrossProjected <= 300000) return 0;
      if (annualGrossProjected <= 600000) return PayrollCalculator.roundCurrency((annualGrossProjected * 0.05) / 12);
      if (annualGrossProjected <= 900000) return PayrollCalculator.roundCurrency((annualGrossProjected * 0.10) / 12);
      if (annualGrossProjected <= 1200000) return PayrollCalculator.roundCurrency((annualGrossProjected * 0.15) / 12);
      return PayrollCalculator.roundCurrency((annualGrossProjected * 0.20) / 12);
    }

    if (rule.calculationType === 'PERCENTAGE_OF_GROSS') {
      const rate = rule.ruleParamsJson.percentage || 0;
      return PayrollCalculator.roundCurrency((monthlyGross * rate) / 100);
    }

    if (rule.calculationType === 'SLAB_TIERED' && rule.ruleParamsJson.slabs) {
      for (const slab of rule.ruleParamsJson.slabs) {
        const min = slab.min;
        const max = slab.max ?? Infinity;
        if (annualGrossProjected >= min && annualGrossProjected <= max) {
          return PayrollCalculator.roundCurrency((annualGrossProjected * (slab.ratePercent / 100)) / 12);
        }
      }
    }

    if (rule.calculationType === 'FLAT_AMOUNT') {
      return rule.ruleParamsJson.flatAmount || 0;
    }

    return 0;
  }

  /**
   * Calculates Statutory Provident Fund & Social Security
   */
  public static calculateProvidentFund(
    basicPay: number,
    rule?: StatutoryRuleDefinition
  ): { employeePf: number; employerPf: number } {
    const rate = rule?.ruleParamsJson?.percentage ?? 12; // Standard 12% default
    const employerRate = rule?.ruleParamsJson?.employerMatchPercentage ?? 12;
    const cap = rule?.ruleParamsJson?.statutoryCapAmount ?? 1800; // Standard monthly cap if basic exceeds ₹15,000

    let employeePf = (basicPay * rate) / 100;
    let employerPf = (basicPay * employerRate) / 100;

    if (cap > 0) {
      employeePf = Math.min(employeePf, cap);
      employerPf = Math.min(employerPf, cap);
    }

    return {
      employeePf: PayrollCalculator.roundCurrency(employeePf),
      employerPf: PayrollCalculator.roundCurrency(employerPf),
    };
  }

  /**
   * Calculates Statutory Health & State Insurance (e.g. ESI)
   */
  public static calculateStatutoryInsurance(
    grossEarnings: number,
    rule?: StatutoryRuleDefinition
  ): { employeeInsurance: number; employerInsurance: number } {
    const maxThreshold = rule?.ruleParamsJson?.maximumGrossThreshold ?? 21000;
    
    // Usually applicable only for gross earnings under threshold unless custom rule
    if (grossEarnings > maxThreshold && !rule?.ruleParamsJson?.maximumGrossThreshold) {
      return { employeeInsurance: 0, employerInsurance: 0 };
    }

    if (grossEarnings > maxThreshold) {
      return { employeeInsurance: 0, employerInsurance: 0 };
    }

    const empRate = rule?.ruleParamsJson?.percentage ?? 0.75;
    const orgRate = rule?.ruleParamsJson?.employerMatchPercentage ?? 3.25;

    return {
      employeeInsurance: PayrollCalculator.roundCurrency((grossEarnings * empRate) / 100),
      employerInsurance: PayrollCalculator.roundCurrency((grossEarnings * orgRate) / 100),
    };
  }

  /**
   * Computes complete, itemized monthly payroll calculation for an employee
   */
  public static calculatePayslip(
    salary: SalaryComponentsInput,
    attendance: AttendanceMetricsInput,
    options?: {
      statutoryRules?: StatutoryRuleDefinition[];
      performanceBonus?: number;
      overtimeOrArrears?: number;
      voluntaryDeductions?: number;
    }
  ): PayrollCalculationResult {
    const workingDays = attendance.totalWorkingDaysInMonth ?? 30;
    const daysPresent = Math.max(0, attendance.daysPresent);
    const paidLeaveDays = Math.max(0, attendance.paidLeaveDays ?? 0);
    const unpaidLeaveDays = Math.max(0, attendance.unpaidLeaveDays ?? 0);

    // Calculate Payable Days (cannot exceed working days in month)
    const payableDays = Math.max(
      0,
      Math.min(workingDays, workingDays - unpaidLeaveDays)
    );

    const prorationFactor = workingDays > 0 ? payableDays / workingDays : 0;

    // Full scheduled monthly gross
    const customSum = (salary.customAllowancesMonthly ?? []).reduce((acc, curr) => acc + curr.amount, 0);
    const fullMonthlyGross =
      salary.baseSalaryMonthly +
      (salary.housingAllowanceMonthly ?? 0) +
      (salary.transportAllowanceMonthly ?? 0) +
      (salary.medicalAllowanceMonthly ?? 0) +
      (salary.specialAllowanceMonthly ?? 0) +
      customSum;

    // Prorated Base Earnings
    const basicPay = PayrollCalculator.roundCurrency(salary.baseSalaryMonthly * prorationFactor);
    const hraAllowance = PayrollCalculator.roundCurrency((salary.housingAllowanceMonthly ?? 0) * prorationFactor);
    const transportAllowance = PayrollCalculator.roundCurrency((salary.transportAllowanceMonthly ?? 0) * prorationFactor);
    const medicalAllowance = PayrollCalculator.roundCurrency((salary.medicalAllowanceMonthly ?? 0) * prorationFactor);
    const specialAllowance = PayrollCalculator.roundCurrency((salary.specialAllowanceMonthly ?? 0) * prorationFactor);
    const customAllowancesTotal = PayrollCalculator.roundCurrency(customSum * prorationFactor);

    const performanceBonus = PayrollCalculator.roundCurrency(options?.performanceBonus ?? 0);
    const overtimeOrArrears = PayrollCalculator.roundCurrency(options?.overtimeOrArrears ?? 0);

    const totalEarningsGross = PayrollCalculator.roundCurrency(
      basicPay +
      hraAllowance +
      transportAllowance +
      medicalAllowance +
      specialAllowance +
      customAllowancesTotal +
      performanceBonus +
      overtimeOrArrears
    );

    // Loss of Pay calculation
    const lossOfPayDeduction = PayrollCalculator.roundCurrency(
      Math.max(0, fullMonthlyGross - (basicPay + hraAllowance + transportAllowance + medicalAllowance + specialAllowance + customAllowancesTotal))
    );

    // Statutory Rules Lookup
    const rules = options?.statutoryRules ?? [];
    const taxRule = rules.find((r) => r.ruleCategory === 'INCOME_TAX_TDS');
    const pfRule = rules.find((r) => r.ruleCategory === 'PROVIDENT_FUND');
    const esiRule = rules.find((r) => r.ruleCategory === 'EMPLOYEE_STATE_INSURANCE');

    // Projected Annual Gross for TDS calculation
    const annualGrossProjected = totalEarningsGross * 12;

    const statutoryTaxTDS = PayrollCalculator.calculateStatutoryTax(totalEarningsGross, annualGrossProjected, taxRule);
    const { employeePf, employerPf } = PayrollCalculator.calculateProvidentFund(basicPay, pfRule);
    const { employeeInsurance, employerInsurance } = PayrollCalculator.calculateStatutoryInsurance(totalEarningsGross, esiRule);

    const voluntaryDeductions = PayrollCalculator.roundCurrency(options?.voluntaryDeductions ?? 0);

    const totalDeductions = PayrollCalculator.roundCurrency(
      statutoryTaxTDS + employeePf + employeeInsurance + voluntaryDeductions
    );

    // Net Payable: Guarantee >= 0
    const netPayableINR = PayrollCalculator.roundCurrency(Math.max(0, totalEarningsGross - totalDeductions));

    const totalCostToOrganization = PayrollCalculator.roundCurrency(
      totalEarningsGross + employerPf + employerInsurance
    );

    return {
      workingDaysInMonth: workingDays,
      daysPresent,
      paidLeaveDays,
      unpaidLeaveDays,
      payableDays,
      prorationFactor,
      fullMonthlyGross: PayrollCalculator.roundCurrency(fullMonthlyGross),
      basicPay,
      hraAllowance,
      transportAllowance,
      medicalAllowance,
      specialAllowance,
      customAllowancesTotal,
      performanceBonus,
      overtimeOrArrears,
      totalEarningsGross,
      lossOfPayDeduction,
      statutoryTaxTDS,
      statutoryProvidentFund: employeePf,
      statutoryInsurance: employeeInsurance,
      voluntaryDeductions,
      totalDeductions,
      netPayableINR,
      employerProvidentFund: employerPf,
      employerInsurance,
      totalCostToOrganization,
    };
  }
}
