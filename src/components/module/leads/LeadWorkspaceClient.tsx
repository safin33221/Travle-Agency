'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  addLeadNote,
  createFollowUpTask,
  updateFollowUpTaskStatus,
  updateLeadStage,
} from '@/services/leads/leads.service';
import { generateAiDraft } from '@/services/ai/ai.service';
import { createQuotation } from '@/services/quotations/quotations.service';
import { Lead, LeadStage, TourPackage } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label, Textarea } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';

const STAGES: LeadStage[] = [
  'NEW',
  'QUALIFIED',
  'QUOTED',
  'FOLLOW_UP',
  'WON',
  'LOST',
];

export function LeadWorkspaceClient({
  lead,
  packages,
}: {
  lead: Lead;
  packages: TourPackage[];
}) {
  const [isPending, startTransition] = useTransition();
  const [noteText, setNoteText] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');

  // AI Draft state
  const [aiInquiry, setAiInquiry] = useState(
    lead.requirements ||
      `Customer ${lead.customerName} is asking for ${lead.destination || 'a tour package'} for ${lead.travelerCount || 2} travelers.`,
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
    packages[0]?.title || `${lead.destination || 'Tour'} Package`,
  );
  const [qty, setQty] = useState<number>(lead.travelerCount || 2);
  const [unitPrice, setUnitPrice] = useState<number>(
    Number(packages[0]?.basePrice || 15000),
  );
  const [discount, setDiscount] = useState<number>(0);

  const handleStageChange = (stage: LeadStage) => {
    startTransition(async () => {
      await updateLeadStage(lead.id, stage);
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    startTransition(async () => {
      await addLeadNote(lead.id, noteText.trim());
      setNoteText('');
    });
  };

  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpDate || !followUpNote.trim()) return;
    startTransition(async () => {
      await createFollowUpTask(lead.id, {
        dueAt: new Date(followUpDate).toISOString(),
        note: followUpNote.trim(),
      });
      setFollowUpDate('');
      setFollowUpNote('');
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
      await createQuotation(lead.id, {
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
    });
  };

  return (
    <div className="space-y-6">
      {/* Stage Pipeline Bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">
              Current Pipeline Stage
            </p>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={lead.stage} />
              <span className="text-xs text-slate-500">
                Source: {lead.source} • Assigned to:{' '}
                {lead.assignedTo?.name || 'Unassigned'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {STAGES.map((st) => (
              <Button
                key={st}
                size="sm"
                variant={lead.stage === st ? 'secondary' : 'outline'}
                disabled={isPending}
                onClick={() => handleStageChange(st)}
              >
                {st}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* AI Copilot Panel */}
        <Card className="border-sky-200">
          <CardHeader className="bg-sky-50/60 border-b border-sky-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-sky-950">
                ✨ AI Response Copilot (Grounded in Approved Catalog)
              </CardTitle>
              <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                AI Draft — Review Required
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Label>Customer Inquiry Context</Label>
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

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isPending}
              onClick={handleGenerateAi}
            >
              {isPending ? 'Generating AI Draft...' : 'Generate Grounded Reply Draft'}
            </Button>

            {latestDraft && (
              <div className="space-y-2 pt-2">
                <Label>Editable Staff Review Draft</Label>
                <Textarea
                  value={latestDraft}
                  onChange={(e) => setLatestDraft(e.target.value)}
                  className="min-h-[140px] bg-slate-50"
                />
                <p className="text-xs text-amber-700">
                  ⚠️ AI never sends messages autonomously. Review prices and dates before copying to WhatsApp/Messenger.
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
                      {p.title} — {formatCurrency(p.basePrice, p.currency)}
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
                  <Label>Travelers / Qty</Label>
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
                Create Quotation Draft
              </Button>
            </form>

            {/* Existing Quotations List */}
            {lead.quotations && lead.quotations.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200 space-y-2">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Quotation History
                </p>
                {lead.quotations.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 text-sm"
                  >
                    <div>
                      <span className="font-semibold">Rev #{q.revision}</span> •{' '}
                      <span>{formatCurrency(q.grandTotal, q.currency)}</span>
                      <div className="mt-0.5">
                        <StatusBadge status={q.status} />
                      </div>
                    </div>
                    <Link href={`/dashboard/quotations/${q.id}`}>
                      <Button variant="outline" size="sm">
                        Open / PDF
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes & Manual Follow-Up Tasks */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Staff Consultation Notes</CardTitle>
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
              Manual Follow-Up Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddFollowUp} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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
                            await updateFollowUpTaskStatus(
                              task.id,
                              'DONE',
                              lead.id,
                            );
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
    </div>
  );
}
