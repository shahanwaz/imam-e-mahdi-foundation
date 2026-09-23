'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Award, 
  Building2, 
  QrCode, 
  Calendar, 
  User, 
  Mail, 
  MapPin, 
  Clock, 
  Star, 
  ExternalLink 
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';

export default function VolunteerVerificationPage() {
  const params = useParams();
  const hashParam = params?.hash as string;

  const [volunteer, setVolunteer] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVolunteer() {
      if (!hashParam) return;
      try {
        const res = await fetch(`/api/volunteers/${encodeURIComponent(hashParam)}`);
        const json = await res.json();
        if (!json.success || !json.data) {
          // Fallback to universal verification API
          const uRes = await fetch(`/api/verify/${encodeURIComponent(hashParam)}`);
          const uJson = await uRes.json();
          if (uJson.success && uJson.data) {
            setVolunteer(uJson.data);
          } else {
            setError(json.error || 'Volunteer record not found.');
          }
        } else {
          setVolunteer(json.data);
        }
      } catch (err: any) {
        setError(err.message || 'Verification service error.');
      } finally {
        setLoading(false);
      }
    }
    fetchVolunteer();
  }, [hashParam]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">
            Verifying volunteer credentials and field service hours...
          </p>
        </div>
      </div>
    );
  }

  if (error || !volunteer) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif font-bold text-2xl text-slate-900">
              Volunteer Credential Not Found
            </h2>
            <p className="text-xs text-slate-600">
              {error || 'This digital badge or volunteer certificate could not be verified in the Foundation registry.'}
            </p>
          </div>
          <Link
            href="/volunteer"
            className="inline-block px-6 py-3 rounded-xl bg-emerald-950 text-white font-bold text-xs hover:bg-emerald-900"
          >
            Apply to Volunteer
          </Link>
        </div>
      </div>
    );
  }

  const volNumber = volunteer.volunteerNumber || volunteer.documentNumber;
  const volName = volunteer.fullName || volunteer.recipientName;
  const volEmail = volunteer.email || volunteer.recipientEmail;
  const volHours = Number(volunteer.totalHoursLogged || 0);
  const volRating = Number(volunteer.performanceRating || 5.0);

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
            Official Volunteer Credential &amp; Service Verification
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-emerald-950 text-white font-bold text-xs flex items-center gap-2 hover:bg-emerald-900 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Certificate</span>
          </button>
          <Link
            href="/volunteer"
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
          >
            Volunteer Portal
          </Link>
        </div>
      </div>

      {/* Official Certificate Container */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-8 sm:p-12 space-y-8 relative overflow-hidden print:border-none print:shadow-none print:p-0">
        {/* Header & Genuine Seal */}
        <div className="border-b-2 border-emerald-950/10 pb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <Logo size="md" href={null} />
              <span className="text-xs font-bold text-gold-600 uppercase tracking-widest block">
                Disaster Response &bull; Humanitarian Field Corps
              </span>
              <p className="text-xs text-slate-500">
                Registered Public Charitable Trust | Official Volunteer Services Secretariat
              </p>
            </div>

            {/* Seal */}
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-center space-y-1 shrink-0">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>VERIFIED VOLUNTEER</span>
              </div>
              <p className="text-[10px] font-mono text-emerald-800">
                HMAC-SHA256 STAMP
              </p>
            </div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center space-y-3 py-4">
          <Award className="w-12 h-12 text-gold-500 mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950">
            Certificate of Humanitarian Service
          </h2>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
            This certifies that <strong>{volName}</strong> has rendered exemplary volunteer service on humanitarian and emergency disaster relief missions with the Imam E Mahdi Foundation.
          </p>
        </div>

        {/* Volunteer Service Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-950 text-white text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-gold-400">Total Hours Logged</span>
            <div className="text-2xl font-serif font-bold text-white flex items-center justify-center gap-1.5">
              <Clock className="w-5 h-5 text-gold-400" />
              <span>{volHours} hrs</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-slate-200 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Performance Rating</span>
            <div className="text-2xl font-serif font-bold text-slate-900 flex items-center justify-center gap-1 text-amber-500">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
              <span>{volRating.toFixed(1)} / 5.0</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Corps Status</span>
            <div className="text-base font-bold text-emerald-900 pt-1">
              {volunteer.status || 'ACTIVE'}
            </div>
          </div>
        </div>

        {/* Volunteer Details Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-[#FDFBF7] border border-slate-200 text-xs">
          <div className="space-y-3">
            <div>
              <span className="text-slate-500 block">Volunteer Name:</span>
              <strong className="text-sm font-bold text-emerald-950 block">{volName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Volunteer ID Number:</span>
              <span className="text-slate-900 font-mono font-bold">{volNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Registered Email:</span>
              <span className="text-slate-700 font-mono">{volEmail}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-slate-500 block">Primary Location / Chapter:</span>
              <strong className="text-slate-900 font-bold">{volunteer.city || 'Lucknow HQ'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Accredited Skills:</span>
              <div className="flex flex-wrap gap-1 pt-1">
                {(volunteer.skills || ['Relief Aid', 'Disaster Response']).map((s: string) => (
                  <span key={s} className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-[10px] font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cryptographic Signature Hash */}
        <div className="border-t border-slate-200 pt-6 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-wider">
              Cryptographic Audit Verification Hash
            </span>
            <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Verified Against Central Registry
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 text-gold-300 font-mono text-[11px] break-all select-all">
            {volunteer.qrVerificationHash || volunteer.signatureHash}
          </div>

          <div className="flex flex-col sm:flex-row justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Imam E Mahdi Foundation &bull; Volunteer Operations Secretariat</span>
            <span>Director of Volunteer Services &bull; Disaster Response Coordinator</span>
          </div>
        </div>
      </div>
    </div>
  );
}
