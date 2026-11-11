import { IUserRole } from '@/types/user/user';

export function getDefaultDashboard(role?: IUserRole): string {
  switch (role) {
    case 'OWNER_ADMIN':
      return '/dashboard';
    case 'SALES_AGENT':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}
