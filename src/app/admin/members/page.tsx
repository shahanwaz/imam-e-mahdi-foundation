'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Award, 
  ShieldCheck, 
  QrCode, 
  RefreshCw, 
  Calendar, 
  Mail, 
  Phone, 
  ExternalLink, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download,
  Filter,
  UserCheck,
  Ban,
  FileText
} from 'lucide-react';
import Link from 'next/link';

interface MemberItem {
  id: string;
  memberNumber: string;
  userId?: string;
  fullName: string;
  email: string;
  phone?: string;
  membershipType: 'ANNUAL' | 'LIFETIME' | 'PATRON' | 'STUDENT';
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  startDate: string;
  endDate?: string;
  feePaid: number;
  qrVerificationHash: string;
  createdAt: string;
  renewals?: Array<{
    id: string;
    previousEndDate?: string;
    newEndDate: string;
    feePaid: number;
    receiptNumber?: string;
    renewedAt: string;
  }>;
}

interface MemberAnalytics {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  expiredMembers: number;
  lifetimePatrons: number;
  totalMembershipFees: number;
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [analytics, setAnalytics] = useState<MemberAnalytics>({
    totalMembers: 0,
    activeMembers: 0,
    pendingMembers: 0,
    expiredMembers: 0,
    lifetimePatrons: 0,
    totalMembershipFees: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Selected member for Digital ID Card Modal
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<MemberItem | null>(null);

  // Renewal Modal state
  const [renewalMember, setRenewalMember] = useState<MemberItem | null>(null);
  const [renewalMonths, setRenewalMonths] = useState<number>(12);
  const [renewalFee, setRenewalFee] = useState<number>(2500);
  const [renewalPaymentRef, setRenewalPaymentRef] = useState<string>('');
  const [isRenewing, setIsRenewing] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(tierFilter ? { membershipType: tierFilter } : {}),
      });

