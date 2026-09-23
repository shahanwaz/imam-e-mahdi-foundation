'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Heart,
  FileText,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  User,
  CreditCard,
  Building2,
  Calendar,
  Lock,
  ArrowRight,
  Download,
  Info
} from 'lucide-react';

interface DonorData {
  profile: {
    id?: string;
    fullName: string;
    email: string;
    phone: string | null;
    panMasked: string | null;
    addressLine1: string | null;
    city: string | null;
    state: string | null;
    country: string;
    totalDonatedAmount: number;
    donationCount: number;
  };
  donations: Array<{
    id: string;
    receiptNumber: string;
    amount: number;
    currency: string;
    amountInINR: number;
    fundType: string;
    paymentMethod: string;
    paymentStatus: string;
    completedAt: string | null;
    createdAt: string;
    qrVerificationHash: string | null;
    is80GIssued: boolean;
    category: { name: string; slug: string } | null;
    campaign: { name: string; slug: string } | null;
    taxReceipt: {
      certificateNumber: string;
      financialYear: string;
      deductionPercent: number;
      qrVerificationUrl: string;
    } | null;
  }>;
  refunds: Array<{
    id: string;
    donationReceiptNumber: string;
    amount: number;
    currency: string;
    reason: string;
    status: string;
    createdAt: string;
    approvedAt: string | null;
  }>;
  summary: {
    totalDonatedINR: number;
    donationCount: number;
    zakatTotalINR: number;
    khumsTotalINR: number;
    generalTotalINR: number;
  };
  compliance: {
    is80GVerified: boolean;
    statutoryDisclaimer: string;
    registrationReference: string;
  };
}

