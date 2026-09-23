'use client';

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Camera, 
  Star, 
  Wifi, 
  WifiOff, 
  UploadCloud, 
  Calendar, 
  Users, 
  FileText, 
  Eye, 
  Send,
  Navigation
} from 'lucide-react';

interface FieldVisitItem {
  id: string;
  visitNumber: string;
  projectId?: string;
  project?: { projectNumber: string; title: string };
  beneficiaryId?: string;
  beneficiary?: { beneficiaryNumber: string; fullName: string; city: string };
  officerOrVolunteerUserId: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'SUBMITTED_FOR_REVIEW' | 'APPROVED' | 'REJECTED';
  gpsLatitude?: number;
  gpsLongitude?: number;
  locationAddress?: string;
  geoPhotoUrls?: string[];
  fieldObservations?: string;
  needsVerificationSummary?: string;
  supervisorRating?: number;
  supervisorReviewNotes?: string;
  surveyResponses?: Array<{ id: string; surveyNumber: string; surveyTemplateTitle: string }>;
}

interface FieldOpsAnalytics {
  totalVisits: number;
  approvedVisits: number;
  pendingReviewVisits: number;
  offlineSurveysCount: number;
}

export default function AdminFieldOpsPage() {
  const [visits, setVisits] = useState<FieldVisitItem[]>([]);
  const [analytics, setAnalytics] = useState<FieldOpsAnalytics>({
    totalVisits: 0,
    approvedVisits: 0,
    pendingReviewVisits: 0,
    offlineSurveysCount: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Schedule Visit Modal State
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  const [officerId, setOfficerId] = useState<string>('VOL-9921');
  const [scheduledDate, setScheduledDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [locationAddress, setLocationAddress] = useState<string>('Govandi Slum Resettlement, Mumbai');
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState<boolean>(false);

  // Submit Observations Modal State
  const [reportingVisit, setReportingVisit] = useState<FieldVisitItem | null>(null);
  const [reportLat, setReportLat] = useState<number>(19.0596);
  const [reportLng, setReportLng] = useState<number>(72.8295);
  const [reportObs, setReportObs] = useState<string>('Beneficiary household verified. Living condition precarious. Recommend emergency support.');
  const [reportNeeds, setReportNeeds] = useState<string>('Food Kit & Child Health Support');
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);

  // Supervisor Review Modal State
  const [reviewingVisit, setReviewingVisit] = useState<FieldVisitItem | null>(null);
  const [supervisorRating, setSupervisorRating] = useState<number>(5);
  const [supervisorNotes, setSupervisorNotes] = useState<string>('GPS geo-tag validated and photographic proof checked.');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // Offline Sync Simulation State
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });

      const res = await fetch(`/api/admin/field-ops/visits?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success) {
        setVisits(json.data.visits || []);
        if (json.data.analytics) {
          setAnalytics(json.data.analytics);
        }
        if (json.meta) {
          setTotalPages(json.meta.totalPages || 1);
          setTotalRecords(json.meta.totalRecords || 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch field visits', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVisits();
  };

  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSchedule(true);
    try {
      const res = await fetch('/api/admin/field-ops/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerOrVolunteerUserId: officerId,
          scheduledDate,
          locationAddress,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNotification(`Field Visit #${json.data.visitNumber} successfully scheduled!`);
        setIsScheduling(false);
        setTimeout(() => setNotification(null), 4000);
        fetchVisits();
      }
    } catch (err) {
      console.error('Failed to schedule visit', err);
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingVisit) return;
    setIsSubmittingReport(true);
    try {
      const res = await fetch(`/api/admin/field-ops/visits/${reportingVisit.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gpsLatitude: Number(reportLat),
          gpsLongitude: Number(reportLng),
          fieldObservations: reportObs,
          needsVerificationSummary: reportNeeds,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNotification(`Field observations for #${reportingVisit.visitNumber} submitted for supervisor review!`);
        setReportingVisit(null);
        setTimeout(() => setNotification(null), 4000);
        fetchVisits();
      }
    } catch (err) {
      console.error('Failed to submit report', err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleReviewVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingVisit) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/admin/field-ops/visits/${reviewingVisit.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isApproved: true,
          supervisorRating: Number(supervisorRating),
          supervisorReviewNotes: supervisorNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNotification(`Field Visit #${reviewingVisit.visitNumber} approved with ${supervisorRating}-star rating!`);
        setReviewingVisit(null);
        setTimeout(() => setNotification(null), 4000);
        fetchVisits();
      }
    } catch (err) {
      console.error('Failed to review visit', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSimulateOfflineSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/field-ops/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: `FIELD-TAB-${Math.floor(1000 + Math.random() * 9000)}`,
          syncedByUserId: 'FIELD_OFFICER_01',
          surveys: [
            {
              surveyTemplateTitle: 'Household Nutritional & Water Audit',
              answersJson: { waterSource: 'Community Well', dailyMeals: 2, childrenInSchool: 3 },
              clientCapturedAt: new Date().toISOString(),
            },
          ],
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNotification(`Offline Field Sync Success: ${json.data.surveysSyncedCount} survey(s) ingested from offline cache.`);
        setTimeout(() => setNotification(null), 5000);
        fetchVisits();
      }
    } catch (err) {
      console.error('Failed to sync offline batch', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { label: 'Approved', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'SUBMITTED_FOR_REVIEW':
        return { label: 'Pending Review', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'SCHEDULED':
        return { label: 'Scheduled', color: 'bg-blue-100 text-blue-900 border-blue-200' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Field Operations & Offline Verification Command
          </h1>
          <p className="text-xs text-slate-500">
            Assigned Project &bull; Geo-Tagged Field Visit &bull; Beneficiary Needs Survey &bull; Geo-Photo Evidence &bull; Offline Sync &bull; Supervisor Review.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateOfflineSync}
            disabled={isSyncing}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <UploadCloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce text-emerald-700' : ''}`} />
            <span>Sync Offline Queue</span>
          </button>
          <button
            onClick={() => setIsScheduling(true)}
            className="px-4 py-2 rounded-xl bg-emerald-950 text-gold-300 hover:bg-emerald-900 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Field Visit</span>
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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Field Visits</span>
            <Navigation className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">
            {analytics.totalVisits}
          </div>
          <div className="text-[11px] text-slate-500">
            Scheduled & completed missions
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">Supervisor Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-white">
            {analytics.approvedVisits}
          </div>
          <div className="text-[11px] text-emerald-300">
            Vetted with GPS & photos
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-amber-950">
            {analytics.pendingReviewVisits}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold">
            Awaiting supervisor verification
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offline Ingested</span>
            <Wifi className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-950 font-mono">
            {analytics.offlineSurveysCount} surveys
          </div>
          <div className="text-[11px] text-slate-500">
            Synchronized from edge devices
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search field visit by ID (IMF-VIS-...), address, beneficiary, or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="SUBMITTED_FOR_REVIEW">Submitted for Review</option>
              <option value="SCHEDULED">Scheduled</option>
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

      {/* Field Visits Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Visit & ID</th>
                <th className="py-3 px-4">Project / Beneficiary</th>
                <th className="py-3 px-4">GPS Location & Geo-Tag</th>
                <th className="py-3 px-4">Status & Rating</th>
                <th className="py-3 px-4">Evidence & Observations</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 animate-pulse">
                    Loading field operations logs...
                  </td>
                </tr>
              ) : visits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No field visits found.
                  </td>
                </tr>
              ) : (
                visits.map((v) => {
                  const status = getStatusBadge(v.status);

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-emerald-900 font-bold">{v.visitNumber}</div>
                        <div className="text-[10px] text-slate-400">
                          Scheduled: {new Date(v.scheduledDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">Officer: {v.officerOrVolunteerUserId}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-[200px]">
                        {v.project && (
                          <div className="font-bold text-slate-900 text-[11px] truncate">
                            {v.project.title}
                          </div>
                        )}
                        {v.beneficiary && (
                          <div className="text-emerald-950 text-[11px] font-medium mt-0.5">
                            Ben: {v.beneficiary.fullName} ({v.beneficiary.city})
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 text-[11px] flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                          <span>{v.locationAddress || 'Field Location'}</span>
                        </div>
                        {v.gpsLatitude && v.gpsLongitude && (
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                            GPS: {Number(v.gpsLatitude).toFixed(4)}, {Number(v.gpsLongitude).toFixed(4)}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}>
                          {status.label}
                        </span>
                        {v.supervisorRating && (
                          <div className="flex items-center gap-0.5 text-amber-500 text-[10px] font-bold mt-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            <span>{v.supervisorRating} / 5 Stars</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-[220px]">
                        {v.fieldObservations ? (
                          <div className="text-slate-700 text-[11px] line-clamp-2">
                            {v.fieldObservations}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Awaiting field capture</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {v.status === 'SCHEDULED' && (
                            <button
                              onClick={() => setReportingVisit(v)}
                              title="Submit Field Observations & GPS"
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-950 text-gold-300 hover:bg-emerald-900 text-[11px] font-bold inline-flex items-center gap-1"
                            >
                              <Camera className="w-3 h-3" />
                              <span>Submit Observations</span>
                            </button>
                          )}

                          {v.status === 'SUBMITTED_FOR_REVIEW' && (
                            <button
                              onClick={() => setReviewingVisit(v)}
                              title="Supervisor Review & Approval"
                              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold inline-flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Review & Rate</span>
                            </button>
                          )}

                          {v.status === 'APPROVED' && (
                            <span className="text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
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
            Showing <strong>{visits.length}</strong> of <strong>{totalRecords}</strong> field visits
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

      {/* Schedule Visit Modal */}
      {isScheduling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">Schedule Field Mission</h3>
                <p className="text-xs text-slate-500">Deploy field officer/volunteer for on-ground verification</p>
              </div>
              <button
                onClick={() => setIsScheduling(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleVisit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Field Officer / Volunteer ID</label>
                <input
                  type="text"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Address / Location</label>
                <input
                  type="text"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsScheduling(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSchedule}
                  className="px-5 py-2 rounded-xl bg-emerald-950 text-gold-300 font-bold hover:bg-emerald-900 flex items-center gap-1.5 shadow-sm"
                >
                  {isSubmittingSchedule && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Dispatch Visit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Report Modal */}
      {reportingVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">Submit Field Findings</h3>
                <p className="text-xs text-slate-500">Record GPS location coordinates and observational findings</p>
              </div>
              <button
                onClick={() => setReportingVisit(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-mono text-emerald-900 font-semibold">{reportingVisit.visitNumber}</div>
                <div className="text-slate-600 text-[11px]">{reportingVisit.locationAddress}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">GPS Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={reportLat}
                    onChange={(e) => setReportLat(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">GPS Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={reportLng}
                    onChange={(e) => setReportLng(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">On-Ground Field Observations</label>
                <textarea
                  rows={3}
                  value={reportObs}
                  onChange={(e) => setReportObs(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setReportingVisit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-5 py-2 rounded-xl bg-emerald-950 text-gold-300 font-bold hover:bg-emerald-900 flex items-center gap-1.5 shadow-sm"
                >
                  {isSubmittingReport && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit for Supervisor Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supervisor Review & Rating Modal */}
      {reviewingVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">Supervisor Review & Rating</h3>
                <p className="text-xs text-slate-500">Validate field verification and approve beneficiary assistance</p>
              </div>
              <button
                onClick={() => setReviewingVisit(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewVisit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-mono text-emerald-900 font-semibold">{reviewingVisit.visitNumber}</div>
                <div className="text-slate-700 text-[11px]">{reviewingVisit.fieldObservations}</div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Supervisor Rating (Quality of Evidence)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSupervisorRating(star)}
                      className={`p-2 rounded-xl border transition-colors ${
                        supervisorRating >= star
                          ? 'bg-amber-50 border-amber-300 text-amber-500'
                          : 'bg-slate-50 border-slate-200 text-slate-300'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${supervisorRating >= star ? 'fill-amber-400' : ''}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{supervisorRating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Supervisor Audit Remarks</label>
                <textarea
                  rows={2}
                  value={supervisorNotes}
                  onChange={(e) => setSupervisorNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setReviewingVisit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 rounded-xl bg-emerald-950 text-gold-300 font-bold hover:bg-emerald-900 flex items-center gap-1.5 shadow-sm"
                >
                  {isSubmittingReview && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Approve & Verify Visit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
