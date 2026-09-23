'use client';

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RotateCcw, 
  FileCheck2, 
  QrCode, 
  Eye, 
  AlertCircle, 
  Building2, 
  Coins, 
  ShieldCheck, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface DonationItem {
  id: string;
  receiptNumber: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorPanMasked?: string;
  amount: number;
  currency: string;
  amountInINR: number;
  fundType: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentProvider: string;
  gatewayPaymentId?: string;
  is80GIssued: boolean;
  qrVerificationHash?: string;
  createdAt: string;
  completedAt?: string;
  category?: {
    name: string;
    complianceStatus: string;
    is80GEligible: boolean;
  };
  campaign?: {
    title: string;
    slug: string;
  };
  taxReceipt?: {
    certificateNumber: string;
    financialYear: string;
  };
}

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [fundTypeFilter, setFundTypeFilter] = useState<string>('');
  const [is80GFilter, setIs80GFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Selected Donation for detail modal
  const [selectedDonation, setSelectedDonation] = useState<DonationItem | null>(null);

  // Refund modal
  const [refundDonation, setRefundDonation] = useState<DonationItem | null>(null);
  const [refundReason, setRefundReason] = useState<string>('');
  const [isRefunding, setIsRefunding] = useState<boolean>(false);
  const [refundSuccessMessage, setRefundSuccessMessage] = useState<string | null>(null);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(fundTypeFilter ? { fundType: fundTypeFilter } : {}),
        ...(is80GFilter ? { is80G: is80GFilter } : {}),
      });

      const res = await fetch(`/api/admin/donations?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success) {
        setDonations(json.data.donations || []);
        setAnalytics(json.data.analytics || null);
        if (json.meta) {
          setTotalPages(json.meta.totalPages || 1);
          setTotalRecords(json.meta.totalRecords || 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch donations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [page, statusFilter, fundTypeFilter, is80GFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDonations();
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundDonation || !refundReason.trim()) return;

    setIsRefunding(true);
    try {
      const res = await fetch('/api/admin/donations/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationId: refundDonation.id,
          reason: refundReason.trim(),
          approvedByUserId: 'EXECUTIVE_FINANCE_DIRECTOR',
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Refund processing failed');
      }

      setRefundSuccessMessage(`Refund recorded successfully. Voucher rebalanced.`);
      setTimeout(() => {
        setRefundDonation(null);
        setRefundReason('');
        setRefundSuccessMessage(null);
        fetchDonations();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Refund failed');
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Executive Donation Receipts &amp; Compliance Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Real-time multi-gateway donation registry with configurable statutory compliance, restricted reserve segregation, and cryptographic QR verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDonations()}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Ledger</span>
          </button>
          <Link
            href="/donate"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
            <span>Public Donation Portal</span>
          </Link>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Received (INR)</span>
            <div className="text-2xl font-serif font-bold text-emerald-950">
              ₹ {analytics.totalCollectedINR.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{analytics.totalDonationsCount} Successful Transactions</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-900 shadow-sm space-y-1">
            <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">100% Zakat Reserves</span>
            <div className="text-2xl font-serif font-bold text-white">
              ₹ {analytics.zakatTotalINR.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-300">
              Direct Beneficiary Disbursement Pool
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-950 text-white border border-amber-900 shadow-sm space-y-1">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Khums Restricted Pool</span>
            <div className="text-2xl font-serif font-bold text-white">
              ₹ {analytics.khumsTotalINR.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-amber-200">
              Sahm-e-Imam &amp; Sahm-e-Sadat
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">General &amp; Sadaqah</span>
            <div className="text-2xl font-serif font-bold text-slate-900">
              ₹ {analytics.generalTotalINR.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500">
              Relief &amp; Medical Operations
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search receipt #, donor name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-900"
            />
          </div>

          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
            >
              <option value="">All Payment Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="INITIATED">INITIATED</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={fundTypeFilter}
              onChange={(e) => {
                setFundTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
            >
              <option value="">All Fund Classifications</option>
              <option value="ZAKAT_MAL">Zakat al-Mal</option>
              <option value="ZAKAT_FITRAH">Zakat al-Fitr</option>
              <option value="KHUMS_SEHAM_E_IMAM">Khums Sahm-e-Imam</option>
              <option value="KHUMS_SEHAM_E_SADAT">Khums Sahm-e-Sadat</option>
              <option value="GENERAL_SADAQAH">General Sadaqah</option>
              <option value="ORPHAN_AID">Orphan Aid</option>
              <option value="MEDICAL_AID">Medical Aid</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={is80GFilter}
              onChange={(e) => {
                setIs80GFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
            >
              <option value="">80G Exemption</option>
              <option value="true">80G Certificate Issued</option>
            </select>
          </div>

          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-emerald-950 text-white text-xs font-bold hover:bg-emerald-900"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Receipt # / QR</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Donor Name &amp; Email</th>
                <th className="py-3 px-4">Fund Reserve</th>
                <th className="py-3 px-4 text-right">Amount (INR)</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">80G Tax Cert</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 animate-pulse">
                    Loading donation ledger...
                  </td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No donation records found matching criteria.
                  </td>
                </tr>
              ) : (
                donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                        <span>{d.receiptNumber}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(d.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{d.donorName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{d.donorEmail}</div>
                      {d.donorPanMasked && (
                        <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                          PAN: {d.donorPanMasked}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{d.category?.name || d.fundType}</div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        {d.fundType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold font-mono text-emerald-950">
                      ₹ {Number(d.amountInINR).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{d.paymentMethod}</div>
                      <div className="text-[10px] font-mono text-slate-500">{d.paymentProvider}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        d.paymentStatus === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-900'
                          : d.paymentStatus === 'REFUNDED'
                          ? 'bg-amber-100 text-amber-900'
                          : d.paymentStatus === 'FAILED'
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {d.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {d.is80GIssued ? (
                        <div className="text-[11px] font-mono text-emerald-800 font-bold flex items-center gap-1">
                          <FileCheck2 className="w-3.5 h-3.5 text-gold-600" />
                          <span>{d.taxReceipt?.certificateNumber || 'ISSUED'}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">&mdash;</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {d.qrVerificationHash && (
                          <Link
                            href={`/verify/receipt/${d.qrVerificationHash}`}
                            target="_blank"
                            title="Verify Public E-Receipt"
                            className="p-1.5 rounded-lg text-emerald-800 hover:bg-emerald-50"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        {d.paymentStatus === 'SUCCESS' && (
                          <button
                            onClick={() => setRefundDonation(d)}
                            title="Process Authorized Refund"
                            className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <strong>{donations.length}</strong> of <strong>{totalRecords}</strong> total donations
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-50"
            >
              Previous
            </button>
            <span className="font-semibold">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {refundDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Initiate Donation Refund</h3>
                <p className="text-xs text-slate-500 font-mono">Receipt #{refundDonation.receiptNumber}</p>
              </div>
            </div>

            {refundSuccessMessage ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span>{refundSuccessMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleProcessRefund} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Donor:</span>
                    <strong className="text-slate-900">{refundDonation.donorName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Refund Amount:</span>
                    <strong className="text-emerald-950 font-bold">₹ {Number(refundDonation.amountInINR).toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Reason &amp; Compliance Audit Justification *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter formal justification for ledger audit trail..."
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-900"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isRefunding}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
                  >
                    {isRefunding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    <span>Confirm &amp; Reverse Ledger</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundDonation(null)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
