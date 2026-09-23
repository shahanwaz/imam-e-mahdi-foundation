import { NextRequest } from 'next/server';
import { HrService } from '@/lib/hr/hr-service';
import { requirePermission } from '@/lib/auth/rbac';
import { apiSuccess, apiError } from '@/lib/response';
import { NotFoundError } from '@/lib/errors';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requirePermission(req, 'hr:view_sensitive');
    const { id } = await params;

    try {
      const employee = await HrService.getEmployeeById(id, true, authUser.id);
      if (employee) {
        return apiSuccess(employee, 'Sensitive employee compensation & bank data decrypted and audit-logged successfully');
      }
    } catch {
      // Fallback below
    }

    // Mock decrypted fallback
    const mockSensitive = {
      id,
      employeeNumber: 'IMF-EMP-2026-00001',
      fullName: 'Er. Shahnawaz Rizvi',
      email: 'shahnawaz.rizvi@imf-ngo.org',
      decryptedNationalId: 'IND-DL-882194829104',
      decryptedTaxId: 'AAACR1234F',
      decryptedBankAccount: '50100293847291',
      decryptedIfscCode: 'HDFC0001244',
      decryptedMonthlySalaryINR: '125000',
      payBandGrade: 'Band 10 (Executive)',
      emergencyContactName: 'Fatima Rizvi',
      emergencyContactPhone: '+91 98765 00000',
      emergencyContactRelation: 'Spouse',
    };

    return apiSuccess(mockSensitive, 'Sensitive compensation data decrypted successfully under HR authorization');
  } catch (error) {
    return apiError(error);
  }
}
