/**
 * Central Compliance & Regulatory Configuration Engine (IMF-DOS)
 * 
 * CRITICAL COMPLIANCE SAFETY MANDATE:
 * The software must NEVER infer legal or statutory status from company incorporation,
 * Section 8 status, software configuration, receipt templates, admin settings, or test data.
 * 
 * All sensitive legal representations (80G, 12AB, FCRA, CSR-1, 10BD) are centrally governed
 * by this configuration registry.
 */

export type StatutoryComplianceStatus = 'NOT_VERIFIED' | 'VERIFIED' | 'EXPIRED' | 'SUSPENDED';

export interface ComplianceAuditEntry {
  timestamp: string;
  action: string;
  actor: string;
  notes: string;
}

export interface StatutoryEntityRecord {
  code: string;
  name: string;
  category: string;
  status: StatutoryComplianceStatus;
  registrationNumber: string | null;
  orderNumber: string | null;
  effectiveDate: string | null;
  expiryDate: string | null;
  verificationDate: string | null;
  verifiedBy: string | null;
  supportingDocument: string | null;
  publicClaimsPermitted: boolean;
  taxDeductionPermitted: boolean;
  notes: string;
  auditTrail: ComplianceAuditEntry[];
}

export interface CentralComplianceConfig {
  version: string;
  organizationLegalName: string;
  corporateIdentityNumber: string; // CIN
  panNumber: string;
  tanNumber: string;
  registeredState: string;
  items: Record<string, StatutoryEntityRecord>;
}

/**
 * Single Source of Truth for Statutory & Regulatory Approvals
 * DEFAULT STATUS FOR ALL TAX-EXEMPTION / REGULATORY FRAMEWORKS IS STRICTLY `NOT_VERIFIED`
 */
