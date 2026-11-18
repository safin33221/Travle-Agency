'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  addLeadNote,
  createFollowUpTask,
  updateFollowUpTaskStatus,
  updateLeadChecklists,
  updateLeadStage,
} from '@/services/leads/leads.service';
import { createQuotation } from '@/services/quotations/quotations.service';
import {
  DocumentItemStatus,
  Lead,
  LeadDocumentChecklistItem,
  LeadMilestoneItem,
  LeadStage,
  MilestoneItemStatus,
  TourPackage,
  VisaService,
} from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { isPackageCategory, SECTOR_CATALOG } from '@/config/brand.config';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Calendar,
  Check,
  ClipboardCheck,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Layers,
  MapPin,
  MessageSquare,
  Phone,
  Rocket,
  StickyNote,
  Users,
  Wallet,
  X,
} from 'lucide-react';

const STAGES: LeadStage[] = [
  'NEW',
  'QUALIFIED',
  'QUOTED',
  'FOLLOW_UP',
  'WON',
  'LOST',
];

const DOC_STATUS_CYCLE: DocumentItemStatus[] = [
  'PENDING',
  'RECEIVED',
  'VERIFIED',
  'REJECTED',
];

const MILESTONE_STATUS_CYCLE: MilestoneItemStatus[] = [
  'PENDING',
  'IN_PROGRESS',
  'DONE',
];

