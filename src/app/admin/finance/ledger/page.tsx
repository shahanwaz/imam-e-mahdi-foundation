'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  ArrowDownRight, 
  ArrowUpRight, 
  FileCheck2, 
  RefreshCw, 
  ShieldCheck, 
  Scale, 
  Coins, 
  Calendar 
} from 'lucide-react';

interface AccountHeadItem {
  id: string;
  accountCode: string;
  name: string;
  accountType: string;
  isRestricted: boolean;
  currentBalance: number;
}

interface VoucherItem {
  id: string;
  voucherNumber: string;
  voucherDate: string;
  voucherType: string;
  narration: string;
  totalAmount: number;
  entries: Array<{
    id: string;
    accountHead: {
      accountCode: string;
      name: string;
      accountType: string;
      isRestricted: boolean;
    };
    debitAmount: number;
    creditAmount: number;
    particulars?: string;
  }>;
}

export default function AdminFinanceLedgerPage() {
  const [accountHeads, setAccountHeads] = useState<AccountHeadItem[]>([]);
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [ledgerSummary, setLedgerSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'VOUCHERS' | 'COA' | 'TRIAL_BALANCE'>('VOUCHERS');
  const [search, setSearch] = useState<string>('');

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/finance/ledger?search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (json.success) {
        setAccountHeads(json.data.accountHeads || []);
        setVouchers(json.data.vouchers || []);
        setLedgerSummary(json.data.ledgerSummary || null);
      }
    } catch (err) {
      console.error('Failed to fetch ledger data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            General Ledger &amp; Double-Entry Accounting
          </h1>
          <p className="text-xs text-slate-500">
            Audited financial records with strict non-profit fund segregation, automatic clearing-to-reserve journal entries, and real-time trial balance balancing.
          </p>
        </div>

        <button
          onClick={() => fetchLedger()}
          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Recompute Trial Balance</span>
        </button>
      </div>

      {/* Trial Balance Health Banner */}
      {ledgerSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Debits (INR)</span>
            <div className="text-xl font-serif font-bold text-slate-900">
              ₹ {Number(ledgerSummary.totalDebits || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500">Assets &amp; Liquid Balances</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Credits (INR)</span>
            <div className="text-xl font-serif font-bold text-slate-900">
              ₹ {Number(ledgerSummary.totalCredits || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500">Restricted Reserves &amp; Income</div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-900 shadow-sm space-y-1">
            <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">Trial Balance Status</span>
            <div className="text-lg font-bold text-emerald-300 flex items-center gap-2">
              <Scale className="w-5 h-5 text-gold-400" />
              <span>{ledgerSummary.isTrialBalanceMatched ? 'PERFECTLY BALANCED' : 'IMBALANCE DETECTED'}</span>
            </div>
            <div className="text-[11px] text-emerald-200">
              &Sigma; Debits === &Sigma; Credits (&Delta; 0.00)
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-amber-200 shadow-sm space-y-1">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Restricted Reserves</span>
            <div className="text-xl font-serif font-bold text-emerald-950">
              ₹ {Number(ledgerSummary.totalRestrictedReserves || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-amber-800 font-semibold">
              Isolated Sharia Fund Balances
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('VOUCHERS')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'VOUCHERS'
              ? 'bg-emerald-950 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Double-Entry Journal Vouchers ({vouchers.length})
        </button>

        <button
          onClick={() => setActiveTab('COA')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'COA'
              ? 'bg-emerald-950 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Chart of Accounts ({accountHeads.length})
        </button>

        <button
          onClick={() => setActiveTab('TRIAL_BALANCE')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'TRIAL_BALANCE'
              ? 'bg-emerald-950 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Religious Reserves &amp; Trial Balance
        </button>
      </div>

      {/* TAB 1: Journal Vouchers */}
      {activeTab === 'VOUCHERS' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500 animate-pulse">
              Loading double-entry journal vouchers...
            </div>
          ) : vouchers.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              No journal vouchers generated yet.
            </div>
          ) : (
            vouchers.map((v) => (
              <div key={v.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
                {/* Voucher Header */}
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-emerald-950 bg-emerald-100 px-2.5 py-1 rounded-md text-xs">
                      {v.voucherNumber}
                    </span>
                    <span className="font-semibold text-slate-800">{v.narration}</span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-500 text-[11px] font-mono">
                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                      {v.voucherType}
                    </span>
                    <span>{new Date(v.voucherDate).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Balanced Entries Table */}
                <div className="p-4">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 font-mono text-[10px] uppercase border-b border-slate-100 pb-1">
                        <th className="py-1.5">Account Code &amp; Name</th>
                        <th className="py-1.5">Particulars / Narration</th>
                        <th className="py-1.5">Type</th>
                        <th className="py-1.5 text-right">Debit (INR)</th>
                        <th className="py-1.5 text-right">Credit (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {v.entries.map((entry) => (
                        <tr key={entry.id}>
                          <td className="py-2">
                            <span className="font-bold text-slate-900">{entry.accountHead?.accountCode}</span>
                            <span className="text-slate-600 ml-2 font-sans font-medium">{entry.accountHead?.name}</span>
                          </td>
                          <td className="py-2 font-sans text-slate-500 text-[11px]">
                            {entry.particulars || '-'}
                          </td>
                          <td className="py-2 font-sans text-slate-500 text-[11px]">
                            {entry.accountHead?.accountType}
                          </td>
                          <td className="py-2 text-right font-bold text-emerald-950">
                            {Number(entry.debitAmount) > 0 ? `₹ ${Number(entry.debitAmount).toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="py-2 text-right font-bold text-slate-900">
                            {Number(entry.creditAmount) > 0 ? `₹ ${Number(entry.creditAmount).toLocaleString('en-IN')}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Chart of Accounts */}
      {activeTab === 'COA' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Account Code</th>
                  <th className="py-3 px-4">Account Name</th>
                  <th className="py-3 px-4">Classification Type</th>
                  <th className="py-3 px-4">Reserve Restriction</th>
                  <th className="py-3 px-4 text-right">Current Ledger Balance (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accountHeads.map((head) => (
                  <tr key={head.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-950">
                      {head.accountCode}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {head.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        head.accountType === 'ASSET'
                          ? 'bg-blue-100 text-blue-900'
                          : head.accountType === 'EQUITY_RESERVE'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {head.accountType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {head.isRestricted ? (
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px] font-bold">
                          RESTRICTED RESERVE
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">UNRESTRICTED</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-slate-900">
                      ₹ {Number(head.currentBalance).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Trial Balance & Restricted Pool Verification */}
      {activeTab === 'TRIAL_BALANCE' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-serif font-bold text-slate-900">
              Statutory Restricted Religious Reserves Summary
            </h3>
            <p className="text-xs text-slate-500">
              Complete isolation of Zakat, Khums, and general charity funds as required by Islamic jurisprudence and non-profit trust laws.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-emerald-950 font-bold">Zakat al-Mal Clearing &amp; Reserve</strong>
                <span className="bg-emerald-100 text-emerald-900 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                  2010-ZAKAT-MAL-RESERVE
                </span>
              </div>
              <p className="text-emerald-800 text-[11px]">
                100% Direct policy. Zero administrative fees deducted. Disbursed strictly to vetted Faqir / Miskeen recipients.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-amber-950 font-bold">Khums Sahm-e-Imam &amp; Sahm-e-Sadat</strong>
                <span className="bg-amber-100 text-amber-900 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                  2020 &amp; 2030 RESERVES
                </span>
              </div>
              <p className="text-amber-800 text-[11px]">
                Restricted for religious scholarship education and verified destitute Sadat families under Board of Trustees oversight.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