export const COMPLIANCE_CONFIGURATION: CentralComplianceConfig = {
  version: '2026.1.0',
  organizationLegalName: 'IMAM E MAHDI FOUNDATION',
  corporateIdentityNumber: 'U88900DC2026NPL474906',
  panNumber: 'AAATI1234F', // Foundation Permanent Account Number
  tanNumber: 'DELI12345F',
  registeredState: 'Delhi, India',

  items: {
    // 1. Section 8 Incorporation (Legal Corporate Identity)
    SECTION_8_INCORPORATION: {
      code: 'SECTION_8_INCORPORATION',
      name: 'Section 8 Non-Profit Company Incorporation (Companies Act 2013)',
      category: 'INCORPORATION',
      status: 'VERIFIED',
      registrationNumber: 'CIN: U88900DC2026NPL474906',
      orderNumber: 'ROC-DELHI-SEC8-2026-001',
      effectiveDate: '2026-01-01',
      expiryDate: null, // Perpetual subject to annual ROC filings
      verificationDate: '2026-01-02',
      verifiedBy: 'Company Secretary & Legal Counsel',
      supportingDocument: '/docs/vault/incorporation_certificate.pdf',
      publicClaimsPermitted: true, // Only for corporate identity, NEVER for tax deductions
      taxDeductionPermitted: false,
      notes: 'Incorporated as a non-profit company under Section 8 of the Companies Act, 2013. Corporate identity does NOT confer automatic donor tax deduction.',
      auditTrail: [
        {
          timestamp: '2026-01-02T10:00:00Z',
          action: 'STATUS_SET_VERIFIED',
          actor: 'CS Counsel',
          notes: 'Certificate of Incorporation verified against MCA Master Data.',
        },
      ],
    },

    // 2. Section 80G Tax Exemption (Income Tax Act, 1961)
    SECTION_80G: {
      code: 'SECTION_80G',
      name: 'Section 80G(5)(vi) Income Tax Exemption',
      category: 'DIRECT_TAX',
      // CRITICAL: Default status is NOT_VERIFIED until formal order is issued & uploaded
      status: (process.env.COMPLIANCE_80G_STATUS as StatutoryComplianceStatus) || 'NOT_VERIFIED',
      registrationNumber: process.env.COMPLIANCE_80G_REG_NO || null,
      orderNumber: process.env.COMPLIANCE_80G_ORDER_NO || null,
      effectiveDate: null,
      expiryDate: null,
      verificationDate: null,
      verifiedBy: null,
      supportingDocument: null,
      publicClaimsPermitted: false,
      taxDeductionPermitted: false,
      notes: 'Section 80G approval is subject to statutory processing and verification by the Income Tax Department. Tax deduction claims and 80G certificates remain strictly DISABLED in production until verified by practicing Chartered Accountants.',
      auditTrail: [
        {
          timestamp: '2026-01-01T00:00:00Z',
          action: 'INITIAL_REGISTRATION_CREATED',
          actor: 'System Compliance Guard',
          notes: 'Default status initialized as NOT_VERIFIED. Public tax-benefit claims locked.',
        },
      ],
    },

    // 3. Section 12A / 12AB Registration (Charitable Exemption)
    SECTION_12AB: {
      code: 'SECTION_12AB',
      name: 'Section 12AB Income Tax Exemption Order',
      category: 'DIRECT_TAX',
      status: (process.env.COMPLIANCE_12AB_STATUS as StatutoryComplianceStatus) || 'NOT_VERIFIED',
      registrationNumber: process.env.COMPLIANCE_12AB_REG_NO || null,
      orderNumber: null,
      effectiveDate: null,
      expiryDate: null,
      verificationDate: null,
      verifiedBy: null,
      supportingDocument: null,
      publicClaimsPermitted: false,
      taxDeductionPermitted: false,
      notes: 'Section 12AB order application pending statutory audit report (Form 10B/10BB) and IT Department provisional order.',
      auditTrail: [
        {
          timestamp: '2026-01-01T00:00:00Z',
          action: 'INITIAL_REGISTRATION_CREATED',
          actor: 'System Compliance Guard',
          notes: 'Default status initialized as NOT_VERIFIED.',
        },
      ],
    },

    // 4. FCRA (Foreign Contribution Regulation Act, 2010)
    FCRA: {
      code: 'FCRA',
      name: 'FCRA Registration (Foreign Contribution)',
      category: 'FOREIGN_CONTRIBUTION',
      status: (process.env.COMPLIANCE_FCRA_STATUS as StatutoryComplianceStatus) || 'NOT_VERIFIED',
      registrationNumber: null,
      orderNumber: null,
      effectiveDate: null,
      expiryDate: null,
      verificationDate: null,
      verifiedBy: null,
      supportingDocument: null,
      publicClaimsPermitted: false,
      taxDeductionPermitted: false,
      notes: 'FCRA status is NOT_VERIFIED. In accordance with Ministry of Home Affairs (MHA) regulations, only domestic INR contributions from Indian bank accounts/cards are accepted. Foreign contributions are locked.',
      auditTrail: [
        {
          timestamp: '2026-01-01T00:00:00Z',
          action: 'FOREIGN_CONTRIBUTIONS_LOCKED',
          actor: 'System Compliance Guard',
          notes: 'Domestic contributions only. Foreign donations disabled pending FCRA approval.',
        },
      ],
    },

    // 5. CSR Form CSR-1 (Corporate Social Responsibility Implementing Agency)
    CSR_1: {
      code: 'CSR_1',
      name: 'Form CSR-1 - Registration with Ministry of Corporate Affairs',
      category: 'CSR_GRANTS',
      status: (process.env.COMPLIANCE_CSR_STATUS as StatutoryComplianceStatus) || 'NOT_VERIFIED',
      registrationNumber: null,
      orderNumber: null,
      effectiveDate: null,
      expiryDate: null,
      verificationDate: null,
      verifiedBy: null,
      supportingDocument: null,
      publicClaimsPermitted: false,
      taxDeductionPermitted: false,
      notes: 'CSR-1 e-filing pending verification on the MCA portal.',
      auditTrail: [
        {
          timestamp: '2026-01-01T00:00:00Z',
          action: 'INITIAL_REGISTRATION_CREATED',
          actor: 'System Compliance Guard',
          notes: 'CSR grant claims disabled pending verified CSR-1 registration number.',
        },
      ],
    },

    // 6. NGO Darpan Portal (NITI Aayog)
    NGO_DARPAN: {
      code: 'NGO_DARPAN',
      name: 'NITI Aayog NGO Darpan Unique ID',
      category: 'CENTRAL_REGISTRY',
      status: (process.env.COMPLIANCE_DARPAN_STATUS as StatutoryComplianceStatus) || 'NOT_VERIFIED',
      registrationNumber: null,
      orderNumber: null,
      effectiveDate: null,
      expiryDate: null,
      verificationDate: null,
      verifiedBy: null,
      supportingDocument: null,
      publicClaimsPermitted: false,
      taxDeductionPermitted: false,
      notes: 'NGO Darpan ID pending sign-off.',
      auditTrail: [
        {
          timestamp: '2026-01-01T00:00:00Z',
          action: 'INITIAL_REGISTRATION_CREATED',
          actor: 'System Compliance Guard',
          notes: 'Initialized as NOT_VERIFIED.',
        },
      ],
    },

    // 7. Zakat & Khums Theological Segregation Policy (Internal Trust Charter)
    ZAKAT_KHUMS_THEOLOGICAL_POLICY: {
      code: 'ZAKAT_KHUMS_THEOLOGICAL_POLICY',
      name: 'Sharia-Compliant 100% Fund Segregation Charter',
      category: 'THEOLOGICAL_GOVERNANCE',
      status: 'VERIFIED',
      registrationNumber: 'IMF-CHARTER-2026-ZAKAT',
      orderNumber: 'BOARD-RES-2026-01',
      effectiveDate: '2026-01-01',
      expiryDate: null,
      verificationDate: '2026-01-01',
      verifiedBy: 'Board of Trustees & Scholar Council',
      supportingDocument: '/docs/vault/sharia_governance_charter.pdf',
      publicClaimsPermitted: true,
      taxDeductionPermitted: false,
      notes: 'Internal religious governance policy enforcing 100% segregation of Zakat and Khums restricted reserves. Distinct from government tax exemptions.',
      auditTrail: [
        {
          timestamp: '2026-01-01T00:00:00Z',
          action: 'CHARTER_ADOPTED',
          actor: 'Board of Trustees',
          notes: 'Strict fund isolation rule verified in general ledger accounting system.',
        },
      ],
    },
  },
};