export function LeadWorkspaceClient({
  lead,
  packages,
  visaServices = [],
}: {
  lead: Lead;
  packages: TourPackage[];
  visaServices?: VisaService[];
}) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'CHECKLISTS' | 'QUOTATIONS' | 'NOTES'
  >('ALL');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedTracker, setCopiedTracker] = useState(false);

  const [noteText, setNoteText] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => {
      setFeedback((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const [docs, setDocs] = useState<LeadDocumentChecklistItem[]>(() =>
    (Array.isArray(lead.documentChecklist) ? lead.documentChecklist : []).map(
      (d, idx) => ({
        key: d?.key || `DOC_${idx + 1}`,
        title:
          typeof d === 'string'
            ? d
            : d?.title || `Document ${idx + 1}`,
        required: d?.required ?? true,
        status: d?.status || 'PENDING',
        note: d?.note,
        updatedAt: d?.updatedAt,
      }),
    ),
  );
  const [milestones, setMilestones] = useState<LeadMilestoneItem[]>(() =>
    (Array.isArray(lead.milestoneChecklist) ? lead.milestoneChecklist : []).map(
      (m, idx) => ({
        key: m?.key || `MILESTONE_${idx + 1}`,
        title:
          typeof m === 'string'
            ? m
            : m?.title || `Step ${idx + 1}`,
        status: m?.status || 'PENDING',
        completedAt: m?.completedAt,
      }),
    ),
  );

  // Quick Quotation state
  const [selectedPkgId, setSelectedPkgId] = useState<string>(
    packages[0]?.id || '',
  );
  const [itemLabel, setItemLabel] = useState<string>(
    packages[0]?.title || `${lead.destination || 'Service'} Package`,
  );
  const [qty, setQty] = useState<number>(lead.travelerCount || 1);
  const [unitPrice, setUnitPrice] = useState<number>(
    Number(packages[0]?.basePrice || 20000),
  );
  const [discount, setDiscount] = useState<number>(0);

  const sectorMeta =
    SECTOR_CATALOG[lead.category ?? 'TOUR'] ?? SECTOR_CATALOG.TOUR;

  const handleStageChange = (stage: LeadStage) => {
    startTransition(async () => {
      const res = await updateLeadStage(lead.id, stage);
      if (res.success) {
        showToast(`✓ File stage updated to ${stage.replace(/_/g, ' ')}`);
      }
    });
  };

  const handleSetDocStatus = (index: number, nextStatus: DocumentItemStatus) => {
    const current = docs[index];
    if (!current || current.status === nextStatus) return;
    const updated = docs.map((d, idx) =>
      idx === index
        ? { ...d, status: nextStatus, updatedAt: new Date().toISOString() }
        : d,
    );
    setDocs(updated);
    startTransition(async () => {
      const res = await updateLeadChecklists(lead.id, {
        documentChecklist: updated,
      });
      if (res.success) {
        showToast(`✓ "${current.title}" marked as ${nextStatus}`);
      }
    });
  };

  const handleToggleDocStatus = (index: number) => {
    const current = docs[index];
    if (!current) return;
    const nextIdx =
      (DOC_STATUS_CYCLE.indexOf(current.status) + 1) % DOC_STATUS_CYCLE.length;
    handleSetDocStatus(index, DOC_STATUS_CYCLE[nextIdx]);
  };

  const handleSetMilestoneStatus = (
    index: number,
    nextStatus: MilestoneItemStatus,
  ) => {
    const current = milestones[index];
    if (!current || current.status === nextStatus) return;
    const updated = milestones.map((m, idx) =>
      idx === index
        ? {
            ...m,
            status: nextStatus,
            completedAt:
              nextStatus === 'DONE' ? new Date().toISOString() : undefined,
          }
        : m,
    );
    setMilestones(updated);
    startTransition(async () => {
      const res = await updateLeadChecklists(lead.id, {
        milestoneChecklist: updated,
      });
      if (res.success) {
        showToast(
          `✓ Milestone "${current.title}" set to ${nextStatus.replace(/_/g, ' ')} (Synced to /track-status)`,
        );
      }
    });
  };

  const handleToggleMilestoneStatus = (index: number) => {
    const current = milestones[index];
    if (!current) return;
    const nextIdx =
      (MILESTONE_STATUS_CYCLE.indexOf(current.status) + 1) %
      MILESTONE_STATUS_CYCLE.length;
    handleSetMilestoneStatus(index, MILESTONE_STATUS_CYCLE[nextIdx]);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    startTransition(async () => {
      const res = await addLeadNote(lead.id, noteText.trim());
      setNoteText('');
      if (res.success) showToast('✓ Consultation note saved');
    });
  };

  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpDate || !followUpNote.trim()) return;
    startTransition(async () => {
      const res = await createFollowUpTask(lead.id, {
        dueAt: new Date(followUpDate).toISOString(),
        note: followUpNote.trim(),
      });
      setFollowUpDate('');
      setFollowUpNote('');
      if (res.success) showToast('✓ Follow-up reminder scheduled');
    });
  };

  const handlePackageSelect = (pkgId: string) => {
    setSelectedPkgId(pkgId);
    const found = packages.find((p) => p.id === pkgId);
    if (found) {
      setItemLabel(`${found.title} (${found.destination})`);
      setUnitPrice(Number(found.basePrice));
    }
  };

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createQuotation(lead.id, {
        items: [
          {
            packageId: selectedPkgId || undefined,
            label: itemLabel,
            quantity: qty,
            unitPrice,
          },
        ],
        discount,
      });
      if (res.success) showToast('✓ Quotation draft created & added to history');
    });
  };

  const handleCopyTrackerLink = () => {
    if (!lead.trackingCode || typeof window === 'undefined') return;
    const url = `${window.location.origin}/track-status?code=${lead.trackingCode}`;
    void navigator.clipboard.writeText(url);
    setCopiedTracker(true);
    showToast(`✓ Client Tracking URL copied (#${lead.trackingCode})`);
    setTimeout(() => setCopiedTracker(false), 2500);
  };

  const doneMilestones = milestones.filter((m) => m.status === 'DONE').length;
  const milestonePct =
    milestones.length > 0
      ? Math.round((doneMilestones / milestones.length) * 100)
      : 0;

  const verifiedDocs = docs.filter((d) => d.status === 'VERIFIED').length;
  const receivedDocs = docs.filter((d) => d.status === 'RECEIVED').length;
  const docPct =
    docs.length > 0
      ? Math.round(((verifiedDocs + receivedDocs) / docs.length) * 100)
      : 0;

  const currentStageIdx = STAGES.indexOf(lead.stage);

  return (
    <div className="space-y-6">
      {/* Live Feedback Toast Banner */}
      {feedback && (
        <div className="sticky top-18 z-20 flex items-center justify-between rounded-xl border border-teal-300 bg-teal-50 px-4 py-2.5 text-xs font-semibold text-teal-900 shadow-sm">
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-teal-700 hover:text-teal-950"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Applicant Profile & Stage Pipeline Stepper Card */}
      <Card className="p-5 sm:p-6 space-y-5 border-stone-200/90">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${sectorMeta.badgeColor}`}
              >
                {sectorMeta.label}
              </span>
              <StatusBadge status={lead.stage} />
              {lead.eligibilityStatus && (
                <span className="rounded-full border border-teal-200 bg-teal-50/70 px-2.5 py-0.5 text-xs font-semibold text-teal-900">
                  Eligibility: {String(lead.eligibilityStatus).replace(/_/g, ' ')}
                </span>
              )}
              <span className="text-xs text-stone-500">
                Source: <strong className="text-slate-800">{lead.source}</strong> • Counselor:{' '}
                <strong className="text-slate-800">{lead.assignedTo?.name || 'Unassigned'}</strong>
              </span>
            </div>

            {/* Key Inquiry Facts */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-stone-600">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-stone-400" />
                Destination: <strong className="text-slate-900">{lead.destination || 'TBD'}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-stone-400" />
                Budget: <strong className="text-slate-900 tabular-nums">{formatCurrency(lead.budget)}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-stone-400" />
                Travelers: <strong className="text-slate-900">{lead.travelerCount || 1} Pax</strong>
              </span>
              {lead.travelStartDate && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-stone-400" />
                  Travel Date: <strong className="text-slate-900">{formatDate(lead.travelStartDate)}</strong>
                </span>
              )}
            </div>

            {lead.requirements && (
              <div className="rounded-xl bg-[#FAF9F6] border border-stone-200/80 px-3.5 py-2.5 text-xs text-stone-700 max-w-2xl">
                <span className="font-semibold text-slate-900">Applicant Note / Profile: </span>
                {lead.requirements}
              </div>
            )}
          </div>

          {/* Quick Contact + Public Tracker Sharing Controls */}
          <div className="flex flex-col sm:items-end gap-2.5">
            {lead.customerPhone && (
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`tel:${lead.customerPhone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-stone-50 transition"
                >
                  <Phone className="h-3.5 w-3.5 text-stone-500" />
                  Call {lead.customerPhone}
                </a>
                <a
                  href={`https://wa.me/${lead.customerPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/70 px-3 py-1.5 text-xs font-semibold text-teal-900 hover:bg-teal-100 transition"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-teal-700" />
                  WhatsApp Client
                </a>
              </div>
            )}

            {lead.trackingCode && (
              <div className="flex flex-col sm:items-end gap-2 rounded-xl border border-stone-200 bg-[#FAF9F6] p-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                    Client Tracking ID:
                  </span>
                  <span className="rounded-lg bg-white border border-stone-200 px-2 py-0.5 font-mono text-xs font-bold text-teal-800">
                    #{lead.trackingCode}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyTrackerLink}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-stone-50 transition"
                  >
                    {copiedTracker ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-teal-700" />
                        Copied Link
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-stone-500" />
                        Copy Client Link
                      </>
                    )}
                  </button>
                  <Link
                    href={`/track-status?code=${lead.trackingCode}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-teal-800 transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Live Tracker
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visual Interactive Pipeline Stage Bar */}
        <div className="pt-3 border-t border-stone-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Pipeline Stage
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
            {STAGES.map((st, idx) => {
              const isCurrent = lead.stage === st;
              const isPassed =
                lead.stage !== 'LOST' &&
                st !== 'LOST' &&
                currentStageIdx > idx;
              return (
                <button
                  key={st}
                  type="button"
                  disabled={isPending}
                  onClick={() => handleStageChange(st)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-semibold transition-all ${
                    isCurrent
                      ? st === 'LOST'
                        ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                        : 'border-teal-700 bg-teal-700 text-white shadow-xs'
                      : isPassed
                        ? 'border-teal-200 bg-teal-50/70 text-teal-900 hover:bg-teal-100'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-[11px]">
                    {isCurrent ? '●' : isPassed ? '✓' : `${idx + 1}.`}
                  </span>
                  <span>{st.replace(/_/g, ' ')}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* High-Visibility Progress Summary Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-2xs">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-400">
            <Rocket className="h-3.5 w-3.5 text-teal-700" />
            Milestones Done
          </p>
          <p className="mt-1.5 text-lg font-extrabold text-slate-900 tabular-nums">
            {doneMilestones} / {milestones.length}{' '}
            <span className="text-xs font-semibold text-teal-700">
              ({milestonePct}%)
            </span>
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-2xs">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-400">
            <ClipboardCheck className="h-3.5 w-3.5 text-teal-700" />
            Docs Ready
          </p>
          <p className="mt-1.5 text-lg font-extrabold text-slate-900 tabular-nums">
            {verifiedDocs + receivedDocs} / {docs.length}{' '}
            <span className="text-xs font-semibold text-teal-700">
              ({docPct}%)
            </span>
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-2xs">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-400">
            <FileText className="h-3.5 w-3.5 text-stone-500" />
            Quotations
          </p>
          <p className="mt-1.5 text-lg font-extrabold text-slate-900 tabular-nums">
            {lead.quotations?.length || 0}{' '}
            <span className="text-xs font-medium text-stone-500">issued</span>
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-2xs">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-400">
            <Clock className="h-3.5 w-3.5 text-stone-500" />
            Open Follow-Ups
          </p>
          <p className="mt-1.5 text-lg font-extrabold text-slate-900 tabular-nums">
            {(lead.followUpTasks || []).filter((t) => t.status === 'OPEN').length}{' '}
            <span className="text-xs font-medium text-stone-500">pending</span>
          </p>
        </div>
      </div>

      {/* Workspace Section Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'ALL', label: 'All Workspace Panels', Icon: Layers },
            {
              id: 'CHECKLISTS',
              label: `Milestones & Docs (${doneMilestones}/${milestones.length} • ${verifiedDocs}/${docs.length})`,
              Icon: ClipboardCheck,
            },
            {
              id: 'QUOTATIONS',
              label: `Quotations (${lead.quotations?.length || 0})`,
              Icon: FileText,
            },
            {
              id: 'NOTES',
              label: `Notes & Follow-Ups (${(lead.notes?.length || 0) + (lead.followUpTasks?.length || 0)})`,
              Icon: StickyNote,
            },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() =>
                setActiveTab(
                  id as 'ALL' | 'CHECKLISTS' | 'QUOTATIONS' | 'NOTES',
                )
              }
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: Automated Application Milestones & Document Checklist */}
      {(activeTab === 'ALL' || activeTab === 'CHECKLISTS') &&
        (milestones.length > 0 || docs.length > 0) && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Application Milestones (Synced with Public /track-status) */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Rocket className="h-4 w-4 text-teal-700" />
                      Processing Milestones
                    </CardTitle>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {doneMilestones} of {milestones.length} completed ({milestonePct}%) • Live on /track-status
                    </p>
                  </div>
                  <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                    {milestonePct}% Done
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-teal-700 transition-all"
                    style={{ width: `${milestonePct}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {milestones.map((m, idx) => (
                  <div
                    key={m.key || idx}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border p-3 text-xs transition-all ${
                      m.status === 'DONE'
                        ? 'border-teal-200 bg-teal-50/50'
                        : m.status === 'IN_PROGRESS'
                          ? 'border-stone-300 bg-[#FAF9F6]'
                          : 'border-stone-200 bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggleMilestoneStatus(idx)}
                      className="flex items-center gap-2.5 text-left font-semibold text-slate-900 hover:text-teal-700"
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          m.status === 'DONE'
                            ? 'bg-teal-700 text-white'
                            : m.status === 'IN_PROGRESS'
                              ? 'bg-slate-900 text-white'
                              : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {m.status === 'DONE' ? '✓' : idx + 1}
                      </span>
                      <span>{m.title || `Step ${idx + 1}`}</span>
                    </button>

                    {/* Direct 1-Click Status Selector Pills */}
                    <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                      {MILESTONE_STATUS_CYCLE.map((st) => {
                        const active = m.status === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            disabled={isPending}
                            onClick={() => handleSetMilestoneStatus(idx, st)}
                            className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                              active
                                ? st === 'DONE'
                                  ? 'bg-teal-700 text-white'
                                  : st === 'IN_PROGRESS'
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-stone-600 text-white'
                                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}
                          >
                            {st === 'IN_PROGRESS' ? 'ACTIVE' : st}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Document Verification Checklist */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ClipboardCheck className="h-4 w-4 text-teal-700" />
                      Document Verification Checklist
                    </CardTitle>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {verifiedDocs} verified, {receivedDocs} received of {docs.length} required docs
                    </p>
                  </div>
                  <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                    {docPct}% Ready
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-teal-700 transition-all"
                    style={{ width: `${docPct}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {docs.map((doc, idx) => (
                  <div
                    key={doc.key || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white p-2.5 text-xs hover:border-stone-300 transition"
                  >
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggleDocStatus(idx)}
                      className="font-medium text-slate-800 text-left hover:text-teal-700"
                    >
                      {idx + 1}. {doc.title || `Document ${idx + 1}`}
                    </button>

                    {/* Direct 1-Click Document Status Pills */}
                    <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                      {DOC_STATUS_CYCLE.map((st) => {
                        const active = doc.status === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            disabled={isPending}
                            onClick={() => handleSetDocStatus(idx, st)}
                            className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                              active
                                ? st === 'VERIFIED'
                                  ? 'bg-teal-700 text-white'
                                  : st === 'RECEIVED'
                                    ? 'bg-slate-800 text-white'
                                    : st === 'REJECTED'
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-amber-600 text-white'
                                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

      {/* SECTION 2: Quotations Builder & History */}
      {(activeTab === 'ALL' || activeTab === 'QUOTATIONS') && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Deterministic Quotation Builder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-teal-700" />
                Create Quotation (Server-Calculated Totals)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateQuotation} className="space-y-3">
                <div>
                  <Label>Select Verified Catalog Package (Optional)</Label>
                  <select
                    value={selectedPkgId}
                    onChange={(e) => handlePackageSelect(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/15"
                  >
                    <option value="">-- Custom Line Item --</option>
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.category || 'TOUR'}] {p.title} —{' '}
                        {formatCurrency(p.basePrice, p.currency)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Line Item Description *</Label>
                  <Input
                    value={itemLabel}
                    onChange={(e) => setItemLabel(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Pax / Qty</Label>
                    <Input
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value) || 1)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Unit Price (BDT)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Discount (BDT)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-[#FAF9F6] border border-stone-200/80 p-3 flex items-center justify-between text-sm">
                  <span className="text-stone-600">Estimated Total Preview:</span>
                  <strong className="text-slate-900 tabular-nums">
                    {formatCurrency(Math.max(0, qty * unitPrice - discount))}
                  </strong>
                </div>

                <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
                  + Create Quotation Draft
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing Quotations List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-stone-500" />
                Quotation History ({lead.quotations?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {lead.quotations && lead.quotations.length > 0 ? (
                lead.quotations.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between rounded-xl border border-stone-200 p-3 text-sm hover:bg-[#FAF9F6]"
                  >
                    <div>
                      <span className="font-semibold">Rev #{q.revision}</span> •{' '}
                      <span className="font-bold text-slate-900 tabular-nums">
                        {formatCurrency(q.grandTotal, q.currency)}
                      </span>
                      <div className="mt-1">
                        <StatusBadge status={q.status} />
                      </div>
                    </div>
                    <Link href={`/dashboard/quotations/${q.id}`}>
                      <Button variant="outline" size="sm">
                        Open / PDF →
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-stone-200 p-8 text-center text-xs text-stone-500">
                  No quotations issued for this customer yet. Create a quotation draft on the left to generate an official price proposal.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* SECTION 3: Notes & Manual Follow-Up Tasks */}
      {(activeTab === 'ALL' || activeTab === 'NOTES') && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <StickyNote className="h-4 w-4 text-teal-700" />
                Staff Consultation Notes ({lead.notes?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddNote} className="flex gap-2">
                <Input
                  placeholder="Add internal consultation note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
                  Add Note
                </Button>
              </form>

              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {lead.notes?.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl bg-[#FAF9F6] p-3 text-sm border border-stone-200/80"
                  >
                    <p className="text-slate-800">{note.content}</p>
                    <p className="mt-1 text-xs text-stone-400">
                      {note.actor?.name || 'Staff'} • {formatDate(note.createdAt)}
                    </p>
                  </div>
                ))}
                {(!lead.notes || lead.notes.length === 0) && (
                  <p className="text-xs text-stone-400">No notes recorded yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-teal-700" />
                Manual Follow-Up Reminders ({lead.followUpTasks?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                onSubmit={handleAddFollowUp}
                className="grid grid-cols-1 gap-2 sm:grid-cols-3"
              >
                <Input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  required
                />
                <Input
                  placeholder="Follow-up action note..."
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  required
                />
                <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
                  Schedule Task
                </Button>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {lead.followUpTasks?.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-xl border border-stone-200 p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{task.note}</p>
                      <p className="text-xs text-stone-500">
                        Due: {formatDate(task.dueAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={task.status} />
                      {task.status === 'OPEN' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending}
                          onClick={() =>
                            startTransition(async () => {
                              const res = await updateFollowUpTaskStatus(
                                task.id,
                                'DONE',
                                lead.id,
                              );
                              if (res.success) {
                                showToast('✓ Follow-up task marked as DONE');
                              }
                            })
                          }
                        >
                          Mark Done
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {(!lead.followUpTasks || lead.followUpTasks.length === 0) && (
                  <p className="text-xs text-stone-400">
                    No follow-up tasks scheduled.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
