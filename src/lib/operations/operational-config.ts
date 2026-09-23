/**
 * Operational Configuration Registry for IMAM E MAHDI FOUNDATION
 * Operating under Public Brand: IMAM MISSION
 */

export interface DepartmentConfig {
  code: string;
  name: string;
  headTitle: string;
  primaryFunction: string;
  subUnits: string[];
}

export interface ProgramConfig {
  code: string;
  title: string;
  category: string;
  objective: string;
  targetBeneficiaries: string;
  subInitiatives: string[];
  kpiMetrics: string[];
}

export interface RoleConfig {
  roleKey: string;
  title: string;
  departmentCode: string;
  authorityLevel: 'GOVERNANCE' | 'EXECUTIVE' | 'MANAGEMENT' | 'OPERATIONAL' | 'INDEPENDENT_AUDIT';
  coreResponsibilities: string[];
  approvalPermissions: string[];
}

export interface WorkflowStage {
  stage: number;
  name: string;
  responsibleRole: string;
  action: string;
  nextStatus: string;
}

export interface WorkflowDefinition {
  workflowKey: string;
  title: string;
  triggerEvent: string;
  stages: WorkflowStage[];
  rejectionAction: string;
  auditRequirement: string;
}

export const NGO_OPERATIONAL_CONFIG = {
  organization: {
    legalEntityName: 'IMAM E MAHDI FOUNDATION',
    legalEntityType: 'Section 8 Not-for-Profit Company (Companies Act, 2013)',
    cin: 'CIN: U88900DC2026NPL474906',
    publicBrandName: 'IMAM MISSION',
    tagline: 'Serving Humanity Beyond Boundaries',
    mission:
      'To mobilize ethical philanthropy, deploy transparent technology, and execute sustainable grass-roots interventions in healthcare, education, livelihood generation, and disaster relief.',
    vision:
      'A just, compassionate world inspired by universal human values, where no child is deprived of education, no family sleeps in hunger, and every human life is protected with unconditional dignity.',
    coreValues: ['Amanah (Sacred Trust)', 'Ihsan (Excellence)', 'Karamah (Human Dignity)', 'Shifafiyah (Transparency)'],
    contactInformation: {
      primaryEmail: 'contact@imammission.org',
      secretariatEmail: 'secretariat@imammission.org',
      donorSupportEmail: 'donors@imammission.org',
      complianceEmail: 'compliance@imammission.org',
      primaryPhone: '+91-522-2610110',
      helplinePhone: '+91-9450000000',
      centralOfficeAddress: '14/2 Central Relief Complex, Victoria Street, Lucknow, Uttar Pradesh 226003, India',
      registeredOfficeAddress: '12 Jamia Nagar, Okhla Institutional Area, New Delhi 110025, India',
      websiteUrl: 'https://imammission.org',
    },
    departments: [
      {
        code: 'DEPT-DIR',
        name: 'Directorate & Executive Governance',
        headTitle: 'Executive Director & General Secretary',
        primaryFunction: 'Strategic leadership, governance charter enforcement, and board representation.',
        subUnits: ['Secretariat Desk', 'Institutional Advisory Board', 'Policy Oversight'],
      },
      {
        code: 'DEPT-FIN',
        name: 'Finance & Treasury',
        headTitle: 'Chief Financial Officer / Head of Finance',
        primaryFunction: 'Double-entry general ledger, 100% Zakat fund ring-fencing, vendor disbursements, and banking.',
        subUnits: ['General Ledger & Treasury', 'Accounts Payable & Expenses', 'Payroll & Disbursements'],
      },
      {
        code: 'DEPT-HR',
        name: 'Human Resources & Volunteer Administration',
        headTitle: 'HR Director & Volunteer Coordinator',
        primaryFunction: 'Staff talent recruitment, attendance, biometric tracking, volunteer vetting, and payroll onboarding.',
        subUnits: ['Staff Lifecycle & Payroll', 'Volunteer Corps Desk', 'Capacity Training'],
      },
      {
        code: 'DEPT-PRJ',
        name: 'Programs & Project Management',
        headTitle: 'Director of Programs',
        primaryFunction: 'Capital project planning, milestone delivery, budget allocation, and contractor milestone sign-off.',
        subUnits: ['Infrastructure & Water', 'Education Grants', 'Emergency Aid Delivery'],
      },
      {
        code: 'DEPT-FLD',
        name: 'Field Operations & Beneficiary Welfare',
        headTitle: 'Field Operations Director',
        primaryFunction: 'Field household surveys, biometric KYC verification, aid disbursement, and GPS-tagged visits.',
        subUnits: ['Survey Verification Desk', 'Direct Aid Delivery Logistics', 'Follow-Up & Monitoring'],
      },
      {
        code: 'DEPT-COM',
        name: 'Communications, Media & Content',
        headTitle: 'Head of Communications',
        primaryFunction: 'Impact reporting, campaign storytelling, photo/video archives, CMS publishing, and press releases.',
        subUnits: ['CMS & Web Publishing', 'Photo/Video Archives', 'Donor Impact Dispatches'],
      },
      {
        code: 'DEPT-CMP',
        name: 'Statutory Compliance & Legal Affairs',
        headTitle: 'Chief Compliance Officer',
        primaryFunction: 'MCA Section 8 annual filings, statutory document vault, calendar deadline tracking, and regulatory audit.',
        subUnits: ['Statutory Vault', 'Filing Calendar Tracking', 'Policy Enforcement'],
      },
      {
        code: 'DEPT-AUD',
        name: 'Internal Audit & Independent Oversight',
        headTitle: 'Chief Internal Auditor',
        primaryFunction: 'Independent audit trail verification, SHA-256 hash chaining checks, and anti-fraud monitoring.',
        subUnits: ['Cryptographic Audit Trail', 'Sample Beneficiary Re-Verification', 'Annual CA Liaison'],
      },
      {
        code: 'DEPT-SYS',
        name: 'Technology & Super Admin',
        headTitle: 'Chief Technology Officer / Principal Architect',
        primaryFunction: 'Platform security, RBAC role management, backup automation, disaster recovery, and infrastructure.',
        subUnits: ['Platform Core & Security', 'Cryptographic Engine & QR Gateways', 'Backup & Disaster Recovery'],
      },
    ] as DepartmentConfig[],
    locations: [
      {
        code: 'LOC-DELHI-HQ',
        name: 'Registered Corporate Secretariat',
        type: 'CORPORATE_REGISTERED_OFFICE',
        address: '12 Jamia Nagar, Okhla Institutional Area, New Delhi 110025, India',
        contact: 'delhi.desk@imammission.org',
      },
      {
        code: 'LOC-LUCKNOW-HUB',
        name: 'Northern Regional Operations & Relief Center',
        type: 'REGIONAL_OPERATIONS_HUB',
        address: '14/2 Central Relief Complex, Victoria Street, Lucknow, UP 226003, India',
        contact: 'secretariat@imammission.org',
      },
      {
        code: 'LOC-VARANASI-HUB',
        name: 'Eastern Regional Logistics Hub',
        type: 'REGIONAL_LOGISTICS_HUB',
        address: 'Madanpura Relief Complex, Varanasi, UP 221001, India',
        contact: 'varanasi.hub@imammission.org',
      },
      {
        code: 'LOC-GLOBAL-UK',
        name: 'United Kingdom Regional Chapter',
        type: 'INTERNATIONAL_LIAISON',
        address: '88 Commercial Street, Whitechapel, London E1 6AN, UK',
        contact: 'uk.chapter@imammission.org',
      },
      {
        code: 'LOC-GLOBAL-USA',
        name: 'North America Liaison Office',
        type: 'INTERNATIONAL_LIAISON',
        address: '1001 Texas Avenue, Suite 1400, Houston, TX 77002, USA',
        contact: 'usa.chapter@imammission.org',
      },
      {
        code: 'LOC-GLOBAL-UAE',
        name: 'Middle East & Gulf Coordination Desk',
        type: 'INTERNATIONAL_LIAISON',
        address: 'Office 402, Al Hudaiba Awards Building, Jumeirah, Dubai, UAE',
        contact: 'gulf.desk@imammission.org',
      },
    ],
  },

  programs: [
    {
      code: 'PROG-EDU',
      title: 'Education & Scholarships',
      category: 'EDUCATION',
      objective: 'Eliminating educational barriers for orphans, marginalized youth, and high-potential scholars.',
      targetBeneficiaries: 'Underprivileged primary school children, orphans, engineering and medical undergraduate students.',
      subInitiatives: [
        'Fatima Memorial Orphan Education Stipends',
        'Higher Education STEM & Medical Scholarships',
        'Free Digital Literacy & Computer Labs',
        'Back-to-School Kits & Uniform Distribution',
      ],
      kpiMetrics: ['Total scholars funded', 'Graduation success rate', 'Direct educational disbursement total'],
    },
    {
      code: 'PROG-HLTH',
      title: 'Healthcare Assistance',
      category: 'HEALTHCARE',
      objective: 'Providing free diagnostic consultations, emergency dialysis lifelines, and essential surgical interventions.',
      targetBeneficiaries: 'Patients suffering from chronic renal failure, cardiac emergencies, cataract blindness, and rural families lacking clinical access.',
      subInitiatives: [
        'Free Hemodialysis Lifeline Project',
        'Mobile Multi-Specialty Health & Eye Camps',
        'Emergency Life-Saving Surgery Subsidies',
        'Critical Maternal & Infant Nutrition Kits',
      ],
      kpiMetrics: ['Free dialysis sessions subsidized', 'Patients treated in health camps', 'Surgical interventions financed'],
    },
    {
      code: 'PROG-WEL',
      title: 'Community Welfare',
      category: 'COMMUNITY_DEVELOPMENT',
      objective: 'Fostering long-term community resilience, clean drinking water infrastructure, and basic public facilities.',
      targetBeneficiaries: 'Vulnerable rural villages, drought-affected settlements, and underserved urban bastis.',
      subInitiatives: [
        'Solar-Powered Deep Aquifer Water Wells',
        'Clean Water Handpump Installations',
        'Community Sanitation & Hygiene Drives',
        'Community Center & Library Renovations',
      ],
      kpiMetrics: ['Water hubs constructed', 'Litres of potable water delivered daily', 'Families served by clean water'],
    },
    {
      code: 'PROG-REL',
      title: 'Humanitarian Relief',
      category: 'DISASTER_EMERGENCY_RELIEF',
      objective: 'Immediate emergency disaster response, food security packages, and winter warmth distribution.',
      targetBeneficiaries: 'Flood/disaster-displaced families, widow-headed households, and vulnerable homeless individuals during peak winter.',
      subInitiatives: [
        'Annual Winter Warmth Quilt & Blanket Distribution',
        'Monthly Dignified Food Ration Packs (Kafalat)',
        'Rapid Flood & Cyclone Disaster Response Kitchens',
        'Emergency Cash Relief for Displaced Households',
      ],
      kpiMetrics: ['Ration packages delivered', 'Blankets distributed', 'Emergency hot meals served'],
    },
    {
      code: 'PROG-LIV',
      title: 'Livelihood & Empowerment',
      category: 'ECONOMIC_EMPOWERMENT',
      objective: 'Providing vocational skill training, interest-free micro-seed grants, and small business starter kits to break generational poverty.',
      targetBeneficiaries: 'Widows, unemployed youth, female artisans, and informal daily-wage earners.',
      subInitiatives: [
        'Women Vocational Tailoring & Sewing Machine Grant',
        'Micro-Enterprise Starter Kits (E-Rickshaws, Vending Carts)',
        'Vocational Plumbing, Electrical & Carpentry Trades',
        'Qard-e-Hasana (Zero-Interest Micro-Capital Support)',
      ],
      kpiMetrics: ['Micro-businesses established', 'Vocational trainees graduated', 'Families attaining economic self-reliance'],
    },
  ] as ProgramConfig[],

  roles: [
    {
      roleKey: 'SUPER_ADMIN',
      title: 'Super Admin',
      departmentCode: 'DEPT-SYS',
      authorityLevel: 'GOVERNANCE',
      coreResponsibilities: ['Platform security architecture', 'Root access control', 'Backup verification', 'Emergency system override'],
      approvalPermissions: ['ALL_PERMISSIONS_BYPASS', 'MANAGE_ROLES', 'MANAGE_SYSTEM_SETTINGS', 'ACCESS_SECURITY_VAULT'],
    },
    {
      roleKey: 'DIRECTOR',
      title: 'Director / Management',
      departmentCode: 'DEPT-DIR',
      authorityLevel: 'GOVERNANCE',
      coreResponsibilities: ['Strategic program governance', 'High-value budget approvals (>₹1,00,000)', 'Trustee representation', 'Legal filings sign-off'],
      approvalPermissions: ['APPROVE_HIGH_VALUE_EXPENSES', 'APPROVE_PROJECT_STAGE', 'SIGN_OFF_COMPLIANCE_FILINGS', 'ACCESS_ALL_REPORTS'],
    },
    {
      roleKey: 'FINANCE',
      title: 'Finance & Accounts',
      departmentCode: 'DEPT-FIN',
      authorityLevel: 'EXECUTIVE',
      coreResponsibilities: ['Double-entry ledger posting', 'Donation reconciliation', 'Vendor payout disbursements', 'Payroll bank file approval'],
      approvalPermissions: ['RECONCILE_DONATIONS', 'APPROVE_EXPENSES_STANDARD', 'DISBURSE_PAYROLL', 'POST_LEDGER_ENTRIES'],
    },
    {
      roleKey: 'HR',
      title: 'Human Resources & Volunteer Admin',
      departmentCode: 'DEPT-HR',
      authorityLevel: 'EXECUTIVE',
      coreResponsibilities: ['Staff employee profile management', 'Leave approvals', 'Attendance validation', 'Volunteer vetting & onboarding'],
      approvalPermissions: ['APPROVE_LEAVE', 'VERIFY_VOLUNTEERS', 'MANAGE_EMPLOYEES', 'GENERATE_PAYROLL_PERIODS'],
    },
    {
      roleKey: 'PROJECTS',
      title: 'Projects & Program Management',
      departmentCode: 'DEPT-PRJ',
      authorityLevel: 'MANAGEMENT',
      coreResponsibilities: ['Capital project milestone updates', 'Contractor payment requests', 'Field budget monitoring', 'Impact metrics tracking'],
      approvalPermissions: ['CREATE_PROJECTS', 'UPDATE_PROJECT_MILESTONES', 'SUBMIT_EXPENSE_CLAIMS', 'GENERATE_PROJECT_REPORTS'],
    },
    {
      roleKey: 'FIELD_OPS',
      title: 'Field Operations & Beneficiary Welfare',
      departmentCode: 'DEPT-FLD',
      authorityLevel: 'OPERATIONAL',
      coreResponsibilities: ['GPS-tagged household visits', 'Beneficiary KYC enrollment', 'Physical aid handover verification', 'Field survey review'],
      approvalPermissions: ['SUBMIT_FIELD_VISITS', 'ENROLL_BENEFICIARIES', 'VERIFY_AID_HANDOVER', 'ATTACH_FIELD_PHOTOGRAPHS'],
    },
    {
      roleKey: 'VOLUNTEERS',
      title: 'Volunteers & Field Assistants',
      departmentCode: 'DEPT-HR',
      authorityLevel: 'OPERATIONAL',
      coreResponsibilities: ['Community outreach assistance', 'Event check-in coordination', 'Food packet packaging & distribution', 'Field camp logistics'],
      approvalPermissions: ['RECORD_EVENT_ATTENDANCE', 'VIEW_ASSIGNED_TASKS', 'SUBMIT_VOLUNTEER_HOURS'],
    },
    {
      roleKey: 'CONTENT',
      title: 'Content & Media Communications',
      departmentCode: 'DEPT-COM',
      authorityLevel: 'MANAGEMENT',
      coreResponsibilities: ['Drafting news dispatches and articles', 'Managing image/video galleries', 'Public campaign announcements', 'Newsletter creation'],
      approvalPermissions: ['DRAFT_CMS_ARTICLES', 'PUBLISH_CONTENT_APPROVED', 'MANAGE_MEDIA_GALLERY', 'SEND_DONOR_DISPATCHES'],
    },
    {
      roleKey: 'COMPLIANCE',
      title: 'Statutory Compliance & Legal',
      departmentCode: 'DEPT-CMP',
      authorityLevel: 'MANAGEMENT',
      coreResponsibilities: ['Maintaining Section 8 corporate records', 'Statutory calendar deadline tracking', 'Vault document uploading', 'Policy audit'],
      approvalPermissions: ['MANAGE_STATUTORY_VAULT', 'SIGN_COMPLIANCE_TASKS', 'AUDIT_POLICY_ENFORCEMENT'],
    },
    {
      roleKey: 'AUDITOR',
      title: 'Auditor & Independent Oversight',
      departmentCode: 'DEPT-AUD',
      authorityLevel: 'INDEPENDENT_AUDIT',
      coreResponsibilities: ['Read-only review of full general ledger', 'Cryptographic audit log verification', 'Beneficiary sampling', 'Financial sign-off'],
      approvalPermissions: ['READ_ALL_LEDGER_ENTRIES', 'VERIFY_AUDIT_LOG_HASHES', 'GENERATE_STATUTORY_AUDIT_REPORTS'],
    },
  ] as RoleConfig[],

  workflows: [
    {
      workflowKey: 'DONATION_APPROVAL_RECONCILIATION',
      title: 'Donation Approval & Reconciliation Workflow',
      triggerEvent: 'Online Gateway Webhook / Manual Bank Transfer Submission (NEFT/UPI)',
      stages: [
        {
          stage: 1,
          name: 'Payment Ingestion & Status Check',
          responsibleRole: 'FINANCE / AUTOMATED GATEWAY',
          action: 'Gateway signature validation or UTR matching against bank statement',
          nextStatus: 'SUCCESS / PENDING_VERIFICATION',
        },
        {
          stage: 2,
          name: 'General Ledger Journaling & Fund Allocation',
          responsibleRole: 'FINANCE_OFFICER',
          action: 'Automatic debit to Bank Account and credit to specific Fund Account (Zakat, Sadaqah, Orphan Aid)',
          nextStatus: 'JOURNALED',
        },
        {
          stage: 3,
          name: 'Cryptographic Receipt Generation & Dispatch',
          responsibleRole: 'AUTOMATED DOCUMENT ENGINE',
          action: 'HMAC-SHA256 signed receipt PDF + SVG QR code dispatched via Email/WhatsApp',
          nextStatus: 'COMPLETED',
        },
      ],
      rejectionAction: 'Mark donation as FAILED / VOID; notify donor with discrepancy reason.',
      auditRequirement: 'Immutable SHA-256 chained audit record logged for payment state change.',
    },
    {
      workflowKey: 'EXPENSE_DISBURSEMENT_APPROVAL',
      title: 'Expense & Vendor Payout Approval Workflow',
      triggerEvent: 'Expense claim / vendor invoice submitted with bills and tax receipt',
      stages: [
        {
          stage: 1,
          name: 'Departmental Verification',
          responsibleRole: 'PROJECT_MANAGER / HR_OFFICER',
          action: 'Verify deliverables, invoice accuracy, and purchase order linkage',
          nextStatus: 'VERIFIED',
        },
        {
          stage: 2,
          name: 'Finance Review & Tax Audit',
          responsibleRole: 'FINANCE_OFFICER',
          action: 'Check budget availability, TDS deduction (if applicable), and bank account correctness',
          nextStatus: 'APPROVED_FINANCE',
        },
        {
          stage: 3,
          name: 'Director / Trustee Dual-Authorization (Threshold > ₹50,000)',
          responsibleRole: 'DIRECTOR',
          action: 'Executive review and final cryptographic authorization for bank disbursement',
          nextStatus: 'APPROVED_FOR_PAYOUT',
        },
        {
          stage: 4,
          name: 'Bank Payout & Payment Voucher Closure',
          responsibleRole: 'FINANCE_OFFICER',
          action: 'Execute NEFT/RTGS payment; record bank transaction UTR; issue voucher',
          nextStatus: 'PAID',
        },
      ],
      rejectionAction: 'Return expense claim to initiator with feedback on discrepancies.',
      auditRequirement: 'Dual-signatory verification logged in General Ledger audit trail.',
    },
    {
      workflowKey: 'PROJECT_LIFECYCLE_APPROVAL',
      title: 'Capital Project Initiation & Milestone Approval Workflow',
      triggerEvent: 'New infrastructure / humanitarian project proposal submitted',
      stages: [
        {
          stage: 1,
          name: 'Proposal & Feasibility Review',
          responsibleRole: 'PROJECT_MANAGER',
          action: 'Prepare Bill of Quantities (BOQ), contractor quotes, GPS survey, and budget forecast',
          nextStatus: 'SUBMITTED',
        },
        {
          stage: 2,
          name: 'Director & Board Approval',
          responsibleRole: 'DIRECTOR',
          action: 'Approve project charter, budget allocation, and target completion timeline',
          nextStatus: 'APPROVED / ACTIVE',
        },
        {
          stage: 3,
          name: 'Stage Gate & Milestone Inspection',
          responsibleRole: 'FIELD_WORKER / PROJECT_MANAGER',
          action: 'Upload field verification photos, contractor completion certificate, and GPS coordinates',
          nextStatus: 'MILESTONE_VERIFIED',
        },
        {
          stage: 4,
          name: 'Final Project Closeout & Impact Telemetry Audit',
          responsibleRole: 'DIRECTOR / AUDITOR',
          action: 'Reconcile project spending against original budget; publish public impact telemetry',
          nextStatus: 'COMPLETED',
        },
      ],
      rejectionAction: 'Mark project PROPOSAL_REJECTED; archive proposal documents.',
      auditRequirement: 'Project stage transitions recorded in immutable project audit history.',
    },
    {
      workflowKey: 'BENEFICIARY_AID_APPROVAL',
      title: 'Beneficiary Enrollment & Aid Approval Workflow',
      triggerEvent: 'New beneficiary assistance application submitted by field team or self-enrolled',
      stages: [
        {
          stage: 1,
          name: 'Application & AES-256 KYC Vaulting',
          responsibleRole: 'FIELD_WORKER',
          action: 'Collect income certificates, Aadhaar/National ID, medical records, and household photos',
          nextStatus: 'SUBMITTED',
        },
        {
          stage: 2,
          name: 'Field Verification & Poverty Assessment',
          responsibleRole: 'FIELD_WORKER',
          action: 'Conduct in-person physical home visit; confirm socioeconomic eligibility (Zakat/General Aid)',
          nextStatus: 'VERIFIED',
        },
        {
          stage: 3,
          name: 'Welfare Committee / Director Approval',
          responsibleRole: 'DIRECTOR / WELFARE_LEAD',
          action: 'Sanction aid amount, frequency (one-time vs recurring monthly), and disbursement category',
          nextStatus: 'APPROVED',
        },
        {
          stage: 4,
          name: 'Direct Aid Handover & Digital Voucher Issue',
          responsibleRole: 'FIELD_WORKER / FINANCE_OFFICER',
          action: 'Direct bank transfer / physical ration kit handover with OTP or physical signature capture',
          nextStatus: 'DISBURSED',
        },
      ],
      rejectionAction: 'Document reasons for ineligibility in confidential welfare registry; inform applicant.',
      auditRequirement: 'Beneficiary aid sanction logged with cryptographic operator attribution.',
    },
    {
      workflowKey: 'VOLUNTEER_ONBOARDING_APPROVAL',
      title: 'Volunteer Application & Vetting Approval Workflow',
      triggerEvent: 'Public volunteer registration submitted via /volunteer portal',
      stages: [
        {
          stage: 1,
          name: 'Application Intake & Interest Tagging',
          responsibleRole: 'HR_OFFICER',
          action: 'Review skills, availability, preferred domain (health, education, relief), and references',
          nextStatus: 'APPLIED',
        },
        {
          stage: 2,
          name: 'Identity Verification & Briefing',
          responsibleRole: 'HR_OFFICER / VOLUNTEER_LEAD',
          action: 'Verify contact details, conduct introductory orientation, and assign volunteer badge ID',
          nextStatus: 'VERIFIED',
        },
        {
          stage: 3,
          name: 'Deployment & Activity Attendance',
          responsibleRole: 'PROJECT_MANAGER',
          action: 'Assign to field events, medical camps, or relief logistics; log hours',
          nextStatus: 'ACTIVE',
        },
        {
          stage: 4,
          name: 'Service Certificate Synthesis',
          responsibleRole: 'HR_OFFICER / DOCUMENT_ENGINE',
          action: 'Generate official HMAC-SHA256 verified Volunteer Service Certificate after required hours',
          nextStatus: 'CERTIFIED',
        },
      ],
      rejectionAction: 'Politely decline volunteer profile if requirements or background checks are not met.',
      auditRequirement: 'Volunteer status changes recorded in HR audit logs.',
    },
    {
      workflowKey: 'CONTENT_PUBLISHING_APPROVAL',
      title: 'CMS Article & Media Publishing Approval Workflow',
      triggerEvent: 'New blog post, news dispatch, or impact story created in CMS editor',
      stages: [
        {
          stage: 1,
          name: 'Drafting & Media Preparation',
          responsibleRole: 'CONTENT_CREATOR / MEDIA_LEAD',
          action: 'Write story text, insert sanitized HTML, tag cause/campaign, and attach high-res images',
          nextStatus: 'DRAFT',
        },
        {
          stage: 2,
          name: 'Editorial & Compliance Review',
          responsibleRole: 'CONTENT_ADMIN',
          action: 'Verify accuracy, dignity of beneficiary photos, SEO metadata, and fact-check narrative',
          nextStatus: 'IN_REVIEW',
        },
        {
          stage: 3,
          name: 'Executive Sign-Off & Instant Publishing',
          responsibleRole: 'DIRECTOR / CONTENT_HEAD',
          action: 'Final approval; content status changed to PUBLISHED; cache purged on live website',
          nextStatus: 'PUBLISHED',
        },
      ],
      rejectionAction: 'Return draft to author with specific revision notes.',
      auditRequirement: 'CMS content revisions and publishing timestamps logged in system audit trail.',
    },
    {
      workflowKey: 'DOCUMENT_ISSUANCE_APPROVAL',
      title: 'Official Document Generation & Cryptographic Signing Workflow',
      triggerEvent: 'Request to issue Certificate, Payslip, 80G Receipt, Resolution, or Statutory Letter',
      stages: [
        {
          stage: 1,
          name: 'Template Selection & Context Compilation',
          responsibleRole: 'INITIATING_ADMIN / SERVICE_ENGINE',
          action: 'Select 1 of 12 document categories; compile recipient details, sequential serial number',
          nextStatus: 'DRAFT_DOCUMENT',
        },
        {
          stage: 2,
          name: 'Cryptographic Hash & QR Matrix Synthesis',
          responsibleRole: 'CENTRALIZED_DOCUMENT_ENGINE',
          action: 'Generate HMAC-SHA256 signature using QR_HMAC_SECRET; generate embedded SVG QR code',
          nextStatus: 'SIGNED',
        },
        {
          stage: 3,
          name: 'Official Document Registration & Dispatch',
          responsibleRole: 'DOCUMENT_SERVICE',
          action: 'Persist record in Official Document Registry; deliver downloadable PDF to recipient',
          nextStatus: 'ISSUED',
        },
      ],
      rejectionAction: 'Abort document generation if input parameters or required signatories are missing.',
      auditRequirement: 'Document issuance and HMAC signature recorded in global document registry.',
    },
    {
      workflowKey: 'FINANCIAL_RECONCILIATION_SIGNOFF',
      title: 'Monthly Financial Period Close & Ledger Reconciliation Workflow',
      triggerEvent: 'Month-end financial period closure triggered on last calendar day of month',
      stages: [
        {
          stage: 1,
          name: 'Bank & Payment Gateway Balance Matching',
          responsibleRole: 'FINANCE_OFFICER',
          action: 'Match total bank debits/credits against Razorpay, Stripe, and Bank Transfer ledgers',
          nextStatus: 'BALANCES_MATCHED',
        },
        {
          stage: 2,
          name: 'Zakat / Khums Isolation Audit',
          responsibleRole: 'FINANCE_OFFICER',
          action: 'Confirm zero leakage between restricted religious funds and administrative expenses',
          nextStatus: 'RELIGIOUS_ISOLATION_VERIFIED',
        },
        {
          stage: 3,
          name: 'CFO & Internal Auditor Formal Sign-Off',
          responsibleRole: 'AUDITOR / FINANCE_HEAD',
          action: 'Formal review of Trial Balance, Profit & Loss, and Balance Sheet; lock accounting period',
          nextStatus: 'PERIOD_LOCKED',
        },
      ],
      rejectionAction: 'Flag discrepancies to Finance Officer for journal ledger adjustment before close.',
      auditRequirement: 'Period close certificate cryptographically sealed in Statutory Compliance Vault.',
    },
  ] as WorkflowDefinition[],
};
