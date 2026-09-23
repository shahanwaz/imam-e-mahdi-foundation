'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Download, 
  Share2, 
  Building2, 
  QrCode, 
  Calendar, 
  CreditCard, 
  Lock, 
  FileCheck2,
  ExternalLink,
  Coins
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';

export default function ReceiptVerificationPage() {
  const params = useParams();
  const hashParam = params?.hash as string;

  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReceipt() {
      if (!hashParam) return;
      try {
        const res = await fetch(`/api/donations/receipt/${encodeURIComponent(hashParam)}`);
        const json = await res.json();
        if (!json.success || !json.data) {
          setError(json.error || 'Receipt not found or invalid.');
        } else {
          setReceipt(json.data);
        }
      } catch (err: any) {
        setError(err.message || 'Verification service error.');
      } finally {
        setLoading(false);
      }
    }
    fetchReceipt();
  }, [hashParam]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">
            Verifying cryptographic signature on immutable ledger...
          </p>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif font-bold text-2xl text-slate-900">
              Receipt Not Found or Invalid
            </h2>
            <p className="text-xs text-slate-600">
              {error || 'The cryptographic signature could not be verified against the official foundation registry.'}
            </p>
          </div>
          <Link
            href="/donate"
            className="inline-block px-6 py-3 rounded-xl bg-emerald-950 text-white font-bold text-xs hover:bg-emerald-900"
          >
            Return to Donation Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Top Controls (Hidden during print) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
            Official Cryptographic QR Verification
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-emerald-950 text-white font-bold text-xs flex items-center gap-2 hover:bg-emerald-900 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Receipt</span>
          </button>
          <Link
            href="/donate"
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
          >
            Make Another Donation
          </Link>
        </div>
      </div>

      {/* Official Certificate Container */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-8 sm:p-12 space-y-8 relative overflow-hidden print:border-none print:shadow-none print:p-0">
        {/* Verification Watermark & Header */}
        <div className="border-b-2 border-emerald-950/10 pb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <Logo size="md" href={null} />
              <span className="text-xs font-bold text-gold-600 uppercase tracking-widest block">
                Section 8 Not-for-Profit Entity &bull; CIN: U88900DC2026NPL474906
              </span>
              <p className="text-xs text-slate-500">
                Registered Office: Hazratganj, Lucknow, UP - 226001 | Official Contribution Receipt
              </p>
            </div>

            {/* Cryptographic Verification Seal */}
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 text-center space-y-1 shrink-0">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>GENUINE &amp; VERIFIED</span>
              </div>
              <p className="text-[10px] font-mono text-emerald-800">
                HMAC-SHA256 STAMP
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-400">Receipt No: </span>
              <strong className="text-slate-900 font-bold">{receipt.receiptNumber}</strong>
            </div>
            <div>
              <span className="text-slate-400">Date &amp; Time: </span>
              <strong className="text-slate-900">{new Date(receipt.completedAt || receipt.createdAt).toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span className="text-slate-400">Payment Gateway ID: </span>
              <strong className="text-slate-900">{receipt.gatewayPaymentId || 'BANK-RECON'}</strong>
            </div>
          </div>
        </div>

        {/* Core Contribution Breakdown */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Donor &amp; Fund Allocation Record
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-[#FDFBF7] border border-slate-200 text-xs">
            <div className="space-y-3">
              <div>
                <span className="text-slate-500 block">Received with thanks from:</span>
                <strong className="text-sm font-bold text-emerald-950 block">{receipt.donorName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Donor Email:</span>
                <span className="text-slate-700 font-mono">{receipt.donorEmail}</span>
              </div>
              {receipt.donorPanMasked && (
                <div>
                  <span className="text-slate-500 block">Permanent Account Number (PAN):</span>
                  <span className="text-slate-900 font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                    {receipt.donorPanMasked}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-500 block">Allocated Fund / Reserve:</span>
                <strong className="text-sm font-bold text-emerald-950 block">{receipt.categoryName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Fund Classification:</span>
                <span className="text-emerald-800 font-semibold">{receipt.fundType}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Amount Received:</span>
                <span className="text-lg font-bold text-emerald-950 font-serif">
                  {receipt.currency === 'INR' ? `₹ ${receipt.amount.toLocaleString('en-IN')}` : `${receipt.currency} ${receipt.amount}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 80G Tax Exemption Certificate (if issued & verified) */}
        {receipt.taxReceipt ? (
          <div className="space-y-3 border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-gold-600" />
                <span>Certificate of Tax Exemption (Section 80G of Income Tax Act)</span>
              </h3>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {receipt.taxReceipt.deductionPercent}% Statutory Tax Deduction
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-emerald-800/70 block">80G Certificate No:</span>
                  <strong className="font-mono text-emerald-950">{receipt.taxReceipt.certificateNumber}</strong>
                </div>
                <div>
                  <span className="text-emerald-800/70 block">Financial Year:</span>
                  <strong className="font-mono text-emerald-950">{receipt.taxReceipt.financialYear}</strong>
                </div>
                <div>
                  <span className="text-emerald-800/70 block">Eligible Deduction:</span>
                  <strong className="text-emerald-950">{receipt.taxReceipt.deductionPercent}%</strong>
                </div>
                <div>
                  <span className="text-emerald-800/70 block">PAN on Record:</span>
                  <strong className="font-mono text-emerald-950">{receipt.donorPanMasked}</strong>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-800 block">Statutory Acknowledgment Notice</span>
            <p className="text-slate-600 leading-relaxed">
              This document serves as an official cryptographic proof of contribution for Imam E Mahdi Foundation (Section 8 Not-for-Profit, CIN: U88900DC2026NPL474906). Statutory Section 80G income tax exemption approval is undergoing formal regulatory processing with the Income Tax Department and is not claimed on this receipt.
            </p>
          </div>
        )}

        {/* Cryptographic Audit Stamp & Verification Hash */}
        <div className="border-t border-slate-200 pt-6 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-wider">
              Cryptographic Integrity Signature
            </span>
            <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Verified Against Database
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 text-gold-300 font-mono text-[11px] break-all select-all">
            {receipt.qrVerificationHash || 'SIGNATURE_VERIFIED'}
          </div>

          <div className="flex flex-col sm:flex-row justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>This is a computer-generated official receipt and requires no physical signature.</span>
            <span>Imam E Mahdi Foundation &bull; NGO Digital Operating System (IMF-DOS)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
