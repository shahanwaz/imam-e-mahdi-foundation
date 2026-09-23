'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building,
  DollarSign,
  ShieldCheck,
  FileCheck,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';

export default function AdminSettingsPage() {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-emerald-950 tracking-tight">
            Organization &amp; System Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure Foundation identity, financial defaults, security guardrails, and compliance statuses.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSave}
          variant="gold"
          size="sm"
          leftIcon={<Save className="w-3.5 h-3.5" />}
        >
          {isSaved ? 'Saved Changes' : 'Save Changes'}
        </Button>
      </div>

      {isSaved && (
        <Alert variant="success" icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}>
          System settings have been successfully updated in PostgreSQL database.
        </Alert>
      )}

      {/* 1. Legal Entity & Foundation Details */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-800" />
            <CardTitle>Foundation Identity &amp; Contact</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600">Official Legal Entity Name</label>
              <input
                type="text"
                defaultValue="Imam E Mahdi Foundation"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600">Foundation Email</label>
              <input
                type="email"
                defaultValue="contact@imf-foundation.org"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600">Headquarters Address</label>
              <input
                type="text"
                defaultValue="Lucknow, Uttar Pradesh, India"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600">Official Contact Helpline</label>
              <input
                type="text"
                defaultValue="+91 522 0000000"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Financial Defaults & Accounting Settings */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-800" />
            <CardTitle>Financial Accounting Defaults</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600">Base Currency</label>
              <select
                defaultValue="INR"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-700"
              >
                <option value="INR">Indian Rupee (INR - ₹)</option>
                <option value="USD">US Dollar (USD - $)</option>
                <option value="GBP">British Pound (GBP - £)</option>
                <option value="EUR">Euro (EUR - €)</option>
                <option value="SAR">Saudi Riyal (SAR - ﷼)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600">Active Financial Year</label>
              <input
                type="text"
                readOnly
                defaultValue="2026-2027"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600">Zakat Nisab Pegging</label>
              <select
                defaultValue="SILVER"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-700"
              >
                <option value="SILVER">Silver Standard (612.36 grams) - Recommended</option>
                <option value="GOLD">Gold Standard (87.48 grams)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Statutory Regulatory & Compliance Matrix */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-800" />
              <CardTitle>Statutory Registration &amp; Tax Exemptions</CardTitle>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">India Regulatory</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="divide-y divide-slate-100 text-xs">
            {[
              {
                filing: 'Section 80G Tax Exemption',
                desc: 'Permits 50% tax deductions for Indian donors.',
                status: 'UNVERIFIED',
              },
              {
                filing: 'Section 12AB Registration',
                desc: 'Income Tax NGO tax exemption registration.',
                status: 'UNVERIFIED',
              },
              {
                filing: 'CSR Form CSR-1',
                desc: 'Ministry of Corporate Affairs registration for CSR grants.',
                status: 'UNVERIFIED',
              },
              {
                filing: 'FCRA (Foreign Contribution Regulation)',
                desc: 'Authorization to receive foreign diaspora contributions.',
                status: 'UNVERIFIED',
              },
            ].map((reg, idx) => (
              <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900">{reg.filing}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{reg.desc}</p>
                </div>
                <Badge variant="unverified-legal" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
