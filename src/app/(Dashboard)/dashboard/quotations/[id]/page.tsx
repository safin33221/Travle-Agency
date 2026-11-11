import { notFound } from 'next/navigation';
import { getSingleQuotation } from '@/services/quotations/quotations.service';
import { getMe } from '@/services/auth/getMe';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { QuotationActionsClient } from '@/components/module/quotations/QuotationActionsClient';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [quotation, user] = await Promise.all([
    getSingleQuotation(id),
    getMe(),
  ]);

  if (!quotation || !user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title={`Quotation Revision #${quotation.revision} — ${quotation.lead?.customerName || 'Customer'}`}
        description={`Created on ${formatDate(quotation.createdAt)} by ${quotation.createdBy?.name || 'Staff'}`}
        actionLabel={
          quotation.leadId ? '← Back to Lead Workspace' : '← Dashboard'
        }
        actionHref={
          quotation.leadId
            ? `/dashboard/leads/${quotation.leadId}`
            : '/dashboard'
        }
      >
        <QuotationActionsClient quotation={quotation} userRole={user.role} />
      </ManagementPageHeader>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
          <div>
            <CardTitle className="text-lg">
              Itemized Pricing Breakdown (Server-Verified)
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Valid Until: {formatDate(quotation.validUntil)}
            </p>
          </div>
          <StatusBadge status={quotation.status} />
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2.5">Description</th>
                <th className="py-2.5 text-right">Qty</th>
                <th className="py-2.5 text-right">Unit Price</th>
                <th className="py-2.5 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotation.items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-3 font-medium text-slate-900">
                    {item.label}
                  </td>
                  <td className="py-3 text-right">{item.quantity}</td>
                  <td className="py-3 text-right">
                    {formatCurrency(item.unitPrice, quotation.currency)}
                  </td>
                  <td className="py-3 text-right font-semibold">
                    {formatCurrency(item.total, quotation.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm border-t border-slate-200 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span>
                  {formatCurrency(quotation.subtotal, quotation.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Discount:</span>
                <span>
                  - {formatCurrency(quotation.discount, quotation.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Tax ({Number(quotation.taxRate)}%):
                </span>
                <span>
                  {formatCurrency(quotation.taxAmount, quotation.currency)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-extrabold text-slate-900">
                <span>Grand Total:</span>
                <span>
                  {formatCurrency(quotation.grandTotal, quotation.currency)}
                </span>
              </div>
            </div>
          </div>

          {quotation.terms && (
            <div className="rounded-lg bg-slate-50 p-4 text-xs text-slate-600 whitespace-pre-line">
              <strong className="block text-slate-800 mb-1">
                Terms & Conditions Snapshot:
              </strong>
              {quotation.terms}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
