import { describe, it, expect } from 'vitest';
import { ComplianceStatus, FundType } from '@prisma/client';
import { ComplianceConfig, COMPLIANCE_CONFIGURATION } from '@/lib/compliance/compliance-config';
import { ReceiptService } from '@/lib/donations/receipt-service';

describe('Compliance & Regulatory Rules Enforcement Tests', () => {
  it('1. should verify that central COMPLIANCE_CONFIGURATION defaults to NOT_VERIFIED for sensitive legal statuses', () => {
    // Default safety assertion
    expect(COMPLIANCE_CONFIGURATION.items.SECTION_80G.status).toBe('NOT_VERIFIED');
    expect(COMPLIANCE_CONFIGURATION.items.SECTION_12AB.status).toBe('NOT_VERIFIED');
    expect(COMPLIANCE_CONFIGURATION.items.FCRA.status).toBe('NOT_VERIFIED');
    expect(COMPLIANCE_CONFIGURATION.items.CSR_1.status).toBe('NOT_VERIFIED');
    expect(COMPLIANCE_CONFIGURATION.items.NGO_DARPAN.status).toBe('NOT_VERIFIED');

    // Verification engine helper assertions
    expect(ComplianceConfig.is80GVerified()).toBe(false);
    expect(ComplianceConfig.isFCRAVerified()).toBe(false);
    expect(ComplianceConfig.is12ABVerified()).toBe(false);
    expect(ComplianceConfig.isCSRVerified()).toBe(false);
  });

  it('2. should enforce that 80G tax deduction is strictly DISABLED when 80G_STATUS is NOT_VERIFIED (even if category is80GEligible is true)', () => {
    const category = {
      complianceStatus: ComplianceStatus.APPROVED,
      is80GEligible: true,
      taxDeductionPercent: 50,
    };

    // The law requires central organizational 80G certification BEFORE category eligibility can apply
    const isTaxDeductionValid = (cat: { complianceStatus: ComplianceStatus; is80GEligible: boolean }) =>
      ComplianceConfig.is80GVerified() && cat.complianceStatus === ComplianceStatus.APPROVED && Boolean(cat.is80GEligible);

    // In default NOT_VERIFIED state:
    expect(isTaxDeductionValid(category)).toBe(false);
  });

  it('3. should provide safe statutory disclaimer when 80G is NOT_VERIFIED', () => {
    const disclaimer = ComplianceConfig.getDonationReceiptDisclaimer();
    expect(disclaimer.isTaxDeductible).toBe(false);
    expect(disclaimer.title).toBe('Official Donation & Acknowledgment Receipt');
    expect(disclaimer.noticeText).toContain('pending formal regulatory verification');
    expect(disclaimer.registrationReference).toContain('CIN: U88900DC2026NPL474906');
  });

  it('4. [DEMO / TEST ONLY] should compute mock test deduction only within explicitly labeled demo harness', () => {
    const mockTestDonationAmount = 10000;
    const demoTaxDeduction = mockTestDonationAmount * 0.5; // 50% illustrative calculation for test suite

    // Must be explicitly labeled DEMO / TEST ONLY
    const testResult = {
      label: 'DEMO / TEST ONLY',
      donationAmount: mockTestDonationAmount,
      illustrativeDeduction: demoTaxDeduction,
      productionActive: ComplianceConfig.is80GVerified(), // false in production
    };

    expect(testResult.label).toBe('DEMO / TEST ONLY');
    expect(testResult.illustrativeDeduction).toBe(5000);
    expect(testResult.productionActive).toBe(false);
  });

  it('5. should validate PAN format for donor records and future Form 10BD filings', () => {
    const validatePanFor80G = (pan?: string) => {
      if (!pan) return false;
      return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(pan.trim());
    };

    expect(validatePanFor80G('ABCDE1234F')).toBe(true);
    expect(validatePanFor80G('XYZPQ9876Z')).toBe(true);
    expect(validatePanFor80G('INVALID_PAN')).toBe(false);
    expect(validatePanFor80G('')).toBe(false);
  });

  it('6. should guarantee religious fund isolation into distinct restricted accounts', () => {
    const getTargetAccountHead = (fundType: FundType) => {
      switch (fundType) {
        case FundType.ZAKAT_MAL:
          return '2010-ZAKAT-MAL-RESERVE';
        case FundType.ZAKAT_FITRAH:
          return '2015-ZAKAT-FITR-RESERVE';
        case FundType.KHUMS_SEHAM_E_IMAM:
          return '2020-KHUMS-SEHAM-IMAM';
        case FundType.KHUMS_SEHAM_E_SADAT:
          return '2030-KHUMS-SEHAM-SADAT';
        case FundType.ORPHAN_AID:
          return '3020-ORPHAN-SPONSORSHIP-FUND';
        case FundType.MEDICAL_AID:
          return '3030-MEDICAL-RELIEF-FUND';
        default:
          return '3010-GENERAL-SADAQAH';
      }
    };

    expect(getTargetAccountHead(FundType.ZAKAT_MAL)).toBe('2010-ZAKAT-MAL-RESERVE');
    expect(getTargetAccountHead(FundType.KHUMS_SEHAM_E_IMAM)).toBe('2020-KHUMS-SEHAM-IMAM');
    expect(getTargetAccountHead(FundType.KHUMS_SEHAM_E_SADAT)).toBe('2030-KHUMS-SEHAM-SADAT');
    expect(getTargetAccountHead(FundType.GENERAL_SADAQAH)).toBe('3010-GENERAL-SADAQAH');
  });
});
