import { CommunicationChannel } from '@prisma/client';

export interface TemplateDefinition {
  key: string;
  name: string;
  category: 'DONATION' | 'MEMBERSHIP' | 'VOLUNTEER' | 'HR_PAYROLL' | 'COMPLIANCE' | 'PROJECTS' | 'SYSTEM';
  description: string;
  allowedChannels: CommunicationChannel[];
  subjectTemplate?: string;
  emailBodyHtmlTemplate?: string;
  whatsappTemplateText?: string;
  smsTemplateText?: string;
  inAppTitleTemplate?: string;
  inAppBodyTemplate?: string;
  inAppCategory?: string;
  defaultVariables: Record<string, string>;
}

/**
 * Standard Foundation Email Shell Wrapper
 */
export function wrapFoundationEmailHtml(contentHtml: string, previewText: string = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IMAM MISSION</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; }
    .wrapper { max-width: 620px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #064e3b 0%, #022c22 100%); padding: 32px 28px; text-align: center; color: #ffffff; }
    .gold-accent { color: #fbbf24; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
    .brand-title { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
    .brand-subtitle { font-size: 12px; color: #93c5fd; margin-top: 4px; opacity: 0.9; }
    .content { padding: 32px 28px; font-size: 15px; line-height: 1.6; color: #334155; }
    .callout { background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px 20px; border-radius: 8px; margin: 20px 0; }
    .btn { display: inline-block; padding: 12px 28px; background: #064e3b; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; margin: 20px 0; }
    .footer { background: #f1f5f9; padding: 24px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .meta-box { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 13px; }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ''}
  <div class="wrapper">
    <div class="header">
      <div style="margin-bottom: 12px; text-align: center;">
        <img src="https://imammission.org/branding/imam-e-mahdi-foundation-logo.png" alt="IMAM E MAHDI FOUNDATION" style="height: 44px; width: auto; max-width: 220px; object-fit: contain; background: #ffffff; padding: 4px 10px; border-radius: 8px; display: inline-block;" />
      </div>
      <div class="gold-accent">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
      <h1 class="brand-title">IMAM MISSION</h1>
      <div class="brand-subtitle">Serving Humanity Beyond Boundaries • Official Dispatch</div>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px;"><strong>IMAM MISSION</strong></p>
      <p style="margin: 0 0 6px; font-size: 11px;">Operated by <strong>IMAM E MAHDI FOUNDATION</strong> (Section 8 Not-for-Profit Company | CIN: U88900DC2026NPL474906)</p>
      <p style="margin: 0; font-size: 11px; color: #94a3b8;">Cryptographically Signed &amp; Issued via Official Document Engine • https://imammission.org</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Reusable Templates Catalog
 */
export const COMMUNICATION_TEMPLATES: Record<string, TemplateDefinition> = {
  DONATION_RECEIPT_ISSUED: {
    key: 'DONATION_RECEIPT_ISSUED',
    name: 'Donation Receipt & Contribution Acknowledgment',
    category: 'DONATION',
    description: 'Sent to donor immediately upon successful donation and cryptographic receipt generation.',
    allowedChannels: [
      CommunicationChannel.EMAIL,
      CommunicationChannel.WHATSAPP,
      CommunicationChannel.SMS,
      CommunicationChannel.IN_APP,
    ],
    subjectTemplate: 'Official Donation Receipt #{{documentNumber}} - Imam E Mahdi Foundation',
    emailBodyHtmlTemplate: `
      <p>Dear <strong>{{recipientName}}</strong>,</p>
      <p>May Peace and Blessings be upon you.</p>
      <p>We gratefully acknowledge receipt of your noble charitable contribution towards <strong>{{fundType}}</strong>.</p>
      
      <div class="callout">
        <h3 style="margin: 0 0 8px; color: #064e3b; font-size: 16px;">Donation Summary</h3>
        <p style="margin: 0 0 4px;"><strong>Receipt Number:</strong> {{documentNumber}}</p>
        <p style="margin: 0 0 4px;"><strong>Amount:</strong> ₹{{amount}} ({{currency}})</p>
        <p style="margin: 0 0 4px;"><strong>Fund / Purpose:</strong> {{fundType}}</p>
        <p style="margin: 0 0 4px;"><strong>Payment Reference:</strong> {{paymentReference}}</p>
        <p style="margin: 0;"><strong>Date of Contribution:</strong> {{generatedDate}}</p>
      </div>

      <p>Your official cryptographically-signed Donation Acknowledgment Receipt is ready. You may download or verify its authenticity directly via our universal cryptographic portal.</p>
      
      <div style="text-align: center;">
        <a href="{{verificationUrl}}" class="btn">View & Download Official Receipt</a>
      </div>

      <div class="meta-box">
        <strong>Statutory Notice:</strong> Official donation acknowledgment issued by Imam E Mahdi Foundation (Section 8 Non-Profit Organization, CIN: U88900DC2026NPL474906). Section 80G tax exemption approval is pending formal statutory verification and is not active on this receipt.
      </div>
    `,
    whatsappTemplateText: `*Imam E Mahdi Foundation*\n\nDear *{{recipientName}}*,\n\nAlhamdulillah! We have received your generous donation of *₹{{amount}}* for *{{fundType}}*.\n\n📄 *Receipt No:* {{documentNumber}}\n📅 *Date:* {{generatedDate}}\n🔗 *Verify & Download:* {{verificationUrl}}\n\n_Jazakallah Khair for your impactful support._`,
    smsTemplateText: `Dear {{recipientName}}, thank you for your donation of Rs. {{amount}} (Receipt: {{documentNumber}}). Verify receipt at: {{verificationUrl}} - Imam E Mahdi Foundation`,
    inAppTitleTemplate: 'New Donation Receipt Issued (#{{documentNumber}})',
    inAppBodyTemplate: '₹{{amount}} received from {{recipientName}} for {{fundType}}. Official receipt issued.',
    inAppCategory: 'DONATION',
    defaultVariables: {
      recipientName: 'Valued Donor',
      documentNumber: 'IMF-REC-2026-00001',
      amount: '5,000.00',
      currency: 'INR',
      fundType: 'General Relief & Education',
      paymentReference: 'TXN-001',
      generatedDate: '2026-01-01',
      verificationUrl: 'https://imf.org/verify/doc/sample',
    },
  },

  MEMBER_WELCOME_ID: {
    key: 'MEMBER_WELCOME_ID',
    name: 'Membership Card & Welcome Kit',
    category: 'MEMBERSHIP',
    description: 'Sent upon approval of general or life membership with embedded digital ID card.',
    allowedChannels: [
      CommunicationChannel.EMAIL,
      CommunicationChannel.WHATSAPP,
      CommunicationChannel.IN_APP,
    ],
    subjectTemplate: 'Welcome to IMF-DOS: Official Digital Member ID Card #{{documentNumber}}',
    emailBodyHtmlTemplate: `
      <p>Dear Brother/Sister <strong>{{recipientName}}</strong>,</p>
      <p>Welcome to the <strong>Imam E Mahdi Foundation</strong> family. Your application for <strong>{{membershipTier}} Membership</strong> has been formally approved by the Board.</p>
      
      <div class="callout">
        <h3 style="margin: 0 0 8px; color: #064e3b; font-size: 16px;">Membership Credentials</h3>
        <p style="margin: 0 0 4px;"><strong>Member ID:</strong> {{documentNumber}}</p>
        <p style="margin: 0 0 4px;"><strong>Membership Tier:</strong> {{membershipTier}}</p>
        <p style="margin: 0 0 4px;"><strong>Validity Period:</strong> {{validFrom}} to {{validUntil}}</p>
        <p style="margin: 0;"><strong>Electoral / AGM Eligibility:</strong> {{votingRights}}</p>
      </div>

      <p>Your official Digital Member ID Card and Certificate of Membership are cryptographically sealed. You can access your membership dashboard below.</p>
      
      <div style="text-align: center;">
        <a href="{{verificationUrl}}" class="btn">View Digital ID & Credentials</a>
      </div>
    `,
    whatsappTemplateText: `*Imam E Mahdi Foundation*\n\nWelcome Brother/Sister *{{recipientName}}*!\n\nYour *{{membershipTier}} Membership* is active.\n💳 *Member ID:* {{documentNumber}}\n📅 *Valid Until:* {{validUntil}}\n🔗 *Digital Member Card:* {{verificationUrl}}`,
    smsTemplateText: `Welcome to IMF! Your {{membershipTier}} ID {{documentNumber}} is active. View digital card at: {{verificationUrl}}`,
    inAppTitleTemplate: 'New Member Onboarded: {{recipientName}}',
    inAppBodyTemplate: 'Member {{recipientName}} enrolled with ID {{documentNumber}} ({{membershipTier}}).',
    inAppCategory: 'MEMBERSHIP',
    defaultVariables: {
      recipientName: 'Syed Ali',
      documentNumber: 'IMF-MEM-2026-00001',
      membershipTier: 'Annual General',
      validFrom: '2026-01-01',
      validUntil: '2027-01-01',
      votingRights: 'Active for 2026 AGM',
      verificationUrl: 'https://imf.org/verify/doc/sample',
    },
  },

  VOLUNTEER_BADGE_CERTIFICATE: {
    key: 'VOLUNTEER_BADGE_CERTIFICATE',
    name: 'Volunteer Credential & Service Certificate',
    category: 'VOLUNTEER',
    description: 'Issued when a volunteer logs verified service hours or receives official certification.',
    allowedChannels: [
      CommunicationChannel.EMAIL,
      CommunicationChannel.WHATSAPP,
      CommunicationChannel.IN_APP,
    ],
    subjectTemplate: 'Official Volunteer Service Certificate #{{documentNumber}} - IMF-DOS',
    emailBodyHtmlTemplate: `
      <p>Dear Volunteer <strong>{{recipientName}}</strong>,</p>
      <p>The Imam E Mahdi Foundation sincerely honors your selfless humanitarian commitment and service to the underprivileged community.</p>
      
      <div class="callout">
        <h3 style="margin: 0 0 8px; color: #064e3b; font-size: 16px;">Service Recognition</h3>
        <p style="margin: 0 0 4px;"><strong>Volunteer Badge:</strong> {{volunteerCode}}</p>
        <p style="margin: 0 0 4px;"><strong>Certificate Serial:</strong> {{documentNumber}}</p>
        <p style="margin: 0 0 4px;"><strong>Verified Service Hours:</strong> {{totalHours}} Hours</p>
        <p style="margin: 0 0 4px;"><strong>Key Program / Deployment:</strong> {{deploymentName}}</p>
        <p style="margin: 0;"><strong>Issuance Date:</strong> {{generatedDate}}</p>
      </div>

      <p>Your certificate has been digitally signed by the Board of Trustees and embedded with an immutable QR verification stamp.</p>

      <div style="text-align: center;">
        <a href="{{verificationUrl}}" class="btn">View & Download Certificate</a>
      </div>
    `,
    whatsappTemplateText: `*Imam E Mahdi Foundation*\n\nHonorable Volunteer *{{recipientName}}*,\n\nWe recognize your *{{totalHours}} hours* of selfless service.\n🎖️ *Certificate:* {{documentNumber}}\n🔗 *View Verified Certificate:* {{verificationUrl}}`,
    smsTemplateText: `Dear {{recipientName}}, your Volunteer Service Certificate ({{documentNumber}}) is issued. View at: {{verificationUrl}}`,
    inAppTitleTemplate: 'Volunteer Certificate Issued: {{recipientName}}',
    inAppBodyTemplate: '{{recipientName}} awarded certificate #{{documentNumber}} for {{totalHours}} hours of service.',
    inAppCategory: 'VOLUNTEER',
    defaultVariables: {
      recipientName: 'Fatema Zahra',
      volunteerCode: 'IMF-VOL-2026-0001',
      documentNumber: 'IMF-CERT-2026-0001',
      totalHours: '50',
      deploymentName: 'Medical Outreach & Ration Relief',
      generatedDate: '2026-01-01',
      verificationUrl: 'https://imf.org/verify/doc/sample',
    },
  },

  EMPLOYEE_OFFER_LETTER: {
    key: 'EMPLOYEE_OFFER_LETTER',
    name: 'Employment Offer Letter',
    category: 'HR_PAYROLL',
    description: 'Formal employment offer with compensation details and acceptance deadline.',
    allowedChannels: [
      CommunicationChannel.EMAIL,
      CommunicationChannel.IN_APP,
    ],
    subjectTemplate: 'Official Job Offer: {{designation}} - Imam E Mahdi Foundation',
    emailBodyHtmlTemplate: `
      <p>Dear <strong>{{recipientName}}</strong>,</p>
      <p>Following our recruitment process, the Executive Committee of <strong>Imam E Mahdi Foundation</strong> is pleased to offer you the position of <strong>{{designation}}</strong> in the <strong>{{department}}</strong> department.</p>
      
      <div class="callout">
        <h3 style="margin: 0 0 8px; color: #064e3b; font-size: 16px;">Offer Overview</h3>
        <p style="margin: 0 0 4px;"><strong>Offer Reference:</strong> {{documentNumber}}</p>
        <p style="margin: 0 0 4px;"><strong>Designation:</strong> {{designation}}</p>
        <p style="margin: 0 0 4px;"><strong>Annual CTC:</strong> ₹{{annualCTC}}</p>
        <p style="margin: 0 0 4px;"><strong>Proposed Joining Date:</strong> {{joiningDate}}</p>
        <p style="margin: 0;"><strong>Offer Expiration:</strong> {{expiryDate}}</p>
      </div>

      <p>Please review your full, formal offer document and submit your signed acceptance prior to the expiration date.</p>

      <div style="text-align: center;">
        <a href="{{verificationUrl}}" class="btn">Review Full Offer Letter</a>
      </div>
    `,
    whatsappTemplateText: `*Imam E Mahdi Foundation*\n\nDear *{{recipientName}}*,\nWe are pleased to offer you the role of *{{designation}}*.\n📄 *Offer Reference:* {{documentNumber}}\n📅 *Offer Expiry:* {{expiryDate}}\n🔗 *Review Document:* {{verificationUrl}}`,
    smsTemplateText: `IMF Job Offer: {{recipientName}}, you have been offered the role of {{designation}} (Ref: {{documentNumber}}). Review at {{verificationUrl}}`,
    inAppTitleTemplate: 'Job Offer Generated: {{recipientName}}',
    inAppBodyTemplate: 'Offer {{documentNumber}} generated for {{recipientName}} ({{designation}}).',
    inAppCategory: 'HR_PAYROLL',
    defaultVariables: {
      recipientName: 'Ahmad Khan',
      documentNumber: 'IMF-OFF-2026-0001',
      designation: 'Senior Programs Officer',
      department: 'Disaster Relief & Operations',
      annualCTC: '6,50,000.00',
      joiningDate: '2026-02-01',
      expiryDate: '2026-01-25',
      verificationUrl: 'https://imf.org/verify/doc/sample',
    },
  },

  EMPLOYEE_APPOINTMENT_LETTER: {
    key: 'EMPLOYEE_APPOINTMENT_LETTER',
    name: 'Employment Appointment Letter',
    category: 'HR_PAYROLL',
    description: 'Official employment appointment letter on joining date.',
    allowedChannels: [
      CommunicationChannel.EMAIL,
      CommunicationChannel.IN_APP,
    ],
    subjectTemplate: 'Official Appointment Letter: {{employeeCode}} - {{recipientName}}',
    emailBodyHtmlTemplate: `
      <p>Dear <strong>{{recipientName}}</strong>,</p>
      <p>We are delighted to confirm your formal appointment as <strong>{{designation}}</strong> with the Imam E Mahdi Foundation, effective from <strong>{{joiningDate}}</strong>.</p>
      
      <div class="callout">
        <h3 style="margin: 0 0 8px; color: #064e3b; font-size: 16px;">Appointment Particulars</h3>
        <p style="margin: 0 0 4px;"><strong>Employee Code:</strong> {{employeeCode}}</p>
        <p style="margin: 0 0 4px;"><strong>Appointment Letter No:</strong> {{documentNumber}}</p>
        <p style="margin: 0 0 4px;"><strong>Department:</strong> {{department}}</p>
        <p style="margin: 0 0 4px;"><strong>Monthly Gross:</strong> ₹{{monthlyGross}}</p>
        <p style="margin: 0;"><strong>Probation Period:</strong> {{probationMonths}} Months</p>
      </div>

      <p>Please find attached your cryptographically verified appointment letter. Welcome to the team!</p>

      <div style="text-align: center;">
        <a href="{{verificationUrl}}" class="btn">View Official Appointment Letter</a>
      </div>
    `,
    whatsappTemplateText: `*Imam E Mahdi Foundation*\n\nCongratulations *{{recipientName}}* on your appointment as *{{designation}}* (Code: {{employeeCode}}).\n🔗 *View Appointment Letter:* {{verificationUrl}}`,
    smsTemplateText: `IMF Appointment: Welcome {{recipientName}}! Your appointment letter {{documentNumber}} is ready at {{verificationUrl}}`,
    inAppTitleTemplate: 'Employee Appointment Letter Issued',
    inAppBodyTemplate: 'Appointment letter {{documentNumber}} issued to {{recipientName}} ({{employeeCode}}).',
    inAppCategory: 'HR_PAYROLL',
    defaultVariables: {
      recipientName: 'Ahmad Khan',
      employeeCode: 'IMF-EMP-0042',
      documentNumber: 'IMF-APT-2026-0001',
      designation: 'Senior Programs Officer',
      department: 'Disaster Relief',
      monthlyGross: '54,166.00',
      joiningDate: '2026-02-01',
      probationMonths: '6',
      verificationUrl: 'https://imf.org/verify/doc/sample',
    },
  },

  PAYSLIP_GENERATED: {
    key: 'PAYSLIP_GENERATED',
    name: 'Monthly Employee Payslip',
    category: 'HR_PAYROLL',
    description: 'Monthly payroll statement dispatched to employees.',
    allowedChannels: [
      CommunicationChannel.EMAIL,
      CommunicationChannel.WHATSAPP,
      CommunicationChannel.SMS,
      CommunicationChannel.IN_APP,
    ],
    subjectTemplate: 'Salary Payslip for {{monthYear}} - {{recipientName}} ({{employeeCode}})',
    emailBodyHtmlTemplate: `
      <p>Dear <strong>{{recipientName}}</strong>,</p>
      <p>Your salary payslip for the pay period <strong>{{monthYear}}</strong> has been processed and credited.</p>
      
      <div class="callout">
        <h3 style="margin: 0 0 8px; color: #064e3b; font-size: 16px;">Payslip Summary ({{monthYear}})</h3>
        <p style="margin: 0 0 4px;"><strong>Payslip No:</strong> {{documentNumber}}</p>
        <p style="margin: 0 0 4px;"><strong>Gross Earnings:</strong> ₹{{grossEarnings}}</p>
        <p style="margin: 0 0 4px;"><strong>Total Deductions:</strong> ₹{{totalDeductions}}</p>
        <p style="margin: 0 0 4px;"><strong>Net Salary Paid:</strong> <span style="font-size: 16px; color: #064e3b; font-weight: bold;">₹{{netSalary}}</span></p>
        <p style="margin: 0;"><strong>Bank Payment UTR:</strong> {{paymentRef}}</p>
      </div>

      <p>You can review and download the detailed PDF payslip with statutory deductions (PF, ESI, Tax) below.</p>

      <div style="text-align: center;">
        <a href="{{verificationUrl}}" class="btn">View & Download Payslip</a>
      </div>
    `,
    whatsappTemplateText: `*Imam E Mahdi Foundation - Payroll*\n\nDear *{{recipientName}}*,\nYour payslip for *{{monthYear}}* is processed.\n💰 *Net Salary:* ₹{{netSalary}}\n📄 *Payslip No:* {{documentNumber}}\n🔗 *Download Payslip:* {{verificationUrl}}`,
    smsTemplateText: `IMF Salary Alert: Payslip for {{monthYear}} generated. Net Pay: Rs {{netSalary}}. Download: {{verificationUrl}}`,
    inAppTitleTemplate: 'Payslip Ready: {{monthYear}}',
    inAppBodyTemplate: 'Payslip for {{monthYear}} (Net: ₹{{netSalary}}) has been credited.',
    inAppCategory: 'HR_PAYROLL',
    defaultVariables: {
      recipientName: 'Ahmad Khan',
      employeeCode: 'IMF-EMP-0042',
      documentNumber: 'IMF-PSL-202601-0001',
      monthYear: 'January 2026',
      grossEarnings: '54,166.00',
      totalDeductions: '4,500.00',
      netSalary: '49,666.00',
      paymentRef: 'NEFT-HDFC-99281726',
      verificationUrl: 'https://imf.org/verify/doc/sample',
    },
  },

  DONATION_STATEMENT_YEARLY: {
    key: 'DONATION_STATEMENT_YEARLY',
    name: 'Annual Donation Acknowledgment Statement',
    category: 'DONATION',
    description: 'Annual itemized contribution statement sent to donors for accounting and personal records.',
    allowedChannels: [
      CommunicationChannel.EMAIL,
      CommunicationChannel.WHATSAPP,
      CommunicationChannel.IN_APP,
    ],
    subjectTemplate: 'Annual Donation Contribution Statement for FY {{fiscalYear}} - IMF-DOS',
    emailBodyHtmlTemplate: `
      <p>Dear <strong>{{recipientName}}</strong>,</p>
      <p>We are pleased to provide your cumulative Annual Donation Statement for <strong>Financial Year {{fiscalYear}}</strong> for your personal accounting and donor stewardship records.</p>
      
      <div class="callout">
        <h3 style="margin: 0 0 8px; color: #064e3b; font-size: 16px;">Annual Summary (FY {{fiscalYear}})</h3>
        <p style="margin: 0 0 4px;"><strong>Statement No:</strong> {{documentNumber}}</p>
        <p style="margin: 0 0 4px;"><strong>Total Donations:</strong> {{totalDonationCount}} Transactions</p>
        <p style="margin: 0 0 4px;"><strong>Cumulative Contribution:</strong> <span style="font-size: 16px; color: #064e3b; font-weight: bold;">₹{{totalAmount}}</span></p>
        <p style="margin: 0;"><strong>Donation Total:</strong> ₹{{eligible80GAmount}}</p>
      </div>

      <p>This statement has been authenticated with our organizational digital seal.</p>

      <div style="text-align: center;">
        <a href="{{verificationUrl}}" class="btn">View Itemized Contribution Statement</a>
      </div>

      <div class="meta-box">
        <strong>Statutory Notice:</strong> Issued by Imam E Mahdi Foundation (CIN: U88900DC2026NPL474906). Official Section 80G income tax deduction entitlement is subject to active statutory verification status.
      </div>
    `,
    whatsappTemplateText: `*Imam E Mahdi Foundation*\n\nDear *{{recipientName}}*,\nYour Annual Donation Statement for FY *{{fiscalYear}}* is ready.\n📊 *Total Contributed:* ₹{{totalAmount}}\n📄 *Statement No:* {{documentNumber}}\n🔗 *Download Statement:* {{verificationUrl}}`,
    smsTemplateText: `Dear {{recipientName}}, your Annual Donation Statement for FY {{fiscalYear}} (Total: Rs. {{totalAmount}}) is available at: {{verificationUrl}}`,
    inAppTitleTemplate: 'Annual Donation Statement Generated: {{recipientName}}',
    inAppBodyTemplate: 'FY {{fiscalYear}} statement for ₹{{totalAmount}} generated.',
    inAppCategory: 'DONATION',
    defaultVariables: {
      recipientName: 'Syed Ali',
      documentNumber: 'IMF-STM-2026-0001',
      fiscalYear: '2025-26',
      totalDonationCount: '12',
      totalAmount: '60,000.00',
      eligible80GAmount: '60,000.00',
      verificationUrl: 'https://imf.org/verify/doc/sample',
    },
  },

  PROJECT_REPORT_RELEASED: {
    key: 'PROJECT_REPORT_RELEASED',
    name: 'Project Progress & Milestone Report',
    category: 'PROJECTS',
    description: 'Executive project status report dispatched to board members and donors.',
    allowedChannels: [
      CommunicationChannel.EMAIL,
      CommunicationChannel.IN_APP,
    ],
    subjectTemplate: 'Project Progress Report: {{projectName}} (#{{documentNumber}})',
    emailBodyHtmlTemplate: `
      <p>Dear Stakeholder,</p>
      <p>The official Project Status Report for <strong>{{projectName}}</strong> (Code: {{projectCode}}) has been finalized and published.</p>
      
      <div class="callout">
        <h3 style="margin: 0 0 8px; color: #064e3b; font-size: 16px;">Project Status Overview</h3>
        <p style="margin: 0 0 4px;"><strong>Report Code:</strong> {{documentNumber}}</p>
        <p style="margin: 0 0 4px;"><strong>Project Name:</strong> {{projectName}}</p>
        <p style="margin: 0 0 4px;"><strong>Status:</strong> {{projectStatus}}</p>
        <p style="margin: 0 0 4px;"><strong>Total Budget:</strong> ₹{{budgetAmount}}</p>
        <p style="margin: 0;"><strong>Beneficiaries Impacted:</strong> {{beneficiariesReached}}</p>
      </div>

      <p>Access the full milestone breakdown, fund utilization summary, and field verification documentation below.</p>

      <div style="text-align: center;">
        <a href="{{verificationUrl}}" class="btn">View Executive Project Report</a>
      </div>
    `,
    whatsappTemplateText: `*Imam E Mahdi Foundation - Project Update*\n\nProject: *{{projectName}}*\nStatus: *{{projectStatus}}*\nReport: {{documentNumber}}\n🔗 *View Full Report:* {{verificationUrl}}`,
    smsTemplateText: `IMF Project Report: {{projectName}} update ({{documentNumber}}) is now live at {{verificationUrl}}`,
    inAppTitleTemplate: 'Project Report Published: {{projectName}}',
    inAppBodyTemplate: 'Milestone report {{documentNumber}} released for {{projectName}}.',
    inAppCategory: 'PROJECTS',
    defaultVariables: {
      projectName: 'Ramadan Ration Relief 2026',
      projectCode: 'IMF-PRJ-2026-004',
      documentNumber: 'IMF-RPT-2026-0001',
      projectStatus: 'ACTIVE / ON SCHEDULE',
      budgetAmount: '25,00,000.00',
      beneficiariesReached: '1,450 Families',
      verificationUrl: 'https://imf.org/verify/doc/sample',
    },
  },

  IMPACT_REPORT_RELEASED: {
    key: 'IMPACT_REPORT_RELEASED',
    name: 'Quarterly & Annual Impact Report',
    category: 'PROJECTS',
    description: 'Foundation-wide social impact and metrics evaluation report.',
    allowedChannels: [
      CommunicationChannel.EMAIL,
      CommunicationChannel.IN_APP,
    ],
    subjectTemplate: 'Official Impact & Transparency Report: {{reportPeriod}}',
    emailBodyHtmlTemplate: `
      <p>Dear Valued Partner & Supporter,</p>
      <p>We are humbled to share the comprehensive <strong>Social Impact & Transparency Report</strong> for <strong>{{reportPeriod}}</strong>.</p>
      
      <div class="callout">
        <h3 style="margin: 0 0 8px; color: #064e3b; font-size: 16px;">Key Impact Milestones</h3>
        <p style="margin: 0 0 4px;"><strong>Report Serial:</strong> {{documentNumber}}</p>
        <p style="margin: 0 0 4px;"><strong>Total Humanitarian Aid Disbursed:</strong> ₹{{totalAidDisbursed}}</p>
        <p style="margin: 0 0 4px;"><strong>Lives Directly Transformed:</strong> {{livesTransformed}}</p>
        <p style="margin: 0 0 4px;"><strong>Active Field Volunteers:</strong> {{activeVolunteers}}</p>
        <p style="margin: 0;"><strong>Fund Utilization Efficiency:</strong> {{utilizationRate}}%</p>
      </div>

      <p>Every metric is verified against verifiable ledger vouchers and field survey records.</p>

      <div style="text-align: center;">
        <a href="{{verificationUrl}}" class="btn">Explore Full Impact Report</a>
      </div>
    `,
    whatsappTemplateText: `*Imam E Mahdi Foundation - Impact Report*\n\nPeriod: *{{reportPeriod}}*\nLives Impacted: *{{livesTransformed}}*\nAid Disbursed: *₹{{totalAidDisbursed}}*\n🔗 *View Full Impact Report:* {{verificationUrl}}`,
    smsTemplateText: `IMF Impact Report for {{reportPeriod}} is published. View the transparency report at: {{verificationUrl}}`,
    inAppTitleTemplate: 'Impact Report Published ({{reportPeriod}})',
    inAppBodyTemplate: '{{reportPeriod}} impact report {{documentNumber}} is now available.',
    inAppCategory: 'PROJECTS',
    defaultVariables: {
      reportPeriod: 'Q1 2026',
      documentNumber: 'IMF-IMP-2026-0001',
      totalAidDisbursed: '45,00,000.00',
      livesTransformed: '12,500 Individuals',
      activeVolunteers: '320',
      utilizationRate: '94.2',
      verificationUrl: 'https://imf.org/verify/doc/sample',
    },
  },

  CRITICAL_COMPLIANCE_ALERT: {
    key: 'CRITICAL_COMPLIANCE_ALERT',
    name: 'Statutory Compliance & Regulatory Alert',
    category: 'COMPLIANCE',
    description: 'Urgent compliance alert sent to executive trustees and legal officers.',
    allowedChannels: [
      CommunicationChannel.EMAIL,
      CommunicationChannel.SMS,
      CommunicationChannel.IN_APP,
    ],
    subjectTemplate: 'URGENT: Statutory Compliance Action Required - {{complianceItem}}',
    emailBodyHtmlTemplate: `
      <p>Dear Executive Trustee / Compliance Officer,</p>
      <div class="callout" style="background: #fef2f2; border-left-color: #ef4444;">
        <h3 style="margin: 0 0 8px; color: #991b1b; font-size: 16px;">⚠️ Mandatory Statutory Notice</h3>
        <p style="margin: 0 0 4px;"><strong>Compliance Action:</strong> {{complianceItem}}</p>
        <p style="margin: 0 0 4px;"><strong>Filing / Action Due Date:</strong> {{dueDate}}</p>
        <p style="margin: 0 0 4px;"><strong>Statutory Authority:</strong> {{regulatoryBody}}</p>
        <p style="margin: 0;"><strong>Severity Level:</strong> <span style="color: #dc2626; font-weight: bold;">CRITICAL / HIGH PRIORITY</span></p>
      </div>

      <p>{{alertDetails}}</p>

      <div style="text-align: center;">
        <a href="{{actionUrl}}" class="btn" style="background: #991b1b;">Open Compliance Portal</a>
      </div>
    `,
    whatsappTemplateText: `*URGENT: Compliance Alert*\n\nAction: *{{complianceItem}}*\nDue Date: *{{dueDate}}*\nAuthority: *{{regulatoryBody}}*\n🔗 *Open Action:* {{actionUrl}}`,
    smsTemplateText: `URGENT IMF COMPLIANCE: {{complianceItem}} action required before {{dueDate}}. Details: {{actionUrl}}`,
    inAppTitleTemplate: '🚨 URGENT: {{complianceItem}} Due Soon',
    inAppBodyTemplate: 'Mandatory compliance filing due by {{dueDate}} ({{regulatoryBody}}).',
    inAppCategory: 'COMPLIANCE',
    defaultVariables: {
      complianceItem: 'Form 10BD & 80G Donor Annual Return',
      dueDate: '2026-05-31',
      regulatoryBody: 'Income Tax Department of India',
      alertDetails: 'Audited donor roster reconciliation required before final submission.',
      actionUrl: 'https://imf.org/admin/compliance',
    },
  },
};

/**
 * Helper to interpolate dynamic variables inside a template string
 * e.g. "Hello {{recipientName}}" -> "Hello Syed"
 */
export function renderTemplateString(template: string, variables: Record<string, any>): string {
  if (!template) return '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, varName) => {
    if (variables[varName] !== undefined && variables[varName] !== null) {
      return String(variables[varName]);
    }
    return '';
  });
}
