import { getAuditLogs } from '@/services/audit/audit.service';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTime } from '@/lib/utils';

export const instant = false;

export default async function AuditLogsPage() {
  const logsRes = await getAuditLogs();
  const logs = logsRes?.data || [];

  return (
    <div>
      <ManagementPageHeader
        title="Security & Operations Audit Trail"
        description="Immutable log of staff actions, package price updates, and quotation approvals."
      />

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {formatDate(log.createdAt)} {formatTime(log.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {log.actor?.name || 'System'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="info">{log.action}</Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {log.entityType} {log.entityId ? `(${log.entityId.slice(0, 8)}...)` : ''}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-10 text-center text-sm text-slate-500"
                    >
                      No audit events recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
