'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Award, 
  QrCode, 
  Calendar, 
  User, 
  Mail, 
  FileCheck2,
  ExternalLink,
  Eye,
  FileText
} from 'lucide-react';
import Link from 'next/link';

export default function UniversalDocumentVerificationPage() {
  const params = useParams();
  const hashParam = params?.hash as string;

  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'VERIFICATION' | 'FULL_DOCUMENT'>('VERIFICATION');

  useEffect(() => {
    async function fetchDocument() {
      if (!hashParam) return;
      try {
        const res = await fetch(`/api/verify/${encodeURIComponent(hashParam)}`);
        const json = await res.json();
        if (!json.success || !json.data) {
          setError(json.error || 'Document signature could not be verified.');
        } else {
          setDoc(json.data);
          if (json.data.htmlContent) {
            setViewMode('FULL_DOCUMENT');
          }
        }
      } catch (err: any) {
        setError(err.message || 'Verification service error.');
      } finally {
        setLoading(false);
      }
    }
    fetchDocument();
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
            Verifying cryptographic signature on immutable registry...
          </p>
        </div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif font-bold text-2xl text-slate-900">
              Signature Not Found or Invalid
            </h2>
            <p className="text-xs text-slate-600">
              {error || 'This certificate or document could not be authenticated against the official Foundation registry.'}
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl bg-emerald-950 text-white font-bold text-xs hover:bg-emerald-900"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-14 max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
            Universal Cryptographic QR Verification
          </span>
          <span className="text-[11px] bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-full">
            {doc.documentType?.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {doc.htmlContent && (
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setViewMode('FULL_DOCUMENT')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition ${viewMode === 'FULL_DOCUMENT' ? 'bg-white text-emerald-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Full Document</span>
              </button>
              <button
                onClick={() => setViewMode('VERIFICATION')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition ${viewMode === 'VERIFICATION' ? 'bg-white text-emerald-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Security Audit</span>
              </button>
            </div>
          )}

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-emerald-950 text-white font-bold text-xs flex items-center gap-2 hover:bg-emerald-900 shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Record</span>
          </button>
        </div>
      </div>

      {/* Render Full Document View if chosen */}
      {viewMode === 'FULL_DOCUMENT' && doc.htmlContent ? (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <iframe
            srcDoc={doc.htmlContent}
            title={doc.title}
            className="w-full min-h-[900px] border-none"
          />
        </div>
      ) : (
        /* Official Certificate / Document Verification Audit View */
        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-8 sm:p-12 space-y-8 relative overflow-hidden print:border-none print:shadow-none print:p-0">
          <div className="border-b-2 border-emerald-950/10 pb-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">
                  Official Trust Credential &bull; Centralized Document Engine
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950">
                  IMAM E MAHDI FOUNDATION
                </h1>
                <p className="text-xs text-slate-500">
                  Central Governance Registry • Immutable HMAC-SHA256 Cryptographic Stamp
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-center space-y-1 shrink-0">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>GENUINE &amp; AUTHENTIC</span>
                </div>
                <p className="text-[10px] font-mono text-emerald-800">
                  STATUS: {doc.status || 'VALID'}
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-3 py-4">
            <Award className="w-12 h-12 text-gold-500 mx-auto" />
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950">
              {doc.title || 'Official Verified Record'}
            </h2>
            {doc.description && (
              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                {doc.description}
              </p>
            )}
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-[#FDFBF7] border border-slate-200 text-xs">
            <div className="space-y-3">
              <div>
                <span className="text-slate-500 block">Recipient / Entity:</span>
                <strong className="text-sm font-bold text-emerald-950 block">{doc.recipientName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Document Serial Number:</span>
                <span className="text-slate-900 font-mono font-bold">{doc.documentNumber}</span>
              </div>
              {doc.recipientEmail && (
                <div>
                  <span className="text-slate-500 block">Recipient Email:</span>
                  <span className="text-slate-700 font-mono">{doc.recipientEmail}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-500 block">Classification:</span>
                <span className="text-xs font-bold font-mono text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded">
                  {doc.category || doc.documentType}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Issued Date:</span>
                <span className="font-mono text-slate-800">
                  {doc.issuedAt ? new Date(doc.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
              {doc.expiresAt && (
                <div>
                  <span className="text-slate-500 block">Expires At:</span>
                  <span className="font-mono text-slate-800">
                    {new Date(doc.expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Cryptographic Stamp */}
          <div className="border-t border-slate-200 pt-6 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-bold uppercase tracking-wider">
                Cryptographic Digital Signature
              </span>
              <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Tamper-Proof HMAC-SHA256
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 text-gold-300 font-mono text-[11px] break-all select-all">
              {doc.signatureHash}
            </div>

            <div className="flex flex-col sm:flex-row justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>Imam E Mahdi Foundation &bull; Digital Operating System (IMF-DOS)</span>
              <span>Centralized Document Engine &bull; Version {doc.templateVersion || '1.0.0'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