/**
 * Programmatic Compliance Verification Engine
 */
export class ComplianceConfig {
  /**
   * Returns true ONLY if Section 80G is officially VERIFIED and active
   */
  public static is80GVerified(): boolean {
    const item = COMPLIANCE_CONFIGURATION.items.SECTION_80G;
    return item?.status === 'VERIFIED' && Boolean(item.registrationNumber);
  }

  /**
   * Returns current Section 80G Status
   */
  public static get80GStatus(): StatutoryComplianceStatus {
    return COMPLIANCE_CONFIGURATION.items.SECTION_80G?.status || 'NOT_VERIFIED';
  }

  /**
   * Returns true ONLY if FCRA is officially VERIFIED
   */
  public static isFCRAVerified(): boolean {
    return COMPLIANCE_CONFIGURATION.items.FCRA?.status === 'VERIFIED';
  }

  /**
   * Returns true ONLY if Section 12AB is officially VERIFIED
   */
  public static is12ABVerified(): boolean {
    return COMPLIANCE_CONFIGURATION.items.SECTION_12AB?.status === 'VERIFIED';
  }

  /**
   * Returns true ONLY if CSR-1 is officially VERIFIED
   */
  public static isCSRVerified(): boolean {
    return COMPLIANCE_CONFIGURATION.items.CSR_1?.status === 'VERIFIED';
  }

  /**
   * Retrieves an item from the central configuration
   */
  public static getItem(code: string): StatutoryEntityRecord | null {
    return COMPLIANCE_CONFIGURATION.items[code] || null;
  }

  /**
   * Returns safe, legally accurate disclaimer text for donation receipts & donor views
   */
  public static getDonationReceiptDisclaimer(): {
    title: string;
    noticeText: string;
    isTaxDeductible: boolean;
    registrationReference: string;
  } {
    const is80G = this.is80GVerified();

    if (is80G) {
      const reg = COMPLIANCE_CONFIGURATION.items.SECTION_80G.registrationNumber;
      return {
        title: 'Official 80G Tax Exemption Receipt',
        noticeText: `Donations qualify for deduction under Section 80G(5)(vi) of the Income Tax Act, 1961 (Registration Ref: ${reg}). Unique Form 10BE certificate issued upon statutory annual filing.`,
        isTaxDeductible: true,
        registrationReference: reg || '80G Verified',
      };
    }

    return {
      title: 'Official Donation & Acknowledgment Receipt',
      noticeText: 'Thank you for your generous contribution. Please note that statutory Section 80G tax exemption approval is currently pending formal regulatory verification with the Income Tax Department and is NOT claimed or active on this receipt. This document serves as an official proof of payment and fund acknowledgment.',
      isTaxDeductible: false,
      registrationReference: `CIN: ${COMPLIANCE_CONFIGURATION.corporateIdentityNumber}`,
    };
  }
}
