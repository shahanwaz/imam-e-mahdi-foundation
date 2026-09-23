'use client';

import React, { useState } from 'react';
import { Mail, Phone, User, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function PublicInquiryForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'GENERAL',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/public/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        type: 'GENERAL',
        subject: '',
        message: '',
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-10">
      <div className="space-y-2 mb-8">
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
          Send Us a Message
        </h3>
        <p className="text-sm text-slate-600">
          Whether you need beneficiary assistance, want to partner via CSR, or have questions regarding Zakat compliance, our team will respond within 24 hours.
        </p>
      </div>

      {success ? (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h4 className="font-serif font-bold text-lg text-emerald-950">
            Inquiry Received Successfully
          </h4>
          <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
            Jazakallah. Your communication has been dispatched to the Foundation Secretariat. A reference number and response will be provided to your email.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-2 px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors"
          >
            Submit Another Query
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Syed Raza"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-sm font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. raza@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-sm font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Phone / WhatsApp Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-sm font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Inquiry Category *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-sm font-medium text-slate-900"
              >
                <option value="GENERAL">General Inquiries</option>
                <option value="BENEFICIARY_HELP">Beneficiary Aid Application</option>
                <option value="CSR_PARTNERSHIP">CSR &amp; Institutional Partnership</option>
                <option value="TAX_80G">Donation Receipts &amp; Tax Queries</option>
                <option value="PRESS_MEDIA">Media &amp; Communications</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Subject
            </label>
            <input
              type="text"
              placeholder="e.g. Scholarship Application Assistance / CSR Proposal"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-sm font-medium text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Your Message *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide specific details about your query or beneficiary case..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-sm font-medium text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-gold-300 hover:text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
