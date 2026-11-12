'use client';

import { Suspense, useEffect, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SECTOR_CATALOG } from '@/config/brand.config';
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase text-sky-800">
          24/7 Self-Service File Tracker
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
          Track Your Visa, Work Permit or Package Status
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your File Tracking Code (e.g. <strong>WP-102938</strong>) to view real-time milestone progress and verified documents.
        </p>
      </div>

      <Card className="p-6 mb-8">
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
            placeholder="Enter Tracking Code (e.g. WP-102938, SV-492018, HJ-309481)"
            className="flex-1 font-mono uppercase"
          />
          <Button type="submit" variant="secondary" disabled={isPending}>
            {isPending ? 'Checking...' : 'Track Status →'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCode('WP-102938');
              handleLookup('WP-102938');
            }}
          >
            Try Demo (WP-102938)
          </Button>
        </form>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700">
            {error}
          </p>
        )}
      </Card>

      {trackedFile && sectorMeta && (
        <div className="space-y-6">
          {/* File Header Summary */}
          <Card className="p-6 border-sky-200 bg-sky-50/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${sectorMeta.badgeColor}`}
                  >
                    {sectorMeta.label}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-600">
                    #{trackedFile.trackingCode}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Applicant: {trackedFile.customerName}
                </h2>
                <p className="text-xs text-slate-500">
                  Destination: <strong>{trackedFile.destination || 'TBD'}</strong> • Last Updated:{' '}
                  {formatDate(trackedFile.updatedAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase mb-1">
                  Current File Stage
                </p>
                <StatusBadge status={trackedFile.stage} />
              </div>
            </div>
          </Card>

          {/* Step-by-Step Milestone Progress */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              🚀 Application & Visa Processing Milestones
            </h3>
            <div className="space-y-3">
              {(trackedFile.milestoneChecklist || []).map((m, idx) => {
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
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
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
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
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
            <h3 className="text-base font-bold text-slate-900 mb-2">
              📋 Document Verification Checklist
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Items marked as PENDING are required by our processing desk for the next stage.
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {(trackedFile.documentChecklist || []).map((doc, idx) => (
                <div
                  key={doc.key || idx}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-xs"
                >
                  <span className="font-medium text-slate-800 pr-2">
                    {doc.title || `Document ${idx + 1}`}
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
