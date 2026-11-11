import { StaffRole } from '../api';

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  roles: StaffRole[];
  description?: string;
}
