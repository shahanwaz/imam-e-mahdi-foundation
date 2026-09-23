import { NextRequest } from 'next/server';
import { OfficeService } from '@/lib/global/office-service';
import { apiSuccess, apiError } from '@/lib/response';
import { OfficeType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const countryCode = searchParams.get('country') || undefined;
    const officeType = (searchParams.get('type') as OfficeType) || undefined;

    const offices = await OfficeService.listOffices({ countryCode, officeType });
    return apiSuccess({ offices, total: offices.length }, 'Office locations retrieved successfully');
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === 'seed') {
      const seedResult = await OfficeService.seedStandardOffices();
      return apiSuccess(seedResult, 'Seeded global chapter and office locations');
    }

    const created = await OfficeService.createOffice(body);
    return apiSuccess(created, 'Office location created successfully', 201);
  } catch (error) {
    return apiError(error);
  }
}
