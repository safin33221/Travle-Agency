'use client';

import { useState, useTransition } from 'react';
import { approveQuotation } from '@/services/quotations/quotations.service';
import { Quotation, StaffRole } from '@/types/api';
import { Button } from '@/components/ui/button';

export function QuotationActionsClient({
  quotation,
  userRole,
}: {
  quotation: Quotation;
  userRole: StaffRole;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  const handleApprove = () => {
    setMessage('');
    startTransition(async () => {
      const res = await approveQuotation(quotation.id);
      setMessage(res.message);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {message && (
        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
          {message}
        </span>
      )}

      {quotation.status === 'DRAFT' && userRole === 'OWNER_ADMIN' && (
        <Button
          variant="secondary"
          disabled={isPending}
          onClick={handleApprove}
        >
          {isPending ? 'Approving...' : '✓ Approve Quotation for PDF Export'}
        </Button>
      )}

      {quotation.status === 'APPROVED' && (
        <a
          href={`/api/quotations/${quotation.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="default">⬇ Download Branded PDF</Button>
        </a>
      )}
    </div>
  );
}
