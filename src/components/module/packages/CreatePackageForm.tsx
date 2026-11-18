'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPackage } from '@/services/packages/packages.service';
import { ServiceCategory } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CreatePackageForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);

    const inclusions = String(formData.get('inclusions') || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const exclusions = String(formData.get('exclusions') || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await createPackage({
        category: (formData.get('category') as ServiceCategory) || 'TOUR',
        title: String(formData.get('title') || ''),
        destination: String(formData.get('destination') || ''),
        durationDays: Number(formData.get('durationDays')) || 3,
        basePrice: Number(formData.get('basePrice')) || 0,
        currency: String(formData.get('currency') || 'BDT'),
        description: String(formData.get('description') || ''),
        inclusions,
        exclusions,
        notes: String(formData.get('notes') || '') || undefined,
      });

      if (!res.success) {
        setError(res.message);
        return;
      }

      router.push('/dashboard/packages');
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Verified Tour Package to Catalog</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="category">Package Category *</Label>
              <select
                id="category"
                name="category"
                className="flex h-10 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/15"
                defaultValue="TOUR"
              >
                <option value="TOUR">Holiday Tour Package</option>
                <option value="HAJJ_UMRAH">Hajj & Umrah Package</option>
              </select>
              <p className="mt-1.5 text-[11px] text-stone-500">
                For Student Visa or Work Permits,{' '}
                <Link
                  href="/dashboard/visa-immigration/services/create"
                  className="font-semibold text-teal-700 hover:underline"
                >
                  create a Visa Service instead →
                </Link>
              </p>
            </div>
            <div>
              <Label htmlFor="title">Package / Program Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Cox's Bazar 3D/2N Luxury Beach Escape"
                required
              />
            </div>
            <div>
              <Label htmlFor="destination">Destination *</Label>
              <Input
                id="destination"
                name="destination"
                placeholder="e.g., Cox's Bazar"
                required
              />
            </div>
            <div>
              <Label htmlFor="durationDays">Duration (Days) *</Label>
              <Input
                id="durationDays"
                name="durationDays"
                type="number"
                min={1}
                defaultValue={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="basePrice">Indicative Base Price (Per Person) *</Label>
              <Input
                id="basePrice"
                name="basePrice"
                type="number"
                min={0}
                placeholder="e.g., 12500"
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                name="currency"
                defaultValue="BDT"
                className="flex h-10 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/15"
              >
                <option value="BDT">BDT (৳)</option>
                <option value="USD">USD ($)</option>
                <option value="SAR">SAR (﷼)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Package Overview & Itinerary *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Detailed overview of itinerary, hotel category, and transport..."
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="inclusions">Inclusions (One per line)</Label>
              <Textarea
                id="inclusions"
                name="inclusions"
                placeholder={'AC Bus / Flight\n3-Star Beach View Hotel\nDaily Buffet Breakfast'}
              />
            </div>
            <div>
              <Label htmlFor="exclusions">Exclusions (One per line)</Label>
              <Textarea
                id="exclusions"
                name="exclusions"
                placeholder={'Personal expenses\nLunch & Dinner\nEntry tickets'}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Link href="/dashboard/packages">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="secondary" disabled={isPending}>
              {isPending ? 'Publishing...' : '✓ Publish Approved Package'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
