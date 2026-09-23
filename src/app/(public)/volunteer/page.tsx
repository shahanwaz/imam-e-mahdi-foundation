import React from 'react';
import { getCmsPage } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { VolunteerApplicationForm } from '@/components/public/VolunteerApplicationForm';
import { HeartHandshake, ShieldCheck, Users, Stethoscope, BookOpen, Truck, Award } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Volunteer Opportunities | Join the Humanitarian Corps',
  description:
    'Join over 3,500 registered doctors, educators, and field volunteers serving vulnerable families across humanitarian relief drives.',
  path: '/volunteer',
});

export default async function VolunteerPage() {
  const page = await getCmsPage('volunteer');

  const volunteerPillars = [
    {
      title: 'Medical & Clinical Consultations',
      desc: 'Physicians, ophthalmologists, and nurses providing free care in mobile rural camps.',
      icon: Stethoscope,
    },
    {
      title: 'Student Mentorship & Teaching',
      desc: 'Tutors supporting orphan students with competitive exam prep, STEM, and soft skills.',
      icon: BookOpen,
    },
    {
      title: 'Emergency Relief Logistics',
      desc: 'Ground coordination for ration packaging, winter blanket distribution, and disaster aid.',
      icon: Truck,
    },
    {
      title: 'Tech, Media & Accounting',
      desc: 'Digital professionals contributing skills in cloud software, graphic design, and audit support.',
      icon: Award,
    },
  ];

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Community Service
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
              {page.title}
            </h1>
            <p className="text-base sm:text-lg text-emerald-200/90 leading-relaxed">
              {page.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Volunteer Opportunity Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {volunteerPillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900">{p.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Embedded Registration Form */}
        <div className="max-w-4xl mx-auto">
          <VolunteerApplicationForm />
        </div>
      </div>
    </div>
  );
}
