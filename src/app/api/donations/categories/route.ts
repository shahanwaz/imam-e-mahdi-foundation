import { NextResponse } from 'next/server';
import { DonationService } from '@/lib/donations/donation-service';

export async function GET() {
  try {
    const categories = await DonationService.getActiveCategories();
    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    console.error('[API_DONATION_CATEGORIES_ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch donation categories' },
      { status: 500 }
    );
  }
}
