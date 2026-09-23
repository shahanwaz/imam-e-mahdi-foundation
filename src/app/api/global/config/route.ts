import { NextRequest } from 'next/server';
import { CountryRegistry } from '@/lib/global/countries';
import { CurrencyEngine } from '@/lib/global/currencies';
import { LanguageRegistry } from '@/lib/global/languages';
import { COUNTRY_TAX_SCHEMES } from '@/lib/global/tax-compliance';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    const countries = CountryRegistry.getAllCountries();
    const currencies = CurrencyEngine.getAllCurrencies();
    const languages = LanguageRegistry.getAllLanguages();
    const indicLanguages = LanguageRegistry.getIndicLanguages();
    const taxSchemes = Object.values(COUNTRY_TAX_SCHEMES);

    return apiSuccess(
      {
        countries,
        currencies,
        languages,
        indicLanguages,
        taxSchemes,
      },
      'Global architecture & localization catalog retrieved successfully'
    );
  } catch (error) {
    return apiError(error);
  }
}
