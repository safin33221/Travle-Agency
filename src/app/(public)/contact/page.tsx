'use client';

import { Suspense, useState, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { brandConfig, SECTOR_CATALOG } from '@/config/brand.config';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ServiceCategory } from '@/types/api';
import { submitPublicInquiry } from '@/services/leads/leads.service';

function ContactFormContent() {
  const searchParams = useSearchParams();
  const initialCat =
    (searchParams.get('category') as ServiceCategory) || 'WORK_PERMIT';
  const initialDest = searchParams.get('destination') || '';

  const [category, setCategory] = useState<ServiceCategory>(initialCat);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [destination, setDestination] = useState(initialDest);
  const [budget, setBudget] = useState('');
  const [requirements, setRequirements] = useState('');

  // Sector-specific assessment fields
  const [age, setAge] = useState('');
  const [passportValidityMonths, setPassportValidityMonths] = useState('18');
  const [jobRole, setJobRole] = useState('');
  const [gpa, setGpa] = useState('');
  const [ieltsScore, setIeltsScore] = useState('');
  const [studyGapYears, setStudyGapYears] = useState('0');

  const [isPending, startTransition] = useTransition();
  const [copiedCode, setCopiedCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    trackingCode: string;
    category: ServiceCategory;
    customerName: string;
    eligibility: {
      status: string;
      score: number;
      summary: string;
      reasons: string[];
    };
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Please enter your full name and phone/WhatsApp number.');
      return;
    }

    const metadata: Record<string, unknown> = {
      passportValidityMonths: Number(passportValidityMonths) || 12,
    };

    if (category === 'WORK_PERMIT') {
      if (age) metadata.age = Number(age);
      if (jobRole) metadata.jobRole = jobRole;
    } else if (category === 'STUDENT_VISA') {
      if (gpa) metadata.gpa = Number(gpa);
      if (ieltsScore) metadata.ieltsScore = Number(ieltsScore);
      if (studyGapYears) metadata.studyGapYears = Number(studyGapYears);
    }

    startTransition(async () => {
      const res = await submitPublicInquiry({
        category,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        destination: destination.trim() || undefined,
        budget: budget ? Number(budget) : undefined,
        requirements: requirements.trim() || undefined,
        metadata,
      });

      if (!res.success || !res.data) {
        setError(res.message || 'Could not submit inquiry. Please try again.');
        return;
      }

      setResult(res.data);
    });
  };

  const enabledSectors = brandConfig.enabledCategories.map(
    (k) => SECTOR_CATALOG[k],
  );
  const cleanWhatsapp = brandConfig.contact.whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Clear User-Friendly Header + 3-Step Visual Guide */}
      <div className="mb-8 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50/90 via-white to-emerald-50/50 p-6 sm:p-8">
        <span className="inline-block rounded-full bg-sky-100 px-3 py-0.5 text-xs font-bold text-sky-800">
          100% Free • Instant Tracking ID
        </span>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Free Eligibility Assessment & File Opening
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
          Fill out this quick 1-minute form to see your eligibility match score and automatically receive a live File Tracking ID—no registration required.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
          <div className="flex items-center gap-2.5 rounded-xl bg-white border border-slate-200/80 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white font-bold">
              1
            </span>
            <span className="font-semibold text-slate-800">
              Select your service & fill basic info
            </span>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-white border border-slate-200/80 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold">
              2
            </span>
            <span className="font-semibold text-slate-800">
              Get instant Eligibility Score + Tracking Code
            </span>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-white border border-slate-200/80 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold">
              3
            </span>
            <span className="font-semibold text-slate-800">
              Track checklist & visa steps 24/7 online
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {result ? (
            <Card className="p-6 sm:p-8 border-emerald-300 bg-emerald-50/40 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-200 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-700">
                    ✓ Inquiry & Pre-Assessment Recorded
                  </span>
                  <div className="mt-1 flex flex-wrap items-center gap-2.5">
                    <h2 className="text-2xl font-extrabold text-slate-900 font-mono">
                      #{result.trackingCode}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          void navigator.clipboard.writeText(result.trackingCode);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2500);
                        }
                      }}
                      className="rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                    >
                      {copiedCode ? '✓ Copied!' : '📋 Copy Code'}
                    </button>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white">
                  Match Score: {result.eligibility?.score ?? 70}% (
                  {String(result.eligibility?.status || 'CONDITIONAL_MATCH').replace(/_/g, ' ')})
                </span>
              </div>

              <div className="rounded-lg bg-white p-4 border border-emerald-200 space-y-2">
                <p className="text-sm font-bold text-slate-900">
                  {result.eligibility?.summary}
                </p>
                <ul className="space-y-1 text-xs text-slate-600">
                  {(result.eligibility?.reasons || []).map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-white border border-slate-200 p-4 text-xs text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-900">What Happens Next?</p>
                <p>
                  1. Save your Tracking ID <strong className="font-mono text-sky-700">#{result.trackingCode}</strong> (take a screenshot or click Copy Code).
                </p>
                <p>
                  2. Our specialist counselor will contact you on <strong>{customerPhone}</strong> and update your required document checklist.
                </p>
                <p>
                  3. Open <strong>Track My File Status</strong> below anytime to see live progress.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href={`/track-status?code=${result.trackingCode}`}>
                  <Button variant="secondary">
                    🔍 Track My File Status ({result.trackingCode}) →
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => setResult(null)}
                >
                  Submit Another Assessment
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Choose Sector */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                    1. Select Service Category
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {enabledSectors.map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setCategory(s.key)}
                        className={`rounded-lg border p-3 text-left transition-all ${
                          category === s.key
                            ? 'border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-500/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-xs font-bold">{s.shortLabel}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
                          {s.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Basic Contact Info */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <Input
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Md. Rakibul Islam"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone / WhatsApp Number *
                    </label>
                    <Input
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. +8801711223344"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Country / Destination
                    </label>
                    <Input
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder={
                        category === 'HAJJ_UMRAH'
                          ? 'Makkah & Madinah'
                          : category === 'WORK_PERMIT'
                            ? 'Romania / Saudi Arabia / Malaysia'
                            : category === 'STUDENT_VISA'
                              ? 'UK / Malaysia / Canada / Australia'
                              : 'Cox’s Bazar / Maldives / Thailand'
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Estimated Budget ({brandConfig.defaults.currency})
                    </label>
                    <Input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. 450000"
                    />
                  </div>
                </div>

                {/* Step 3: Dynamic Sector-Specific Eligibility Inputs */}
                {category === 'WORK_PERMIT' && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-4">
                    <p className="text-xs font-bold uppercase text-amber-800">
                      Work Permit Pre-Eligibility Check
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Applicant Age (Years)
                        </label>
                        <Input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="e.g. 27"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Passport Validity (Months)
                        </label>
                        <Input
                          type="number"
                          value={passportValidityMonths}
                          onChange={(e) =>
                            setPassportValidityMonths(e.target.value)
                          }
                          placeholder="Min 12 months"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Trade / Job Category
                        </label>
                        <Input
                          value={jobRole}
                          onChange={(e) => setJobRole(e.target.value)}
                          placeholder="Warehouse / Driving / Hospitality"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {category === 'STUDENT_VISA' && (
                  <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 space-y-4">
                    <p className="text-xs font-bold uppercase text-purple-800">
                      Academic & IELTS Eligibility Profile
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Last GPA / CGPA
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={gpa}
                          onChange={(e) => setGpa(e.target.value)}
                          placeholder="e.g. 3.45"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          IELTS / PTE Score (0 if MOI)
                        </label>
                        <Input
                          type="number"
                          step="0.5"
                          value={ieltsScore}
                          onChange={(e) => setIeltsScore(e.target.value)}
                          placeholder="e.g. 6.0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Study Gap (Years)
                        </label>
                        <Input
                          type="number"
                          value={studyGapYears}
                          onChange={(e) => setStudyGapYears(e.target.value)}
                          placeholder="e.g. 2"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {category === 'HAJJ_UMRAH' && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                    <p className="text-xs font-bold uppercase text-emerald-800">
                      Hajj & Umrah Pilgrim Readiness
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Passport Remaining Validity (Months)
                        </label>
                        <Input
                          type="number"
                          value={passportValidityMonths}
                          onChange={(e) =>
                            setPassportValidityMonths(e.target.value)
                          }
                          placeholder="Minimum 6 months required"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Email (Optional)
                        </label>
                        <Input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="pilgrim@example.com"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Additional Notes / Questions
                  </label>
                  <textarea
                    rows={3}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Mention preferred intake, work experience, room sharing preference, or number of family members..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isPending}
                  className="w-full sm:w-auto"
                >
                  {isPending
                    ? 'Evaluating Profile & Generating Tracking ID...'
                    : 'Submit & Get Instant Eligibility + Tracking ID →'}
                </Button>
              </form>
            </Card>
          )}
        </div>

        {/* Contact & Live Tracker Sidebar */}
        <div className="space-y-5">
          <Card className="p-6 bg-slate-900 text-white">
            <h3 className="text-sm font-bold uppercase text-sky-400">
              Already Applied With Us?
            </h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Check your Passport, GAMCA Medical, Offer Letter, BMET Manpower, or Umrah Visa progress 24/7 using your Tracking Code.
            </p>
            <Link href="/track-status" className="mt-4 block">
              <Button variant="secondary" size="sm" className="w-full">
                🔍 Track Application Status
              </Button>
            </Link>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase text-sky-600">
              Talk to a Counselor Directly
            </h3>
            <a
              href={`tel:${brandConfig.contact.phone.replace(/\s+/g, '')}`}
              className="block text-lg font-bold text-slate-900 hover:text-sky-600"
            >
              📞 {brandConfig.contact.phone}
            </a>
            <a
              href={`https://wa.me/${cleanWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              💬 Message on WhatsApp ↗
            </a>
            <p className="text-xs text-slate-500">
              Office Hours: {brandConfig.contact.officeHours}
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-bold uppercase text-sky-600">
              Visit Our Head Office
            </h3>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {brandConfig.contact.address}
            </p>
            <a
              href={`mailto:${brandConfig.contact.email}`}
              className="mt-2 inline-block text-xs font-medium text-sky-700 hover:underline"
            >
              ✉️ {brandConfig.contact.email}
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PublicContactAndAssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-12 text-center text-sm text-slate-500">
          Loading contact and assessment form...
        </div>
      }
    >
      <ContactFormContent />
    </Suspense>
  );
}
