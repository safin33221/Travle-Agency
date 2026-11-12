'use client';

import { Suspense, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { brandConfig, SECTOR_CATALOG } from '@/config/brand.config';
import { trackPublicFileStatus } from '@/services/leads/leads.service';
import {
  LeadDocumentChecklistItem,
  LeadMilestoneItem,
  LeadStage,
  ServiceCategory,
} from '@/types/api';
import { formatDate } from '@/lib/utils';

function TrackStatusContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [code, setCode] = useState(initialCode);
  const [isPending, startTransition] = useTransition();
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackedFile, setTrackedFile] = useState<{
    trackingCode: string;
    category: ServiceCategory;
    customerName: string;
    destination?: string;
    stage: LeadStage;
    eligibilityStatus?: string;
    milestoneChecklist: LeadMilestoneItem[];
    documentChecklist: LeadDocumentChecklistItem[];
    updatedAt: string;
  } | null>(null);

  const handleLookup = (lookupCode: string) => {
    if (!lookupCode.trim()) return;
    setError(null);

    startTransition(async () => {
      const res = await trackPublicFileStatus(lookupCode);
      if (!res.success || !res.data) {
        setTrackedFile(null);
        setError(
          res.message ||
            'No file found with that Tracking Code. Try demo code: WP-102938',
        );
        return;
      }
      setTrackedFile(res.data);
    });
  };

  useEffect(() => {
    if (initialCode) {
      void trackPublicFileStatus(initialCode.trim()).then((res) => {
        if (!res.success || !res.data) {
          setTrackedFile(null);
          setError(
            res.message ||
              'No file found with that Tracking Code. Try demo code: WP-102938',
          );
          return;
        }
        setTrackedFile(res.data);
      });
    }
  }, [initialCode]);

  const sectorMeta = trackedFile
    ? SECTOR_CATALOG[trackedFile.category] ?? SECTOR_CATALOG.TOUR
    : null;

  const milestones = trackedFile?.milestoneChecklist || [];
  const docs = trackedFile?.documentChecklist || [];
  const doneMilestones = milestones.filter((m) => m.status === 'DONE').length;
  const milestonePct =
    milestones.length > 0
      ? Math.round((doneMilestones / milestones.length) * 100)
      : 0;
  const verifiedDocs = docs.filter((d) => d.status === 'VERIFIED').length;
  const pendingDocs = docs.filter(
    (d) => d.status === 'PENDING' || d.status === 'REJECTED',
  );

  const handleCopyShareLink = () => {
    if (!trackedFile?.trackingCode || typeof window === 'undefined') return;
    const url = `${window.location.origin}/track-status?code=${trackedFile.trackingCode}`;
    void navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase text-sky-800">
          24/7 Self-Service File Tracker • No Login Needed
        </span>
        <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Track Your Visa, Work Permit or Package Status
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
          Enter the File Tracking Code you received after submitting your inquiry (for example{' '}
          <strong className="font-mono text-slate-800">SV-820383</strong> or{' '}
          <strong className="font-mono text-slate-800">WP-102938</strong>) to view live progress.
        </p>
      </div>

      <Card className="p-5 sm:p-6 mb-8 border-slate-200 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup(code);
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter Tracking Code (e.g. SV-820383 or WP-102938)"
            className="flex-1 font-mono uppercase"
          />
          <Button type="submit" variant="secondary" disabled={isPending}>
            {isPending ? 'Checking...' : 'Track Status →'}
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span>Try Demo Files:</span>
            <button
              type="button"
              onClick={() => {
                setCode('SV-820383');
                handleLookup('SV-820383');
              }}
              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono font-semibold text-sky-700 hover:bg-sky-50"
            >
              SV-820383 (Student)
            </button>
            <button
              type="button"
              onClick={() => {
                setCode('WP-102938');
                handleLookup('WP-102938');
              }}
              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono font-semibold text-amber-800 hover:bg-amber-50"
            >
              WP-102938 (Work Permit)
            </button>
          </div>

          <Link href="/contact" className="font-semibold text-sky-700 hover:underline">
            Don’t have a Tracking Code? Apply Free →
          </Link>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
            {error}
          </p>
        )}
      </Card>

      {trackedFile && sectorMeta && (
        <div className="space-y-6">
          {/* File Header & Overall Progress Summary */}
          <Card className="p-6 border-sky-200 bg-gradient-to-br from-sky-50/60 via-white to-emerald-50/30 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${sectorMeta.badgeColor}`}
                  >
                    {sectorMeta.label}
                  </span>
                  <span className="font-mono text-xs font-extrabold text-slate-700 bg-white border border-slate-200 rounded px-2 py-0.5">
                    #{trackedFile.trackingCode}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Applicant: {trackedFile.customerName}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Destination: <strong className="text-slate-700">{trackedFile.destination || 'TBD'}</strong> • Last Updated:{' '}
                  {formatDate(trackedFile.updatedAt)}
                </p>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase text-slate-400">
                    File Stage:
                  </span>
                  <StatusBadge status={trackedFile.stage} />
                </div>
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copiedLink ? '✓ Link Copied!' : '🔗 Copy Shareable Link'}
                </button>
              </div>
            </div>

            {/* Visual Overall Progress Bar */}
            <div className="rounded-xl bg-white border border-slate-200/80 p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-800">
                  Overall Application Progress: {milestonePct}% Complete
                </span>
                <span className="text-slate-500">
                  🚀 {doneMilestones}/{milestones.length} Milestones Done • 📋 {verifiedDocs}/{docs.length} Docs Verified
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.max(doneMilestones > 0 ? 8 : 3, milestonePct)}%` }}
                />
              </div>
            </div>
          </Card>

          {/* What To Do Next (Actionable Guidance for General Users) */}
          {pendingDocs.length > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-amber-950">
                  📌 Action Needed From You ({pendingDocs.length} Pending Document{pendingDocs.length === 1 ? '' : 's'})
                </h3>
                <a
                  href={`tel:${brandConfig.contact.phone.replace(/\s+/g, '')}`}
                  className="text-xs font-bold text-amber-900 underline"
                >
                  Need help? Call {brandConfig.contact.phone}
                </a>
              </div>
              <p className="text-xs text-amber-900">
                To move your file to the next stage faster, please submit or bring these items to our desk:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {pendingDocs.map((d, i) => (
                  <span
                    key={d.key || i}
                    className="rounded-md bg-white border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-950"
                  >
                    • {d.title || `Document ${i + 1}`}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            docs.length > 0 && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-900">
                ✅ Great news! All required documents for your file have been received or verified by our team.
              </div>
            )
          )}

          {/* Step-by-Step Milestone Progress */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  🚀 Application & Visa Processing Milestones
                </h3>
                <p className="text-xs text-slate-500">
                  Step-by-step live status updated directly by your counselor
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                {doneMilestones} of {milestones.length} Completed
              </span>
            </div>
            <div className="space-y-3">
              {milestones.map((m, idx) => {
                const isDone = m.status === 'DONE';
                const isInProgress = m.status === 'IN_PROGRESS';
                return (
                  <div
                    key={m.key || idx}
                    className={`flex items-center justify-between rounded-lg border p-3.5 ${
                      isDone
                        ? 'border-emerald-200 bg-emerald-50/60'
                        : isInProgress
                          ? 'border-sky-300 bg-sky-50'
                          : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isInProgress
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {m.title || `Step ${idx + 1}`}
                        </p>
                        {m.completedAt && (
                          <p className="text-[11px] text-slate-500">
                            Completed: {formatDate(m.completedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800'
                          : isInProgress
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {(m.status || 'PENDING').replace(/_/g, ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Document Checklist Verification Status */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="text-base font-bold text-slate-900">
                📋 Document Verification Checklist
              </h3>
              <span className="text-xs text-slate-500">
                {verifiedDocs} Verified • {pendingDocs.length} Pending
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              <strong>PENDING</strong> = You still need to submit • <strong>RECEIVED</strong> = We have it & reviewing • <strong>VERIFIED</strong> = Approved for submission.
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {docs.map((doc, idx) => (
                <div
                  key={doc.key || idx}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-xs"
                >
                  <span className="font-medium text-slate-800 pr-2">
                    {idx + 1}. {doc.title || `Document ${idx + 1}`}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 font-semibold ${
                      doc.status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : doc.status === 'RECEIVED'
                          ? 'bg-sky-100 text-sky-800'
                          : doc.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {doc.status || 'PENDING'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function PublicTrackStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-12 text-center text-sm text-slate-500">
          Loading file status tracker...
        </div>
      }
    >
      <TrackStatusContent />
    </Suspense>
  );
}
