'use client';

import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Search, 
  Plus, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Users, 
  DollarSign,
  TrendingUp,
  UserCheck,
  Send
} from 'lucide-react';

interface BeneficiaryItem {
  id: string;
  beneficiaryNumber: string;
  fullName: string;
  gender: string;
  phone?: string;
  city: string;
  district?: string;
  state?: string;
  category: string;
  vulnerabilityTier: 'CRITICAL_URGENT' | 'HIGH_PRIORITY' | 'MODERATE' | 'STABLE_MONITORING';
  vulnerabilityScore: number;
  verificationStatus: string;
  nationalIdMasked?: string;
  rationCardMasked?: string;
  bankAccountMasked?: string;
  householdMemberCount: number;
  monthlyIncomeINR: number;
  primaryNeedSummary: string;
  estimatedAidRequiredINR: number;
  createdAt: string;
  _count?: { familyMembers: number; assistanceRecords: number };
  assistanceRecords?: Array<{ amountINR: number }>;
}

interface BeneficiaryAnalytics {
  totalBeneficiaries: number;
  criticalUrgentBeneficiaries: number;
  approvedVerifiedBeneficiaries: number;
  totalAssistanceDisbursedINR: number;
  totalAssistanceTransactions: number;
}

export default function AdminBeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryItem[]>([]);
  const [analytics, setAnalytics] = useState<BeneficiaryAnalytics>({
    totalBeneficiaries: 0,
    criticalUrgentBeneficiaries: 0,
    approvedVerifiedBeneficiaries: 0,
    totalAssistanceDisbursedINR: 0,
    totalAssistanceTransactions: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // New Enrollment Modal State
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [gender, setGender] = useState<string>('FEMALE');
  const [phone, setPhone] = useState<string>('');
  const [city, setCity] = useState<string>('Mumbai');
  const [district, setDistrict] = useState<string>('');
  const [category, setCategory] = useState<string>('WIDOW_ASSISTANCE');
  const [nationalId, setNationalId] = useState<string>('');
  const [rationCardNumber, setRationCardNumber] = useState<string>('');
  const [bankAccountNumber, setBankAccountNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [householdCount, setHouseholdCount] = useState<number>(4);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(3000);
  const [primaryNeed, setPrimaryNeed] = useState<string>('');
  const [estimatedAid, setEstimatedAid] = useState<number>(10000);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sensitive PII Decryption Modal State
  const [unmaskedBeneficiary, setUnmaskedBeneficiary] = useState<any | null>(null);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);

  // Assistance Disbursement Modal State
  const [aidBeneficiary, setAidBeneficiary] = useState<BeneficiaryItem | null>(null);
  const [aidAmount, setAidAmount] = useState<number>(5000);
  const [aidType, setAidType] = useState<string>('DIRECT_BANK_TRANSFER');
  const [aidDescription, setAidDescription] = useState<string>('Emergency Family Ration & Subsidy Grant');
  const [aidPaymentRef, setAidPaymentRef] = useState<string>('');
  const [isDisbursing, setIsDisbursing] = useState<boolean>(false);

  const [notification, setNotification] = useState<string | null>(null);

  const fetchBeneficiaries = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search ? { search } : {}),
        ...(categoryFilter ? { category: categoryFilter } : {}),
        ...(tierFilter ? { vulnerabilityTier: tierFilter } : {}),
        ...(statusFilter ? { verificationStatus: statusFilter } : {}),
      });

      const res = await fetch(`/api/admin/beneficiaries?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success) {
        setBeneficiaries(json.data.beneficiaries || []);
        if (json.data.analytics) {
          setAnalytics(json.data.analytics);
        }
        if (json.meta) {
          setTotalPages(json.meta.totalPages || 1);
          setTotalRecords(json.meta.totalRecords || 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch beneficiaries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, [page, categoryFilter, tierFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBeneficiaries();
  };

  const handleEnrollBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          gender,
          phone,
          city,
          district,
          category,
          nationalId,
          rationCardNumber,
          bankAccountNumber,
          ifscCode,
          householdMemberCount: Number(householdCount),
          monthlyIncomeINR: Number(monthlyIncome),
          primaryNeedSummary: primaryNeed,
          estimatedAidRequiredINR: Number(estimatedAid),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNotification(`Beneficiary #${json.data.beneficiaryNumber} enrolled with encrypted AES-256 PII vault!`);
        setIsEnrolling(false);
        setFullName('');
        setPrimaryNeed('');
        setTimeout(() => setNotification(null), 4000);
        fetchBeneficiaries();
      }
    } catch (err) {
      console.error('Failed to enroll beneficiary', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevealPII = async (beneficiaryId: string) => {
    setIsDecrypting(true);
    try {
      const res = await fetch(`/api/admin/beneficiaries/${beneficiaryId}?unmask=true`);
      const json = await res.json();
      if (json.success) {
        setUnmaskedBeneficiary(json.data);
      }
    } catch (err) {
      console.error('Failed to decrypt PII', err);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleDisburseAid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aidBeneficiary) return;
    setIsDisbursing(true);
    try {
      const res = await fetch(`/api/admin/beneficiaries/${aidBeneficiary.id}/assistance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountINR: Number(aidAmount),
          assistanceType: aidType,
          itemDescription: aidDescription,
          paymentReference: aidPaymentRef || `DBT-REC-${Date.now()}`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNotification(`Assistance disbursed to ${aidBeneficiary.fullName} (Ref: ${json.data.assistanceNumber})`);
        setAidBeneficiary(null);
        setTimeout(() => setNotification(null), 4000);
        fetchBeneficiaries();
      }
    } catch (err) {
      console.error('Failed to disburse assistance', err);
    } finally {
      setIsDisbursing(false);
    }
  };

  const getTierBadge = (tier: string, score: number) => {
    switch (tier) {
      case 'CRITICAL_URGENT':
        return { label: `Critical (${score})`, color: 'bg-rose-100 text-rose-900 border-rose-300' };
      case 'HIGH_PRIORITY':
        return { label: `High Priority (${score})`, color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'MODERATE':
        return { label: `Moderate (${score})`, color: 'bg-blue-100 text-blue-900 border-blue-200' };
      default:
        return { label: `Stable (${score})`, color: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Beneficiary Registry & Sensitive PII Vault
          </h1>
          <p className="text-xs text-slate-500">
            Socioeconomic Needs Registry with AES-256 encrypted National IDs, bank accounts, automated Vulnerability Scoring (1-100), and aid disbursement tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEnrolling(true)}
            className="px-4 py-2 rounded-xl bg-emerald-950 text-gold-300 hover:bg-emerald-900 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enroll Beneficiary</span>
          </button>
          <button
            onClick={() => fetchBeneficiaries()}
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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">
            {analytics.totalBeneficiaries.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            Assessed households
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-rose-950 text-white border border-rose-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Critical Need Tier</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-white">
            {analytics.criticalUrgentBeneficiaries}
          </div>
          <div className="text-[11px] text-rose-300">
            Vulnerability score &ge; 80 / 100
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">Field Verified</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-white">
            {analytics.approvedVerifiedBeneficiaries}
          </div>
          <div className="text-[11px] text-emerald-300">
            On-ground vetted & approved
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Aid Disbursed (INR)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-950 font-mono">
            ₹ {analytics.totalAssistanceDisbursedINR.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            Across {analytics.totalAssistanceTransactions} direct DBT disbursements
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
              placeholder="Search beneficiary by name, ID (IMF-BEN-...), phone, city, or masked Aadhaar..."
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
              <option value="WIDOW_ASSISTANCE">Widow Assistance</option>
              <option value="ORPHAN_SUPPORT">Orphan Support</option>
              <option value="MEDICAL_EMERGENCY">Medical Emergency</option>
              <option value="EDUCATION_AID">Education Aid</option>
              <option value="FOOD_NUTRITION">Food & Nutrition</option>
              <option value="DISABILITY_SUPPORT">Disability Support</option>
            </select>

            <select
              value={tierFilter}
              onChange={(e) => {
                setTierFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-700"
            >
              <option value="">All Vulnerability Tiers</option>
              <option value="CRITICAL_URGENT">Critical Urgent (&ge;80)</option>
              <option value="HIGH_PRIORITY">High Priority (60-79)</option>
              <option value="MODERATE">Moderate (40-59)</option>
              <option value="STABLE_MONITORING">Stable (&lt;40)</option>
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

      {/* Beneficiaries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Beneficiary & ID</th>
                <th className="py-3 px-4">Category & Location</th>
                <th className="py-3 px-4">Vulnerability Tier</th>
                <th className="py-3 px-4">Masked PII (AES-256 Vault)</th>
                <th className="py-3 px-4">Household & Income</th>
                <th className="py-3 px-4 text-right">Aid Disbursed</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 animate-pulse">
                    Loading beneficiary registry...
                  </td>
                </tr>
              ) : beneficiaries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No beneficiary records found.
                  </td>
                </tr>
              ) : (
                beneficiaries.map((ben) => {
                  const tier = getTierBadge(ben.vulnerabilityTier, ben.vulnerabilityScore);
                  const totalAid = ben.assistanceRecords?.reduce((a, b) => a + Number(b.amountINR), 0) || 0;

                  return (
                    <tr key={ben.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-950 text-gold-300 font-serif font-bold text-xs flex items-center justify-center shrink-0">
                            {ben.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{ben.fullName}</div>
                            <div className="font-mono text-[11px] text-emerald-900 font-semibold">
                              {ben.beneficiaryNumber}
                            </div>
                            <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                              {ben.primaryNeedSummary}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold block w-fit mb-1">
                          {ben.category.replace(/_/g, ' ')}
                        </span>
                        <div className="text-slate-600 text-[11px] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                          <span>{ben.district || ben.city}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${tier.color}`}>
                          {tier.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 space-y-1">
                        <div className="font-mono text-[11px] text-slate-700 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>ID: {ben.nationalIdMasked || 'XXXX-XXXX-XXXX'}</span>
                        </div>
                        {ben.bankAccountMasked && (
                          <div className="font-mono text-[10px] text-slate-500">
                            Bank: {ben.bankAccountMasked}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">
                          {ben.householdMemberCount} Household Members
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Income: ₹{Number(ben.monthlyIncomeINR).toLocaleString('en-IN')}/mo
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-bold text-emerald-950 text-sm">
                          ₹ {totalAid.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {ben._count?.assistanceRecords || ben.assistanceRecords?.length || 0} grant(s)
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reveal PII Button */}
                          <button
                            onClick={() => handleRevealPII(ben.id)}
                            title="View Secure Decrypted PII (Requires Auth)"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Disburse Aid Button */}
                          <button
                            onClick={() => setAidBeneficiary(ben)}
                            title="Disburse Direct Aid / DBT Grant"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
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
            Showing <strong>{beneficiaries.length}</strong> of <strong>{totalRecords}</strong> beneficiaries
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

      {/* New Beneficiary Enrollment Modal */}
      {isEnrolling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">Enroll New Beneficiary</h3>
                <p className="text-xs text-slate-500">Confidential intake with automatic Vulnerability Index scoring</p>
              </div>
              <button
                onClick={() => setIsEnrolling(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnrollBeneficiary} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Zainab Begum"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assistance Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold"
                  >
                    <option value="WIDOW_ASSISTANCE">Widow Assistance</option>
                    <option value="ORPHAN_SUPPORT">Orphan Support</option>
                    <option value="MEDICAL_EMERGENCY">Medical Emergency</option>
                    <option value="EDUCATION_AID">Education Aid</option>
                    <option value="FOOD_NUTRITION">Food & Nutrition</option>
                    <option value="DISABILITY_SUPPORT">Disability Support</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City / District</label>
                  <input
                    type="text"
                    placeholder="e.g. Govandi, Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Sensitive Encrypted Fields Section */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-2 text-amber-950 font-bold">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Sensitive PII Vault (Stored via AES-256-GCM)</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-amber-900 block mb-1">National ID / Aadhaar</label>
                    <input
                      type="text"
                      placeholder="e.g. 1234 5678 9012"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-amber-900 block mb-1">Ration Card Number</label>
                    <input
                      type="text"
                      placeholder="e.g. BPL-9921-2026"
                      value={rationCardNumber}
                      onChange={(e) => setRationCardNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-amber-900 block mb-1">Bank Account Number (DBT)</label>
                    <input
                      type="text"
                      placeholder="e.g. 5010023910293"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-amber-900 block mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001234"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-slate-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Household Dependents Count</label>
                  <input
                    type="number"
                    min="1"
                    value={householdCount}
                    onChange={(e) => setHouseholdCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Monthly Household Income (INR)</label>
                  <input
                    type="number"
                    min="0"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Need Assessment & Living Conditions</label>
                <textarea
                  rows={2}
                  placeholder="Document living arrangement, children's education status, medical prescriptions, and immediate relief requirements..."
                  value={primaryNeed}
                  onChange={(e) => setPrimaryNeed(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEnrolling(false)}
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
                  <span>Enroll & Encrypt Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sensitive PII Decryption Modal */}
      {unmaskedBeneficiary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-slate-900 text-base">Decrypted PII Vault</h3>
                  <p className="text-[10px] text-slate-500">Audit logged access to sensitive credentials</p>
                </div>
              </div>
              <button
                onClick={() => setUnmaskedBeneficiary(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Beneficiary Name</span>
                <span className="font-bold text-slate-900 text-sm">{unmaskedBeneficiary.fullName}</span>
              </div>

              <div className="border-t border-slate-200 pt-2 space-y-2">
                <div>
                  <span className="text-slate-500 text-[10px] block font-semibold">National ID / Aadhaar</span>
                  <span className="font-mono font-bold text-emerald-950 text-xs bg-white px-2 py-1 rounded-lg border border-slate-200 block">
                    {unmaskedBeneficiary.decryptedNationalId || unmaskedBeneficiary.nationalIdMasked || 'Not provided'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-semibold">Bank Account Number (DBT)</span>
                  <span className="font-mono font-bold text-emerald-950 text-xs bg-white px-2 py-1 rounded-lg border border-slate-200 block">
                    {unmaskedBeneficiary.decryptedBankAccount || unmaskedBeneficiary.bankAccountMasked || 'Not provided'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-semibold">Ration Card Reference</span>
                  <span className="font-mono text-slate-700 text-xs bg-white px-2 py-1 rounded-lg border border-slate-200 block">
                    {unmaskedBeneficiary.decryptedRationCard || unmaskedBeneficiary.rationCardMasked || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => setUnmaskedBeneficiary(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close & Clear View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Aid Disbursement Modal */}
      {aidBeneficiary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">Disburse Direct Aid</h3>
                <p className="text-xs text-slate-500">Record direct grant, ration subsidy, or emergency relief disbursement</p>
              </div>
              <button
                onClick={() => setAidBeneficiary(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDisburseAid} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">{aidBeneficiary.fullName}</div>
                <div className="font-mono text-emerald-900 font-semibold">{aidBeneficiary.beneficiaryNumber}</div>
                <div className="text-slate-500 text-[11px]">
                  Category: {aidBeneficiary.category} &bull; Score: {aidBeneficiary.vulnerabilityScore}/100
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Disbursement Amount (INR)</label>
                  <input
                    type="number"
                    min="100"
                    value={aidAmount}
                    onChange={(e) => setAidAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assistance Type</label>
                  <select
                    value={aidType}
                    onChange={(e) => setAidType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  >
                    <option value="DIRECT_BANK_TRANSFER">Direct Bank Transfer</option>
                    <option value="RATION_KIT">Ration & Food Kit</option>
                    <option value="MEDICAL_SUBSIDY">Medical Subsidy</option>
                    <option value="FEE_PAYMENT">School/College Fee</option>
                    <option value="IN_KIND_GOODS">In-Kind Supplies</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Disbursement Description</label>
                <input
                  type="text"
                  value={aidDescription}
                  onChange={(e) => setAidDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Reference / UTR #</label>
                <input
                  type="text"
                  placeholder="e.g. UTR-98218274 or DBT-BATCH-001"
                  value={aidPaymentRef}
                  onChange={(e) => setAidPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAidBeneficiary(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDisbursing}
                  className="px-5 py-2 rounded-xl bg-emerald-950 text-gold-300 font-bold hover:bg-emerald-900 flex items-center gap-1.5 shadow-sm"
                >
                  {isDisbursing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Disbursement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
