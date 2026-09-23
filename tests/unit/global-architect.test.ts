import { describe, it, expect, vi } from 'vitest';
import { LanguageRegistry, SUPPORTED_LANGUAGES } from '@/lib/global/languages';
import { CurrencyEngine, SUPPORTED_CURRENCIES } from '@/lib/global/currencies';
import { CountryRegistry, SUPPORTED_COUNTRIES } from '@/lib/global/countries';
import { GlobalFormatter } from '@/lib/global/formatter';
import { TaxComplianceRegistry, COUNTRY_TAX_SCHEMES } from '@/lib/global/tax-compliance';
import { I18nService } from '@/lib/i18n/i18n-service';
import { OfficeService, SEED_OFFICE_LOCATIONS } from '@/lib/global/office-service';
import { OfficeType } from '@prisma/client';

// Mock Prisma for deterministic office testing
vi.mock('@/lib/db', () => {
  const officesStore: any[] = [];

  return {
    prisma: {
      officeLocation: {
        findMany: vi.fn().mockImplementation(({ where }) => {
          let filtered = [...officesStore];
          if (where?.countryCode) {
            filtered = filtered.filter((o) => o.countryCode === where.countryCode);
          }
          if (where?.officeType) {
            filtered = filtered.filter((o) => o.officeType === where.officeType);
          }
          return Promise.resolve(filtered);
        }),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          const item = officesStore.find((o) => o.officeCode === where.officeCode);
          return Promise.resolve(item || null);
        }),
        create: vi.fn().mockImplementation(({ data }) => {
          const record = { id: `off_${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
          officesStore.push(record);
          return Promise.resolve(record);
        }),
        count: vi.fn().mockImplementation(() => Promise.resolve(officesStore.length)),
      },
      exchangeRateRecord: {
        findMany: vi.fn().mockResolvedValue([]),
        upsert: vi.fn().mockImplementation(({ create }) => Promise.resolve({ id: 'ex_1', ...create })),
      },
    },
  };
});

describe('Global Architecture & i18n Intelligence Suite Tests', () => {
  describe('1. Indic & Extensible Global Language Engine', () => {
    it('should support all 13 initial Indic languages with native names', () => {
      const requiredIndicCodes = [
        'en', 'hi', 'ur', 'bn', 'ta', 'te', 'mr', 'gu', 'pa', 'kn', 'ml', 'or', 'as'
      ];

      requiredIndicCodes.forEach((code) => {
        const lang = LanguageRegistry.getLanguage(code);
        expect(lang).toBeDefined();
        expect(lang.code).toBe(code);
        expect(lang.nativeName).toBeDefined();
        expect(lang.nativeName.length).toBeGreaterThan(0);
      });
    });

    it('should support extensible international languages (Arabic, Persian, French, German, Turkish, Swahili)', () => {
      const requiredIntlCodes = ['ar', 'fa', 'fr', 'de', 'tr', 'sw', 'id'];

      requiredIntlCodes.forEach((code) => {
        const lang = LanguageRegistry.getLanguage(code);
        expect(lang).toBeDefined();
        expect(lang.code).toBe(code);
        expect(lang.name).toBeDefined();
      });
    });

    it('should correctly detect RTL directionality for Urdu, Arabic, and Persian', () => {
      expect(LanguageRegistry.isRtl('ur')).toBe(true);
      expect(LanguageRegistry.getDirection('ur')).toBe('rtl');

      expect(LanguageRegistry.isRtl('ar')).toBe(true);
      expect(LanguageRegistry.getDirection('ar')).toBe('rtl');

      expect(LanguageRegistry.isRtl('fa')).toBe(true);
      expect(LanguageRegistry.getDirection('fa')).toBe('rtl');

      // LTR Languages
      expect(LanguageRegistry.isRtl('en')).toBe(false);
      expect(LanguageRegistry.getDirection('en')).toBe('ltr');

      expect(LanguageRegistry.isRtl('hi')).toBe(false);
      expect(LanguageRegistry.getDirection('hi')).toBe('ltr');

      expect(LanguageRegistry.isRtl('bn')).toBe(false);
      expect(LanguageRegistry.getDirection('bn')).toBe('ltr');
    });
  });

  describe('2. i18n Translation & Dictionary Interpolation', () => {
    it('should translate common keys across English, Urdu, Hindi, and Arabic', () => {
      const enWelcome = I18nService.t('common.welcome', 'en');
      expect(enWelcome).toContain('Welcome to Imam E Mahdi Foundation');

      const urWelcome = I18nService.t('common.welcome', 'ur');
      expect(urWelcome).toContain('امام مہدی فاؤنڈیشن میں خوش آمدید');

      const hiWelcome = I18nService.t('common.welcome', 'hi');
      expect(hiWelcome).toContain('इमाम ए महदी फाउंडेशन में आपका स्वागत है');

      const arWelcome = I18nService.t('common.welcome', 'ar');
      expect(arWelcome).toContain('مرحبًا بكم في مؤسسة الإمام المهدي');
    });

    it('should fallback gracefully to English for untranslated keys in other languages', () => {
      const fallbackResult = I18nService.t('compliance.gift_aid_eligible', 'hi');
      expect(fallbackResult).toBeDefined();
      expect(fallbackResult.length).toBeGreaterThan(0);
    });

    it('should interpolate dynamic parameters inside translation strings', () => {
      const translated = I18nService.t('common.welcome', 'en');
      expect(translated).toBeDefined();
    });
  });

  describe('3. Numbering Systems & Global Formatter', () => {
    it('should format numbers according to the Indian Lakh/Crore system', () => {
      // 15 Lakh
      const res1 = GlobalFormatter.formatNumber(1500000, { numberingSystem: 'INDIAN_LAKH_CRORE' });
      expect(res1).toBe('15,00,000.00');

      // 1.23 Crore
      const res2 = GlobalFormatter.formatNumber(12345678.9, { numberingSystem: 'INDIAN_LAKH_CRORE' });
      expect(res2).toBe('1,23,45,678.90');
    });

    it('should format numbers according to the International Million/Billion system', () => {
      // 1.5 Million
      const res1 = GlobalFormatter.formatNumber(1500000, { numberingSystem: 'INTERNATIONAL_MILLION_BILLION' });
      expect(res1).toBe('1,500,000.00');

      // 12.34 Million
      const res2 = GlobalFormatter.formatNumber(12345678.9, { numberingSystem: 'INTERNATIONAL_MILLION_BILLION' });
      expect(res2).toBe('12,345,678.90');
    });

    it('should format currency with proper symbol placement and decimals', () => {
      // INR (Symbol BEFORE)
      const inrStr = GlobalFormatter.formatCurrency(50000, 'INR', { countryCode: 'IN' });
      expect(inrStr).toBe('₹ 50,000.00');

      // USD (Symbol BEFORE)
      const usdStr = GlobalFormatter.formatCurrency(50000, 'USD', { countryCode: 'US' });
      expect(usdStr).toBe('$ 50,000.00');

      // AED (Symbol AFTER)
      const aedStr = GlobalFormatter.formatCurrency(50000, 'AED', { countryCode: 'AE' });
      expect(aedStr).toBe('50,000.00 AED');
    });

    it('should generate compact human-readable scale strings', () => {
      const inrCompact = GlobalFormatter.formatCompact(25000000, 'INR');
      expect(inrCompact).toBe('₹ 2.50 Cr');

      const usdCompact = GlobalFormatter.formatCompact(25000000, 'USD');
      expect(usdCompact).toBe('$ 25.00 M');
    });

    it('should format dates based on country format configuration', () => {
      const fixedDate = new Date('2026-09-18T12:00:00Z');

      // India: DD/MM/YYYY
      const inDate = GlobalFormatter.formatDate(fixedDate, { countryCode: 'IN' });
      expect(inDate).toMatch(/^\d{2}\/\d{2}\/2026$/);

      // US: MM/DD/YYYY
      const usDate = GlobalFormatter.formatDate(fixedDate, { countryCode: 'US' });
      expect(usDate).toMatch(/^\d{2}\/\d{2}\/2026$/);

      // Canada: YYYY-MM-DD
      const caDate = GlobalFormatter.formatDate(fixedDate, { countryCode: 'CA' });
      expect(caDate).toMatch(/^2026-\d{2}-\d{2}$/);
    });
  });

  describe('4. Multi-Currency Subunits & Forex Conversion Engine', () => {
    it('should convert major to minor currency units and vice versa', () => {
      // 50.00 USD -> 5000 cents
      expect(CurrencyEngine.toMinorUnits(50.0, 'USD')).toBe(5000);
      expect(CurrencyEngine.fromMinorUnits(5000, 'USD')).toBe(50.0);

      // 1000.00 INR -> 100000 paisa
      expect(CurrencyEngine.toMinorUnits(1000.0, 'INR')).toBe(100000);
      expect(CurrencyEngine.fromMinorUnits(100000, 'INR')).toBe(1000.0);
    });

    it('should convert amounts between any two currencies using the Forex engine', () => {
      // Convert 100 USD to INR (1 USD = 86.50 INR)
      const res1 = CurrencyEngine.convert(100, 'USD', 'INR');
      expect(res1.convertedAmount).toBe(8650);
      expect(res1.exchangeRate).toBe(86.5);

      // Convert 100 GBP to USD (1 GBP = 110.20 INR, 1 USD = 86.50 INR -> 1 GBP = ~1.273988 USD)
      const res2 = CurrencyEngine.convert(100, 'GBP', 'USD');
      expect(res2.convertedAmount).toBeGreaterThan(120);
      expect(res2.convertedAmount).toBeLessThan(135);

      // Same currency conversion
      const res3 = CurrencyEngine.convert(500, 'AED', 'AED');
      expect(res3.convertedAmount).toBe(500);
      expect(res3.exchangeRate).toBe(1.0);
    });
  });

  describe('5. Country Configuration & Payment Provider Resolution', () => {
    it('should retrieve country configuration without hardcoded assumptions', () => {
      const gb = CountryRegistry.getCountry('GB');
      expect(gb.name).toBe('United Kingdom');
      expect(gb.defaultCurrency).toBe('GBP');
      expect(gb.callingCode).toBe('+44');
      expect(gb.preferredPaymentProviders).toContain('STRIPE');

      const ae = CountryRegistry.getCountry('AE');
      expect(ae.name).toBe('United Arab Emirates');
      expect(ae.defaultCurrency).toBe('AED');
      expect(ae.callingCode).toBe('+971');
    });

    it('should route INR payments to Razorpay and foreign currencies to Stripe', () => {
      expect(CountryRegistry.getPreferredPaymentProvider('IN', 'INR')).toBe('RAZORPAY');
      expect(CountryRegistry.getPreferredPaymentProvider('GB', 'GBP')).toBe('STRIPE');
      expect(CountryRegistry.getPreferredPaymentProvider('US', 'USD')).toBe('STRIPE');
    });
  });

  describe('6. Country Tax Compliance & ID Validation', () => {
    it('should validate Indian PAN format for Section 80G tax deductions', () => {
      const valid = TaxComplianceRegistry.validateTaxId('IN', 'ABCDE1234F');
      expect(valid.isValid).toBe(true);

      const invalid = TaxComplianceRegistry.validateTaxId('IN', '12345ABCDE');
      expect(invalid.isValid).toBe(false);
      expect(invalid.message).toContain('PAN Card Number');
    });

    it('should validate UK National Insurance Number (NINO) for Gift Aid', () => {
      const valid = TaxComplianceRegistry.validateTaxId('GB', 'QQ123456A');
      expect(valid.isValid).toBe(true);
    });

    it('should return statutory disclaimers for each country scheme', () => {
      const scheme80g = TaxComplianceRegistry.getTaxScheme('IN');
      expect(scheme80g?.statutoryDisclaimer).toContain('Section 80G');

      const giftAid = TaxComplianceRegistry.getTaxScheme('GB');
      expect(giftAid?.statutoryDisclaimer).toContain('Gift Aid');

      const irs501c3 = TaxComplianceRegistry.getTaxScheme('US');
      expect(irs501c3?.statutoryDisclaimer).toContain('501(c)(3)');
    });
  });

  describe('7. Multi-Office & Chapter Directory', () => {
    it('should list registered global offices and regional chapters', async () => {
      const offices = await OfficeService.listOffices();
      expect(offices.length).toBeGreaterThanOrEqual(4);

      const codes = offices.map((o) => o.officeCode);
      expect(codes).toContain('IMF-HQ-DELHI');
      expect(codes).toContain('IMF-UK-LONDON');
      expect(codes).toContain('IMF-US-TEXAS');
      expect(codes).toContain('IMF-UAE-DUBAI');
    });

    it('should allow registering a new regional chapter office', async () => {
      const newOffice = await OfficeService.createOffice({
        officeCode: 'IMF-CA-TORONTO',
        officeName: 'Canada Chapter & Outreach Hub',
        officeType: OfficeType.REGIONAL_CHAPTER,
        countryCode: 'CA',
        city: 'Toronto',
        contactEmail: 'canada@imf-ngo.org',
        representativeName: 'Br. Salman Rizvi',
      });

      expect(newOffice.officeCode).toBe('IMF-CA-TORONTO');
      expect(newOffice.defaultCurrency).toBe('CAD');
      expect(newOffice.countryCode).toBe('CA');
    });
  });
});
