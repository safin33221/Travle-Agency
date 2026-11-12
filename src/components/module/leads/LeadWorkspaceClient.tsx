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
import { generateAiDraft } from '@/services/ai/ai.service';
import { createQuotation } from '@/services/quotations/quotations.service';
import {
  DocumentItemStatus,
  Lead,
  LeadDocumentChecklistItem,
  LeadMilestoneItem,
  LeadStage,
  MilestoneItemStatus,
  TourPackage,
} from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label, Textarea } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SECTOR_CATALOG } from '@/config/brand.config';
import { formatCurrency, formatDate } from '@/lib/utils';

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
}: {
  lead: Lead;
  packages: TourPackage[];
}) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'CHECKLISTS' | 'AI_QUOTES' | 'NOTES'
  >('ALL');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedTracker, setCopiedTracker] = useState(false);
  const [copiedAiDraft, setCopiedAiDraft] = useState(false);

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

  // AI Draft state
  const [aiInquiry, setAiInquiry] = useState(
    lead.requirements ||
      `Customer ${lead.customerName} is inquiring about ${lead.category || 'TOUR'} for ${lead.destination || 'preferred destination'}.`,
  );
  const [aiLang, setAiLang] = useState<'en' | 'bn' | 'banglish'>('bn');
  const [latestDraft, setLatestDraft] = useState<string>(
    lead.aiDrafts?.[0]?.suggestedText || '',
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

  const handleDraftMissingDocsReminder = () => {
    const missing = docs
      .filter((d) => d.status === 'PENDING' || d.status === 'REJECTED')
      .map((d) => d.title);
    const prompt =
      missing.length > 0
        ? `Please remind ${lead.customerName} (Tracking ID: ${lead.trackingCode || 'N/A'}) to submit pending documents: ${missing.join(', ')}.`
        : `All required documents for ${lead.customerName} are verified. Provide a status update for ${lead.destination || 'their file'}.`;
    setAiInquiry(prompt);
    if (activeTab === 'CHECKLISTS' || activeTab === 'NOTES') {
      setActiveTab('ALL');
    }

    startTransition(async () => {
      const res = await generateAiDraft({
        leadId: lead.id,
        customerInquiry: prompt,
        language: aiLang,
        type: 'CUSTOMER_REPLY',
      });
      if (res.data?.suggestedText) {
        setLatestDraft(res.data.suggestedText);
        showToast('✓ AI missing-documents reminder drafted below!');
      }
    });
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

  const handleGenerateAi = () => {
    startTransition(async () => {
      const res = await generateAiDraft({
        leadId: lead.id,
        customerInquiry: aiInquiry,
        language: aiLang,
        type: 'CUSTOMER_REPLY',
      });
      if (res.data?.suggestedText) {
        setLatestDraft(res.data.suggestedText);
        showToast('✓ Grounded AI reply draft generated');
      }
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

  const handleCopyAiDraft = () => {
    if (!latestDraft || typeof window === 'undefined') return;
    void navigator.clipboard.writeText(latestDraft);
    setCopiedAiDraft(true);
    showToast('✓ AI reply copied to clipboard');
    setTimeout(() => setCopiedAiDraft(false), 2500);
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
        <div className="sticky top-18 z-20 flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-900 shadow-sm">
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Applicant Profile & Stage Pipeline Stepper Card */}
      <Card className="p-5 space-y-5 border-slate-200/90">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${sectorMeta.badgeColor}`}
              >
                {sectorMeta.label}
              </span>
              <StatusBadge status={lead.stage} />
              {lead.eligibilityStatus && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  Eligibility: {String(lead.eligibilityStatus).replace(/_/g, ' ')}
                </span>
              )}
              <span className="text-xs text-slate-500">
                Source: <strong>{lead.source}</strong> • Counselor:{' '}
                <strong>{lead.assignedTo?.name || 'Unassigned'}</strong>
              </span>
            </div>

            {/* Key Inquiry Facts */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-600">
              <span>
                📍 Destination: <strong className="text-slate-900">{lead.destination || 'TBD'}</strong>
              </span>
              <span>
                💰 Budget: <strong className="text-slate-900">{formatCurrency(lead.budget)}</strong>
              </span>
              <span>
                👥 Travelers: <strong className="text-slate-900">{lead.travelerCount || 1} Pax</strong>
              </span>
              {lead.travelStartDate && (
                <span>
                  📅 Travel Date: <strong className="text-slate-900">{formatDate(lead.travelStartDate)}</strong>
                </span>
              )}
            </div>

            {lead.requirements && (
              <div className="rounded-lg bg-slate-50 border border-slate-200/80 px-3 py-2 text-xs text-slate-700 max-w-2xl">
                <span className="font-semibold text-slate-900">Applicant Note / Profile: </span>
                {lead.requirements}
              </div>
            )}
          </div>

          {/* Public Tracker Sharing Controls */}
          {lead.trackingCode && (
            <div className="flex flex-col sm:items-end gap-2 rounded-xl border border-sky-200 bg-sky-50/50 p-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Client Tracking ID:
                </span>
                <span className="rounded bg-white border border-sky-200 px-2 py-0.5 font-mono text-xs font-extrabold text-sky-800">
                  #{lead.trackingCode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyTrackerLink}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  {copiedTracker ? '✓ Copied Link!' : '📋 Copy Client Link'}
                </button>
                <Link
                  href={`/track-status?code=${lead.trackingCode}`}
                  target="_blank"
                  className="rounded-lg bg-sky-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-sky-700 transition"
                >
                  🔍 Live Tracker ↗
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Visual Interactive Pipeline Stage Bar */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pipeline Stage Progression (Click any stage to update)
            </span>
            <span className="text-[11px] text-slate-500">
              Current: <strong className="text-slate-800">{lead.stage}</strong>
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
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition-all ${
                    isCurrent
                      ? st === 'LOST'
                        ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                        : 'border-sky-600 bg-sky-600 text-white shadow-xs'
                      : isPassed
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
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

      {/* Workspace Section Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'ALL', label: '⚡ All Workspace Panels' },
            {
              id: 'CHECKLISTS',
              label: `📋 Milestones & Docs (${doneMilestones}/${milestones.length} • ${verifiedDocs}/${docs.length})`,
            },
            {
              id: 'AI_QUOTES',
              label: `✨ AI Copilot & Quotations (${lead.quotations?.length || 0})`,
            },
            {
              id: 'NOTES',
              label: `📝 Notes & Follow-Ups (${(lead.notes?.length || 0) + (lead.followUpTasks?.length || 0)})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(
                  tab.id as 'ALL' | 'CHECKLISTS' | 'AI_QUOTES' | 'NOTES',
                )
              }
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Changes auto-sync to public <code className="font-mono">/track-status</code>
        </span>
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
                    <CardTitle className="text-base">
                      🚀 Processing Milestones
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {doneMilestones} of {milestones.length} completed ({milestonePct}%) • Live on /track-status
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    {milestonePct}% Done
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${milestonePct}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {milestones.map((m, idx) => (
                  <div
                    key={m.key || idx}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border p-3 text-xs transition-all ${
                      m.status === 'DONE'
                        ? 'border-emerald-200 bg-emerald-50/60'
                        : m.status === 'IN_PROGRESS'
                          ? 'border-sky-300 bg-sky-50/70'
                          : 'border-slate-200 bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggleMilestoneStatus(idx)}
                      className="flex items-center gap-2.5 text-left font-semibold text-slate-900 hover:text-sky-700"
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          m.status === 'DONE'
                            ? 'bg-emerald-600 text-white'
                            : m.status === 'IN_PROGRESS'
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-200 text-slate-700'
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
                            className={`rounded-md px-2 py-1 text-[10px] font-bold transition ${
                              active
                                ? st === 'DONE'
                                  ? 'bg-emerald-600 text-white'
                                  : st === 'IN_PROGRESS'
                                    ? 'bg-sky-600 text-white'
                                    : 'bg-slate-700 text-white'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
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

            {/* Document Verification Checklist + 1-Click Missing Docs Chaser */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">
                      📋 Document Verification Checklist
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {verifiedDocs} verified, {receivedDocs} received of {docs.length} required docs
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={isPending}
                    onClick={handleDraftMissingDocsReminder}
                  >
                    ✨ Draft Missing Docs Reminder
                  </Button>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-sky-600 transition-all"
                    style={{ width: `${docPct}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {docs.map((doc, idx) => (
                  <div
                    key={doc.key || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-xs hover:border-slate-300 transition"
                  >
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggleDocStatus(idx)}
                      className="font-medium text-slate-800 text-left hover:text-sky-700"
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
                            className={`rounded-md px-2 py-1 text-[10px] font-bold transition ${
                              active
                                ? st === 'VERIFIED'
                                  ? 'bg-emerald-600 text-white'
                                  : st === 'RECEIVED'
                                    ? 'bg-sky-600 text-white'
                                    : st === 'REJECTED'
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-amber-500 text-white'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
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

      {/* SECTION 2: AI Copilot & Quotations */}
      {(activeTab === 'ALL' || activeTab === 'AI_QUOTES') && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* AI Copilot Panel */}
          <Card className="border-sky-200">
            <CardHeader className="bg-sky-50/60 border-b border-sky-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-sky-950">
                  ✨ AI Response Copilot (Grounded in Approved Catalog)
                </CardTitle>
                <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                  Human Review Required
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Label>Customer Inquiry / Reminder Context</Label>
                  <Input
                    value={aiInquiry}
                    onChange={(e) => setAiInquiry(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Reply Language</Label>
                  <select
                    value={aiLang}
                    onChange={(e) =>
                      setAiLang(e.target.value as 'en' | 'bn' | 'banglish')
                    }
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="bn">Bangla (বাংলা)</option>
                    <option value="en">English</option>
                    <option value="banglish">Banglish</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isPending}
                  onClick={handleGenerateAi}
                >
                  {isPending
                    ? 'Generating AI Draft...'
                    : '✨ Generate Grounded Reply Draft'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={handleDraftMissingDocsReminder}
                >
                  📋 Draft Pending Docs Chaser
                </Button>
              </div>

              {latestDraft && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <Label>Editable Staff Review Draft</Label>
                    <button
                      type="button"
                      onClick={handleCopyAiDraft}
                      className="rounded-md bg-sky-50 border border-sky-200 px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                    >
                      {copiedAiDraft ? '✓ Copied!' : '📋 Copy Reply for WhatsApp'}
                    </button>
                  </div>
                  <Textarea
                    value={latestDraft}
                    onChange={(e) => setLatestDraft(e.target.value)}
                    className="min-h-[140px] bg-slate-50"
                  />
                  <p className="text-xs text-amber-700">
                    ⚠️ AI never sends messages autonomously. Review prices and checklist items before copying to WhatsApp/Email.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deterministic Quotation Builder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                📄 Create Quotation (Server-Calculated Totals)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateQuotation} className="space-y-3">
                <div>
                  <Label>Select Verified Catalog Package (Optional)</Label>
                  <select
                    value={selectedPkgId}
                    onChange={(e) => handlePackageSelect(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
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

                <div className="rounded-lg bg-slate-50 p-3 flex items-center justify-between text-sm">
                  <span className="text-slate-600">Estimated Total Preview:</span>
                  <strong className="text-slate-900">
                    {formatCurrency(Math.max(0, qty * unitPrice - discount))}
                  </strong>
                </div>

                <Button type="submit" size="sm" disabled={isPending}>
                  + Create Quotation Draft
                </Button>
              </form>

              {/* Existing Quotations List */}
              {lead.quotations && lead.quotations.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-200 space-y-2">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Quotation History ({lead.quotations.length})
                  </p>
                  {lead.quotations.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 text-sm hover:bg-slate-50"
                    >
                      <div>
                        <span className="font-semibold">Rev #{q.revision}</span> •{' '}
                        <span className="font-bold text-slate-900">
                          {formatCurrency(q.grandTotal, q.currency)}
                        </span>
                        <div className="mt-0.5">
                          <StatusBadge status={q.status} />
                        </div>
                      </div>
                      <Link href={`/dashboard/quotations/${q.id}`}>
                        <Button variant="outline" size="sm">
                          Open / PDF →
                        </Button>
                      </Link>
                    </div>
                  ))}
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
              <CardTitle className="text-base">
                📝 Staff Consultation Notes ({lead.notes?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddNote} className="flex gap-2">
                <Input
                  placeholder="Add internal consultation note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                <Button type="submit" size="sm" disabled={isPending}>
                  Add Note
                </Button>
              </form>

              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {lead.notes?.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg bg-slate-50 p-3 text-sm border border-slate-100"
                  >
                    <p className="text-slate-800">{note.content}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {note.actor?.name || 'Staff'} • {formatDate(note.createdAt)}
                    </p>
                  </div>
                ))}
                {(!lead.notes || lead.notes.length === 0) && (
                  <p className="text-xs text-slate-400">No notes recorded yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                ⏰ Manual Follow-Up Reminders ({lead.followUpTasks?.length || 0})
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
                <Button type="submit" size="sm" disabled={isPending}>
                  Schedule Task
                </Button>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {lead.followUpTasks?.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{task.note}</p>
                      <p className="text-xs text-slate-500">
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
                  <p className="text-xs text-slate-400">
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
