import { AiSafetyDomain, AiTaskType } from './types';

export interface SanitizationResult {
  sanitizedText: string;
  hasRedactions: boolean;
  redactedCounts: {
    emails: number;
    phones: number;
    panNumbers: number;
    aadhaarNumbers: number;
    bankAccounts: number;
    paymentCards: number;
  };
}

export class AiSanitizer {
  // Regex matchers for Indian & international PII patterns
  private static readonly EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  private static readonly CARD_REGEX = /\b(?:\d{4}[ -]?){3}\d{4}\b|\b\d{15,16}\b/g;
  private static readonly AADHAAR_REGEX = /\b[2-9]{1}[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}(?!\s?[0-9]{2,4})\b/g;
  private static readonly PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g;
  private static readonly PHONE_REGEX = /(?:\+?91[\s-]?)?[6-9]\d{9}\b|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  private static readonly BANK_ACC_REGEX = /\b(?:A\/C|ACCT|ACCOUNT|AC)[\s#:]*([0-9]{9,18})\b/gi;

  /**
   * Sanitizes a text string by masking all detected PII entities.
   */
  public static sanitizePrompt(text: string): SanitizationResult {
    if (!text) {
      return {
        sanitizedText: '',
        hasRedactions: false,
        redactedCounts: {
          emails: 0,
          phones: 0,
          panNumbers: 0,
          aadhaarNumbers: 0,
          bankAccounts: 0,
          paymentCards: 0,
        },
      };
    }

    let sanitized = text;
    let emailCount = 0;
    let phoneCount = 0;
    let panCount = 0;
    let aadhaarCount = 0;
    let bankCount = 0;
    let cardCount = 0;

    // 1. Redact Bank Account patterns
    sanitized = sanitized.replace(this.BANK_ACC_REGEX, () => {
      bankCount++;
      return '[REDACTED_BANK_ACCOUNT]';
    });

    // 2. Redact Payment Cards (Runs before Aadhaar to avoid partial matches on 16-digit cards)
    sanitized = sanitized.replace(this.CARD_REGEX, () => {
      cardCount++;
      return '[REDACTED_PAYMENT_CARD]';
    });

    // 3. Redact PAN Cards
    sanitized = sanitized.replace(this.PAN_REGEX, () => {
      panCount++;
      return '[REDACTED_PAN]';
    });

    // 4. Redact Aadhaar Cards
    sanitized = sanitized.replace(this.AADHAAR_REGEX, () => {
      aadhaarCount++;
      return '[REDACTED_AADHAAR]';
    });

    // 5. Redact Emails
    sanitized = sanitized.replace(this.EMAIL_REGEX, () => {
      emailCount++;
      return '[REDACTED_EMAIL]';
    });

    // 6. Redact Phones
    sanitized = sanitized.replace(this.PHONE_REGEX, () => {
      phoneCount++;
      return '[REDACTED_PHONE]';
    });

    const totalRedactions = emailCount + phoneCount + panCount + aadhaarCount + bankCount + cardCount;

    return {
      sanitizedText: sanitized,
      hasRedactions: totalRedactions > 0,
      redactedCounts: {
        emails: emailCount,
        phones: phoneCount,
        panNumbers: panCount,
        aadhaarNumbers: aadhaarCount,
        bankAccounts: bankCount,
        paymentCards: cardCount,
      },
    };
  }

  /**
   * Automatically detects the safety domain based on task type and content keywords.
   * Ensures sensitive legal, financial, compliance, and regulatory content is flagged.
   */
  public static detectSafetyDomain(prompt: string, taskType: AiTaskType): AiSafetyDomain {
    const lower = (prompt || '').toLowerCase();

    // High-priority Legal keywords
    const legalKeywords = [
      'agreement', 'contract', 'mou', 'memorandum of understanding', 'affidavit',
      'board resolution', 'power of attorney', 'litigation', 'court', 'indemnity',
      'legal notice', 'dispute', 'moa', 'aoa', 'bylaws', 'articles of association'
    ];
    if (legalKeywords.some((kw) => lower.includes(kw))) {
      return AiSafetyDomain.LEGAL;
    }

    // High-priority Compliance keywords
    const complianceKeywords = [
      'fcra', '80g', '12a', '10bd', 'darpan', 'ngo darpan', 'form 10a',
      'csr registration', 'csr-1', 'mca filing', 'annual return', 'statutory filing',
      'roc filing', 'compliance certificate', 'epf', 'esic'
    ];
    if (complianceKeywords.some((kw) => lower.includes(kw))) {
      return AiSafetyDomain.COMPLIANCE;
    }

    // High-priority Regulatory keywords
    const regulatoryKeywords = [
      'mha', 'home ministry', 'income tax department', 'ministry of corporate affairs',
      'sub-registrar', 'charity commissioner', 'regulatory body', 'government audit',
      'statutory regulator'
    ];
    if (regulatoryKeywords.some((kw) => lower.includes(kw))) {
      return AiSafetyDomain.REGULATORY;
    }

    // High-priority Financial keywords
    const financialKeywords = [
      'balance sheet', 'profit and loss', 'income and expenditure', 'statutory audit',
      'tax deduction', 'tds', 'form 16a', 'bank statement', 'payroll reconciliation',
      'ledger', 'journal entry', 'chart of accounts', 'audit opinion'
    ];
    if (financialKeywords.some((kw) => lower.includes(kw))) {
      return AiSafetyDomain.FINANCIAL;
    }

    // Fallback to task-type default safety domains
    if (taskType === AiTaskType.DATA_INSIGHTS || taskType === AiTaskType.DASHBOARD_EXPLANATION) {
      return AiSafetyDomain.FINANCIAL;
    }

    return AiSafetyDomain.GENERAL_PUBLIC;
  }

  /**
   * Determines if the domain requires mandatory Human-in-the-Loop review and approval.
   * Enforces rule: Legal, Financial, Compliance, Regulatory MUST NEVER be published directly.
   */
  public static isApprovalMandatory(domain: AiSafetyDomain): boolean {
    return (
      domain === AiSafetyDomain.LEGAL ||
      domain === AiSafetyDomain.FINANCIAL ||
      domain === AiSafetyDomain.COMPLIANCE ||
      domain === AiSafetyDomain.REGULATORY
    );
  }
}
