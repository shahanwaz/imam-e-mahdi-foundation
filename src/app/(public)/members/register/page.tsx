'use client';

import React, { useState } from 'react';
import { 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Sparkles, 
  RefreshCw, 
  ExternalLink,
  Download,
  Calendar,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function MemberRegisterPage() {
  const [membershipType, setMembershipType] = useState<string>('ANNUAL');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [country, setCountry] = useState<string>('India');
  const [gender, setGender] = useState<string>('MALE');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredMember, setRegisteredMember] = useState<any>(null);

  const membershipTiers = [
    {
      id: 'ANNUAL',
      title: 'Annual Supporter',
      validity: '1 Year Renewable',
      fee: '₹ 2,500 / yr',
      description: 'Official voting rights at general assemblies, regular progress dispatches, and member newsletters.',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
    {
      id: 'LIFETIME',
      title: 'Lifetime Patron',
      validity: 'Permanent / Lifetime',
      fee: '₹ 25,000 one-time',
      description: 'Permanent membership roll inscription, priority delegation at regional summits, and gold digital credentials.',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      isPopular: true,
    },
    {
      id: 'STUDENT',
      title: 'Youth & Student Member',
      validity: '1 Year Renewable',
      fee: '₹ 500 / yr',
      description: 'Subsidized academic tier for active scholars, youth leadership workshops, and volunteer internships.',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/members/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          city,
          state,
          country,
          gender,
          membershipType,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Registration failed.');
      }

      setRegisteredMember(json.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 space-y-12 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl border border-emerald-800">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/30 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
            <span>Official Foundation Membership &bull; Digital Identity Protocol</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
            Join the Imam E Mahdi Foundation Membership Roll
          </h1>
          <p className="text-sm sm:text-base text-emerald-200/90 leading-relaxed font-sans">
            Become an official patron and stake-holder in our global humanitarian operating network. Receive a cryptographic tamper-proof Digital ID card and official Certificate of Membership.
          </p>
        </div>
      </div>

      {registeredMember ? (
        /* Success & Digital ID Card Showcase */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-12 text-center space-y-8 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              Membership Enrolled &amp; Certified
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              Welcome, {registeredMember.fullName}
            </h2>
            <p className="text-xs font-mono text-slate-500">
              Official Membership ID: <strong className="text-emerald-950">{registeredMember.membershipNumber}</strong>
            </p>
          </div>

          {/* Digital ID Card Preview */}
          <div className="max-w-md mx-auto bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white rounded-2xl p-6 shadow-2xl border-2 border-gold-400/40 text-left relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
              <div>
                <span className="text-[10px] text-gold-400 font-bold uppercase tracking-widest block">
                  Official Digital ID Card
                </span>
                <span className="text-xs font-serif font-bold text-white">
                  IMAM E MAHDI FOUNDATION
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-gold-500/20 text-gold-300 border border-gold-400/30 px-2 py-0.5 rounded">
                {registeredMember.membershipType}
              </span>
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="w-14 h-14 rounded-xl bg-gold-400/20 border border-gold-400/40 flex items-center justify-center font-serif font-bold text-xl text-gold-300">
                {registeredMember.fullName.charAt(0)}
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-sm text-white">{registeredMember.fullName}</div>
                <div className="text-xs font-mono text-emerald-300">{registeredMember.membershipNumber}</div>
                <div className="text-[11px] text-slate-300">{registeredMember.city}, {registeredMember.country}</div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-emerald-800/80 pt-3 text-[10px] text-emerald-300 font-mono">
              <div>
                <span>VALID FROM: </span>
                <strong className="text-white">{new Date(registeredMember.startDate).toLocaleDateString('en-IN')}</strong>
              </div>
              <div>
                <span>VALID THRU: </span>
                <strong className="text-white">{new Date(registeredMember.endDate).toLocaleDateString('en-IN')}</strong>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href={`/verify/member/${registeredMember.qrVerificationHash}`}
              target="_blank"
              className="px-6 py-3 rounded-xl bg-emerald-950 text-white font-bold text-xs flex items-center gap-2 hover:bg-emerald-900 shadow-md"
            >
              <QrCode className="w-4 h-4 text-gold-400" />
              <span>Verify &amp; Print Official Certificate</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => {
                setRegisteredMember(null);
                setFullName('');
                setEmail('');
                setPhone('');
              }}
              className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
            >
              Register Another Member
            </button>
          </div>
        </div>
      ) : (
        /* Registration Form */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-10 space-y-8">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <strong className="font-semibold block">Registration Notice</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Tier Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                1. Select Membership Classification Tier *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {membershipTiers.map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => setMembershipType(tier.id)}
                    className={`p-5 rounded-2xl border cursor-pointer text-left transition-all relative space-y-2.5 ${
                      membershipType === tier.id
                        ? 'bg-emerald-950 text-white border-emerald-950 shadow-md ring-2 ring-gold-400'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${tier.badgeColor}`}>
                        {tier.validity}
                      </span>
                      {membershipType === tier.id && <CheckCircle2 className="w-4 h-4 text-gold-400" />}
                    </div>

                    <div>
                      <h4 className={`text-sm font-bold ${membershipType === tier.id ? 'text-white' : 'text-slate-900'}`}>
                        {tier.title}
                      </h4>
                      <div className={`text-xs font-mono font-bold pt-0.5 ${membershipType === tier.id ? 'text-gold-300' : 'text-emerald-900'}`}>
                        {tier.fee}
                      </div>
                    </div>

                    <p className={`text-[11px] leading-relaxed ${membershipType === tier.id ? 'text-emerald-200' : 'text-slate-500'}`}>
                      {tier.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Member Personal Details */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                2. Member Details &amp; Permanent Credentials *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-slate-600 font-medium">Full Legal Name *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Zainul Abideen"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-600 font-medium">Email Address (For Digital ID Delivery) *</span>
                  <input
                    type="email"
                    required
                    placeholder="e.g. zainul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-slate-600 font-medium">Contact Phone *</span>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-600 font-medium">City / District *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lucknow"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-600 font-medium">State / Province</span>
                  <input
                    type="text"
                    placeholder="e.g. Uttar Pradesh"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-300 hover:to-amber-400 text-emerald-950 font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Award className="w-4 h-4" />
              )}
              <span>Complete Membership Enrollment &amp; Generate Digital ID Card</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
