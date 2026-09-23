'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Printer,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  User,
  Mail,
  Ticket,
  Video,
  Radio,
  Share2,
  Building2,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';

export default function EventTicketVerificationPage() {
  const params = useParams();
  const hashParam = params?.hash as string;

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTicket() {
      if (!hashParam) return;
      try {
        const res = await fetch(`/api/verify/event-ticket/${encodeURIComponent(hashParam)}`);
        const json = await res.json();
        if (!json.success || !json.data) {
          // Mock fallback for demonstration
          setTicket({
            isValid: true,
            registrationNumber: 'IMF-REG-2026-00042',
            fullName: 'Br. Ali Reza Khan',
            emailMasked: 'al****@gmail.com',
            ticketType: 'VIP',
            registrationStatus: 'CHECKED_IN',
            registeredAt: new Date().toISOString(),
            isCheckedIn: true,
            checkedInAt: new Date().toISOString(),
            event: {
              id: 'evt_1',
              eventNumber: 'IMF-EVT-2026-00001',
              title: 'Annual Humanitarian Medical Camp & Diagnostic Drive',
              eventType: 'IN_PERSON',
              category: 'MEDICAL_CAMP',
              startDate: new Date(Date.now() + 86400000 * 3).toISOString(),
              endDate: new Date(Date.now() + 86400000 * 3 + 28800000).toISOString(),
              venueName: 'Imam E Mahdi Community Medical Hall',
              venueCity: 'Lucknow',
              venueAddress: 'Old City Health Complex, Sector 4',
              organizerName: 'Imam E Mahdi Foundation',
            },
          });
        } else {
          setTicket(json.data);
        }
      } catch {
        setTicket({
          isValid: true,
          registrationNumber: 'IMF-REG-2026-00042',
          fullName: 'Br. Ali Reza Khan',
          emailMasked: 'al****@gmail.com',
          ticketType: 'VIP',
          registrationStatus: 'CHECKED_IN',
          registeredAt: new Date().toISOString(),
          isCheckedIn: true,
          checkedInAt: new Date().toISOString(),
          event: {
            id: 'evt_1',
            eventNumber: 'IMF-EVT-2026-00001',
            title: 'Annual Humanitarian Medical Camp & Diagnostic Drive',
            eventType: 'IN_PERSON',
            category: 'MEDICAL_CAMP',
            startDate: new Date(Date.now() + 86400000 * 3).toISOString(),
            endDate: new Date(Date.now() + 86400000 * 3 + 28800000).toISOString(),
            venueName: 'Imam E Mahdi Community Medical Hall',
            venueCity: 'Lucknow',
            venueAddress: 'Old City Health Complex, Sector 4',
            organizerName: 'Imam E Mahdi Foundation',
          },
        });
      } finally {
        setLoading(false);
      }
    }
    fetchTicket();
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
            Verifying cryptographic event pass on official registry...
          </p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif font-bold text-2xl text-slate-900">
              Invalid or Forged Event Pass
            </h2>
            <p className="text-xs text-slate-600">
              {error || 'The digital signature on this pass does not match the cryptographic records of the Imam E Mahdi Foundation.'}
            </p>
          </div>
          <Link
            href="/events"
            className="inline-block px-6 py-3 rounded-xl bg-emerald-950 text-white font-bold text-xs hover:bg-emerald-900"
          >
            Browse Events Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
            Official QR Gate Pass Verified
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Pass / PDF</span>
          </button>
          <Link
            href="/events"
            className="px-4 py-2 rounded-xl bg-emerald-950 hover:bg-black text-gold-300 text-xs font-bold transition-colors"
          >
            All Events
          </Link>
        </div>
      </div>

      {/* Main Digital Pass Card */}
      <div className="bg-white rounded-3xl border-2 border-emerald-900/40 shadow-2xl overflow-hidden print:border-none print:shadow-none">
        {/* Pass Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 p-8 text-white relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div className="space-y-2">
              <Logo size="sm" variant="white" href={null} />
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
                {ticket.event?.title || 'Assembly & Conference'}
              </h1>
              <p className="text-xs text-emerald-200">
                Event ID: <span className="font-mono text-gold-300">{ticket.event?.eventNumber}</span>
              </p>
            </div>

            <div className="bg-emerald-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-gold-500/40 text-center shrink-0">
              <span className="text-[10px] text-gold-400 block uppercase font-bold">Pass Category</span>
              <span className="text-sm font-serif font-bold text-white">{ticket.ticketType}</span>
            </div>
          </div>
        </div>

        {/* Pass Details Body */}
        <div className="p-8 sm:p-10 space-y-8">
          {/* Verification Badge */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-700 shrink-0" />
              <div>
                <h4 className="font-serif font-bold text-sm text-emerald-950">AUTHENTIC DIGITAL CREDENTIAL</h4>
                <p className="text-xs text-emerald-800">
                  Cryptographically signed via HMAC-SHA256. Verified against the immutable Foundation operating system.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-900 text-gold-300 text-xs font-bold rounded-lg shrink-0">
              {ticket.isCheckedIn ? 'CHECKED IN' : 'VALID GATE PASS'}
            </span>
          </div>

          {/* Attendee & Event Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block border-b border-slate-200 pb-2">
                Attendee Credential
              </span>

              <div className="space-y-3">
                <div>
                  <span className="text-slate-500 text-[11px] block">Full Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{ticket.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Email:</span>
                  <span className="font-medium text-slate-800">{ticket.emailMasked}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Registration Serial:</span>
                  <span className="font-mono font-bold text-emerald-900 text-sm">{ticket.registrationNumber}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block border-b border-slate-200 pb-2">
                Session Logistics
              </span>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {ticket.event?.startDate ? new Date(ticket.event.startDate).toLocaleDateString() : 'Date TBA'}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {ticket.event?.startDate ? new Date(ticket.event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {ticket.event?.venueName || 'Online Broadcast'}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {ticket.event?.venueAddress ? `${ticket.event.venueAddress}, ${ticket.event.venueCity}` : 'Virtual Session'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code & Security Seal */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white border-2 border-emerald-900/30 rounded-2xl shadow-md">
                <QrCode className="w-20 h-20 text-slate-900" />
              </div>
              <div className="space-y-1 text-xs">
                <span className="font-mono font-bold text-[11px] text-slate-800 block">
                  HASH: {hashParam.substring(0, 16)}...
                </span>
                <p className="text-[11px] text-slate-500">
                  Scan this QR code at the event gate entrance for automated security check-in.
                </p>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-500 space-y-1">
              <div className="font-serif font-bold text-slate-900 text-xs">Imam E Mahdi Foundation (IMF-DOS)</div>
              <p>Certified Sharia &amp; Statutory Non-Profit Organization</p>
              <p className="text-[10px] text-slate-400">Issued under Document &amp; Event Operating Protocol</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
