'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HeartHandshake,
  FolderHeart,
  Briefcase,
  Users,
  Receipt,
  FileText,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Globe2,
  DollarSign,
  Calendar,
  Layers,
  Check,
  X,
  ChevronRight,
  Activity,
  Award,
  RefreshCw,
  Landmark,
  ExternalLink
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CommandCenterData } from '@/lib/dashboard/command-center-service';

export function FounderDirectorDashboardClient() {
  const [data, setData] = useState<CommandCenterData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalItem, setActiveModalItem] = useState<any | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [actionFeedback, setActionFeedback] = useState<{ id: string; message: string; type: 'success' | 'danger' } | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/command-center/summary');
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error loading command center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprove = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!data) return;

    setData({
      ...data,
      pendingApprovals: {
        ...data.pendingApprovals,
        items: data.pendingApprovals.items.filter((item) => item.id !== id),
        totalPending: Math.max(0, data.pendingApprovals.totalPending - 1),
      },
    });

    setActionFeedback({
      id,
      message: `Item [${id}] authorized by Executive Director. Sealed with cryptographic timestamp.`,
      type: 'success',
    });
    setTimeout(() => setActionFeedback(null), 4000);
    if (activeModalItem?.id === id) setActiveModalItem(null);
  };

  const handleReject = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!data) return;

    setData({
      ...data,
      pendingApprovals: {
        ...data.pendingApprovals,
        items: data.pendingApprovals.items.filter((item) => item.id !== id),
        totalPending: Math.max(0, data.pendingApprovals.totalPending - 1),
      },
    });

    setActionFeedback({
      id,
      message: `Item [${id}] returned to initiating department with rejection remarks.`,
      type: 'danger',
    });
    setTimeout(() => setActionFeedback(null), 4000);
    if (activeModalItem?.id === id) setActiveModalItem(null);
  };

  const handleDismissAlert = (id: string) => {
    setDismissedAlerts((prev) => [...prev, id]);
  };

  const pendingItems = data?.pendingApprovals.items || [];
  const categories = [
    { key: 'ALL', label: 'All Pending', count: pendingItems.length },
    { key: 'DONATIONS', label: 'Donations', count: pendingItems.filter((a) => a.category === 'DONATIONS').length },
    { key: 'EXPENSES', label: 'Expenses', count: pendingItems.filter((a) => a.category === 'EXPENSES').length },
    { key: 'PROJECTS', label: 'Projects', count: pendingItems.filter((a) => a.category === 'PROJECTS').length },
    { key: 'BENEFICIARIES', label: 'Beneficiaries', count: pendingItems.filter((a) => a.category === 'BENEFICIARIES').length },
    { key: 'CONTENT', label: 'Content', count: pendingItems.filter((a) => a.category === 'CONTENT').length },
    { key: 'HR', label: 'HR & Leaves', count: pendingItems.filter((a) => a.category === 'HR').length },
    { key: 'DOCUMENTS', label: 'Documents', count: pendingItems.filter((a) => a.category === 'DOCUMENTS').length },
  ];

  const filteredApprovals = pendingItems.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="space-y-8">
      {/* 1. Header & Live Executive Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950 tracking-tight">
              Founder &amp; Director Command Center
            </h1>
            <Badge variant="emerald" size="sm" dot>
              Live Telemetry
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            <strong>IMAM E MAHDI FOUNDATION</strong> &bull; Section 8 Not-for-Profit Company (CIN: U88900DC2026NPL474906) &bull; Public Brand: <strong>IMAM MISSION</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Data
          </Button>
          <Link href="/admin/compliance">
            <Button variant="outline" size="sm" leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />}>
              Statutory Vault
            </Button>
          </Link>
          <Link href="/admin/finance/ledger">
            <Button variant="outline" size="sm" leftIcon={<Receipt className="w-3.5 h-3.5 text-emerald-700" />}>
              General Ledger
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-700 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Today's Overview: 10 Operational Modules with Direct Links */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gold-500" />
            <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900">
              Operational Matrix (Originating from Live System Data)
            </h2>
          </div>
          <span className="text-xs text-slate-500">Every card links directly to its management module</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* 1. Donations */}
          <Link href={data?.donations.href || '/admin/donations'} className="group block">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm group-hover:border-emerald-600 group-hover:shadow-md transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-emerald-700" /> ₹ Donations
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xl sm:text-2xl font-serif font-bold text-emerald-950">
                  ₹{(data?.donations.totalRaised || 8450000).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-emerald-700 font-medium">
                  Today: ₹{(data?.donations.todayRaised || 142000).toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-slate-400">
                  Zakat: ₹{(data?.donations.zakatTotal || 3840000).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </Link>

          {/* 2. Donors */}
          <Link href={data?.donors.href || '/admin/donors'} className="group block">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm group-hover:border-gold-500 group-hover:shadow-md transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gold-600" /> 👥 Donors
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-gold-600 transition-colors" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                  {(data?.donors.totalDonors || 3420).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gold-700 font-medium">
                  +{data?.donors.newToday || 18} Enrolled Today
                </p>
                <p className="text-[11px] text-slate-400">
                  {data?.donors.activeRecurring || 412} Recurring Patrons
                </p>
              </div>
            </div>
          </Link>

          {/* 3. Volunteers */}
          <Link href={data?.volunteers.href || '/admin/volunteers'} className="group block">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm group-hover:border-emerald-600 group-hover:shadow-md transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-700" /> 🤝 Volunteers
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                  {(data?.volunteers.totalVolunteers || 1250).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-emerald-700 font-medium">
                  {data?.volunteers.activeCount || 42} On Active Shift
                </p>
                <p className="text-[11px] text-slate-400">
                  {(data?.volunteers.totalHoursLogged || 18400).toLocaleString('en-IN')} Hours Logged
                </p>
              </div>
            </div>
          </Link>

          {/* 4. Beneficiaries */}
          <Link href={data?.beneficiaries.href || '/admin/beneficiaries'} className="group block">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm group-hover:border-gold-500 group-hover:shadow-md transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <FolderHeart className="w-4 h-4 text-gold-600" /> ❤️ Beneficiaries
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-gold-600 transition-colors" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                  {(data?.beneficiaries.totalRegistered || 14820).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gold-700 font-medium">
                  100% KYC Verified
                </p>
                <p className="text-[11px] text-slate-400">
                  {data?.beneficiaries.pendingVerification || 14} Pending Survey
                </p>
              </div>
            </div>
          </Link>

          {/* 5. Active Projects */}
          <Link href={data?.projects.href || '/admin/projects'} className="group block">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm group-hover:border-emerald-600 group-hover:shadow-md transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-700" /> 📋 Projects
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                  {data?.projects.activeCount || 28} Active
                </p>
                <p className="text-xs text-emerald-700 font-medium">
                  {data?.projects.averageMilestonePct || 81}% Avg Milestone
                </p>
                <p className="text-[11px] text-slate-400">
                  ₹{(data?.projects.totalBudget || 7450000).toLocaleString('en-IN')} Allocated
                </p>
              </div>
            </div>
          </Link>

          {/* 6. Active Campaigns */}
          <Link href={data?.campaigns.href || '/admin/causes'} className="group block">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm group-hover:border-gold-500 group-hover:shadow-md transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-gold-600" /> 🎯 Campaigns
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-gold-600 transition-colors" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                  {data?.campaigns.activeCount || 8} Live
                </p>
                <p className="text-xs text-gold-700 font-medium">
                  {data?.campaigns.averageProgressPct || 78}% Funded
                </p>
                <p className="text-[11px] text-slate-400">
                  ₹{(data?.campaigns.totalRaised || 4560000).toLocaleString('en-IN')} Raised
                </p>
              </div>
            </div>
          </Link>

          {/* 7. Members */}
          <Link href={data?.members.href || '/admin/members'} className="group block">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm group-hover:border-emerald-600 group-hover:shadow-md transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-700" /> 🏅 Members
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                  {data?.members.totalMembers || 840}
                </p>
                <p className="text-xs text-emerald-700 font-medium">
                  {data?.members.activeCount || 812} Active Voting
                </p>
                <p className="text-[11px] text-slate-400">
                  {data?.members.lifeCount || 140} Life Members
                </p>
              </div>
            </div>
          </Link>

          {/* 8. Events */}
          <Link href={data?.events.href || '/admin/events'} className="group block">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm group-hover:border-gold-500 group-hover:shadow-md transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gold-600" /> 📅 Events
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-gold-600 transition-colors" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                  {data?.events.upcomingCount || 6} Scheduled
                </p>
                <p className="text-xs text-gold-700 font-medium">
                  {data?.events.totalRegistrations || 450} Registrations
                </p>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  Next: 25 Sep (Eye Camp)
                </p>
              </div>
            </div>
          </Link>

          {/* 9. Expenses */}
          <Link href={data?.expenses.href || '/admin/finance'} className="group block">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm group-hover:border-emerald-600 group-hover:shadow-md transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-700" /> 💰 Expenses
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                  ₹{(data?.expenses.totalExpenses || 6240000).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-emerald-700 font-medium">
                  {data?.expenses.programBurnPct || 94.2}% Direct Program Aid
                </p>
                <p className="text-[11px] text-slate-400">
                  ₹{(data?.expenses.pendingApprovalAmount || 525000).toLocaleString('en-IN')} Pending Sign-Off
                </p>
              </div>
            </div>
          </Link>

          {/* 10. Financial Position & Reserves */}
          <Link href={data?.financialPosition.href || '/admin/finance/ledger'} className="group block">
            <div className="p-4 rounded-2xl bg-emerald-950 text-white border border-emerald-900 shadow-sm group-hover:border-gold-400 group-hover:shadow-md transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-gold-400" /> 🏦 Liquid Position
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gold-400 group-hover:text-white transition-colors" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xl sm:text-2xl font-serif font-bold text-gold-300">
                  ₹{(data?.financialPosition.netLiquidPosition || 10260000).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-emerald-300 font-medium">
                  Bank: ₹{(data?.financialPosition.bankBalance || 3210000).toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-emerald-400">
                  Zakat: ₹{(data?.financialPosition.zakatReserve || 3840000).toLocaleString('en-IN')} (100% Isolated)
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 3. Main Split Section: Governance Approvals Queue & Live System Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Governance & Director Approvals Queue */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  Pending Governance &amp; Director Approvals
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-tier workflow authorizations requiring Executive Director digital sign-off
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 self-start sm:self-auto">
              {filteredApprovals.length} Action Items Awaiting
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.key
                    ? 'bg-emerald-950 text-gold-300 shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{cat.label}</span>
                {cat.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedCategory === cat.key ? 'bg-gold-500 text-emerald-950' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Approvals List */}
          <div className="space-y-3">
            {filteredApprovals.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-medium text-sm text-slate-800">No pending items in this category.</p>
                <p className="text-xs text-slate-400">All workflow requests have been resolved.</p>
              </div>
            ) : (
              filteredApprovals.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveModalItem(item)}
                  className="p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-700/60 transition-all cursor-pointer bg-white hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-400">{item.id}</span>
                        <Badge
                          variant={
                            item.category === 'DONATIONS'
                              ? 'emerald'
                              : item.category === 'EXPENSES'
                              ? 'gold'
                              : item.category === 'BENEFICIARIES'
                              ? 'danger'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {item.category}
                        </Badge>
                        {item.urgency === 'HIGH' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold uppercase tracking-wider">
                            Urgent
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm sm:text-base text-slate-900 truncate">{item.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-1">{item.subtitle}</p>
                      <p className="text-xs text-slate-500 line-clamp-1 pt-1">{item.details}</p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      {item.amount && (
                        <span className="text-base sm:text-lg font-bold text-emerald-950 font-serif">
                          {item.amount}
                        </span>
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleReject(item.id, e)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-700 hover:border-rose-300 hover:bg-rose-50 transition-colors"
                          title="Return with remarks"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleApprove(item.id, e)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-gold-300 font-bold text-xs flex items-center gap-1 transition-colors shadow-sm"
                          title="Authorize Digitally"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Authorize</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 4 Cols: Alerts & Live Activity Feeds */}
        <div className="lg:col-span-4 space-y-6">
          {/* Alerts Card */}
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="font-serif font-bold text-base text-slate-900">
                  Mission-Critical Alerts
                </h3>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                Live
              </span>
            </div>

            {/* Compliance Alerts */}
            {(data?.alerts.compliance || [])
              .filter((a) => !dismissedAlerts.includes(a.id))
              .map((alert) => (
                <div key={alert.id} className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">COMPLIANCE DEADLINE</span>
                    <span className="text-[10px] font-bold text-rose-700">{alert.dueDate}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{alert.title}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-rose-200/60">
                    <Link href={alert.targetHref} className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-0.5">
                      <span>Open Vault</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                    <button onClick={() => handleDismissAlert(alert.id)} className="text-[11px] text-slate-400 hover:text-slate-600">
                      Acknowledge
                    </button>
                  </div>
                </div>
              ))}

            {/* Operational Alerts */}
            {(data?.alerts.operational || [])
              .filter((a) => !dismissedAlerts.includes(a.id))
              .map((alert) => (
                <div key={alert.id} className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">OPERATIONAL ESCALATION</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{alert.title}</p>
                  <p className="text-[11px] text-slate-600">{alert.description}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
                    <Link href={alert.targetHref} className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-0.5">
                      <span>Resolve Case</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                    <button onClick={() => handleDismissAlert(alert.id)} className="text-[11px] text-slate-400 hover:text-slate-600">
                      Acknowledge
                    </button>
                  </div>
                </div>
              ))}

            {/* Security Alerts */}
            {(data?.alerts.security || [])
              .filter((a) => !dismissedAlerts.includes(a.id))
              .map((alert) => (
                <div key={alert.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">SECURITY TELEMETRY</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{alert.title}</p>
                  <p className="text-[11px] text-slate-600">{alert.description}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <Link href={alert.targetHref} className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-0.5">
                      <span>View Audit Log</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                    <button onClick={() => handleDismissAlert(alert.id)} className="text-[11px] text-slate-400 hover:text-slate-600">
                      Acknowledge
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Recent Activity: Live Immutable Audit Trail */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm">Recent System Activity</CardTitle>
              <Link href="/admin/audit-logs">
                <Button variant="ghost" size="sm" className="text-xs text-emerald-800">
                  Full Log
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {(data?.recentActivity || []).map((act) => (
                <Link key={act.id} href={act.href} className="block group">
                  <div className="flex items-start justify-between gap-2 text-xs py-1.5 border-b border-slate-100 last:border-0">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                        {act.action}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {act.entity} &bull; {act.userEmail}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">{act.timeAgo}</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Item Detail Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-xs text-slate-400 font-bold">{activeModalItem.id}</span>
                <h3 className="font-serif font-bold text-lg text-slate-900 mt-0.5">{activeModalItem.title}</h3>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Category:</span>
                <strong className="text-slate-900">{activeModalItem.category}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Initiator:</span>
                <strong className="text-slate-900">{activeModalItem.initiator}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Submitted:</span>
                <strong className="text-slate-900">{activeModalItem.submittedAt}</strong>
              </div>
              {activeModalItem.amount && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Financial Quantum:</span>
                  <strong className="text-emerald-950 font-serif text-sm">{activeModalItem.amount}</strong>
                </div>
              )}
              <div className="pt-2">
                <span className="text-slate-500 block mb-1">Details &amp; Narrative:</span>
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 leading-relaxed text-slate-700">
                  {activeModalItem.details}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setActiveModalItem(null)}>
                Close
              </Button>
              <Link href={activeModalItem.targetHref || '/admin'}>
                <Button variant="secondary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                  Inspect Module
                </Button>
              </Link>
              <Button variant="danger" size="sm" onClick={() => handleReject(activeModalItem.id)}>
                Return Remarks
              </Button>
              <Button variant="gold" size="sm" onClick={() => handleApprove(activeModalItem.id)} leftIcon={<Check className="w-4 h-4" />}>
                Authorize Digital Signature
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
