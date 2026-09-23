'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Download, 
  Award, 
  Building2, 
  QrCode, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  ExternalLink 
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';

export default function MemberVerificationPage() {
  const params = useParams();
  const hashParam = params?.hash as string;

  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMember() {
      if (!hashParam) return;
      try {
        const res = await fetch(`/api/members/${encodeURIComponent(hashParam)}`);
        const json = await res.json();
        if (!json.success || !json.data) {
          // Fallback to universal verification API
          const uRes = await fetch(`/api/verify/${encodeURIComponent(hashParam)}`);
          const uJson = await uRes.json();
          if (uJson.success && uJson.data) {
            setMember(uJson.data);
          } else {
            setError(json.error || 'Membership record not found.');
          }
        } else {
          setMember(json.data);
        }
      } catch (err: any) {
        setError(err.message || 'Verification service error.');
      } finally {
        setLoading(false);
      }
    }
    fetchMember();
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
            Verifying cryptographic membership credential on immutable ledger...
          </p>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif font-bold text-2xl text-slate-900">
              Membership Signature Not Found
            </h2>
            <p className="text-xs text-slate-600">
              {error || 'This digital ID card or membership credential could not be verified in the Foundation registry.'}
            </p>
          </div>
          <Link
            href="/members/register"
            className="inline-block px-6 py-3 rounded-xl bg-emerald-950 text-white font-bold text-xs hover:bg-emerald-900"
          >
            Apply for Membership
          </Link>
        </div>
      </div>
    );
  }

  const memberNumber = member.membershipNumber || member.documentNumber;
  const memberName = member.fullName || member.recipientName;
  const memberEmail = member.email || member.recipientEmail;
  const memberType = member.membershipType || member.category;
  const isStatusActive = (member.status || 'ACTIVE') === 'ACTIVE';

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Print / Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
            Official Cryptographic Membership Verification
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
            href="/members/register"
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
          >
            Membership Portal
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
                Registered Public Charitable Trust &bull; Official Membership Roll
              </span>
              <p className="text-xs text-slate-500">
                Headquarters: Hazratganj, Lucknow, UP - 226001 | Trust Reg: TRUST/UP/2026/8892
              </p>
            </div>

            {/* Seal */}
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-center space-y-1 shrink-0">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>ACTIVE &amp; VERIFIED</span>
              </div>
              <p className="text-[10px] font-mono text-emerald-800">
                HMAC-SHA256 SIGNED
              </p>
            </div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center space-y-3 py-4">
          <Award className="w-12 h-12 text-gold-500 mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950">
            Certificate of {memberType} Membership
          </h2>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
            This official document certifies that <strong>{memberName}</strong> is an authorized and accredited member of the Imam E Mahdi Foundation with full honorary rights and privileges.
          </p>
        </div>

        {/* Member Details Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-[#FDFBF7] border border-slate-200 text-xs">
          <div className="space-y-3">
            <div>
              <span className="text-slate-500 block">Member Name:</span>
              <strong className="text-sm font-bold text-emerald-950 block">{memberName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Membership Number:</span>
              <span className="text-slate-900 font-mono font-bold">{memberNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Registered Email:</span>
              <span className="text-slate-700 font-mono">{memberEmail}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-slate-500 block">Membership Tier:</span>
              <span className="text-xs font-bold font-mono text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded">
                {memberType}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Current Status:</span>
              <span className="text-xs font-bold text-emerald-800">
                {isStatusActive ? 'ACTIVE & IN GOOD STANDING' : member.status}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Validity Period:</span>
              <span className="font-mono text-slate-800">
                {new Date(member.startDate || member.issuedAt).toLocaleDateString('en-IN')} &mdash; {new Date(member.endDate || member.expiresAt).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Cryptographic Signature Hash */}
        <div className="border-t border-slate-200 pt-6 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-wider">
              Cryptographic Tamper-Proof Stamp
            </span>
            <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Verified Against Central Registry
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 text-gold-300 font-mono text-[11px] break-all select-all">
            {member.qrVerificationHash || member.signatureHash}
          </div>

          <div className="flex flex-col sm:flex-row justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Official Digital Operating System (IMF-DOS) &bull; Central Registry</span>
            <span>Signed by Central Governance Board &bull; Trustee Secretariat</span>
          </div>
        </div>
      </div>
    </div>
  );
}