      const res = await fetch(`/api/admin/members?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success) {
        setMembers(json.data.members || []);
        if (json.data.analytics) {
          setAnalytics(json.data.analytics);
        }
        if (json.meta) {
          setTotalPages(json.meta.totalPages || 1);
          setTotalRecords(json.meta.totalRecords || 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch members', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [page, statusFilter, tierFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMembers();
  };

  const handleStatusUpdate = async (memberId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/members/${memberId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, remarks: `Updated by administrator` }),
      });
      const json = await res.json();
      if (json.success) {
        setActionSuccess(`Member status changed to ${newStatus}`);
        setTimeout(() => setActionSuccess(null), 4000);
        fetchMembers();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleProcessRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewalMember) return;
    setIsRenewing(true);
    try {
      const res = await fetch(`/api/members/${renewalMember.id}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          renewalDurationMonths: Number(renewalMonths),
          feePaid: Number(renewalFee),
          paymentReference: renewalPaymentRef || `ADMIN-RENEW-${Date.now()}`,
          remarks: 'Administrative renewal processing',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionSuccess(`Membership successfully renewed for ${renewalMember.fullName}`);
        setRenewalMember(null);
        setTimeout(() => setActionSuccess(null), 4000);
        fetchMembers();
      }
    } catch (err) {
      console.error('Failed to renew membership', err);
    } finally {
      setIsRenewing(false);
    }
  };

  const getTierBadge = (type: string) => {
    switch (type) {
      case 'PATRON':
        return { label: 'Honorary Patron', color: 'bg-purple-100 text-purple-900 border-purple-200' };
      case 'LIFETIME':
        return { label: 'Lifetime Member', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'STUDENT':
        return { label: 'Student Fellow', color: 'bg-blue-100 text-blue-900 border-blue-200' };
      default:
        return { label: 'Annual General', color: 'bg-emerald-50 text-emerald-900 border-emerald-200' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { label: 'Active', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 };
      case 'PENDING':
        return { label: 'Pending Review', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: Clock };
      case 'EXPIRED':
        return { label: 'Expired', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: AlertCircle };
      case 'SUSPENDED':
        return { label: 'Suspended', color: 'bg-slate-200 text-slate-800 border-slate-300', icon: Ban };
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
            Member Management & Registry
          </h1>
          <p className="text-xs text-slate-500">
            Official membership ledger with sequential IDs, cryptographically verifiable digital ID cards, renewal tracking, and certificate issuance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/members/register"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-emerald-950 text-gold-300 hover:bg-emerald-900 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Public Registration Portal</span>
            <ExternalLink className="w-3 h-3 text-gold-400" />
          </Link>
          <button
            onClick={() => fetchMembers()}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Executive Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">
            {analytics.totalMembers.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            All registered members across tiers
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">Active Credentials</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-white">
            {analytics.activeMembers.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-300">
            Validated & verified digital ID cards
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lifetime & Patrons</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-amber-950">
            {analytics.lifetimePatrons.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold">
            Perpetual institutional supporters
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Membership Capital (INR)</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-950 font-mono">
            ₹ {analytics.totalMembershipFees.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            Total subscription fees logged
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
              placeholder="Search member by name, ID (IMF-MEM-...), email, or phone..."
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
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending Review</option>
              <option value="EXPIRED">Expired</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            <select
              value={tierFilter}
              onChange={(e) => {
                setTierFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-700"
            >
              <option value="">All Tiers</option>
              <option value="ANNUAL">Annual General</option>
              <option value="LIFETIME">Lifetime Member</option>
              <option value="PATRON">Honorary Patron</option>
              <option value="STUDENT">Student Fellow</option>
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

      {/* Members Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Member Info & ID</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Tier & Status</th>
                <th className="py-3 px-4">Validity Period</th>
                <th className="py-3 px-4 text-right">Fee Logged</th>
                <th className="py-3 px-4 text-center">Digital Card</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 animate-pulse">
                    Loading membership records...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No members match the query filters.
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const tier = getTierBadge(member.membershipType);
                  const status = getStatusBadge(member.status);
                  const StatusIcon = status.icon;

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-950 text-gold-300 font-serif font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-800">
                            {member.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{member.fullName}</div>
                            <div className="font-mono text-[11px] text-emerald-900 font-semibold">
                              {member.memberNumber}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Enrolled {new Date(member.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 font-mono flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Tier & Status */}
                      <td className="py-3.5 px-4 space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${tier.color}`}>
                          {tier.label}
                        </span>
                        <div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.color}`}>
                            <StatusIcon className="w-2.5 h-2.5" />
                            {status.label}
                          </span>
                        </div>
                      </td>

                      {/* Validity Period */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">
                          From: {new Date(member.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {member.endDate 
                            ? `Valid To: ${new Date(member.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`
                            : 'Perpetual (Lifetime)'}
                        </div>
                        {member.renewals && member.renewals.length > 0 && (
                          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                            &bull; Renewed {member.renewals.length} time(s)
                          </div>
                        )}
                      </td>

                      {/* Fee */}
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-emerald-950 text-sm">
                        ₹ {Number(member.feePaid).toLocaleString('en-IN')}
                      </td>

                      {/* Digital ID Modal Trigger */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedMemberForCard(member)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-emerald-950 hover:text-emerald-900 border border-slate-200 text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                          <span>View Card</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Renewal Button */}
                          <button
                            onClick={() => {
                              setRenewalMember(member);
                              setRenewalFee(member.membershipType === 'STUDENT' ? 500 : 2500);
                            }}
                            title="Renew Membership"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Verify / Certificate Link */}
                          <Link
                            href={`/verify/member/${member.qrVerificationHash}`}
                            target="_blank"
                            title="Official Verification & Certificate Page"
                            className="p-1.5 rounded-lg bg-gold-50 hover:bg-gold-100 text-amber-900 border border-gold-200 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Status Actions */}
                          {member.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusUpdate(member.id, 'ACTIVE')}
                              title="Approve & Activate"
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {member.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleStatusUpdate(member.id, 'SUSPENDED')}
                              title="Suspend Membership"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 transition-colors"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {member.status === 'SUSPENDED' && (
                            <button
                              onClick={() => handleStatusUpdate(member.id, 'ACTIVE')}
                              title="Reactivate Membership"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
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
            Showing <strong>{members.length}</strong> of <strong>{totalRecords}</strong> registered members
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

      {/* Digital ID Card Modal */}
      {selectedMemberForCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">Official Member Credential</h3>
                <p className="text-xs text-slate-500">Encrypted Digital ID with HMAC-SHA256 QR Verification</p>
              </div>
              <button
                onClick={() => setSelectedMemberForCard(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Visual Card Replica */}
            <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-6 border-2 border-gold-400 shadow-xl relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-gold-400/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between pb-4 border-b border-emerald-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gold-400 text-emerald-950 font-serif font-bold flex items-center justify-center text-sm shadow-md">
                    م
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-gold-300 font-bold">Imam E Mahdi Foundation</div>
                    <div className="text-xs font-serif font-bold text-white tracking-wide">Digital Operating System</div>
                  </div>
                </div>
                <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-gold-400 text-emerald-950 font-bold">
                  {selectedMemberForCard.membershipType}
                </span>
              </div>

              <div className="py-5 flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <div>
                    <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">Member Name</div>
                    <div className="text-lg font-serif font-bold text-white tracking-wide">{selectedMemberForCard.fullName}</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">Membership Number</div>
                    <div className="font-mono text-xs font-bold text-gold-300">{selectedMemberForCard.memberNumber}</div>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-emerald-200">
                    <div>
                      <span className="text-emerald-400 block font-semibold">Valid From</span>
                      {new Date(selectedMemberForCard.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </div>
                    <div>
                      <span className="text-emerald-400 block font-semibold">Valid Until</span>
                      {selectedMemberForCard.endDate ? new Date(selectedMemberForCard.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Perpetual'}
                    </div>
                  </div>
                </div>

                {/* QR Symbol representation */}
                <div className="w-24 h-24 bg-white p-2 rounded-2xl border-2 border-gold-400/80 flex flex-col items-center justify-center text-center shadow-lg">
                  <QrCode className="w-14 h-14 text-emerald-950" />
                  <span className="text-[7px] text-slate-600 font-mono font-bold mt-1">HMAC-SHA256</span>
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-800/80 flex items-center justify-between text-[9px] text-emerald-300">
                <span>Security Token: {selectedMemberForCard.qrVerificationHash.substring(0, 16)}...</span>
                <span className="text-gold-300 font-bold">IMF-VERIFIED</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href={`/verify/member/${selectedMemberForCard.qrVerificationHash}`}
                target="_blank"
                className="px-4 py-2 rounded-xl bg-emerald-950 text-gold-300 hover:bg-emerald-900 text-xs font-bold flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Verification & Certificate Page</span>
              </Link>
              <button
                onClick={() => setSelectedMemberForCard(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renewal Processing Modal */}
      {renewalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">Renew Membership</h3>
                <p className="text-xs text-slate-500">Record subscription renewal and auto-extend valid period</p>
              </div>
              <button
                onClick={() => setRenewalMember(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessRenewal} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">{renewalMember.fullName}</div>
                <div className="font-mono text-emerald-900 font-semibold">{renewalMember.memberNumber}</div>
                <div className="text-slate-500 text-[11px]">
                  Current Expiry: {renewalMember.endDate ? new Date(renewalMember.endDate).toLocaleDateString('en-IN') : 'None'}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Renewal Extension Duration</label>
                <select
                  value={renewalMonths}
                  onChange={(e) => setRenewalMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                >
                  <option value={12}>1 Year (12 Months)</option>
                  <option value={24}>2 Years (24 Months)</option>
                  <option value={36}>3 Years (36 Months)</option>
                  <option value={60}>5 Years (60 Months)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Renewal Fee (INR)</label>
                <input
                  type="number"
                  min="0"
                  value={renewalFee}
                  onChange={(e) => setRenewalFee(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Reference / Receipt #</label>
                <input
                  type="text"
                  placeholder="e.g. REC-2026-9021 or UTR-98273"
                  value={renewalPaymentRef}
                  onChange={(e) => setRenewalPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setRenewalMember(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRenewing}
                  className="px-5 py-2 rounded-xl bg-emerald-950 text-gold-300 font-bold hover:bg-emerald-900 flex items-center gap-1.5 shadow-sm"
                >
                  {isRenewing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm & Issue Renewal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
