'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  Copy,
  Check,
  Layers,
  ArrowRight,
  Eye,
  Edit3,
  Globe,
  Sliders,
  Database,
  Cpu,
  RefreshCw,
  Search,
  Filter,
  CheckCheck,
  XCircle,
  Share2,
  Lock,
  FileSpreadsheet,
  Megaphone,
  BookOpen,
  Mail,
  MessageSquare,
  Languages,
  FileCode,
  TrendingUp,
  HelpCircle,
  SearchCode,
} from 'lucide-react';
import {
  AiTaskType,
  AiSafetyDomain,
  AiDraftStatus,
  AI_TASK_DEFINITIONS,
} from '@/lib/ai/types';

const TASK_ICONS: Record<string, React.ElementType> = {
  CONTENT_DRAFTING: FileText,
  CAMPAIGN_WRITING: Megaphone,
  BLOG_DRAFTING: BookOpen,
  EMAIL_DRAFTING: Mail,
  WHATSAPP_DRAFTING: MessageSquare,
  TRANSLATION: Languages,
  SUMMARIZATION: FileSpreadsheet,
  REPORT_DRAFTING: Layers,
  IMPACT_REPORT_DRAFTING: Sparkles,
  DATA_INSIGHTS: TrendingUp,
  DASHBOARD_EXPLANATION: Database,
  FAQ_GENERATION: HelpCircle,
  SEO_ASSISTANCE: SearchCode,
};

