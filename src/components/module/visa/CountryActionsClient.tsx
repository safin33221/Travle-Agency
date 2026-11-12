'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { archiveCountryAction } from '@/services/visa/visa.service';

export function ArchiveCountryButton({
  countryId,
  disabled,
}: {
  countryId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleArchive = async () => {
    if (!confirm('Archive this country? It will be hidden from the public website.')) return;
    setLoading(true);
    await archiveCountryAction(countryId);
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={handleArchive}
      className="text-xs font-medium text-rose-600 hover:underline disabled:opacity-40"
    >
      {loading ? 'Archiving...' : 'Archive'}
    </button>
  );
}
