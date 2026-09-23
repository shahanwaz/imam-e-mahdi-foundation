import React from 'react';
import { PayrollService } from '@/lib/payroll/payroll-service';
import { constructMetadata } from '@/lib/seo/metadata';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Building2,
  Lock,
  QrCode,
  FileText,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

export const metadata = constructMetadata({
  title: 'Cryptographic Payslip Verification | Imam E Mahdi Foundation',
  description: 'Public cryptographic audit verification for official salary payment receipts and digital payslips.',
  path: '/verify/payslip',
});

export default async function PayslipVerificationPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;

  let verificationResult: any = null;
  try {
    verificationResult = await PayrollService.getPayslipByHash(hash);
  } catch {
    verificationResult = null;
  }

  const payslip = verificationResult?.payslip;
  const isValid = verificationResult?.isCryptographicallyValid ?? false;

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/80 space-y-6">
        {/* Verification Status Badge */}
        <div className="text-center space-y-3">
          {isValid ? (
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-9 h-9 text-emerald-700" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-3xl bg-rose-100 border border-rose-300 text-rose-800 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-9 h-9 text-rose-700" />
            </div>
          )}

          <div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isValid
                  ? 'bg-emerald-100 text-emerald-950 border border-emerald-200'
                  : 'bg-rose-100 text-rose-950 border border-rose-200'
              }`}
            >
              {isValid ? 'Official Cryptographic Seal Verified' : 'Invalid or Unverified Seal'}
            </span>
            <h1 className="text-2xl font-serif font-bold text-slate-900 mt-2">
              {isValid ? 'Authentic NGO Digital Payslip' : 'Payslip Verification Failed'}
            </h1>
          </div>
        </div>

        {/* Payslip Details Card */}
        {payslip ? (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500 font-medium">Payslip Reference:</span>
                <span className="font-mono font-bold text-emerald-950">{payslip.payslipNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Recipient Employee:</span>
                <span className="font-bold text-slate-900">{payslip.employee?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Employee Serial ID:</span>
                <span className="font-mono font-bold text-slate-800">{payslip.employee?.employeeNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Department / Directorate:</span>
                <span className="font-semibold text-slate-800">{payslip.employee?.department?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Payroll Cycle:</span>
                <span className="font-semibold text-slate-800">Period {payslip.payrollPeriod?.periodCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Disbursement Status:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                  {payslip.status}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gold-300 uppercase tracking-widest">Net Disbursed Compensation</span>
                <p className="text-xl font-serif font-bold text-white">₹{Number(payslip.netPayableINR).toLocaleString('en-IN')}</p>
              </div>
              <CheckCircle2 className="w-7 h-7 text-gold-400" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px] font-mono text-slate-500 break-all">
              <div className="font-bold text-slate-700 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-slate-400" />
                <span>HMAC-SHA256 Cryptographic Hash:</span>
              </div>
              <p className="text-[10px] text-slate-600">{payslip.verificationHash}</p>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 text-xs text-slate-600">
            <p>The requested digital signature hash could not be matched against any issued payslips in the foundation ledger registry.</p>
          </div>
        )}

        {/* Footer info */}
        <div className="text-center pt-2 text-xs text-slate-400">
          <p>Issued by the Central Finance &amp; HR Directorate of Imam E Mahdi Foundation.</p>
          <Link href="/" className="text-emerald-800 font-semibold hover:underline mt-2 inline-block">
            Return to Public Home
          </Link>
        </div>
      </div>
    </div>
  );
}
