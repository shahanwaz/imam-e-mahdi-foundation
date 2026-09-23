'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Search,
  Plus,
  RefreshCw,
  ShieldCheck,
  Scale,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  FileText,
  Briefcase,
  HelpCircle,
  Eye,
  Check,
  Clock,
  Landmark,
  FileCheck2,
} from 'lucide-react';

type ActiveTab =
  | 'SUMMARY'
  | 'INCOME_GRANTS'
  | 'EXPENSES_VENDORS'
  | 'BUDGETS_PROJECTS'
  | 'LEDGER_VOUCHERS'
  | 'BANK_RECONCILIATION'
  | 'FINANCIAL_REPORTS'
  | 'STATUTORY_RULES';

type ReportType =
  | 'INCOME_AND_EXPENDITURE'
  | 'RECEIPTS_AND_PAYMENTS'
  | 'EXPENSE_REPORT'
  | 'BUDGET_VS_ACTUAL'
  | 'PROJECT_UTILIZATION'
  | 'DONATION_REPORT'
  | 'MONTHLY_REPORT'
  | 'ANNUAL_REPORT';

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('SUMMARY');
  const [loading, setLoading] = useState<boolean>(true);
  const [summaryData, setSummaryData] = useState<any>(null);

  // Sub-data states
  const [grants, setGrants] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [reconciliations, setReconciliations] = useState<any[]>([]);
  const [statutoryConfigs, setStatutoryConfigs] = useState<any[]>([]);

  // Reports state
  const [selectedReport, setSelectedReport] = useState<ReportType>('INCOME_AND_EXPENDITURE');
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [fiscalYear, setFiscalYear] = useState<number>(2026);
  const [caReviewMode, setCaReviewMode] = useState<boolean>(false);

  // Modals / forms state
  const [showGrantModal, setShowGrantModal] = useState<boolean>(false);
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [showVendorModal, setShowVendorModal] = useState<boolean>(false);

  // New Grant Form
  const [newGrant, setNewGrant] = useState({
    fundingAgencyName: '',
    grantType: 'INSTITUTIONAL_GRANT',
    sanctionedAmountINR: 500000,
    disbursedAmountINR: 200000,
    purpose: '',
    grantStartDate: '2026-01-01',
    grantEndDate: '2026-12-31',
    complianceTerms: 'Quarterly Utilization Certificate required.',
  });

  // New Expense Form
  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'PROJECT_EXECUTION',
    amount: 25000,
    paymentMethod: 'BANK_TRANSFER_NEFT',
    paymentReference: '',
    remarks: '',
  });

  // New Vendor Form
  const [newVendor, setNewVendor] = useState({
    legalName: '',
    tradeName: '',
    category: 'SUPPLIES_MATERIALS',
    contactPerson: '',
    email: '',
    phone: '',
    panTaxId: '',
    gstNumber: '',
    bankName: 'HDFC Bank Ltd',
    bankAccountNumber: '',
    bankIfscCode: 'HDFC0000123',
  });

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/admin/finance/summary');
      const json = await res.json();
      if (json.success) setSummaryData(json.data);
    } catch (e) {
      console.error('Failed to load summary', e);
    }
  };

  const fetchTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'INCOME_GRANTS') {
        const res = await fetch('/api/admin/finance/grants');
        const json = await res.json();
        if (json.success) setGrants(json.data);
      } else if (activeTab === 'EXPENSES_VENDORS') {
        const [expRes, vndRes] = await Promise.all([
          fetch('/api/admin/finance/expenses'),
          fetch('/api/admin/finance/vendors'),
        ]);
        const [expJson, vndJson] = await Promise.all([expRes.json(), vndRes.json()]);
        if (expJson.success) setExpenses(expJson.data);
        if (vndJson.success) setVendors(vndJson.data);
      } else if (activeTab === 'BUDGETS_PROJECTS') {
        const res = await fetch(`/api/admin/finance/budgets?fiscalYear=${fiscalYear}`);
        const json = await res.json();
        if (json.success) setBudgets(json.data);
      } else if (activeTab === 'LEDGER_VOUCHERS') {
        const res = await fetch('/api/admin/finance/ledger');
        const json = await res.json();
        if (json.success) setVouchers(json.data.vouchers || []);
      } else if (activeTab === 'BANK_RECONCILIATION') {
        const res = await fetch('/api/admin/finance/reconciliation');
        const json = await res.json();
        if (json.success) setReconciliations(json.data);
      } else if (activeTab === 'STATUTORY_RULES') {
        const res = await fetch('/api/admin/finance/statutory-configs');
        const json = await res.json();
        if (json.success) setStatutoryConfigs(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch tab data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async (type: ReportType) => {
    setReportLoading(true);
    try {
      const res = await fetch(`/api/admin/finance/reports?type=${type}&fiscalYear=${fiscalYear}`);
      const json = await res.json();
      if (json.success) setReportData(json.data);
    } catch (err) {
      console.error('Failed to fetch report', err);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    if (activeTab === 'FINANCIAL_REPORTS') {
      fetchReport(selectedReport);
    } else {
      fetchTabData();
    }
  }, [activeTab, selectedReport, fiscalYear]);

  const handleExport = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      window.open(`/api/admin/finance/reports?type=${selectedReport}&fiscalYear=${fiscalYear}&format=csv`, '_blank');
    } else {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `IMF-${selectedReport}-${fiscalYear}.json`;
      a.click();
    }
  };

  const handleCreateGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/finance/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGrant),
      });
      const json = await res.json();
      if (json.success) {
        setShowGrantModal(false);
        fetchTabData();
        fetchSummary();
      }
    } catch (err) {
      console.error('Error creating grant', err);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/finance/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense),
      });
      const json = await res.json();
      if (json.success) {
        setShowExpenseModal(false);
        fetchTabData();
        fetchSummary();
      }
    } catch (err) {
      console.error('Error creating expense', err);
    }
  };

  const handleApproveExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/finance/expenses/${id}/approve`, { method: 'POST' });
      const json = await res.json();
      if (json.success) fetchTabData();
    } catch (err) {
      console.error('Error approving expense', err);
    }
  };

  const handlePayExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/finance/expenses/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentReference: `NEFT-${Date.now().toString().slice(-6)}` }),
      });
      const json = await res.json();
      if (json.success) {
        fetchTabData();
        fetchSummary();
      }
    } catch (err) {
      console.error('Error paying expense', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. MANDATORY STATUTORY AUDIT DISCLAIMER BANNER */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3.5 text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2">
            <span>REQUIRES PROFESSIONAL VERIFICATION &amp; STATUTORY AUDITOR SIGN-OFF</span>
            <span className="bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded text-[10px] font-semibold">
              Advisory
            </span>
          </div>
          <p className="text-amber-800/90 leading-relaxed">
            This system operates as an internal non-profit financial recording and management information tool (ERP).
            It enforces strict double-entry balancing and religious fund isolation. It does not replace or constitute a
            certified statutory audit, formal tax opinion, or legal certification under Section 11/12A/80G/FCRA. All
            financial statements and tax positions require formal review and sign-off by a certified Chartered Accountant
            (CA) / Statutory Auditor.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>Finance, Accounting &amp; Audit Command Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            General Ledger, Grants, CSR Funding, Budgets, Bank Reconciliation, and 8 Formal Financial Statements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchSummary();
              if (activeTab === 'FINANCIAL_REPORTS') fetchReport(selectedReport);
              else fetchTabData();
            }}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Financials</span>
          </button>
        </div>
      </div>

      {/* 2. Top Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Total Revenue YTD</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            ₹{(summaryData?.totalIncomeYTD || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400">
            Donations: ₹{(summaryData?.totalDonationIncome || 0).toLocaleString('en-IN')} | Grants: ₹
            {(summaryData?.totalGrantDisbursed || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Total Expenditures YTD</span>
            <ArrowUpRight className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            ₹{(summaryData?.totalExpensesYTD || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400">
            Direct Aid: ₹{(summaryData?.totalDirectExpenses || 0).toLocaleString('en-IN')} | Staff: ₹
            {(summaryData?.totalPayrollExpenses || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Net Operating Flow</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div
            className={`text-xl font-bold font-mono ${
              (summaryData?.netSurplusYTD || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {(summaryData?.netSurplusYTD || 0) >= 0 ? '+' : ''}₹
            {(summaryData?.netSurplusYTD || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] font-semibold text-emerald-600">
            {summaryData?.surplusStatus || 'BALANCED'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Trial Balance Status</span>
            <Scale className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-center gap-1.5">
            {summaryData?.trialBalanceStatus?.isMatched ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <Check className="w-3 h-3" /> Balanced (₹=₹)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                <AlertTriangle className="w-3 h-3" /> Imbalance Alert
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400">
            Total Debits: ₹{(summaryData?.trialBalanceStatus?.totalDebits || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Restricted Reserves</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            ₹{(summaryData?.trialBalanceStatus?.restrictedReserves || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-amber-600 font-medium">100% Direct Theological Isolation</div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="flex space-x-2 text-xs font-medium min-w-max pb-2">
          {[
            { id: 'SUMMARY', label: 'Executive Summary', icon: <PieChart className="w-4 h-4" /> },
            { id: 'INCOME_GRANTS', label: 'Grants & CSR Funding', icon: <Landmark className="w-4 h-4" /> },
            { id: 'EXPENSES_VENDORS', label: 'Expenses & Vendors', icon: <FileText className="w-4 h-4" /> },
            { id: 'BUDGETS_PROJECTS', label: 'Budgets & Project Variance', icon: <Layers className="w-4 h-4" /> },
            { id: 'LEDGER_VOUCHERS', label: 'General Ledger & Vouchers', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'BANK_RECONCILIATION', label: 'Bank Reconciliation (BRS)', icon: <CheckCircle2 className="w-4 h-4" /> },
            { id: 'FINANCIAL_REPORTS', label: 'Financial Reports (8 Statements)', icon: <FileSpreadsheet className="w-4 h-4" /> },
            { id: 'STATUTORY_RULES', label: 'Statutory Assumptions', icon: <Scale className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 4. Tab 1: Executive Summary */}
      {activeTab === 'SUMMARY' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span>Foundation Financial Governance Overview</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The Imam E Mahdi Foundation operates a strict non-profit fund accounting architecture with double-entry
              integrity. Religious reserves (Zakat al-Mal, Zakat al-Fitr, Sahm-e-Imam, Sahm-e-Sadat) are isolated from
              general operating expenses.
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Active Grants &amp; CSR Programs</span>
                <span className="font-bold text-slate-800">{summaryData?.activeGrantsCount || 0}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Registered Procurement Vendors</span>
                <span className="font-bold text-slate-800">{summaryData?.totalVendorsCount || 0}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Pending Expense Approvals</span>
                <span className="font-bold text-amber-600">{summaryData?.pendingExpensesCount || 0}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Unreconciled Bank Statements</span>
                <span className="font-bold text-indigo-600">{summaryData?.unreconciledBrsCount || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Auditor &amp; Accounting Professional Tools</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              External auditors and Chartered Accountants can review live double-entry trial balances, verify bank
              reconciliation adjustments, and export complete statutory report packs in CSV and JSON formats.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setActiveTab('FINANCIAL_REPORTS');
                  setSelectedReport('INCOME_AND_EXPENDITURE');
                }}
                className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 text-left bg-slate-50 hover:bg-slate-100 transition-all text-xs"
              >
                <div className="font-bold text-slate-900">Income &amp; Expenditure</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Surplus &amp; Deficit Statement</div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('FINANCIAL_REPORTS');
                  setSelectedReport('BUDGET_VS_ACTUAL');
                }}
                className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 text-left bg-slate-50 hover:bg-slate-100 transition-all text-xs"
              >
                <div className="font-bold text-slate-900">Budget vs Actual</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Variance &amp; Overruns</div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('FINANCIAL_REPORTS');
                  setSelectedReport('ANNUAL_REPORT');
                }}
                className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 text-left bg-slate-50 hover:bg-slate-100 transition-all text-xs"
              >
                <div className="font-bold text-slate-900">85% Non-Profit Utilization</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Statutory Accumulation</div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('BANK_RECONCILIATION');
                }}
                className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 text-left bg-slate-50 hover:bg-slate-100 transition-all text-xs"
              >
                <div className="font-bold text-slate-900">Bank Reconciliation</div>
                <div className="text-[10px] text-slate-500 mt-0.5">BRS &amp; Sign-off</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Grants & CSR Funding */}
      {activeTab === 'INCOME_GRANTS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">Institutional Grants &amp; CSR Funding Programs</h2>
            <button
              onClick={() => setShowGrantModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record New Grant / CSR</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Grant Number</th>
                  <th className="px-4 py-3">Funding Agency</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Sanctioned (INR)</th>
                  <th className="px-4 py-3">Disbursed (INR)</th>
                  <th className="px-4 py-3">Balance (INR)</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grants.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      No institutional grants recorded yet. Click &ldquo;Record New Grant&rdquo; to add.
                    </td>
                  </tr>
                ) : (
                  grants.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{g.grantNumber}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{g.fundingAgencyName}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium">
                          {g.grantType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold">
                        ₹{Number(g.sanctionedAmountINR).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-600 font-semibold">
                        ₹{Number(g.disbursedAmountINR).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">
                        ₹{Number(g.balanceAmountINR).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {new Date(g.grantStartDate).toLocaleDateString()} &ndash;{' '}
                        {new Date(g.grantEndDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {g.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Expenses & Vendors */}
      {activeTab === 'EXPENSES_VENDORS' && (
        <div className="space-y-6">
          {/* Expenses Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">Direct Operational &amp; Project Expenses</h3>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Expense</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Expense #</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment Method</th>
                    <th className="px-4 py-3">Vendor / Project</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        No expenses recorded yet. Click &ldquo;Record Expense&rdquo; to add.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-slate-800">{e.expenseNumber}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{e.title}</td>
                        <td className="px-4 py-3 text-slate-600">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px]">{e.category}</span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          ₹{Number(e.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{e.paymentMethod}</td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">
                          {e.vendor?.legalName || e.project?.title || 'General'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              e.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : e.status === 'APPROVED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {e.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 space-x-1">
                          {e.status === 'DRAFT' || e.status === 'SUBMITTED' ? (
                            <button
                              onClick={() => handleApproveExpense(e.id)}
                              className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-semibold"
                            >
                              Approve
                            </button>
                          ) : null}
                          {e.status === 'APPROVED' ? (
                            <button
                              onClick={() => handlePayExpense(e.id)}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-semibold"
                            >
                              Pay &amp; Post GL
                            </button>
                          ) : null}
                          {e.status === 'PAID' ? (
                            <span className="text-[10px] text-emerald-600 font-medium">Posted</span>
                          ) : null}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vendors Section */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">Approved Suppliers &amp; Vendor Registry</h3>
              <button
                onClick={() => setShowVendorModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Vendor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vendors.map((v) => (
                <div key={v.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-500">{v.vendorCode}</div>
                      <div className="font-bold text-slate-900 text-sm">{v.legalName}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600">
                      {v.category}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <div>Contact: {v.contactPerson} ({v.phone})</div>
                    <div>PAN: {v.panTaxId || 'N/A'} | GST: {v.gstNumber || 'N/A'}</div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Bank: {v.bankName} (Ac: {v.bankAccountNumber || '••••••••'})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. Tab 4: Budgets & Project Utilization */}
      {activeTab === 'BUDGETS_PROJECTS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">Annual Institutional Budgets &amp; Line Allocation</h2>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-medium">Fiscal Year:</label>
              <select
                value={fiscalYear}
                onChange={(e) => setFiscalYear(parseInt(e.target.value, 10))}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value={2026}>FY 2026</option>
                <option value={2025}>FY 2025</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Budget Code</th>
                  <th className="px-4 py-3">Title / Line</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Allocated (INR)</th>
                  <th className="px-4 py-3">Spent (INR)</th>
                  <th className="px-4 py-3">Variance (INR)</th>
                  <th className="px-4 py-3">Utilization %</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      No budgets initialized for FY {fiscalYear}.
                    </td>
                  </tr>
                ) : (
                  budgets.flatMap((b) =>
                    b.lines.map((l: any) => {
                      const allocated = Number(l.allocatedAmountINR);
                      const spent = Number(l.spentAmountINR);
                      const variance = allocated - spent;
                      const pct = allocated > 0 ? (spent / allocated) * 100 : 0;
                      return (
                        <tr key={l.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-mono font-bold text-slate-800">{l.lineCode}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{l.title}</td>
                          <td className="px-4 py-3 text-slate-600">{l.category}</td>
                          <td className="px-4 py-3 font-mono font-semibold">₹{allocated.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 font-mono text-rose-600 font-semibold">
                            ₹{spent.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold text-emerald-600">
                            ₹{variance.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold">{pct.toFixed(1)}%</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                spent > allocated
                                  ? 'bg-rose-100 text-rose-800'
                                  : pct >= 80
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {spent > allocated ? 'OVER_BUDGET' : pct >= 80 ? 'HIGH_UTILIZATION' : 'HEALTHY'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Tab 5: General Ledger & Vouchers */}
      {activeTab === 'LEDGER_VOUCHERS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">Double-Entry Journal &amp; Payment Vouchers</h2>
            <div className="text-xs text-slate-500 font-mono">
              Debits: ₹{(summaryData?.trialBalanceStatus?.totalDebits || 0).toLocaleString('en-IN')} === Credits: ₹
              {(summaryData?.trialBalanceStatus?.totalCredits || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Voucher #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Narration</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Debit / Credit Particulars</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vouchers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No vouchers found in general ledger.
                    </td>
                  </tr>
                ) : (
                  vouchers.slice(0, 15).map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{v.voucherNumber}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(v.voucherDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-[10px]">
                          {v.voucherType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{v.narration}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        ₹{Number(v.totalAmount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-500 font-mono">
                        {v.entries?.length || 2} Balanced Entries
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. Tab 6: Bank Reconciliation */}
      {activeTab === 'BANK_RECONCILIATION' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">Bank Reconciliation Statements (BRS)</h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Reconciliation Code</th>
                  <th className="px-4 py-3">Bank Account</th>
                  <th className="px-4 py-3">Statement Date</th>
                  <th className="px-4 py-3">Bank Closing Balance</th>
                  <th className="px-4 py-3">Book Closing Balance</th>
                  <th className="px-4 py-3">Discrepancy</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reconciliations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No bank reconciliation statements created yet.
                    </td>
                  </tr>
                ) : (
                  reconciliations.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{r.reconCode}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {r.accountHead?.name || 'Central Trust Account'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{new Date(r.statementDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-mono font-semibold">
                        ₹{Number(r.statementClosingBalance).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold">
                        ₹{Number(r.bookClosingBalance).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-600">
                        ₹{Number(r.discrepancyAmount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            r.status === 'RECONCILED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 10. Tab 7: Financial Reports (8 Statements) */}
      {activeTab === 'FINANCIAL_REPORTS' && (
        <div className="space-y-6">
          {/* Report Selector Header */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-bold text-slate-700">Select Statement:</label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value as ReportType)}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="INCOME_AND_EXPENDITURE">1. Income &amp; Expenditure Statement</option>
                <option value="RECEIPTS_AND_PAYMENTS">2. Receipts &amp; Payments Account</option>
                <option value="EXPENSE_REPORT">3. Granular Expense Report</option>
                <option value="BUDGET_VS_ACTUAL">4. Budget vs Actual Comparison</option>
                <option value="PROJECT_UTILIZATION">5. Project Utilization Report</option>
                <option value="DONATION_REPORT">6. Donation &amp; Funding Stream Report</option>
                <option value="MONTHLY_REPORT">7. Monthly Trend &amp; Flow Report</option>
                <option value="ANNUAL_REPORT">8. Annual Report &amp; 85% Statutory Quota</option>
              </select>

              <select
                value={fiscalYear}
                onChange={(e) => setFiscalYear(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white"
              >
                <option value={2026}>FY 2026</option>
                <option value={2025}>FY 2025</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCaReviewMode(!caReviewMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  caReviewMode
                    ? 'bg-indigo-900 text-white border-indigo-900'
                    : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                {caReviewMode ? '✓ CA Review Mode Active' : 'Enable CA Review Mode'}
              </button>

              <button
                onClick={() => handleExport('csv')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => handleExport('json')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Export JSON (Audit)</span>
              </button>
            </div>
          </div>

          {/* Report Viewer Container */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-slate-900">
                  {selectedReport.replace(/_/g, ' ')}
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  Imam E Mahdi Foundation &bull; Fiscal Year {fiscalYear} &bull; Generated{' '}
                  {new Date().toLocaleDateString()}
                </div>
              </div>
              <div className="text-right text-[10px] font-mono text-slate-400">
                <div>HASH: {reportData ? 'VALIDATED_GL_INTEGRITY' : 'PENDING'}</div>
                <div>STANDARD: DOUBLE_ENTRY_BALANCED</div>
              </div>
            </div>

            {reportLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Generating report data...</div>
            ) : reportData ? (
              <div className="space-y-6">
                {/* 1. Income & Expenditure Rendering */}
                {selectedReport === 'INCOME_AND_EXPENDITURE' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                      <div className="font-bold text-xs text-emerald-900 uppercase tracking-wider">
                        Revenues &amp; Incomes (INR)
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">General Public Donations</span>
                          <span className="font-mono font-bold">
                            ₹{(reportData.income?.donations || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Institutional Grants</span>
                          <span className="font-mono font-bold">
                            ₹{(reportData.income?.institutionalGrants || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Corporate CSR Funding</span>
                          <span className="font-mono font-bold">
                            ₹{(reportData.income?.csrFunding || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-emerald-200 text-emerald-900 font-bold">
                          <span>TOTAL REVENUE</span>
                          <span className="font-mono">
                            ₹{(reportData.income?.totalIncome || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                      <div className="font-bold text-xs text-rose-900 uppercase tracking-wider">
                        Expenditures &amp; Operational Costs (INR)
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Direct Humanitarian Relief Aid</span>
                          <span className="font-mono font-bold">
                            ₹{(reportData.expenditure?.directProjectAid || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Staff Compensation &amp; Payroll</span>
                          <span className="font-mono font-bold">
                            ₹{(reportData.expenditure?.staffSalariesGross || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Administrative &amp; Facilities</span>
                          <span className="font-mono font-bold">
                            ₹{(reportData.expenditure?.adminOverhead || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-rose-200 text-rose-900 font-bold">
                          <span>TOTAL EXPENDITURE</span>
                          <span className="font-mono">
                            ₹{(reportData.expenditure?.totalExpenditure || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Budget vs Actual Rendering */}
                {selectedReport === 'BUDGET_VS_ACTUAL' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                        <tr>
                          <th className="px-3 py-2">Line</th>
                          <th className="px-3 py-2">Title</th>
                          <th className="px-3 py-2">Category</th>
                          <th className="px-3 py-2">Allocated</th>
                          <th className="px-3 py-2">Spent</th>
                          <th className="px-3 py-2">Variance</th>
                          <th className="px-3 py-2">Utilization</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reportData.lines?.map((l: any, idx: number) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 font-mono font-bold">{l.lineCode}</td>
                            <td className="px-3 py-2">{l.title}</td>
                            <td className="px-3 py-2 text-slate-500">{l.category}</td>
                            <td className="px-3 py-2 font-mono">₹{l.allocatedAmountINR.toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2 font-mono text-rose-600">
                              ₹{l.spentAmountINR.toLocaleString('en-IN')}
                            </td>
                            <td className="px-3 py-2 font-mono text-emerald-600">
                              ₹{l.varianceINR.toLocaleString('en-IN')}
                            </td>
                            <td className="px-3 py-2 font-mono font-bold">{l.utilizationPercent}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 3. Annual Statutory 85% Accumulation */}
                {selectedReport === 'ANNUAL_REPORT' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2">
                      <div className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                        85% Non-Profit Statutory Utilization Analysis (Section 11/12A Model)
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
                        <div>
                          <div className="text-slate-500">Minimum Required Application (85%)</div>
                          <div className="text-base font-bold font-mono text-indigo-900">
                            ₹
                            {(
                              reportData.statutory85PercentRuleAnalysis?.minimumRequiredApplicationINR || 0
                            ).toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500">Actual Application Achieved</div>
                          <div className="text-base font-bold font-mono text-emerald-700">
                            ₹
                            {(
                              reportData.statutory85PercentRuleAnalysis?.actualApplicationAchievedINR || 0
                            ).toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500">Target Compliance Status</div>
                          <div className="text-base font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                            <Check className="w-4 h-4" />
                            <span>
                              {reportData.statutory85PercentRuleAnalysis?.isStatutoryTargetSatisfied
                                ? 'Target Satisfied'
                                : 'Accumulation Required'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generic Raw / Summary Rendering */}
                {selectedReport !== 'INCOME_AND_EXPENDITURE' &&
                  selectedReport !== 'BUDGET_VS_ACTUAL' &&
                  selectedReport !== 'ANNUAL_REPORT' && (
                    <div className="p-4 bg-slate-50 rounded-xl font-mono text-xs overflow-x-auto">
                      <pre>{JSON.stringify(reportData, null, 2)}</pre>
                    </div>
                  )}

                {/* Footer Disclaimer */}
                <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 italic">
                  {reportData.disclaimer}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* 11. Tab 8: Statutory Assumptions */}
      {activeTab === 'STATUTORY_RULES' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">Configurable Statutory &amp; Audit Assumptions</h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Rule Code</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Rule Name</th>
                  <th className="px-4 py-3">Disclaimer Tag</th>
                  <th className="px-4 py-3">Auditor Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statutoryConfigs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">
                      Standard non-profit rule set active: 85% charitable utilization target &amp; Corpus capitalization.
                    </td>
                  </tr>
                ) : (
                  statutoryConfigs.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{c.configKey}</td>
                      <td className="px-4 py-3 text-slate-600">{c.configCategory}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{c.ruleName}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                          {c.disclaimerTag}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-emerald-600 font-semibold">
                        {c.verifiedByAuditor ? 'Verified' : 'Review Pending'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Record New Grant */}
      {showGrantModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Record Institutional Grant / CSR Program</h3>
            <form onSubmit={handleCreateGrant} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700">Funding Agency Name</label>
                <input
                  type="text"
                  required
                  value={newGrant.fundingAgencyName}
                  onChange={(e) => setNewGrant({ ...newGrant, fundingAgencyName: e.target.value })}
                  placeholder="e.g. Tata Trusts / Bill & Melinda Gates Foundation"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700">Grant Type</label>
                  <select
                    value={newGrant.grantType}
                    onChange={(e) => setNewGrant({ ...newGrant, grantType: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="INSTITUTIONAL_GRANT">Institutional Grant</option>
                    <option value="CSR_CORPORATE">CSR Corporate</option>
                    <option value="GOVERNMENT_SUBSIDY">Govt Subsidy</option>
                    <option value="FOUNDATION_TRUST">Foundation Trust</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700">Sanctioned Amount (INR)</label>
                  <input
                    type="number"
                    required
                    value={newGrant.sanctionedAmountINR}
                    onChange={(e) => setNewGrant({ ...newGrant, sanctionedAmountINR: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700">Purpose &amp; Objective</label>
                <textarea
                  required
                  rows={2}
                  value={newGrant.purpose}
                  onChange={(e) => setNewGrant({ ...newGrant, purpose: e.target.value })}
                  placeholder="e.g. Clean drinking water filtration plants in rural district"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-semibold"
                >
                  Create Grant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Record Expense */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Record Direct Operational / Project Expense</h3>
            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700">Expense Title</label>
                <input
                  type="text"
                  required
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  placeholder="e.g. Procurement of 500 Medical Dialysis Kits"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="PROJECT_EXECUTION">Project Execution</option>
                    <option value="RELIEF_AID_DIRECT">Relief Aid Direct</option>
                    <option value="FIELD_LOGISTICS">Field Logistics</option>
                    <option value="ADMINISTRATIVE_OVERHEAD">Admin Overhead</option>
                    <option value="UTILITIES_RENT">Utilities &amp; Rent</option>
                    <option value="LEGAL_AND_AUDIT">Legal &amp; Audit</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700">Amount (INR)</label>
                  <input
                    type="number"
                    required
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-semibold"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
