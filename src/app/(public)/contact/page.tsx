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

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Free Eligibility Assessment & File Opening Inquiry
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Check your instant eligibility for Work Permits, Student Visas, Hajj & Umrah, or Holiday Packages and receive a live File Tracking ID.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {result ? (
            <Card className="p-8 border-emerald-300 bg-emerald-50/40 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-200 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-700">
                    ✓ Inquiry & Pre-Assessment Recorded
                  </span>
                  <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                    Tracking ID: {result.trackingCode}
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white">
                  Match Score: {result.eligibility.score}% ({String(result.eligibility.status || '').replace(/_/g, ' ')})
                </span>
              </div>

              <div className="rounded-lg bg-white p-4 border border-emerald-200 space-y-2">
                <p className="text-sm font-bold text-slate-900">
                  {result.eligibility.summary}
                </p>
                <ul className="space-y-1 text-xs text-slate-600">
                  {(result.eligibility?.reasons || []).map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-slate-600">
                Save your Tracking ID <strong>{result.trackingCode}</strong>. Our specialist counselor will review your profile and update your document & visa milestones.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href={`/track-status?code=${result.trackingCode}`}>
                  <Button variant="secondary">
                    Track My File Status ({result.trackingCode}) →
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
        <div className="space-y-6">
          <Card className="p-6 bg-slate-900 text-white">
            <h3 className="text-sm font-bold uppercase text-sky-400">
              Already Applied?
            </h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Track your Passport, GAMCA Medical, Offer Letter, BMET Manpower, or Umrah Visa status online using your Tracking Code.
            </p>
            <Link href="/track-status" className="mt-4 block">
              <Button variant="secondary" size="sm" className="w-full">
                🔍 Track Application Status
              </Button>
            </Link>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-bold uppercase text-sky-600">
              Direct Counseling Hotline
            </h3>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {brandConfig.contact.phone}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {brandConfig.contact.officeHours}
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-bold uppercase text-sky-600">
              Head Office
            </h3>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {brandConfig.contact.address}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Email: {brandConfig.contact.email}
            </p>
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
          Loading inquiry form...
        </div>
      }
    >
      <ContactFormContent />
    </Suspense>
  );
}
