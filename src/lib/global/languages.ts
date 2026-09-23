import { LanguageDefinition } from './types';

export const SUPPORTED_LANGUAGES: Record<string, LanguageDefinition> = {
  // --- 1. Global Standard ---
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    isRtl: false,
    isIndic: false,
    localeCode: 'en-IN',
  },

  // --- 2. Indic Official & Regional Languages ---
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr',
    isRtl: false,
    isIndic: true,
    localeCode: 'hi-IN',
  },
  ur: {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    direction: 'rtl',
    isRtl: true,
    isIndic: true,
    localeCode: 'ur-IN',
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    direction: 'ltr',
    isRtl: false,
    isIndic: true,
    localeCode: 'bn-IN',
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    direction: 'ltr',
    isRtl: false,
    isIndic: true,
    localeCode: 'ta-IN',
  },
  te: {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    direction: 'ltr',
    isRtl: false,
    isIndic: true,
    localeCode: 'te-IN',
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    direction: 'ltr',
    isRtl: false,
    isIndic: true,
    localeCode: 'mr-IN',
  },
  gu: {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    direction: 'ltr',
    isRtl: false,
    isIndic: true,
    localeCode: 'gu-IN',
  },
  pa: {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    direction: 'ltr',
    isRtl: false,
    isIndic: true,
    localeCode: 'pa-IN',
  },
  kn: {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    direction: 'ltr',
    isRtl: false,
    isIndic: true,
    localeCode: 'kn-IN',
  },
  ml: {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    direction: 'ltr',
    isRtl: false,
    isIndic: true,
    localeCode: 'ml-IN',
  },
  or: {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    direction: 'ltr',
    isRtl: false,
    isIndic: true,
    localeCode: 'or-IN',
  },
  as: {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    direction: 'ltr',
    isRtl: false,
    isIndic: true,
    localeCode: 'as-IN',
  },

  // --- 3. Extensible International Languages ---
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    isRtl: true,
    isIndic: false,
    localeCode: 'ar-SA',
  },
  fa: {
    code: 'fa',
    name: 'Persian',
    nativeName: 'فارسی',
    direction: 'rtl',
    isRtl: true,
    isIndic: false,
    localeCode: 'fa-IR',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    isRtl: false,
    isIndic: false,
    localeCode: 'fr-FR',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    isRtl: false,
    isIndic: false,
    localeCode: 'de-DE',
  },
  tr: {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    direction: 'ltr',
    isRtl: false,
    isIndic: false,
    localeCode: 'tr-TR',
  },
  id: {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    direction: 'ltr',
    isRtl: false,
    isIndic: false,
    localeCode: 'id-ID',
  },
  sw: {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    direction: 'ltr',
    isRtl: false,
    isIndic: false,
    localeCode: 'sw-KE',
  },
};

export class LanguageRegistry {
  public static getAllLanguages(): LanguageDefinition[] {
    return Object.values(SUPPORTED_LANGUAGES);
  }

  public static getLanguage(code?: string): LanguageDefinition {
    if (!code) return SUPPORTED_LANGUAGES.en;
    const normalized = code.toLowerCase().split('-')[0];
    return SUPPORTED_LANGUAGES[normalized] || SUPPORTED_LANGUAGES.en;
  }

  public static isRtl(code?: string): boolean {
    return this.getLanguage(code).isRtl;
  }

  public static getDirection(code?: string): 'ltr' | 'rtl' {
    return this.getLanguage(code).direction;
  }

  public static getIndicLanguages(): LanguageDefinition[] {
    return Object.values(SUPPORTED_LANGUAGES).filter((l) => l.isIndic);
  }

  public static getInternationalLanguages(): LanguageDefinition[] {
    return Object.values(SUPPORTED_LANGUAGES).filter((l) => !l.isIndic && l.code !== 'en');
  }
}
