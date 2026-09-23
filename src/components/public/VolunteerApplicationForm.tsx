'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, HeartHandshake, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function VolunteerApplicationForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    skills: [] as string[],
    availability: 'Weekends',
    motivation: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableSkills = [
    'Medical & Clinical Consultation',
    'Education & Mentorship',
    'Field Relief & Logistics',
    'Disaster Emergency Response',
    'IT, Web & Digital Media',
    'Graphic Design & Video Editing',
    'Accounting & CA Audit Support',
    'Counseling & Social Work',
  ];

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/public/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit application.');
      }

      setSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        skills: [],
        availability: 'Weekends',
        motivation: '',
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
          Volunteer Registration Portal
        </h3>
        <p className="text-sm text-slate-600">
          Join over 3,500 registered volunteers across health camps, ration distribution, and student mentoring initiatives.
        </p>
      </div>

      {success ? (
        <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h4 className="font-serif font-bold text-xl text-emerald-950">
            Welcome to the Volunteer Corps!
          </h4>
          <p className="text-sm text-emerald-800 max-w-md mx-auto">
            Jazakallah for stepping forward to serve humanity. Our state volunteer coordinator will review your profile and contact you regarding upcoming drives and local chapters.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-2 px-6 py-2.5 rounded-xl bg-emerald-900 text-gold-300 font-semibold text-xs hover:bg-emerald-800 transition-colors"
          >
            Submit Another Registration
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Full Legal Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Zayd Rizvi"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                  placeholder="e.g. zayd@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-sm font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-sm font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                City / Town
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Lucknow"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-sm font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                State
              </label>
              <input
                type="text"
                placeholder="e.g. Uttar Pradesh"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-sm font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Skill Tag Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
              Select Your Core Areas of Contribution (Select all that apply)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableSkills.map((skill) => {
                const selected = formData.skills.includes(skill);
                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => handleSkillToggle(skill)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                      selected
                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{skill}</span>
                    {selected && <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              General Availability
            </label>
            <select
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-sm font-medium text-slate-900"
            >
              <option value="Weekends">Weekends Only (Saturdays &amp; Sundays)</option>
              <option value="Emergency On-Call">Emergency Relief On-Call</option>
              <option value="Full-Time Fellowship">Full-time Fellowship / Dedicated 20+ hrs/week</option>
              <option value="Remote / Digital Tasks">Remote &amp; Digital Volunteer Tasks</option>
            </select>
          </div>

          {/* Motivation */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Why do you want to volunteer with Imam E Mahdi Foundation?
            </label>
            <textarea
              rows={3}
              placeholder="Tell us about your background or motivation to support vulnerable families..."
              value={formData.motivation}
              onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-sm font-medium text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-300 hover:to-amber-400 text-emerald-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <HeartHandshake className="w-5 h-5" />
                <span>Submit Volunteer Application</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
