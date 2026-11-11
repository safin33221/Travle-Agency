'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createLead } from '@/services/leads/leads.service';
import { LeadSource, ServiceCategory } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CreateLeadForm({ redirectPath = '/dashboard/leads' }: { redirectPath?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createLead({
        category: (formData.get('category') as ServiceCategory) || 'TOUR',
        customerName: String(formData.get('customerName') || ''),
        customerPhone: String(formData.get('customerPhone') || '') || undefined,
        customerEmail: String(formData.get('customerEmail') || '') || undefined,
        source: (formData.get('source') as LeadSource) || 'PHONE',
        destination: String(formData.get('destination') || '') || undefined,
        travelerCount: Number(formData.get('travelerCount')) || undefined,
        budget: Number(formData.get('budget')) || undefined,
        travelStartDate: String(formData.get('travelStartDate') || '') || undefined,
        requirements: String(formData.get('requirements') || '') || undefined,
      });

      if (!res.success) {
        setError(res.message);
        return;
      }

      setSuccessMsg('Inquiry captured successfully!');
      if (res.data?.id && redirectPath.startsWith('/dashboard')) {
        router.push(`/dashboard/leads/${res.data.id}`);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Customer Travel Inquiry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="category">Service Sector *</Label>
              <select
                id="category"
                name="category"
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                defaultValue="WORK_PERMIT"
              >
                <option value="WORK_PERMIT">Work Permit & Job Visa</option>
                <option value="STUDENT_VISA">Study Abroad & Student Visa</option>
                <option value="HAJJ_UMRAH">Hajj & Umrah Package</option>
                <option value="TOUR">Holiday Tour & Tourist Visa</option>
              </select>
            </div>
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                name="customerName"
                placeholder="e.g., Tanvir Ahmed"
                required
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone / WhatsApp</Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                placeholder="+88017XXXXXXXX"
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Email Address</Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                placeholder="customer@example.com"
              />
            </div>
            <div>
              <Label htmlFor="source">Inquiry Source</Label>
              <select
                id="source"
                name="source"
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                defaultValue="WHATSAPP"
              >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="PHONE">Phone Call</option>
                <option value="MESSENGER">Facebook Messenger</option>
                <option value="WEBSITE">Website</option>
                <option value="WALK_IN">Walk-In</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="destination">Preferred Destination</Label>
              <Input
                id="destination"
                name="destination"
                placeholder="e.g., Cox's Bazar / Sylhet / Nepal"
              />
            </div>
            <div>
              <Label htmlFor="travelStartDate">Preferred Travel Date</Label>
              <Input id="travelStartDate" name="travelStartDate" type="date" />
            </div>
            <div>
              <Label htmlFor="travelerCount">Traveler Count</Label>
              <Input
                id="travelerCount"
                name="travelerCount"
                type="number"
                min={1}
                defaultValue={2}
              />
            </div>
            <div>
              <Label htmlFor="budget">Estimated Budget (BDT)</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                min={0}
                placeholder="e.g., 45000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="requirements">
              Customer Message / Special Requirements (Bangla, English, or Banglish)
            </Label>
            <Textarea
              id="requirements"
              name="requirements"
              placeholder="Paste customer's inquiry or notes here..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="submit" variant="secondary" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Inquiry Lead'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
