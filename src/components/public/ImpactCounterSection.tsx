'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Coins, 
  GraduationCap, 
  Activity, 
  HeartHandshake, 
  MapPin, 
  ArrowRight, 
  ShieldCheck 
} from 'lucide-react';

interface ImpactMetricsProps {
  metrics?: {
    totalBeneficiaries: string;
    zakatDisbursed: string;
    scholarshipsFunded: string;
    healthCampsHeld: string;
    activeVolunteers: string;
    villagesReached: string;
  };
}

export function ImpactCounterSection({
  metrics = {
    totalBeneficiaries: '48,500+',
    zakatDisbursed: '₹ 4.2+ Cr',
    scholarshipsFunded: '2,850+',
    healthCampsHeld: '140+',
    activeVolunteers: '3,500+',
    villagesReached: '180+',
  },
}: ImpactMetricsProps) {
  const statItems = [
    {
      label: 'Beneficiaries Uplifted',
      value: metrics.totalBeneficiaries,
      icon: Users,
      desc: 'Vetted individuals receiving food, shelter, and direct assistance',
    },
    {
      label: 'Direct Zakat & Aid Disbursed',
      value: metrics.zakatDisbursed,
      icon: Coins,
      desc: '100% theological isolation without administrative deductions',
    },
    {
      label: 'Higher Education Scholarships',
      value: metrics.scholarshipsFunded,
      icon: GraduationCap,
      desc: 'Deserving orphan & rural students pursuing degrees',
    },
    {
      label: 'Free Medical Camps & Dialysis',
      value: metrics.healthCampsHeld,
      icon: Activity,
      desc: 'Specialist consultations, diagnostics, and lifesaving renal care',
    },
    {
      label: 'Active Volunteer Corps',
      value: metrics.activeVolunteers,
      icon: HeartHandshake,
      desc: 'Doctors, educators, and field relief volunteers across districts',
    },
    {
      label: 'Villages & Districts Served',
      value: metrics.villagesReached,
      icon: MapPin,
      desc: 'Deep penetration in rural and marginalized communities',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-emerald-950 text-white relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#C59A4E_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-900/80 border border-gold-500/40 text-gold-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
            <span>Audited Humanitarian Telemetry &bull; FY 2025-26</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Measurable, Verifiable &amp; Dignified Impact
          </h2>
          <p className="text-sm sm:text-base text-emerald-200/90 leading-relaxed">
            We believe trust is forged through empirical transparency. Every program disbursement is mapped to double-entry general ledger journals.
          </p>
        </div>

        {/* 6 Grid Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {statItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-2xl bg-emerald-900/40 border border-emerald-800/60 backdrop-blur-sm hover:border-gold-500/50 transition-all duration-300 space-y-3 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gold-500/15 text-gold-400 border border-gold-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                    {item.value}
                  </div>
                  <h4 className="text-base font-semibold text-emerald-100">{item.label}</h4>
                </div>
                <p className="text-xs text-emerald-300/80 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Action Link to Transparency Page */}
        <div className="mt-12 text-center">
          <Link
            href="/transparency"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-gold-300 hover:text-white font-semibold text-sm border border-gold-500/30 transition-all"
          >
            <span>View Public Financial Ledger &amp; Fund Ratios</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
