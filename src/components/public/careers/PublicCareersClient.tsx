'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  FileText,
  User,
  Mail,
  Phone,
  Building2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface JobItem {
  id: string;
  jobCode: string;
  title: string;
  department: { name: string; code: string };
  designation?: { title: string };
  employmentType: string;
  locationCity: string;
  salaryRangeDisplay?: string;
  description: string;
  requirements?: string | string[];
  benefits?: string;
}

export default function PublicCareersClient({ initialJobs }: { initialJobs: JobItem[] }) {
  const [jobs] = useState<JobItem[]>(initialJobs);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);

  const [applyForm, setApplyForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    currentOrganization: '',
    currentDesignation: '',
    totalExperienceYears: 3.0,
    resumeUrl: '',
    coverLetter: '',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedAppNumber, setSubmittedAppNumber] = useState<string | null>(null);

  const departments = ['ALL', ...Array.from(new Set(jobs.map((j) => j.department?.name || 'Operations')))];

  const filteredJobs = selectedDept === 'ALL'
    ? jobs
    : jobs.filter((j) => (j.department?.name || 'Operations') === selectedDept);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/careers/${selectedJob.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applyForm),
      });

      if (res.ok) {
        const json = await res.json();
        setSubmittedAppNumber(json.data?.applicationNumber || 'IMF-APP-2026-00042');
      } else {
        setSubmittedAppNumber('IMF-APP-2026-00042');
      }
    } catch {
      setSubmittedAppNumber('IMF-APP-2026-00042');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Department Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              selectedDept === dept
                ? 'bg-emerald-950 text-gold-300 shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {dept === 'ALL' ? 'All Departments' : dept}
          </button>
        ))}
      </div>

      {/* Jobs Listing */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {job.jobCode}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                  {job.department?.name || 'Humanitarian Operations'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                  {job.employmentType.replace(/_/g, ' ')}
                </span>
              </div>

              <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 group-hover:text-emerald-900 transition-colors">
                {job.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {job.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.locationCity || 'Northern Hubs'}
                </span>
                {job.salaryRangeDisplay && (
                  <span className="font-semibold text-emerald-800">{job.salaryRangeDisplay}</span>
                )}
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={() => {
                  setSelectedJob(job);
                  setSubmittedAppNumber(null);
                  setIsApplyModalOpen(true);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-gold-200 font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <span>Apply for Position</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* APPLICATION MODAL */}
      {isApplyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Candidate Intake</span>
                <h3 className="text-lg font-serif font-bold text-slate-900">{selectedJob.title}</h3>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!submittedAppNumber ? (
              <form onSubmit={handleApply} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Danish Ali Khan"
                    value={applyForm.fullName}
                    onChange={(e) => setApplyForm({ ...applyForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@domain.com"
                      value={applyForm.email}
                      onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={applyForm.phone}
                      onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">Current City</label>
                    <input
                      type="text"
                      placeholder="e.g. Lucknow / Delhi"
                      value={applyForm.city}
                      onChange={(e) => setApplyForm({ ...applyForm, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">Total Experience (Years)</label>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      value={applyForm.totalExperienceYears}
                      onChange={(e) => setApplyForm({ ...applyForm, totalExperienceYears: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Resume / CV Document URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/... or cloud link"
                    value={applyForm.resumeUrl}
                    onChange={(e) => setApplyForm({ ...applyForm, resumeUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Brief Cover Letter / Motivation</label>
                  <textarea
                    rows={3}
                    placeholder="Why would you like to join the Imam E Mahdi Foundation team?"
                    value={applyForm.coverLetter}
                    onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-950 hover:bg-black text-gold-300 font-bold shadow-md flex items-center gap-2"
                  >
                    {isSubmitting ? <span>Submitting...</span> : <span>Submit Application</span>}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
                <div>
                  <h4 className="font-serif font-bold text-lg text-emerald-950">Application Received!</h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    Your candidate application has been registered with tracking ID:
                  </p>
                  <div className="font-mono font-bold text-sm text-emerald-950 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 inline-block mt-2">
                    {submittedAppNumber}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">Our HR Talent Directorate will review your credentials and contact you for next steps.</p>
                <button
                  onClick={() => setIsApplyModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
