import { Badge } from '@/components/ui/badge';

export function StatusBadge({ status }: { status?: string | null }) {
  const safeStatus = typeof status === 'string' && status ? status : 'PENDING';
  const map: Record<
    string,
    'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  > = {
    NEW: 'info',
    QUALIFIED: 'info',
    QUOTED: 'warning',
    FOLLOW_UP: 'warning',
    WON: 'success',
    LOST: 'danger',
    DRAFT: 'warning',
    APPROVED: 'success',
    VOID: 'danger',
    OPEN: 'warning',
    DONE: 'success',
    CANCELLED: 'neutral',
    ACTIVE: 'success',
    INACTIVE: 'danger',
    OWNER_ADMIN: 'default',
    SALES_AGENT: 'info',
  };

  return (
    <Badge variant={map[safeStatus] ?? 'neutral'}>
      {safeStatus.replace(/_/g, ' ')}
    </Badge>
  );
}
