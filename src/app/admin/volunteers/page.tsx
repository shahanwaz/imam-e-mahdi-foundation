'use client';

import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Search, 
  Award, 
  ShieldCheck, 
  QrCode, 
  RefreshCw, 
  Calendar, 
  Mail, 
  Phone, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Star,
  Plus,
  Send,
  MapPin,
  Globe,
  Tag,
  Briefcase,
  FileCheck,
  UserCheck,
  Ban,
  Building2,
  FileText
} from 'lucide-react';
import Link from 'next/link';

interface VolunteerItem {
  id: string;
  volunteerNumber: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  skills: string[];
  languages: string[];
  availability: string;
  interests: string[];
  status: 'APPLIED' | 'VERIFIED' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  totalHours: number;
  averageRating: number;
  verifiedAt?: string;
  qrVerificationHash: string;
  createdAt: string;
  assignments?: Array<{
    id: string;
    assignmentNumber: string;
    title: string;
    role: string;
    status: string;
    startDate: string;
    endDate?: string;
    expectedHours: number;
  }>;
  hoursLogs?: Array<{
    id: string;
    hoursLogged: number;
    activityDate: string;
    supervisorRating: number;
    feedback?: string;
  }>;
}

interface VolunteerAnalytics {
  totalVolunteers: number;
  activeVolunteers: number;
  appliedVolunteers: number;
  totalHoursServed: number;
  averageOverallRating: number;
}

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<VolunteerItem[]>([]);
  const [analytics, setAnalytics] = useState<VolunteerAnalytics>({
    totalVolunteers: 0,
    activeVolunteers: 0,
    appliedVolunteers: 0,
    totalHoursServed: 0,
    averageOverallRating: 5.0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Selected volunteer for Assignment modal
  const [assigningVolunteer, setAssigningVolunteer] = useState<VolunteerItem | null>(null);
  const [assignTitle, setAssignTitle] = useState<string>('');
  const [assignRole, setAssignRole] = useState<string>('');
  const [assignExpectedHours, setAssignExpectedHours] = useState<number>(10);
  const [assignStartDate, setAssignStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  // Selected volunteer for Hours/Attendance Logging modal
  const [attendanceVolunteer, setAttendanceVolunteer] = useState<VolunteerItem | null>(null);
  const [logHours, setLogHours] = useState<number>(4);
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [logRating, setLogRating] = useState<number>(5);
  const [logFeedback, setLogFeedback] = useState<string>('Exceptional dedication and prompt execution.');
  const [isLoggingHours, setIsLoggingHours] = useState<boolean>(false);

  // Status Action Feedback Alert
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(availabilityFilter ? { availability: availabilityFilter } : {}),
      });

      const res = await fetch(`/api/admin/volunteers?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success) {
        setVolunteers(json.data.volunteers || []);
        if (json.data.analytics) {
          setAnalytics(json.data.analytics);
        }
        if (json.meta) {
          setTotalPages(json.meta.totalPages || 1);
          setTotalRecords(json.meta.totalRecords || 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch volunteers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [page, statusFilter, availabilityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVolunteers();
  };

  const handleVerifyVolunteer = async (volunteerId: string, approve: boolean) => {
    try {
      const res = await fetch(`/api/admin/volunteers/${volunteerId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: approve ? 'ACTIVE' : 'SUSPENDED',
          notes: approve ? 'Application vetted and background verified by administration' : 'Application rejected by administration',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(approve ? 'Volunteer credential activated and verified' : 'Volunteer status updated');
        setTimeout(() => setActionMessage(null), 4000);
        fetchVolunteers();
      }
    } catch (err) {
      console.error('Failed to verify volunteer', err);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningVolunteer) return;
    setIsAssigning(true);
    try {
      const res = await fetch('/api/admin/volunteers/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId: assigningVolunteer.id,
          title: assignTitle,
          role: assignRole,
          expectedHours: Number(assignExpectedHours),
          startDate: assignStartDate,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(`Shift assignment dispatched to ${assigningVolunteer.fullName}`);
        setAssigningVolunteer(null);
        setAssignTitle('');
        setAssignRole('');
        setTimeout(() => setActionMessage(null), 4000);
        fetchVolunteers();
      }
    } catch (err) {
      console.error('Failed to create assignment', err);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleLogAttendanceHours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceVolunteer) return;
    setIsLoggingHours(true);
    try {
      const res = await fetch('/api/admin/volunteers/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId: attendanceVolunteer.id,
          hoursLogged: Number(logHours),
          activityDate: logDate,
          supervisorRating: Number(logRating),
          feedback: logFeedback,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(`Logged ${logHours} hours with ${logRating}-star rating for ${attendanceVolunteer.fullName}`);
        setAttendanceVolunteer(null);
        setTimeout(() => setActionMessage(null), 4000);
        fetchVolunteers();
      }
    } catch (err) {
      console.error('Failed to log attendance hours', err);
    } finally {
      setIsLoggingHours(false);
    }
  };

  const handleIssueCertificate = async (volunteer: VolunteerItem) => {
    try {
      const res = await fetch(`/api/admin/volunteers/${volunteer.id}/certificate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: `Distinguished humanitarian service of ${volunteer.totalHours} verified hours`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(`Official Certificate generated: ${json.data.certificate.certificateNumber}`);
        setTimeout(() => setActionMessage(null), 5000);
        fetchVolunteers();
      }
    } catch (err) {
      console.error('Failed to generate certificate', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { label: 'Active Field', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 };
      case 'VERIFIED':
        return { label: 'Verified', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: ShieldCheck };
      case 'APPLIED':
        return { label: 'Pending Application', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: Clock };
      case 'SUSPENDED':
        return { label: 'Suspended', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: Ban };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Clock };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Volunteer Corps Operations & Registry
          </h1>
          <p className="text-xs text-slate-500">
            Field workforce management: public intake review, skill matching, shift dispatch, verified attendance hours, supervisor ratings, and service certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/volunteer"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-emerald-950 text-gold-300 hover:bg-emerald-900 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Public Volunteer Portal</span>
            <ExternalLink className="w-3 h-3 text-gold-400" />
          </Link>
          <button
            onClick={() => fetchVolunteers()}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Corps</span>
            <HeartHandshake className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">
            {analytics.totalVolunteers.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            Registered volunteer pool
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">Active Field Force</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-white">
            {analytics.activeVolunteers.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-300">
            Vetted & deployed on missions
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Verified Hours</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-950 font-mono">
            {analytics.totalHoursServed.toLocaleString('en-IN')} hrs
          </div>
          <div className="text-[11px] text-slate-500">
            Humanitarian shift attendance logged
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Applications</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-amber-950">
            {analytics.appliedVolunteers.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold">
            Awaiting background review
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search volunteer by name, ID (IMF-VOL-...), email, phone, city, or skill..."
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
              <option value="APPLIED">Pending Application</option>
              <option value="ACTIVE">Active Field</option>
              <option value="VERIFIED">Verified</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            <select
              value={availabilityFilter}
              onChange={(e) => {
                setAvailabilityFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-700"
            >
              <option value="">All Availabilities</option>
              <option value="WEEKENDS">Weekends</option>
              <option value="WEEKDAYS">Weekdays</option>
              <option value="EVENING">Evenings</option>
              <option value="FLEXIBLE">Flexible</option>
              <option value="ON_CALL">Emergency On-Call</option>
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

      {/* Volunteer Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Volunteer Profile & ID</th>
                <th className="py-3 px-4">Location & Contact</th>
                <th className="py-3 px-4">Skills & Availability</th>
                <th className="py-3 px-4">Status & Credential</th>
                <th className="py-3 px-4 text-center">Hours & Rating</th>
                <th className="py-3 px-4 text-center">Active Shifts</th>
                <th className="py-3 px-4 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 animate-pulse">
                    Loading volunteer corps records...
                  </td>
                </tr>
              ) : volunteers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No volunteer records match the filters.
                  </td>
                </tr>
              ) : (
                volunteers.map((vol) => {
                  const status = getStatusBadge(vol.status);
                  const StatusIcon = status.icon;

                  return (
                    <tr key={vol.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Volunteer Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-900 text-gold-300 font-serif font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-700">
                            {vol.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{vol.fullName}</div>
                            <div className="font-mono text-[11px] text-emerald-900 font-semibold">
                              {vol.volunteerNumber}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Joined {new Date(vol.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                          <span>{vol.city}, {vol.country}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] font-mono flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{vol.email}</span>
                        </div>
                        {vol.phone && (
                          <div className="text-slate-500 text-[11px] font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{vol.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Skills & Availability */}
                      <td className="py-3.5 px-4 space-y-1 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {vol.skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-semibold">
                              {skill}
                            </span>
                          ))}
                          {vol.skills.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-semibold">+{vol.skills.length - 3}</span>
                          )}
                        </div>
                        <div className="text-[10px] text-emerald-900 font-medium flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-emerald-700" />
                          <span>{vol.availability}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.color}`}>
                          <StatusIcon className="w-2.5 h-2.5" />
                          {status.label}
                        </span>
                        {vol.verifiedAt && (
                          <div className="text-[10px] text-emerald-700 mt-1 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Vetted</span>
                          </div>
                        )}
                      </td>

                      {/* Hours & Rating */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-mono font-bold text-slate-900 text-sm">
                          {vol.totalHours} hrs
                        </div>
                        <div className="flex items-center justify-center gap-0.5 text-amber-500 text-[10px] font-bold mt-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>{Number(vol.averageRating).toFixed(1)}</span>
                        </div>
                      </td>

                      {/* Active Shifts */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-800">
                          {vol.assignments?.length || 0}
                        </span>
                        <div className="text-[10px] text-slate-400">assignments</div>
                      </td>

                      {/* Operations */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Pending Review Trigger */}
                          {vol.status === 'APPLIED' && (
                            <button
                              onClick={() => handleVerifyVolunteer(vol.id, true)}
                              title="Approve & Activate Volunteer"
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                          )}

                          {/* Assign Shift */}
                          <button
                            onClick={() => setAssigningVolunteer(vol)}
                            title="Dispatch Shift Assignment"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                          >
                            <Briefcase className="w-3.5 h-3.5" />
                          </button>

                          {/* Log Attendance Hours */}
                          <button
                            onClick={() => setAttendanceVolunteer(vol)}
                            title="Log Attendance & Performance Rating"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>

                          {/* Generate Certificate */}
                          <button
                            onClick={() => handleIssueCertificate(vol)}
                            title="Issue Official Service Certificate"
                            className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-colors"
                          >
                            <Award className="w-3.5 h-3.5" />
                          </button>

                          {/* Verification Badge Link */}
                          <Link
                            href={`/verify/volunteer/${vol.qrVerificationHash}`}
                            target="_blank"
                            title="Open Badge Verification & Certificate"
                            className="p-1.5 rounded-lg bg-gold-50 hover:bg-gold-100 text-amber-900 border border-gold-200 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
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
            Showing <strong>{volunteers.length}</strong> of <strong>{totalRecords}</strong> registered volunteers
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

      {/* Assignment Dispatch Modal */}
      {assigningVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">Dispatch Shift Assignment</h3>
                <p className="text-xs text-slate-500">Deploy volunteer to campaign, relief mission, or program</p>
              </div>
              <button
                onClick={() => setAssigningVolunteer(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">{assigningVolunteer.fullName}</div>
                <div className="font-mono text-emerald-900 font-semibold">{assigningVolunteer.volunteerNumber}</div>
                <div className="text-slate-500 text-[11px]">
                  Skills: {assigningVolunteer.skills.join(', ')}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mission / Campaign Title</label>
                <input
                  type="text"
                  placeholder="e.g. Winter Warmth Relief Drive 2026"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Operational Role</label>
                <input
                  type="text"
                  placeholder="e.g. Food Kit Distribution Coordinator"
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={assignStartDate}
                    onChange={(e) => setAssignStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expected Hours</label>
                  <input
                    type="number"
                    min="1"
                    value={assignExpectedHours}
                    onChange={(e) => setAssignExpectedHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAssigningVolunteer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-5 py-2 rounded-xl bg-emerald-950 text-gold-300 font-bold hover:bg-emerald-900 flex items-center gap-1.5 shadow-sm"
                >
                  {isAssigning && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Dispatch Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance & Performance Rating Modal */}
      {attendanceVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">Log Shift Attendance</h3>
                <p className="text-xs text-slate-500">Record verified hours and supervisor performance evaluation</p>
              </div>
              <button
                onClick={() => setAttendanceVolunteer(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogAttendanceHours} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">{attendanceVolunteer.fullName}</div>
                <div className="font-mono text-emerald-900 font-semibold">{attendanceVolunteer.volunteerNumber}</div>
                <div className="text-slate-500 text-[11px]">
                  Current Total: {attendanceVolunteer.totalHours} hrs &bull; Rating: {Number(attendanceVolunteer.averageRating).toFixed(1)} ★
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hours Served</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={logHours}
                    onChange={(e) => setLogHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Activity Date</label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Supervisor Performance Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setLogRating(star)}
                      className={`p-2 rounded-xl border transition-colors ${
                        logRating >= star
                          ? 'bg-amber-50 border-amber-300 text-amber-500'
                          : 'bg-slate-50 border-slate-200 text-slate-300'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${logRating >= star ? 'fill-amber-400' : ''}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{logRating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Supervisor Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={logFeedback}
                  onChange={(e) => setLogFeedback(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  placeholder="Notes on punctuality, leadership, empathy, and task execution"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAttendanceVolunteer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoggingHours}
                  className="px-5 py-2 rounded-xl bg-emerald-950 text-gold-300 font-bold hover:bg-emerald-900 flex items-center gap-1.5 shadow-sm"
                >
                  {isLoggingHours && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Log Verified Hours</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
