'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AgencyServiceStatus, VisaCategory } from '@/types/api';
import { submitPublicVisaInquiryAction } from '@/services/visa/visa.service';

interface VisaInquiryFormProps {
  countryId: string;
  countryName: string;
  visaServiceId: string;
  serviceTitle: string;
  category: VisaCategory;
  serviceStatus: AgencyServiceStatus;
}

export default function VisaInquiryForm({
  countryId,
  countryName,
  visaServiceId,
  serviceTitle,
  category,
  serviceStatus,
}: VisaInquiryFormProps) {
  const isAccepting =
    serviceStatus === 'ACCEPTING_INQUIRIES' || serviceStatus === 'LIMITED';

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    message: '',
    consentGiven: false,
  });

  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{
    trackingCode: string | null;
    message: string;
  } | null>(null);

  if (!isAccepting) {
    return (
      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
        <h3 className="text-base font-bold text-orange-900">
          Inquiries Currently Paused for This Service
        </h3>
        <p className="mt-2 text-sm text-orange-800">
          Our agency is currently not accepting new consultation requests for{' '}
          <strong>{serviceTitle}</strong> ({countryName}). Please check back later or browse our
          other active destination services.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consentGiven) {
      setError('Please confirm that you consent to our team contacting you regarding this inquiry.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await submitPublicVisaInquiryAction({
      countryId,
      visaServiceId,
      category,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || undefined,
      message: formData.message || undefined,
      consentGiven: formData.consentGiven,
    });

    setLoading(false);

    if (!res.success || !res.data) {
      setError(res.message || 'Could not submit inquiry. Please try again.');
      return;
    }

    setSubmittedResult({
      trackingCode: res.data.trackingCode || null,
      message: res.message || 'Thank you for your visa inquiry.',
    });
  };

  if (submittedResult) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 space-y-4">
        <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
          ✓ Consultation Request Registered
        </div>
        <h3 className="text-lg font-bold text-emerald-950">
          Thank you! Your Visa File Has Been Created
        </h3>
        <p className="text-sm text-emerald-800">{submittedResult.message}</p>
        {submittedResult.trackingCode && (
          <div className="rounded-xl border border-emerald-300 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Your File Tracking Code
                </p>
                <p className="mt-0.5 font-mono text-xl font-extrabold text-slate-900">
                  #{submittedResult.trackingCode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && submittedResult.trackingCode) {
                    void navigator.clipboard.writeText(submittedResult.trackingCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2500);
                  }
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                {copiedCode ? '✓ Copied!' : '📋 Copy ID'}
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Use this Tracking Code anytime to check document verification and visa processing milestones.
            </p>
            <Link
              href={`/track-status?code=${submittedResult.trackingCode}`}
              className="block w-full rounded-xl bg-sky-600 px-4 py-2.5 text-center text-xs font-bold text-white hover:bg-sky-700 transition"
            >
              🔍 Track My File Status Now →
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h3 className="text-lg font-bold text-slate-900">Request a Visa Consultation</h3>
        <p className="mt-1 text-xs text-slate-600">
          Inquiring about <strong>{serviceTitle}</strong> for <strong>{countryName}</strong>. An
          authorized visa consultant will review your inquiry and contact you.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          minLength={2}
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="Your full name as on passport"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Phone / WhatsApp <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            required
            minLength={7}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+8801XXXXXXXXX"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700">
          Inquiry Note / Background Summary
        </label>
        <textarea
          rows={3}
          maxLength={2000}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Briefly mention your intended travel timeline, qualification/work background, or questions (do not enter passport or NID numbers here)..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
        />
      </div>

      <label className="flex items-start gap-2.5 text-xs text-slate-600">
        <input
          type="checkbox"
          required
          checked={formData.consentGiven}
          onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600"
        />
        <span>
          I understand that this agency provides visa consultancy and documentation assistance only,
          that final visa decisions rest solely with the relevant embassy/government authority, and
          I consent to being contacted regarding my inquiry.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Submitting Inquiry...' : 'Submit Consultation Request'}
      </button>
    </form>
  );
}
