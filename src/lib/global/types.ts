export type TextDirection = 'ltr' | 'rtl';

export type NumberingSystem = 'INDIAN_LAKH_CRORE' | 'INTERNATIONAL_MILLION_BILLION';

export type CurrencySymbolPlacement = 'BEFORE' | 'AFTER';

export interface LanguageDefinition {
  code: string; // e.g. "en", "hi", "ur", "bn", "ta", "ar"
  name: string; // English name
  nativeName: string; // Name in its own script
  direction: TextDirection;
  fontFamilyFamily?: string;
  isRtl: boolean;
  isIndic?: boolean;
  localeCode: string; // BCP 47 (e.g. "en-IN", "ur-PK", "ar-SA")
}

export interface CurrencyDefinition {
  code: string; // ISO 4217 (e.g. "INR", "USD", "GBP", "AED")
  name: string;
  symbol: string;
  symbolPlacement: CurrencySymbolPlacement;
  decimalPlaces: number;
  subunitName: string; // e.g. "Paisa", "Cent", "Pence", "Fils", "Halala"
  subunitToUnit: number; // e.g. 100 or 1000
  flagEmoji?: string;
}

export interface CountryTaxScheme {
  schemeName: string; // "SECTION_80G", "GIFT_AID", "IRS_501C3", "ZAKAT_DEDUCTION"
  schemeLabel: string; // e.g. "Section 80G Tax Exemption (India)", "UK Gift Aid (25% Reclaim)"
  taxIdLabel: string; // "PAN Card Number", "National Insurance No (NINO)", "SSN / EIN"
  taxIdPlaceholder: string;
  taxIdRegex?: string;
  deductionPercentageText: string; // "50% under Sec 80G", "25% Top-up", "100% Deductible"
  isReceiptEligible: boolean;
  statutoryDisclaimer: string;
}

export interface CountryConfiguration {
  code: string; // ISO 3166-1 alpha-2 (e.g. "IN", "GB", "US", "AE", "SA")
  name: string;
  callingCode: string; // e.g. "+91", "+44", "+1", "+971"
  flagEmoji: string;
  
  defaultCurrency: string;
  supportedCurrencies: string[];
  
  defaultLanguage: string;
  supportedLanguages: string[];
  
  defaultTimezone: string;
  supportedTimezones: string[];
  
  // Formatting Configuration
  numberingSystem: NumberingSystem;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'DD.MM.YYYY';
  timeFormat: '12h' | '24h';
  decimalSeparator: '.' | ',';
  thousandSeparator: ',' | '.' | ' ';
  
  // Payment Gateway Routing
  preferredPaymentProviders: string[]; // ["RAZORPAY", "STRIPE", "PAYPAL", "CASHFREE"]
  
  // Tax & Compliance
  taxScheme?: CountryTaxScheme;
  foreignDonationRestricted: boolean;
  fcraReportingRequired?: boolean;
}

export interface FormatOptions {
  locale?: string;
  currency?: string;
  countryCode?: string;
  includeSymbol?: boolean;
  decimals?: number;
  numberingSystem?: NumberingSystem;
  timeZone?: string;
}

export interface ExchangeRate {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  effectiveDate: string;
  source: string;
}
