import { StaffUser } from '@/types/api';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LogoutBtn } from '@/components/shared/LogoutBtn';

export function DashboardNavbar({ user }: { user: StaffUser }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-600">
          Signed in as <strong className="text-slate-900">{user.name}</strong>
        </span>
        <StatusBadge status={user.role} />
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-xs text-slate-400">
          {user.email}
        </span>
        <LogoutBtn />
      </div>
    </header>
  );
}
