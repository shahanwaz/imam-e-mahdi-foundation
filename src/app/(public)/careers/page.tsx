import React from 'react';
import Link from 'next/link';
import { getCmsPage } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { RecruitmentService } from '@/lib/recruitment/recruitment-service';
import PublicCareersClient from '@/components/public/careers/PublicCareersClient';
import { ArrowRight, Briefcase, HeartHandshake, ShieldCheck, Award } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Careers & Humanitarian Fellowships | Work With Purpose',
  description:
    'Join our mission-driven team of field coordinators, doctors, engineers, and non-profit leaders uplifting vulnerable communities.',
  path: '/careers',
});

const DEFAULT_CAREER_POSITIONS = [
  {
    id: 'job_fallback_1',
    jobCode: 'IMF-JOB-2026-00001',
    title: 'Senior Field Relief Coordinator',
    department: { name: 'Field Relief & Disaster Ops', code: 'FIELD_OPS' },
    designation: { title: 'Senior Field Coordinator' },
    employmentType: 'FULL_TIME',
    locationCity: 'Lucknow / Field Hubs',
    salaryRangeDisplay: '₹45,000 - ₹65,000 / mo',
    description:
      'Lead rapid emergency response and medical camps in rural areas, coordinating volunteers and supply logistics.',
    requirements: '3+ years field NGO experience, emergency logistics, fluent Hindi/Urdu, valid DL.',
    benefits: 'Comprehensive health coverage, field allowance, travel reimbursement.',
  },
  {
    id: 'job_fallback_2',
    jobCode: 'IMF-JOB-2026-00002',
    title: 'Lead Full-Stack Systems Engineer (Digital Infrastructure)',
    department: { name: 'Technology & Digital Ops', code: 'TECH_OPS' },
    designation: { title: 'Staff Software Engineer' },
    employmentType: 'FULL_TIME',
    locationCity: 'Remote / New Delhi Hub',
    salaryRangeDisplay: '₹80,000 - ₹1,20,000 / mo',
    description:
      'Architect and maintain the IMF-DOS open digital backbone, ERP platform, offline field synchronization apps, and donor verification systems.',
    requirements: 'Next.js, TypeScript, PostgreSQL, Prisma, Secure PII encryption standards, distributed systems.',
    benefits: 'Remote flexibility, equipment stipend, continuous professional development grant.',
  },
  {
    id: 'job_fallback_3',
    jobCode: 'IMF-JOB-2026-00003',
    title: 'Donor Relations & Grant Specialist',
    department: { name: 'Partnerships & Grants', code: 'PARTNERSHIPS' },
    designation: { title: 'Senior Grant Manager' },
    employmentType: 'FULL_TIME',
    locationCity: 'New Delhi / Hybrid',
    salaryRangeDisplay: '₹55,000 - ₹75,000 / mo',
    description:
      'Cultivate relationships with global humanitarian institutions, write high-impact philanthropic grant proposals, and audit utilization reports.',
    requirements: 'Demonstrated track record with international donor grants, institutional CSR compliance, impeccable drafting skills.',
    benefits: 'Flexible schedule, conference travel, health benefits.',
  },
  {
    id: 'job_fallback_4',
    jobCode: 'IMF-JOB-2026-00004',
    title: 'Humanitarian Medical Officer (MBBS)',
    department: { name: 'Healthcare Initiatives', code: 'HEALTHCARE' },
    designation: { title: 'Staff Physician' },
    employmentType: 'CONTRACT',
    locationCity: 'Varanasi / Rural Outreach Clinics',
    salaryRangeDisplay: '₹70,000 - ₹95,000 / mo',
    description:
      'Provide primary diagnostics and outpatient consultations across mobile health clinics and specialized screening camps.',
    requirements: 'MBBS degree, State Medical Council registration, community health passion.',
    benefits: 'Medical liability insurance, clinical allowances, housing support in rural postings.',
  },
];

export default async function CareersPage() {
  let dbJobs: any[] = [];
  try {
    dbJobs = await RecruitmentService.listPublicJobPostings();
  } catch {
    dbJobs = [];
  }

  const jobs = dbJobs.length > 0
    ? dbJobs.map((j) => ({
        id: j.id,
        jobCode: j.jobCode,
        title: j.title,
        department: { name: j.department?.name || 'Operations', code: j.department?.code || 'OPS' },
        designation: { title: j.designation?.title || 'Officer' },
        employmentType: j.employmentType,
        locationCity: j.locationCity,
        salaryRangeDisplay: j.salaryRangeDisplay || undefined,
        description: j.description,
        requirements: j.requirements,
        benefits: j.benefits || undefined,
      }))
    : DEFAULT_CAREER_POSITIONS;

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl border border-emerald-800/40">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Humanitarian Careers &amp; Fellowships
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
              Work With Purpose &amp; Dignity
            </h1>
            <p className="text-base sm:text-lg text-emerald-200/90 leading-relaxed">
              Join our multidisciplinary team of field coordinators, doctors, engineers, and humanitarian leaders committed to building transparent, sustainable relief ecosystems.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-slate-900 text-base">Humanity First</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every project, policy, and field operation is measured by the tangible dignity and relief provided to vulnerable families.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center text-gold-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-slate-900 text-base">Ethical Governance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We uphold transparent audit logs, encrypted sensitive data, and merit-based talent management free of bias.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-slate-900 text-base">Continuous Growth</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Comprehensive professional learning, emergency response certifications, and leadership development programs.
            </p>
          </div>
        </div>
      </div>

      {/* Open Positions Client Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800">
              Active Requisitions
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              Join Our Global Mission
            </h2>
          </div>
          <Link
            href="/volunteer"
            className="text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            <span>Looking to volunteer instead? Apply here</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <PublicCareersClient initialJobs={jobs} />
      </div>
    </div>
  );
}