export default function DonorDashboardPage() {
  const [data, setData] = useState<DonorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'tax' | 'refunds' | 'profile'>('overview');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/donor/dashboard');
      if (res.status === 401) {
        setError('UNAUTHORIZED');
        setIsLoading(false);
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to load donor dashboard data');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Error loading dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Loading your secure donor portal...</p>
        </div>
      </div>
    );
  }

  if (error === 'UNAUTHORIZED') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Donor Authentication Required</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Please sign in to your verified patron account to access your tax certificates, giving history, and cryptographic receipts.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/admin/login?redirect=/donor/dashboard"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40"
            >
              Sign In to Donor Portal <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/donate"
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition"
            >
              Make a Direct Donation
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-red-950/20 border border-red-800/40 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Dashboard Unavailable</h2>
          <p className="text-slate-400 text-sm mb-6">{error || 'An unexpected error occurred.'}</p>
          <button
            onClick={fetchDashboard}
            className="py-2.5 px-6 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { profile, donations, refunds, summary, compliance } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/80 pt-10 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <Shield className="w-3.5 h-3.5" /> Patron Portal & Direct Giving Records
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Welcome, {profile.fullName}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Account ID: <span className="font-mono text-slate-300">{profile.email}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/donate"
                className="py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 transition flex items-center gap-2"
              >
                <Heart className="w-4 h-4" /> Donate Now
              </Link>
            </div>
          </div>

          {/* Statutory Compliance Notice Banner */}
          <div className="mt-8 p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3.5 text-xs text-slate-400">
            <Info className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Statutory Compliance Status: </span>
              {compliance.statutoryDisclaimer} (
              <span className="font-mono text-slate-300">{compliance.registrationReference}</span>)
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* Metric Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Contributed</span>
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">
              ₹{summary.totalDonatedINR.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-400 mt-1">{summary.donationCount} successful contribution(s)</p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Zakat al-Mal/Fitr</span>
              <Shield className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-black text-teal-300">
              ₹{summary.zakatTotalINR.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-400 mt-1">100% Direct Disbursement Pool</p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Khums (Sahm-e-Imam/Sadat)</span>
              <Building2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300">
              ₹{summary.khumsTotalINR.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-400 mt-1">Ijaza & Board Regulated</p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">General Sadaqah</span>
              <Heart className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-300">
              ₹{summary.generalTotalINR.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-400 mt-1">Emergency & Welfare Relief</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview & Impact', icon: Heart },
            { id: 'history', label: `Donation History (${donations.length})`, icon: FileText },
            { id: 'tax', label: 'Tax Certificates', icon: Shield },
            { id: 'refunds', label: `Refunds & Adjustments (${refunds.length})`, icon: RotateCcw },
            { id: 'profile', label: 'Donor Profile', icon: User },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm transition whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Direct Humanitarian Commitment
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                All donations to Imam E Mahdi Foundation are governed by strict sharia isolation and rigorous financial accounting. Your zakat and khums contributions are segregated into zero-administrative-fee reserves and disbursed exclusively to vetted beneficiaries.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <h4 className="font-semibold text-white text-sm mb-1">100% Zakat Policy</h4>
                  <p className="text-xs text-slate-400">Zero overhead deducted from Zakat al-Mal and Zakat al-Fitr.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <h4 className="font-semibold text-white text-sm mb-1">Cryptographic Receipts</h4>
                  <p className="text-xs text-slate-400">Every donation carries a tamper-evident HMAC-SHA256 signature.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <h4 className="font-semibold text-white text-sm mb-1">Isolated Data Privacy</h4>
                  <p className="text-xs text-slate-400">PAN and personal identifiers are encrypted with AES-256 GCM.</p>
                </div>
              </div>
            </div>

            {/* Recent Giving Table */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Recent Contributions</h3>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  View All ({donations.length})
                </button>
              </div>

              {donations.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No contributions recorded yet. Start your journey by making a donation today.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase">
                        <th className="py-3 px-4">Receipt #</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {donations.slice(0, 5).map((d) => (
                        <tr key={d.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-200">
                            {d.receiptNumber}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {d.category?.name || d.fundType}
                          </td>
                          <td className="py-3 px-4 font-bold text-white">
                            {d.currency} {d.amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                d.paymentStatus === 'SUCCESS'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : d.paymentStatus === 'PENDING' || d.paymentStatus === 'INITIATED'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}
                            >
                              {d.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-400">
                            {d.completedAt ? new Date(d.completedAt).toLocaleDateString() : new Date(d.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {d.qrVerificationHash ? (
                              <Link
                                href={`/verify/receipt/${d.qrVerificationHash}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                              >
                                View <ExternalLink className="w-3 h-3" />
                              </Link>
                            ) : (
                              <span className="text-xs text-slate-500">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Complete Contribution Records</h3>
            {donations.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No contribution history found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase">
                      <th className="py-3 px-4">Receipt Number</th>
                      <th className="py-3 px-4">Program / Category</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Payment Status</th>
                      <th className="py-3 px-4">Completion Date</th>
                      <th className="py-3 px-4 text-right">Cryptographic Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {donations.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4 font-mono font-medium text-emerald-400">
                          {d.receiptNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-200">
                          <div>{d.category?.name || d.fundType}</div>
                          {d.campaign && (
                            <div className="text-xs text-slate-400">{d.campaign.name}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {d.currency} {d.amount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono text-slate-300">
                          {d.paymentMethod}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              d.paymentStatus === 'SUCCESS'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : d.paymentStatus === 'PENDING' || d.paymentStatus === 'INITIATED'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {d.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-400">
                          {d.completedAt ? new Date(d.completedAt).toLocaleString() : 'Pending'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {d.qrVerificationHash ? (
                            <Link
                              href={`/verify/receipt/${d.qrVerificationHash}`}
                              target="_blank"
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-semibold transition border border-emerald-500/30"
                            >
                              <FileText className="w-3.5 h-3.5" /> View Receipt
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-500">Processing</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tax' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Tax Exemption Certificates & 80G Disclosures</h3>
            <p className="text-slate-400 text-xs mb-6">
              Official tax exemption documentation under Indian Income Tax Act regulations.
            </p>

            {compliance.is80GVerified ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 text-sm">
                  Section 80G verification is active for eligible donations.
                </div>
                {donations.filter((d) => d.taxReceipt).length === 0 ? (
                  <p className="text-slate-400 text-sm py-6 text-center">
                    No 80G tax certificates issued for this profile yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {donations
                      .filter((d) => d.taxReceipt)
                      .map((d) => (
                        <div
                          key={d.id}
                          className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-mono text-emerald-400 font-bold text-sm">
                              {d.taxReceipt?.certificateNumber}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              FY {d.taxReceipt?.financialYear} • Receipt: {d.receiptNumber} • ₹
                              {d.amount.toLocaleString()}
                            </div>
                          </div>
                          <Link
                            href={`/verify/receipt/${d.qrVerificationHash}`}
                            target="_blank"
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" /> Certificate
                          </Link>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-800/30 text-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-base mb-1">
                      Statutory 80G Status: Under Verification
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                      {compliance.statutoryDisclaimer}
                    </p>
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-400">
                      Entity Reference: {compliance.registrationReference}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'refunds' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Refunds & Adjustment Requests</h3>
            <p className="text-slate-400 text-xs mb-6">
              Track any refunded transactions or erroneous charge reversals.
            </p>

            {refunds.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No refund records or dispute requests found.
              </div>
            ) : (
              <div className="space-y-3">
                {refunds.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Refund for {r.donationReceiptNumber}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Reason: {r.reason} • {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">
                        {r.currency} {r.amount.toLocaleString()}
                      </div>
                      <span className="inline-block px-2 py-0.5 bg-slate-800 text-emerald-400 rounded text-xs font-mono mt-1">
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Donor Profile & Statutory Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Full Name</span>
                <p className="text-white font-semibold mt-1">{profile.fullName}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Registered Email</span>
                <p className="text-white font-mono text-sm mt-1">{profile.email}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Phone Number</span>
                <p className="text-white font-mono text-sm mt-1">{profile.phone || 'Not Provided'}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Income Tax PAN (Masked)</span>
                <p className="text-emerald-400 font-mono text-sm mt-1">
                  {profile.panMasked || 'Not Provided (Required for 80G tax certificates)'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 md:col-span-2">
                <span className="text-xs text-slate-400 font-medium">Mailing Address</span>
                <p className="text-white text-sm mt-1">
                  {[profile.addressLine1, profile.city, profile.state, profile.country]
                    .filter(Boolean)
                    .join(', ') || 'Not Provided'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
