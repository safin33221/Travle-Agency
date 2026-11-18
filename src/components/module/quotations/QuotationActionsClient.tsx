'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Download } from 'lucide-react';
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  const handleApprove = () => {
    setMessage('');
    startTransition(async () => {
      const res = await approveQuotation(quotation.id, quotation.leadId);
      setMessage(res.message);
      if (res.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {message && (
        <span className="text-xs font-medium text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl">
          {message}
        </span>
      )}

      {quotation.status === 'DRAFT' && userRole === 'OWNER_ADMIN' && (
        <Button
          variant="secondary"
          disabled={isPending}
          onClick={handleApprove}
          className="gap-1.5"
        >
          <Check className="h-4 w-4" />
          {isPending ? 'Approving...' : 'Approve Quotation for PDF Export'}
        </Button>
      )}

      {quotation.status === 'APPROVED' && (
        <a
          href={`/api/quotations/${quotation.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="default" className="gap-1.5">
            <Download className="h-4 w-4" />
            Download Branded PDF
          </Button>
        </a>
      )}
    </div>
  );
}
