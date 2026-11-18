'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  addLeadNote,
  createFollowUpTask,
  updateFollowUpTaskStatus,
  updateLeadChecklists,
  updateLeadStage,
} from '@/services/leads/leads.service';
import {
  approveQuotation,
  createQuotation,
} from '@/services/quotations/quotations.service';
import {
  DocumentItemStatus,
  Lead,
  LeadDocumentChecklistItem,
  LeadMilestoneItem,
  LeadStage,
  MilestoneItemStatus,
  StaffRole,
  TourPackage,
  VisaService,
} from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useBrand } from '@/components/providers/BrandProvider';
import { isPackageCategory, SECTOR_CATALOG } from '@/config/brand.config';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  AlertTriangle,
  Calendar,
  Check,
  ClipboardCheck,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Layers,
  Lock,
  MapPin,
  MessageSquare,
  Phone,
  Rocket,
  StickyNote,
  Unlock,
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
  userRole = 'SALES_AGENT',
}: {
  lead: Lead;
  packages: TourPackage[];
  visaServices?: VisaService[];
  userRole?: StaffRole;
}) {
  const router = useRouter();
  const brand = useBrand();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'CHECKLISTS' | 'QUOTATIONS' | 'NOTES'
  >('CHECKLISTS');
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
  const isOwner = userRole === 'OWNER_ADMIN';
  const isTourOrHajjLead = isPackageCategory(lead.category);
  const defaultPkg = isTourOrHajjLead ? packages[0] : undefined;
  const [selectedCatalogKey, setSelectedCatalogKey] = useState<string>(
    defaultPkg ? `pkg:${defaultPkg.id}` : '',
  );
  const [selectedPkgId, setSelectedPkgId] = useState<string>(
    defaultPkg?.id || '',
  );
  const [allowCustomOverride, setAllowCustomOverride] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [itemLabel, setItemLabel] = useState<string>(
    defaultPkg?.title ||
      (isTourOrHajjLead
        ? `${lead.destination || 'Tour'} Package`
        : `${lead.destination || 'Visa'} Consultancy & Processing`),
  );
  const [qty, setQty] = useState<number>(lead.travelerCount || 1);
  const [unitPrice, setUnitPrice] = useState<number>(
    Number(defaultPkg?.basePrice || 20000),
  );
  const [discount, setDiscount] = useState<number>(0);

  // Deterministic pricing guardrails (mirrors server calculation)
  const hasCatalogPrice =
    selectedCatalogKey.startsWith('pkg:') ||
    (selectedCatalogKey.startsWith('visa:') &&
      Boolean(
        visaServices.find((v) => v.id === selectedCatalogKey.slice(5))
          ?.agencyServiceFee,
      ));
  const isPriceLocked = hasCatalogPrice && !allowCustomOverride;

  const safeQty = Math.max(1, Math.floor(qty || 1));
  const safeUnitPrice = Math.max(0, Number(unitPrice) || 0);
  const rawSubtotal = safeQty * safeUnitPrice;
  const isDiscountTooHigh = (Number(discount) || 0) > rawSubtotal;
  const clampedDiscount = Math.max(
    0,
    Math.min(Number(discount) || 0, rawSubtotal),
  );
  const netSubtotal = Math.max(0, rawSubtotal - clampedDiscount);
  const taxRate = Number(brand.taxRate || 0);
  const estimatedTax = Math.round((netSubtotal * taxRate) / 100);
  const estimatedGrandTotal = netSubtotal + estimatedTax;
  const leadBudgetNum = lead.budget ? Number(lead.budget) : 0;
  const exceedsBudget =
    leadBudgetNum > 0 && estimatedGrandTotal > leadBudgetNum;

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

  const handlePackageSelect = (catalogKey: string) => {
    setSelectedCatalogKey(catalogKey);
    setAllowCustomOverride(false);
    setQuoteError(null);
    setDiscount(0);

    if (catalogKey.startsWith('pkg:')) {
      const id = catalogKey.slice(4);
      const found = packages.find((p) => p.id === id);
      if (found) {
        setSelectedPkgId(found.id);
        setItemLabel(`${found.title} (${found.destination})`);
        setUnitPrice(Number(found.basePrice));
      }
      return;
    }

    setSelectedPkgId('');
    if (catalogKey.startsWith('visa:')) {
      const id = catalogKey.slice(5);
      const foundVisa = visaServices.find((v) => v.id === id);
      if (foundVisa) {
        setItemLabel(
          `${foundVisa.title}${foundVisa.country?.name ? ` (${foundVisa.country.name})` : ''}`,
        );
        setUnitPrice(Number(foundVisa.agencyServiceFee || 0));
      }
    }
  };

  const submitQuotation = (approveImmediately = false) => {
    setQuoteError(null);

    if (!itemLabel.trim()) {
      setQuoteError('Please provide a line item description.');
      return;
    }
    if (safeUnitPrice <= 0) {
      setQuoteError('Unit price must be greater than 0.');
      return;
    }
    if (isDiscountTooHigh) {
      setQuoteError('Discount cannot be greater than the subtotal.');
      return;
    }

    startTransition(async () => {
      const res = await createQuotation(lead.id, {
        items: [
          {
            packageId: selectedPkgId || undefined,
            label: itemLabel.trim(),
            quantity: safeQty,
            unitPrice: safeUnitPrice,
          },
        ],
        discount: clampedDiscount,
      });

      if (!res.success || !res.data) {
        setQuoteError(res.message || 'Could not create quotation.');
        return;
      }

      if (approveImmediately && isOwner && res.data.id) {
        const approveRes = await approveQuotation(res.data.id, lead.id);
        if (approveRes.success) {
          showToast('Quotation created, approved, and ready for PDF download');
        } else {
          showToast('Draft created, but auto-approval failed — review below');
        }
      } else {
        showToast('Quotation draft created & added to history');
      }

      router.refresh();
    });
  };

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuotation(false);
  };

  const handleInlineApprove = (quotationId: string) => {
    startTransition(async () => {
      const res = await approveQuotation(quotationId, lead.id);
      if (res.success) {
        showToast('Quotation approved and ready for PDF export');
        router.refresh();
      } else {
        setQuoteError(res.message || 'Unable to approve quotation.');
      }
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

      {/* Top Applicant Summary & Pipeline Control Bar */}
      <Card className="p-5 space-y-4 border-stone-200/90">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${sectorMeta.badgeColor}`}
              >
                {sectorMeta.label}
              </span>
              <StatusBadge status={lead.stage} />
              {lead.eligibilityStatus && (
                <span className="rounded-full border border-stone-200 bg-[#FAF9F6] px-2.5 py-0.5 text-xs font-semibold text-stone-700">
                  {String(lead.eligibilityStatus).replace(/_/g, ' ')}
                </span>
              )}
              {lead.trackingCode && (
                <span className="rounded-lg border border-stone-200 bg-[#FAF9F6] px-2 py-0.5 font-mono text-xs font-bold text-teal-800">
                  #{lead.trackingCode}
                </span>
              )}
            </div>

            {/* Single-line Key Facts (Zero duplication) */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-stone-400" />
                <strong className="text-slate-900">{lead.destination || 'TBD'}</strong>
              </span>
              <span className="inline-flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5 text-stone-400" />
                Budget <strong className="text-slate-900 tabular-nums">{formatCurrency(lead.budget)}</strong>
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-stone-400" />
                <strong className="text-slate-900">{lead.travelerCount || 1} Pax</strong>
              </span>
              {lead.travelStartDate && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-stone-400" />
                  <strong className="text-slate-900">{formatDate(lead.travelStartDate)}</strong>
                </span>
              )}
              <span>
                Counselor: <strong className="text-slate-800">{lead.assignedTo?.name || 'Unassigned'}</strong>
              </span>
            </div>

            {lead.requirements && (
              <p className="border-l-2 border-teal-600 pl-3 text-xs text-stone-600 max-w-2xl">
                {lead.requirements}
              </p>
            )}
          </div>

          {/* Clean Inline Action Bar (No nested boxes) */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {lead.customerPhone && (
              <>
                <a
                  href={`tel:${lead.customerPhone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-stone-50 transition"
                >
                  <Phone className="h-3.5 w-3.5 text-stone-500" />
                  {lead.customerPhone}
                </a>
                <a
                  href={`https://wa.me/${lead.customerPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/70 px-3 py-1.5 text-xs font-semibold text-teal-900 hover:bg-teal-100 transition"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-teal-700" />
                  WhatsApp
                </a>
              </>
            )}

            {lead.trackingCode && (
              <>
                <button
                  type="button"
                  onClick={handleCopyTrackerLink}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-stone-50 transition"
                >
                  {copiedTracker ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-teal-700" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-stone-500" />
                      Copy Tracker
                    </>
                  )}
                </button>
                <Link
                  href={`/track-status?code=${lead.trackingCode}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Live Tracker
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Sleek Segmented Pipeline Stage Stepper */}
        <div className="pt-3 border-t border-stone-100">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-1 rounded-xl border border-stone-200 bg-[#FAF9F6] p-1">
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
                  className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${
                    isCurrent
                      ? st === 'LOST'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-teal-700 text-white shadow-2xs'
                      : isPassed
                        ? 'bg-white text-teal-800 hover:bg-teal-50'
                        : 'text-stone-500 hover:bg-white/70 hover:text-slate-800'
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

      {/* Focused Workspace Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            {
              id: 'CHECKLISTS',
              label: `Milestones & Docs (${doneMilestones}/${milestones.length} • ${verifiedDocs + receivedDocs}/${docs.length})`,
              Icon: ClipboardCheck,
            },
            {
              id: 'QUOTATIONS',
              label: `Quotations (${lead.quotations?.length || 0})`,
              Icon: FileText,
            },
            {
              id: 'NOTES',
              label: `Notes & Reminders (${(lead.notes?.length || 0) + (lead.followUpTasks?.length || 0)})`,
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
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
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

        <button
          type="button"
          onClick={() =>
            setActiveTab(activeTab === 'ALL' ? 'CHECKLISTS' : 'ALL')
          }
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            activeTab === 'ALL'
              ? 'bg-teal-50 border border-teal-200 text-teal-800'
              : 'text-stone-500 hover:text-slate-800'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          {activeTab === 'ALL' ? 'Showing All Panels' : 'View All Panels'}
        </button>
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
                      {doneMilestones} of {milestones.length} completed ({milestonePct}%)
                    </p>
                  </div>
                  <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-bold text-teal-800 tabular-nums">
                    {milestonePct}%
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-teal-700 transition-all"
                    style={{ width: `${milestonePct}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {milestones.map((m, idx) => (
                  <div
                    key={m.key || idx}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-xs transition-all ${
                      m.status === 'DONE'
                        ? 'border-teal-200/80 bg-teal-50/40'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggleMilestoneStatus(idx)}
                      className="flex items-center gap-2.5 text-left font-medium text-slate-900 hover:text-teal-700"
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
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

                    {/* Quiet Segmented Selector */}
                    <div className="inline-flex items-center rounded-lg border border-stone-200 bg-[#FAF9F6] p-0.5 self-end sm:self-center shrink-0">
                      {MILESTONE_STATUS_CYCLE.map((st) => {
                        const active = m.status === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            disabled={isPending}
                            onClick={() => handleSetMilestoneStatus(idx, st)}
                            className={`rounded-md px-2 py-1 text-[10px] font-semibold transition ${
                              active
                                ? st === 'DONE'
                                  ? 'bg-teal-700 text-white shadow-2xs'
                                  : st === 'IN_PROGRESS'
                                    ? 'bg-slate-900 text-white shadow-2xs'
                                    : 'bg-white text-slate-800 shadow-2xs'
                                : 'text-stone-400 hover:text-slate-700'
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
                      Document Checklist
                    </CardTitle>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {verifiedDocs} verified, {receivedDocs} received of {docs.length} docs
                    </p>
                  </div>
                  <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-bold text-teal-800 tabular-nums">
                    {docPct}%
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-teal-700 transition-all"
                    style={{ width: `${docPct}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {docs.map((doc, idx) => (
                  <div
                    key={doc.key || idx}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-xs transition ${
                      doc.status === 'VERIFIED'
                        ? 'border-teal-200/80 bg-teal-50/40'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggleDocStatus(idx)}
                      className="font-medium text-slate-800 text-left hover:text-teal-700"
                    >
                      {idx + 1}. {doc.title || `Document ${idx + 1}`}
                    </button>

                    {/* Quiet Segmented Selector */}
                    <div className="inline-flex items-center rounded-lg border border-stone-200 bg-[#FAF9F6] p-0.5 self-end sm:self-center shrink-0">
                      {DOC_STATUS_CYCLE.map((st) => {
                        const active = doc.status === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            disabled={isPending}
                            onClick={() => handleSetDocStatus(idx, st)}
                            className={`rounded-md px-2 py-1 text-[10px] font-semibold transition ${
                              active
                                ? st === 'VERIFIED'
                                  ? 'bg-teal-700 text-white shadow-2xs'
                                  : st === 'RECEIVED'
                                    ? 'bg-slate-800 text-white shadow-2xs'
                                    : st === 'REJECTED'
                                      ? 'bg-rose-600 text-white shadow-2xs'
                                      : 'bg-white text-slate-800 shadow-2xs'
                                : 'text-stone-400 hover:text-slate-700'
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
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-teal-700" />
                  Quick Quotation Builder
                </CardTitle>
                {hasCatalogPrice && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800">
                    <Lock className="h-3 w-3" />
                    Catalog Rate
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateQuotation} className="space-y-3.5">
                <div>
                  <Label>1. Choose Package / Visa Service (or Custom)</Label>
                  <select
                    value={selectedCatalogKey}
                    onChange={(e) => handlePackageSelect(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/15"
                  >
                    <option value="">-- Custom Line Item (Manual Rate) --</option>
                    {packages.length > 0 && (
                      <optgroup label="Tour & Hajj Packages">
                        {packages.map((p) => (
                          <option key={p.id} value={`pkg:${p.id}`}>
                            [{p.category === 'HAJJ_UMRAH' ? 'HAJJ & UMRAH' : 'TOUR'}] {p.title} —{' '}
                            {formatCurrency(p.basePrice, p.currency)}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {visaServices.length > 0 && (
                      <optgroup label="Visa & Immigration Services">
                        {visaServices.map((svc) => (
                          <option key={svc.id} value={`visa:${svc.id}`}>
                            [{svc.country?.name || 'VISA'}] {svc.title} —{' '}
                            {svc.agencyServiceFee
                              ? formatCurrency(svc.agencyServiceFee, svc.currency)
                              : 'Fee TBD'}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                <div>
                  <Label>2. Line Item Description *</Label>
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
                      max={100}
                      value={qty}
                      onChange={(e) =>
                        setQty(Math.max(1, Number(e.target.value) || 1))
                      }
                      required
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="mb-0">
                        Unit Price ({brand.defaultCurrency})
                      </Label>
                      {hasCatalogPrice && isOwner && (
                        <button
                          type="button"
                          onClick={() =>
                            setAllowCustomOverride((prev) => !prev)
                          }
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-700 hover:underline"
                        >
                          {allowCustomOverride ? (
                            <>
                              <Lock className="h-2.5 w-2.5" /> Lock
                            </>
                          ) : (
                            <>
                              <Unlock className="h-2.5 w-2.5" /> Edit
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <Input
                      type="number"
                      min={0}
                      value={unitPrice}
                      readOnly={isPriceLocked}
                      onChange={(e) =>
                        setUnitPrice(Math.max(0, Number(e.target.value) || 0))
                      }
                      className={
                        isPriceLocked
                          ? 'bg-[#FAF9F6] text-stone-700 cursor-not-allowed'
                          : ''
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Discount ({brand.defaultCurrency})</Label>
                    <Input
                      type="number"
                      min={0}
                      max={rawSubtotal}
                      value={discount}
                      onChange={(e) =>
                        setDiscount(Math.max(0, Number(e.target.value) || 0))
                      }
                    />
                  </div>
                </div>

                {/* Live Server-Matched Summary Box */}
                <div className="rounded-xl bg-[#FAF9F6] border border-stone-200/80 p-3.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-stone-600">
                    <span>
                      Subtotal ({safeQty} × {formatCurrency(safeUnitPrice, brand.defaultCurrency)})
                    </span>
                    <span className="tabular-nums font-medium">
                      {formatCurrency(rawSubtotal, brand.defaultCurrency)}
                    </span>
                  </div>
                  {clampedDiscount > 0 && (
                    <div className="flex items-center justify-between text-teal-800">
                      <span>Discount Applied</span>
                      <span className="tabular-nums font-medium">
                        - {formatCurrency(clampedDiscount, brand.defaultCurrency)}
                      </span>
                    </div>
                  )}
                  {taxRate > 0 && (
                    <div className="flex items-center justify-between text-stone-600">
                      <span>Tax / VAT ({taxRate}%)</span>
                      <span className="tabular-nums font-medium">
                        + {formatCurrency(estimatedTax, brand.defaultCurrency)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-stone-200 pt-2 text-sm">
                    <span className="font-semibold text-slate-800">
                      Final Total (Matches PDF)
                    </span>
                    <strong className="text-slate-900 tabular-nums">
                      {formatCurrency(estimatedGrandTotal, brand.defaultCurrency)}
                    </strong>
                  </div>
                </div>

                {/* Over-Budget Guardrail Warning */}
                {exceedsBudget && (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-900">
                    <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      Quote total ({formatCurrency(estimatedGrandTotal, brand.defaultCurrency)}) exceeds customer budget ({formatCurrency(leadBudgetNum, brand.defaultCurrency)}) by{' '}
                      <strong>
                        {formatCurrency(estimatedGrandTotal - leadBudgetNum, brand.defaultCurrency)}
                      </strong>.
                    </span>
                  </div>
                )}

                {/* Validation Guardrail */}
                {(quoteError || isDiscountTooHigh) && (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                    {quoteError ||
                      `Discount cannot exceed subtotal (${formatCurrency(rawSubtotal, brand.defaultCurrency)}).`}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {isOwner ? (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isPending || isDiscountTooHigh}
                        onClick={() => submitQuotation(true)}
                      >
                        {isPending ? 'Processing...' : 'Create & Approve (Ready for PDF)'}
                      </Button>
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        disabled={isPending || isDiscountTooHigh}
                      >
                        Save as Draft
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      disabled={isPending || isDiscountTooHigh}
                    >
                      {isPending ? 'Creating...' : '+ Submit Draft for Owner Approval'}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Existing Quotations List with 1-Click Actions */}
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
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-stone-200 p-3.5 text-sm hover:bg-[#FAF9F6]"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          Rev #{q.revision}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {formatCurrency(q.grandTotal, q.currency)}
                        </span>
                        <StatusBadge status={q.status} />
                      </div>
                      <p className="mt-1 text-xs text-stone-600 truncate">
                        {q.items?.[0]?.label || 'Custom Quote'} •{' '}
                        {formatDate(q.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {q.status === 'DRAFT' && isOwner && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={isPending}
                          onClick={() => handleInlineApprove(q.id)}
                          className="gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                      )}
                      {q.status === 'APPROVED' && (
                        <a
                          href={`/api/quotations/${q.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="secondary" className="gap-1">
                            <Download className="h-3.5 w-3.5" />
                            PDF
                          </Button>
                        </a>
                      )}
                      <Link href={`/dashboard/quotations/${q.id}`}>
                        <Button variant="outline" size="sm">
                          View →
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-stone-200 p-8 text-center text-xs text-stone-500">
                  No quotations issued for this customer yet. Create a quotation on the left to generate an official price proposal.
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
