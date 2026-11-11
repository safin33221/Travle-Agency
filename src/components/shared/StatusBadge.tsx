import { Badge } from '@/components/ui/badge';

export function StatusBadge({ status }: { status: string }) {
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

  return <Badge variant={map[status] ?? 'neutral'}>{status.replace('_', ' ')}</Badge>;
}
