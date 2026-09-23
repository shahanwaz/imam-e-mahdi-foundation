'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Search, 
  Plus, 
  RefreshCw, 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers, 
  TrendingUp, 
  FileText, 
  Sparkles, 
  ArrowRight,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Target
} from 'lucide-react';
import Link from 'next/link';

interface ProjectItem {
  id: string;
  projectNumber: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  stage: string;
  locationCountry: string;
  locationState?: string;
  locationDistrict?: string;
  targetBeneficiariesCount: number;
  actualBeneficiariesCount: number;
  allocatedBudgetINR: number;
  disbursedAmountINR: number;
  startDate?: string;
  targetCompletionDate?: string;
  actualCompletionDate?: string;
  isPublicFeatured: boolean;
  closureReportSummary?: string;
  createdAt: string;
  milestones?: Array<{
    id: string;
    title: string;
    isCompleted: boolean;
    targetDate: string;
  }>;
  metrics?: Array<{
    id: string;
    indicatorName: string;
    unitOfMeasure: string;
    targetValue: number;
    currentValue: number;
  }>;
}

interface ProjectAnalytics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalAllocatedBudgetINR: number;
  totalDisbursedAmountINR: number;
  totalTargetBeneficiaries: number;
  totalActualBeneficiariesServed: number;
}

