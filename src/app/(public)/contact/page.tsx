import React from 'react';
import { getCmsPage } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { PublicInquiryForm } from '@/components/public/PublicInquiryForm';
import { MapPin, Phone, Mail, Clock, Globe2, MessageSquare, ShieldCheck } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Contact Us | Central Secretariat & Regional Hubs',
  description:
    'Contact the Imam E Mahdi Foundation central secretariat in Lucknow, state dispatch desks, and 24/7 donor helpline.',
  path: '/contact',
});

export default async function ContactPage() {
  const page = await getCmsPage('contact');

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Get in Touch
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

      {/* Main Grid: Form + Office Locations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Form */}
          <div className="lg:col-span-7">
            <PublicInquiryForm />
          </div>

          {/* Right: Office & Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800 shadow-xl space-y-6">
              <h3 className="font-serif font-bold text-xl text-white border-b border-emerald-800 pb-3">
                Central Secretariat
              </h3>

              <div className="space-y-4 text-sm text-emerald-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Main Relief Complex</strong>
                    <span>14/2 Victoria Street, Near Imambara Ghufran Ma’ab, Lucknow, Uttar Pradesh 226003, India</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gold-400 shrink-0" />
                  <div>
                    <strong className="text-white block">24/7 Helpline &amp; WhatsApp Desk</strong>
                    <span>+91-522-2610110 / +91-9450000000</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gold-400 shrink-0" />
                  <div>
                    <strong className="text-white block">Official Electronic Correspondence</strong>
                    <span>contact@imammission.org / secretariat@imammission.org</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gold-400 shrink-0" />
                  <div>
                    <strong className="text-white block">Secretariat Working Hours</strong>
                    <span>Mon &ndash; Sat: 09:30 AM &ndash; 06:30 PM IST</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Hubs Info */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h4 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
                Regional Logistics Desks
              </h4>
              <div className="space-y-3 text-xs text-slate-600">
                <div>
                  <strong className="text-slate-900 block font-sans">New Delhi Liaison Office:</strong>
                  <span>Jasola Vihar Institutional Area, New Delhi 110025</span>
                </div>
                <div>
                  <strong className="text-slate-900 block font-sans">Varanasi &amp; Purvanchal Center:</strong>
                  <span>Madanpura Relief Hub, Varanasi, UP 221001</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
