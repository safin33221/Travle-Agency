import React from 'react';
import {
  AgencyServiceStatus,
  CountryCoverageStatus,
  VisaCategory,
  VisaPublicationStatus,
} from '@/types/api';

export function CountryCoverageBadge({ status }: { status: CountryCoverageStatus }) {
  const styles: Record<CountryCoverageStatus, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    LIMITED: 'bg-amber-50 text-amber-700 border-amber-200',
    PAUSED: 'bg-orange-50 text-orange-700 border-orange-200',
    ARCHIVED: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  const labels: Record<CountryCoverageStatus, string> = {
    ACTIVE: 'Active Coverage',
    LIMITED: 'Limited Services',
    PAUSED: 'Coverage Paused',
    ARCHIVED: 'Archived',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.ARCHIVED}`}
    >
      {labels[status] || status}
    </span>
  );
}

export function VisaPublicationBadge({ status }: { status: VisaPublicationStatus }) {
  const styles: Record<VisaPublicationStatus, string> = {
    DRAFT: 'bg-slate-100 text-slate-700 border-slate-300',
    PUBLISHED: 'bg-blue-50 text-blue-700 border-blue-200',
    ARCHIVED: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.DRAFT}`}
    >
      {status}
    </span>
  );
}

export function AgencyServiceStatusBadge({ status }: { status: AgencyServiceStatus }) {
  const styles: Record<AgencyServiceStatus, string> = {
    ACCEPTING_INQUIRIES: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    LIMITED: 'bg-amber-50 text-amber-700 border-amber-200',
    TEMPORARILY_PAUSED: 'bg-orange-50 text-orange-700 border-orange-200',
    NOT_OFFERED: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  const labels: Record<AgencyServiceStatus, string> = {
    ACCEPTING_INQUIRIES: 'Accepting Inquiries',
    LIMITED: 'Limited Availability',
    TEMPORARILY_PAUSED: 'Temporarily Paused',
    NOT_OFFERED: 'Currently Not Offered',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.NOT_OFFERED}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === 'ACCEPTING_INQUIRIES'
            ? 'bg-emerald-500'
            : status === 'LIMITED'
              ? 'bg-amber-500'
              : 'bg-slate-400'
        }`}
      />
      {labels[status] || status}
    </span>
  );
}

export function VisaCategoryBadge({
  category,
  customLabel,
}: {
  category: VisaCategory;
  customLabel?: string | null;
}) {
  const styles: Record<VisaCategory, string> = {
    WORK_VISA: 'bg-purple-50 text-purple-700 border-purple-200',
    WORK_PERMIT: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    STUDENT_VISA: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    TOURIST_VISA: 'bg-teal-50 text-teal-700 border-teal-200',
    BUSINESS_VISA: 'bg-sky-50 text-sky-700 border-sky-200',
    OTHER: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  const labels: Record<VisaCategory, string> = {
    WORK_VISA: 'Work Visa',
    WORK_PERMIT: 'Work Permit',
    STUDENT_VISA: 'Student Visa',
    TOURIST_VISA: 'Tourist Visa',
    BUSINESS_VISA: 'Business Visa',
    OTHER: customLabel || 'Other Visa',
  };
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${styles[category] || styles.OTHER}`}
    >
      {labels[category] || category}
    </span>
  );
}