const STAGES = [
  { key: 'IDEA', label: '1. Idea', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  { key: 'PROPOSAL', label: '2. Proposal', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { key: 'APPROVED', label: '3. Approved', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { key: 'FUNDRAISING', label: '4. Fundraising', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { key: 'EXECUTION', label: '5. Execution', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { key: 'FIELD_OPERATIONS', label: '6. Field Ops', color: 'bg-amber-50 text-amber-900 border-amber-300' },
  { key: 'MONITORING', label: '7. Monitoring (M&E)', color: 'bg-cyan-50 text-cyan-900 border-cyan-300' },
  { key: 'IMPACT_EVALUATION', label: '8. Impact Eval', color: 'bg-teal-50 text-teal-900 border-teal-300' },
  { key: 'CLOSURE', label: '9. Closure', color: 'bg-slate-200 text-slate-900 border-slate-400' },
  { key: 'FINAL_REPORT_SUBMITTED', label: '10. Final Report', color: 'bg-emerald-950 text-gold-300 border-emerald-900' },
];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [analytics, setAnalytics] = useState<ProjectAnalytics>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalAllocatedBudgetINR: 0,
    totalDisbursedAmountINR: 0,
    totalTargetBeneficiaries: 0,
    totalActualBeneficiariesServed: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // New Project Modal State
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('EMERGENCY_DISASTER_RELIEF');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newBudget, setNewBudget] = useState<number>(500000);
  const [newTargetBeneficiaries, setNewTargetBeneficiaries] = useState<number>(500);
  const [newState, setNewState] = useState<string>('Maharashtra');
  const [newDistrict, setNewDistrict] = useState<string>('Mumbai');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Stage Transition Modal State
  const [selectedProjectForStage, setSelectedProjectForStage] = useState<ProjectItem | null>(null);
  const [nextStage, setNextStage] = useState<string>('');
  const [closureSummary, setClosureSummary] = useState<string>('');
  const [isUpdatingStage, setIsUpdatingStage] = useState<boolean>(false);

  const [notification, setNotification] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search ? { search } : {}),
        ...(stageFilter ? { stage: stageFilter } : {}),
        ...(categoryFilter ? { category: categoryFilter } : {}),
      });

      const res = await fetch(`/api/admin/projects?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success) {
        setProjects(json.data.projects || []);
        if (json.data.analytics) {
          setAnalytics(json.data.analytics);
        }
        if (json.meta) {
          setTotalPages(json.meta.totalPages || 1);
          setTotalRecords(json.meta.totalRecords || 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, stageFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          description: newDescription,
          allocatedBudgetINR: Number(newBudget),
          targetBeneficiariesCount: Number(newTargetBeneficiaries),
          locationState: newState,
          locationDistrict: newDistrict,
          locationCountry: 'India',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNotification(`Project #${json.data.projectNumber} successfully initiated!`);
        setIsCreating(false);
        setNewTitle('');
        setNewDescription('');
        setTimeout(() => setNotification(null), 4000);
        fetchProjects();
      }
    } catch (err) {
      console.error('Failed to create project', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForStage || !nextStage) return;
    setIsUpdatingStage(true);
    try {
      const res = await fetch(`/api/admin/projects/${selectedProjectForStage.id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStage: nextStage,
          closureReportSummary: closureSummary,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNotification(`Project #${selectedProjectForStage.projectNumber} stage transitioned to ${nextStage}`);
        setSelectedProjectForStage(null);
        setTimeout(() => setNotification(null), 4000);
        fetchProjects();
      }
    } catch (err) {
      console.error('Failed to update stage', err);
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const getStageBadge = (stage: string) => {
    const s = STAGES.find((st) => st.key === stage);
    return s || { key: stage, label: stage, color: 'bg-slate-100 text-slate-800 border-slate-200' };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Project Lifecycle & Monitoring (M&E)
          </h1>
          <p className="text-xs text-slate-500">
            10-Stage Humanitarian Lifecycle: Idea &bull; Proposal &bull; Approval &bull; Fundraising &bull; Execution &bull; Field Operations &bull; Monitoring &bull; Impact &bull; Closure &bull; Final Report.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 rounded-xl bg-emerald-950 text-gold-300 hover:bg-emerald-900 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Initiate Project Idea</span>
          </button>
          <button
            onClick={() => fetchProjects()}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Notification Alert */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Portfolio</span>
            <FolderKanban className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">
            {analytics.totalProjects}
          </div>
          <div className="text-[11px] text-slate-500">
            Across 10 lifecycle stages
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">Active Operations</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-white">
            {analytics.activeProjects}
          </div>
          <div className="text-[11px] text-emerald-300">
            In field execution & M&E
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Allocated Budget (INR)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-950 font-mono">
            ₹ {analytics.totalAllocatedBudgetINR.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            Disbursed: ₹{analytics.totalDisbursedAmountINR.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Beneficiaries Reached</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900 font-mono">
            {analytics.totalActualBeneficiariesServed.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            Target: {analytics.totalTargetBeneficiaries.toLocaleString('en-IN')} souls
          </div>
        </div>
      </div>

      {/* 10-Stage Visual Lifecycle Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-800" />
          <span>Institutional 10-Stage Execution Pipeline</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 text-[10px]">
          {STAGES.map((st, idx) => (
            <button
              key={st.key}
              onClick={() => {
                setStageFilter(stageFilter === st.key ? '' : st.key);
                setPage(1);
              }}
              className={`p-2 rounded-xl border text-center font-bold transition-all ${
                stageFilter === st.key
                  ? 'bg-emerald-950 text-gold-300 border-gold-400 shadow-md ring-2 ring-gold-400/40'
                  : `${st.color} hover:shadow-sm`
              }`}
            >
              <div className="truncate">{st.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search project by title, ID (IMF-PRJ-...), district, or scope..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-700"
            >
              <option value="">All Categories</option>
              <option value="WATER_SANITATION">Water & Sanitation</option>
              <option value="HEALTHCARE_MEDICAL">Healthcare & Medical</option>
              <option value="ORPHAN_EDUCATION">Orphan Education</option>
              <option value="EMERGENCY_DISASTER_RELIEF">Disaster Relief</option>
              <option value="FOOD_SECURITY">Food Security</option>
              <option value="LIVELIHOOD_EMPOWERMENT">Livelihood</option>
            </select>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-950 text-white text-xs font-bold hover:bg-emerald-900 shrink-0"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Project & ID</th>
                <th className="py-3 px-4">Category & Location</th>
                <th className="py-3 px-4">Lifecycle Stage</th>
                <th className="py-3 px-4">Budget Allocation (INR)</th>
                <th className="py-3 px-4 text-center">Milestones</th>
                <th className="py-3 px-4 text-center">Beneficiaries</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 animate-pulse">
                    Loading project portfolio...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No projects found for the selected filter criteria.
                  </td>
                </tr>
              ) : (
                projects.map((proj) => {
                  const stage = getStageBadge(proj.stage);
                  const progressPct = proj.allocatedBudgetINR > 0
                    ? Math.min(100, Math.round((Number(proj.disbursedAmountINR) / Number(proj.allocatedBudgetINR)) * 100))
                    : 0;

                  return (
                    <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 max-w-[280px]">
                        <div className="font-bold text-slate-900 text-sm">{proj.title}</div>
                        <div className="font-mono text-[11px] text-emerald-900 font-semibold">
                          {proj.projectNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {proj.description}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold block w-fit mb-1">
                          {proj.category.replace(/_/g, ' ')}
                        </span>
                        <div className="text-slate-600 text-[11px] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                          <span>{proj.locationDistrict || proj.locationState || proj.locationCountry}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${stage.color}`}>
                          {stage.label}
                        </span>
                        {proj.closureReportSummary && (
                          <div className="text-[10px] text-emerald-800 font-semibold mt-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>Audit Closed</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">
                          ₹ {Number(proj.allocatedBudgetINR).toLocaleString('en-IN')}
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${progressPct}%` }} />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          ₹ {Number(proj.disbursedAmountINR).toLocaleString('en-IN')} disbursed ({progressPct}%)
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-800">
                          {proj.milestones?.filter((m) => m.isCompleted).length || 0} / {proj.milestones?.length || 0}
                        </span>
                        <div className="text-[10px] text-slate-400">completed</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="font-mono font-bold text-emerald-950">
                          {proj.actualBeneficiariesCount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Target: {proj.targetBeneficiariesCount.toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedProjectForStage(proj);
                            setNextStage(proj.stage);
                            setClosureSummary(proj.closureReportSummary || '');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 border border-slate-200 text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Advance Stage</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <strong>{projects.length}</strong> of <strong>{totalRecords}</strong> projects
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

      {/* New Project Idea Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">Initiate Project Idea</h3>
                <p className="text-xs text-slate-500">Draft new project concept into Stage 1 of the governance pipeline</p>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. Solar-Powered Clean Water Wells in Thar Desert"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  >
                    <option value="WATER_SANITATION">Water & Sanitation</option>
                    <option value="HEALTHCARE_MEDICAL">Healthcare & Medical</option>
                    <option value="ORPHAN_EDUCATION">Orphan Education</option>
                    <option value="EMERGENCY_DISASTER_RELIEF">Disaster Relief</option>
                    <option value="FOOD_SECURITY">Food Security</option>
                    <option value="LIVELIHOOD_EMPOWERMENT">Livelihood</option>
                    <option value="INFRASTRUCTURE_HOUSING">Housing</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Budget Allocation (INR)</label>
                  <input
                    type="number"
                    min="1000"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Beneficiaries Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newTargetBeneficiaries}
                    onChange={(e) => setNewTargetBeneficiaries(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">District / Region</label>
                  <input
                    type="text"
                    placeholder="e.g. Thar Desert / Baramulla"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Project Concept & Scope Description</label>
                <textarea
                  rows={3}
                  placeholder="Outline the humanitarian issue, operational plan, expected outputs, and sustainability..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-950 text-gold-300 font-bold hover:bg-emerald-900 flex items-center gap-1.5 shadow-sm"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Project Idea</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stage Advance Modal */}
      {selectedProjectForStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">Transition Lifecycle Stage</h3>
                <p className="text-xs text-slate-500">Advance project through governance & M&E milestones</p>
              </div>
              <button
                onClick={() => setSelectedProjectForStage(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStage} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">{selectedProjectForStage.title}</div>
                <div className="font-mono text-emerald-900 font-semibold">{selectedProjectForStage.projectNumber}</div>
                <div className="text-slate-500 text-[11px]">
                  Current Stage: <strong>{selectedProjectForStage.stage}</strong>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Lifecycle Stage</label>
                <select
                  value={nextStage}
                  onChange={(e) => setNextStage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold"
                >
                  {STAGES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {(nextStage === 'CLOSURE' || nextStage === 'FINAL_REPORT_SUBMITTED') && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Final Institutional Closure Report Summary</label>
                  <textarea
                    rows={3}
                    placeholder="Document verified beneficiary impact, budget reconciliation, and lessons learned..."
                    value={closureSummary}
                    onChange={(e) => setClosureSummary(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                    required
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedProjectForStage(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStage}
                  className="px-5 py-2 rounded-xl bg-emerald-950 text-gold-300 font-bold hover:bg-emerald-900 flex items-center gap-1.5 shadow-sm"
                >
                  {isUpdatingStage && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Stage Transition</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
