import { describe, it, expect } from 'vitest';
import { PayrollCalculator, StatutoryRuleDefinition } from '@/lib/payroll/payroll-calculator';

describe('Modular Payroll Calculator Unit & Edge Case Tests', () => {
  const standardSalary = {
    baseSalaryMonthly: 30000,
    housingAllowanceMonthly: 12000,
    transportAllowanceMonthly: 3000,
    medicalAllowanceMonthly: 2000,
    specialAllowanceMonthly: 3000,
    customAllowancesMonthly: [{ name: 'Field Relief Allowance', amount: 5000 }],
  }; // Total scheduled monthly gross = 55,000

  describe('Attendance Proration & Loss of Pay (LOP)', () => {
    it('should calculate full unprorated gross earnings for 100% presence', () => {
      const result = PayrollCalculator.calculatePayslip(
        standardSalary,
        {
          totalWorkingDaysInMonth: 30,
          daysPresent: 30,
          paidLeaveDays: 0,
          unpaidLeaveDays: 0,
        }
      );

      expect(result.payableDays).toBe(30);
      expect(result.prorationFactor).toBe(1.0);
      expect(result.fullMonthlyGross).toBe(55000);
      expect(result.basicPay).toBe(30000);
      expect(result.hraAllowance).toBe(12000);
      expect(result.totalEarningsGross).toBe(55000);
      expect(result.lossOfPayDeduction).toBe(0);
    });

    it('should prorate earnings and compute Loss of Pay (LOP) for unpaid leave days', () => {
      // 6 days of unpaid leave in a 30-day month (24 payable days = 80%)
      const result = PayrollCalculator.calculatePayslip(
        standardSalary,
        {
          totalWorkingDaysInMonth: 30,
          daysPresent: 24,
          paidLeaveDays: 0,
          unpaidLeaveDays: 6,
        }
      );

      expect(result.payableDays).toBe(24);
      expect(result.prorationFactor).toBe(0.8);
      expect(result.basicPay).toBe(24000); // 30000 * 0.8
      expect(result.hraAllowance).toBe(9600); // 12000 * 0.8
      expect(result.totalEarningsGross).toBe(44000); // 55000 * 0.8
      expect(result.lossOfPayDeduction).toBe(11000); // 55000 - 44000
    });

    it('should treat approved paid leaves as full payable days without LOP', () => {
      // 25 days present + 5 approved paid leaves = 30 payable days
      const result = PayrollCalculator.calculatePayslip(
        standardSalary,
        {
          totalWorkingDaysInMonth: 30,
          daysPresent: 25,
          paidLeaveDays: 5,
          unpaidLeaveDays: 0,
        }
      );

      expect(result.payableDays).toBe(30);
      expect(result.prorationFactor).toBe(1.0);
      expect(result.totalEarningsGross).toBe(55000);
      expect(result.lossOfPayDeduction).toBe(0);
    });
  });

  describe('Configurable Statutory Rules Engine (TDS, PF, Insurance)', () => {
    it('should compute zero TDS for low-income brackets and tiered progressive TDS for higher earners', () => {
      // Annual <= 300,000 (Monthly 20,000) -> 0 TDS
      const lowEarnerTax = PayrollCalculator.calculateStatutoryTax(20000, 240000);
      expect(lowEarnerTax).toBe(0);

      // Annual 660,000 (Monthly 55,000, falls in 600k-900k bracket @ 10%)
      const midEarnerTax = PayrollCalculator.calculateStatutoryTax(55000, 660000);
      expect(midEarnerTax).toBe(5500); // (660,000 * 0.10) / 12 = 5500
    });

    it('should calculate Provident Fund (PF) with statutory cap and employer match', () => {
      // Basic = 30,000 -> 12% = 3600, but capped at standard cap 1800
      const pf = PayrollCalculator.calculateProvidentFund(30000);
      expect(pf.employeePf).toBe(1800);
      expect(pf.employerPf).toBe(1800);

      // Basic = 10,000 -> 12% = 1200 (< 1800 cap)
      const pfLow = PayrollCalculator.calculateProvidentFund(10000);
      expect(pfLow.employeePf).toBe(1200);
      expect(pfLow.employerPf).toBe(1200);
    });

    it('should calculate Statutory Health Insurance (ESI) only below threshold (<= 21,000)', () => {
      // Gross = 18,000 -> Employee = 0.75% = 135, Employer = 3.25% = 585
      const esiEligible = PayrollCalculator.calculateStatutoryInsurance(18000);
      expect(esiEligible.employeeInsurance).toBe(135);
      expect(esiEligible.employerInsurance).toBe(585);

      // Gross = 55,000 -> Exceeds standard threshold, 0 ESI
      const esiExempt = PayrollCalculator.calculateStatutoryInsurance(55000);
      expect(esiExempt.employeeInsurance).toBe(0);
      expect(esiExempt.employerInsurance).toBe(0);
    });

    it('should respect custom dynamic statutory rule overrides', () => {
      const customRule: StatutoryRuleDefinition = {
        ruleCode: 'CUSTOM_TAX_FLAT',
        ruleCategory: 'INCOME_TAX_TDS',
        calculationType: 'PERCENTAGE_OF_GROSS',
        ruleParamsJson: { percentage: 8.5 },
        isEnabled: true,
      };

      const customTax = PayrollCalculator.calculateStatutoryTax(50000, 600000, customRule);
      expect(customTax).toBe(4250); // 50000 * 8.5%
    });
  });

  describe('Edge Cases & Safeguards', () => {
    it('should handle zero attendance / 100% unpaid leave yielding zero net pay cleanly', () => {
      const result = PayrollCalculator.calculatePayslip(
        standardSalary,
        {
          totalWorkingDaysInMonth: 30,
          daysPresent: 0,
          paidLeaveDays: 0,
          unpaidLeaveDays: 30,
        }
      );

      expect(result.payableDays).toBe(0);
      expect(result.prorationFactor).toBe(0);
      expect(result.totalEarningsGross).toBe(0);
      expect(result.lossOfPayDeduction).toBe(55000);
      expect(result.netPayableINR).toBe(0);
    });

    it('should prevent negative net pay when deductions exceed prorated earnings', () => {
      const smallSalary = {
        baseSalaryMonthly: 5000,
      };

      const result = PayrollCalculator.calculatePayslip(
        smallSalary,
        {
          totalWorkingDaysInMonth: 30,
          daysPresent: 2, // 2/30 = ~333.33 gross
          unpaidLeaveDays: 28,
        },
        {
          voluntaryDeductions: 1000, // exceeds earnings
        }
      );

      expect(result.totalEarningsGross).toBe(333.33);
      expect(result.netPayableINR).toBe(0); // Clamped to 0
    });

    it('should correctly include one-time bonuses and overtime allowances in gross and CTC calculations', () => {
      const result = PayrollCalculator.calculatePayslip(
        standardSalary,
        { totalWorkingDaysInMonth: 30, daysPresent: 30 },
        {
          performanceBonus: 10000,
          overtimeOrArrears: 2500,
        }
      );

      expect(result.performanceBonus).toBe(10000);
      expect(result.overtimeOrArrears).toBe(2500);
      expect(result.totalEarningsGross).toBe(55000 + 10000 + 2500);
      expect(result.totalCostToOrganization).toBeGreaterThan(result.totalEarningsGross);
    });
  });
});
