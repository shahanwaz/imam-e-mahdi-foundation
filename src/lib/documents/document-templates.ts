import { DocumentType } from '@prisma/client';

export interface DocumentRenderContext {
  documentNumber: string;
  documentType: DocumentType;
  title: string;
  templateVersion: string;
  recipientName: string;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
  generatedDate: string;
  expiresDate?: string | null;
  signatureHash: string;
  qrCodeSvg: string;
  qrVerificationUrl: string;
  signatories: Array<{
    name: string;
    title: string;
    role?: string;
    signatureDate?: string;
  }>;
  metadata: Record<string, any>;
}

/**
 * Base Shared CSS for Centralized Document Engine
 */
const BASE_DOCUMENT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Cinzel:wght@600;700;800&display=swap');
  
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    background-color: #f1f5f9;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #0f172a;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  .doc-container {
    max-width: 800px;
    margin: 32px auto;
    background: #ffffff;
    padding: 48px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    position: relative;
    border: 1px solid #e2e8f0;
  }

  .doc-card-container {
    max-width: 480px;
    margin: 32px auto;
    background: #ffffff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 15px 35px rgba(0,0,0,0.12);
    border: 1px solid #e2e8f0;
  }

  .header-banner {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #064e3b;
    padding-bottom: 24px;
    margin-bottom: 28px;
  }

  .org-title {
    font-size: 24px;
    font-weight: 800;
    color: #064e3b;
    margin: 0;
    letter-spacing: -0.5px;
  }

  .bismillah {
    color: #d97706;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 4px;
    letter-spacing: 1px;
  }

  .org-sub {
    font-size: 11px;
    color: #64748b;
    margin-top: 4px;
  }

  .doc-badge {
    text-align: right;
  }

  .doc-type-pill {
    display: inline-block;
    background: #ecfdf5;
    color: #064e3b;
    font-size: 11px;
    font-weight: 800;
    padding: 6px 14px;
    border-radius: 9999px;
    border: 1px solid #a7f3d0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .doc-number {
    font-size: 12px;
    font-family: monospace;
    font-weight: 700;
    color: #334155;
    margin-top: 6px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 16px 20px;
    border-radius: 10px;
    margin-bottom: 24px;
  }

  .info-item {
    font-size: 13px;
  }
  .info-label {
    color: #64748b;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }
  .info-value {
    color: #0f172a;
    font-weight: 700;
    margin-top: 2px;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin: 24px 0;
    font-size: 13px;
  }

  .data-table th {
    background: #064e3b;
    color: #ffffff;
    text-align: left;
    padding: 10px 14px;
    font-weight: 700;
  }

  .data-table td {
    padding: 10px 14px;
    border-bottom: 1px solid #e2e8f0;
    color: #334155;
  }

  .data-table tr:nth-child(even) td {
    background: #f8fafc;
  }

  .total-row td {
    font-weight: 800;
    background: #ecfdf5 !important;
    color: #064e3b;
    font-size: 14px;
    border-top: 2px solid #064e3b;
  }

  .signatories-section {
    display: flex;
    justify-content: space-between;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid #e2e8f0;
  }

  .signatory-box {
    text-align: center;
    width: 200px;
  }

  .sign-line {
    border-bottom: 1px dashed #94a3b8;
    height: 40px;
    margin-bottom: 8px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    font-family: 'Cinzel', serif;
    font-size: 12px;
    color: #064e3b;
    font-style: italic;
  }

  .signatory-name {
    font-size: 12px;
    font-weight: 700;
    color: #0f172a;
  }
  .signatory-title {
    font-size: 10px;
    color: #64748b;
  }

  .security-footer {
    margin-top: 32px;
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    border-radius: 10px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .qr-box {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
  }

  .qr-box svg {
    width: 100%;
    height: 100%;
  }

  .security-meta {
    font-size: 11px;
    color: #64748b;
    line-height: 1.5;
  }

  .hash-code {
    font-family: monospace;
    color: #064e3b;
    font-weight: bold;
    word-break: break-all;
  }

  @media print {
    body { background: transparent; }
    .doc-container { box-shadow: none; border: none; margin: 0; padding: 20px; width: 100%; max-width: 100%; }
    .doc-card-container { box-shadow: none; border: 1px solid #ccc; margin: 0 auto; page-break-inside: avoid; }
    .no-print { display: none !important; }
  }
`;

/**
 * Universal Document Render Dispatcher
 */
export function renderDocumentHtml(ctx: DocumentRenderContext): string {
  let bodyContent = '';

  switch (ctx.documentType) {
    case DocumentType.DONATION_RECEIPT:
      bodyContent = renderDonationReceiptBody(ctx);
      break;
    case DocumentType.MEMBER_ID:
      return renderMemberIdCardHtml(ctx);
    case DocumentType.EMPLOYEE_ID:
      return renderEmployeeIdCardHtml(ctx);
    case DocumentType.MEMBERSHIP_CERTIFICATE:
      return renderMembershipCertificateHtml(ctx);
    case DocumentType.VOLUNTEER_CERTIFICATE:
      return renderVolunteerCertificateHtml(ctx);
    case DocumentType.APPRECIATION_CERTIFICATE:
      return renderAppreciationCertificateHtml(ctx);
    case DocumentType.APPOINTMENT_LETTER:
      bodyContent = renderAppointmentLetterBody(ctx);
      break;
    case DocumentType.OFFER_LETTER:
      bodyContent = renderOfferLetterBody(ctx);
      break;
    case DocumentType.PAYSLIP:
      bodyContent = renderPayslipBody(ctx);
      break;
    case DocumentType.DONATION_STATEMENT:
      bodyContent = renderDonationStatementBody(ctx);
      break;
    case DocumentType.PROJECT_REPORT:
      bodyContent = renderProjectReportBody(ctx);
      break;
    case DocumentType.IMPACT_REPORT:
      bodyContent = renderImpactReportBody(ctx);
      break;
    default:
      bodyContent = renderGenericDocumentBody(ctx);
  }

  return wrapStandardDocumentHtml(ctx, bodyContent);
}

function wrapStandardDocumentHtml(ctx: DocumentRenderContext, bodyContent: string): string {
  const signatoriesHtml = ctx.signatories.map(s => `
    <div class="signatory-box">
      <div class="sign-line">${s.name}</div>
      <div class="signatory-name">${s.name}</div>
      <div class="signatory-title">${s.title}</div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${ctx.title} - ${ctx.documentNumber}</title>
  <style>${BASE_DOCUMENT_CSS}</style>
</head>
<body>
  <div class="doc-container">
    <div class="header-banner">
      <div>
        <div class="bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
        <div style="margin: 6px 0;">
          <img src="/branding/imam-e-mahdi-foundation-logo.png" alt="IMAM E MAHDI FOUNDATION" style="height: 46px; width: auto; object-fit: contain;" />
        </div>
        <div class="org-sub">Registered Non-Profit Section 8 Organization • CIN: U88900DC2026NPL474906</div>
      </div>
      <div class="doc-badge">
        <span class="doc-type-pill">${ctx.documentType.replace(/_/g, ' ')}</span>
        <div class="doc-number">${ctx.documentNumber}</div>
        <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Version ${ctx.templateVersion}</div>
      </div>
    </div>

    ${bodyContent}

    <div class="signatories-section">
      ${signatoriesHtml || `
        <div class="signatory-box">
          <div class="sign-line">Board of Trustees</div>
          <div class="signatory-name">General Secretary</div>
          <div class="signatory-title">Executive Governance</div>
        </div>
        <div class="signatory-box">
          <div class="sign-line">Authorized Signatory</div>
          <div class="signatory-name">Finance & Operations Officer</div>
          <div class="signatory-title">Financial Controller</div>
        </div>
      `}
    </div>

    <div class="security-footer">
      <div class="qr-box">
        ${ctx.qrCodeSvg}
      </div>
      <div class="security-meta">
        <div><strong>Official Cryptographic Security Stamp</strong> (Tamper-Evident HMAC-SHA256)</div>
        <div class="hash-code">${ctx.signatureHash}</div>
        <div>Verify instantly online: <a href="${ctx.qrVerificationUrl}" target="_blank" style="color:#064e3b; font-weight:600;">${ctx.qrVerificationUrl}</a></div>
        <div>Generated on ${ctx.generatedDate} • Valid Official Record of Imam E Mahdi Foundation DOS.</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// 1. DONATION RECEIPT
function renderDonationReceiptBody(ctx: DocumentRenderContext): string {
  const m = ctx.metadata;
  const is80GVerified = Boolean(m.is80GVerified);
  const title = is80GVerified ? 'Official 80G Tax Exemption Donation Receipt' : 'Official Donation & Acknowledgment Receipt';
  const totalRowLabel = is80GVerified
    ? 'TOTAL CONTRIBUTION RECEIVED (Eligible for Section 80G Deduction)'
    : 'TOTAL NOBLE CONTRIBUTION RECEIVED';
  const statutoryNotice = is80GVerified
    ? `<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; font-size: 12px; color: #166534; margin: 16px 0;">
        <strong>80G Statutory Exemption Declaration:</strong> Donations to Imam E Mahdi Foundation qualify for deduction under Section 80G(5)(vi) of the Income Tax Act, 1961. Unique Reference: <em>${m.taxExemptionNumber || 'VERIFIED'}</em>.
       </div>`
    : `<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 11px; color: #475569; margin: 16px 0;">
        <strong>Statutory Notice:</strong> Thank you for your noble charitable contribution to Imam E Mahdi Foundation (Section 8 Not-for-Profit). Section 80G income tax exemption approval is pending formal statutory verification and is NOT claimed or active on this receipt.
       </div>`;

  return `
    <h2 style="font-size: 18px; color: #064e3b; margin: 0 0 16px;">${title}</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Donor Name</div>
        <div class="info-value">${ctx.recipientName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Donor Email / Contact</div>
        <div class="info-value">${ctx.recipientEmail || m.donorPhone || 'N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Donor PAN / Tax ID</div>
        <div class="info-value">${m.donorPan || 'On Record / N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Receipt Date</div>
        <div class="info-value">${ctx.generatedDate}</div>
      </div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Fund Allocation</th>
          <th>Mode & Reference</th>
          <th style="text-align: right;">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Noble Charitable Donation</strong></td>
          <td>${m.fundType || 'General Charitable Fund'}</td>
          <td>${m.paymentMethod || 'Online Gateway'} (${m.transactionId || 'TXN-DIRECT'})</td>
          <td style="text-align: right; font-weight: bold;">₹${Number(m.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3">${totalRowLabel}</td>
          <td style="text-align: right;">₹${Number(m.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>

    ${statutoryNotice}
  `;
}

// 2. MEMBER ID CARD
function renderMemberIdCardHtml(ctx: DocumentRenderContext): string {
  const m = ctx.metadata;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Digital Member Card - ${ctx.documentNumber}</title>
  <style>
    ${BASE_DOCUMENT_CSS}
    .id-card {
      background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
      color: #ffffff;
      padding: 24px;
      border-radius: 16px;
      position: relative;
      overflow: hidden;
    }
    .id-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.2);
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .id-body {
      display: flex;
      gap: 20px;
      align-items: center;
    }
    .id-avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: #d97706;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      font-weight: 800;
      border: 3px solid #ffffff;
      flex-shrink: 0;
    }
    .id-qr {
      width: 72px;
      height: 72px;
      background: #ffffff;
      padding: 4px;
      border-radius: 8px;
      flex-shrink: 0;
    }
    .id-qr svg { width: 100%; height: 100%; }
    .gold-seal {
      color: #fbbf24;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="doc-card-container">
    <div class="id-card">
      <div class="id-header">
        <div>
          <div class="gold-seal">Imam E Mahdi Foundation</div>
          <div style="font-size: 16px; font-weight: 800;">Official Member Card</div>
        </div>
        <div style="text-align: right;">
          <span style="background: rgba(251,191,36,0.2); color: #fbbf24; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; border: 1px solid #fbbf24;">${m.membershipTier || 'LIFE MEMBER'}</span>
        </div>
      </div>
      
      <div class="id-body">
        <div class="id-avatar">
          ${ctx.recipientName.charAt(0)}
        </div>
        <div style="flex: 1;">
          <div style="font-size: 18px; font-weight: 800; line-height: 1.2;">${ctx.recipientName}</div>
          <div style="font-size: 12px; color: #a7f3d0; font-family: monospace; margin-top: 2px;">ID: ${ctx.documentNumber}</div>
          <div style="font-size: 11px; color: #cbd5e1; margin-top: 6px;">Valid: ${ctx.generatedDate} to ${ctx.expiresDate || 'Lifetime'}</div>
        </div>
        <div class="id-qr">
          ${ctx.qrCodeSvg}
        </div>
      </div>
    </div>
    <div style="padding: 16px; font-size: 11px; color: #64748b; text-align: center; background: #ffffff;">
      Official cryptographic credential. Scan QR or visit <a href="${ctx.qrVerificationUrl}" style="color: #064e3b; font-weight: bold;">${ctx.qrVerificationUrl}</a>
    </div>
  </div>
</body>
</html>`;
}

// 3. EMPLOYEE ID CARD
function renderEmployeeIdCardHtml(ctx: DocumentRenderContext): string {
  const m = ctx.metadata;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Staff Identity Card - ${ctx.documentNumber}</title>
  <style>
    ${BASE_DOCUMENT_CSS}
    .staff-card {
      background: #0f172a;
      color: #ffffff;
      padding: 24px;
      border-radius: 16px;
      border-top: 6px solid #059669;
    }
    .staff-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.15);
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .staff-qr {
      width: 76px;
      height: 76px;
      background: #ffffff;
      padding: 4px;
      border-radius: 8px;
    }
    .staff-qr svg { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div class="doc-card-container">
    <div class="staff-card">
      <div class="staff-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="/branding/imam-e-mahdi-mark.png" alt="IMAM E MAHDI FOUNDATION" style="height: 28px; width: 28px; object-fit: contain; background: #ffffff; padding: 2px; border-radius: 6px;" />
          <div>
            <div style="color: #34d399; font-size: 10px; font-weight: 800; text-transform: uppercase;">Imam E Mahdi Foundation</div>
            <div style="font-size: 14px; font-weight: 800;">Staff Identity Credential</div>
          </div>
        </div>
        <span style="background: rgba(52,211,153,0.2); color: #34d399; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 9999px;">OFFICIAL STAFF</span>
      </div>

      <div style="display: flex; gap: 16px; align-items: center;">
        <div style="width: 70px; height: 70px; border-radius: 12px; background: #064e3b; border: 2px solid #34d399; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #fff;">
          ${ctx.recipientName.charAt(0)}
        </div>
        <div style="flex: 1;">
          <div style="font-size: 17px; font-weight: 800;">${ctx.recipientName}</div>
          <div style="font-size: 12px; color: #6ee7b7; font-weight: 600;">${m.designation || 'Staff Officer'}</div>
          <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">EMP CODE: ${m.employeeCode || ctx.documentNumber}</div>
          <div style="font-size: 11px; color: #94a3b8;">Dept: ${m.department || 'Operations'} • Blood: ${m.bloodGroup || 'O+'}</div>
        </div>
        <div class="staff-qr">
          ${ctx.qrCodeSvg}
        </div>
      </div>
    </div>
    <div style="padding: 14px; font-size: 11px; color: #64748b; text-align: center; background: #ffffff;">
      Property of IMF-DOS. If found, return to HQ. Scan to verify credentials.
    </div>
  </div>
</body>
</html>`;
}

// 4. MEMBERSHIP CERTIFICATE
function renderMembershipCertificateHtml(ctx: DocumentRenderContext): string {
  const m = ctx.metadata;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Certificate of Membership - ${ctx.documentNumber}</title>
  <style>
    ${BASE_DOCUMENT_CSS}
    .cert-frame {
      max-width: 860px;
      margin: 32px auto;
      background: #ffffff;
      padding: 60px 48px;
      border: 12px solid #064e3b;
      outline: 3px solid #d97706;
      border-radius: 8px;
      text-align: center;
      position: relative;
      box-shadow: 0 15px 40px rgba(0,0,0,0.1);
    }
    .cert-seal {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #064e3b;
      color: #fbbf24;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 900;
      border: 3px double #fbbf24;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="cert-frame">
    <div class="bismillah" style="font-size: 16px; margin-bottom: 12px;">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
    <div style="margin-bottom: 16px;">
      <img src="/branding/imam-e-mahdi-foundation-logo.png" alt="IMAM E MAHDI FOUNDATION" style="height: 56px; width: auto; object-fit: contain; margin: 0 auto;" />
    </div>
    <h1 style="font-family: 'Cinzel', serif; font-size: 28px; color: #064e3b; margin: 0 0 8px; letter-spacing: 2px;">Certificate of Membership</h1>
    <div style="font-size: 12px; font-weight: 700; color: #d97706; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 24px;">Imam E Mahdi Foundation • Digital Operating System</div>

    <p style="font-size: 15px; color: #64748b; font-style: italic; margin-bottom: 8px;">This is to officially certify that</p>
    <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin: 0 0 12px; border-bottom: 2px solid #e2e8f0; display: inline-block; padding-bottom: 6px;">${ctx.recipientName}</h2>
    
    <p style="max-width: 600px; margin: 16px auto; font-size: 15px; line-height: 1.7; color: #334155;">
      has been formally admitted and recognized as an honorable <strong>${m.membershipTier || 'Annual General'} Member</strong> of the Imam E Mahdi Foundation with Membership Serial <strong>${ctx.documentNumber}</strong>.
    </p>

    <div class="signatories-section" style="margin-top: 48px;">
      <div class="signatory-box">
        <div class="sign-line">Syed Kazim Naqvi</div>
        <div class="signatory-name">President & Trustee</div>
        <div class="signatory-title">Governing Council</div>
      </div>
      <div style="width: 90px; height: 90px; margin: 0 auto;">
        ${ctx.qrCodeSvg}
      </div>
      <div class="signatory-box">
        <div class="sign-line">Dr. Hasan Raza</div>
        <div class="signatory-name">Executive Director</div>
        <div class="signatory-title">General Administration</div>
      </div>
    </div>

    <div style="margin-top: 32px; font-size: 11px; color: #94a3b8; font-family: monospace;">
      Verification Hash: ${ctx.signatureHash.slice(0, 32)} • Issued: ${ctx.generatedDate}
    </div>
  </div>
</body>
</html>`;
}

// 5. VOLUNTEER SERVICE CERTIFICATE
function renderVolunteerCertificateHtml(ctx: DocumentRenderContext): string {
  const m = ctx.metadata;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Volunteer Service Award - ${ctx.documentNumber}</title>
  <style>
    ${BASE_DOCUMENT_CSS}
    .vol-frame {
      max-width: 860px;
      margin: 32px auto;
      background: #ffffff;
      padding: 60px 48px;
      border: 12px solid #0f766e;
      outline: 3px solid #fbbf24;
      border-radius: 8px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="vol-frame">
    <div class="bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
    <div style="margin: 12px 0;">
      <img src="/branding/imam-e-mahdi-foundation-logo.png" alt="IMAM E MAHDI FOUNDATION" style="height: 54px; width: auto; object-fit: contain; margin: 0 auto;" />
    </div>
    <h1 style="font-family: 'Cinzel', serif; font-size: 28px; color: #0f766e; margin: 12px 0 6px;">Certificate of Distinguished Service</h1>
    <div style="font-size: 12px; font-weight: 700; color: #d97706; text-transform: uppercase; letter-spacing: 2px;">Imam E Mahdi Humanitarian Relief Operations</div>

    <p style="font-size: 15px; color: #64748b; font-style: italic; margin-top: 24px;">Presented with gratitude to</p>
    <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin: 4px 0 16px;">${ctx.recipientName}</h2>
    
    <p style="max-width: 620px; margin: 0 auto; font-size: 15px; line-height: 1.7; color: #334155;">
      In profound recognition of <strong>${m.totalHours || '50'} verified service hours</strong> rendered with exemplary dedication, compassion, and leadership towards community welfare and humanitarian outreach.
    </p>

    <div class="signatories-section" style="margin-top: 48px;">
      <div class="signatory-box">
        <div class="sign-line">Director of Field Ops</div>
        <div class="signatory-name">Volunteer Operations</div>
      </div>
      <div style="width: 90px; height: 90px; margin: 0 auto;">
        ${ctx.qrCodeSvg}
      </div>
      <div class="signatory-box">
        <div class="sign-line">Chairman of the Board</div>
        <div class="signatory-name">Imam E Mahdi Foundation</div>
      </div>
    </div>
    <div style="margin-top: 28px; font-size: 11px; color: #94a3b8; font-family: monospace;">Serial: ${ctx.documentNumber} • Date: ${ctx.generatedDate}</div>
  </div>
</body>
</html>`;
}

// 6. APPRECIATION CERTIFICATE
function renderAppreciationCertificateHtml(ctx: DocumentRenderContext): string {
  const m = ctx.metadata;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Certificate of Appreciation - ${ctx.documentNumber}</title>
  <style>
    ${BASE_DOCUMENT_CSS}
    .appr-frame {
      max-width: 860px;
      margin: 32px auto;
      background: #ffffff;
      padding: 60px 48px;
      border: 12px solid #b45309;
      outline: 3px solid #064e3b;
      border-radius: 8px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="appr-frame">
    <div class="bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
    <div style="margin: 12px 0;">
      <img src="/branding/imam-e-mahdi-foundation-logo.png" alt="IMAM E MAHDI FOUNDATION" style="height: 54px; width: auto; object-fit: contain; margin: 0 auto;" />
    </div>
    <h1 style="font-family: 'Cinzel', serif; font-size: 28px; color: #b45309; margin: 12px 0 6px;">Certificate of Appreciation</h1>
    <div style="font-size: 12px; font-weight: 700; color: #064e3b; text-transform: uppercase; letter-spacing: 2px;">Imam E Mahdi Foundation • Humanitarian Honors</div>

    <p style="font-size: 15px; color: #64748b; font-style: italic; margin-top: 24px;">Honoring the Outstanding Philanthropy & Partnership of</p>
    <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin: 4px 0 16px;">${ctx.recipientName}</h2>
    
    <p style="max-width: 620px; margin: 0 auto; font-size: 15px; line-height: 1.7; color: #334155;">
      ${m.citation || 'For exemplary generosity, continuous commitment to uplifting marginalized families, and noble dedication towards community development.'}
    </p>

    <div class="signatories-section" style="margin-top: 48px;">
      <div class="signatory-box">
        <div class="sign-line">Board of Trustees</div>
        <div class="signatory-name">Executive Trustee</div>
      </div>
      <div style="width: 90px; height: 90px; margin: 0 auto;">
        ${ctx.qrCodeSvg}
      </div>
      <div class="signatory-box">
        <div class="sign-line">Patron & Scholar</div>
        <div class="signatory-name">Advisory Council</div>
      </div>
    </div>
    <div style="margin-top: 28px; font-size: 11px; color: #94a3b8; font-family: monospace;">Certificate: ${ctx.documentNumber} • ${ctx.generatedDate}</div>
  </div>
</body>
</html>`;
}

// 7. APPOINTMENT LETTER
function renderAppointmentLetterBody(ctx: DocumentRenderContext): string {
  const m = ctx.metadata;
  return `
    <h2 style="font-size: 18px; color: #064e3b; margin: 0 0 16px;">Letter of Appointment</h2>
    <p>Date: <strong>${ctx.generatedDate}</strong></p>
    <p>To: <strong>${ctx.recipientName}</strong><br/>
    Address: ${m.address || 'On File'}</p>

    <p>Dear <strong>${ctx.recipientName}</strong>,</p>
    <p>We are pleased to appoint you to the position of <strong>${m.designation || 'Staff Member'}</strong> in the <strong>${m.department || 'Operations'}</strong> department with <strong>Imam E Mahdi Foundation</strong>, effective from <strong>${m.joiningDate || ctx.generatedDate}</strong>.</p>
    
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Employee Code</div><div class="info-value">${m.employeeCode || ctx.documentNumber}</div></div>
      <div class="info-item"><div class="info-label">Designation</div><div class="info-value">${m.designation || 'Specialist'}</div></div>
      <div class="info-item"><div class="info-label">Monthly Gross Salary</div><div class="info-value">₹${Number(m.monthlyGross || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div></div>
      <div class="info-item"><div class="info-label">Probation Period</div><div class="info-value">${m.probationMonths || '6'} Months</div></div>
    </div>

    <h3 style="font-size: 14px; color: #064e3b; margin-top: 20px;">Terms of Employment:</h3>
    <ul style="font-size: 13px; line-height: 1.7; color: #334155; padding-left: 20px;">
      <li><strong>Duties & Responsibilities:</strong> You will perform assigned programmatic and statutory functions with utmost integrity.</li>
      <li><strong>Code of Conduct:</strong> You agree to abide by the non-profit bylaws, child protection, and whistle-blower policies of the Foundation.</li>
      <li><strong>Termination & Notice:</strong> Notice period is 30 days during probation and 60 days following confirmation.</li>
    </ul>
  `;
}

// 8. OFFER LETTER
function renderOfferLetterBody(ctx: DocumentRenderContext): string {
  const m = ctx.metadata;
  return `
    <h2 style="font-size: 18px; color: #064e3b; margin: 0 0 16px;">Formal Employment Offer</h2>
    <p>Date: <strong>${ctx.generatedDate}</strong> | Offer Expiry: <strong style="color:#dc2626;">${ctx.expiresDate || '7 days from issue'}</strong></p>
    
    <p>Dear <strong>${ctx.recipientName}</strong>,</p>
    <p>We are delighted to extend an offer of employment for the role of <strong>${m.designation || 'Associate'}</strong> within the <strong>${m.department || 'General Administration'}</strong> department at Imam E Mahdi Foundation.</p>

    <div class="info-grid">
      <div class="info-item"><div class="info-label">Offered Role</div><div class="info-value">${m.designation || 'Associate'}</div></div>
      <div class="info-item"><div class="info-label">Annual CTC</div><div class="info-value">₹${Number(m.annualCTC || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div></div>
      <div class="info-item"><div class="info-label">Monthly Gross</div><div class="info-value">₹${Number(m.monthlyGross || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div></div>
      <div class="info-item"><div class="info-label">Target Joining Date</div><div class="info-value">${m.joiningDate || 'Immediate'}</div></div>
    </div>

    <p style="font-size: 13px; color: #475569;">Please sign and return the duplicate copy of this letter on or before the offer expiry date to confirm your acceptance.</p>
  `;
}

// 9. PAYSLIP
function renderPayslipBody(ctx: DocumentRenderContext): string {
  const m = ctx.metadata;
  const earnings = m.earnings || [
    { label: 'Basic Salary', amount: Number(m.basicSalary || (m.grossSalary ? m.grossSalary * 0.5 : 25000)) },
    { label: 'House Rent Allowance (HRA)', amount: Number(m.hra || (m.grossSalary ? m.grossSalary * 0.3 : 15000)) },
    { label: 'Special / Project Allowance', amount: Number(m.allowances || (m.grossSalary ? m.grossSalary * 0.2 : 10000)) },
  ];
  const deductions = m.deductions || [
    { label: 'Provident Fund (EPF)', amount: Number(m.pfDeduction || 1800) },
    { label: 'Professional Tax (PT)', amount: Number(m.ptDeduction || 200) },
    { label: 'Income Tax (TDS)', amount: Number(m.tdsDeduction || 1500) },
  ];

  const totalEarnings = earnings.reduce((acc: number, item: any) => acc + Number(item.amount), 0);
  const totalDeductions = deductions.reduce((acc: number, item: any) => acc + Number(item.amount), 0);
  const netPay = totalEarnings - totalDeductions;

  return `
    <h2 style="font-size: 18px; color: #064e3b; margin: 0 0 16px;">Salary Statement / Payslip for ${m.payPeriod || 'Current Month'}</h2>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Employee Name</div><div class="info-value">${ctx.recipientName}</div></div>
      <div class="info-item"><div class="info-label">Employee ID</div><div class="info-value">${m.employeeCode || 'IMF-EMP-001'}</div></div>
      <div class="info-item"><div class="info-label">Designation</div><div class="info-value">${m.designation || 'Staff'}</div></div>
      <div class="info-item"><div class="info-label">Bank Account & UTR</div><div class="info-value">${m.bankAccountNumber || '****1234'} (${m.paymentRef || 'NEFT'})</div></div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div>
        <h4 style="color: #064e3b; margin: 0 0 8px; font-size: 13px;">Earnings (INR)</h4>
        <table class="data-table" style="margin: 0;">
          <tbody>
            ${earnings.map((e: any) => `<tr><td>${e.label}</td><td style="text-align:right;">₹${Number(e.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>`).join('')}
            <tr class="total-row"><td>Gross Earnings</td><td style="text-align:right;">₹${totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
          </tbody>
        </table>
      </div>
      <div>
        <h4 style="color: #991b1b; margin: 0 0 8px; font-size: 13px;">Deductions (INR)</h4>
        <table class="data-table" style="margin: 0;">
          <tbody>
            ${deductions.map((d: any) => `<tr><td>${d.label}</td><td style="text-align:right;">₹${Number(d.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>`).join('')}
            <tr class="total-row" style="background:#fee2e2 !important; color:#991b1b;"><td style="color:#991b1b;">Total Deductions</td><td style="text-align:right;">₹${totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div style="background: #ecfdf5; border: 2px solid #064e3b; border-radius: 8px; padding: 16px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 12px; color: #064e3b; font-weight: bold; text-transform: uppercase;">Net Amount Transferred</div>
        <div style="font-size: 11px; color: #64748b;">Direct Bank Credit via RBI NEFT/RTGS</div>
      </div>
      <div style="font-size: 22px; font-weight: 800; color: #064e3b;">₹${netPay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
    </div>
  `;
}

// 10. DONATION STATEMENT
function renderDonationStatementBody(ctx: DocumentRenderContext): string {
  const m = ctx.metadata;
  const donations = m.donations || [
    { date: '2025-05-10', receiptNo: 'IMF-REC-2025-010', fund: 'Zakat al-Mal', amount: 25000 },
    { date: '2025-09-18', receiptNo: 'IMF-REC-2025-088', fund: 'Orphan Sponsorship', amount: 15000 },
    { date: '2026-01-05', receiptNo: 'IMF-REC-2026-004', fund: 'Winter Relief', amount: 20000 },
  ];
  const totalAmount = donations.reduce((sum: number, d: any) => sum + Number(d.amount), 0);

  const is80GVerified = Boolean(m.is80GVerified);
  const statementTitle = is80GVerified
    ? `Annual 80G Contribution & Tax Statement (FY ${m.fiscalYear || '2025-26'})`
    : `Annual Donor Contribution & Acknowledgment Statement (FY ${m.fiscalYear || '2025-26'})`;
  const totalRowLabel = is80GVerified
    ? 'CUMULATIVE ANNUAL 80G TAX-DEDUCTIBLE DONATION'
    : 'CUMULATIVE ANNUAL DONATION TOTAL (INR)';

  return `
    <h2 style="font-size: 18px; color: #064e3b; margin: 0 0 16px;">${statementTitle}</h2>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Donor Name</div><div class="info-value">${ctx.recipientName}</div></div>
      <div class="info-item"><div class="info-label">Donor PAN</div><div class="info-value">${m.donorPan || 'On File'}</div></div>
      <div class="info-item"><div class="info-label">Statement Period</div><div class="info-value">01 Apr ${m.fiscalYear ? m.fiscalYear.split('-')[0] : '2025'} - 31 Mar ${m.fiscalYear ? '20' + m.fiscalYear.split('-')[1] : '2026'}</div></div>
      <div class="info-item"><div class="info-label">Total Transactions</div><div class="info-value">${donations.length} Contributions</div></div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Receipt Number</th>
          <th>Cause / Fund</th>
          <th style="text-align: right;">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        ${donations.map((d: any) => `
          <tr>
            <td>${d.date}</td>
            <td><code>${d.receiptNo}</code></td>
            <td>${d.fund}</td>
            <td style="text-align: right;">₹${Number(d.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="3">${totalRowLabel}</td>
          <td style="text-align: right;">₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 16px; padding: 12px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px; color: #475569; line-height: 1.6;">
      ${is80GVerified
        ? `<strong>80G Statutory Tax Exemption:</strong> Donations qualify for deduction under Section 80G of the Income Tax Act, 1961. Unique Reference: ${m.taxExemptionNumber || 'VERIFIED'}.`
        : `<strong>Statutory Disclosure:</strong> Official donation summary issued by Imam E Mahdi Foundation (Section 8 Not-for-Profit, CIN: U88900DC2026NPL474906). Section 80G income tax exemption approval is pending formal statutory verification and is NOT active or claimed on this summary.`
      }
    </div>
  `;
}

// 11. PROJECT REPORT
function renderProjectReportBody(ctx: DocumentRenderContext): string {
  const m = ctx.metadata;
  return `
    <h2 style="font-size: 18px; color: #064e3b; margin: 0 0 16px;">Executive Project Progress Report: ${m.projectName || 'Humanitarian Initiative'}</h2>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Project Code</div><div class="info-value">${m.projectCode || 'IMF-PRJ-01'}</div></div>
      <div class="info-item"><div class="info-label">Project Status</div><div class="info-value">${m.status || 'ACTIVE / ON TRACK'}</div></div>
      <div class="info-item"><div class="info-label">Allocated Budget</div><div class="info-value">₹${Number(m.budgetAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div></div>
      <div class="info-item"><div class="info-label">Beneficiaries Reached</div><div class="info-value">${m.beneficiariesCount || '1,200 Families'}</div></div>
      <div class="info-item"><div class="info-label">Presented To</div><div class="info-value">${ctx.recipientName}</div></div>
      <div class="info-item"><div class="info-label">Report Date</div><div class="info-value">${ctx.generatedDate}</div></div>
    </div>

    <h3 style="font-size: 14px; color: #064e3b;">Project Highlights & Key Milestones</h3>
    <p style="font-size: 13px; line-height: 1.7; color: #334155;">
      ${m.summary || 'Project execution is proceeding according to the authorized Sharia and governance guidelines with 100% field audit trails.'}
    </p>
  `;
}

// 12. IMPACT REPORT
function renderImpactReportBody(ctx: DocumentRenderContext): string {
  const m = ctx.metadata;
  return `
    <h2 style="font-size: 18px; color: #064e3b; margin: 0 0 16px;">Social Impact & Transparency Report (${m.period || 'Annual 2026'})</h2>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Total Aid Disbursed</div><div class="info-value">₹${Number(m.totalDisbursed || 5000000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div></div>
      <div class="info-item"><div class="info-label">Individuals Impacted</div><div class="info-value">${m.livesImpacted || '15,400+'}</div></div>
      <div class="info-item"><div class="info-label">Active Field Volunteers</div><div class="info-value">${m.volunteersCount || '450+'}</div></div>
      <div class="info-item"><div class="info-label">Charitable Efficiency</div><div class="info-value">${m.efficiencyPct || '95.4%'}</div></div>
      <div class="info-item"><div class="info-label">Audience / Governance</div><div class="info-value">${ctx.recipientName}</div></div>
      <div class="info-item"><div class="info-label">Published Date</div><div class="info-value">${ctx.generatedDate}</div></div>
    </div>

    <h3 style="font-size: 14px; color: #064e3b;">Impact Breakdown by Sector</h3>
    <table class="data-table">
      <thead>
        <tr><th>Program Sector</th><th>Beneficiary Count</th><th style="text-align: right;">Aid Amount (INR)</th></tr>
      </thead>
      <tbody>
        <tr><td>Healthcare & Medical Grants</td><td>4,200 Patients</td><td style="text-align:right;">₹18,50,000.00</td></tr>
        <tr><td>Ration & Food Security</td><td>8,100 Families</td><td style="text-align:right;">₹21,00,000.00</td></tr>
        <tr><td>Education & Orphan Scholarships</td><td>3,100 Students</td><td style="text-align:right;">₹10,50,000.00</td></tr>
      </tbody>
    </table>
  `;
}

function renderGenericDocumentBody(ctx: DocumentRenderContext): string {
  return `
    <h2 style="font-size: 18px; color: #064e3b; margin: 0 0 16px;">${ctx.title}</h2>
    <p>Issued to: <strong>${ctx.recipientName}</strong></p>
    <div style="padding: 16px; background: #f8fafc; border-radius: 8px; font-size: 13px; line-height: 1.6; color: #334155;">
      ${ctx.metadata.description || 'This is an official document generated by the Imam E Mahdi Foundation Centralized Document Engine.'}
    </div>
  `;
}
