'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Country, CountryCoverageStatus } from '@/types/api';
import { createCountryAction, updateCountryAction } from '@/services/visa/visa.service';

interface CountryFormProps {
  initialData?: Country;
}

export default function CountryForm({ initialData }: CountryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    isoCode: initialData?.isoCode || '',
    slug: initialData?.slug || '',
    flagEmoji: initialData?.flagEmoji || '',
    shortIntro: initialData?.shortIntro || '',
    detailedDescription: initialData?.detailedDescription || '',
    coverageStatus: (initialData?.coverageStatus || 'ACTIVE') as CountryCoverageStatus,
    isFeatured: initialData?.isFeatured ?? false,
    displayOrder: initialData?.displayOrder ?? 0,
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
  });

  const handleNameChange = (name: string) => {
    const autoSlug = !initialData
      ? name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
      : formData.slug;
    setFormData((prev) => ({ ...prev, name, slug: autoSlug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      isoCode: formData.isoCode.toUpperCase(),
      displayOrder: Number(formData.displayOrder) || 0,
    };

    const res = initialData
      ? await updateCountryAction(initialData.id, payload)
      : await createCountryAction(payload);

    setLoading(false);

    if (!res.success) {
      setError(res.message || 'Failed to save country');
      return;
    }

    router.push('/dashboard/visa-immigration/countries');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Country Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g., Example Destination A"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            ISO Country Code (2-3 chars) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            minLength={2}
            maxLength={3}
            value={formData.isoCode}
            onChange={(e) => setFormData({ ...formData, isoCode: e.target.value.toUpperCase() })}
            placeholder="e.g., EXA"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            URL Slug <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
            placeholder="example-destination-a"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Flag Emoji / Icon</label>
          <input
            type="text"
            value={formData.flagEmoji}
            onChange={(e) => setFormData({ ...formData, flagEmoji: e.target.value })}
            placeholder="🌐"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Agency Coverage Status
          </label>
          <select
            value={formData.coverageStatus}
            onChange={(e) =>
              setFormData({
                ...formData,
                coverageStatus: e.target.value as CountryCoverageStatus,
              })
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          >
            <option value="ACTIVE">ACTIVE (Agency Actively Offers Services)</option>
            <option value="LIMITED">LIMITED (Selected Categories Only)</option>
            <option value="PAUSED">PAUSED (Temporarily Not Accepting)</option>
            <option value="ARCHIVED">ARCHIVED (Hidden from Public Site)</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Display Order</label>
          <input
            type="number"
            min={0}
            value={formData.displayOrder}
            onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isFeatured"
          type="checkbox"
          checked={formData.isFeatured}
          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
          className="h-4 w-4 rounded border-slate-300 text-blue-600"
        />
        <label htmlFor="isFeatured" className="text-sm font-medium text-slate-700">
          Feature this destination country on the public Visa & Immigration landing page
        </label>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Short Introduction</label>
        <input
          type="text"
          maxLength={500}
          value={formData.shortIntro}
          onChange={(e) => setFormData({ ...formData, shortIntro: e.target.value })}
          placeholder="Concise summary of the agency's visa assistance for this country..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Detailed Country & Service Overview
        </label>
        <textarea
          rows={4}
          value={formData.detailedDescription}
          onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
          placeholder="Provide transparent information about agency consultancy scope, documentation support, and embassy submission norms..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
        />
      </div>

      <div className="border-t pt-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">SEO Metadata (Optional)</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">SEO Title</label>
            <input
              type="text"
              maxLength={160}
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">SEO Description</label>
            <input
              type="text"
              maxLength={320}
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : initialData ? 'Update Country' : 'Create Country'}
        </button>
      </div>
    </form>
  );
}
