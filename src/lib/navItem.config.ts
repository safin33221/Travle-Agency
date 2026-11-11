import { NavItem } from '@/types/dashboard/NavItem';

export const DASHBOARD_NAV_ITEMS: NavItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['OWNER_ADMIN', 'SALES_AGENT'],
  },
  {
    title: 'Leads Pipeline',
    href: '/dashboard/leads',
    icon: 'Users',
    roles: ['OWNER_ADMIN', 'SALES_AGENT'],
  },
  {
    title: 'Tour Packages',
    href: '/dashboard/packages',
    icon: 'Compass',
    roles: ['OWNER_ADMIN', 'SALES_AGENT'],
  },
  {
    title: 'AI Draft Copilot',
    href: '/dashboard/ai-copilot',
    icon: 'Sparkles',
    roles: ['OWNER_ADMIN', 'SALES_AGENT'],
  },
  {
    title: 'Staff Management',
    href: '/dashboard/staff',
    icon: 'ShieldCheck',
    roles: ['OWNER_ADMIN'],
  },
  {
    title: 'Agency Settings',
    href: '/dashboard/settings',
    icon: 'Settings',
    roles: ['OWNER_ADMIN'],
  },
  {
    title: 'Audit Trail',
    href: '/dashboard/audit-logs',
    icon: 'Activity',
    roles: ['OWNER_ADMIN'],
  },
  {
    title: 'My Profile',
    href: '/my-profile',
    icon: 'UserCheck',
    roles: ['OWNER_ADMIN', 'SALES_AGENT'],
  },
];