export default function AiToolsManagementPage() {
  const [activeTab, setActiveTab] = useState<'STUDIO' | 'REVIEW_QUEUE' | 'AUDIT_LOGS'>('STUDIO');
  const [selectedTask, setSelectedTask] = useState<AiTaskType>('CONTENT_DRAFTING' as AiTaskType);
  
  // Generation Form State
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [tone, setTone] = useState<'INSPIRING' | 'FORMAL' | 'EMPATHETIC' | 'URGENT' | 'EDUCATIONAL' | 'INFORMATIONAL'>('FORMAL');
  const [selectedProvider, setSelectedProvider] = useState('MOCK');
  const [selectedModel, setSelectedModel] = useState('imf-deterministic-ai-v1');
  const [targetModule, setTargetModule] = useState('CMS');
  
  // Provider Metadata
  const [providers, setProviders] = useState<any[]>([]);
  
  // Draft Queue State
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterDomain, setFilterDomain] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Active Review Modal / Drawer
  const [activeDraft, setActiveDraft] = useState<any | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  
  // Processing States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchProviders();
    fetchDrafts();
  }, []);

  async function fetchProviders() {
    try {
      const res = await fetch('/api/admin/ai/providers');
      const json = await res.json();
      if (json.success) {
        setProviders(json.data.providers || []);
      }
    } catch (err) {
      console.error('Failed to load providers:', err);
    }
  }

  async function fetchDrafts() {
    setLoadingDrafts(true);
    try {
      const res = await fetch('/api/admin/ai/drafts');
      const json = await res.json();
      if (json.success) {
        setDrafts(json.data.items || []);
      }
    } catch (err) {
      console.error('Failed to load drafts:', err);
    } finally {
      setLoadingDrafts(false);
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !prompt.trim()) {
      setAlertMessage({ text: 'Please provide both title and prompt content.', type: 'error' });
      return;
    }

    setIsGenerating(true);
    setAlertMessage(null);

    try {
      const res = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: selectedTask,
          title,
          prompt,
          targetLanguage,
          tone,
          provider: selectedProvider,
          modelName: selectedModel,
          targetModule,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setAlertMessage({
          text: `Draft "${json.data.draft.draftCode}" generated successfully and placed in the Human Review Queue!`,
          type: 'success',
        });
        fetchDrafts();
        setActiveDraft(json.data.draft);
        setEditedContent(json.data.draft.generatedOutput);
        setActiveTab('REVIEW_QUEUE');
      } else {
        setAlertMessage({ text: json.error?.message || 'Failed to generate AI draft', type: 'error' });
      }
    } catch (err: any) {
      setAlertMessage({ text: err.message || 'Generation error', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReviewAction = async (status: 'APPROVED' | 'REJECTED') => {
    if (!activeDraft) return;
    setIsReviewing(true);

    try {
      const res = await fetch(`/api/admin/ai/drafts/${activeDraft.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          editedOutput: editedContent,
          approvalNotes,
          reviewerUserId: 'ADMIN_OPERATOR',
        }),
      });

      const json = await res.json();
      if (json.success) {
        setAlertMessage({
          text: `Draft ${activeDraft.draftCode} marked as ${status}!`,
          type: 'success',
        });
        setActiveDraft(json.data);
        fetchDrafts();
      } else {
        setAlertMessage({ text: json.error?.message || 'Review update failed', type: 'error' });
      }
    } catch (err: any) {
      setAlertMessage({ text: err.message, type: 'error' });
    } finally {
      setIsReviewing(false);
    }
  };

  const handlePublish = async () => {
    if (!activeDraft) return;
    setIsReviewing(true);

    try {
      const res = await fetch(`/api/admin/ai/drafts/${activeDraft.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish' }),
      });

      const json = await res.json();
      if (json.success) {
        setAlertMessage({
          text: `Approved content from "${activeDraft.draftCode}" successfully dispatched and published!`,
          type: 'success',
        });
        setActiveDraft({ ...activeDraft, status: AiDraftStatus.PUBLISHED });
        fetchDrafts();
      } else {
        setAlertMessage({ text: json.error?.message || 'Publishing failed', type: 'error' });
      }
    } catch (err: any) {
      setAlertMessage({ text: err.message, type: 'error' });
    } finally {
      setIsReviewing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter drafts
  const filteredDrafts = drafts.filter((d) => {
    if (filterStatus !== 'ALL' && d.status !== filterStatus) return false;
    if (filterDomain !== 'ALL' && d.safetyDomain !== filterDomain) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.title?.toLowerCase().includes(q) ||
        d.draftCode?.toLowerCase().includes(q) ||
        d.promptSanitized?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = drafts.filter((d) => d.status === AiDraftStatus.DRAFT_PENDING_REVIEW).length;
  const approvedCount = drafts.filter((d) => d.status === AiDraftStatus.APPROVED).length;
  const publishedCount = drafts.filter((d) => d.status === AiDraftStatus.PUBLISHED).length;

  const currentTaskDef = AI_TASK_DEFINITIONS[selectedTask];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Alert Banner */}
      {alertMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold transition animate-fade-in ${
            alertMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{alertMessage.text}</span>
          </div>
          <button
            onClick={() => setAlertMessage(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Mandatory Governance & HITL Workflow Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-800/40 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 font-mono text-[10px] font-extrabold uppercase tracking-widest border border-gold-500/30">
                AI Agent &bull; Human-In-The-Loop Governance
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Enterprise AI Intelligence Suite
            </h1>
            <p className="text-xs text-slate-300">
              PII-Masked Drafting &bull; Multi-Vendor SPI &bull; Mandatory Human Approval for Sensitive Content
            </p>
          </div>

          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-xs">
            <ShieldCheck className="w-5 h-5 text-gold-400 shrink-0" />
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-slate-200 block">Strict HITL Policy:</span>
              <span className="text-slate-400">Never publishes Legal, Financial or Compliance text directly.</span>
            </div>
          </div>
        </div>

        {/* Visual Pipeline Progress */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-xs">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px]">1</div>
            <div>
              <div className="font-bold text-slate-200">AI Draft</div>
              <div className="text-[10px] text-slate-400">PII scrubbed &amp; generated</div>
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gold-500/20 text-gold-300 flex items-center justify-center font-bold text-[11px]">2</div>
            <div>
              <div className="font-bold text-slate-200">Human Review</div>
              <div className="text-[10px] text-slate-400">Editorial edits &amp; checks</div>
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-[11px]">3</div>
            <div>
              <div className="font-bold text-slate-200">Approval</div>
              <div className="text-[10px] text-slate-400">Authorized operator sign-off</div>
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[11px]">4</div>
            <div>
              <div className="font-bold text-slate-200">Publish</div>
              <div className="text-[10px] text-slate-400">Dispatched to target system</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('STUDIO')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'STUDIO'
                ? 'bg-emerald-950 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>AI Drafting Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('REVIEW_QUEUE')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'REVIEW_QUEUE'
                ? 'bg-emerald-950 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Human Review &amp; Approval Queue</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-500">
          <span>Pending Review: <strong className="text-amber-700">{pendingCount}</strong></span>
          <span>Approved: <strong className="text-emerald-700">{approvedCount}</strong></span>
          <span>Published: <strong className="text-purple-700">{publishedCount}</strong></span>
        </div>
      </div>

      {/* TAB 1: AI DRAFTING STUDIO */}
      {activeTab === 'STUDIO' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 13 Task Presets Grid */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Intelligence Task
              </h3>
              <span className="text-[10px] font-mono text-emerald-700 font-bold">13 Specialized Tasks</span>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[620px] overflow-y-auto pr-1">
              {Object.values(AI_TASK_DEFINITIONS).map((task) => {
                const isSelected = selectedTask === task.type;
                const IconComponent = TASK_ICONS[task.type] || FileText;

                return (
                  <button
                    key={task.type}
                    type="button"
                    onClick={() => {
                      setSelectedTask(task.type);
                      if (!prompt) {
                        setPrompt(task.placeholderPrompt);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-950 text-gold-400' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs truncate">{task.label}</span>
                        {task.defaultSafetyDomain !== AiSafetyDomain.GENERAL_PUBLIC && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-mono font-bold">
                            {task.defaultSafetyDomain}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Generation Workbench */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gold-600 uppercase tracking-wider">
                    Task Preset
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 font-mono text-[10px] text-slate-700 font-bold">
                    {currentTaskDef.type}
                  </span>
                </div>
                <h2 className="text-xl font-serif font-bold text-slate-900 mt-0.5">
                  {currentTaskDef.label}
                </h2>
              </div>

              {/* Provider Selector */}
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                <Cpu className="w-4 h-4 text-slate-500 ml-1" />
                <select
                  value={selectedProvider}
                  onChange={(e) => {
                    setSelectedProvider(e.target.value);
                    const p = providers.find((pr) => pr.name === e.target.value);
                    if (p) setSelectedModel(p.defaultModel);
                  }}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-2"
                >
                  <option value="MOCK">MOCK (Deterministic Fast)</option>
                  <option value="GEMINI">Google Gemini (REST API)</option>
                  <option value="OPENAI">OpenAI (GPT-4o Mini)</option>
                  <option value="ANTHROPIC">Anthropic (Claude 3.5)</option>
                </select>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              {/* Title & Target Module */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Document / Campaign / Initiative Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Winter Warmth Relief Drive 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Destination Module
                  </label>
                  <select
                    value={targetModule}
                    onChange={(e) => setTargetModule(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="CMS">CMS / Public Website</option>
                    <option value="CAMPAIGNS">Campaigns &amp; Appeals</option>
                    <option value="COMMUNICATION">Communication Engine</option>
                    <option value="REPORTS">Reports &amp; Analytics</option>
                  </select>
                </div>
              </div>

              {/* Language & Tone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Target Output Language
                  </label>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="en">English (Official &amp; Donor Standard)</option>
                    <option value="ur">Urdu - اردو (Community &amp; Majlis)</option>
                    <option value="hi">Hindi - हिंदी (Regional Outreach)</option>
                    <option value="ar">Arabic - العربية (Scholarly &amp; Sharia)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Voice &amp; Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="FORMAL">Formal &amp; Institutional</option>
                    <option value="INSPIRING">Inspiring &amp; Faith-Driven</option>
                    <option value="EMPATHETIC">Empathetic &amp; Compassionate</option>
                    <option value="URGENT">Urgent &amp; Action-Oriented</option>
                    <option value="EDUCATIONAL">Educational &amp; Explanatory</option>
                    <option value="INFORMATIONAL">Informational &amp; Analytical</option>
                  </select>
                </div>
              </div>

              {/* Prompt Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Input Prompt &amp; Raw Information *
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    PII will be automatically masked before processing
                  </span>
                </div>
                <textarea
                  rows={6}
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={currentTaskDef.placeholderPrompt}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-900 leading-relaxed font-sans"
                />
              </div>

              {/* Action Button & Disclaimer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Generates in review status &bull; Cannot publish directly without approval</span>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-3 rounded-2xl bg-emerald-950 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-900 transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-gold-400" />
                      <span>Scrubbing PII &amp; Generating Draft...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-gold-400" />
                      <span>Generate AI Draft</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: HUMAN REVIEW & APPROVAL QUEUE */}
      {activeTab === 'REVIEW_QUEUE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Drafts Table / List */}
          <div className="lg:col-span-5 space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search drafts by title, code, keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700"
                >
                  <option value="ALL">All Statuses</option>
                  <option value={AiDraftStatus.DRAFT_PENDING_REVIEW}>Pending Review</option>
                  <option value={AiDraftStatus.APPROVED}>Approved</option>
                  <option value={AiDraftStatus.PUBLISHED}>Published</option>
                  <option value={AiDraftStatus.REJECTED}>Rejected</option>
                </select>

                <select
                  value={filterDomain}
                  onChange={(e) => setFilterDomain(e.target.value)}
                  className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700"
                >
                  <option value="ALL">All Domains</option>
                  <option value={AiSafetyDomain.GENERAL_PUBLIC}>General Public</option>
                  <option value={AiSafetyDomain.LEGAL}>Legal</option>
                  <option value={AiSafetyDomain.FINANCIAL}>Financial</option>
                  <option value={AiSafetyDomain.COMPLIANCE}>Compliance</option>
                  <option value={AiSafetyDomain.REGULATORY}>Regulatory</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {loadingDrafts ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                  <RefreshCw className="w-6 h-6 text-emerald-900 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-bold">Loading drafts...</p>
                </div>
              ) : filteredDrafts.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                  <Bot className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No Drafts Found</p>
                  <p className="text-[11px] text-slate-400">Generate a new draft from the AI Studio tab.</p>
                </div>
              ) : (
                filteredDrafts.map((draft) => {
                  const isSelected = activeDraft?.id === draft.id;
                  const isPending = draft.status === AiDraftStatus.DRAFT_PENDING_REVIEW;
                  const isApproved = draft.status === AiDraftStatus.APPROVED;
                  const isPublished = draft.status === AiDraftStatus.PUBLISHED;

                  return (
                    <div
                      key={draft.id}
                      onClick={() => {
                        setActiveDraft(draft);
                        setEditedContent(draft.editedOutput || draft.generatedOutput);
                        setApprovalNotes(draft.approvalNotes || '');
                      }}
                      className={`p-4 rounded-2xl border transition cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-600 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {draft.draftCode}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isPublished
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : isApproved
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              : isPending
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-rose-100 text-rose-900 border border-rose-200'
                          }`}
                        >
                          {draft.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-1">
                          {draft.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span>{draft.taskType.replace(/_/g, ' ')}</span>
                          &bull;
                          <span className="font-mono text-[10px] text-emerald-800 font-bold">
                            {draft.providerName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>{new Date(draft.createdAt).toLocaleDateString('en-IN')}</span>
                        {draft.safetyDomain !== AiSafetyDomain.GENERAL_PUBLIC && (
                          <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                            {draft.safetyDomain}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Detailed Review & Human Sign-off Studio */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            {!activeDraft ? (
              <div className="text-center py-24 px-4 space-y-3">
                <Edit3 className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">Select a Draft to Review</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Inspect generated text, apply human edits, approve or reject, and publish to the target destination.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded">
                        {activeDraft.draftCode}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {activeDraft.taskType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-serif font-bold text-slate-900">
                      {activeDraft.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(editedContent || activeDraft.generatedOutput, activeDraft.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedId === activeDraft.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Text</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Sanitized Prompt Preview */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Sanitized Prompt (PII Protected)</span>
                    <span className="font-mono text-[10px] text-emerald-700">Tokens: {activeDraft.tokensUsed}</span>
                  </div>
                  <p className="text-xs text-slate-700 italic font-mono line-clamp-2">
                    &ldquo;{activeDraft.promptSanitized}&rdquo;
                  </p>
                </div>

                {/* Human Review & Edit Workspace */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-slate-800 flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-emerald-800" />
                      <span>Human Review &amp; Edit Workspace</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Edit text freely prior to approval
                    </span>
                  </div>

                  <textarea
                    rows={12}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-900 leading-relaxed font-normal"
                  />
                </div>

                {/* Reviewer Notes */}
                <div>
                  <label className="font-bold text-xs text-slate-700 block mb-1">
                    Reviewer Notes / Compliance Comments
                  </label>
                  <input
                    type="text"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="e.g. Verified for dignified tone and factual accuracy."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReviewAction('REJECTED')}
                      disabled={isReviewing}
                      className="px-4 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition cursor-pointer disabled:opacity-50"
                    >
                      Reject / Needs Rewrite
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReviewAction('APPROVED')}
                      disabled={isReviewing || activeDraft.status === AiDraftStatus.APPROVED}
                      className="px-5 py-2.5 rounded-xl bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-200 transition cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Approve Draft</span>
                    </button>

                    <button
                      onClick={handlePublish}
                      disabled={isReviewing || activeDraft.status !== AiDraftStatus.APPROVED}
                      title={
                        activeDraft.status !== AiDraftStatus.APPROVED
                          ? 'Draft must be approved first before publishing'
                          : 'Publish to destination module'
                      }
                      className="px-6 py-2.5 rounded-xl bg-emerald-950 text-white text-xs font-bold flex items-center gap-2 hover:bg-emerald-900 transition shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Share2 className="w-4 h-4 text-gold-400" />
                      <span>Publish Content</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
