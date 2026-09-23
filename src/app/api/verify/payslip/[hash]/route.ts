import { NextRequest } from 'next/server';
import { PayrollService } from '@/lib/payroll/payroll-service';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;
    if (!hash) {
      return apiError(new Error('Verification hash is required.'));
    }

    const verificationResult = await PayrollService.getPayslipByHash(hash);

    if (!verificationResult) {
      return apiError(new Error('Payslip not found or invalid cryptographic hash.'));
    }

    return apiSuccess(
      verificationResult,
      'Digital payslip cryptographically verified and confirmed authentic.',
      200
    );
  } catch (error) {
    return apiError(error, 'Cryptographic verification failed');
  }
}
