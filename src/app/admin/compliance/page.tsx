'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Calendar,
  FileText,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  ExternalLink,
  Eye,
  Lock,
  Building2,
  Scale,
  Award,
  BellRing,
  Sparkles,
  Info,
  RefreshCw,
  UserCheck,
  CheckCheck,
} from 'lucide-react';
import { MANDATORY_STATUTORY_DISCLAIMER } from '@/lib/compliance/statutory-catalog';

export default function ComplianceManagementPage() {
  const [activeTab, setActiveTab] = useState<'CALENDAR' | 'VAULT' | 'VERIFICATIONS'>('CALENDAR');
  const [calendarItems, setCalendarItems] = useState<any[]>([]);
  const [vaultDocuments, setVaultDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('2025-26');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showMarkFiledModal, setShowMarkFiledModal] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState<any>(null);

  // Form inputs
  const [verifyForm, setVerifyForm] = useState({
    verificationStatus: 'VERIFIED_BY_CHARTERED_ACCOUNTANT',
    verifiedByProfessionalName: '',
    professionalRegnNumber: '',
    professionalFirmName: '',
    verificationNotes: '',
  });

  const [markFiledForm, setMarkFiledForm] = useState({
    filingDate: new Date().toISOString().split('T')[0],
    acknowledgementNumber: '',
    statutoryDocumentId: '',
  });

  const [uploadDocForm, setUploadDocForm] = useState({
    category: 'INCORPORATION_GOVERNANCE',
    documentType: 'MOA',
    title: '',
    description: '',
    registrationNumber: '',
    issuingAuthority: 'Ministry of Corporate Affairs',
    effectiveDate: '',
    expiryDate: '',
    isPerpetual: true,
    fileUrl: '',
    isConfidential: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchComplianceData();
  }, [selectedFiscalYear]);

  async function fetchComplianceData() {
    setLoading(true);
    try {
      // 1. Fetch Calendar
      const calRes = await fetch(`/api/admin/compliance/calendar?fiscalYear=${selectedFiscalYear}`);
      if (calRes.ok) {
        const calData = await calRes.json().catch(() => null);
        if (calData?.success && Array.isArray(calData.data)) {
          setCalendarItems(calData.data);
        }
      }

      // 2. Fetch Vault Documents
      const vaultRes = await fetch('/api/admin/compliance/vault');
      if (vaultRes.ok) {
        const vaultData = await vaultRes.json().catch(() => null);
        if (vaultData?.success && Array.isArray(vaultData.data)) {
          setVaultDocuments(vaultData.data);
        }
      }
    } catch (err: any) {
      console.error('Error loading compliance data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSeedCalendar = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/compliance/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seedFiscalYear: selectedFiscalYear,
          defaultEmail: 'compliance@imf.org',
          defaultName: 'Statutory Compliance Lead',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAlertMessage({ text: `Standard compliance calendar seeded for FY ${selectedFiscalYear}!`, type: 'success' });
        fetchComplianceData();
      } else {
        setAlertMessage({ text: json.error || 'Failed to seed calendar', type: 'error' });
      }
    } catch (err: any) {
      setAlertMessage({ text: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerReminders = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/compliance/reminders', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setAlertMessage({ text: `Compliance reminder scan complete: ${json.data?.length || 0} alerts processed!`, type: 'success' });
      }
    } catch (err: any) {
      setAlertMessage({ text: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAction) return;
    setIsSubmitting(true);

    try {
      const isCalendarItem = Boolean(selectedItemForAction.itemCode);
      const url = isCalendarItem
        ? `/api/admin/compliance/calendar/${selectedItemForAction.id}`
        : `/api/admin/compliance/vault/${selectedItemForAction.id}`;

      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationAction: true,
          ...verifyForm,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAlertMessage({ text: 'Professional CA/CS verification recorded successfully!', type: 'success' });
        setShowVerifyModal(false);
        fetchComplianceData();
      } else {
        setAlertMessage({ text: json.error || 'Verification record failed', type: 'error' });
      }
    } catch (err: any) {
      setAlertMessage({ text: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkFiled = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAction) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/compliance/calendar/${selectedItemForAction.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markCompleted: true,
          filingDate: markFiledForm.filingDate,
          acknowledgementNumber: markFiledForm.acknowledgementNumber,
          statutoryDocumentId: markFiledForm.statutoryDocumentId || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAlertMessage({ text: 'Statutory filing marked as completed with acknowledgement!', type: 'success' });
        setShowMarkFiledModal(false);
        fetchComplianceData();
      } else {
        setAlertMessage({ text: json.error || 'Filing update failed', type: 'error' });
      }
    } catch (err: any) {
      setAlertMessage({ text: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/compliance/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadDocForm),
      });
      const json = await res.json();
      if (json.success) {
        setAlertMessage({ text: `Document ${json.data?.documentCode} successfully archived into vault!`, type: 'success' });
        setShowUploadModal(false);
        fetchComplianceData();
      } else {
        setAlertMessage({ text: json.error || 'Upload failed', type: 'error' });
      }
    } catch (err: any) {
      setAlertMessage({ text: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Metrics
  const totalCalendar = calendarItems.length;
  const overdueCount = calendarItems.filter((i) => i.isOverdue || i.status === 'OVERDUE').length;
  const completedCount = calendarItems.filter((i) => i.status === 'COMPLETED').length;
  const pendingCount = calendarItems.filter((i) => i.status === 'PENDING' || i.status === 'IN_PROGRESS').length;
  const unverifiedCount = calendarItems.filter((i) => i.verificationStatus === 'REQUIRES_PROFESSIONAL_VERIFICATION' || i.verificationStatus === 'UNVERIFIED').length;

  // Filtered lists
  const filteredCalendar = calendarItems.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.requirementName?.toLowerCase().includes(q) ||
        item.itemCode?.toLowerCase().includes(q) ||
        item.statutoryAuthority?.toLowerCase().includes(q) ||
        item.responsiblePersonName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredVault = vaultDocuments.filter((doc) => {
    if (selectedCategory !== 'ALL' && doc.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        doc.title?.toLowerCase().includes(q) ||
        doc.documentCode?.toLowerCase().includes(q) ||
        doc.registrationNumber?.toLowerCase().includes(q) ||
        doc.issuingAuthority?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Alert Banner */}
      {alertMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-semibold transition animate-fade-in ${
            alertMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
            <span>{alertMessage.text}</span>
          </div>
          <button onClick={() => setAlertMessage(null)} className="text-xs font-bold underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Mandatory Statutory Safe Harbor Disclaimer Banner */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
            <Scale className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                Statutory Tracking Safeguard
              </span>
              <span className="text-[11px] font-mono text-amber-800 font-bold">
                MANDATORY NON-ADVISORY SAFE HARBOR
              </span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed font-medium">
              <strong>Important Legal Notice:</strong> This compliance system is strictly an administrative tracking and document management platform. It does <strong>NOT</strong> provide legal approval, government certification, tax advice, or professional legal counsel. Where filings or registrations lack verified external authority receipts, entries are explicitly tagged:
              <span className="ml-1 inline-block px-2 py-0.5 bg-amber-200 text-amber-950 font-mono font-bold text-[10px] rounded">
                REQUIRES ORGANIZATIONAL / CA / CS / LEGAL VERIFICATION
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gold-600 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-gold-600" />
            <span>Governance &amp; Statutory Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950 mt-1">
            Compliance &amp; Document Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Indian Section 8 NGO Statutory Calendar • Document Vault • CA/CS Verification
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedFiscalYear}
            onChange={(e) => setSelectedFiscalYear(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 cursor-pointer"
          >
            <option value="2024-25">FY 2024-25</option>
            <option value="2025-26">FY 2025-26 (Current)</option>
            <option value="2026-27">FY 2026-27</option>
          </select>

          <button
            onClick={handleSeedCalendar}
            disabled={isSubmitting}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition shadow-sm cursor-pointer disabled:opacity-50"
            title="Auto-populate standard Indian non-profit statutory calendar items"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Auto-Seed FY Calendar</span>
          </button>

          <button
            onClick={handleTriggerReminders}
            disabled={isSubmitting}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 transition shadow-sm cursor-pointer disabled:opacity-50"
            title="Scan upcoming due dates and dispatch reminders via Email/SMS/In-App"
          >
            <BellRing className="w-3.5 h-3.5 text-gold-400" />
            <span>Dispatch Reminders</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-950 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-900 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Archive Document</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Tracked Filings</span>
            <Calendar className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">{totalCalendar}</div>
          <p className="text-[11px] text-slate-500">Obligations for FY {selectedFiscalYear}</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Overdue Deadlines</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className={`text-2xl sm:text-3xl font-bold ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {overdueCount}
          </div>
          <p className="text-[11px] text-rose-600 font-medium">Requires immediate action</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Completed Filings</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700">{completedCount}</div>
          <p className="text-[11px] text-emerald-700 font-medium">Filed with Ack/SRN</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Vault Documents</span>
            <Lock className="w-4 h-4 text-gold-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">{vaultDocuments.length}</div>
          <p className="text-[11px] text-slate-500">Statutory &amp; legal files</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Unverified</span>
            <Scale className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-700">{unverifiedCount}</div>
          <p className="text-[11px] text-amber-700 font-medium">Awaiting CA/CS Sign-off</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('CALENDAR')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'CALENDAR' ? 'bg-emerald-950 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Statutory Compliance Calendar</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-800 text-[10px] text-emerald-200 font-mono">
            {calendarItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('VAULT')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'VAULT' ? 'bg-emerald-950 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Statutory Document Vault</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-800 text-[10px] text-emerald-200 font-mono">
            {vaultDocuments.length}
          </span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search obligations, acts, authorities, PAN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statutory Categories</option>
            <option value="INCORPORATION_GOVERNANCE">Incorporation &amp; Governance</option>
            <option value="DIRECT_TAX_12A_80G">Direct Tax (12A / 80G / 10BD)</option>
            <option value="INDIRECT_TAX_GST_PT">Indirect Tax (GST / PT)</option>
            <option value="FCRA_FOREIGN_CONTRIBUTION">FCRA (Foreign Contribution)</option>
            <option value="CSR_CORPORATE_GRANTS">CSR Corporate Grants (CSR-1)</option>
            <option value="STATUTORY_AUDIT_ACCOUNTS">Statutory Audit &amp; Form 10B</option>
            <option value="ANNUAL_STATUTORY_FILINGS">Annual ROC Filings (AOC-4/MGT-7)</option>
            <option value="ORGANIZATIONAL_POLICIES">Organizational Policies</option>
            <option value="LEGAL_AGREEMENTS_CONTRACTS">Contracts &amp; Leases</option>
            <option value="LABOUR_EPF_ESIC">Labour, EPF &amp; ESIC</option>
          </select>

          {activeTab === 'CALENDAR' && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
              <option value="COMPLETED">Completed</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center bg-white rounded-3xl border border-slate-200">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-900 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading statutory compliance registers...</p>
          </div>
        </div>
      ) : activeTab === 'CALENDAR' ? (
        /* TAB 1: COMPLIANCE CALENDAR */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredCalendar.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-4">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">No Compliance Obligations Scheduled</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click &ldquo;Auto-Seed FY Calendar&rdquo; to automatically load standard Section 8 non-profit filings (10BD, AOC-4, MGT-7, ITR-7, 10B/10BB, TDS).
                </p>
              </div>
              <button
                onClick={handleSeedCalendar}
                className="px-4 py-2 rounded-xl bg-emerald-950 text-white text-xs font-bold hover:bg-emerald-900 cursor-pointer inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Auto-Seed Standard Calendar</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Requirement &amp; Authority</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Responsible Person</th>
                    <th className="py-3.5 px-4">Filing Status</th>
                    <th className="py-3.5 px-4">Professional Verification</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCalendar.map((item) => {
                    const isOverdue = item.isOverdue || item.status === 'OVERDUE';
                    const isCompleted = item.status === 'COMPLETED';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-4 space-y-1">
                          <div className="font-bold text-slate-900 text-xs">{item.requirementName}</div>
                          <div className="text-[11px] text-slate-500">
                            <span className="font-semibold text-emerald-900">{item.statutoryAuthority}</span> &bull; {item.applicableActOrRule}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">Code: {item.itemCode}</div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-800">
                            {new Date(item.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          {isOverdue && !isCompleted && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 animate-pulse">
                              OVERDUE
                            </span>
                          )}
                          {isCompleted && item.filingDate && (
                            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                              Filed on: {new Date(item.filingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap space-y-0.5">
                          <div className="font-semibold text-slate-800">{item.responsiblePersonName}</div>
                          <div className="text-[11px] text-slate-500">{item.responsiblePersonRole}</div>
                          <div className="text-[10px] font-mono text-slate-400">{item.responsiblePersonEmail}</div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : isOverdue
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {item.status}
                          </span>
                          {item.acknowledgementNumber && (
                            <div className="text-[10px] font-mono text-slate-600 mt-1">
                              Ack: <strong>{item.acknowledgementNumber}</strong>
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4 space-y-1">
                          {item.verificationStatus === 'VERIFIED_BY_CHARTERED_ACCOUNTANT' ||
                          item.verificationStatus === 'VERIFIED_BY_COMPANY_SECRETARY' ||
                          item.verificationStatus === 'VERIFIED_BY_LEGAL_COUNSEL' ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {item.verificationStatus.replace(/_/g, ' ')}
                              </span>
                              <div className="text-[10px] text-slate-500 font-mono">
                                By: {item.verifiedByProfessionalName} ({item.professionalRegnNumber})
                              </div>
                            </div>
                          ) : (
                            <span className="inline-block text-[10px] font-mono font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                              REQUIRES CA / CS / LEGAL VERIFICATION
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                          {!isCompleted && (
                            <button
                              onClick={() => {
                                setSelectedItemForAction(item);
                                setShowMarkFiledModal(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-950 text-white font-bold text-[11px] hover:bg-emerald-900 cursor-pointer"
                            >
                              Mark Filed
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedItemForAction(item);
                              setShowVerifyModal(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 font-bold text-[11px] cursor-pointer"
                          >
                            Verify (CA/CS)
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: STATUTORY DOCUMENT VAULT */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVault.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl border border-slate-200 text-center py-16 px-4 space-y-3">
              <Lock className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Vault is Empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Archive Incorporation documents, MOA, AOA, Section 8 license, PAN, TAN, 12A/80G orders, and Audit reports.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-950 text-white text-xs font-bold hover:bg-emerald-900 cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Archive First Document</span>
              </button>
            </div>
          ) : (
            filteredVault.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-emerald-700 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {doc.documentCode}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                      {doc.category?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-base text-slate-900 leading-snug">{doc.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{doc.issuingAuthority}</p>
                  </div>

                  {doc.registrationNumber && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs font-mono">
                      <span className="text-slate-400 block text-[10px]">Registration / Document ID:</span>
                      <strong className="text-slate-900">{doc.registrationNumber}</strong>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-600 space-y-1">
                    <div>
                      Effective: <strong>{doc.effectiveDate ? new Date(doc.effectiveDate).toLocaleDateString('en-IN') : 'Permanent'}</strong>
                    </div>
                    {doc.expiryDate && (
                      <div>
                        Expires: <strong className="text-rose-700">{new Date(doc.expiryDate).toLocaleDateString('en-IN')}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="text-[10px]">
                    {doc.verificationStatus === 'VERIFIED_BY_CHARTERED_ACCOUNTANT' ||
                    doc.verificationStatus === 'VERIFIED_BY_COMPANY_SECRETARY' ||
                    doc.verificationStatus === 'VERIFIED_BY_LEGAL_COUNSEL' ? (
                      <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified ({doc.verifiedByProfessionalName})
                      </span>
                    ) : (
                      <span className="text-amber-900 font-mono font-bold bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300 block text-center">
                        REQUIRES CA/CS/LEGAL VERIFICATION
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSelectedItemForAction(doc);
                        setShowVerifyModal(true);
                      }}
                      className="text-xs font-bold text-slate-700 hover:text-emerald-950 underline cursor-pointer"
                    >
                      Record Verification
                    </button>

                    {doc.fileUrl ? (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-950 text-white font-bold text-xs flex items-center gap-1 hover:bg-emerald-900"
                      >
                        <Download className="w-3 h-3" />
                        <span>File</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No File Attached</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL 1: RECORD CA/CS PROFESSIONAL VERIFICATION */}
      {showVerifyModal && selectedItemForAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-gold-600 uppercase tracking-wider">
                  Professional Auditor Sign-Off
                </span>
                <h3 className="text-xl font-serif font-bold text-slate-900">
                  Record CA / CS / Legal Verification
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Item: {selectedItemForAction.requirementName || selectedItemForAction.title}
                </p>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRecordVerification} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Verification Classification *</label>
                <select
                  value={verifyForm.verificationStatus}
                  onChange={(e) => setVerifyForm({ ...verifyForm, verificationStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  required
                >
                  <option value="VERIFIED_BY_CHARTERED_ACCOUNTANT">Verified by Chartered Accountant (FCA / ACA)</option>
                  <option value="VERIFIED_BY_COMPANY_SECRETARY">Verified by Practicing Company Secretary (PCS)</option>
                  <option value="VERIFIED_BY_LEGAL_COUNSEL">Verified by Legal Counsel / Advocate</option>
                  <option value="REJECTED_NEEDS_REVISION">Discrepancy / Rejected (Needs Revision)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Professional Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CA S. A. Rizvi"
                    value={verifyForm.verifiedByProfessionalName}
                    onChange={(e) => setVerifyForm({ ...verifyForm, verifiedByProfessionalName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ICAI / ICSI / Bar Regn No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FCA 084920 / FCS 9281"
                    value={verifyForm.professionalRegnNumber}
                    onChange={(e) => setVerifyForm({ ...verifyForm, professionalRegnNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Professional Firm Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. M/s Rizvi &amp; Associates, Chartered Accountants"
                  value={verifyForm.professionalFirmName}
                  onChange={(e) => setVerifyForm({ ...verifyForm, professionalFirmName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Audit Notes / Verification Attestation</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Cross-verified against Form 10B audit working papers and IT department filing portal acknowledgement."
                  value={verifyForm.verificationNotes}
                  onChange={(e) => setVerifyForm({ ...verifyForm, verificationNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-950 text-white font-bold hover:bg-emerald-900 disabled:opacity-50"
                >
                  Save Verification Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MARK COMPLIANCE AS FILED */}
      {showMarkFiledModal && selectedItemForAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-900 uppercase">Statutory Filing Record</span>
                <h3 className="text-lg font-serif font-bold text-slate-900">Mark Filing as Completed</h3>
              </div>
              <button onClick={() => setShowMarkFiledModal(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleMarkFiled} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Filing Date *</label>
                <input
                  type="date"
                  required
                  value={markFiledForm.filingDate}
                  onChange={(e) => setMarkFiledForm({ ...markFiledForm, filingDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Acknowledgement / SRN Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IT-ACK-89281928 / MCA-SRN-Q82910"
                  value={markFiledForm.acknowledgementNumber}
                  onChange={(e) => setMarkFiledForm({ ...markFiledForm, acknowledgementNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Link Vault Document (Optional)</label>
                <select
                  value={markFiledForm.statutoryDocumentId}
                  onChange={(e) => setMarkFiledForm({ ...markFiledForm, statutoryDocumentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <option value="">-- Select Archived Document --</option>
                  {vaultDocuments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.documentCode}: {d.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowMarkFiledModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-950 text-white font-bold hover:bg-emerald-900 disabled:opacity-50"
                >
                  Confirm Filing Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: UPLOAD / ARCHIVE STATUTORY DOCUMENT */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-gold-600 uppercase">Statutory Document Vault</span>
                <h3 className="text-xl font-serif font-bold text-slate-900">Archive Statutory Document</h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={uploadDocForm.category}
                    onChange={(e) => setUploadDocForm({ ...uploadDocForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                    required
                  >
                    <option value="INCORPORATION_GOVERNANCE">Incorporation &amp; Governance</option>
                    <option value="DIRECT_TAX_12A_80G">Direct Tax (12A / 80G)</option>
                    <option value="INDIRECT_TAX_GST_PT">Indirect Tax (GST / PT)</option>
                    <option value="FCRA_FOREIGN_CONTRIBUTION">FCRA Documents</option>
                    <option value="CSR_CORPORATE_GRANTS">CSR Corporate Documents</option>
                    <option value="STATUTORY_AUDIT_ACCOUNTS">Statutory Audit &amp; 10B</option>
                    <option value="ANNUAL_STATUTORY_FILINGS">Annual Filings (AOC-4 / MGT-7)</option>
                    <option value="ORGANIZATIONAL_POLICIES">Organizational Policies</option>
                    <option value="LEGAL_AGREEMENTS_CONTRACTS">Contracts &amp; Leases</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Document Type *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MOA, AOA, 80G, CSR-1"
                    value={uploadDocForm.documentType}
                    onChange={(e) => setUploadDocForm({ ...uploadDocForm, documentType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Certified True Copy of Memorandum of Association (MOA)"
                  value={uploadDocForm.title}
                  onChange={(e) => setUploadDocForm({ ...uploadDocForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Registration / Certificate No</label>
                  <input
                    type="text"
                    placeholder="e.g. U85300DL2026NPL0001"
                    value={uploadDocForm.registrationNumber}
                    onChange={(e) => setUploadDocForm({ ...uploadDocForm, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Issuing Authority *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ministry of Corporate Affairs (MCA)"
                    value={uploadDocForm.issuingAuthority}
                    onChange={(e) => setUploadDocForm({ ...uploadDocForm, issuingAuthority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={uploadDocForm.effectiveDate}
                    onChange={(e) => setUploadDocForm({ ...uploadDocForm, effectiveDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expiry Date (Leave blank if Perpetual)</label>
                  <input
                    type="date"
                    value={uploadDocForm.expiryDate}
                    onChange={(e) => setUploadDocForm({ ...uploadDocForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Document File URL / Storage Path</label>
                <input
                  type="text"
                  placeholder="https://imf-vault.s3.ap-south-1.amazonaws.com/statutory/moa.pdf"
                  value={uploadDocForm.fileUrl}
                  onChange={(e) => setUploadDocForm({ ...uploadDocForm, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-950 text-white font-bold hover:bg-emerald-900 disabled:opacity-50"
                >
                  Archive into Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
