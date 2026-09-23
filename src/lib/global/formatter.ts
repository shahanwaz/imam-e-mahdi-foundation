import { FormatOptions, NumberingSystem } from './types';
import { CurrencyEngine } from './currencies';
import { CountryRegistry } from './countries';

export class GlobalFormatter {
  /**
   * Formats a number according to the specified numbering system (Indian Lakh/Crore vs International).
   */
  public static formatNumber(value: number | string, options?: FormatOptions): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0.00';

    const country = CountryRegistry.getCountry(options?.countryCode);
    const system = options?.numberingSystem || country.numberingSystem;
    const decimals = options?.decimals ?? 2;
    const decimalSep = country.decimalSeparator || '.';
    const thousandSep = country.thousandSeparator || ',';

    const isNegative = num < 0;
    const absVal = Math.abs(num);

    const fixedStr = absVal.toFixed(decimals);
    const [intPart, decPart] = fixedStr.split('.');

    let formattedInt = '';

    if (system === 'INDIAN_LAKH_CRORE') {
      // Indian Grouping: Last 3 digits, then groups of 2 digits (e.g. 12,34,56,789)
      if (intPart.length <= 3) {
        formattedInt = intPart;
      } else {
        const last3 = intPart.substring(intPart.length - 3);
        const remaining = intPart.substring(0, intPart.length - 3);
        const parts: string[] = [];
        for (let i = remaining.length; i > 0; i -= 2) {
          const start = Math.max(0, i - 2);
          parts.unshift(remaining.substring(start, i));
        }
        formattedInt = parts.join(thousandSep) + thousandSep + last3;
      }
    } else {
      // Standard International 3-digit grouping (e.g. 123,456,789)
      const parts: string[] = [];
      for (let i = intPart.length; i > 0; i -= 3) {
        const start = Math.max(0, i - 3);
        parts.unshift(intPart.substring(start, i));
      }
      formattedInt = parts.join(thousandSep);
    }

    const sign = isNegative ? '-' : '';
    return decimals > 0 ? `${sign}${formattedInt}${decimalSep}${decPart}` : `${sign}${formattedInt}`;
  }

  /**
   * Formats a monetary amount with appropriate currency symbol, placement, and number grouping.
   */
  public static formatCurrency(
    amount: number | string,
    currencyCode: string = 'INR',
    options?: FormatOptions
  ): string {
    const cur = CurrencyEngine.getCurrency(currencyCode);
    const decimals = options?.decimals ?? cur.decimalPlaces;
    const formattedNum = this.formatNumber(amount, {
      ...options,
      decimals,
      countryCode: options?.countryCode || (currencyCode === 'INR' ? 'IN' : undefined),
    });

    if (options?.includeSymbol === false) {
      return formattedNum;
    }

    if (cur.symbolPlacement === 'AFTER') {
      return `${formattedNum} ${cur.symbol}`;
    }

    return `${cur.symbol} ${formattedNum}`;
  }

  /**
   * Formats numbers in a compact human-readable scale (e.g. ₹ 1.5 Cr or $ 1.5M).
   */
  public static formatCompact(
    value: number,
    currencyCode?: string,
    numberingSystem?: NumberingSystem
  ): string {
    const system = numberingSystem || (currencyCode === 'INR' ? 'INDIAN_LAKH_CRORE' : 'INTERNATIONAL_MILLION_BILLION');
    const symbol = currencyCode ? CurrencyEngine.getCurrency(currencyCode).symbol : '';

    if (system === 'INDIAN_LAKH_CRORE') {
      if (Math.abs(value) >= 10000000) {
        return `${symbol} ${(value / 10000000).toFixed(2)} Cr`.trim();
      }
      if (Math.abs(value) >= 100000) {
        return `${symbol} ${(value / 100000).toFixed(2)} L`.trim();
      }
      if (Math.abs(value) >= 1000) {
        return `${symbol} ${(value / 1000).toFixed(1)} K`.trim();
      }
    } else {
      if (Math.abs(value) >= 1000000000) {
        return `${symbol} ${(value / 1000000000).toFixed(2)} B`.trim();
      }
      if (Math.abs(value) >= 1000000) {
        return `${symbol} ${(value / 1000000).toFixed(2)} M`.trim();
      }
      if (Math.abs(value) >= 1000) {
        return `${symbol} ${(value / 1000).toFixed(1)} K`.trim();
      }
    }

    return this.formatCurrency(value, currencyCode);
  }

  /**
   * Formats a date according to the country format and specified timezone.
   */
  public static formatDate(date: Date | string | number, options?: FormatOptions): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const country = CountryRegistry.getCountry(options?.countryCode);
    const timeZone = options?.timeZone || country.defaultTimezone;
    const format = country.dateFormat;

    // Format in timezone
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const parts = formatter.formatToParts(d);
    const day = parts.find((p) => p.type === 'day')?.value || '01';
    const month = parts.find((p) => p.type === 'month')?.value || '01';
    const year = parts.find((p) => p.type === 'year')?.value || '2026';

    switch (format) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD.MM.YYYY' as any:
        return `${day}.${month}.${year}`;
      case 'DD/MM/YYYY':
      default:
        return `${day}/${month}/${year}`;
    }
  }
}
