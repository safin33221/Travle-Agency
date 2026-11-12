'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AgencyServiceStatus,
  Country,
  VisaCategory,
  VisaPublicationStatus,
  VisaService,
} from '@/types/api';
import { createVisaServiceAction, updateVisaServiceAction } from '@/services/visa/visa.service';

interface VisaServiceFormProps {
  countries: Country[];
  initialData?: VisaService;
}

interface RequirementDraft {
  title: string;
  description: string;
  isMandatory: boolean;
}

export default function VisaServiceForm({ countries, initialData }: VisaServiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    countryId: initialData?.countryId || countries[0]?.id || '',
    category: (initialData?.category || 'STUDENT_VISA') as VisaCategory,
    customCategoryLabel: initialData?.customCategoryLabel || '',
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    shortDescription: initialData?.shortDescription || '',
    fullDescription: initialData?.fullDescription || '',
    eligibilityInfo: initialData?.eligibilityInfo || '',
    estimatedProcessingTime: initialData?.estimatedProcessingTime || '',
    agencyServiceFee: initialData?.agencyServiceFee ? String(initialData.agencyServiceFee) : '',
    governmentFeeInfo: initialData?.governmentFeeInfo || '',
    currency: initialData?.currency || 'BDT',
    disclaimer:
      initialData?.disclaimer ||
      'Visa issuance and work/study permit decisions are at the sole discretion of the respective embassy or immigration authority. Agency consultancy does not guarantee approval.',
    informationSourceUrl: initialData?.informationSourceUrl || '',
    publicationStatus: (initialData?.publicationStatus || 'DRAFT') as VisaPublicationStatus,
    serviceStatus: (initialData?.serviceStatus || 'ACCEPTING_INQUIRIES') as AgencyServiceStatus,
    isFeatured: initialData?.isFeatured ?? false,
    displayOrder: initialData?.displayOrder ?? 0,
    stepsText: (initialData?.applicationProcessSteps || []).join('\n'),
  });

  const [requirements, setRequirements] = useState<RequirementDraft[]>(
    initialData?.requirements?.map((r) => ({
      title: r.title,
      description: r.description || '',
      isMandatory: r.isMandatory,
    })) || [
      {
        title: 'Valid Passport (minimum 6 months validity)',
        description: 'Clear scan of bio-data page and previous visas if applicable',
        isMandatory: true,
      },
    ],
  );

  const handleTitleChange = (title: string) => {
    const autoSlug = !initialData
      ? title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
      : formData.slug;
    setFormData((prev) => ({ ...prev, title, slug: autoSlug }));
  };

  const addRequirement = () => {
    setRequirements((prev) => [...prev, { title: '', description: '', isMandatory: true }]);
  };

  const removeRequirement = (idx: number) => {
    setRequirements((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateRequirement = (idx: number, field: keyof RequirementDraft, value: string | boolean) => {
    setRequirements((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const steps = formData.stepsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Parameters<typeof createVisaServiceAction>[0] = {
      countryId: formData.countryId,
      category: formData.category,
      customCategoryLabel:
        formData.category === 'OTHER' ? formData.customCategoryLabel : undefined,
      title: formData.title,
      slug: formData.slug || undefined,
      shortDescription: formData.shortDescription,
      fullDescription: formData.fullDescription || '',
      eligibilityInfo: formData.eligibilityInfo || undefined,
      applicationProcessSteps: steps,
      estimatedProcessingTime: formData.estimatedProcessingTime || undefined,
      agencyServiceFee: formData.agencyServiceFee ? Number(formData.agencyServiceFee) : undefined,
      governmentFeeInfo: formData.governmentFeeInfo || undefined,
      currency: formData.currency || 'BDT',
      disclaimer: formData.disclaimer || undefined,
      informationSourceUrl: formData.informationSourceUrl || undefined,
      publicationStatus: formData.publicationStatus,
      serviceStatus: formData.serviceStatus,
      isFeatured: formData.isFeatured,
      displayOrder: Number(formData.displayOrder) || 0,
      requirements: requirements
        .filter((r) => r.title.trim().length > 0)
        .map((r, index) => ({
          id: `draft-${index}`,
          visaServiceId: initialData?.id || '',
          title: r.title.trim(),
          description: r.description.trim() || undefined,
          isMandatory: r.isMandatory,
          displayOrder: index + 1,
        })),
    };

    const res = initialData
      ? await updateVisaServiceAction(initialData.id, payload)
      : await createVisaServiceAction(payload);

    setLoading(false);

    if (!res.success) {
      setError(res.message || 'Failed to save visa service');
      return;
    }

    router.push('/dashboard/visa-immigration/services');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
        <strong>Compliance Notice:</strong> Never advertise guaranteed visas, guaranteed work
        permits, or guaranteed embassy approvals. Clearly distinguish agency service availability
        from official government visa decisions.
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Destination Country <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={formData.countryId}
            onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          >
            <option value="" disabled>
              Select Country
            </option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flagEmoji} {c.name} ({c.isoCode})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Visa Category <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as VisaCategory })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          >
            <option value="STUDENT_VISA">Student Visa Assistance</option>
            <option value="WORK_VISA">Work Visa Assistance</option>
            <option value="WORK_PERMIT">Work Permit Assistance</option>
            <option value="TOURIST_VISA">Tourist Visa Assistance</option>
            <option value="BUSINESS_VISA">Business Visa Assistance</option>
            <option value="OTHER">Other (Custom Label)</option>
          </select>
        </div>

        {formData.category === 'OTHER' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Custom Category Label <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.customCategoryLabel}
              onChange={(e) => setFormData({ ...formData, customCategoryLabel: e.target.value })}
              placeholder="e.g., Dependent / Family Reunification Visa"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Service Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g., Student Visa File & Admission Assistance"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
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
            placeholder="student-visa-assistance"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800">
            1. Publication Status
          </label>
          <p className="mb-2 text-xs text-slate-500">Controls visibility on the public website</p>
          <select
            value={formData.publicationStatus}
            onChange={(e) =>
              setFormData({
                ...formData,
                publicationStatus: e.target.value as VisaPublicationStatus,
              })
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="DRAFT">DRAFT (Internal Only)</option>
            <option value="PUBLISHED">PUBLISHED (Live on Website)</option>
            <option value="ARCHIVED">ARCHIVED (Hidden)</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800">
            2. Agency Service Availability
          </label>
          <p className="mb-2 text-xs text-slate-500">Controls whether inquiries are accepted</p>
          <select
            value={formData.serviceStatus}
            onChange={(e) =>
              setFormData({
                ...formData,
                serviceStatus: e.target.value as AgencyServiceStatus,
              })
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="ACCEPTING_INQUIRIES">ACCEPTING_INQUIRIES</option>
            <option value="LIMITED">LIMITED (Selective Intake)</option>
            <option value="TEMPORARILY_PAUSED">TEMPORARILY_PAUSED (Form Disabled)</option>
            <option value="NOT_OFFERED">NOT_OFFERED (Form Disabled)</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800">
            Display Order & Featured
          </label>
          <p className="mb-2 text-xs text-slate-500">Sorting priority on public pages</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
              className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              Featured Service
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Short Summary <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          maxLength={600}
          value={formData.shortDescription}
          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          placeholder="Concise summary shown on country cards and service listings..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Full Service Description
          </label>
          <textarea
            rows={4}
            value={formData.fullDescription}
            onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
            placeholder="Detailed scope of what our agency assists with..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            General Eligibility Guidance
          </label>
          <textarea
            rows={4}
            value={formData.eligibilityInfo}
            onChange={(e) => setFormData({ ...formData, eligibilityInfo: e.target.value })}
            placeholder="General eligibility criteria applicants should review before inquiring..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Structured Document Requirements */}
      <div className="rounded-lg border border-slate-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Required Documents Checklist ({requirements.length})
            </h3>
            <p className="text-xs text-slate-500">
              Structured document checklist displayed on the public service page
            </p>
          </div>
          <button
            type="button"
            onClick={addRequirement}
            className="rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
          >
            + Add Document Item
          </button>
        </div>

        <div className="space-y-3">
          {requirements.map((req, idx) => (
            <div
              key={idx}
              className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-12"
            >
              <div className="md:col-span-4">
                <input
                  type="text"
                  placeholder="Document Title (e.g., Valid Passport)"
                  value={req.title}
                  onChange={(e) => updateRequirement(idx, 'title', e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                />
              </div>
              <div className="md:col-span-5">
                <input
                  type="text"
                  placeholder="Additional note / specification (optional)"
                  value={req.description}
                  onChange={(e) => updateRequirement(idx, 'description', e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                />
              </div>
              <div className="flex items-center justify-between gap-2 md:col-span-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={req.isMandatory}
                    onChange={(e) => updateRequirement(idx, 'isMandatory', e.target.checked)}
                  />
                  Mandatory
                </label>
                <button
                  type="button"
                  onClick={() => removeRequirement(idx)}
                  className="text-xs font-medium text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Application Assistance Steps (One step per line)
        </label>
        <textarea
          rows={4}
          value={formData.stepsText}
          onChange={(e) => setFormData({ ...formData, stepsText: e.target.value })}
          placeholder={
            'Initial profile & eligibility consultation\nDocument checklist verification\nApplication file preparation\nEmbassy appointment scheduling guidance'
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Estimated Processing Time
          </label>
          <input
            type="text"
            value={formData.estimatedProcessingTime}
            onChange={(e) => setFormData({ ...formData, estimatedProcessingTime: e.target.value })}
            placeholder="e.g., 4 - 8 Weeks (Indicative)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Agency Consultancy Fee
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={formData.agencyServiceFee}
            onChange={(e) => setFormData({ ...formData, agencyServiceFee: e.target.value })}
            placeholder="e.g., 15000"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Currency</label>
          <input
            type="text"
            maxLength={10}
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Government / Embassy Fee Note
          </label>
          <input
            type="text"
            value={formData.governmentFeeInfo}
            onChange={(e) => setFormData({ ...formData, governmentFeeInfo: e.target.value })}
            placeholder="Paid directly to embassy / VFS"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Compliance Disclaimer
          </label>
          <textarea
            rows={2}
            value={formData.disclaimer}
            onChange={(e) => setFormData({ ...formData, disclaimer: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Official Immigration Reference URL (Optional)
          </label>
          <input
            type="url"
            value={formData.informationSourceUrl}
            onChange={(e) => setFormData({ ...formData, informationSourceUrl: e.target.value })}
            placeholder="https://..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
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
          {loading ? 'Saving...' : initialData ? 'Update Visa Service' : 'Create Visa Service'}
        </button>
      </div>
    </form>
  );
}
