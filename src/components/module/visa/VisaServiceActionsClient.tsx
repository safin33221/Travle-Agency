'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AgencyServiceStatus,
  VisaPublicationStatus,
} from '@/types/api';
import {
  archiveVisaServiceAction,
  updateVisaServiceAction,
} from '@/services/visa/visa.service';

export function QuickVisaServiceActions({
  serviceId,
  publicationStatus,
  serviceStatus,
}: {
  serviceId: string;
  publicationStatus: VisaPublicationStatus;
  serviceStatus: AgencyServiceStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const togglePublish = async () => {
    setLoading(true);
    const nextPub: VisaPublicationStatus =
      publicationStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    await updateVisaServiceAction(serviceId, { publicationStatus: nextPub });
    setLoading(false);
    router.refresh();
  };

  const togglePause = async () => {
    setLoading(true);
    const nextSvc: AgencyServiceStatus =
      serviceStatus === 'ACCEPTING_INQUIRIES'
        ? 'TEMPORARILY_PAUSED'
        : 'ACCEPTING_INQUIRIES';
    await updateVisaServiceAction(serviceId, { serviceStatus: nextSvc });
    setLoading(false);
    router.refresh();
  };

  const handleArchive = async () => {
    if (!confirm('Archive this visa service? It will be unpublished and paused.')) return;
    setLoading(true);
    await archiveVisaServiceAction(serviceId);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-2.5 text-xs">
      <button
        type="button"
        disabled={loading}
        onClick={togglePublish}
        className="font-semibold text-indigo-600 hover:underline disabled:opacity-40"
      >
        {publicationStatus === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={togglePause}
        className="font-semibold text-amber-600 hover:underline disabled:opacity-40"
      >
        {serviceStatus === 'ACCEPTING_INQUIRIES' ? 'Pause Intake' : 'Resume Intake'}
      </button>
      {publicationStatus !== 'ARCHIVED' && (
        <button
          type="button"
          disabled={loading}
          onClick={handleArchive}
          className="font-medium text-rose-600 hover:underline disabled:opacity-40"
        >
          Archive
        </button>
      )}
    </div>
  );
}
