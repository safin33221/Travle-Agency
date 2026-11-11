'use client';

import { useState, useTransition } from 'react';
import { generateAiDraft } from '@/services/ai/ai.service';
import { AiDraft, AiDraftType } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label, Textarea } from '@/components/ui/input';

export function AiCopilotClient() {
  const [isPending, startTransition] = useTransition();
  const [inquiry, setInquiry] = useState(
    'ভাইয়া, আমরা ৪ জন কক্সবাজার যেতে চাই আগামী মাসে ৩ দিনের জন্য। আপনাদের প্যাকেজ আর খরচ কত পরবে?',
  );
  const [language, setLanguage] = useState<'en' | 'bn' | 'banglish'>('bn');
  const [draftType, setDraftType] = useState<AiDraftType>('CUSTOMER_REPLY');
  const [draftResult, setDraftResult] = useState<AiDraft | null>(null);
  const [editableText, setEditableText] = useState('');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await generateAiDraft({
        customerInquiry: inquiry,
        language,
        type: draftType,
      });
      if (res.data) {
        setDraftResult(res.data);
        setEditableText(res.data.suggestedText);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Customer Inquiry Input</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <Label>Paste Customer Message (Bangla, English, or Banglish)</Label>
              <Textarea
                value={inquiry}
                onChange={(e) => setInquiry(e.target.value)}
                className="min-h-[140px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Output Language</Label>
                <select
                  value={language}
                  onChange={(e) =>
                    setLanguage(e.target.value as 'en' | 'bn' | 'banglish')
                  }
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="bn">Bangla (বাংলা)</option>
                  <option value="en">English</option>
                  <option value="banglish">Banglish</option>
                </select>
              </div>
              <div>
                <Label>Draft Purpose</Label>
                <select
                  value={draftType}
                  onChange={(e) => setDraftType(e.target.value as AiDraftType)}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="CUSTOMER_REPLY">Customer Reply Draft</option>
                  <option value="QUALIFICATION_QUESTIONS">
                    Qualification Questions
                  </option>
                  <option value="QUOTATION_EXPLANATION">
                    Quotation Explanation
                  </option>
                </select>
              </div>
            </div>

            <Button type="submit" variant="secondary" disabled={isPending}>
              {isPending ? 'Generating Grounded Draft...' : '✨ Generate AI Draft'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-amber-200">
        <CardHeader className="bg-amber-50/70 border-b border-amber-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-amber-950">
              Staff Review Workspace
            </CardTitle>
            <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              AI Draft — Human Review Required
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {draftResult ? (
            <>
              {Array.isArray(draftResult.missingInformation) &&
                draftResult.missingInformation.length > 0 && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                    <strong>Missing Travel Details Flagged by AI:</strong>{' '}
                    {(draftResult.missingInformation || []).join(', ')}
                  </div>
                )}

              <div>
                <Label>Editable Response Text</Label>
                <Textarea
                  value={editableText}
                  onChange={(e) => setEditableText(e.target.value)}
                  className="min-h-[180px]"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Model: {draftResult.modelUsed}</span>
                <span>
                  Grounded Packages: {draftResult.sourcePackageIds?.length || 0}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 py-12 text-center">
              Submit a customer inquiry on the left to generate a grounded draft reply.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
