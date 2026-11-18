export function StatusBadge({ status }: { status?: string | null }) {
  const safeStatus = typeof status === 'string' && status ? status : 'PENDING';
  const dotColors: Record<string, string> = {
    NEW: 'bg-teal-600',
    QUALIFIED: 'bg-teal-700',
    QUOTED: 'bg-amber-500',
    FOLLOW_UP: 'bg-amber-600',
    WON: 'bg-emerald-600',
    LOST: 'bg-rose-500',
    DRAFT: 'bg-amber-500',
    APPROVED: 'bg-emerald-600',
    VOID: 'bg-rose-500',
    OPEN: 'bg-amber-500',
    DONE: 'bg-emerald-600',
    CANCELLED: 'bg-stone-400',
    ACTIVE: 'bg-emerald-600',
    INACTIVE: 'bg-rose-500',
    OWNER_ADMIN: 'bg-slate-900',
    SALES_AGENT: 'bg-teal-600',
    IN_PROGRESS: 'bg-teal-600',
    VERIFIED: 'bg-emerald-600',
    RECEIVED: 'bg-teal-600',
    REJECTED: 'bg-rose-500',
    PENDING: 'bg-stone-400',
  };

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-700 shadow-2xs whitespace-nowrap">
      <span
        className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColors[safeStatus] ?? 'bg-stone-400'}`}
      />
      <span>{safeStatus.replace(/_/g, ' ')}</span>
    </span>
  );
}
