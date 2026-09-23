import { CurrencyDefinition, ExchangeRate } from './types';

export const SUPPORTED_CURRENCIES: Record<string, CurrencyDefinition> = {
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    symbolPlacement: 'BEFORE',
    decimalPlaces: 2,
    subunitName: 'Paisa',
    subunitToUnit: 100,
    flagEmoji: '🇮🇳',
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    symbolPlacement: 'BEFORE',
    decimalPlaces: 2,
    subunitName: 'Cent',
    subunitToUnit: 100,
    flagEmoji: '🇺🇸',
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound Sterling',
    symbol: '£',
    symbolPlacement: 'BEFORE',
    decimalPlaces: 2,
    subunitName: 'Pence',
    subunitToUnit: 100,
    flagEmoji: '🇬🇧',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    symbolPlacement: 'BEFORE',
    decimalPlaces: 2,
    subunitName: 'Cent',
    subunitToUnit: 100,
    flagEmoji: '🇪🇺',
  },
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'AED',
    symbolPlacement: 'AFTER',
    decimalPlaces: 2,
    subunitName: 'Fils',
    subunitToUnit: 100,
    flagEmoji: '🇦🇪',
  },
  SAR: {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: 'SAR',
    symbolPlacement: 'AFTER',
    decimalPlaces: 2,
    subunitName: 'Halala',
    subunitToUnit: 100,
    flagEmoji: '🇸🇦',
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'CA$',
    symbolPlacement: 'BEFORE',
    decimalPlaces: 2,
    subunitName: 'Cent',
    subunitToUnit: 100,
    flagEmoji: '🇨🇦',
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    symbolPlacement: 'BEFORE',
    decimalPlaces: 2,
    subunitName: 'Cent',
    subunitToUnit: 100,
    flagEmoji: '🇦🇺',
  },
  TRY: {
    code: 'TRY',
    name: 'Turkish Lira',
    symbol: '₺',
    symbolPlacement: 'BEFORE',
    decimalPlaces: 2,
    subunitName: 'Kuruş',
    subunitToUnit: 100,
    flagEmoji: '🇹🇷',
  },
  KES: {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    symbolPlacement: 'BEFORE',
    decimalPlaces: 2,
    subunitName: 'Cent',
    subunitToUnit: 100,
    flagEmoji: '🇰🇪',
  },
};

// Baseline institutional treasury exchange rates pegged to INR
export const BASELINE_INR_RATES: Record<string, number> = {
  INR: 1.0,
  USD: 86.5,
  GBP: 110.2,
  EUR: 93.4,
  AED: 23.55,
  SAR: 23.05,
  CAD: 63.8,
  AUD: 56.4,
  TRY: 2.5,
  KES: 0.67,
};

export class CurrencyEngine {
  public static getAllCurrencies(): CurrencyDefinition[] {
    return Object.values(SUPPORTED_CURRENCIES);
  }

  public static getCurrency(code?: string): CurrencyDefinition {
    if (!code) return SUPPORTED_CURRENCIES.INR;
    const normalized = code.toUpperCase();
    return SUPPORTED_CURRENCIES[normalized] || SUPPORTED_CURRENCIES.INR;
  }

  /**
   * Converts an amount from minor units (e.g. cents/paisa) to major units (e.g. Dollars/Rupees)
   */
  public static fromMinorUnits(amountInMinor: number, currencyCode: string): number {
    const cur = this.getCurrency(currencyCode);
    return amountInMinor / cur.subunitToUnit;
  }

  /**
   * Converts an amount from major units (e.g. Dollars/Rupees) to minor units (e.g. cents/paisa for Stripe/Razorpay)
   */
  public static toMinorUnits(amountInMajor: number, currencyCode: string): number {
    const cur = this.getCurrency(currencyCode);
    return Math.round(amountInMajor * cur.subunitToUnit);
  }

  /**
   * Converts monetary amounts across any two currencies using the institutional Forex engine
   */
  public static convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    customRateMap?: Record<string, number>
  ): {
    originalAmount: number;
    convertedAmount: number;
    exchangeRate: number;
    fromCurrency: string;
    toCurrency: string;
  } {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    if (from === to) {
      return {
        originalAmount: amount,
        convertedAmount: amount,
        exchangeRate: 1.0,
        fromCurrency: from,
        toCurrency: to,
      };
    }

    const rates = customRateMap || BASELINE_INR_RATES;
    const fromToInrRate = rates[from] || 1.0;
    const toToInrRate = rates[to] || 1.0;

    // Convert fromSource -> INR -> toTarget
    const amountInInr = amount * fromToInrRate;
    const convertedAmount = amountInInr / toToInrRate;
    const effectiveRate = fromToInrRate / toToInrRate;

    const targetDef = this.getCurrency(to);
    const rounded = Number(convertedAmount.toFixed(targetDef.decimalPlaces));

    return {
      originalAmount: amount,
      convertedAmount: rounded,
      exchangeRate: Number(effectiveRate.toFixed(6)),
      fromCurrency: from,
      toCurrency: to,
    };
  }
}
