'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Heart, 
  Award, 
  FileCheck2, 
  Mail, 
  Phone, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Coins 
} from 'lucide-react';
import Link from 'next/link';

interface DonorProfileItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  panMasked?: string;
  totalDonatedAmount: number;
  donationCount: number;
  isTaxExemptEligible: boolean;
  createdAt: string;
  donations: Array<{
    id: string;
    receiptNumber: string;
    amount: number;
    currency: string;
    fundType: string;
    paymentStatus: string;
    createdAt: string;
  }>;
}

export default function AdminDonorsCRMPage() {
  const [donors, setDonors] = useState<DonorProfileItem[]>([]);
  const [totalDonors, setTotalDonors] = useState<number>(0);
  const [totalLifetimeGivingINR, setTotalLifetimeGivingINR] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(search ? { search } : {}),
      });

      const res = await fetch(`/api/admin/donors?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success) {
        setDonors(json.data.donors || []);
        setTotalDonors(json.data.totalDonors || 0);
        setTotalLifetimeGivingINR(json.data.totalLifetimeGivingINR || 0);
        if (json.meta) {
          setTotalPages(json.meta.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Failed to fetch donors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDonors();
  };

  const getTierBadge = (amount: number) => {
    if (amount >= 500000) {
      return { label: 'Platinum Benefactor', color: 'bg-indigo-100 text-indigo-900 border-indigo-200' };
    }
    if (amount >= 100000) {
      return { label: 'Gold Patron', color: 'bg-amber-100 text-amber-900 border-amber-300' };
    }
    if (amount >= 25000) {
      return { label: 'Silver Supporter', color: 'bg-slate-200 text-slate-900 border-slate-300' };
    }
    return { label: 'Active Donor', color: 'bg-emerald-50 text-emerald-900 border-emerald-200' };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Donor Relationship Management (CRM)
          </h1>
          <p className="text-xs text-slate-500">
            Centralized donor database with encrypted PAN records, giving history, lifetime contribution tiers, and 80G tax receipt tracking.
          </p>
        </div>

        <button
          onClick={() => fetchDonors()}
          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registered Donors</span>
          <div className="text-2xl font-serif font-bold text-emerald-950">
            {totalDonors.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            Across domestic and diaspora giving
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-900 shadow-sm space-y-1">
          <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">Total Cumulative Giving (INR)</span>
          <div className="text-2xl font-serif font-bold text-white">
            ₹ {totalLifetimeGivingINR.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-300">
            Audited and reconciled on general ledger
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Gift Size (INR)</span>
          <div className="text-2xl font-serif font-bold text-slate-900">
            ₹ {totalDonors > 0 ? Math.round(totalLifetimeGivingINR / totalDonors).toLocaleString('en-IN') : '0'}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            High-affinity recurring donors
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by donor name, email, phone, masked PAN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-950 text-white text-xs font-bold hover:bg-emerald-900"
          >
            Search CRM
          </button>
        </form>
      </div>

      {/* Donors CRM Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Donor Profile</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">PAN / Tax Status</th>
                <th className="py-3 px-4 text-right">Lifetime Total (INR)</th>
                <th className="py-3 px-4 text-center">Gifts</th>
                <th className="py-3 px-4">Patron Tier</th>
                <th className="py-3 px-4">Recent Giving</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 animate-pulse">
                    Loading CRM directory...
                  </td>
                </tr>
              ) : donors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No donor profiles found.
                  </td>
                </tr>
              ) : (
                donors.map((donor) => {
                  const tier = getTierBadge(Number(donor.totalDonatedAmount));

                  return (
                    <tr key={donor.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-900 text-gold-300 font-serif font-bold text-xs flex items-center justify-center shrink-0">
                            {donor.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{donor.fullName}</div>
                            <div className="text-[10px] text-slate-400">
                              Joined {new Date(donor.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 font-mono flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{donor.email}</span>
                        </div>
                        {donor.phone && (
                          <div className="text-slate-500 text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{donor.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {donor.panMasked ? (
                          <div className="space-y-0.5">
                            <span className="font-mono text-slate-900 font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                              {donor.panMasked}
                            </span>
                            <span className="text-[10px] text-emerald-700 block font-semibold">
                              &bull; 80G Tax Eligible
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No PAN Registered</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold font-mono text-emerald-950 text-sm">
                        ₹ {Number(donor.totalDonatedAmount).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {donor.donationCount}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${tier.color}`}>
                          {tier.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {donor.donations && donor.donations.length > 0 ? (
                          <div className="space-y-1">
                            {donor.donations.slice(0, 2).map((d) => (
                              <div key={d.id} className="text-[11px] flex items-center justify-between gap-2 text-slate-600">
                                <span className="font-mono text-emerald-900 font-semibold">#{d.receiptNumber}</span>
                                <span>₹ {Number(d.amount).toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">&mdash;</span>
                        )}
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
            Showing <strong>{donors.length}</strong> of <strong>{totalDonors}</strong> donors
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
    </div>
  );
}
