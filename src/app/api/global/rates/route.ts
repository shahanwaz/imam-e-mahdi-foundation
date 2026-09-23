import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { BASELINE_INR_RATES, CurrencyEngine } from '@/lib/global/currencies';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') || 'USD';
    const to = searchParams.get('to') || 'INR';
    const amount = parseFloat(searchParams.get('amount') || '1');

    const conversion = CurrencyEngine.convert(amount, from, to);

    // Also fetch custom stored rates from database if any
    let dbRates: any[] = [];
    try {
      dbRates = await prisma.exchangeRateRecord.findMany({
        orderBy: { updatedAt: 'desc' },
      });
    } catch {
      // Fallback
    }

    return apiSuccess(
      {
        conversion,
        baselineRates: BASELINE_INR_RATES,
        persistedRates: dbRates,
      },
      'Forex rates and conversion calculated successfully'
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { baseCurrency, targetCurrency, rate, source } = body;

    if (!baseCurrency || !targetCurrency || !rate) {
      return apiError(new Error('Missing required fields: baseCurrency, targetCurrency, and rate'));
    }

    const saved = await prisma.exchangeRateRecord.upsert({
      where: {
        baseCurrency_targetCurrency: {
          baseCurrency: baseCurrency.toUpperCase(),
          targetCurrency: targetCurrency.toUpperCase(),
        },
      },
      create: {
        baseCurrency: baseCurrency.toUpperCase(),
        targetCurrency: targetCurrency.toUpperCase(),
        rate,
        source: source || 'MANUAL_TREASURY',
      },
      update: {
        rate,
        source: source || 'MANUAL_TREASURY',
        effectiveDate: new Date(),
      },
    });

    return apiSuccess(saved, 'Exchange rate updated successfully in treasury ledger', 201);
  } catch (error) {
    return apiError(error);
  }
}
