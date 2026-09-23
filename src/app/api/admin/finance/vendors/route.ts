import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { requirePermission } from '@/lib/auth/rbac';
import { FinanceService } from '@/lib/finance/finance-service';
import { VendorCategory } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'finance:view_ledger');

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as VendorCategory | undefined;
    const search = searchParams.get('search') || undefined;

    const vendors = await FinanceService.listVendors({ category, search });

    return apiSuccess(vendors, 'Vendors retrieved successfully');
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'finance:record_expense');
    const body = await req.json();

    const vendor = await FinanceService.createVendor(
      {
        legalName: body.legalName,
        tradeName: body.tradeName,
        category: body.category || VendorCategory.SUPPLIES_MATERIALS,
        contactPerson: body.contactPerson,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        pinCode: body.pinCode,
        panTaxId: body.panTaxId,
        gstNumber: body.gstNumber,
        bankName: body.bankName,
        bankAccountNumber: body.bankAccountNumber,
        bankIfscCode: body.bankIfscCode,
      },
      user.id
    );

    return apiSuccess(vendor, 'Vendor registered successfully', 201);
  } catch (error) {
    return apiError(error);
  }
}
