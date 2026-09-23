import {
  ComplianceCategory,
  CompliancePeriodicity,
  ComplianceFilingStatus,
  ProfessionalVerificationStatus,
} from '@prisma/client';

export interface StatutoryTemplateItem {
  itemCode: string;
  requirementName: string;
  category: ComplianceCategory;
  periodicity: CompliancePeriodicity;
  statutoryAuthority: string;
  applicableActOrRule: string;
  defaultDueMonthDay: string; // MM-DD
  responsiblePersonRole: string;
  description: string;
  recommendedVerifier: 'CA' | 'CS' | 'LEGAL' | 'INTERNAL';
}

export const MANDATORY_STATUTORY_DISCLAIMER =
  'This is an administrative tracking and document-management system. It does NOT provide legal approval, government certification, tax advice, or professional legal advice. REQUIRES ORGANIZATIONAL / CA / CS / LEGAL VERIFICATION.';

/**
 * Standard Catalog of Statutory Obligations for Section 8 Non-Profit Foundations in India
 */
export const DEFAULT_STATUTORY_CATALOG: StatutoryTemplateItem[] = [
  {
    itemCode: 'CMP-FORM-10BD',
    requirementName: 'Form 10BD - Annual Statement of Charitable Donations',
    category: ComplianceCategory.DIRECT_TAX_12A_80G,
    periodicity: CompliancePeriodicity.ANNUAL,
    statutoryAuthority: 'Income Tax Department of India',
    applicableActOrRule: 'Section 80G(5)(vi) read with Rule 18AB of Income Tax Rules',
    defaultDueMonthDay: '05-31', // 31st May
    responsiblePersonRole: 'Statutory CA & Head of Finance',
    description: 'Mandatory annual electronic filing of donor list and PAN details for issuance of Form 10BE donation certificates.',
    recommendedVerifier: 'CA',
  },
  {
    itemCode: 'CMP-FORM-10B-10BB',
    requirementName: 'Form 10B / 10BB - Tax Audit Report for Charitable Entities',
    category: ComplianceCategory.STATUTORY_AUDIT_ACCOUNTS,
    periodicity: CompliancePeriodicity.ANNUAL,
    statutoryAuthority: 'Income Tax Department of India',
    applicableActOrRule: 'Section 12A(1)(b) read with Rule 17B of Income Tax Rules',
    defaultDueMonthDay: '09-30', // 30th September
    responsiblePersonRole: 'Independent Chartered Accountant (Statutory Auditor)',
    description: 'Statutory audit report filed by a practicing Chartered Accountant for 12A/12AB tax exemption qualification.',
    recommendedVerifier: 'CA',
  },
  {
    itemCode: 'CMP-ITR-7',
    requirementName: 'ITR-7 - Annual Income Tax Return for Non-Profit Entities',
    category: ComplianceCategory.DIRECT_TAX_12A_80G,
    periodicity: CompliancePeriodicity.ANNUAL,
    statutoryAuthority: 'Income Tax Department of India',
    applicableActOrRule: 'Section 139(4A) and 139(4C) of Income Tax Act, 1961',
    defaultDueMonthDay: '10-31', // 31st October (for audited entities)
    responsiblePersonRole: 'Chief Financial Officer / CA Counsel',
    description: 'Annual non-profit tax return containing audited balance sheet, income & expenditure, and charitable accumulation statements.',
    recommendedVerifier: 'CA',
  },
  {
    itemCode: 'CMP-MCA-AOC-4',
    requirementName: 'Form AOC-4 - Annual Financial Statement Filing with ROC',
    category: ComplianceCategory.ANNUAL_STATUTORY_FILINGS,
    periodicity: CompliancePeriodicity.ANNUAL,
    statutoryAuthority: 'Ministry of Corporate Affairs (MCA / ROC)',
    applicableActOrRule: 'Section 137 of Companies Act, 2013 read with Rule 12(1)',
    defaultDueMonthDay: '10-30', // 30 days from AGM (Typically 30th October)
    responsiblePersonRole: 'Company Secretary & Executive Director',
    description: 'Filing of audited balance sheet, profit & loss, auditor report, and directors report with the Registrar of Companies.',
    recommendedVerifier: 'CS',
  },
  {
    itemCode: 'CMP-MCA-MGT-7',
    requirementName: 'Form MGT-7 - Annual Return of the Foundation',
    category: ComplianceCategory.ANNUAL_STATUTORY_FILINGS,
    periodicity: CompliancePeriodicity.ANNUAL,
    statutoryAuthority: 'Ministry of Corporate Affairs (MCA / ROC)',
    applicableActOrRule: 'Section 92 of Companies Act, 2013 read with Rule 11(1)',
    defaultDueMonthDay: '11-29', // 60 days from AGM
    responsiblePersonRole: 'Practicing Company Secretary (PCS)',
    description: 'Comprehensive annual return detailing trustees, members, board meetings, and regulatory compliance disclosures.',
    recommendedVerifier: 'CS',
  },
  {
    itemCode: 'CMP-TDS-Q1',
    requirementName: 'Quarterly TDS Return - Q1 (Form 24Q / 26Q)',
    category: ComplianceCategory.DIRECT_TAX_12A_80G,
    periodicity: CompliancePeriodicity.QUARTERLY,
    statutoryAuthority: 'Income Tax Department (TRACES)',
    applicableActOrRule: 'Section 200(3) of Income Tax Act, 1961',
    defaultDueMonthDay: '07-31', // 31st July
    responsiblePersonRole: 'Finance & Payroll Officer',
    description: 'Quarterly statement of tax deducted at source on employee salaries and contractor vendor payments for Q1.',
    recommendedVerifier: 'CA',
  },
  {
    itemCode: 'CMP-TDS-Q2',
    requirementName: 'Quarterly TDS Return - Q2 (Form 24Q / 26Q)',
    category: ComplianceCategory.DIRECT_TAX_12A_80G,
    periodicity: CompliancePeriodicity.QUARTERLY,
    statutoryAuthority: 'Income Tax Department (TRACES)',
    applicableActOrRule: 'Section 200(3) of Income Tax Act, 1961',
    defaultDueMonthDay: '10-31', // 31st October
    responsiblePersonRole: 'Finance & Payroll Officer',
    description: 'Quarterly statement of tax deducted at source on employee salaries and contractor vendor payments for Q2.',
    recommendedVerifier: 'CA',
  },
  {
    itemCode: 'CMP-TDS-Q3',
    requirementName: 'Quarterly TDS Return - Q3 (Form 24Q / 26Q)',
    category: ComplianceCategory.DIRECT_TAX_12A_80G,
    periodicity: CompliancePeriodicity.QUARTERLY,
    statutoryAuthority: 'Income Tax Department (TRACES)',
    applicableActOrRule: 'Section 200(3) of Income Tax Act, 1961',
    defaultDueMonthDay: '01-31', // 31st January
    responsiblePersonRole: 'Finance & Payroll Officer',
    description: 'Quarterly statement of tax deducted at source on employee salaries and contractor vendor payments for Q3.',
    recommendedVerifier: 'CA',
  },
  {
    itemCode: 'CMP-TDS-Q4',
    requirementName: 'Quarterly TDS Return - Q4 (Form 24Q / 26Q)',
    category: ComplianceCategory.DIRECT_TAX_12A_80G,
    periodicity: CompliancePeriodicity.QUARTERLY,
    statutoryAuthority: 'Income Tax Department (TRACES)',
    applicableActOrRule: 'Section 200(3) of Income Tax Act, 1961',
    defaultDueMonthDay: '05-31', // 31st May
    responsiblePersonRole: 'Finance & Payroll Officer',
    description: 'Quarterly statement of tax deducted at source and annual certificate reconciliation for Q4.',
    recommendedVerifier: 'CA',
  },
  {
    itemCode: 'CMP-FCRA-FC4',
    requirementName: 'FC-4 - Annual Foreign Contribution Return (Where Applicable)',
    category: ComplianceCategory.FCRA_FOREIGN_CONTRIBUTION,
    periodicity: CompliancePeriodicity.ANNUAL,
    statutoryAuthority: 'Ministry of Home Affairs (MHA - FCRA Division)',
    applicableActOrRule: 'Section 18 of Foreign Contribution (Regulation) Act, 2010',
    defaultDueMonthDay: '12-31', // 31st December
    responsiblePersonRole: 'Statutory CA & Designated FCRA Officer',
    description: 'Annual return of foreign contributions received in designated SBI New Delhi Main Branch account with CA certification.',
    recommendedVerifier: 'CA',
  },
  {
    itemCode: 'CMP-MCA-CSR-1',
    requirementName: 'Form CSR-1 - Registration for Implementing CSR Projects',
    category: ComplianceCategory.CSR_CORPORATE_GRANTS,
    periodicity: CompliancePeriodicity.ONE_TIME,
    statutoryAuthority: 'Ministry of Corporate Affairs',
    applicableActOrRule: 'Section 135 of Companies Act, 2013 read with Rule 4(2)',
    defaultDueMonthDay: '04-01',
    responsiblePersonRole: 'Executive Director & CS',
    description: 'Unique CSR Registration Number generated on MCA portal enabling receipt of corporate CSR grants.',
    recommendedVerifier: 'CS',
  },
  {
    itemCode: 'CMP-AGM-MINUTES',
    requirementName: 'Annual General Meeting (AGM) & Board Resolutions',
    category: ComplianceCategory.INCORPORATION_GOVERNANCE,
    periodicity: CompliancePeriodicity.ANNUAL,
    statutoryAuthority: 'Board of Trustees & General Body',
    applicableActOrRule: 'Section 96 & 118 of Companies Act, 2013',
    defaultDueMonthDay: '09-30', // 30th September
    responsiblePersonRole: 'Company Secretary & Chairman',
    description: 'Formal adoption of audited financials, trustee elections, appointment of statutory auditors, and minute signing.',
    recommendedVerifier: 'CS',
  },
  {
    itemCode: 'CMP-EPFO-MONTHLY',
    requirementName: 'Monthly EPF & ESI Statutory Challan Settlement',
    category: ComplianceCategory.LABOUR_EPF_ESIC,
    periodicity: CompliancePeriodicity.MONTHLY,
    statutoryAuthority: 'Employees Provident Fund Organisation (EPFO)',
    applicableActOrRule: 'Employees Provident Funds and Miscellaneous Provisions Act, 1952',
    defaultDueMonthDay: '15', // 15th of each month
    responsiblePersonRole: 'HR & Payroll Lead',
    description: 'Monthly electronic return and remittance of employee and employer PF/ESI contributions.',
    recommendedVerifier: 'INTERNAL',
  },
];
