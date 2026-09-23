import { CountryTaxScheme } from './types';
import { ComplianceConfig } from '@/lib/compliance/compliance-config';

export const COUNTRY_TAX_SCHEMES: Record<string, CountryTaxScheme> = {
  IN: {
    schemeName: 'SECTION_80G',
    schemeLabel: 'Indian Income Tax Acknowledgment',
    taxIdLabel: 'PAN Card Number (For Donor Records)',
    taxIdPlaceholder: 'ABCDE1234F',
    taxIdRegex: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$',
    deductionPercentageText: 'Section 80G Status: Pending Statutory Verification',
    isReceiptEligible: true,
    statutoryDisclaimer:
      'Imam E Mahdi Foundation is a registered Section 8 not-for-profit company (CIN: U88900DC2026NPL474906). Statutory Section 80G income tax exemption is currently undergoing formal verification. Standard donation acknowledgment receipts are issued.',
  },
  GB: {
    schemeName: 'GIFT_AID',
    schemeLabel: 'UK Direct Contribution',
    taxIdLabel: 'National Insurance Number (Optional)',
    taxIdPlaceholder: 'JH123456A',
    taxIdRegex: '^[A-Z]{2}[0-9]{6}[A-D]{1}$',
    deductionPercentageText: 'Direct Cross-Border Contribution Acknowledgment',
    isReceiptEligible: true,
    statutoryDisclaimer:
      'UK Gift Aid registration is pending local regulatory approvals. Contributions acknowledged as direct foreign branch/cross-border donations.',
  },
  US: {
    schemeName: 'IRS_501C3',
    schemeLabel: 'US Direct Contribution',
    taxIdLabel: 'Taxpayer ID (Optional)',
    taxIdPlaceholder: 'XX-XXXXXXX or XXX-XX-XXXX',
    taxIdRegex: '^(?:\\d{3}-\\d{2}-\\d{4}|\\d{2}-\\d{7})$',
    deductionPercentageText: 'Direct Humanitarian Contribution Acknowledgment',
    isReceiptEligible: true,
    statutoryDisclaimer:
      'US 501(c)(3) fiscal sponsorship / registration is pending local regulatory filings. Receipts provide proof of noble charitable transfer.',
  },
  AE: {
    schemeName: 'ZAKAT_DEDUCTION',
    schemeLabel: 'UAE & GCC Zakat Allocation',
    taxIdLabel: 'Emirates ID / National ID',
    taxIdPlaceholder: '784-YYYY-XXXXXXX-Z',
    taxIdRegex: '^784-[0-9]{4}-[0-9]{7}-[0-9]{1}$',
    deductionPercentageText: '100% Sharia Certified & Community Welfare Segregated',
    isReceiptEligible: true,
    statutoryDisclaimer:
      'Disbursed strictly in accordance with certified Islamic jurisprudence and theological fund isolation rules.',
  },
  SA: {
    schemeName: 'ZAKAT_DEDUCTION',
    schemeLabel: 'Saudi Arabia Zakat Allocation',
    taxIdLabel: 'National ID / Iqama Number',
    taxIdPlaceholder: '1XXXXXXXXX or 2XXXXXXXXX',
    taxIdRegex: '^[12][0-9]{9}$',
    deductionPercentageText: '100% Sharia & Zakat Segregated',
    isReceiptEligible: true,
    statutoryDisclaimer:
      'Zakat allocations verified and audited by Islamic scholars and certified accountants under restricted reserves.',
  },
  CA: {
    schemeName: 'CRA_CHARITABLE',
    schemeLabel: 'Canada Direct Contribution',
    taxIdLabel: 'Social Insurance Number (Optional)',
    taxIdPlaceholder: 'XXX-XXX-XXX',
    taxIdRegex: '^\\d{3}-\\d{3}-\\d{3}$',
    deductionPercentageText: 'Direct Humanitarian Contribution Acknowledgment',
    isReceiptEligible: true,
    statutoryDisclaimer:
      'Canadian charitable registration is pending local regulatory filings. Receipts provide proof of noble charitable transfer.',
  },
  AU: {
    schemeName: 'ATO_DGR',
    schemeLabel: 'Australia Direct Contribution',
    taxIdLabel: 'Tax File Number (Optional)',
    taxIdPlaceholder: 'XXX XXX XXX',
    taxIdRegex: '^\\d{8,9}$',
    deductionPercentageText: 'Direct Humanitarian Contribution Acknowledgment',
    isReceiptEligible: true,
    statutoryDisclaimer:
      'Australian DGR registration is pending local regulatory filings. Receipts provide proof of noble charitable transfer.',
  },
};

export class TaxComplianceRegistry {
  public static getTaxScheme(countryCode?: string): CountryTaxScheme | null {
    if (!countryCode) return COUNTRY_TAX_SCHEMES.IN;
    const code = countryCode.toUpperCase();
    return COUNTRY_TAX_SCHEMES[code] || null;
  }

  public static validateTaxId(countryCode: string, taxId: string): { isValid: boolean; message?: string } {
    const scheme = this.getTaxScheme(countryCode);
    if (!scheme) return { isValid: true };
    if (!taxId || !taxId.trim()) return { isValid: false, message: `${scheme.taxIdLabel} is required for tax deduction.` };

    if (scheme.taxIdRegex) {
      const regex = new RegExp(scheme.taxIdRegex, 'i');
      const cleanId = taxId.trim().toUpperCase();
      if (!regex.test(cleanId)) {
        return {
          isValid: false,
          message: `Invalid format for ${scheme.taxIdLabel}. Example format: ${scheme.taxIdPlaceholder}`,
        };
      }
    }

    return { isValid: true };
  }
}
