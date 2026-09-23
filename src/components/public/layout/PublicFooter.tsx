'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Heart, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Lock,
  Globe2,
  Building2
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

export function PublicFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-emerald-950 border-t border-emerald-800/60 text-emerald-200">
      {/* Top Banner: Radical Transparency & Ethical Integrity */}
      <div className="bg-emerald-900/40 border-b border-emerald-800/40 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gold-500/20 text-gold-400 border border-gold-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-base">
                100% Direct Zakat Policy &bull; Registered Section 8 Not-for-Profit
              </h4>
              <p className="text-emerald-300 text-xs sm:text-sm">
                Strict double-entry fund isolation. Official digitally signed receipts with HMAC-SHA256 QR verification.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/transparency"
              className="px-4 py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/80 text-white text-xs sm:text-sm font-medium border border-emerald-600/40 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Explore Financial Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/donate"
              className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-emerald-950 text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-md"
            >
              <Heart className="w-3.5 h-3.5 fill-emerald-950" />
              <span>Give Zakat / Sadaqah</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main 4-Column Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1 & 2: Brand & Legal Entity Distinction */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" variant="white" href="/" />

            <p className="text-sm text-emerald-300/90 leading-relaxed">
              <strong>IMAM MISSION</strong> is an internationally oriented humanitarian initiative dedicated to eradicating poverty, educating vulnerable orphans, providing lifesaving healthcare, and fostering economic self-reliance. Guided by sacred trust and absolute transparency.
            </p>

            {/* Legal Entity Attribution Card */}
            <div className="p-3.5 rounded-xl bg-emerald-900/40 border border-emerald-800/80 text-xs space-y-1.5 text-emerald-300">
              <div className="flex items-center gap-1.5 text-gold-300 font-bold">
                <Building2 className="w-4 h-4 text-gold-400 shrink-0" />
                <span>LEGAL ENTITY &amp; STATUTORY DETAILS</span>
              </div>
              <p className="text-white font-medium">
                IMAM E MAHDI FOUNDATION
              </p>
              <p className="text-emerald-300 text-[11px] leading-relaxed">
                Incorporated under Section 8 of the Companies Act, 2013 (Not-for-Profit Company)<br />
                <span className="font-mono text-gold-300">CIN: U88900DC2026NPL474906</span>
              </p>
            </div>

            <div className="pt-2 space-y-1 text-xs text-emerald-400">
              <p className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-gold-400" /> AES-256 PII Encrypted &bull; DPDP Act (2023) Compliant
              </p>
              <p className="flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-gold-400" /> WCAG 2.1 Level AAA Accessible
              </p>
            </div>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-gold-400 mb-2">
                Subscribe to Impact Dispatches
              </h5>
              {subscribed ? (
                <div className="p-3 rounded-xl bg-emerald-900/60 border border-emerald-700/60 text-xs text-gold-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Jazakallah! You are subscribed to our quarterly impact telemetry reports.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-emerald-900/60 border border-emerald-800 text-sm text-white placeholder-emerald-400/60 focus:outline-none focus:border-gold-400 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-emerald-950 font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Col 3: Programs & Causes */}
          <div className="space-y-3">
            <h5 className="text-sm font-semibold uppercase tracking-wider text-white font-serif border-b border-emerald-800/80 pb-2">
              Programs &amp; Causes
            </h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/programs" className="hover:text-gold-300 transition-colors">
                  Humanitarian Programs
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-gold-300 transition-colors">
                  Active Capital Projects
                </Link>
              </li>
              <li>
                <Link href="/causes" className="hover:text-gold-300 transition-colors">
                  Emergency Relief Campaigns
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-gold-300 transition-colors">
                  Health Camps &amp; Events
                </Link>
              </li>
              <li>
                <Link href="/impact" className="hover:text-gold-300 transition-colors">
                  Impact Telemetry
                </Link>
              </li>
              <li>
                <Link href="/stories" className="hover:text-gold-300 transition-colors">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Institutional & Media */}
          <div className="space-y-3">
            <h5 className="text-sm font-semibold uppercase tracking-wider text-white font-serif border-b border-emerald-800/80 pb-2">
              Governance &amp; Media
            </h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-gold-300 transition-colors">
                  About IMAM MISSION
                </Link>
              </li>
              <li>
                <Link href="/vision-mission" className="hover:text-gold-300 transition-colors">
                  Vision &amp; Values
                </Link>
              </li>
              <li>
                <Link href="/leadership" className="hover:text-gold-300 transition-colors">
                  Board &amp; Leadership
                </Link>
              </li>
              <li>
                <Link href="/governance" className="hover:text-gold-300 transition-colors">
                  Governance &amp; Bylaws
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-gold-300 transition-colors">
                  Press &amp; Dispatches
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-gold-300 transition-colors">
                  Articles &amp; Blog
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-gold-300 transition-colors">
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link href="/videos" className="hover:text-gold-300 transition-colors">
                  Documentary Videos
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-gold-300 transition-colors">
                  Audited Statements
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-gold-300 transition-colors">
                  Careers &amp; Fellowships
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact & Emergency */}
          <div className="space-y-3">
            <h5 className="text-sm font-semibold uppercase tracking-wider text-white font-serif border-b border-emerald-800/80 pb-2">
              Secretariat &amp; Helpdesk
            </h5>
            <div className="space-y-2.5 text-xs text-emerald-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>Central Relief Complex, 14/2 Victoria Street, Lucknow, UP 226003, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <span>+91-522-2610110 / +91-9450000000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <span>contact@imammission.org</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <span>secretariat@imammission.org</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/volunteer"
                className="block w-full text-center py-2 px-3 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-gold-300 text-xs font-semibold border border-emerald-700/50 transition-colors"
              >
                Apply as Community Volunteer
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory & Legal Disclaimer Bar */}
      <div className="bg-emerald-950 border-t border-emerald-900 py-4 px-4 sm:px-6 lg:px-8 text-[11px] text-emerald-400/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <p>
            &copy; {new Date().getFullYear()} IMAM MISSION. Operated by IMAM E MAHDI FOUNDATION (Section 8 Not-for-Profit Company | CIN: U88900DC2026NPL474906). All Rights Reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/privacy" className="hover:text-gold-300 transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:text-gold-300 transition-colors">
              Terms of Giving
            </Link>
            <span>&bull;</span>
            <Link href="/accessibility" className="hover:text-gold-300 transition-colors">
              Accessibility
            </Link>
            <span>&bull;</span>
            <Link href="/faq" className="hover:text-gold-300 transition-colors">
              FAQ
            </Link>
            <span>&bull;</span>
            <Link href="/transparency" className="hover:text-gold-300 transition-colors">
              Financial Transparency
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
