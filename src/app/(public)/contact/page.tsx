'use client';

import { Suspense, useState, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Check,
  CheckCircle2,
  Copy,
  Mail,
  MessageSquare,
  Phone,
  Search,
} from 'lucide-react';
import { brandConfig, SECTOR_CATALOG } from '@/config/brand.config';
import { useBrand } from '@/components/providers/BrandProvider';
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

  const brand = useBrand();
  const enabledSectors = brandConfig.enabledCategories.map(
    (k) => SECTOR_CATALOG[k],
  );
  const cleanWhatsapp = brand.whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <span className="inline-block rounded-full border border-teal-200 bg-teal-50 px-3 py-0.5 text-xs font-bold text-teal-800">
          Free • Instant Tracking ID
        </span>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Eligibility Check & Inquiry
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {result ? (
            <Card className="p-6 sm:p-8 border-teal-300 bg-teal-50/40 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-teal-200 pb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-teal-800">
                    <CheckCircle2 className="h-4 w-4 text-teal-700" />
                    Inquiry Recorded
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
                      className="inline-flex items-center gap-1.5 rounded-lg border border-teal-300 bg-white px-2.5 py-1 text-xs font-semibold text-teal-900 hover:bg-teal-50"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-teal-700" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy Code
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <span className="rounded-full bg-teal-700 px-4 py-1.5 text-xs font-bold text-white">
                  Match Score: {result.eligibility?.score ?? 70}% (
                  {String(result.eligibility?.status || 'CONDITIONAL_MATCH').replace(/_/g, ' ')})
                </span>
              </div>

              <div className="rounded-xl bg-white p-4 border border-teal-200 space-y-2">
                <p className="text-sm font-bold text-slate-900">
                  {result.eligibility?.summary}
                </p>
                <ul className="space-y-1 text-xs text-stone-600">
                  {(result.eligibility?.reasons || []).map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link href={`/track-status?code=${result.trackingCode}`}>
                  <Button variant="secondary" className="gap-1.5">
                    <Search className="h-3.5 w-3.5" />
                    Track My File ({result.trackingCode}) →
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => setResult(null)}
                >
                  New Inquiry
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Choose Sector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    1. Select Service Category
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {enabledSectors.map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setCategory(s.key)}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          category === s.key
                            ? 'border-teal-700 bg-teal-50/70 text-teal-950 ring-2 ring-teal-700/15'
                            : 'border-stone-200 bg-white text-slate-700 hover:bg-[#FAF9F6]'
                        }`}
                      >
                        <p className="text-xs font-bold">{s.shortLabel}</p>
                        <p className="mt-0.5 text-[11px] text-stone-500 line-clamp-1">
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
                      Estimated Budget ({brand.defaultCurrency})
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
                  <div className="rounded-xl border border-stone-200 bg-[#FAF9F6] p-4 space-y-4">
                    <p className="text-xs font-bold uppercase text-slate-800">
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
                  <div className="rounded-xl border border-stone-200 bg-[#FAF9F6] p-4 space-y-4">
                    <p className="text-xs font-bold uppercase text-slate-800">
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
                  <div className="rounded-xl border border-stone-200 bg-[#FAF9F6] p-4 space-y-3">
                    <p className="text-xs font-bold uppercase text-slate-800">
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
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/15"
                  />
                </div>

                {error && (
                  <p className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700">
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
          <Card className="p-6 bg-slate-900 text-white border-slate-800">
            <h3 className="text-sm font-bold uppercase text-teal-300">
              Already Applied With Us?
            </h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Check your Passport, GAMCA Medical, Offer Letter, BMET Manpower, or Umrah Visa progress 24/7 using your Tracking Code.
            </p>
            <Link href="/track-status" className="mt-4 block">
              <Button variant="secondary" size="sm" className="w-full gap-1.5">
                <Search className="h-3.5 w-3.5" />
                Track Application Status
              </Button>
            </Link>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase text-teal-700">
              Talk to a Counselor Directly
            </h3>
            <a
              href={`tel:${brand.phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 text-lg font-bold text-slate-900 hover:text-teal-700 transition"
            >
              <Phone className="h-4 w-4 text-teal-700" />
              {brand.phone}
            </a>
            <a
              href={`https://wa.me/${cleanWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800 transition"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Message on WhatsApp ↗
            </a>
            <p className="text-xs text-stone-500">
              Office Hours: {brand.officeHours}
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-bold uppercase text-teal-700">
              Visit Our Head Office
            </h3>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {brand.address}
            </p>
            <a
              href={`mailto:${brand.email}`}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:underline"
            >
              <Mail className="h-3.5 w-3.5" />
              {brand.email}
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
