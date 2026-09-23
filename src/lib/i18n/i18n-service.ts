import { dictionaryEn } from './dictionaries/en';
import { dictionaryUr } from './dictionaries/ur';
import { dictionaryHi } from './dictionaries/hi';
import { dictionaryAr } from './dictionaries/ar';
import { LanguageRegistry } from '../global/languages';

const DICTIONARIES: Record<string, any> = {
  en: dictionaryEn,
  ur: dictionaryUr,
  hi: dictionaryHi,
  ar: dictionaryAr,
};

export class I18nService {
  /**
   * Translates a key path (e.g. 'common.welcome') into the target language with fallback to English.
   */
  public static t(
    key: string,
    langCode: string = 'en',
    params?: Record<string, string | number>
  ): string {
    const normLang = langCode.toLowerCase().split('-')[0];
    const dict = DICTIONARIES[normLang] || DICTIONARIES.en;

    const parts = key.split('.');
    let value = dict;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        value = undefined;
        break;
      }
    }

    // Fallback to English dictionary if key wasn't found in target language
    if (value === undefined && normLang !== 'en') {
      let fallbackVal = DICTIONARIES.en;
      for (const part of parts) {
        if (fallbackVal && typeof fallbackVal === 'object' && part in fallbackVal) {
          fallbackVal = fallbackVal[part];
        } else {
          fallbackVal = undefined;
          break;
        }
      }
      value = fallbackVal;
    }

    if (typeof value !== 'string') {
      return key; // Return raw key if not found
    }

    // Parameter interpolation: {name} -> 'Ali'
    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
        return params[paramKey] !== undefined ? String(params[paramKey]) : `{${paramKey}}`;
      });
    }

    return value;
  }

  /**
   * Returns metadata for the specified language code including direction and script details.
   */
  public static getLanguageDetails(langCode: string) {
    return LanguageRegistry.getLanguage(langCode);
  }

  /**
   * Detects whether the current language should render in RTL (Right-to-Left) mode.
   */
  public static isRtl(langCode: string): boolean {
    return LanguageRegistry.isRtl(langCode);
  }
}
